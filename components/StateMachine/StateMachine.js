import SegmentsQueue from "./SegmentsQueue";
import Logger from "../Logger/Logger";
/**
 * Created by user on 8/28/2016.
 */

class StateMachine {
  constructor(players, logger){
    this.activeSegment = null;
    this.logger = logger || new Logger();
    this.players = players;
    this.activePlayer = null;
  }

  load(episodeMetadataId){

  }

  setSegments(segments){
    this.segments = segments;
    for (var segment in segments){
      segments[segment].title = segment;
    }
    this.activeSegment = segments.root;
    this.segmentsQueue = this.insertNextSegmentToPrepareQueue();
    this.prepareSegments(this.segmentsQueue);
  }

  getSegment(key){
    if (key === undefined){
      return undefined;
    }
    return this.segments[key];
  }

  setContentUrl(url){
    this.contentUrl = url;
  }

  start(){
    this.next();
  }

  activatePlayer(player){
    this.activePlayer = player;
    this.activePlayer.show();
    this.activePlayer.play();
    this.logger.log("play segment " + this.activeSegment.title);
  }

  prepare(player, segment){
    this.logger.log("prepare player " + player.getId() + " with segment " + segment.title);
    var src = segment.src || this.contentUrl;
    var inTime = segment.in;
    // var outTime = segment.out;
    var videoSegment = this.buildSrc(src, inTime);
    return new Promise(function(resolve) {
      var callback = function(){
        console.log("video for segment " + segment.title +" loaded");
        resolve();
      };
      player.prepare(videoSegment, callback);
      segment.player = player;
    });
  }

  buildSrc(src, inTime, outTime) {
    var segment = src + "#t=" + this.getTimeInSeconds(inTime);
    if (outTime) {
      segment += "," + this.getTimeInSeconds(outTime);
    }
    return segment;
  }

  getTimeInSeconds(timeInMili){
    return timeInMili/1000;
  }

  prepareNextSegment(player, segment){
    var inTime = segment.in;
    player.seek(inTime);
    segment.player = player;
  }

  next(){
    this.actionHandler("next");
  }

  previous(){
    this.actionHandler("previous");
  }

  actionHandler(action){
    this.logger.log("handle action " + action);
    this.clearCurrentInterval();
    var oldPlayer = this.activePlayer;
    var oldSegment = this.activeSegment;
    var followingSegment = this.getNextSegmentAccordingToAction(action);
    if (followingSegment === undefined){
      return;
    }
    if (this.shouldContinuePlaying(this.activeSegment, followingSegment)){
      this.logger.log("continue playing segment " + this.activeSegment.title);
      this.handleAction2(oldPlayer, nextPlayer, oldSegment, followingSegment);
      return;
    }
    var nextPlayer = followingSegment.player;
    if (nextPlayer){
      followingSegment.player = undefined;
    } else {
      nextPlayer = this.getFreePlayer();
      if (!nextPlayer){
        nextPlayer = this.activePlayer;
        oldPlayer = null;
      }
      this.prepare(nextPlayer, followingSegment);

    }
    var switchPlayers = true;
    this.handleAction2(oldPlayer, nextPlayer, oldSegment, followingSegment, switchPlayers);
  }

  handleAction2(oldPlayer, nextPlayer, oldSegment, followingSegment, switchPlayers) {
    this.activeSegment = followingSegment;
    if (switchPlayers) {
      this.switchPlayers(oldPlayer, nextPlayer);
    }
    this.onSegmentEnd(this.activeSegment, this.noAction.bind(this));
    // this.onTimeUpdated(this.activeSegment, this.noAction.bind(this));

    //clear segment no action if needed
    var oldNoAction = this.getSegment(oldSegment.no_action);
    if (oldNoAction && oldNoAction.player &&
      oldNoAction.player !== this.activePlayer) {
      this.players.push(oldNoAction.player);
      this.logger.log("return player " + oldNoAction.player.getId());
      oldNoAction.player = undefined;
    }
    var segmentsToPrepare2 = this.getSegmentsToPrepare(this.segmentsQueue);
    this.prepareSegments(segmentsToPrepare2);
  }

  getSegmentsToPrepare(segmentsQueue) {
    this.insertNextSegmentToPrepareQueue(segmentsQueue);
    var noActionSegment = this.getSegment(this.activeSegment.no_action);
    segmentsQueue.add(noActionSegment);
    if (noActionSegment !== undefined) {
      var noActionSegment2 = this.getSegment(noActionSegment.no_action);
      segmentsQueue.add(noActionSegment2);
    }
    return segmentsQueue;
  }

  insertNextSegmentToPrepareQueue(segmentsQueue) {
    segmentsQueue = segmentsQueue || new SegmentsQueue();
    var nextSegment = this.getNextSegment();
    segmentsQueue.add(nextSegment);
    return segmentsQueue;
  }

  switchPlayers(oldPlayer, nextPlayer) {
    if (oldPlayer === nextPlayer){
      return;
    }
    this.activatePlayer(nextPlayer);
    this.deactivatePlayer(oldPlayer);
  }

  noAction(){
    this.actionHandler("no_action");
  }

  getNextSegmentAccordingToAction(action) {
    var segmentName = this.activeSegment[action];
    return this.getSegment(segmentName);
  }

  getNextSegment() {
    return this.getSegment(this.activeSegment.next);
  }

  getFreePlayer(){
    return this.players.pop();
  }

  deactivatePlayer(player) {
    if (player) {
      player.pause();
      player.hide();
      this.players.push(player);
    }
  }

  play(){
    this.activePlayer.play();
  }

  pause(){
    this.activePlayer.pause();
  }

  prepareSegments(segments) {
    var nextSegment = segments.next();
    if (nextSegment === undefined ||
      this.shouldContinuePlaying(this.activeSegment, nextSegment) ||
      nextSegment.player !== undefined
    ){
      return;
    }
    var freePlayer = this.getFreePlayer();
    if (freePlayer === undefined){
      return;
    }

    this.prepare(freePlayer, nextSegment).then(function(){
      this.prepareSegments(segments);
    }.bind(this));
  }

  onSegmentEnd(segment, callback) {
    var out = segment.out;
    var currentTime = this.activePlayer.getCurrentTime();
    if (currentTime >= out - 0.01){
      callback();
      console.log("current time: ", currentTime);
      console.log("out time: ", out);
      return;
    }
    var delay = Math.max(out - currentTime , 0.01);
    this.currentTimeoutId = setTimeout(this.onSegmentEnd.bind(this, segment, callback), delay);
  }

  clearCurrentInterval() {
    clearTimeout(this.currentTimeoutId);
  }

  shouldContinuePlaying(currentSegment, nextSegment) {
    return currentSegment.src === nextSegment.src &&
      currentSegment.out === nextSegment.in;
  }

  onTimeUpdated(segment, callback) {
    var out = segment.out;
    function timeUpdatedListener(){
      var currentTime = this.activePlayer.getCurrentTime();
      if (currentTime >= out - 0.01){
        this.activePlayer.removeTimeUpdateEvent(timeUpdatedListener);
        callback();
        console.log("current time: ", currentTime);
        console.log("out time: ", out);
      }
    }
    this.activePlayer.addTimeUpdateEvent(timeUpdatedListener.bind(this));
  }
}

export default StateMachine;
