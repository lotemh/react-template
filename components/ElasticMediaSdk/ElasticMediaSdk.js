import $ from 'jquery';
import React, { PropTypes } from 'react';
import StateMachine from "../StateMachine/StateMachine";
import Controls from '../Controls/Controls';

var ElasticMediaSdk = React.createClass({

    componentWillMount(){
        let pendingFirstPlayClick = false;
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            pendingFirstPlayClick = true;
        }
        this.state = this.calcWidthAndHeight();
        this.stateMachine = new StateMachine(pendingFirstPlayClick);
    },

    componentDidMount(){
        var players = Object.values(this.refs).filter(ref=> !!ref.props.playerId);
        this.stateMachine.setPlayers(players);
        var stateMachine = this.stateMachine;
        var controls = this.refs.controls;
        $.getJSON("metadataExample.json", function(metadata) {
            stateMachine.setSegments(metadata.segments);
            // stateMachine.setContentUrl("https://s3.eu-central-1.amazonaws.com/phase1-episodes/mm080616.mp4");
            stateMachine.setContentUrl("https://s3.eu-central-1.amazonaws.com/phase1-episodes/artbound.mp4");
            stateMachine.setControls(controls);
            stateMachine.start();
        });
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
            ratio = 1.77777778;//TODO get this value from source
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
    render(){
        return (
            <div className="player-container" style={this.state}>
                <div  className="screen playerHolder">
                    {React.Children.map(this.props.children, (child) => {
                        return React.cloneElement(child, {
                            ref: child.props.playerId
                        });
                    })}
                </div>
                <Controls stateMachine={this.stateMachine} ref="controls"/>
            </div>
        );
    }
});

export default ElasticMediaSdk;
