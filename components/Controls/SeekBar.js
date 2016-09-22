import React, { PropTypes } from 'react';
import {toHHMMSS} from '../utils/timeUtils';

var SeekBar = React.createClass({
    propTypes: {
        inExtend: PropTypes.bool.isRequired,
        stateMachine: PropTypes.object.isRequired,
        itemStart: PropTypes.number.isRequired,
        itemLength: PropTypes.number.isRequired,
        itemTimeMs: PropTypes.number.isRequired
    },
    getInitialState(){
        return {
            min: 0,
            max: 1,
            value: 0,
            inSeekChange: false
        };
    },
    getClassName(){
        var className = 'seekBar';
        if (!this.props.inExtend) {
            className += ' hidden';
        }
        return className;
    },
    seekChange(event) {
        this.setState({value: event.target.value});
    },
    onMouseDown() {
        this.setState({inSeekChange: true});
    },
    onMouseUp() {
        this.props.stateMachine.eventHandler("seek", {
            timestamp: this.getItemTime()
        });
        setTimeout( () => {//TODO move to seek promise return
            this.setState({inSeekChange: false});
        }, 100);
    },
    getItemTime(){
        return Math.floor(parseInt(this.state.value, 10) + this.props.itemStart / 1000);
    },
    componentWillReceiveProps() {
        if (!this.state.inSeekChange && this.props.itemStart !== undefined && this.props.itemLength && this.props.itemTimeMs) {
            let value = (this.props.itemTimeMs - this.props.itemStart) / 1000,
                max = this.props.itemLength / 1000,
                valueInHHMMSS = toHHMMSS(value.toString()),
                maxInHHMMSS = toHHMMSS(max.toString());
            this.setState({
                min: 0,
                max: this.props.itemLength / 1000,
                value: (this.props.itemTimeMs - this.props.itemStart) / 1000,
                valueInHHMMSS: valueInHHMMSS,
                maxInHHMMSS: maxInHHMMSS
            });
        }
    },
    render() {
        return (
            <div className={this.getClassName()}>
                <span id="leftTime">{this.state.valueInHHMMSS}</span>
                <input type="range"
                       min={this.state.min}
                       max={this.state.max}
                       value={this.state.value}
                       id="redSeekBar"
                       onChange={this.seekChange}
                       onMouseDown={this.onMouseDown}
                       onMouseUp={this.onMouseUp}
                       onTouchStart={this.onMouseDown}
                       onTouchEnd={this.onMouseUp}
                       step="any" />
                <span id="rightTime">{this.state.maxInHHMMSS}</span>
            </div>
        );
    }
});

export default SeekBar;
