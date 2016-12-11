import React, { PropTypes } from 'react';
import Logger from '../Logger/Logger';
import ControlsStartStatus from '../Controls/ControlsStartStatus';
import {buildSrc} from '../utils/urlUtils';

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
        function playListener(event) {
            this.store.dispatch({type: 'SET_DATA', startStatus: ControlsStartStatus.ACTIVE, isPlaying: true});
            this.getPlayer().removeEventListener("play", playListener.bind(this));
        }
        this.getPlayer().addEventListener("play", playListener.bind(this));
        this.addTimeUpdateEvent();
        return this.getPlayer().play();
    }
    show() {
        this.getPlayer().show();
    }
    hide() {
        this.getPlayer().hide();
    }
    load() {
        return new Promise((resolve, reject) => {
            let returned = false;
            function gotLoadingEvent(event) {
                if (!returned) {
                    returned = true;
                    this.getPlayer().removeEventListener("loadeddata", gotLoadingEvent.bind(this));
                    return resolve();
                }
            }
            setTimeout(() => {
                if (!returned) {
                    this.getPlayer().load();
                }
            }, 2000);
            this.getPlayer().addEventListener("loadeddata", gotLoadingEvent.bind(this));
            this.getPlayer().load();
        });
    }
    prepare(src, inTime, segmentTitle) {
        this.loading = segmentTitle;
        if (!this.getPlayer().getSrc() || this.getPlayer().getSrc() !== src) {
            this.getPlayer().setSrc(src);
            return this.load()
                .then((src, inTime, segmentTitle) => this.prepare);
        }
        this.seek(inTime);
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
                listener(loadedSegment, this);
            }
        }
        this.loadedCallback = loadedCallback;
        this.getPlayer().addLoadedDataEvent(loadedCallback.bind(this));
    }

    addTimeUpdateEvent() {
        this.getPlayer().addTimeUpdateEvent(this.timeUpdatedListener.bind(this));
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
