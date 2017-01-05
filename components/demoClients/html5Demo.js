/**
 * Created by user on 9/7/2016.
 */
import React, { PropTypes } from 'react';
import VideoElement from '../VideoElement/VideoElement';
import ElasticMediaController from '../ElasticMediaSdk/ElasticMediaController';

const numOfPlayers = 2;

const Html5Demo = React.createClass({
    propTypes: {
        'data-video-url': PropTypes.string.isRequired
    },
    render() {
        const players = new Array(numOfPlayers).fill(0);
        return (
            <div id="elasticPlayer">
                <ElasticMediaController 
                        publisherId={this.props.publisherId}
                        episodeId={this.props["data-video-id"]}>
                    {
                        players.map((elm, i) => {
                            let id;
                            return (
                                <VideoElement key={`player${i}`} playerId={`player${i}`} {...this.props}/>
                            );
                        })
                    }
                </ElasticMediaController>
            </div>
        );
    }
});

export default Html5Demo;
