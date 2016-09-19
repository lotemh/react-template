import React, { PropTypes } from 'react';
import Hammer from 'hammerjs';
import ReactDOM from 'react-dom';


var SeekBar = React.createClass({
    getInitialState(){
        return {
            min: 0,
            max: 1,
            value: 0
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
        this.props.stateMachine.seek(Math.floor(parseInt(event.target.value, 10) + this.props.itemStart / 1000));
    },
    componentWillReceiveProps() {
        if (this.props.itemStart !== undefined && this.props.itemLength && this.props.itemTimeMs) {
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
                   className={this.getClassName()}
                   step="any" />
        );
    }
});

export default SeekBar;