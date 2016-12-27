/**
 * Created by user on 9/6/2016.
 */
import Logger from '../Logger/Logger';
import Player from '../VideoElement/Player';

class PlaybackController {
    constructor(store) {
        this.store = store;
        this.segmentEndTimeMs = false;
        this.logger = new Logger();
        this.activePlayer = null;
        this.segmentToPlayerMap = {};
        this.loadingSegmentsMap = {};
    }

    /*********     Public API         ***********/
    createPlayers(videoElements){
        var id = 0;
        var promises = [];
        const players = videoElements.map(p => new Player(p, "player" + id++, this.store));
        players.forEach(player => {
            promises.push(new Promise((resolve, reject) => {
                player.onReady(()=> {
                    player.setTimeUpdateCallback(this.playerUpdate.bind(this));
                    player.addLoadedDataEvent(this.onDataLoaded.bind(this));
                    return resolve();
                    //player.load().then(resolve, resolve);
                });
            }));
        });
        this.players = players;
        return Promise.all(promises);
    }

    prepare(segment, isForce) {
        return new Promise((resolve, reject) => {
            if (this.isReady(segment.title)) {
                return resolve();
            }
            if (this.isLoading(segment.title)) {
                if (isForce){
                    this.setSegmentReady(segment.title);
                    const player = this.getPreparedPlayer(segment);
                    player.seek(segment.in);
                    this.loadedCallback = resolve;
                    return resolve();
                }
                if (!!this.cancelLoading) {
                    this.cancelLoading();
                    delete this.cancelLoading;
                }
                this.loadedCallback = resolve;
            }
            else {
                let nextPlayer = this.getFreePlayer();
                this.cancelLoading = reject;
                this.loadedCallback = resolve;
                if (nextPlayer) {
                    this.loadSegment(nextPlayer, segment);
                } else if (!nextPlayer && isForce) {
                    nextPlayer = this.getActive();
                    this.loadSegment(nextPlayer, segment);
                } else {
                    this.cancelLoading();
                    delete this.cancelLoading;
                }
            }
        });
    }

    forcePrepare(segment) {
        const forcePrepare = true;
        return this.prepare(segment, forcePrepare);
    }

    playSegment(segment, onSegmentEndAction) {
        if (this.shouldContinuePlaying(segment.src, segment.in)) {
            this.logger.log('continue playing');
            this.setSegmentReady(segment.title, this.getActive());
        } else if (!this.isReady(segment.title)) {
            this.pause();
            return this.forcePrepare(segment).then(() => {
                return this.playSegment(segment, onSegmentEndAction);
            });
        }
        const nextPlayer = this.getPreparedPlayer(segment);
        this.logger.log(`play segment ${segment.title} on player ${nextPlayer.getId()}`);
        this.waitForSegmentEnd(segment.out, onSegmentEndAction);
        return this.switchPlayers(this.activePlayer, nextPlayer);
    }

    play() {
        return this.getActive().play();
    }

    pause() {
        const activePlayer = this.getActive();
        activePlayer && activePlayer.pause();
    }

    updateSegments(segmentsToPrepare) {
        const that = this;
        Object.keys(this.segmentToPlayerMap).forEach((segment) => {
            if (!segmentsToPrepare.get(segment)) {
                that.unloadSegment(segment, this.segmentToPlayerMap);
            }
        });

        Object.keys(this.loadingSegmentsMap).forEach((segment) => {
            if (!segmentsToPrepare.get(segment)) {
                that.unloadSegment(segment, this.loadingSegmentsMap);
                that.cancelLoading && that.cancelLoading();
            }
        });
    }

    prepareSegments(segments) {
        const nextSegment = segments.next();
        if (nextSegment === undefined) {
            return;
        }
        // if (this.shouldContinuePlaying(this.segmentsManager.getActive(), nextSegment)){
        //   return this.prepareSegments(segments);
        // }

        this.prepare(nextSegment).
        then(() => {
            this.prepareSegments(segments);
        }, () => {});
    }

    waitForSegmentEnd(endTimeStamp, onSegmentEndAction) {
        this.segmentEndTimeMs = endTimeStamp;
        this.onSegmentEndAction = onSegmentEndAction;
    }

    playerUpdate(timeMs, playerId) {
        if (this.getActive() && playerId === this.getActive().id) {
            if (this.segmentEndTimeMs && this.segmentEndTimeMs <= timeMs) {
                if (this.onSegmentEndAction) {
                    this.onSegmentEndAction();
                }
            }
            this.timeUpdateCallback(timeMs);
        }
    }

    /** *******     Private Methods       ***********/

    loadSegment(player, segment) {
        this.logger.log(`prepare player ${player.getId()} with segment ${segment.title}`);
        const src = segment.src;
        const inTime = segment.in;
        // var outTime = segment.out;
        this.setSegmentLoading(segment.title, player);
        return player.prepare(src, inTime, segment.title).catch(()=>{
            this.unloadSegment(segment.title, this.loadingSegmentsMap)
        });
    }

    unloadSegment(segmentId, segmentPool) {
        const deprecatedPlayer = segmentPool[segmentId];
        if (deprecatedPlayer) {
            delete segmentPool[segmentId];
        }
        if (deprecatedPlayer && deprecatedPlayer !== this.getActive()) {
            this.returnPlayer(deprecatedPlayer);
            this.logger.log(`return player ${deprecatedPlayer.getId()}`);
        }
    }

    getActive() {
        return this.activePlayer;
    }

    setActive(player) {
        this.activePlayer = player;
    }

    returnPlayer(player) {
        this.players.push(player);
    }

    getFreePlayer() {
        return this.players.pop();
    }

    switchPlayers(oldPlayer, nextPlayer) {
        if (!nextPlayer) return;

        this.store.dispatch({type: 'TFX_AUDIO_SET'});

        return this.activatePlayer(nextPlayer).then(() => {
            this.store.dispatch({type: 'SWITCH_PLAYERS'});
            if (oldPlayer !== nextPlayer) {
                this.deactivatePlayer(oldPlayer);
            }
        });
    }

    deactivatePlayer(player) {
        if (player) {
            player.pause();
            player.hide();
            this.returnPlayer(player);
        }
    }

    activatePlayer(player) {
        if (!player) { return; }
        const activePlayer = player;
        activePlayer.show();
        this.setActive(player);
        return activePlayer.play();
    }

    seek(timestamp) {
        this.getActive().seek(timestamp);
    }

    onDataLoaded(segmentTitle, player) {
        this.logger.log(`video for segment ${segmentTitle} loaded`);
        this.setSegmentReady(segmentTitle, player);
        if (this.loadedCallback) {
            this.loadedCallback();
        }
    }

    shouldContinuePlaying(src, timeMs) {
        if (!this.getActive()) { return false; }
        const isSrcEqual = this.getActive().getSrc() === src;
        const isInTimeCloseToCurrentTime = Math.abs(this.getActive().getCurrentTime() - timeMs) < 1000;
        return isSrcEqual && isInTimeCloseToCurrentTime;
    }

    //Thank you Aaron Atar for finding the solution!!!
    startPlaying() {
        this.players.concat(Object.values(this.loadingSegmentsMap)).concat(Object.values(this.segmentToPlayerMap)).forEach(p => {
            p.play();
            p.pause();
        });
        if (this.activePlayer) {
            this.activePlayer.play();
        }
    }

    /**     Loading segments         ***********/

    setSegmentLoading(segmentTitle, player) {
        this.loadingSegmentsMap[segmentTitle] = player;
    }

    isLoading(segmentId) {
        return !!this.loadingSegmentsMap[segmentId];
    }

    clearSegmentLoading(segmentId) {
        delete this.loadingSegmentsMap[segmentId];
    }

    /**     Ready segments         ***********/

    isReady(segmentId) {
        return !!this.segmentToPlayerMap[segmentId];
    }

    setSegmentReady(segmentTitle, player) {
        if (!player){
            player = this.loadingSegmentsMap[segmentTitle];
        }
        if (!segmentTitle || !player) return;
        this.segmentToPlayerMap[segmentTitle] = player;
        this.clearSegmentLoading(segmentTitle);
    }

    getPreparedPlayer(segment) {
        const player = this.segmentToPlayerMap[segment.title];
        delete this.segmentToPlayerMap[segment.title];
        return player;
    }

    setTimeUpdate(timeUpdateCallback) {
        this.timeUpdateCallback = timeUpdateCallback;
    }
}

export default PlaybackController;
