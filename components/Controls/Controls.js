import React, { PropTypes } from 'react';

var Controls = React.createClass({
  play(){
    this.props.stateMachine.play();
  },
  pause(){
    this.props.stateMachine.pause();
  },
  eventHandler(event){
    this.props.stateMachine.actionHandler(event.target.id);
  },
  render(){
    return (
      <div className="controls">
          <span>
            <button id="play" onClick={this.play}>Play</button>
          </span>
          <span>
            <button id="pause" onClick={this.pause}>Pause</button>
          </span>
          <span>
            <button id="next" onClick={this.eventHandler}>next</button>
          </span>
          <span>
            <button id="previous" onClick={this.eventHandler}>previous</button>
          </span>
          <span>
            <button id="extend" onClick={this.eventHandler}>extend</button>
          </span>
      </div>
    );
  }
});

export default Controls;
