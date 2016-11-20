/**
 * Created by user on 9/7/2016.
 */
import React, { PropTypes } from 'react';
import VideoElement from '../VideoElement/VideoElement';
import ElasticMediaSdk from '../ElasticMediaSdk/ElasticMediaSdk';

const Html5Demo = React.createClass({
    render() {
        const players = new Array(this.props.numOfPlayers).fill(0);
        return (
            <ElasticMediaSdk>
                {
                    players.map((elm, i) => {
                        return (
                            <VideoElement key={`player${i}`} playerId={`player${i}`} />
                        );
                    })
                }
            </ElasticMediaSdk>
        );
    }
});

export default Html5Demo;
