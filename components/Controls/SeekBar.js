import React, { PropTypes } from 'react';
import Hammer from 'hammerjs';
import ReactDOM from 'react-dom';

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    if (hours === 0) {
        return minutes+':'+seconds;
    } else {
        if (hours < 10) {hours = "0" + hours;}
        return hours+':'+minutes+':'+seconds;
    }
}

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
        setTimeout( () => {
            this.setState({inSeekChange: false});
        }, 100);
        this.props.stateMachine.seek(Math.floor(parseInt(this.state.value, 10) + this.props.itemStart / 1000));
    },
    componentWillReceiveProps() {
        if (!this.state.inSeekChange && this.props.itemStart !== undefined && this.props.itemLength && this.props.itemTimeMs) {
            let value = (this.props.itemTimeMs - this.props.itemStart) / 1000,
                max = this.props.itemLength / 1000,
                valueInHHMMSS = Math.floor(value).toString().toHHMMSS(),
                maxInHHMMSS = Math.floor(max).toString().toHHMMSS();
            this.setState({
                min: 0,
                max: this.props.itemLength / 1000,
                value: (this.props.itemTimeMs - this.props.itemStart) / 1000,
                valueInHHMMSS: valueInHHMMSS,
                maxInHHMMSS: maxInHHMMSS
            });
        }
    },
    render(){
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
                       step="any" />
                <span id="rightTime">{this.state.maxInHHMMSS}</span>
            </div>
        );
    }
});

export default SeekBar;