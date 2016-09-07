import React, { PropTypes } from 'react';
import Hammer from '../../utils/hammer.min';
import ReactDOM from 'react-dom';

var Controls = React.createClass({
  componentWillMount(){
    this.state = {isPlaying: true};
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
  getClassName(name){
    var className = 'controller';
    if (name === "play") {
      className += this.state.isPlaying ? ' hidden' : '';
    } else {
      className += !this.state.isPlaying ? ' hidden' : '';
    }
    return className;

  },
  eventHandler(event){
    if (event.target.id === "play" || event.target.id === "pause") {
      this.setState({isPlaying: !this.state.isPlaying});
    }
    this.props.stateMachine.eventHandler(event.target.id);
  },
  render(){
    return (
      <div className="controls playerHolder">
        <img src="images/logo.png" className="controller" id="extend" onClick={this.eventHandler}/>
        <img src="images/play.png" className={this.getClassName("play")} id="play" onClick={this.eventHandler}/>
        <img src="images/pause.png" className={this.getClassName("pause")} id="pause" onClick={this.eventHandler}/>
        <span id="dots">
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
