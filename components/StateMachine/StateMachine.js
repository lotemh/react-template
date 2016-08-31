import Logger from "../Logger/Logger";
import SegmentManager from "./SegmentManager";
import Player from "../VideoElement/Player";

/**
 * Created by user on 8/28/2016.
 */

function buildSrc(src, inTime, outTime) {
  var segment = src + "#t=" + getTimeInSeconds(inTime);
  if (outTime) {
    segment += "," + getTimeInSeconds(outTime);
  }
  return segment;
}

function getTimeInSeconds(timeInMili){
  return timeInMili/1000;
}

class StateMachine {
  constructor(logger){
    this.logger = logger || new Logger();
    this.activePlayer = null;
  }

  createPlayers(players){
    var id = 0;
    return players.map(p => new Player(p, "player" + id++));
  }

  loadSegments(episodeMetadataId){

  }

  setPlayers(players){
    this.players = this.createPlayers(players);
    this.players.forEach(player => player.addLoadedDataEvent(this.onDataLoaded.bind(this)))
  }

  setSegments(segments){
    this.segmentsManager = new SegmentManager(segments, this.logger);
  }

  setContentUrl(url){
    this.contentUrl = url;
  }

  start(){
    //todo: reuse code
    var freePlayer = this.getFreePlayer();
    if (freePlayer === undefined ){
      return;
    }

    this.prepare(freePlayer, this.segmentsManager.getNext())
      .then(function(){
        this.next();
      }.bind(this), function(){
        this.deactivatePlayer(freePlayer);
      }.bind(this));
  }

  activatePlayer(player){
    this.activePlayer = player;
    this.activePlayer.show();
    this.activePlayer.play();
    this.logger.log("play segment " + this.segmentsManager.getActive().title + " on player " + this.activePlayer.getId());
  }

  //private?
  onDataLoaded(segmentTitle) {
    this.logger.log("video for segment " + segmentTitle +" loaded");
    this.segmentsManager.setReady(segmentTitle);
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

  onExtendClick(){
    this.cancelOnSegmentEndAction();
    this.onSegmentEnd(this.segmentsManager.getActive(), this.extendSegment.bind(this));
  }

  extendSegment(){
      this.actionHandler("extend");
  }

  actionHandler(action){
    this.logger.log("handle action " + action);
    this.cancelOnSegmentEndAction();
    var oldPlayer = this.activePlayer;
    var followingSegment = this.getNextSegmentAccordingToAction(action);
    if (followingSegment === undefined){
      return;
    }
    if (this.shouldContinuePlaying(this.segmentsManager.getActive(), followingSegment)){
      this.logger.log("continue playing segment " + this.segmentsManager.getActive().title);
      this.executeAction(oldPlayer, null, followingSegment, false);
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
      return this.prepare(nextPlayer, followingSegment).then(function(){
        this.executeAction(oldPlayer, nextPlayer, followingSegment);
      }.bind(this));
    }
    this.executeAction(oldPlayer, nextPlayer, followingSegment);
  }

  executeAction(oldPlayer, nextPlayer, followingSegment) {
    this.segmentsManager.setActive(followingSegment);
    this.switchPlayers(oldPlayer, nextPlayer);
    this.onSegmentEnd(this.segmentsManager.getActive(), this.noAction.bind(this));
    // this.onTimeUpdated(this.segmentsManager.getActive(), this.noAction.bind(this));

    //todo: stop current loading if needed
    this.updateSegments(this.segmentsManager.getSegmentsSet());
    this.prepareSegments(this.segmentsManager.getSegmentsToPrepare());
  }

  unloadSegment(deprecated){
    var deprecatedPlayer = deprecated.player;
    if (deprecatedPlayer && deprecatedPlayer !== this.activePlayer) {
      this.players.push(deprecatedPlayer);
      this.logger.log("return player " + deprecatedPlayer.getId());
    }
    deprecated.player = undefined;
  }

  switchPlayers(oldPlayer, nextPlayer) {
    this.activatePlayer(nextPlayer);
    if (oldPlayer !== nextPlayer){
      this.deactivatePlayer(oldPlayer);
    }
  }

  noAction(){
    this.actionHandler("no_action");
  }

  getNextSegmentAccordingToAction(action) {
    var segmentName = this.segmentsManager.getActive()[action];
    return this.segmentsManager.get(segmentName);
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
    if (this.segmentsManager.isLoading()){
      return;
    }
    var nextSegment = segments.next();
    if (nextSegment === undefined){
      return;
    }

    if (nextSegment.player ||
      this.shouldContinuePlaying(this.segmentsManager.getActive(), nextSegment)){
      return this.prepareSegments(segments);
    }

    var freePlayer = this.getFreePlayer();
    if (freePlayer === undefined ){
      return;
    }

    this.prepare(freePlayer, nextSegment)
      .then(function(){
        this.prepareSegments(segments);
      }.bind(this), function(){
        this.deactivatePlayer(freePlayer);
      }.bind(this));
  }

  prepare(player, segment){
    this.logger.log("prepare player " + player.getId() + " with segment " + segment.title);
    var src = segment.src || this.contentUrl;
    var inTime = segment.in;
    // var outTime = segment.out;
    var videoSegment = buildSrc(src, inTime);
    var segmentsManager = this.segmentsManager;
    segment.player = player;

    return new Promise(function(resolve, reject) {
      segment.cancelLoading = reject;
      segmentsManager.setLoading(segment, resolve);
      player.prepare(videoSegment, segment.title);
    });
  }

  onSegmentEnd(segment, callback) {
    var out = segment.out;
    var currentTime = this.activePlayer.getCurrentTime();
    if (currentTime >= out - 0.01){
      callback();
      this.logger.log("current time: " + currentTime);
      this.logger.log("out time: " + out);
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
        this.logger.log("current time: ", currentTime);
        this.logger.log("out time: ", out);
      }
    }
    this.activePlayer.addTimeUpdateEvent(timeUpdatedListener.bind(this));
  }

  updateSegments(segmentsSet){
    var segmentsToPrepare = this.segmentsManager.getSegmentsToPrepare();
    var that = this;
    segmentsSet.forEach(function(segment){
      if (!segmentsToPrepare.get(segment.title)){
        if (segment.isReady()){
          that.unloadSegment(segment);
        } else if (segment.isLoading()){
          //cancel loading in the player?
          segment.cancelLoading();
        }
      }
    });

  }

  cancelOnSegmentEndAction() {
    this.clearCurrentInterval();
  }
}

export default StateMachine;
