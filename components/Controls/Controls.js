import React, { PropTypes } from 'react';
import Hammer from 'hammerjs';
import ReactDOM from 'react-dom';
import SeekBar from './SeekBar';
import Dots from './Dots';
import Extend from './Extend';
import ControlsStartStatus from './ControlsStartStatus';

const SWIPES = {
    LEFT: 'swipeleft',
    RIGHT: 'swiperight'
};
const Controls = React.createClass({
    propTypes: {
        eventHandler: PropTypes.func.isRequired
    },
    getInitialState() {
        return {
            startStatus: ControlsStartStatus.PENDING,
            isPlaying: false,
            pendingPlay: true,
            numOfItems: 0,
            itemTimeMs: 0,
            itemNum: 0,
            itemStart: 0,
            itemLength: 0,
            inExtend: false
        };
    },
    componentDidMount() {
        this.gestureListener = new Hammer(ReactDOM.findDOMNode(this.refs.touchScreen));
        this.gestureListener.on(SWIPES.LEFT, this.swipeLeft);
        this.gestureListener.on(SWIPES.RIGHT, this.swipeRight);
    },
    swipeLeft() {
        this.props.eventHandler('next');
    },
    swipeRight(){
        this.props.eventHandler('previous');
    },

    updateControl(state) {
        this.setState(state);
    },

    getClassName(name) {
        let className = 'controller';
        if (name === 'extend' && this.state.inExtend) {
            className += ' hidden';
        }
        if (name === 'play') {
            className += ' play';
            className += this.state.isPlaying ? ' hidden' : '';
        } else if (name === 'pause') {
            className += !this.state.isPlaying ? ' hidden' : '';
        }
        return className;
    },
    togglePlay() {
        const isPlaying = !this.state.isPlaying;
        const action = isPlaying ? 'play' : 'pause';
        this.setState({ isPlaying });
        this.eventHandler(action);
    },
    startPlaying() {
        this.eventHandler('firstPlay');
    },
    eventHandler(action) {
        this.props.eventHandler(action);
    },
    getStartPlayingClass() {
        return this.state.startStatus === ControlsStartStatus.PENDING_USER_ACTION ? 'controller bigPlay' : 'hidden';
    },
    getControlsClassName() {
        return this.state.startStatus === ControlsStartStatus.ACTIVE ? 'controls' : 'hidden';
    },
    seekListener(currentTime){
        this.props.eventHandler('seek', {
            timestamp: currentTime
        });
    },
    render(){
        let timeElement = (this.state.inExtend) ?
            <SeekBar
                ref='seekBar'
                itemTimeMs={this.state.itemTimeMs}
                itemStart={this.state.itemStart}
                itemLength={this.state.itemLength}
                seekListener={this.seekListener}
            /> :
            <Dots
                itemNum={this.state.itemNum}
                numOfItems={this.state.numOfItems}
            />;
        return (
            <div>
                <div>
                    <img src={require("../../sdk/images/play.png")} className={this.getStartPlayingClass()} onClick={this.startPlaying} />
                </div>
                <div className={this.getControlsClassName()}>
                    <div className="controlsTouchScreen" ref="touchScreen"
                         style={this.state.pendingFirstPlayClick ? {pointerEvents: 'none'} : {}}></div>
                    <Extend isVisible={!this.state.inExtend} onClick={this.eventHandler.bind(this, "extend")}/>
                    <img src={require("../../sdk/images/play.png")} className={this.getClassName("play")} onClick={this.togglePlay}/>
                    <img src={require("../../sdk/images/pause.png")} className={this.getClassName("pause")} id="pause" onClick={this.togglePlay}/>
                    {timeElement}
                </div>
            </div>
        );
    }
});

export default Controls;
