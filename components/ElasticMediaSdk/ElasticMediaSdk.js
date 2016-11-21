import $ from 'jquery';
import React, { PropTypes } from 'react';
import StateMachine from '../StateMachine/StateMachine';

const ElasticMediaSdk = React.createClass({
    propTypes: {
        contentUrl: PropTypes.string,
        publisherId: PropTypes.string.isRequired,
        episodeId: PropTypes.string.isRequired
    },
    contextTypes: {
        store: React.PropTypes.object
    },
    componentWillMount() {
        const {store} = this.context;
        let pendingFirstPlayClick = false;
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            pendingFirstPlayClick = true;
        }
        store.dispatch({type: "SET_PENDING_FIRST_PLAY", pendingFirstPlayClick: pendingFirstPlayClick});
        this.stateMachine = new StateMachine(store);
    },

    componentDidMount() {
        const players = Object.values(this.refs).filter(ref => !!ref.props.playerId);
        var waitForPlayersReady = this.stateMachine.setPlayers(players);
        const stateMachine = this.stateMachine;
        $.getJSON('metadataExample.json', (metadata) => {
            stateMachine.setSegments(metadata.segments);
            var contentUrl = this.props.contentUrl;
            stateMachine.setContentUrl(contentUrl);
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

    eventHandler(event, params){
        this.stateMachine.eventHandler(event, params);
    },
    render() {
        return (
            <div className="screen playerHolder">
                {React.Children.map(this.props.children, (child) => {
                    return React.cloneElement(child, {
                        ref: child.props.playerId,
                        eventHandler: this.eventHandler
                    });
                })}
            </div>
        );
    }
});

export default ElasticMediaSdk;
