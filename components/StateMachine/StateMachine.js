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
        this.playbackController = new PlaybackController();
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
        this.store.dispatch({type: 'SET_ACTIVE_SEGMENT', activeSegment: segments.root});
        this.updateView({numOfItems: this.segmentsManager.getNumberOtItems()});
    }

    setContentUrl(url) {
        this.segmentsManager.setContentUrl(url);
    }

    start() {
        this.actionHandler('next')
            .then(() => {
                this.updateView({ startStatus: ControlsStartStatus.ACTIVE });
            })
            .catch((error) => {
                if (error.name == 'NotAllowedError') {
                    this.updateView({ startStatus: ControlsStartStatus.PENDING_USER_ACTION });
                    const segmentsToPrepare = this.segmentsManager.getSegmentsToPrepare(this.store.getState().activeSegment);
                    this.playbackController.prepareSegments(segmentsToPrepare);
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
        this.playbackController.cancelOnSegmentEndAction();
        var activeSegment = this.store.getState().activeSegment;
        this.extendItem(activeSegment);
        this.playbackController.waitForSegmentEnd(activeSegment.out, this.actionHandler.bind(this, 'no_action'));
    }

    previous() {
        if (this.segmentsManager.getNextSegmentAccordingToAction('previous', this.store.getState().activeSegment)) {
            this.playbackController.pause();
        }
        this.actionHandler('previous');
    }

    actionHandler(action) {
        this.logger.log(`handle action ${action}`);
        const activeSegment = this.segmentsManager.getNextSegmentAccordingToAction(action, this.store.getState().activeSegment);
        if (activeSegment === undefined) {
            return;
        }
        this.store.dispatch({type: 'SET_ACTIVE_SEGMENT', activeSegment: activeSegment});
        this.updateView({itemNum: SegmentManager.getItemNum(activeSegment.title)});
        return this.playbackController.playSegment(activeSegment, this.actionHandler.bind(this, 'no_action'))
            .then(() => {
                // todo: stop current loading if needed
                this.store.dispatch({type: 'EVENT_HANDLER', actionName: 'play'});
                setTimeout(() => {
                    const segmentsToPrepare = this.segmentsManager.getSegmentsToPrepare(activeSegment);
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

    firstPlay(callback) {
        this.playbackController.startPlaying()
            .then(() => {
                callback();
            });
    }

    extendItem(activeSegment) {
        const followingSegment = this.segmentsManager.getNextSegmentAccordingToAction('extend', activeSegment);
        const extendedSegment = this.segmentsManager.getExtendedSegment(activeSegment);
        this.store.dispatch({type: 'SET_ACTIVE_SEGMENT', activeSegment: extendedSegment});
        const itemLength = (activeSegment.out - activeSegment.in) + (followingSegment.out - followingSegment.in);
        this.updateView({itemLength: itemLength, itemStart: activeSegment.in});
    }

    timeUpdate(timeMs) {
        this.updateView({itemTimeMs: timeMs});
    }
}

export default StateMachine;
