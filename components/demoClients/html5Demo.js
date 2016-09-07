/**
 * Created by user on 9/7/2016.
 */
import React, { PropTypes } from 'react';
import VideoElement from '../VideoElement/VideoElement';
import ElasticPlayer from '../../components/ElasticPlayer';

var Html5Demo = React.createClass({
  render(){
    var players = new Array(this.props.numOfPlayers).fill(0);
    return (
      <ElasticPlayer numOfPlayers={3}>
          {
            players.map(function(elm, i){
              return (
                <VideoElement key={"player" + i} playerId={"player" + i}/>
              )
            })
          }
      </ElasticPlayer>
    );
  }
});

export default Html5Demo;
