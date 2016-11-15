import React, { PropTypes } from 'react';
import TouchScreen from './TouchScreen';
import ControlsStartStatus from './ControlsStartStatus';
import Extend from './Extend';

const Controls = React.createClass({
    propTypes: {
        eventHandler: PropTypes.func.isRequired
    },
    contextTypes: {
        store: React.PropTypes.object
    },
    componentDidMount() {
        // todo: try to subscribe to the store
        // this.store.subscribe(()=>{
        //     this.forceUpdate();
        // })
    },

    updateControl() {
        this.forceUpdate();
    },

    getClassName(name) {
        let className = 'controller';
        if (name === 'extend' && this.context.store.getState().inExtend) {
            className += ' hidden';
        }
        if (name === 'play') {
            className += ' play';
            className += this.context.store.getState() ? ' hidden' : '';
        } else if (name === 'pause') {
            className += !this.context.store.getState() ? ' hidden' : '';
        }
        return className;
    },
    startPlaying() {
        this.props.eventHandler(action, ()=>{
            this.context.store.dispatch({type: "EVENT_HANDLER", actionName: 'firstPlay'});
        });
    },
    eventHandler(action) {
        this.context.store.dispatch({type: "EVENT_HANDLER", actionName: action});
        this.props.eventHandler(action);
    },
    getStartPlayingClass() {
        return this.context.store.getState().startStatus === ControlsStartStatus.PENDING_USER_ACTION ? 'controller bigPlay' : 'hidden';
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
                    <TouchScreen eventHandler={this.eventHandler}/>
                    <Extend isVisible={!store.getState().inExtend} onClick={this.eventHandler.bind(this, "extend")}/>
                </div>
            </div>
        );
    }
});

export default Controls;
