import Logger from "../Logger/Logger";
import SegmentManager from "./SegmentManager";
import PlaybackController from "../playbackController/playbackController"

/**
 * Created by user on 8/28/2016.
 */

class StateMachine {
    constructor(pendingFirstPlayClick){
        this.logger = new Logger();
        this.state = {
            itemNum: 0,
            pendingFirstPlayClick: pendingFirstPlayClick,
            inExtend: false
        };

        this.playbackController = new PlaybackController();
        this.playbackController.setTimeUpdate(this.timeUpdate.bind(this));
    }

    setControls(controls){
        this.controlsManager = controls;
    }

    loadSegments(episodeMetadataId){

    }

    setPlayers(players){
        this.playbackController.createPlayers(players);
    }

    setSegments(segments){
        this.segmentsManager = new SegmentManager(segments, this.logger);
        this.numOfItems = this.segmentsManager.getNumberOtItems();
    }

    setContentUrl(url){
        this.segmentsManager.setContentUrl(url);
    }

    start(){
        this.controlsManager.updateControl({numOfItems: this.numOfItems});
        this.actionHandler("next");
    }

    extend(){
        this.state.inExtend = true;
        this.playbackController.cancelOnSegmentEndAction();
        this.extendItem(this.segmentsManager.getActive());
        this.controlsManager.updateControl(this.state);
        this.playbackController.waitForSegmentEnd(this.segmentsManager.getActive().out, this.actionHandler.bind(this, "extend"));
    }

    previous(){
        this.playbackController.pause();
        this.actionHandler("previous");
    }

    eventHandler(event){
        if (this[event]){
            this.logger.log("handle event " + event);
            this[event]();
        } else this.actionHandler(event);
    }

    actionHandler(action){
        this.logger.log("handle action " + action);
        var followingSegment = this.segmentsManager.getNextSegmentAccordingToAction(action);
        if (followingSegment === undefined){
            return;
        }
        if (action !== "extend") {
            this.state.inExtend = false;
        }
        this.state.itemNum = SegmentManager.getItemNum(followingSegment.title);
        this.state.isPlaying = true;
        this.controlsManager.updateControl(this.state);
        this.segmentsManager.setActive(followingSegment);
        this.playbackController.playSegment(followingSegment, this.actionHandler.bind(this, "no_action"), () => {
            //todo: stop current loading if needed
            var segmentsToPrepare = this.segmentsManager.getSegmentsToPrepare();
            this.playbackController.updateSegments(segmentsToPrepare);
            this.playbackController.prepareSegments(segmentsToPrepare);
        });
    }

    play(){
        this.playbackController.play().then(()=>{
            this.state.pendingFirstPlayClick = false;
            this.state.isPlaying = true;
            this.controlsManager.updateControl(this.state);
        });
    }

    pause(){
        this.state.isPlaying = false;
        this.controlsManager.updateControl(this.state);
        this.playbackController.pause();
    }

    seek(timestamp) {
        this.playbackController.seek(timestamp);
    }

    extendItem(activeSegment) {
        var followingSegment = this.segmentsManager.getNextSegmentAccordingToAction("extend");
        this.state.itemLength = (activeSegment.out - activeSegment.in) + (followingSegment.out - followingSegment.in);
        this.state.itemStart = activeSegment.in;
    }

    timeUpdate(timeMs) {
        this.state.itemTimeMs = timeMs;
        this.controlsManager.updateControl(this.state);
    }
}

export default StateMachine;
