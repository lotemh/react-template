import React, { PropTypes } from 'react';
import { toHHMMSS } from '../utils/timeUtils';

const BrightcoveSeekBar = React.createClass({
    propTypes: {
        seekListener: PropTypes.func.isRequired,
        itemStart: PropTypes.number.isRequired,
        itemLength: PropTypes.number.isRequired,
        itemTimeMs: PropTypes.number.isRequired,
        isVisible: PropTypes.bool.isRequired
    },
    getInitialState() {
        return {
            value: this.calcSeekBarValue(),
            inSeekChange: false
        };
    },
    seekChange(event) {
        this.setState({ value: event.target.value });
    },
    onMouseDown() {
        this.setState({ inSeekChange: true });
    },
    onMouseUp() {
        this.props.seekListener(this.getItemTime());
        setTimeout(() => { // TODO move to seek promise return
            this.setState({ inSeekChange: false });
        }, 100);
    },
    getItemTime() {
        return Math.floor(parseInt(this.state.value, 10) + this.props.itemStart / 1000);
    },
    getCurrentTimeInItemHHMMSS: function () {
        return this.getTimeInHHMMSS(this.props.itemTimeMs - this.props.itemStart);
    },
    getTimeInHHMMSS(timeMs){
        return toHHMMSS((timeMs / 1000).toString());
    },
    calcSeekBarValue: function () {
        return (this.props.itemTimeMs - this.props.itemStart) / 1000;
    },
    componentWillReceiveProps() {
        if (!this.state.inSeekChange && this.props.itemStart !== undefined && this.props.itemLength && this.props.itemTimeMs) {
            this.setState({
                value: this.calcSeekBarValue()
            });
        }
    },
    render() {
        return (
            <div className={this.props.isVisible? 'brightcoveSeekBar' : 'hidden'}>
                <div className="vjs-current-time vjs-time-control vjs-control vjs-time-controls">
                    <div className="vjs-current-time-display">
                        <span ref="currentTime">{this.getCurrentTimeInItemHHMMSS()}</span>
                    </div>
                </div>
                <div className="vjs-time-control vjs-time-divider vjs-time-controls">
                    <div>
                        <span>/</span>
                    </div>
                </div>
                <div className="vjs-duration vjs-time-control vjs-control vjs-time-controls">
                    <div className="vjs-duration-display">
                        <span ref="itemLength" >{this.getTimeInHHMMSS(this.props.itemLength)}</span>
                    </div>
                </div>
                <div className="vjs-progress-control vjs-control"
                     onChange={this.seekChange}
                     onMouseDown={this.onMouseDown}
                     onMouseUp={this.onMouseUp}
                     onTouchStart={this.onMouseDown}
                     onTouchEnd={this.onMouseUp}>
                    <div className="vjs-progress-holder vjs-slider vjs-slider-horizontal">
                        <div className="vjs-load-progress">
                            <span className="vjs-control-text">
                                <span>Loaded</span>
                                : 0%
                            </span>
                            <div></div>
                        </div>
                        <input ref="bar" type="range"
                               min={0}
                               max={this.props.itemLength / 1000}
                               value={this.state.value}
                               className="brightcoveTimeLine"
                               onChange={this.seekChange}
                               onMouseDown={this.onMouseDown}
                               onMouseUp={this.onMouseUp}
                               onTouchStart={this.onMouseDown}
                               onTouchEnd={this.onMouseUp}
                               step="any" />
                    </div>
                </div>

            </div>
        );
    }
});

export default BrightcoveSeekBar;
