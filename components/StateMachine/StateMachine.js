import Logger from "../Logger/Logger";
import SegmentManager from "./SegmentManager";
import PlaybackController from "../playbackController/playbackController"

/**
 * Created by user on 8/28/2016.
 */

class StateMachine {
    constructor(logger){
        this.logger = logger || new Logger();
        this.playbackController = new PlaybackController();
    }

    loadSegments(episodeMetadataId){

    }

    setPlayers(players){
        this.playbackController.createPlayers(players);
    }

    setSegments(segments){
        this.segmentsManager = new SegmentManager(segments, this.logger);
    }

    setContentUrl(url){
        this.segmentsManager.setContentUrl(url);
    }

    start(){
        this.actionHandler("next");
    }

    extend(){
        this.playbackController.cancelOnSegmentEndAction();
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
        this.segmentsManager.setActive(followingSegment);
        this.playbackController.playSegment(followingSegment, this.actionHandler.bind(this, "no_action"), () => {
            //todo: stop current loading if needed
            var segmentsToPrepare = this.segmentsManager.getSegmentsToPrepare();
            this.playbackController.updateSegments(segmentsToPrepare);
            this.playbackController.prepareSegments(segmentsToPrepare);
        });
    }

    play(){
        this.playbackController.play();
    }

    pause(){
        this.playbackController.pause();
    }
}

export default StateMachine;
