import React, { PropTypes } from 'react';
import Logger from "../Logger/Logger";

class Player {

    constructor(videoPlayer, id){
        this.player = videoPlayer;
        this.loading = null;
        this.id = id;
        this.logger = new Logger()
        this.src = "";
        this.notifyTimes = new Map();
    }

    getPlayer(){
        return this.player;
    }

    pause() {
        this.getPlayer().pause();
    }
    play(){
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
        var listener = this.notifyTimes.get(time);
        this.getPlayer().removeTimeUpdateEvent(listener);
        this.notifyTimes.delete(time);
    }

    getSrc(){
        return this.src;
    }

    timeUpdatedListener(event){
        var currentTime = event.target.currentTime * 1000;
        this.notifyTimes.forEach((callback, time)=>{
            if (currentTime >= time - 0.1) {
                this.removeTimeUpdateEvent();
                callback();
                //delete time from map?
            }
        });
    }

    notify(timeMs, callback) {
        var removeEvent = this.removeTimeUpdateEvent.bind(this);
        var listener = function(event){
            var currentTime = event.target.currentTime * 1000;
            if (currentTime >= timeMs - 1) {
                removeEvent(timeMs);
                console.log("current time: " + currentTime);
                console.log("out time: " + timeMs);
                callback();
            }
        };
        this.notifyTimes.set(timeMs, listener);
        this.getPlayer().addTimeUpdateEvent(this.notifyTimes.get(timeMs));
    }
}

export default Player;
