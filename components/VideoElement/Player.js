import React, { PropTypes } from 'react';
import Logger from '../Logger/Logger';
import ControlsStartStatus from '../Controls/ControlsStartStatus';

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
            callback();
        });
    }

    pause() {
        this.getPlayer().pause();
    }

    play(segment) {
        const src = segment.src;
        const inTime = segment.in;
        const store = this.store;
        function playListener() {
            store.dispatch({
                type: 'SET_DATA', startStatus: ControlsStartStatus.ACTIVE,
                isPlaying: true
            });
            this.getPlayer().removeEventListener("play", playListener.bind(this));
        }
        this.getPlayer().addEventListener("play", playListener.bind(this));

        if (!this.isReady(src, inTime)){
            return this.prepareAndPlay(segment);
        } else {
            const state = this.store.getState();
            if (state.tfxAudio && !this.audioTfxActive) {
                this.audioTfxActive = true;
                this[state.tfxAudio]();
            }
            return this.getPlayer().play();
        }
    }
    show() {
        this.getPlayer().show();
    }
    hide() {
        this.getPlayer().hide();
    }
    load(src) {
        const player = this.getPlayer();
        return new Promise((resolve, reject) => {
            let returned = false;
            player.addEventListener("loadeddata", gotLoadingEvent.bind(this));
            function gotLoadingEvent() {
                if (!returned) {
                    returned = true;
                    player.removeEventListener("loadeddata", gotLoadingEvent.bind(this));
                    return resolve();
                }
            }
            setTimeout(() => {
                if (!returned) {
                    player.removeEventListener("loadeddata", gotLoadingEvent.bind(this));
                    return reject();
                }
            }, 1500);
            player.load(src);
        });
    }

    prepare(src, inTime, segmentTitle) {
        this.loading = segmentTitle;
        if (!this.isReady(src, inTime)){
            return this.load(src).then(() => {
                return this.prepare(src, inTime, segmentTitle);
            }, ()=> {
                this.seek(inTime / 1000);
                this.pause();
                return Promise.reject();
            });
        }
        this.seek(inTime / 1000);
        this.pause();
        //todo: wait for player to reach seeked timestamp
        return Promise.resolve();
    }

    prepareAndPlay(segment) {
        return this.prepare(segment.src, segment.in, segment.title)
            .then(() => {
                return this.play(segment);
            },() => {
                return this.getPlayer().play()
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
            this.getCurrentTime() === inTime &&
            this.getPlayer().getPlayer().buffered().end(0) > 0;
    }
}

export default Player;
