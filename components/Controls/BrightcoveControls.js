import React, { PropTypes } from 'react';
import ControlsStartStatus from './ControlsStartStatus';
import Extend from './Extend';
import TransitionEffect from '../transitionEffects/TransitionEffect';
import {isIphone} from '../utils/webUtils';

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

    getInitialState(){
        return {
            isAnimationRunning: false,
            teClass: ''
        }
    },

    componentWillUnmount(){
        this.unsubscribe();
    },

    startPlaying() {
        if (this.context.store.getState().startStatus === ControlsStartStatus.PENDING_USER_ACTION) {
            this.props.eventHandler("firstPlay");
        }
    },
    eventHandler(action) {
        this.props.eventHandler(action);
    },
    getStartPlayingClass() {
        return this.context.store.getState().startStatus !== ControlsStartStatus.ACTIVE ?
            'controller bigPlayWrapper' : 'hidden';
    },
    getControlsClassName() {
        if (this.context.store.getState().startStatus !== ControlsStartStatus.ACTIVE){
            return 'hidden';
        }
        let className =  'controls';
        if (this.state && this.state.teClass){
            className += ' ' + this.state.teClass;
        }
        return className;
    },
    seekListener(currentTime){
        this.props.eventHandler('seek', {
            timestamp: currentTime
        });
    },

    performTransitionEffect(){
        const that = this;
        const container = this.refs.controls;

        function onEnd() {
            that.setState({teClass: ''});
            that.isAnimationRunning = false;
            container.removeEventListener("animationend", onEnd);
            that.context.store.dispatch({type: 'TRANSITION_EFFECT_END'});
        }

        container.addEventListener("animationend", onEnd);
        const transitionEffectClass = TransitionEffect[this.context.store.getState().transitionEffect];
        this.setState({teClass: transitionEffectClass});
    },

    componentWillUpdate(){
        if (this.context.store.getState().transitionEffect && !this.isAnimationRunning){
            this.isAnimationRunning = true;
            this.performTransitionEffect();
        }
    },

    render(){
        const { store } = this.context;
        return (
            <div>
                <div className={this.getStartPlayingClass()} onClick={this.startPlaying} >
                    {isIphone() && this.context.store.getState().startStatus === ControlsStartStatus.PENDING_USER_ACTION ?
                        <img src={require("../../sdk/images/play.png")} className="bigPlay"/>
                    : null }
                </div>
                <div className={this.getControlsClassName()} ref="controls">
                    <Extend isVisible={!store.getState().inExtend} progress={store.getState().segmentProgress} onClick={this.eventHandler.bind(this, "extend")}/>
                </div>
            </div>
        );
    }
});

export default Controls;
