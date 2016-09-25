/**
 * Created by user on 9/6/2016.
 */
import Logger from "../Logger/Logger";
import Player from "../VideoElement/Player";

function buildSrc(src, inTime, outTime) {
    var segment = src + "#t=" + getTimeInSeconds(inTime);
    if (outTime) {
        segment += "," + getTimeInSeconds(outTime);
    }
    return segment;
}

function getTimeInSeconds(timeInMili){
    return timeInMili/1000;
}

class PlaybackController {
    constructor() {
        this.segmentEndTimeMs = false;
        this.logger = new Logger();
        this.activePlayer = null;
        this.segmentToPlayerMap = {};
        this.loadingSegmentsMap = {};
    }

    /*********     Public API         ***********/
    createPlayers(players){
        var id = 0;
        players = players.map(p => new Player(p, "player" + id++));
        players.forEach(player => {
            player.addLoadedDataEvent(this.onDataLoaded.bind(this));
            player.setTimeUpdateCallback(this.playerUpdate.bind(this));
        });
        this.players = players;
    }

    prepare(segment, isForce){
        return new Promise((resolve, reject) => {
            if (this.isReady(segment.title)){
                return resolve();
            }
            if (this.isLoading(segment.title)){
                if (!!this.cancelLoading){
                    this.cancelLoading();
                    delete this.cancelLoading;
                }
                this.loadedCallback = resolve;
            }
            else {
                var nextPlayer = this.getFreePlayer();
                this.cancelLoading = reject;
                this.loadedCallback = resolve;
                if (nextPlayer){
                    this.loadSegment(nextPlayer, segment);
                } else if (!nextPlayer && isForce){
                    nextPlayer = this.getActive();
                    this.loadSegment(nextPlayer, segment);
                } else {
                    this.cancelLoading();
                    delete this.cancelLoading;
                }
            }
        });
    }

    forcePrepare(segment){
        var forcePrepare = true;
        return this.prepare(segment, forcePrepare)
    }

    playSegment(segment, onSegmentEndAction){
        this.cancelOnSegmentEndAction();
        if (this.shouldContinuePlaying(segment.src, segment.in)){
            this.logger.log("continue playing");
            this.setSegmentReady(segment.title, this.getActive());
        } else if (!this.isReady(segment.title)){
            this.pause();
            return this.forcePrepare(segment).then(()=>{
                return this.playSegment(segment, onSegmentEndAction);
            });
        }
        var nextPlayer = this.getPreparedPlayer(segment);
        this.logger.log("play segment " + segment.title + " on player " + nextPlayer.getId());
        this.waitForSegmentEnd(segment.out, onSegmentEndAction);
        return this.switchPlayers(this.activePlayer, nextPlayer);
    }

    play(){
        return this.getActive().play();
    }

    pause(){
        var activePlayer = this.getActive();
        activePlayer && activePlayer.pause();
    }

    updateSegments(segmentsToPrepare){
        var that = this;
        Object.keys(this.segmentToPlayerMap).forEach((segment)=>{
            if (!segmentsToPrepare.get(segment)){
                that.unloadSegment(segment, this.segmentToPlayerMap);
            }
        });

        Object.keys(this.loadingSegmentsMap).forEach((segment)=>{
            if (!segmentsToPrepare.get(segment)){
                that.unloadSegment(segment, this.loadingSegmentsMap);
                that.cancelLoading && that.cancelLoading();
            }
        });
    }

    prepareSegments(segments) {
        var nextSegment = segments.next();
        if (nextSegment === undefined){
            return;
        }
        // if (this.shouldContinuePlaying(this.segmentsManager.getActive(), nextSegment)){
        //   return this.prepareSegments(segments);
        // }

        this.prepare(nextSegment).
        then(()=>{
            this.prepareSegments(segments);
        });
    }

    cancelOnSegmentEndAction() {
        clearTimeout(this.playerEndVerifierTimeout);
        this.segmentEndTimeMs = false;
    }

    waitForSegmentEnd(endTimeStamp, onSegmentEndAction) {
        this.segmentEndTimeMs = endTimeStamp;
        this.onSegmentEndAction = onSegmentEndAction;
    }

    playerEndVerifier () {
        if (this.getActive().getCurrentTime() >= this.segmentEndTimeMs) {
            this.onSegmentEndAction();
        }
    }
    playerUpdate (timeMs, playerId) {
        clearTimeout(this.playerEndVerifierTimeout);
        if (playerId === this.getActive().id) {
            if (this.segmentEndTimeMs && this.segmentEndTimeMs <= timeMs) {
                this.onSegmentEndAction();
            } else if (this.segmentEndTimeMs && this.segmentEndTimeMs - 400 <= timeMs) {
                this.playerEndVerifierTimeout = setInterval(this.playerEndVerifier.bind(this), this.segmentEndTimeMs - timeMs);
            }
            this.timeUpdateCallback(timeMs);
        }
    }

    /*********     Private Methods       ***********/

    loadSegment(player, segment){
        this.logger.log("prepare player " + player.getId() + " with segment " + segment.title);
        var src = segment.src;
        var inTime = segment.in;
        // var outTime = segment.out;
        var videoSegment = buildSrc(src, inTime);
        this.setSegmentLoading(segment.title, player);
        player.prepare(videoSegment, segment.title);
    }

    unloadSegment(segmentId, segmentPool){
        var deprecatedPlayer = segmentPool[segmentId];
        if (deprecatedPlayer){
            delete segmentPool[segmentId];
        }
        if (deprecatedPlayer && deprecatedPlayer !== this.getActive()) {
            this.returnPlayer(deprecatedPlayer);
            this.logger.log("return player " + deprecatedPlayer.getId());
        }
    }

    getActive(){
        return this.activePlayer;
    }

    setActive(player){
        this.activePlayer = player;
    }

    returnPlayer(player){
        this.players.push(player);
    }

    getFreePlayer(){
        return this.players.pop();
    }

    switchPlayers(oldPlayer, nextPlayer) {
        if (!nextPlayer) return;
        return this.activatePlayer(nextPlayer).then(()=>{
            if (oldPlayer !== nextPlayer){
                this.deactivatePlayer(oldPlayer);
            }
        });
    }

    deactivatePlayer(player) {
        if (player) {
            player.pause();
            player.hide();
            this.returnPlayer(player)
        }
    }

    activatePlayer(player){
        if (!player) {return;}
        this.setActive(player);
        var activePlayer = this.getActive();
        activePlayer.show();
        return activePlayer.play();
    }

    seek(timestamp){
        this.getActive().seek(timestamp);
    }

    onDataLoaded(segmentTitle, player) {
        this.logger.log("video for segment " + segmentTitle +" loaded");
        this.setSegmentReady(segmentTitle, player);
        if (this.loadedCallback) {
            this.loadedCallback();
        }
    }

    shouldContinuePlaying(src, timeMs) {
        if (!this.getActive()){return false;}
        /*check if src is equal this.getActive().getSrc() === src &&*/
        return Math.abs(this.getActive().getCurrentTime() - timeMs) < 1000;
    }

    /**     Loading segments         ***********/

    setSegmentLoading(segmentTitle, player){
        this.loadingSegmentsMap[segmentTitle] = player;
    }

    isLoading(segmentId){
        return !!this.loadingSegmentsMap[segmentId];
    }

    clearSegmentLoading(segmentId){
        delete this.loadingSegmentsMap[segmentId];
    }

    /**     Ready segments         ***********/

    isReady(segmentId){
        return !!this.segmentToPlayerMap[segmentId];
    }

    setSegmentReady(segmentTitle, player){
        this.segmentToPlayerMap[segmentTitle] = player;
        this.clearSegmentLoading(segmentTitle);
    }

    getPreparedPlayer(segment){
        var player = this.segmentToPlayerMap[segment.title];
        delete this.segmentToPlayerMap[segment.title];
        return player;
    }

    setTimeUpdate(timeUpdateCallback) {
        this.timeUpdateCallback = timeUpdateCallback;
    }
}

export default PlaybackController;
