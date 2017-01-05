/**
 * Created by user on 9/7/2016.
 */
import React, { PropTypes } from 'react';
import BrightCovePlayer from '../VideoElement/brightCovePlayer';
import ElasticMediaController from '../ElasticMediaSdk/ElasticMediaController';

const numOfPlayers = 2;

const Brightcove = React.createClass({
    propTypes: {
        'data-video-id': PropTypes.string.isRequired
    },
    render() {
        const players = new Array(numOfPlayers).fill(0);
        return (
            <div id="elasticPlayer">
                <ElasticMediaController
                    contentUrl = {this.props.contentUrl}
                    publisherId={this.props.publisherId}
                        episodeId={this.props["data-video-id"]}>
                    {
                        players.map((elm, i) => {
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
                    }
                </ElasticMediaController>
            </div>
        );
    }
});

export default Brightcove;
