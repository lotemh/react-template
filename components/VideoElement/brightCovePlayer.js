/**
 * Created by user on 9/5/2016.
 */
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Extend from '../Controls/Extend';

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
            if (that.state.readyCallback){
                that.state.readyCallback();
            }
        });
    }

    getClassName() {
        let className = 'player-wrapper';
        className += this.state.isHidden ? ' hidden' : '';
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
        console.log("extend");
    }

    addControls(){
        const element = document.createElement('img');
        element.setAttribute('src', "images/extend.png");
        element.className  = 'vjs-control';
        element.id = 'extend1';
        element.addEventListener('click', this.onExtendClick.bind(this));
        this.getControlBar().appendChild(element);
    }

    getControlBar(){
        return document.querySelector('#'+this.props.playerId + ' .vjs-control-bar');
    }

    render() {
        return (
            <div className={this.getClassName()}>
                <video ref="player"
                       className="player brightcove-player"
                       id={this.props.playerId}
                       data-playsinline
                       data-webkit-playsinline
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
        return this.getPlayer().currentTime();
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
}

BrightCovePlayer.propTypes = {
    src: PropTypes.string,
    className: PropTypes.string,
    account: PropTypes.string
};

export default BrightCovePlayer;
