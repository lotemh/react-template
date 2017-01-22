import React, { PropTypes } from 'react';
import css from '../../sdk/main.css';


const Tutorial = React.createClass({
    propTypes: {
        onDismiss: PropTypes.func.isRequired,
        show: PropTypes.bool,
        timeout: PropTypes.number,
    },
    componentDidMount() {
        if (!this.props.show)
            return null;

        this.refs.tutorial.addEventListener('click', this.props.onDismiss);
        this.refs.tutorial.addEventListener('touchstart', this.props.onDismiss);

        if (this.props.timeout) {
            this.timeout = setTimeout(this.props.onDismiss, this.props.timeout);
        }
    },
    render() {
        if (!this.props.show)
            return null;

        return (
            <div className="em-tutorial" ref="tutorial"></div>
        );
    }
});

export default Tutorial;
