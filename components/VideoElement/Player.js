import React, { PropTypes } from 'react';
import Logger from "../Logger/Logger";

class Player {

    constructor(videoPlayer, id, notifyStatus){
        this.player = videoPlayer;
        this.loading = null;
        this.id = id;
        this.logger = new Logger()
        this.src = "";
        this.notifyTimes = new Map();
        this.notifyStatus = notifyStatus;
    }

    getPlayer(){
        return this.player;
    }

    pause() {
        this.getPlayer().pause();
    }
    play(){
        console.log("play is fired!!");
        this.addTimeUpdateEvent();
        return this.getPlayer().play();
    }
    show(){
        this.getPlayer().show();
    }
    hide(){
        this.getPlayer().hide();
    }
    prepare(src, segmentTitle){
        this.getPlayer().setSrc(src);
        this.src = src;
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
            listener(loadedSegment, this);
        }
        this.getPlayer().addLoadedDataEvent(loadedCallback.bind(this));
    }

    addTimeUpdateEvent(){
        this.getPlayer().addTimeUpdateEvent(this.timeUpdatedListener.bind(this));
    }
    removeTimeUpdateEvent(time){
        this.getPlayer().removeTimeUpdateEvent(listener);
    }

    getSrc(){
        return this.src;
    }

    timeUpdatedListener(event){
        var currentTime = event.target.currentTime * 1000;
        console.log("got time update!!", currentTime);
    }

}

export default Player;
