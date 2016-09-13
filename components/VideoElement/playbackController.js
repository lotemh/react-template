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

    loadSegment(segment, callback){
        if (this.isReady(segment.title)){
            callback();
        } else if (this.isLoading(segment.title)) {
            this.logger.log("segment " + segment.title + " is loading");
        } else {
            var nextPlayer = this.getFreePlayer();
            if (!nextPlayer){
                nextPlayer = this.getActive();
            }
            return this.prepare(nextPlayer, segment).then(function(){
                callback();
            }.bind(this));
        }
    }

    playSegment(segment, shouldContinuePlaying, onSegmentEndAction, callback){
        if (!this.isReady(segment.title)){
            this.pause();
            return this.loadSegment(segment, this.playSegment.bind(this, segment, shouldContinuePlaying, onSegmentEndAction, callback));
        }
        this.cancelOnSegmentEndAction();
        var nextPlayer = this.getPreparedPlayer(segment);
        this.logger.log("play segment " + segment.title + " on player " + nextPlayer.getId());
        this.switchPlayers(this.activePlayer, nextPlayer);
        this.waitForSegmentEnd(segment.out, onSegmentEndAction);
        callback && callback();
    }

    cancelOnSegmentEndAction() {
        this.clearCurrentInterval();
    }

    clearCurrentInterval() {
        clearTimeout(this.currentTimeoutId);
    }

    waitForSegmentEnd(endTimeStamp, callback) {
        var out = endTimeStamp;
        var currentTime = this.getActive().getCurrentTime();
        if (currentTime >= out - 0.01){
            callback();
            this.logger.log("current time: " + currentTime);
            this.logger.log("out time: " + out);
            return;
        }
        var delay = Math.max(out - currentTime , 0.01);
        this.currentTimeoutId = setTimeout(this.waitForSegmentEnd.bind(this, endTimeStamp, callback), delay);
    }

    createPlayers(players){
        var id = 0;
        players = players.map(p => new Player(p, "player" + id++));
        players.forEach(player => player.addLoadedDataEvent(this.onDataLoaded.bind(this)));
        this.players = players;
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

    deactivatePlayer(player) {
        if (player) {
            player.pause();
            player.hide();
            this.returnPlayer(player)
        }
    }

    switchPlayers(oldPlayer, nextPlayer) {
        if (!nextPlayer) return;
        this.activatePlayer(nextPlayer);
        if (oldPlayer !== nextPlayer){
            this.deactivatePlayer(oldPlayer);
        }
    }

    activatePlayer(player){
        if (!player) {return;}
        this.setActive(player);
        var activePlayer = this.getActive();
        activePlayer.show();
        activePlayer.play();
    }

    play(){
        this.getActive().play();
    }

    pause(){
        this.getActive().pause();
    }

    prepare(player, segment){
        this.logger.log("prepare player " + player.getId() + " with segment " + segment.title);
        var src = segment.src;
        var inTime = segment.in;
        // var outTime = segment.out;
        var videoSegment = buildSrc(src, inTime);
        this.setSegmentLoading(segment.title, player);

        return new Promise((resolve, reject)=>{
            this.cancelLoading = reject;
            this.loadedCallback = resolve;
            player.prepare(videoSegment, segment.title);
        });
    }

    onDataLoaded(segmentTitle, player) {
        this.logger.log("video for segment " + segmentTitle +" loaded");
        this.setSegmentReady(segmentTitle, player);
        if (this.loadedCallback) {
            this.loadedCallback();
        }
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

    shouldContinuePlaying(currentSegment, nextSegment) {
        return currentSegment.src === nextSegment.src &&
            currentSegment.out === nextSegment.in;
    }



    onTimeUpdated(segment, callback) {
        var out = segment.out;
        function timeUpdatedListener(){
            var currentTime = this.playbackController.getActive().getCurrentTime();
            if (currentTime >= out - 0.01){
                this.playbackController.getActive().removeTimeUpdateEvent(timeUpdatedListener);
                callback();
                this.logger.log("current time: ", currentTime);
                this.logger.log("out time: ", out);
            }
        }
        this.playbackController.getActive().addTimeUpdateEvent(timeUpdatedListener.bind(this));
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
