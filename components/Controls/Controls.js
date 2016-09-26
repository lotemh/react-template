import React, { PropTypes } from 'react';
import Hammer from 'hammerjs';
import ReactDOM from 'react-dom';
import SeekBar from './SeekBar';
import Dots from './Dots';
import ControlsStartStatus from './ControlsStartStatus';

let SWIPES = {
    LEFT: "swipeleft",
    RIGHT: "swiperight"
};
var Controls = React.createClass({
    getInitialState(){
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
    componentDidMount(){
        this.gestureListener = new Hammer(ReactDOM.findDOMNode(this.refs.touchScreen));
        this.gestureListener.on(SWIPES.LEFT, this.swipeLeft);
        this.gestureListener.on(SWIPES.RIGHT, this.swipeRight);
    },
    swipeLeft(){
        this.props.stateMachine.eventHandler("next");
    },
    swipeRight(){
        this.props.stateMachine.eventHandler("previous");
    },

    updateControl(state) {
        this.setState(state);
    },

    getClassName(name){
        var className = 'controller';
        if (name === "extend" && this.state.inExtend) {
            className += ' hidden';
        }
        if (name === "play") {
            className += " play";
            className += this.state.isPlaying ? ' hidden' : '';
        } else if (name === "pause") {
            className += !this.state.isPlaying ? ' hidden' : '';
        }
        return className;
    },
    togglePlay(){
        var isPlaying = !this.state.isPlaying;
        var action = isPlaying ? "play" : "pause";
        this.setState({isPlaying: isPlaying, startedPlaying: true});
        this.eventHandler(action);
    },
    startPlaying(){
        this.setState({startStatus: ControlsStartStatus.ACTIVE, isPlaying: true});
        this.eventHandler("firstPlay");
    },
    eventHandler(action){
        this.props.stateMachine.eventHandler(action);
    },
    getStartPlayingClass(){
        return this.state.startStatus === ControlsStartStatus.PENDING_USER_ACTION ? "controller bigPlay" : 'hidden';
    },
    getControlsClassName(){
        return this.state.startStatus === ControlsStartStatus.ACTIVE ? "controls" : "hidden";
    },
    componentWillUpdate(){

    },
    render(){
        let pendingFirstPlayClickStyle = {};
        if (this.state.pendingFirstPlayClick) {
            pendingFirstPlayClickStyle['pointerEvents'] = 'none';
        }
        return (
            <div>
                <div>
                    <img src="images/play.png" className={this.getStartPlayingClass()} onClick={this.startPlaying}/>
                </div>
                <div className={this.getControlsClassName()}>
                    <div className="controlsTouchScreen" style={pendingFirstPlayClickStyle} ref="touchScreen"></div>
                    <img src="images/extend.png" className={this.getClassName("extend")} id="extend" onClick={this.eventHandler.bind(this, "extend")}/>
                    <img src="images/play.png" className={this.getClassName("play")} onClick={this.togglePlay}/>
                    <img src="images/pause.png" className={this.getClassName("pause")} id="pause" onClick={this.togglePlay}/>
                    <Dots
                        itemNum={this.state.itemNum}
                        numOfItems={this.state.numOfItems}
                        inExtend={this.state.inExtend}
                    />
                    <SeekBar
                        inExtend={this.state.inExtend}
                        itemTimeMs={this.state.itemTimeMs}
                        itemStart={this.state.itemStart}
                        itemLength={this.state.itemLength}
                        stateMachine={this.props.stateMachine}
                    />
                </div>
            </div>
        );
    }
});

export default Controls;
