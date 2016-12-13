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
            src: this.props["data-video-id"] || '',
            isHidden: true
        };
    }

    componentWillMount(){
        const script = document.createElement("script");
        script.src = this.props["data-brightcove-script"];
        document.body.appendChild(script);
    }

    componentDidMount(){
        this.gestureListener = new Hammer(ReactDOM.findDOMNode(this.refs.touchScreen));
        this.waitForVideoJs();
        this.gestureListener.on(SWIPES.LEFT, this.swipeLeft.bind(this));
        this.gestureListener.on(SWIPES.RIGHT, this.swipeRight.bind(this));
        this.unsubscribe = this.context.store.subscribe(() => {
            this.forceUpdate();
        });
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
    waitForVideoJs() {
        if (window.videojs) {
            this.initPlayer();
        } else {
            setTimeout(this.waitForVideoJs.bind(this), 500);
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
        this.player = window.videojs(this.props.playerId + "_html5_api");
        var that = this;
        this.player.ready(function () {
            that.setState({ready: true, src: that.getPlayer().src()});
            that.addControls();
            that.setItemTime();
            if (that.state.readyCallback){
                that.state.readyCallback();
            }
        });
    }

    setItemTime(){
        this.getTotalTime().innerHTML = this.context.store.getState().itemLength;
    }

    getClassName() {
        let className = 'player-wrapper';
        className += (this.state.isHidden || this.context.store.getState().startStatus !== ControlsStartStatus.ACTIVE) ?
            ' hidden' : '';
        className += this.context.store.getState().inExtend ? ' show-progress-bar' : ' show-item-dots';
        return className;
    }

    getPlayer() {
        return this.player;
    }
    
    getPlayerMediaElement() {
        return this.getPlayer().tech_.el_;
    }
    
    getVideoProps(){
        const INVALID_VIDEO_PROPS = ["class", "playerId", "contentUrl", "eventHandler",
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
            <div className={this.getClassName()}  ref="touchScreen">
                <video ref="player"
                       className="player brightcove-player"
                       id={this.props.playerId}
                       playsInline
                       data-embed="default"
                       data-application-id
                       crossOrigin="anonymous"
                       preload="metadata"
                    {...this.getVideoProps()}>
                </video>
            </div>
        );
    }

    /** ****************************/

    pause() {
        this.getPlayer().pause();
    }

    play() {
        if (this.context.store.getState().startStatus === ControlsStartStatus.PENDING){
            if (isIphone()){
                return Promise.reject("NotAllowedError");
            }
            else {
                return new Promise((resolve, reject) => {
                    function gotPlayingEvent() {
                        this.getPlayer().off("play", gotPlayingEvent.bind(this));
                        return resolve();
                    }
                    setTimeout(() => {
                        return reject("NotAllowedError");
                    }, 100);
                    this.getPlayer().on('play', gotPlayingEvent.bind(this));
                    this.getPlayer().play();
                });
            }
        }
        this.getPlayer().play();
        return Promise.resolve();
    }

    show() {
        this.setState({ isHidden: false });
    }

    hide() {
        this.setState({ isHidden: true });
    }

    setSrc(src) {
        if (src !== this.getSrc()) {
            const player = this.getPlayer();
            player.catalog.getVideo(src, function (error, video) {
                console.log(video);
                player.catalog.load(video);
            });
        }
    }

    getSrc() {
        return this.refs.player.getAttribute('data-video-id')
    }

    load() {
        this.getPlayer().load();
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
        this.getPlayer().on('timeupdate', listener, false);
    }

    removeTimeUpdateEvent(listener) {
        this.getPlayer().off('timeupdate', listener);
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
    className: PropTypes.string,
    account: PropTypes.string
};

BrightCovePlayer.contextTypes = {
    store: React.PropTypes.object
};

export default BrightCovePlayer;
