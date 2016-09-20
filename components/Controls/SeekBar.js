import React, { PropTypes } from 'react';
import Hammer from 'hammerjs';
import ReactDOM from 'react-dom';


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
    getClassName(name){
        var className = 'seekBar';
        if (!this.props.inExtend) {
            className += ' hidden';
        }
        return className;
    },
    seekChange(event) {
        this.setState({value: event.target.value});
    },
    onMouseDown(event) {
        this.setState({inSeekChange: true});
    },
    onMouseUp(event) {
        this.setState({inSeekChange: false});
        this.props.stateMachine.eventHandler("seek", {
            timestamp: this.getItemTime()
        });
    },
    getItemTime(){
        return Math.floor(parseInt(this.state.value, 10) + this.props.itemStart / 1000)
    },
    componentWillReceiveProps() {
        if (!this.state.inSeekChange && this.props.itemStart !== undefined && this.props.itemLength && this.props.itemTimeMs) {
            this.setState({
                min: 0,
                max: this.props.itemLength / 1000,
                value: (this.props.itemTimeMs - this.props.itemStart) / 1000
            });
        }
    },
    render(){
        return (
            <input type="range"
                   min={this.state.min}
                   max={this.state.max}
                   value={this.state.value}
                   id="seekBar"
                   onChange={this.seekChange}
                   onMouseDown={this.onMouseDown}
                   onMouseUp={this.onMouseUp}
                   className={this.getClassName()}
                   step="any" />
        );
    }
});

export default SeekBar;
