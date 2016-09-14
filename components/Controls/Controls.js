import React, { PropTypes } from 'react';
import Hammer from '../../utils/hammer.min';
import ReactDOM from 'react-dom';

var Controls = React.createClass({

  componentWillMount(){
    this.state = {isPlaying: false, pendingPlay: true};
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
    } else {
      className += !this.state.isPlaying ? ' hidden' : '';
    }
    return className;
  },
  /*
  getImgSource(name){
    console.log("in get img source!!!");
    if (name === "play") {
      if (this.state.isPlaying) {
        return "images/pause.png";
      } else {
        return "images/play.png";
      }
    }
  },
  */
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
  },
  render(){
    let newStyle = calcStyle();

    let dotsStyle = {
      left: ((newStyle.width/2) - 125/2)
    };
    if (this.state.pendingPlay) {
      newStyle['pointer-events'] = 'none';
    }
    return (
      <div className="controls playerHolder2" style={newStyle}>
        <img src="images/logo.png" className="controller" id="extend" onClick={this.eventHandler}/>
        <img src="images/play.png" className={this.getClassName("play")} id="play" onClick={this.eventHandler}/>
        <img src="images/pause.png" className={this.getClassName("pause")} id="pause" onClick={this.eventHandler}/>
        <span id="dots" style={dotsStyle}>
          <img src="images/dot.png" className="dot" id="dot1"/>
          <img src="images/dot.png" className="dot" id="dot2"/>
          <img src="images/dot.png" className="dot" id="dot3"/>
          <img src="images/dot.png" className="dot" id="dot4"/>
          <img src="images/dot.png" className="dot" id="dot5"/>
        </span>
      </div>
    );
  }
});

export default Controls;
