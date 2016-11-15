/**
 * Created by user on 9/7/2016.
 */
import React, { PropTypes } from 'react';
import BrightCovePlayer from '../VideoElement/brightCovePlayer';
import ElasticMediaController from '../ElasticMediaSdk/ElasticMediaController';

const numOfPlayers = 2;

const Brightcove = React.createClass({
    propTypes: {
        'data-elastic-media-account': PropTypes.string.isRequired,
        'data-video-id': PropTypes.string.isRequired
    },
    render() {
        const players = new Array(numOfPlayers).fill(0);
        return (
            <div id="elasticPlayer">
                <ElasticMediaController contentUrl={this.props["data-video-id"]}
                                 publisherId={this.props['data-elastic-media-account']}
                                 episodeId={this.props['data-video-id']}>
                    {
                        players.map((elm, i) => {
                            return (
                                <BrightCovePlayer key={`player${i}`} playerId={`player${i}`} {...this.props}/>
                            );
                        })
                    }
                </ElasticMediaController>
            </div>
        );
    }
});

export default Brightcove;
