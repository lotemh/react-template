import React, { PropTypes } from 'react';
import Hammer from 'hammerjs';
import ReactDOM from 'react-dom';

var Controls = React.createClass({
    getInitialState(){
        return {isPlaying: false, pendingPlay: true, numOfItems: 5};
    },
    componentDidMount(){
        this.gestureListener = new Hammer(ReactDOM.findDOMNode(this));
        this.gestureListener.on("swipeleft swiperight", this.swipeEvent.bind(this));
    },
    swipeEvent(event) {
        if (event.type === "swipeleft") {
            this.props.stateMachine.eventHandler("next");
        } else if (event.type === "swiperight") {
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
        } else if (name && name.length > 3 && name.substring(0, 3) === "dot") {
            className = 'dot';
            let num = parseInt(name.substring(3, 4), 10);
            let lastSectionNum = Math.floor(this.state.numOfItems / 5);
            let currentSection = Math.floor(this.state.itemNum / 5);
            if (currentSection === lastSectionNum) {
                let numOfDots = this.state.numOfItems % 5;
                if (num >= numOfDots) {
                    className += ' hidden';
                }
            }
        }
        return className;
    },

    getImgSource(dotNum){
        if (dotNum === (this.state.itemNum % 5)) {
            return "images/bluedot.png";
        } else {
            return "images/dot.png";
        }
    },
    seekChange(event) {
        this.props.stateMachine.seek(Math.floor(parseInt(event.target.value, 10) + this.state.itemStart / 1000));
    },
    eventHandler(event){
        if (event.target.id === "play" || event.target.id === "pause") {
            this.setState({isPlaying: !this.state.isPlaying});
        }
        this.props.stateMachine.eventHandler(event.target.id);
    },
    calcStyle() {
        let controlsStyle = {
                width: this.props.style.width,
                height: this.props.style.height
            },
            bestHeight,
            bestWidth,
            ratio = 1.77777778;
        if (controlsStyle.width < controlsStyle.height) {
            bestHeight = controlsStyle.width * (1 / ratio);
            controlsStyle.top = (controlsStyle.height - bestHeight) / 2;
            controlsStyle.height = bestHeight;
        } else {
            bestWidth = controlsStyle.height * ratio;
            controlsStyle.left = (controlsStyle.width - bestWidth) / 2;
            controlsStyle.width = bestWidth;
        }
        return controlsStyle;
    },
    calcSeek(controlsStyle) {
        let seek = {};
        seek.style = {
            left: 50,
            width: controlsStyle.width - 100
        };
        seek.min = 0;
        seek.max = 1;
        seek.value = 0;
        if (this.state.itemStart !== undefined && this.state.itemLength && this.state.itemTimeMs) {
            seek.min = 0;
            seek.max = this.state.itemLength / 1000;
            seek.value = (this.state.itemTimeMs - this.state.itemStart)/ 1000;
        }
        return seek;
    },
    render(){
        let controlsStyle = this.calcStyle();
        let seek = this.calcSeek(controlsStyle)
        let dotsStyle = {
            left: ((controlsStyle.width/2) - 125/2)
        };
        if (this.state.inExtend) {
            dotsStyle.display = 'none';
        } else {
            seek.style.display = 'none';
        }
        if (this.state.pendingPlay) {
            controlsStyle['pointerEvents'] = 'none';
        }
        return (
            <div className="controls playerHolder2" style={controlsStyle}>
                <img src="images/logo.png" className={this.getClassName("extend")} id="extend" onClick={this.eventHandler}/>
                <img src="images/play.png" className={this.getClassName("play")} id="play" onClick={this.eventHandler}/>
                <img src="images/pause.png" className={this.getClassName("pause")} id="pause" onClick={this.eventHandler}/>
                <span id="dots" style={dotsStyle}>
                    <img src={this.getImgSource(0)} className={this.getClassName("dot0")} id="dot1"/>
                    <img src={this.getImgSource(1)} className={this.getClassName("dot1")} id="dot2"/>
                    <img src={this.getImgSource(2)} className={this.getClassName("dot2")} id="dot3"/>
                    <img src={this.getImgSource(3)} className={this.getClassName("dot3")} id="dot4"/>
                    <img src={this.getImgSource(4)} className={this.getClassName("dot4")} id="dot5"/>
                </span>
                <input type="range"
                       style={seek.style}
                       min={seek.in}
                       max={seek.max}
                       value={seek.value}
                       id="seekBar"
                       onChange={this.seekChange}
                       className="controller"
                       step="any" />
            </div>
        );
    }
});

export default Controls;
