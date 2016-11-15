import React, { PropTypes } from 'react';
import Hammer from 'hammerjs';
import ReactDOM from 'react-dom';

const SWIPES = {
    LEFT: 'swipeleft',
    RIGHT: 'swiperight'
};
const TouchScreen = React.createClass({
    propTypes: {
        eventHandler: PropTypes.func.isRequired
    },
    contextTypes: {
        store: React.PropTypes.object
    },
    componentDidMount() {
        this.gestureListener = new Hammer(ReactDOM.findDOMNode(this.refs.touchScreen));
        this.gestureListener.on(SWIPES.LEFT, this.swipeLeft);
        this.gestureListener.on(SWIPES.RIGHT, this.swipeRight);
    },
    swipeLeft() {
        this.context.store.dispatch({type: "EVENT_HANDLER", actionName: 'next'});
        this.props.eventHandler('next');
    },
    swipeRight(){
        this.context.store.dispatch({type: "EVENT_HANDLER", actionName: 'previous'});
        this.props.eventHandler('previous');
    },

    render(){
        const { store } = this.context;
        return (
            <div className="controlsTouchScreen" ref="touchScreen"
                 style={store.getState().pendingFirstPlayClick ? {pointerEvents: 'none'} : {}}></div>
        );
    }
});

export default TouchScreen;
