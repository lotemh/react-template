import React, { PropTypes } from 'react';
import Logger from "../Logger/Logger";

class Player {

    constructor(videoPlayer, id){
        this.player = videoPlayer;
        this.loading = null;
        this.id = id;
        this.logger = new Logger()
        this.src = "";
    }

    getPlayer(){
        return this.player;
    }

    pause() {
        this.getPlayer().pause();
        this.removeTimeUpdateEvent();
    }

    play(){
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
        this.loading = segmentTitle;
        if (!this.src){
            this.getPlayer().setSrc(src);
            this.src = src;
            this.getPlayer().load();
            return;
        }
        var timestamp = src.match(/.*#t=(\d*\.*\d*)/)[1];
        this.seek(timestamp);
        this.pause();
        this.loadedCallback(segmentTitle);
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
        this.loadedCallback = loadedCallback;
        this.getPlayer().addLoadedDataEvent(loadedCallback.bind(this));
    }

    addTimeUpdateEvent(){
        this.getPlayer().addTimeUpdateEvent(this.timeUpdatedListener.bind(this));
    }
    removeTimeUpdateEvent(){
        this.getPlayer().removeTimeUpdateEvent(this.timeUpdatedListener.bind(this));
    }

    getSrc(){
        return this.src;
    }

    timeUpdatedListener(event){
        var currentTime = event.target.currentTime * 1000;
        this.timeUpdateCallback(currentTime, this.id);
    }

    setTimeUpdateCallback(cb) {
        this.timeUpdateCallback = cb;
    }
}

export default Player;
