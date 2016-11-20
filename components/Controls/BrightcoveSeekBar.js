import React, { PropTypes } from 'react';
import { toHHMMSS } from '../utils/timeUtils';

const BrightcoveSeekBar = React.createClass({
    propTypes: {
        pauseListener: PropTypes.func.isRequired,
        playListener: PropTypes.func.isRequired,
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
    seekByMouse(event) {
        const position = event.target.getBoundingClientRect();
        const seekPosition = event.clientX - position.left;
        const progress = seekPosition / position.width;
        const seekTime = (progress * this.props.itemLength + this.props.itemStart)/ 1000.0;

        this.props.seekListener(seekTime);
    },
    onMouseDown(event) {
        event.preventDefault();

        document.body.focus();
        this.onselectstart = document.onselectstart;

        this.setState({ inSeekChange: true });

        document.addEventListener("mousemove", this.onMouseMove);
        document.addEventListener("mouseup", this.onMouseUp);
        document.onselectstart = () => {return false};

        this.seekByMouse(event);
    },
    onMouseMove(event) {
        this.seekByMouse(event);
    },
    onMouseUp(event) {
        this.seekByMouse(event);

        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("mouseup", this.onMouseUp);
        document.onselectstart = this.onselectstart;

        setTimeout(() => { // TODO move to seek promise return
            this.setState({ inSeekChange: false });
        }, 100);
    },
    getItemTime() {
        return Math.floor(parseInt(this.state.value, 10) + this.props.itemStart / 1000.0);
    },
    getCurrentTimeInItemHHMMSS: function () {
        var currentTime = Math.max(0, this.props.itemTimeMs - this.props.itemStart);
        return this.getTimeInHHMMSS(currentTime);
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
    progress() {
        if (this.props.itemTimeMs && this.props.itemLength)
        {
            var itemCurrentTime = this.props.itemTimeMs - this.props.itemStart;
            return Math.min(itemCurrentTime / this.props.itemLength, 1);
        }
        return 0;
    },
    render() {
        const progressStyle = {
            width: `${this.progress() * 100}%`
        }
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
                     onTouchStart={this.onMouseDown}
                     onTouchEnd={this.onMouseUp}>
                    <div className="vjs-progress-holder vjs-slider vjs-slider-horizontal">
                        <div className="vjs-load-progress" style={progressStyle}>
                            <span className="vjs-control-text">
                                <span>Loaded</span>
                                : 0%
                            </span>
                            <div></div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
});

export default BrightcoveSeekBar;
