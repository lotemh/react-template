import Logger from "../Logger/Logger";
import SegmentManager from "./SegmentManager";
import PlaybackController from "../VideoElement/playbackController"

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
    this.playbackController.loadSegment(this.segmentsManager.getNext(), ()=>{
      this.actionHandler("next");
    });
  }

  extend(){
    this.playbackController.cancelOnSegmentEndAction();
    this.playbackController.waitForSegmentEnd(this.segmentsManager.getActive().out, this.extendSegment.bind(this));
  }

  extendSegment(){
    this.actionHandler("extend");
  }

  previous(){
    this.playbackController.getActive().pause();
    this.actionHandler("previous");
  }

  eventHandler(event){
    this.logger.log("handle action " + event);
    if (this[event]){
      this[event]();
    } else this.actionHandler(event);
  }

  actionHandler(action){
    var followingSegment = this.getNextSegmentAccordingToAction(action);
    var shouldContinuePlaying = false;
    if (followingSegment === undefined){
      return;
    }
    if ((action === "no_action" || action === "extend") && this.shouldContinuePlaying(this.segmentsManager.getActive(), followingSegment)){
      shouldContinuePlaying = true;
    }
    this.playbackController.playSegment(followingSegment, shouldContinuePlaying, this.noAction.bind(this), () => {
      this.segmentsManager.setActive(followingSegment);
      //todo: stop current loading if needed
      var segmentsToPrepare = this.segmentsManager.getSegmentsToPrepare();
      this.playbackController.updateSegments(segmentsToPrepare);
      this.prepareSegments(segmentsToPrepare);
    });
  }

  prepareSegments(segments) {
    var nextSegment = segments.next();
    if (nextSegment === undefined){
      return;
    }
    // if (this.shouldContinuePlaying(this.segmentsManager.getActive(), nextSegment)){
    //   return this.prepareSegments(segments);
    // }

    this.playbackController.loadSegment(nextSegment, ()=> {
      this.prepareSegments(segments);
    });
  }

  noAction(){
    this.actionHandler("no_action");
  }

  getNextSegmentAccordingToAction(action) {
    var segmentName = this.segmentsManager.getActive()[action];
    return this.segmentsManager.get(segmentName);
  }

  play(){
    this.playbackController.play();
  }

  pause(){
    this.playbackController.pause();
  }

  shouldContinuePlaying(currentSegment, nextSegment) {
    return currentSegment.src === nextSegment.src &&
      currentSegment.out === nextSegment.in;
  }
}

export default StateMachine;
