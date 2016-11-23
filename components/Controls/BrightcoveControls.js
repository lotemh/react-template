import React, { PropTypes } from 'react';
import ControlsStartStatus from './ControlsStartStatus';
import Extend from './Extend';

const Controls = React.createClass({
    propTypes: {
        eventHandler: PropTypes.func.isRequired
    },
    contextTypes: {
        store: React.PropTypes.object
    },
    componentDidMount(){
        this.unsubscribe = this.context.store.subscribe(() => {
            this.forceUpdate();
        })
    },

    componentWillUnmount(){
        this.unsubscribe();
    },

    startPlaying() {
        this.props.eventHandler("firstPlay");
    },
    eventHandler(action) {
        this.context.store.dispatch({type: "EVENT_HANDLER", actionName: action});
        this.props.eventHandler(action);
    },
    getStartPlayingClass() {
        return this.context.store.getState().startStatus === ControlsStartStatus.PENDING_USER_ACTION ?
            'controller bigPlay' : 'hidden';
    },
    getControlsClassName() {
        return this.context.store.getState().startStatus === ControlsStartStatus.ACTIVE ? 'controls' : 'hidden';
    },
    seekListener(currentTime){
        this.props.eventHandler('seek', {
            timestamp: currentTime
        });
    },
    render(){
        const { store } = this.context;
        return (
            <div>
                <div>
                    <img src="images/play.png" className={this.getStartPlayingClass()} onClick={this.startPlaying} />
                </div>
                <div className={this.getControlsClassName()}>
                    <Extend isVisible={!store.getState().inExtend} onClick={this.eventHandler.bind(this, "extend")}/>
                </div>
            </div>
        );
    }
});

export default Controls;
