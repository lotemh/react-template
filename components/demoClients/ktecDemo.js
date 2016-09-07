/**
 * Created by user on 9/7/2016.
 */
import $ from 'jquery';
import React, { PropTypes } from 'react';
import StateMachine from "../StateMachine/StateMachine";
import VideoElement from '../VideoElement/VideoElement'
import brightCovePlayer from '../VideoElement/brightCovePlayer'
import Controls from '../Controls/Controls';

var Ktec = React.createClass({
  render(){
    var players = new Array(this.props.numOfPlayers).fill(0);
    return (
      <ElasticPlayer numOfPlayers={3}>
          {
            players.map(function(elm, i){
              return (
                <VideoElement key={"player" + i} ref={"player" + i} playerId={"player" + i}/>
              )
            })
          }
      </ElasticPlayer>
    );
  }
});

export default Ktec;
