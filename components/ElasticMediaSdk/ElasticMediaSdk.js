import React, { PropTypes } from 'react';
import StateMachine from '../StateMachine/StateMachine';

const ElasticMediaSdk = React.createClass({
    propTypes: {
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
        stateMachine.setSegments(this.props.metadata.segments);
        if (this.props.metadata.programId) {
            this.context.store.dispatch({type: 'SET_DATA', programId: this.props.metadata.programId});
        }
        waitForPlayersReady.then(()=> {
            stateMachine.start();
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
