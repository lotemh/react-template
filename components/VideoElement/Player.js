import React, { PropTypes } from 'react';
import Logger from "../Logger/Logger";

class Player {

  constructor(videoPlayer, id){
    this.player = videoPlayer;
    this.loading = null;
    this.id = id;
    this.logger = new Logger();
  }

  getPlayer(){
    return this.player;
  }

  pause() {
    this.logger.log("player " + this.id + " paused");
    this.getPlayer().pause();
  }
  play(callbackOnPlay){
    this.getPlayer().play(callbackOnPlay);
  }
  show(){
    this.getPlayer().show();
  }
  hide(){
    this.getPlayer().hide();
  }
  prepare(src, segmentTitle){
    this.getPlayer().setSrc(src);
    this.getPlayer().load();
    this.loading = segmentTitle;
  }
  seek(timestamp){
    this.getPlayer().seek(timestamp);
  }
  getCurrentTime(){
    return this.getPlayer().getCurrentTime();
  }
  getId(){
    return this.id;
  }
  addLoadedDataEvent(listener){
    function loadedCallback(){
      var loadedSegment = this.loading;
        if (loadedSegment) {
        this.loading = null;
      }
      listener(loadedSegment);
    }
    this.getPlayer().addLoadedDataEvent(loadedCallback.bind(this));
  }

  addTimeUpdateEvent(listener){
    this.getPlayer().addTimeUpdateEvent(listener);
  }
  removeTimeUpdateEvent(listener){
    this.getPlayer().removeTimeUpdateEvent(listener);
  }
}

export default Player;
