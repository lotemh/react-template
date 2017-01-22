import React, { PropTypes } from 'react';
import Hammer from 'hammerjs';
import ReactDOM from 'react-dom';
import SeekBar from './SeekBar';
import Dots from './Dots';
import Extend from './Extend';
import Tutorial from './Tutorial';
import ControlsStartStatus from './ControlsStartStatus';

const SWIPES = {
    LEFT: 'swipeleft',
    RIGHT: 'swiperight'
};
const Controls = React.createClass({
    propTypes: {
        eventHandler: PropTypes.func.isRequired
    },
    contextTypes: {
        store: React.PropTypes.object
    },
    componentDidMount() {
        this.unsubscribe = this.context.store.subscribe(() => {
            this.forceUpdate();
        })
        this.gestureListener = new Hammer(ReactDOM.findDOMNode(this.refs.touchScreen));
        this.gestureListener.on(SWIPES.LEFT, this.swipeLeft);
        this.gestureListener.on(SWIPES.RIGHT, this.swipeRight);
    },
    componentWillUnmount(){
        this.unsubscribe();
    },
    swipeLeft() {
        this.props.eventHandler('next');
    },
    swipeRight(){
        this.props.eventHandler('previous');
    },

    getClassName(name) {
        let className = 'em-controller';
        if (name === 'extend' && this.context.store.getState().inExtend) {
            className += ' em-hidden';
        }
        if (name === 'play') {
            className += ' play';
            className += this.context.store.getState().isPlaying ? ' em-hidden' : '';
        } else if (name === 'pause') {
            className += !this.context.store.getState().isPlaying ? ' em-hidden' : '';
        }
        return className;
    },
    togglePlay() {
        const isPlaying = !this.context.store.getState().isPlaying;
        const action = isPlaying ? 'play' : 'pause';
        this.eventHandler(action);
    },
    startPlaying() {
        this.eventHandler('firstPlay');
    },
    eventHandler(action) {
        this.props.eventHandler(action);
    },
    getStartPlayingClass() {
        return this.context.store.getState().startStatus === ControlsStartStatus.PENDING_USER_ACTION ? 'em-controller bigPlay' : 'em-hidden';
    },
    getControlsClassName() {
        if (this.context.store.getState().startStatus !== ControlsStartStatus.ACTIVE){
            return 'em-hidden';
        }
        let className = 'em-controls';
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
    onTutorialDismiss() {
        this.context.store.dispatch({type: 'DISMISS_TUTORIAL'});
    },
    progress() {
        let progress = 0;
        try {
            const segment = this.context.store.getState().activeSegment;
            const segmentLength = (segment.out - segment.in);
            const segmentProgressTime = context.store.getState().itemTimeMs - segment.in;
            progress = segmentProgressTime / segmentLength;
        } catch (e) {
        }
        return progress;
    },
    render(){
        let storeState = this.context.store.getState();
        let timeElement = (storeState.inExtend) ?
            <SeekBar
                ref='seekBar'
                itemTimeMs={storeState.itemTimeMs}
                itemStart={storeState.itemStart}
                itemLength={storeState.itemLength}
                seekListener={this.seekListener}
            /> :
            <Dots
                isVisible={true}
                itemNum={storeState.itemNum}
                numOfItems={storeState.numOfItems}
            />;
        return (
            <div>
                <div className={this.getStartPlayingClass()} onClick={this.startPlaying} >
                    <img src={require("../../sdk/images/play.png")} className="em-big-play"/>
                </div>
                <div className={this.getControlsClassName()}>
                    <div className="em-controls-touch-screen" ref="touchScreen"></div>
                    <Extend isVisible={!storeState.inExtend} progress={this.progress()} onClick={this.eventHandler.bind(this, "extend")}/>
                    {storeState.isPlaying ?
                        <img src={require("../../sdk/images/pause.png")} className='em-controller em-pause' onClick={this.togglePlay}/>
                    :
                        <img src={require("../../sdk/images/play.png")} className='em-controller em-play' onClick={this.togglePlay}/>
                    }
                    {timeElement}
                </div>
                { storeState.shouldShowTutorial && <Tutorial timeout={8000} onDismiss={this.onTutorialDismiss}/> }
            </div>
        );
    }
});

export default Controls;
