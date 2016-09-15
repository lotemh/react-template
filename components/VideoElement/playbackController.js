/**
 * Created by user on 9/6/2016.
 */
import Logger from "../Logger/Logger";
import Player from "./Player";

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
    constructor(logger){
        this.logger = logger || new Logger();
        this.activePlayer = null;
        this.segmentToPlayerMap = {};
        this.loadingSegmentsMap = {};
    }

    /*********     Public API         ***********/
    createPlayers(players){
        var id = 0;
        players = players.map(p => new Player(p, "player" + id++));
        players.forEach(player => player.addLoadedDataEvent(this.onDataLoaded.bind(this)));
        this.players = players;
    }

    prepare(segment){
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
                this.cancelLoading = reject;
                this.loadedCallback = resolve;
                var nextPlayer = this.getFreePlayer();
                if (!nextPlayer){
                    nextPlayer = this.getActive();
                }
                this.loadSegment(nextPlayer, segment);
            }
        });
    }

    playSegment(segment, onSegmentEndAction, callback){
        this.cancelOnSegmentEndAction();
        if (this.shouldContinuePlaying(segment.src, segment.in)){
            this.logger.log("continue playing");
            this.setSegmentReady(segment.title, this.getActive());
        } else if (!this.isReady(segment.title)){
            this.pause();
            return this.prepare(segment).then(()=>{
                this.playSegment(segment, onSegmentEndAction, callback);
            });
        }
        var nextPlayer = this.getPreparedPlayer(segment);
        this.logger.log("play segment " + segment.title + " on player " + nextPlayer.getId());
        this.switchPlayers(this.activePlayer, nextPlayer);
        this.waitForSegmentEnd(segment.out, onSegmentEndAction);
        callback && callback();
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
        this.clearCurrentInterval();
    }

    waitForSegmentEnd(endTimeStamp, callback) {
        var out = endTimeStamp;
        var currentTime = this.getActive().getCurrentTime();
        if (currentTime >= out - 3){
            this.getActive().notify(out, callback);
            return;
        }
        var delay = Math.max(out - currentTime , 2);
        this.currentTimeoutId = setTimeout(this.waitForSegmentEnd.bind(this, out, callback), delay);
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

    clearCurrentInterval() {
        clearTimeout(this.currentTimeoutId);
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
        this.activatePlayer(nextPlayer);
        if (oldPlayer !== nextPlayer){
            this.deactivatePlayer(oldPlayer);
        }
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
        activePlayer.play();
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
        return Math.abs(this.getActive().getCurrentTime() - timeMs) < 10;
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
}

export default PlaybackController;
