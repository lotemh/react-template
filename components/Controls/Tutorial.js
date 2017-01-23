import React, { PropTypes } from 'react';
import css from '../../sdk/main.css';
import Hammer from 'hammerjs';
import ReactDOM from 'react-dom';


const Tutorial = React.createClass({
    propTypes: {
        onDismiss: PropTypes.func.isRequired,
        isMobile: PropTypes.bool,
        timeout: PropTypes.number,
    },
    componentDidMount() {
        if (this.hasCloseButton()) {
            this.refs.close.addEventListener('click', this.props.onDismiss);
            this.refs.close.addEventListener('touchstart', this.props.onDismiss);
        }

        this.gestureListener = new Hammer(ReactDOM.findDOMNode(this.refs.tutorial));
        this.gestureListener.on('swipeleft', this.props.onDismiss);
        this.gestureListener.on('swiperight', this.props.onDismiss);

        if (this.props.timeout) {
            this.timeout = setTimeout(this.props.onDismiss, this.props.timeout);
        }
    },
    hasCloseButton() {
        return !this.props.isMobile;
    },
    render() {
        return (
            <div>
                <div className="em-tutorial" ref="tutorial"></div>
                { this.hasCloseButton() && <div className="em-close-tutorial" ref="close"></div> }
            </div>
        );
    }
});

export default Tutorial;
