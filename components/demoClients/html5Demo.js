/**
 * Created by user on 9/7/2016.
 */
import React, { PropTypes } from 'react';
import VideoElement from '../VideoElement/VideoElement';
import ElasticMediaController from '../ElasticMediaSdk/ElasticMediaController';
import Controls from "../Controls/Controls";

const numOfPlayers = 2;

const Html5Demo = React.createClass({
    propTypes: {
        'data-video-url': PropTypes.string.isRequired
    },
    render() {
        const players = new Array(numOfPlayers).fill(0);
        let VideoElements = players.map((elm, i) => {
            let id;
            return (
                <VideoElement key={`player${i}`} playerId={`player${i}`} {...this.props}/>
            );
        })
        return (
            <div>
                <ElasticMediaController 
                        publisherId={this.props.publisherId}
                        videoElements={VideoElements}
                        controls={Controls}
                        episodeId={this.props["data-video-id"]}/>
            </div>
        );
    }
});

export default Html5Demo;
