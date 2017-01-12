/**
 * Created by user on 9/5/2016.
 */
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Hammer from 'hammerjs';
import Dots from '../Controls/Dots';
import BrightcoveSeekBar from '../Controls/BrightcoveSeekBar';
import ControlsStartStatus from '../Controls/ControlsStartStatus';
import {isIphone} from '../utils/webUtils';

const SWIPES = {
    LEFT: 'swipeleft',
    RIGHT: 'swiperight'
};
class BrightCovePlayer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            src: this.props["data-video-id"] || null,
            shouldLoad: false,
            isHidden: true
        };
    }

    componentWillMount(){
        if (document.querySelector('#'+this.props.playerId)) {
            this.setState({shouldLoad: false});
        } else {
            this.setState({shouldLoad: true});
        }
    }

    componentDidMount(){
        this.waitForVideoJs();
        this.unsubscribe = this.context.store.subscribe(() => {
            this.forceUpdate();
        });
        const script = document.createElement("script");
        script.src = this.props["data-brightcove-script"];
        var playerElement = document.getElementById(this.props.playerId);
        if (this.state.shouldLoad === false) {
            playerElement.classList.add("player", "brightcove-player");
            document.getElementById(this.props.playerId + "_wrapper").appendChild(playerElement);
        } else {
            playerElement.setAttribute("em-player", true);
            playerElement.parentNode.appendChild(script);
        }
    }

    componentWillUnmount(){
        this.unsubscribe();
    }

    swipeLeft() {
        this.props.eventHandler('next');
    }
    swipeRight(){
        this.props.eventHandler('previous');
    }
    waitForVideoJs(attempt) {
        if (!attempt) {
            attempt = 1;
        }
        try {
            this.initPlayer();
        } catch (e) {
            if (attempt < 10) {
                setTimeout(this.waitForVideoJs.bind(this, attempt + 1), 200);
            }
        }
    }

    onReady(callback){
        if (this.state.ready === true){
            callback();
        } else {
            //store array of callbacks for ready
            this.state.readyCallback = callback;
        }
    }

    initPlayer() {
        var that = this;
        let videoElement = this.getPlayerMediaElement();
        if (!this.state.shouldLoad) {
            videoElement.setAttribute("playsinline", "");
        }
        this.player = window.videojs(videoElement.id);
        this.gestureListener = new Hammer(videoElement, {velocity: 0.80});
        this.gestureListener.on(SWIPES.LEFT, this.swipeLeft.bind(this));
        this.gestureListener.on(SWIPES.RIGHT, this.swipeRight.bind(this));
        this.player.ready(function () {
            that.setState({ready: true, src: that.getPlayer().src()});
            that.addControls();
            that.setItemTime();
            if (that.state.readyCallback){
                that.state.readyCallback();
            }
            that.getControlBar().style.display = "flex";
        });
    }

    setItemTime(){
        this.getTotalTime().innerHTML = this.context.store.getState().itemLength;
    }

    getClassName() {
        let className = 'player-wrapper';
        className += (this.state.isHidden && this.context.store.getState().startStatus !== ControlsStartStatus.PENDING) ?
            ' hidden' : '';
        className += this.context.store.getState().inExtend ? ' show-progress-bar' : ' show-item-dots';
        return className;
    }

    getPlayer() {
        return this.player;
    }

    getPlayerMediaElement() {
        if (!this.videoElement) {
            this.videoElement = document.getElementById(this.props.playerId).getElementsByTagName('video')[0]
        }
        return this.videoElement;
    }

    getVideoProps(){
        const INVALID_VIDEO_PROPS = ["class", "playerId", "contentUrl", "eventHandler", "episodeId", "publisherId", "originalPlayerId",
            "style", "data-brightcove-script", "data-elastic-media-account"];
        var videoProps = Object.assign({}, this.props);
        INVALID_VIDEO_PROPS.forEach((attr) => {
            delete videoProps[attr];
        });
        return videoProps;
    }

    onExtendClick(){
        this.setState({inExtend: !this.state.inExtend});
    }

    addControls(){
        const container = document.createElement('div');
        container.id = 'progress-container';
        container.className = 'vjs-control';

        var shareControl = document.querySelector('#'+this.props.playerId + ' .vjs-control-bar .vjs-share-control');
        this.getControlBar().insertBefore(container, shareControl);


        var timeContainer = document.querySelector('#' + this.props.playerId + ' #progress-container');
        const { store } = this.context;
        const seekListener = this.seek.bind(this);

        function render(){
            ReactDOM.render(
                <div>
                    <Dots
                        isVisible={!store.getState().inExtend}
                        itemNum={store.getState().itemNum}
                        numOfItems={store.getState().numOfItems}
                        dotsClassName="brightcove-dots"
                    />
                    <BrightcoveSeekBar
                        isVisible={store.getState().inExtend}
                        itemTimeMs={store.getState().itemTimeMs}
                        itemStart={store.getState().itemStart}
                        itemLength={store.getState().itemLength}
                        seekListener={seekListener}
                    />
                </div>, timeContainer);

        }
        store.subscribe(render);
        render();
    }

    getControlBar(){
        return document.querySelector('#'+this.props.playerId + ' .vjs-control-bar');
    }

    getTotalTime(){
        return document.querySelector('#'+this.props.playerId + ' .vjs-control-bar .vjs-duration-display');
    }

    render() {
        return (
            <div id={this.props.playerId + "_wrapper"} className={this.getClassName()} ref="touchScreen">
                { this.state.shouldLoad ?
                <div>
                    <video ref="player"
                            className="player brightcove-player video-js"
                            id={this.props.playerId}
                            playsInline
                            data-embed="default"
                            data-application-id
                            crossOrigin="anonymous"
                            preload="metadata"
                        {...this.getVideoProps()}>
                    </video>
                </div>
                : null}
            </div>
        );
    }

    /** ****************************/

    pause() {
        if (!this.getPlayer().paused()){
            this.getPlayer().pause();
        }
    }

    play() {
        if (this.context.store.getState().startStatus === ControlsStartStatus.PENDING && isIphone()){
            return Promise.reject("NotAllowedError");
        }
        this.getPlayer().play();
        return Promise.resolve();
    }

    show() {
        this.getPlayer().userActive(true);
        this.setState({ isHidden: false });
    }

    hide() {
        this.setState({ isHidden: true });
    }

    setSrc(src) {
        if (src !== this.getSrc()) {
            this.src = src;
        }
    }

    getSrc() {
        return this.src || this.getPlayerMediaElement().getAttribute('data-video-id')
    }

    load(src) {
        this.setSrc(src);
        return new Promise((resolve, reject) => {
            const player = this.getPlayer();
            player.on("loadeddata", resolve);
            player.catalog.getVideo(this.getSrc(), function (error, video) {
                player.catalog.load(video);
                if (player.buffered().end(0) > 0){
                    resolve();
                } else if (error){
                    reject(error);
                }
            });
        });

    }

    seek(timeInSeconds) {
        this.getPlayer().currentTime(timeInSeconds);
    }

    getCurrentTime() {
        return this.getPlayer().currentTime() * 1000;
    }

    addLoadedDataEvent(listener) {
        this.getPlayer().on('loadeddata', listener);
    }

    addTimeUpdateEvent(listener) {
        this.runTimeUpdate = true;
        let lastTime;
        function updateInfo(callback) {
            let currentTime = this.getPlayer().currentTime();
            if (currentTime !== lastTime) {
                listener();
                lastTime = currentTime;
            }
            if (this.runTimeUpdate) {
                window.requestAnimationFrame(updateInfo.bind(this));
            }
        }
        window.requestAnimationFrame(updateInfo.bind(this));
    }

    removeTimeUpdateEvent(listener) {
        this.runTimeUpdate = false;
    }

    addEventListener(event, listener) {
        this.getPlayer().on(event, listener, false);
    }

    removeEventListener(event, listener) {
        this.getPlayer().off(event, listener);
    }
}

BrightCovePlayer.propTypes = {
    src: PropTypes.string,
    account: PropTypes.string
};

BrightCovePlayer.contextTypes = {
    store: React.PropTypes.object
};

export default BrightCovePlayer;
