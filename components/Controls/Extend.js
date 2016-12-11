import React, { PropTypes } from 'react';

const Extend = React.createClass({
    propTypes: {
        isVisible: PropTypes.bool.isRequired,
        onClick: PropTypes.func.isRequired
    },
    render() {
        return (
            <img src={require("../../sdk/images/extend.png")} className={this.props.isVisible? 'controller extend' : 'hidden'} id="extend"
                 onClick={this.props.onClick}/>
        );
    }
});

export default Extend;
