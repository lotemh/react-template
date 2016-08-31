import React, { PropTypes } from 'react';

class Player {

  constructor(videoPlayer, id){
    this.player = videoPlayer;
    this.loading = null;
    this.id = id;
  }
  
  getPlayer(){
    return this.player;
  }
  
  pause() {
    this.getPlayer().pause();
  }
  play(){
    this.getPlayer().play();
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
      if (this.loading) {
        this.loading = null;
      }
      listener(this.loading);
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
