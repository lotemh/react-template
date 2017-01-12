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
                    return resolve();
                });
            }));
        });
        this.players = players;
        return Promise.all(promises);
    }

    prepare(segment) {
        return new Promise((resolve, reject) => {
            if (this.isReady(segment.title)) {
                return resolve();
            }
            else {
                let nextPlayer = this.getFreePlayer();
                if (nextPlayer) {
                    this.setSegmentReady(segment.title, nextPlayer);
                    this.logger.log(`prepare player ${nextPlayer.getId()} with segment ${segment.title}`);
                    return nextPlayer.prepare(segment.src, segment.in);
                } else {
                    reject("no available player");
                }
            }
        });
    }

    playSegment(segment, onSegmentEndAction) {
        if (this.shouldContinuePlaying(segment.src, segment.in)) {
            this.logger.log('continue playing');
            this.setSegmentReady(segment.title, this.getActive());
        }
        const nextPlayer = this.getPreparedPlayer(segment);
        this.waitForSegmentEnd(segment.out, onSegmentEndAction);
        return this.switchPlayers(this.activePlayer, nextPlayer, segment);
    }

    play(src, timestamp) {
        return this.getActive().play(src, timestamp);
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
    }

    prepareSegments(segments) {
        const nextSegment = segments.next();
        if (nextSegment === undefined) {
            return;
        }

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

    switchPlayers(oldPlayer, nextPlayer, segment) {
        nextPlayer = nextPlayer || this.getFreePlayer() || this.getActive();
        this.logger.log(`play segment ${segment.title} on player ${nextPlayer.getId()}`);

        this.store.dispatch({type: 'TFX_AUDIO_SET'});
        const activePlayerPromise = this.activatePlayer(nextPlayer, segment);
        if (oldPlayer !== nextPlayer) {
            this.deactivatePlayer(oldPlayer);
        }
        this.store.dispatch({type: 'SWITCH_PLAYERS'});
        return activePlayerPromise;
    }

    deactivatePlayer(player) {
        if (player) {
            player.pause();
            player.hide();
            this.returnPlayer(player);
        }
    }

    activatePlayer(player, segment) {
        if (!player) { return; }
        const activePlayer = player;
        this.setActive(player);
        const playPromise = activePlayer.play(segment);
        activePlayer.show();
        return playPromise;
    }

    seek(timestamp) {
        this.getActive().seek(timestamp);
    }

    shouldContinuePlaying(src, timeMs) {
        if (!this.getActive()) { return false; }
        const isSrcEqual = this.getActive().getSrc() === src;
        const isInTimeCloseToCurrentTime = Math.abs(this.getActive().getCurrentTime() - timeMs) < 1000;
        return isSrcEqual && isInTimeCloseToCurrentTime;
    }

    startPlaying() {
        this.players.concat(Object.values(this.segmentToPlayerMap)).concat(this.activePlayer).forEach(p => {
            if (p === this.activePlayer){
                p.firstTimeActivatePlayerForMobile();
            } else {
                p.firstTimeActivatePlayerForMobile(true);
            }
        });
        this.store.dispatch({type: 'FIRST_PLAY'});
    }


    /**     Ready segments         ***********/

    isReady(segmentId) {
        return !!this.segmentToPlayerMap[segmentId];
    }

    setSegmentReady(segmentTitle, player) {
        if (!segmentTitle || !player) return;
        this.segmentToPlayerMap[segmentTitle] = player;
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
