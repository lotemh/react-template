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
        this.state = this.calcWidthAndHeight();
    },

    componentDidMount() {
        this.context.store.subscribe(this.refs.controls.updateControl);
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
    eventHandler(event, props){
        this.refs.sdk.eventHandler(event, props);
    },
    render() {
        return (
            <div className="player-container" style={this.state}>
                <ElasticMediaSdk ref="sdk"
                                 contentUrl={this.props.contentUrl}
                                 publisherId={this.props.publisherId}
                                 episodeId={this.props.episodeId}>
                    {this.props.children}
                </ElasticMediaSdk>
                <Controls eventHandler={this.eventHandler} ref="controls"/>
            </div>
        );
    }
});

export default ElasticMediaController;
