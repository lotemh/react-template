import $ from 'jquery';
import React, { PropTypes } from 'react';
import StateMachine from '../StateMachine/StateMachine';

const ElasticMediaSdk = React.createClass({
    propTypes: {
        contentUrl: PropTypes.string,
        publisherId: PropTypes.string.isRequired,
        episodeId: PropTypes.string.isRequired,
        updateView: PropTypes.func.isRequired
    },

    componentWillMount() {
        let pendingFirstPlayClick = false;
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            pendingFirstPlayClick = true;
        }
        this.stateMachine = new StateMachine(pendingFirstPlayClick);
    },

    componentDidMount() {
        const players = Object.values(this.refs).filter(ref => !!ref.props.playerId);
        var waitForPlayersReady = this.stateMachine.setPlayers(players);
        const stateMachine = this.stateMachine;
        $.getJSON('metadataExample.json', (metadata) => {
            stateMachine.setSegments(metadata.segments);
            var contentUrl = this.props.contentUrl;
            stateMachine.setContentUrl(contentUrl);
            stateMachine.addUpdateViewListener(this.props.updateView);
            waitForPlayersReady.then(()=> {
                stateMachine.start();
            })
        });
        // todo: get metadata from cms server
        // $.ajax({
        //     url: 'http://mini-cms.elasticmedia.io/em/v2/' + this.props.publisherId + '/getMetadata?videoId=' + this.props.episodeId,
        //     type: 'GET',
        //     success: (metadata) => {
        //         stateMachine.setSegments(metadata.segments);
        //         var contentUrl = this.props.contentUrl;
        //         stateMachine.setContentUrl(contentUrl);
        //         stateMachine.addUpdateViewListener(controls);
        //         waitForPlayersReady.then(()=> {
        //             stateMachine.start();
        //         })
        //     },
        // error: function(xhr, status, err){
        //     console.error("Fail to get metadata", status, err.toString());
        // }.bind(this)
        // });
    },

    eventHandler(event){
        this.stateMachine.eventHandler(event);
    },
    render() {
        return (
            <div className="screen playerHolder">
                {React.Children.map(this.props.children, (child) => {
                    return React.cloneElement(child, {
                        ref: child.props.playerId
                    });
                })}
            </div>
        );
    }
});

export default ElasticMediaSdk;
