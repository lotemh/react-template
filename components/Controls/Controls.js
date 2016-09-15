import React, { PropTypes } from 'react';
import Hammer from '../../utils/hammer.min';
import ReactDOM from 'react-dom';

var Controls = React.createClass({

    componentWillMount(){
        this.state = {isPlaying: false, pendingPlay: true, numOfItems: 5};
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
    eventHandler(event){
        if (event.target.id === "play" || event.target.id === "pause") {
            this.setState({isPlaying: !this.state.isPlaying});
        }
        this.props.stateMachine.eventHandler(event.target.id);
    },
    calcStyle() {
        let newStyle = {
                width: this.props.style.width,
                height: this.props.style.height
            },
            bestHeight,
            bestWidth,
            ratio = 1.77777778;
        if (newStyle.width < newStyle.height) {
            bestHeight = newStyle.width * (1 / ratio);
            newStyle.top = (newStyle.height - bestHeight) / 2;
            newStyle.height = bestHeight;
        } else {
            bestWidth = newStyle.height * ratio;
            newStyle.left = (newStyle.width - bestWidth) / 2;
            newStyle.width = bestWidth;
        }
        return newStyle;
    },
    render(){
        let newStyle = this.calcStyle();

        let dotsStyle = {
            left: ((newStyle.width/2) - 125/2)
        };
        if (this.state.pendingPlay) {
            newStyle['pointerEvents'] = 'none';
        }
        return (
            <div className="controls playerHolder2" style={newStyle}>
                <img src="images/logo.png" className="controller" id="extend" onClick={this.eventHandler}/>
                <img src="images/play.png" className={this.getClassName("play")} id="play" onClick={this.eventHandler}/>
                <img src="images/pause.png" className={this.getClassName("pause")} id="pause" onClick={this.eventHandler}/>
                <span id="dots" style={dotsStyle}>
                    <img src={this.getImgSource(0)} className={this.getClassName("dot0")} id="dot1"/>
                    <img src={this.getImgSource(1)} className={this.getClassName("dot1")} id="dot2"/>
                    <img src={this.getImgSource(2)} className={this.getClassName("dot2")} id="dot3"/>
                    <img src={this.getImgSource(3)} className={this.getClassName("dot3")} id="dot4"/>
                    <img src={this.getImgSource(4)} className={this.getClassName("dot4")} id="dot5"/>
                </span>
                <input type="range" id="volumeControl" min="0" max="1" width="30" height="100" step="any" />
            </div>
        );
    }
});

export default Controls;
