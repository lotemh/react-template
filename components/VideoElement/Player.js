import React, {PropTypes} from "react";
import Logger from "../Logger/Logger";
import ControlsStartStatus from "../Controls/ControlsStartStatus";
import {isMobileAgent, isIphone} from "../utils/webUtils";

class Player {

    constructor(videoPlayer, id, store) {
        this.player = videoPlayer;
        this.store = store;
        this.id = id;
        this.logger = new Logger();
        if ('AudioContext' in window) {
            this.audioContext = new AudioContext();
        } else if ('webkitAudioContext' in window) {
            this.audioContext = new webkitAudioContext();
        }
        this.audioTfxActive = false;
        this.shouldPlay = false;
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
        this.getPlayer().onReady(()=> {
            this.addTimeUpdateEvent();
            function playListener(event) {
                this.store.dispatch({type: 'SET_DATA', startStatus: ControlsStartStatus.ACTIVE, isPlaying: true});
                this.getPlayer().removeEventListener("play", playListener.bind(this));
            }
            this.getPlayer().addEventListener("play", playListener.bind(this));
            callback();
        });
    }

    pause() {
        this.shouldPlay = false;
        this.getPlayer().pause();
    }

    play(segment) {
        this.shouldPlay = true;
        const src = segment.src;
        const inTime = segment.in;
        const store = this.store;
        if (this.store.getState().startStatus === ControlsStartStatus.PENDING && isMobileAgent()){
            return Promise.reject("NotAllowedError");
        }
        if (!this.isReady(src, inTime)){
            return this.prepareAndPlay(segment);
        } else {
            return this.playPreparedSegment(store);
        }
    }

    firstTimeActivatePlayerForMobile(shouldPause){
        if (shouldPause){
            this.getPlayer().play();
            this.getPlayer().pause();
        } else{
            this.getPlayer().play();
        }
    }

    playPreparedSegment() {
        const store = this.store;
        const state = store.getState();
        if (state.tfxAudio && !this.audioTfxActive) {
            this.audioTfxActive = true;
            this[state.tfxAudio]();
        }
        return this.playIfShould().then(() => {
            store.dispatch({
                type: 'PLAY'
            });
        });
    }

    show() {
        this.getPlayer().show();
    }
    hide() {
        this.getPlayer().hide();
    }
    load(src) {
        if (this.store.getState().startStatus === ControlsStartStatus.PENDING && isIphone()){
            return Promise.reject();
        } else{
            return this.getPlayer().load(src);
        }
    }

    prepare(src, inTime) {
        if (!(this.getPlayer().getSrc() && this.getPlayer().getSrc() === src)){
            return this.load(src).then(() => {
                this.seek(inTime / 1000);
                if (!this.shouldPlay){
                    this.pause();
                }
                return Promise.resolve();
            });
        }
        this.seek(inTime / 1000);
        if (!this.shouldPlay){
            this.pause();
        }
        //todo: wait for player to reach seeked timestamp
        return Promise.resolve();
    }

    prepareAndPlay(segment) {
        return Promise.race([this.prepare(segment.src, segment.in),
            new Promise((resolve, reject)=>{
                setTimeout(()=>{
                    reject();
                }, 1000);
            })])
            .then(() => {
                return this.play(segment);
            },() => {
                return this.playPreparedSegment();
            });
    }

    seek(timestamp) {
        if (this.getCurrentTime() !== timestamp) {
            this.getPlayer().seek(timestamp);
        }
    }

    getCurrentTime() {
        return this.getPlayer().getCurrentTime();
    }

    getId() {
        return this.id;
    }

    addTimeUpdateEvent() {
        this.getPlayer().addTimeUpdateEvent(this.timeUpdatedListener.bind(this));
    }

    removeTimeUpdateEvent() {
        this.getPlayer().removeTimeUpdateEvent(this.timeUpdatedListener.bind(this));
    }

    getSrc() {
        return this.getPlayer().getSrc();
    }

    timeUpdatedListener(event) {
        const currentTime = this.getPlayer().getCurrentTime();
        this.timeUpdateCallback(currentTime, this.id);
    }

    setTimeUpdateCallback(cb) {
        this.timeUpdateCallback = cb;
    }

    tfxAudioFadeIn() {
        const audioCtx = this.getAudioContext();
        if (!audioCtx) {
            return;
        }
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

    /*******************  private methods  ***************************/

    isReady(src, inTime) {
        return this.getPlayer().getSrc() &&
            this.getPlayer().getSrc() === src &&
            this.getCurrentTime() === inTime;
    }

    playIfShould(){
        if (this.shouldPlay){
            return this.getPlayer().play();
        } else {
            return Promise.reject();
        }
    }
}

export default Player;
