import React, { PropTypes } from 'react';
import Hammer from '../../utils/hammer.min';
import ReactDOM from 'react-dom';

var Controls = React.createClass({
  componentDidMount(){
    this.gestureListener = new Hammer(ReactDOM.findDOMNode(this));
    console.log("setting listener!!!!!!!!!!!!!!!");
    this.gestureListener.on("swipeleft swiperight", function(ev) {
      console.log(ev.type +" gesture detected.");
    });
  },
  eventHandler(event){
    this.props.stateMachine.eventHandler(event.target.id);
  },
  render(){
    return (
      <div className="controls playerHolder">
        <img src="images/logo.png" className="controler" id="extend" onClick={this.eventHandler}/>
          <span>
            <button id="play" onClick={this.eventHandler}>Play</button>
          </span>
          <span>
            <button id="pause" onClick={this.eventHandler}>Pause</button>
          </span>
          <span>
            <button id="next" onClick={this.eventHandler}>next</button>
          </span>
          <span>
            <button id="previous" onClick={this.eventHandler}>previous</button>
          </span>
      </div>
    );
  }
});

export default Controls;
