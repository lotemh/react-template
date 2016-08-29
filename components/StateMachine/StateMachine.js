import SegmentsQueue from "./SegmentsQueue";
import Logger from "../Logger/Logger";
import SegmentManager from "./SegmentManager";

/**
 * Created by user on 8/28/2016.
 */

class StateMachine {
  constructor(players, logger){
    this.logger = logger || new Logger();
    this.players = players;
    this.activePlayer = null;
    this.players.forEach(player => player.addLoadedDataEvent(this.onDataLoaded.bind(this)))
  }

  loadSegments(episodeMetadataId){

  }

  setSegments(segments){
    this.segmentsManager = new SegmentManager(segments, this.logger);
    this.prepareSegments(this.segmentsManager.getPrepareQueue());
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
    this.logger.log("play segment " + this.segmentsManager.getActive().title);
  }

  prepare(player, segment){
    this.logger.log("prepare player " + player.getId() + " with segment " + segment.title);
    var src = segment.src || this.contentUrl;
    var inTime = segment.in;
    // var outTime = segment.out;
    var videoSegment = this.buildSrc(src, inTime);
    var segmentsManager = this.segmentsManager;
    return new Promise(function(resolve) {
      segment.player = player;
      segmentsManager.setLoading(segment, resolve);
      console.log("prepare video for segment " + segment.title);
      player.prepare(videoSegment, segment.title);
    });
  }

  onDataLoaded(segmentTitle) {
    console.log("video for segment " + segmentTitle +" loaded");
    this.segmentsManager.setReady(segmentTitle);
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
    var oldSegment = this.segmentsManager.getActive();
    var followingSegment = this.getNextSegmentAccordingToAction(action);
    if (followingSegment === undefined){
      return;
    }
    if (this.shouldContinuePlaying(this.segmentsManager.getActive(), followingSegment)){
      this.logger.log("continue playing segment " + this.segmentsManager.getActive().title);
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
    this.segmentsManager.setActive(followingSegment);
    if (switchPlayers) {
      this.switchPlayers(oldPlayer, nextPlayer);
    }
    this.onSegmentEnd(this.segmentsManager.getActive(), this.noAction.bind(this));
    // this.onTimeUpdated(this.segmentsManager.getActive(), this.noAction.bind(this));

    //todo: stop current loading if needed
    var deprecatedSegments = this.segmentsManager.getDeprecatedSegments();
    deprecatedSegments.forEach(function(deprecated){
      if (deprecated.player) {
        this.players.push(deprecated.player);
        this.logger.log("return player " + deprecated.player.getId());
        deprecated.player = undefined;
      }
    }, this);

    this.segmentsManager.setSegmentsQueue();
    this.prepareSegments(this.segmentsManager.getPrepareQueue());
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
    if (nextSegment.player !== undefined  ||
      this.shouldContinuePlaying(this.segmentsManager.getActive(), nextSegment)){
      this.prepareSegments(this.segmentsManager.getPrepareQueue());
      return;
    }
    var freePlayer = this.getFreePlayer();
    if (freePlayer === undefined){
      return;
    }

    this.prepare(freePlayer, nextSegment).then(function(){
      this.prepareSegments(this.segmentsManager.getPrepareQueue());
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
