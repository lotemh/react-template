/**
 * Created by user on 9/7/2016.
 */
import React, { PropTypes } from 'react';
import VideoElement from '../VideoElement/VideoElement'
import BrightCovePlayer from '../VideoElement/brightCovePlayer'
import Controls from '../Controls/Controls';
import ElasticMediaSdk from '../ElasticMediaSdk/ElasticMediaSdk'

var Kcet = React.createClass({
  render(){
    var players = new Array(this.props.numOfPlayers).fill(0);
    return (
      <ElasticMediaSdk>
          {
            players.map(function(elm, i){
              return (
                <BrightCovePlayer key={"player" + i} playerId={"player" + i}/>
              )
            })
          }
      </ElasticMediaSdk>
    );
  }
});

export default Kcet;
