import Logger from '../Logger/Logger';
import SegmentManager from './SegmentManager';
import AnalyticsReporter from './AnalyticsReporter';
import PlaybackController from '../playbackController/playbackController';
import ControlsStartStatus from '../Controls/ControlsStartStatus';
import {isIphone} from "../utils/webUtils";

/**
 * Created by user on 8/28/2016.
 */

class StateMachine {
    constructor(store) {
        this.logger = new Logger();
        this.store = store;
        this.prepareTimeout = null;
        this.playbackController = new PlaybackController(this.store);
        this.playbackController.setTimeUpdate(this.timeUpdate.bind(this));
        AnalyticsReporter.start(this.store);
    }

    /** **  public APi ****/

    updateView (data){
        data.type = "SET_DATA";
        this.store.dispatch(data);
    };

    loadSegments(episodeMetadataId) {

    }

    setPlayers(players) {
        return this.playbackController.createPlayers(players);
    }

    setSegments(segments) {
        this.segmentsManager = new SegmentManager(segments, this.logger);
        this.updateView({numOfItems: this.segmentsManager.getNumberOtItems()});
    }

    setContentUrl(url) {
        this.segmentsManager.setContentUrl(url);
    }

    start() {
        this.actionHandler('next', true).catch((error) => {
            if (error === "NotAllowedError" || error.name === 'NotAllowedError') {
                this.updateView({ startStatus: ControlsStartStatus.PENDING_USER_ACTION });
            } else {
                throw error;
            }
        });
    }

    eventHandler(event, params) {
        if (this[event]) {
            this.logger.log(`handle event ${event}`);
            this[event](params);
        } else this.actionHandler(event);
    }

    /** **********************/

    extend() {
        this.store.dispatch({type: 'EVENT_HANDLER', actionName: "extend"});
        this.extendItem(this.segmentsManager.getActive());
        this.playbackController.generateSchedule(this.segmentsManager.getActive().out, this.actionHandler.bind(this, 'no_action'));
    }

    previous() {
        if (this.segmentsManager.getNextSegmentAccordingToAction('previous')) {
            this.playbackController.pause();
        }
        this.actionHandler('previous');
    }

    actionHandler(action, inFirstSegment) {
        clearTimeout(this.prepareTimeout);
        inFirstSegment = inFirstSegment || false;
        this.store.dispatch({type: 'EVENT_HANDLER', actionName: action});
        this.logger.log(`handle action ${action}`);
        this.playbackController.onSegmentEndAction = null;
        const followingSegment = this.segmentsManager.getNextSegmentAccordingToAction(action);
        if (followingSegment === undefined) {
            this.playbackController.pause();
            return;
        }
        this.store.dispatch({
            type: "SET_SEGMENT",
            inFirstSegment: inFirstSegment,
            itemNum: SegmentManager.getItemNum(followingSegment.title),
            itemTimeMs: followingSegment.in,
            itemStart: followingSegment.in,
            activeSegment: followingSegment,
        });
        this.segmentsManager.setActive(followingSegment);
        return this.playbackController.playSegment(followingSegment, this.actionHandler.bind(this, 'no_action'))
            .then(() => {
                // todo: stop current loading if needed
                this.store.dispatch({type: 'EVENT_HANDLER', actionName: 'play'});
                this.prepareTimeout = setTimeout(() => {
                    const segmentsToPrepare = this.segmentsManager.getSegmentsToPrepare();
                    this.playbackController.updateSegments(segmentsToPrepare);
                    if (!isIphone()) {
                        this.playbackController.prepareSegments(segmentsToPrepare);
                    }
                }, 5000);
            }).catch(e => { throw e; });
    }

    play() {
        this.store.dispatch({type: 'EVENT_HANDLER', actionName: 'play'});
        const activeSegment = this.segmentsManager.getActive();
        this.playbackController.play(activeSegment.src, activeSegment.in);
    }

    pause() {
        this.store.dispatch({type: 'EVENT_HANDLER', actionName: 'pause'});
        this.playbackController.pause();
    }

    seek(params) {
        this.playbackController.seek(params.timestamp);
    }

    firstPlay() {
        this.playbackController.startPlaying();
        if (!isIphone()) {
            this.prepareTimeout = setTimeout(() => {
                const segmentsToPrepare = this.segmentsManager.getSegmentsToPrepare();
                this.playbackController.prepareSegments(segmentsToPrepare);
            }, 5000);
        }
    }

    extendItem(activeSegment) {
        let itemLength;
        const followingSegment = this.segmentsManager.getNextSegmentAccordingToAction('extend');
        if (followingSegment){
            const extendedSegment = this.segmentsManager.getExtendedSegment(activeSegment);
            this.segmentsManager.setActive(extendedSegment);
            itemLength = (activeSegment.out - activeSegment.in) + (followingSegment.out - followingSegment.in);
        } else {
            itemLength = (activeSegment.out - activeSegment.in);
        }
        this.store.dispatch({
            type: "SET_SEGMENT",
            itemLength: itemLength,
            itemStart: activeSegment.in,
            activeSegment: followingSegment,
        });
    }

    timeUpdate(timeMs) {
        this.store.dispatch({type: 'UPDATE_TIME', itemTimeMs: timeMs});
    }
}

export default StateMachine;
