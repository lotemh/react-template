/**
 * Created by user on 9/5/2016.
 */
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Dots from '../Controls/Dots';
import BrightcoveSeekBar from '../Controls/BrightcoveSeekBar';
import ControlsStartStatus from '../Controls/ControlsStartStatus';

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
        this.waitForVideoJs();
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

    getVideoProps(){
        const INVALID_VIDEO_PROPS = ["class", "playerId", "contentUrl",
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
        console.log("in render with props", this.props);
        return (
            <div className={this.getClassName()}>
                <video ref="player"
                       className="player brightcove-player"
                       id={this.props.playerId}
                       playsInline
                       data-embed="default"
                       data-application-id
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
        return new Promise((resolve, reject) => {
            let returned = false;
            function gotPlayingEvent(event) {
                if (!returned) {
                    returned = true;
                    this.getPlayer().off("play", gotPlayingEvent.bind(this));
                    return resolve();
                }
            }
            setTimeout(() => {
                if (!returned) {
                    returned = true;
                    return reject("NotAllowedError");
                }
            }, 1000);
            this.getPlayer().on('play', gotPlayingEvent.bind(this));
            this.getPlayer().play();
        });
    }

    show() {
        this.setState({ isHidden: false });
    }

    hide() {
        this.setState({ isHidden: true });
    }

    setSrc(src) {
        //todo - at the moment the src is already set by brightcove
    }

    getSrc() {
        return this.getPlayer().src();
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
