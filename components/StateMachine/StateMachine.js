import Logger from '../Logger/Logger';
import SegmentManager from './SegmentManager';
import PlaybackController from '../playbackController/playbackController';
import ControlsStartStatus from '../Controls/ControlsStartStatus';

/**
 * Created by user on 8/28/2016.
 */

class StateMachine {
    constructor(pendingFirstPlayClick) {
        this.logger = new Logger();
        this.state = {
            itemNum: 0,
            pendingFirstPlayClick,
            inExtend: false,
        };

        this.playbackController = new PlaybackController();
        this.playbackController.setTimeUpdate(this.timeUpdate.bind(this));
    }

    /** **  public APi ****/

    addUpdateViewListener(updateFunc) {
        this.updateView = updateFunc;
    }

    loadSegments(episodeMetadataId) {

    }

    setPlayers(players) {
        return this.playbackController.createPlayers(players);
    }

    setSegments(segments) {
        this.segmentsManager = new SegmentManager(segments, this.logger);
        this.numOfItems = this.segmentsManager.getNumberOtItems();
    }

    setContentUrl(url) {
        this.segmentsManager.setContentUrl(url);
    }

    start() {
        this.updateView({ numOfItems: this.numOfItems });
        this.actionHandler('next')
            .then(() => {
                this.updateView({ startStatus: ControlsStartStatus.ACTIVE });
            })
            .catch((error) => {
                if (error.name == 'NotAllowedError') {
                    this.updateView({ startStatus: ControlsStartStatus.PENDING_USER_ACTION });
                    const segmentsToPrepare = this.segmentsManager.getSegmentsToPrepare();
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
        this.state.inExtend = true;
        this.playbackController.cancelOnSegmentEndAction();
        this.extendItem(this.segmentsManager.getActive());
        this.updateView(this.state);
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
        const followingSegment = this.segmentsManager.getNextSegmentAccordingToAction(action);
        if (followingSegment === undefined) {
            return;
        }
        if (action !== 'extend') {
            this.state.inExtend = false;
        }
        this.state.itemNum = SegmentManager.getItemNum(followingSegment.title);
        this.updateView(this.state);
        this.segmentsManager.setActive(followingSegment);
        return this.playbackController.playSegment(followingSegment, this.actionHandler.bind(this, 'no_action'))
            .then(() => {
                // todo: stop current loading if needed
                this.state.isPlaying = true;
                this.updateView(this.state);
                setTimeout(() => {
                    const segmentsToPrepare = this.segmentsManager.getSegmentsToPrepare();
                    this.playbackController.updateSegments(segmentsToPrepare);
                    this.playbackController.prepareSegments(segmentsToPrepare);
                }, 3000);
            }).catch(e => { throw e; });
    }

    play() {
        this.playbackController.play().then(() => {
            this.state.pendingFirstPlayClick = false;
            this.state.isPlaying = true;
            this.updateView(this.state);
        });
    }

    pause() {
        this.state.isPlaying = false;
        this.updateView(this.state);
        this.playbackController.pause();
    }

    seek(params) {
        this.playbackController.seek(params.timestamp);
    }

    firstPlay() {
        this.playbackController.startPlaying()
            .then(() => {
                this.updateView({ startStatus: ControlsStartStatus.ACTIVE, isPlaying: true });
            });
    }

    extendItem(activeSegment) {
        const followingSegment = this.segmentsManager.getNextSegmentAccordingToAction('extend');
        const extendedSegment = this.segmentsManager.getExtendedSegment(activeSegment);
        this.segmentsManager.setActive(extendedSegment);
        this.state.itemLength = (activeSegment.out - activeSegment.in) + (followingSegment.out - followingSegment.in);
        this.state.itemStart = activeSegment.in;
    }

    timeUpdate(timeMs) {
        this.state.itemTimeMs = timeMs;
        this.updateView(this.state);
    }
}

export default StateMachine;
