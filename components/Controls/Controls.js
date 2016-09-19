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
        return {isPlaying: false, pendingPlay: true, numOfItems: 5};
    },
    componentDidMount(){
        this.gestureListener = new Hammer(ReactDOM.findDOMNode(this));
        this.gestureListener.on(SWIPES.LEFT + " " + SWIPES.RIGHT, this.swipeEvent);
    },
    swipeEvent(event) {
        if (event.type === SWIPES.LEFT) {
            this.props.stateMachine.eventHandler("next");
        } else if (event.type === SWIPES.RIGHT) {
            this.props.stateMachine.eventHandler("previous");
        }
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
        this.setState({isPlaying: !this.state.isPlaying}, () => {
            this.eventHandler(event);
        });
    },
    eventHandler(event){
        this.props.stateMachine.eventHandler(event.target.id);
    },
    render(){
        let style = {};
        if (this.state.pendingFirstPlayClick) {
            style['pointerEvents'] = 'none';
        }
        return (
            <div className="controls" style={style}>
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
