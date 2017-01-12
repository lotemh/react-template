/**
 * Created by user on 9/7/2016.
 */
import React, { PropTypes } from 'react';
import BrightCovePlayer from '../VideoElement/brightCovePlayer';
import ElasticMediaController from '../ElasticMediaSdk/ElasticMediaController';
import Controls from '../Controls/BrightcoveControls';

const numOfPlayers = 2;

const Brightcove = React.createClass({
    propTypes: {
        'data-video-id': PropTypes.string.isRequired
    },
    render() {
        const players = new Array(numOfPlayers).fill(0);
        let VideoElements = players.map((elm, i) => {
            let id;
            if (i === players.length - 1 && this.props["originalPlayerId"]) {
                id =  this.props["originalPlayerId"];
            } else {
                id = "player" + i;
            }
            return (
                <BrightCovePlayer key={`player${i}`} playerId={id} {...this.props}/>
            );
        })
        return (
            <div id="elasticPlayer">
                <ElasticMediaController
                    contentUrl = {this.props.contentUrl}
                    publisherId={this.props.publisherId}
                    videoElements={VideoElements}
                    controls={Controls}
                    originalPlayerId={this.props["originalPlayerId"]}
                    episodeId={this.props["data-video-id"]}/>
            </div>
        );
    }
});

export default Brightcove;
