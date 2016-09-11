import $ from 'jquery';
import React, { PropTypes } from 'react';
import StateMachine from "../StateMachine/StateMachine";
import VideoElement from '../VideoElement/VideoElement'
import Controls from '../Controls/Controls';

var ElasticPlayer = React.createClass({
  componentWillMount(){
    this.state = {
      width: 480,
      height: 237
    };
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
      // stateMachine.setContentUrl("https://s3.eu-central-1.amazonaws.com/phase1-episodes/mm080616.mp4");
      stateMachine.setContentUrl("https://s3.eu-central-1.amazonaws.com/phase1-episodes/debug.mp4");
      stateMachine.setSegments(metadata.segments);
      stateMachine.setControls(this.refs.controls);
      stateMachine.start();
    });
  },
  updateStyle(style) {
    this.setState({
      width: style.width,
      height: style.height
    });
  },
  render(){
    var players = new Array(this.props.numOfPlayers).fill(0);
    var updateStyle = this.updateStyle;
    return (
      <div className="player-container">
        <div className="screen playerHolder">
          {
            players.map((elm, i) => {
              return (
                <VideoElement updateStyle={updateStyle} key={"player" + i} ref={"player" + i} playerId={"player" + i}/>
              )
            })
          }
        </div>
        <Controls stateMachine={this.stateMachine} style={this.state} ref="controls"/>
      </div>
    );
  }
});

export default ElasticPlayer;
