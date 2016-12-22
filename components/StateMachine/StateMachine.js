import Logger from '../Logger/Logger';
import SegmentManager from './SegmentManager';
import PlaybackController from '../playbackController/playbackController';
import ControlsStartStatus from '../Controls/ControlsStartStatus';

/**
 * Created by user on 8/28/2016.
 */

class StateMachine {
    constructor(store) {
        this.logger = new Logger();
        this.store = store;
        this.playbackController = new PlaybackController(this.store);
        this.playbackController.setTimeUpdate(this.timeUpdate.bind(this));
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
        this.actionHandler('next').catch((error) => {
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
        this.store.dispatch({type: 'EVENT_HANDLER', actionName: 'extend'});
        this.extendItem(this.segmentsManager.getActive());
        this.playbackController.waitForSegmentEnd(this.segmentsManager.getActive().out, this.actionHandler.bind(this, 'no_action'));
    }

    previous() {
        if (this.segmentsManager.getNextSegmentAccordingToAction('previous')) {
            this.playbackController.pause();
        }
        this.actionHandler('previous');
    }

    actionHandler(action) {
        this.logger.log(`handle action ${action}`);
        this.playbackController.onSegmentEndAction = null;
        const followingSegment = this.segmentsManager.getNextSegmentAccordingToAction(action);
        if (followingSegment === undefined) {
            return;
        }
        this.updateView({
            itemNum: SegmentManager.getItemNum(followingSegment.title), 
            itemTimeMs: followingSegment.in,
            activeSegment: followingSegment,
        });
        this.store.dispatch({type: 'EVENT_HANDLER', actionName: action});
        this.segmentsManager.setActive(followingSegment);
        return this.playbackController.playSegment(followingSegment, this.actionHandler.bind(this, 'no_action'))
            .then(() => {
                // todo: stop current loading if needed
                this.store.dispatch({type: 'EVENT_HANDLER', actionName: 'play'});
                setTimeout(() => {
                    const segmentsToPrepare = this.segmentsManager.getSegmentsToPrepare();
                    this.playbackController.updateSegments(segmentsToPrepare);
                    this.playbackController.prepareSegments(segmentsToPrepare);
                }, 3000);
            }).catch(e => { throw e; });
    }

    play() {
        this.playbackController.play().then(() => {
        });
    }

    pause() {
        this.playbackController.pause();
    }

    seek(params) {
        this.playbackController.seek(params.timestamp);
    }

    firstPlay() {
        this.playbackController.startPlaying();
        setTimeout(() => {
            const segmentsToPrepare = this.segmentsManager.getSegmentsToPrepare();
            this.playbackController.prepareSegments(segmentsToPrepare);
        }, 1500);
    }

    extendItem(activeSegment) {
        const followingSegment = this.segmentsManager.getNextSegmentAccordingToAction('extend');
        const extendedSegment = this.segmentsManager.getExtendedSegment(activeSegment);
        this.segmentsManager.setActive(extendedSegment);
        const itemLength = (activeSegment.out - activeSegment.in) + (followingSegment.out - followingSegment.in);
        this.updateView({itemLength: itemLength, itemStart: activeSegment.in});
    }

    timeUpdate(timeMs) {
        this.store.dispatch({type: 'UPDATE_TIME', itemTimeMs: timeMs});
    }
}

export default StateMachine;
