import React, { PropTypes } from 'react';
import * as ReactDOM from 'react/lib/ReactDOM';

class VideoElement extends React.Component {

    constructor(props) {
        super(props);
        console.log("in video element constructor with props", props);
        this.state = {
            isHidden: true,
        };
    }

    getClassName() {
        let className = 'player';
        className += this.state.isHidden ? ' hidden' : '';
        return className;
    }

    getPlayer() {
        return ReactDOM.findDOMNode(this);
    }

    componentDidMount(){
        console.log("in player itself componentDidMount");
        this.setState({ready: true});
    }

    onReady(callback, attempt){
        console.log("in player itself .onReady", this.state);
        console.log("attempt is", attempt);
        if (this.state.ready === true){
            console.log("in player itself .onReady true");
            callback();
        } else if (attempt < 10) {
            console.log("in player itself .onReady else");
            if (!attempt) {
                attempt = 1;
            }
            setTimeout(this.onReady.bind(this, callback, attempt), 50);
        } else {
            console.log("in player itself .onReady super else!!!!!!!!!!!!!!!!!!");
            callback();
        }
    }

    render() {
        return (
            <video ref='video'
                   className={this.getClassName()}
                   playsInline
                   preload="none"
            >
                <source type="video/mp4" ref="source" src={this.props.src} />
            </video>
        );
    }

    /** ****************************/

    pause() {
        this.getPlayer().pause();
    }

    play() {
        console.log("in player play!!");
        return new Promise((resolve, reject) => {
            this.getPlayer().play().then(resolve, (error) => {
                console.log(`can't play video ${error}`);
                reject();
            });
        });
    }

    show() {
        this.setState({ isHidden: false });
    }

    hide() {
        this.setState({ isHidden: true });
    }

    setSrc(src) {
        this.refs.source.setAttribute('src', src);
    }
    getSrc() {
        return this.refs.source.getAttribute('src');
    }
    getPlayerMediaElement() {
        return this.refs.video;
        //this.videoElement = document.getElementById(this.props.playerId).getElementsByTagName('video')[0]
    }

    load() {
        this.getPlayer().load();
    }

    seek(timeInSeconds) {
        this.getPlayer().currentTime = timeInSeconds;
    }

    getCurrentTime() {
        return this.getPlayer().currentTime * 1000;
    }

    addLoadedDataEvent(listener) {
        this.getPlayer().addEventListener('canplay', listener);
    }
    
    addTimeUpdateEvent(listener) {
        this.getPlayer().addEventListener('timeupdate', listener);
    }
    removeTimeUpdateEvent(listener) {
        this.getPlayer().removeEventListener('timeupdate', listener);
    }

    removeEventListener(event, listener) {
        this.getPlayer().removeEventListener(event, listener);
    }
    addEventListener(event, listener) {
        this.getPlayer().addEventListener(event, listener);
    }
}

VideoElement.propTypes = {
    src: PropTypes.string,
    className: PropTypes.string
};

export default VideoElement;
