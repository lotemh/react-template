/**
 * Created by user on 9/5/2016.
 */
import React, { PropTypes } from 'react';

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
        //todo: get the script from outside
        script.src = "//players.brightcove.net/5114477724001/Skx4vXu1lg_default/index.min.js";
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
           setTimeout(this.onReady.bind(this, callback), 600);
       }
    }

    initPlayer() {
        this.player = window.videojs(this.props.playerId + "_html5_api");
        var that = this;
        this.player.ready(function () {
            that.setState({ready: true, src: that.getPlayer().src()});
        });
    }

    getClassName() {
        let className = 'player';
        className += this.state.isHidden ? ' hidden' : '';
        return className;
    }

    getPlayer() {
        return this.player;
    }

    getVideoProps(){
        var videoProps = Object.assign({}, this.props);
        delete videoProps.class;
        delete videoProps.playerId;
        delete videoProps.contentUrl;
        delete videoProps.style;
        return videoProps;
    }

    render() {
        return (
            <div className={this.getClassName()}>
                <video ref="player"
                       id={this.props.playerId}
                       data-player="ryxQpOD6j"
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
