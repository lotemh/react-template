import $ from 'jquery';
import React, { PropTypes } from 'react';
import StateMachine from "../StateMachine/StateMachine";
import VideoElement from '../VideoElement/VideoElement'
import Controls from '../Controls/Controls';

var ElasticPlayer = React.createClass({

  componentWillMount(){
    this.stateMachine = new StateMachine();
  },

  componentDidMount(){
    var players = [];
    for (var player in this.refs){
      players.push(this.refs[player]);
    }
    this.stateMachine.setPlayers(players);
    var stateMachine = this.stateMachine;
    $.getJSON("metadataExample.json", function(metadata) {
      stateMachine.setSegments(metadata.segments);
      // stateMachine.setContentUrl("https://s3.eu-central-1.amazonaws.com/phase1-episodes/mm080616.mp4");
      stateMachine.setContentUrl("https://s3.eu-central-1.amazonaws.com/phase1-episodes/debug.mp4");
      stateMachine.start();
    });
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
        <Controls stateMachine={this.stateMachine}/>
      </div>
    );
  }
});

export default ElasticPlayer;
