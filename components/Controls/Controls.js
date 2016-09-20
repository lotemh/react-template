import React, { PropTypes } from 'react';
import Hammer from 'hammerjs';
import ReactDOM from 'react-dom';
import SeekBar from './SeekBar';
import Dots from './Dots';

let SWIPES = {
    LEFT: "swipeleft",
    RIGHT: "swiperight"
};
var Controls = React.createClass({
    getInitialState(){
        return {
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
            className += this.state.isPlaying ? ' hidden' : '';
        } else if (name === "pause") {
            className += !this.state.isPlaying ? ' hidden' : '';
        }
        return className;
    },
    togglePlay(event){
        this.setState({isPlaying: !this.state.isPlaying});
        this.eventHandler(event);
    },
    eventHandler(event){
        this.props.stateMachine.eventHandler(event.target.id);
    },
    render(){
        let pendingFirstPlayClickStyle = {};
        if (this.state.pendingFirstPlayClick) {
            pendingFirstPlayClickStyle['pointerEvents'] = 'none';
        }
        return (
            <div className="controls">
                <div className="controlsTouchScreen" style={pendingFirstPlayClickStyle} ref="touchScreen"></div>
                <img src="images/extend.png" className={this.getClassName("extend")} id="extend" onClick={this.eventHandler}/>
                <img src="images/play.png" className={this.getClassName("play")} id="play" onClick={this.togglePlay}/>
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
        );
    }
});

export default Controls;
