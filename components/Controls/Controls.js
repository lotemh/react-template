import React, { PropTypes } from 'react';

var Controls = React.createClass({
  play(){
    this.props.stateMachine.play();
  },
  next(){
    this.props.stateMachine.next();
  },
  pause(){
    this.props.stateMachine.pause();
  },
  previous(){
    this.props.stateMachine.previous();
  },
  extend(){
    this.props.stateMachine.onExtendClick();
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
            <button id="next" onClick={this.next}>next</button>
          </span>
          <span>
            <button id="prev" onClick={this.previous}>previous</button>
          </span>
          <span>
            <button onClick={this.extend}>extend</button>
          </span>
      </div>
    );
  }
});

export default Controls;
