import $ from 'jquery';
import React, { PropTypes } from 'react';
import StateMachine from "../StateMachine/StateMachine";
import Controls from '../Controls/Controls';

var ElasticMediaSdk = React.createClass({

  componentWillMount(){
    this.stateMachine = new StateMachine();
  },

  componentDidMount(){
    var players = Object.values(this.refs);
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
    return (
      <div className="player-container">
        <div className="screen">
          {React.Children.map(this.props.children, (child) => {
            return React.cloneElement(child, {
              ref: child.props.playerId
            });
          })}
        </div>
        <Controls stateMachine={this.stateMachine}/>
      </div>
    );
  }
});

export default ElasticMediaSdk;
