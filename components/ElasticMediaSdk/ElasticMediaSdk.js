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
        this.stateMachine = new StateMachine(store);
    },

    componentDidMount() {
        const players = Object.values(this.refs).filter(ref => !!ref.props.playerId);
        const stateMachine = this.stateMachine;
        var waitForPlayersReady = this.stateMachine.setPlayers(players);
        $.ajax({
            url: MINI_CMS_BASE_URL + this.props.publisherId + '/metadata?episodeId=' + this.props.episodeId,
            type: 'GET',
            dataType: "json",
            success: (metadata) => {
                stateMachine.setSegments(metadata.segments);
                const programId = metadata.programId || '1234';
                this.context.store.dispatch({type: 'SET_DATA', programId: programId});
                var contentUrl = this.props.contentUrl;
                stateMachine.setContentUrl(contentUrl);
                waitForPlayersReady.then(()=> {
                    stateMachine.start();
                })
            },
            error: function(xhr, status, err){
                //todo: implement fallback - play regular video
                console.error("Fail to get metadata", status, err.toString());
            }.bind(this)
        });
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
