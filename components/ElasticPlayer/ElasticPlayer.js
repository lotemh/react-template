import $ from 'jquery';
import React, { PropTypes } from 'react';
import StateMachine from "../StateMachine/StateMachine";
import VideoElement from '../VideoElement/VideoElement'

var ElasticPlayer = React.createClass({

  componentDidMount(){
    var players = [];
    for (var player in this.refs){
      players.push(this.refs[player]);
    }
    this.stateMachine = new StateMachine(players);
    var stateMachine = this.stateMachine;
    $.getJSON("metadataExample.json", function(metadata) {
      // stateMachine.setContentUrl("https://s3.eu-central-1.amazonaws.com/phase1-episodes/mm080616.mp4");
      stateMachine.setContentUrl("https://s3.eu-central-1.amazonaws.com/phase1-episodes/debug.mp4");
      stateMachine.setSegments(metadata.segments);
      stateMachine.start();
    });
  },
  play(){
    this.stateMachine.play();
  },
  next(){
    this.stateMachine.next();
  },
  pause(){
    this.stateMachine.pause();
  },
  previous(){
    this.stateMachine.previous();
  },
  extend(){
    this.stateMachine.onExtendClick();
  },
  render(){
    var players = new Array(this.props.numOfPlayers).fill(0);
    return (
      <div className="player-container">
        <div  className="screen">
          {
            players.map(function(elm, i){
              return (
                <VideoElement key={"player" + i} ref={"player" + i} playerId={"player" + i}/>
              )
            })
          }
        </div>
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
      </div>
    );
  }
});

export default ElasticPlayer;
