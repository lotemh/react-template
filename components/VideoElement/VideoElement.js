import React, { PropTypes } from 'react';
import * as ReactDOM from 'react/lib/ReactDOM';

class VideoElement extends React.Component {

    constructor(props) {
        super(props);
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

    render() {
        return (
            <video ref={'video'}
                   className={this.getClassName()}
                   webkit-playsinline
                   playsinline
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

}

VideoElement.propTypes = {
    src: PropTypes.string,
    className: PropTypes.string
};

export default VideoElement;
