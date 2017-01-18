/**
 * Created by user on 9/5/2016.
 */
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Hammer from 'hammerjs';
import Dots from '../Controls/Dots';
import BrightcoveSeekBar from '../Controls/BrightcoveSeekBar';
import ControlsStartStatus from '../Controls/ControlsStartStatus';
import {isIphone, isSafari, isMobileAgent} from '../utils/webUtils';

const SWIPES = {
    LEFT: 'swipeleft',
    RIGHT: 'swiperight'
};
class BrightCovePlayer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            waitForPlaying: false,
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
            playerElement.classList.add("em-player");
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
            //videoElement.setAttribute("crossOrigin", "anonymous");
            //videoElement.setAttribute("src", videoElement.getAttribute("src"));
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
            that.addEventListener("playing", that.playingListener.bind(that));
            that.addEventListener('volumechange', ()=>{
                that.context.store.dispatch({type: 'VOLUME_CHANGE', volume: that.getPlayer().volume()});
            });
            that.getControlBar().style.display = "flex";
        });
    }

    setItemTime(){
        this.getTotalTime().innerHTML = this.context.store.getState().itemLength;
    }

    getClassName() {
        let className = 'em-player-wrapper';
        className += (this.state.isHidden && this.context.store.getState().startStatus !== ControlsStartStatus.PENDING) ?
            ' em-hidden' : '';
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
        const { store } = this.context;
        const that = this;
        container.className = 'vjs-control progress-container';

        var shareControl = document.querySelector('#'+this.props.playerId + ' .vjs-control-bar .vjs-share-control');
        this.getControlBar().insertBefore(container, shareControl);
        this.addPoster();

        var timeContainer = document.querySelector('#' + this.props.playerId + ' .progress-container');
        const seekListener = this.seek.bind(this);

        function render(){
            that.renderPoster();
            ReactDOM.render(
                <div>
                    <Dots
                        isVisible={!store.getState().inExtend}
                        itemNum={store.getState().itemNum}
                        numOfItems={store.getState().numOfItems}
                        dotsClassName="em-brightcove-dots"
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

        var fullScreenControl = document.querySelector('#'+this.props.playerId + ' .vjs-fullscreen-control');
        if (fullScreenControl) {
            if (isIphone() || isSafari()) {
                fullScreenControl.parentNode.removeChild(fullScreenControl);
            } else {
                var newFullScreenControl = fullScreenControl.cloneNode(true);
                fullScreenControl.parentNode.replaceChild(newFullScreenControl, fullScreenControl);
                newFullScreenControl.addEventListener("click", function(event){
                    store.dispatch({type: 'TOGGLE_FULLSCREEN'});
                });
            }
        }
    }

    addPoster() {
        const { store } = this.context;
        var posterControl  = document.querySelector('#'+this.props.playerId + ' .vjs-poster');
        if (store.getState().programPreviewImageUrl) {
            let posterControlCln = posterControl.cloneNode();
            posterControlCln.setAttribute("style", "background-image: url('" + store.getState().programPreviewImageUrl + "');");
            posterControl.parentNode.replaceChild(posterControlCln, posterControl);
            posterControl = posterControlCln;
        }
        let gestureListener = new Hammer(posterControl, {velocity: 0.80});
        gestureListener.on(SWIPES.LEFT, this.swipeLeft.bind(this));
        gestureListener.on(SWIPES.RIGHT, this.swipeRight.bind(this));

    }

    renderPoster() {
        const { store } = this.context;
        var bigPlayButton = document.querySelector('#'+this.props.playerId + ' .vjs-big-play-button');
        var myPosterControl  = document.querySelector('#'+this.props.playerId + ' .vjs-poster');
        var spinnerControl  = document.querySelector('#'+this.props.playerId + ' .vjs-loading-spinner');
        if (bigPlayButton && store.getState().startStatus === ControlsStartStatus.ACTIVE) {
            bigPlayButton.style.display = "none";
        } else {
            bigPlayButton.style.display = "block";
        }
        if (this.state.waitForPlaying) {
            myPosterControl.classList.add("em-show");
            myPosterControl.classList.remove("em-hide");
            spinnerControl.classList.add("em-show");
            spinnerControl.classList.remove("em-hide");
        } else {
            myPosterControl.classList.add("em-hide", "em-fade");
            myPosterControl.classList.remove("em-show");
            spinnerControl.classList.add("em-hide");
            spinnerControl.classList.remove("em-show");
        }
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
                            className="em-player video-js"
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
        if (this.context.store.getState().startStatus === ControlsStartStatus.PENDING && isMobileAgent()){
            return Promise.reject("NotAllowedError");
        }
        this.getPlayer().play();
        this.setState({ waitForPlaying: true });
        return Promise.resolve();
    }

    show() {
        let newState = {
            isHidden: false
        };
        this.getPlayer().volume(this.context.store.getState().volume);
        this.getPlayer().userActive(true);
        if (this.context.store.getState().startStatus === ControlsStartStatus.ACTIVE){
            newState.waitForPlaying = true;
        }
        this.setState(newState);
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
    playingListener(event) {
        this.setState({ waitForPlaying: false });
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
