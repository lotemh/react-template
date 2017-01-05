import React, {PropTypes} from "react";
import ElasticMediaSdk from "./ElasticMediaSdk";
import Controls from "../Controls/BrightcoveControls";

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
        this.state = this.calcWidthAndHeight();
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if (xmlhttp.status == 200) {
                    console.log("got metadata!");
                    try {
                        metadata = JSON.parse(xmlhttp.responseText);
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
        window.addEventListener('resize', this.handleResize);
        this.unsubscribe = this.context.store.subscribe(() => {
            this.forceUpdate();
        })
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
    eventHandler(event, props){
        this.refs.sdk.eventHandler(event, props);
    },
    getClassName() {
        if (this.context.store.getState().isFullscreen){
            return 'player-container-full-screen';
        } else {
            return 'player-container';
        }
    },
    render() {
        return (
            <div>
                { this.state.metadata ?
                <div className={this.getClassName()} style={this.state}>
                    <ElasticMediaSdk ref="sdk"
                        publisherId={this.props.publisherId}
                        metadata={this.state.metadata}
                        episodeId={this.props.episodeId}>
                                    {this.props.children}
                    </ElasticMediaSdk>
                    <Controls eventHandler={this.eventHandler} ref="controls"/>
                </div>
                : null}
            </div>
        );
    }
});

export default ElasticMediaController;
