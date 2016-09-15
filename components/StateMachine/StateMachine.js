import Logger from "../Logger/Logger";
import SegmentManager from "./SegmentManager";
import PlaybackController from "../VideoElement/playbackController";

/**
 * Created by user on 8/28/2016.
 */

class StateMachine {
    constructor(logger){
        this.logger = logger || new Logger();
        this.state = {
            itemNum: 0,
            pendingPlay: false,
            inExtend: false
        }
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            this.state.pendingPlay = true;
        }
        this.playbackController = new PlaybackController(this.actionHandler.bind(this, "no_action"));
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
        this.controlsManager.updateControl(this.state);
        this.playbackController.cancelOnSegmentEndAction();
        this.playbackController.segmentEndTimeMs = this.segmentsManager.getActive().out;
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
        this.state.itemNum = this.getItemNum(followingSegment);
        this.state.isPlaying = true;
        this.controlsManager.updateControl(this.state);
        this.segmentsManager.setActive(followingSegment);
        this.playbackController.playSegment(followingSegment, () => {
            //todo: stop current loading if needed
            var segmentsToPrepare = this.segmentsManager.getSegmentsToPrepare();
            this.playbackController.updateSegments(segmentsToPrepare);
            this.playbackController.prepareSegments(segmentsToPrepare);
        });
    }

    play(){
        this.playbackController.play().then(()=>{
            this.state.pendingPlay = false;
            this.state.isPlaying = true;
            this.controlsManager.updateControl(this.state);
        });
    }

    pause(){
        this.state.isPlaying = false;
        this.controlsManager.updateControl(this.state);
        this.playbackController.pause();
    }

    getItemNum(followingSegment) {
        return parseInt(followingSegment.title.substring(1, 2), 10) - 1;
    }
}

export default StateMachine;
