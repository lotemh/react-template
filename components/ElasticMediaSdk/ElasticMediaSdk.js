import $ from 'jquery';
import React, { PropTypes } from 'react';
import StateMachine from '../StateMachine/StateMachine';
import Controls from '../Controls/Controls';

const ElasticMediaSdk = React.createClass({
    propTypes: {
        contentUrl: PropTypes.string,
        publisherId: PropTypes.string.isRequired,
        episodeId: PropTypes.string.isRequired
    },

    componentWillMount() {
        let pendingFirstPlayClick = false;
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            pendingFirstPlayClick = true;
        }
        this.state = this.calcWidthAndHeight();
        this.stateMachine = new StateMachine(pendingFirstPlayClick);
    },

    componentDidMount() {
        const players = Object.values(this.refs).filter(ref => !!ref.props.playerId);
        var waitForPlayersReady = this.stateMachine.setPlayers(players);
        const stateMachine = this.stateMachine;
        const controls = this.refs.controls;
        $.getJSON('metadataExample.json', (metadata) => {
            stateMachine.setSegments(metadata.segments);
            var contentUrl = this.props.contentUrl;
            stateMachine.setContentUrl(contentUrl);
            stateMachine.setControls(controls);
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
        //         stateMachine.setControls(controls);
        //         waitForPlayersReady.then(()=> {
        //             stateMachine.start();
        //         })
        //     },
        // error: function(xhr, status, err){
        //     console.error("Fail to get metadata", status, err.toString());
        // }.bind(this)
        // });
        window.addEventListener('resize', this.handleResize);
    },
    calcWidthAndHeight() {
        let result = {
                width: window.innerWidth,
                height: window.innerHeight,
                left: 0,
                top: 0
            },
            bestWidth,
            bestHeight,
            ratio = 1.77777778;// TODO get this value from source
        if (result.width < result.height || result.height * ratio > result.width) {
            bestHeight = result.width * (1 / ratio);
            result.top = (result.height - bestHeight) / 2;
            result.height = bestHeight;
        } else {
            bestWidth = result.height * ratio;
            result.left = (result.width - bestWidth) / 2;
            result.width = bestWidth;
        }
        return result;
    },
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    },
    handleResize() {
        this.setState(this.calcWidthAndHeight());
    },
    render() {
        return (
            <div className="player-container" style={this.state}>
                <div className="screen playerHolder">
                    {React.Children.map(this.props.children, (child) => {
                        return React.cloneElement(child, {
                            ref: child.props.playerId
                        });
                    })}
                </div>
                <Controls eventHandler={this.stateMachine.eventHandler.bind(this.stateMachine)} ref="controls"/>
            </div>
        );
    }
});

export default ElasticMediaSdk;
