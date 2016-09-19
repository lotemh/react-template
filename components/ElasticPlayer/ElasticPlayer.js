import $ from 'jquery';
import React, { PropTypes } from 'react';
import StateMachine from "../StateMachine/StateMachine";
import VideoElement from '../VideoElement/VideoElement'
import Controls from '../Controls/Controls';

var ElasticPlayer = React.createClass({
    componentWillMount(){
        let pendingFirstPlayClick = false;
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            pendingFirstPlayClick = true;
        }
        this.state = this.calcWidthAndHeight();
        this.stateMachine = new StateMachine(pendingFirstPlayClick);
    },
    componentDidMount(){
        var players = [];
        for (var player in this.refs){
            if (player.substring(0, 6) === "player") {
                players.push(this.refs[player]);
            }
        }
        this.stateMachine.setPlayers(players);
        var stateMachine = this.stateMachine;
        $.getJSON("metadataExample.json", (metadata) => {
            stateMachine.setSegments(metadata.segments);
            // stateMachine.setContentUrl("https://s3.eu-central-1.amazonaws.com/phase1-episodes/mm080616.mp4");
            stateMachine.setContentUrl("https://s3.eu-central-1.amazonaws.com/phase1-episodes/debug.mp4");
            stateMachine.setControls(this.refs.controls);
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
        var players = new Array(this.props.numOfPlayers).fill(0);
        var updateStyle = this.updateStyle;
        return (
            <div className="player-container" style={this.state}>
                <div className="screen playerHolder">
                    {
                        players.map((elm, i) => {
                            return (
                                <VideoElement
                                    updateStyle={updateStyle} key={"player" + i} ref={"player" + i} playerId={"player" + i}/>
                            )
                        })
                    }
                </div>
                <Controls stateMachine={this.stateMachine} ref="controls"/>
            </div>
        );
    }
});

export default ElasticPlayer;
