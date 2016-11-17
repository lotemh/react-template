import React, { PropTypes } from 'react';
import Logger from '../Logger/Logger';
import ControlsStartStatus from '../Controls/ControlsStartStatus';

class Player {

    constructor(videoPlayer, id, store) {
        this.player = videoPlayer;
        this.store = store;
        this.loading = null;
        this.id = id;
        this.logger = new Logger();
        this.src = '';
    }

    getPlayer() {
        return this.player;
    }

    onReady(callback) {
        this.getPlayer().onReady(callback);
    }

    pause() {
        this.getPlayer().pause();
        this.removeTimeUpdateEvent();
    }

    play() {
        this.addTimeUpdateEvent();
        this.addPlayingEvent();
        return this.getPlayer().play();
    }
    show() {
        this.getPlayer().show();
    }
    hide() {
        this.getPlayer().hide();
    }
    prepare(src, segmentTitle) {
        this.loading = segmentTitle;
        if (!this.src) {
            this.getPlayer().setSrc(src);
            this.src = src;
            this.getPlayer().load();
            return;
        }
        const timestamp = src.match(/.*#t=(\d*\.*\d*)/)[1];
        this.seek(timestamp);
        this.pause();
        this.loadedCallback(segmentTitle);
    }
    seek(timestamp) {
        this.getPlayer().seek(timestamp);
    }
    getCurrentTime() {
        return this.getPlayer().getCurrentTime();
    }
    getId() {
        return this.id;
    }
    addLoadedDataEvent(listener) {
        function loadedCallback() {
            if (!this.src){
                this.src = this.getPlayer().getSrc();
            }
            const loadedSegment = this.loading;
            if (loadedSegment) {
                this.loading = null;
            }
            listener(loadedSegment, this);
        }
        this.loadedCallback = loadedCallback;
        this.getPlayer().addLoadedDataEvent(loadedCallback.bind(this));
    }

    addTimeUpdateEvent() {
        this.getPlayer().addTimeUpdateEvent(this.timeUpdatedListener.bind(this));
    }
    addPlayingEvent() {
        this.getPlayer().addEventListener("play", function playerIsPlaying(event) {
            console.log("got playing event!!!");
            this.store.dispatch({type: 'SET_DATA', startStatus: ControlsStartStatus.ACTIVE, isPlaying: true});
        }.bind(this));
    }
    removeTimeUpdateEvent() {
        this.getPlayer().removeTimeUpdateEvent(this.timeUpdatedListener.bind(this));
    }

    getSrc() {
        return this.src;
    }

    timeUpdatedListener(event) {
        const currentTime = this.getPlayer().getCurrentTime();
        this.timeUpdateCallback(currentTime, this.id);
    }

    setTimeUpdateCallback(cb) {
        this.timeUpdateCallback = cb;
    }
}

export default Player;
