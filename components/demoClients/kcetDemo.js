/**
 * Created by user on 9/7/2016.
 */
import React, { PropTypes } from 'react';
import BrightCovePlayer from '../VideoElement/brightCovePlayer';
import ElasticMediaSdk from '../ElasticMediaSdk/ElasticMediaSdk';

const numOfPlayers = 2;

const Kcet = React.createClass({
    propTypes: {
        contentUrl: PropTypes.string
    },
    render() {
        const players = new Array(numOfPlayers).fill(0);
        return (
      <ElasticMediaSdk contentUrl={this.props.contentUrl}>
          {
            players.map((elm, i) => {
                return (
                <BrightCovePlayer key={`player${i}`} playerId={`player${i}`} {...this.props}/>
              );
            })
          }
      </ElasticMediaSdk>
    );
    }
});

export default Kcet;
