import React, { PropTypes } from 'react';

var Controls = React.createClass({
  eventHandler(event){
    this.props.stateMachine.eventHandler(event.target.id);
  },
  render(){
    return (
      <div className="controls">
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
          <span>
            <button id="extend" onClick={this.eventHandler}>extend</button>
          </span>
      </div>
    );
  }
});

export default Controls;
