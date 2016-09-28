import React, { PropTypes } from 'react';
import {toHHMMSS} from '../utils/timeUtils';

var SeekBar = React.createClass({
    propTypes: {
        seekListener: PropTypes.func.isRequired,
        itemStart: PropTypes.number.isRequired,
        itemLength: PropTypes.number.isRequired,
        itemTimeMs: PropTypes.number.isRequired
    },
    getInitialState(){
        return {
            value: (this.props.itemTimeMs - this.props.itemStart) / 1000,
            inSeekChange: false
        };
    },
    seekChange(event) {
        this.setState({value: event.target.value});
    },
    onMouseDown() {
        this.setState({inSeekChange: true});
    },
    onMouseUp() {
        this.props.seekListener(this.getItemTime());
        setTimeout( () => {//TODO move to seek promise return
            this.setState({inSeekChange: false});
        }, 100);
    },
    getItemTime(){
        return Math.floor(parseInt(this.state.value, 10) + this.props.itemStart / 1000);
    },
    getCurrentTimeInItemHHMMSS: function () {
        return this.getTimeInHHMMSS(this.props.itemTimeMs - this.props.itemStart);
    },
    getTimeInHHMMSS(timeMs){
        return toHHMMSS((timeMs / 1000).toString());
    },
    componentWillReceiveProps() {
        if (!this.state.inSeekChange && this.props.itemStart !== undefined && this.props.itemLength && this.props.itemTimeMs) {
            this.setState({
                value: (this.props.itemTimeMs - this.props.itemStart) / 1000
            });
        }
    },
    render() {
        return (
            <div className='seekBar'>
                <span ref="currentTime" id="leftTime">{this.getCurrentTimeInItemHHMMSS()}</span>
                <input type="range"
                       min={0}
                       max={this.props.itemLength / 1000}
                       value={this.state.value}
                       id="redSeekBar"
                       onChange={this.seekChange}
                       onMouseDown={this.onMouseDown}
                       onMouseUp={this.onMouseUp}
                       onTouchStart={this.onMouseDown}
                       onTouchEnd={this.onMouseUp}
                       step="any" />
                <span id="rightTime">{this.getTimeInHHMMSS(this.props.itemLength)}</span>
            </div>
        );
    }
});

export default SeekBar;
