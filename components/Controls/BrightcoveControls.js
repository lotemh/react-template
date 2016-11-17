import React, { PropTypes } from 'react';
import TouchScreen from './TouchScreen';
import ControlsStartStatus from './ControlsStartStatus';
import Extend from './Extend';
import TransitionEffect from '../transitionEffects/TransitionEffect';

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

    getInitialState(){
        return {
            isAnimationRunning: false
        }
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
        if (this.context.store.getState().startStatus !== ControlsStartStatus.ACTIVE){
            return 'hidden';
        }
        let className =  'controls';
        if (this.state && this.state.teClass){
            className += ' te ' + this.state.teClass;
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
                <div>
                    <img src="images/play.png" className={this.getStartPlayingClass()} onClick={this.startPlaying} />
                </div>
                <div className={this.getControlsClassName()} ref="controls">
                    <TouchScreen eventHandler={this.eventHandler}/>
                    <Extend isVisible={!store.getState().inExtend} onClick={this.eventHandler.bind(this, "extend")}/>
                </div>
            </div>
        );
    }
});

export default Controls;
