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
        this.audioContext = new AudioContext();
        this.audioTfxActive = false;
    }

    getPlayer() {
        return this.player;
    }

    getPlayerMediaElement() {
        return this.getPlayer().getPlayerMediaElement();
    }

    getAudioContext() {
        return this.audioContext;
    }

    getMediaElementSource() {
        if (!this.mediaElementSource) {
            const audioCtx = this.getAudioContext();
            const mediaElement = this.getPlayerMediaElement();
            this.mediaElementSource = audioCtx.createMediaElementSource(mediaElement);
        }

        return this.mediaElementSource;
    }

    onReady(callback) {
        this.getPlayer().onReady(callback);
    }

    pause() {
        this.getPlayer().pause();
        this.removeTimeUpdateEvent();
    }

    play() {
        const state = this.store.getState();
        if (state.tfxAudio && !this.audioTfxActive) {
            this.audioTfxActive = true;
            this[state.tfxAudio]();
        }

        function playListener(event) {
            this.store.dispatch({type: 'SET_DATA', startStatus: ControlsStartStatus.ACTIVE,
                                 isPlaying: true});
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
    prepare(src, segmentTitle) {
        this.loading = segmentTitle;
        /*
        if (!this.src) {
            this.getPlayer().setSrc(src);
            this.src = src;
            this.getPlayer().load();
            return;
        }
        */
        const timestamp = src.match(/.*#t=(\d*\.*\d*)/)[1];
        if (timestamp === "0") {
            return this.loadedCallback(segmentTitle);
        }
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

    tfxAudioFadeIn() {
        const audioCtx = this.getAudioContext()
        const gainNode = audioCtx.createGain();
        const source = this.getMediaElementSource();

        const fadeTimeMs = 40;

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + fadeTimeMs / 1000);

        source.disconnect();
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        window.setTimeout(() => {
            source.connect(audioCtx.destination);
            this.audioTfxActive = false;
            this.store.dispatch({type: 'TFX_AUDIO_END'});
        }, fadeTimeMs);
    }
}

export default Player;
