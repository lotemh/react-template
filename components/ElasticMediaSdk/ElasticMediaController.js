import React, {PropTypes} from "react";
import ReactDOM from 'react-dom';
import ElasticMediaSdk from "./ElasticMediaSdk";
const screenfull = require('screenfull');

const ElasticMediaController = React.createClass({
    propTypes: {
        contentUrl: PropTypes.string,
        publisherId: PropTypes.string.isRequired,
        episodeId: PropTypes.string.isRequired
    },
    contextTypes: {
        store: React.PropTypes.object
    },
    componentWillMount() {
        let metadata,
            that = this;
        this.state = {};
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if (xmlhttp.status == 200) {
                    console.log("got metadata!");
                    if (that.props["originalPlayerId"]) {
                        //hideVjsControlsBar(that.props["originalPlayerId"]);
                    }
                    try {
                        metadata = JSON.parse(xmlhttp.responseText);
                        if (metadata.segments.root.src === undefined){
                            that.setState({contentUrl: that.props.contentUrl});
                        }
                        that.setState({metadata: metadata});
                    } catch(e) {
                        console.log(e);
                    }
                }
                else {
                    console.log("got " + xmlhttp.status);
                }
            }
        };
        xmlhttp.open("GET", MINI_CMS_BASE_URL + this.props.publisherId + '/metadata?episodeId=' + this.props.episodeId, true);
        xmlhttp.send();
    },

    componentDidMount() {
        this.unsubscribe = this.context.store.subscribe(() => {
            this.forceUpdate();
        })
    },
    componentDidUpdate() {
        let screen = ReactDOM.findDOMNode(this.refs.playerContainer);
        if (screenfull.enabled && 
            ((!screenfull.isFullscreen && this.context.store.getState().isFullscreen) || 
            (screenfull.isFullscreen && !this.context.store.getState().isFullscreen))) {
            screenfull.toggle(screen);
        }
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
    eventHandler(event, props){
        this.refs.sdk.eventHandler(event, props);
    },
    render() {
        return (
            <div>
                { this.state.metadata ?
                <div className="player-container" ref="playerContainer">
                    <ElasticMediaSdk ref="sdk"
                                     contentUrl = {this.state.contentUrl}
                        publisherId={this.props.publisherId}
                        metadata={this.state.metadata}
                        episodeId={this.props.episodeId}>
                        {this.props.videoElements}
                    </ElasticMediaSdk>
                    {React.createElement(this.props.controls, {eventHandler:this.eventHandler, ref:"controls"})}
                </div>
                : null}
            </div>
        );
    }
});

function hideVjsControlsBar(id) {
    const vjsControlBar = document.querySelector('#' + id +' .vjs-control-bar');
    if (vjsControlBar) {
        vjsControlBar.style.display = 'none';
    }
}

export default ElasticMediaController;
