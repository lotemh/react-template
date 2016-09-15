import Logger from "../Logger/Logger";
import SegmentManager from "./SegmentManager";
import PlaybackController from "../VideoElement/playbackController";

/**
 * Created by user on 8/28/2016.
 */

class StateMachine {
    constructor(logger){
        this.logger = logger || new Logger();
        this.itemNum = 0;
        this.pendingPlay = false;
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            console.log("hey its ios!!!");
            this.pendingPlay = true;
        }
        this.playbackController = new PlaybackController();
    }

    setControls(controls){
    console.log("set controls was set!!!");
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
            this.itemNum = this.getItemNum(followingSegment);
            this.controlsManager.updateControl({isPlaying: true, pendingPlay: this.pendingPlay, itemNum: this.itemNum});
            var segmentsToPrepare = this.segmentsManager.getSegmentsToPrepare();
            this.playbackController.updateSegments(segmentsToPrepare);
            this.playbackController.prepareSegments(segmentsToPrepare);
        });
    }

    play(){
        this.playbackController.play().then(()=>{
            console.log("its playing!!");
            this.pendingPlay = false;
            this.controlsManager.updateControl({isPlaying: true, pendingPlay: this.pendingPlay, itemNum: this.itemNum});
        });
    }

    pause(){
        this.controlsManager.updateControl({isPlaying: false, pendingPlay: this.pendingPlay, itemNum: this.itemNum});
        this.playbackController.pause();
    }

    getItemNum(followingSegment) {
        return parseInt(followingSegment.title.substring(1, 2), 10) - 1;
    }
}

export default StateMachine;
