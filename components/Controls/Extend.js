import React, { PropTypes } from 'react';

const Extend = React.createClass({
    propTypes: {
        isVisible: PropTypes.bool.isRequired,
        onClick: PropTypes.func.isRequired,
        progress: PropTypes.number.isRequired,
    },
    componentDidMount() {
        this.drawProgress(this.props.progress);
    },
    componentDidUpdate() {
        this.drawProgress(this.props.progress);
    },
    drawProgress(progress) {
        let canvas = this.refs.extendProgress;
        let ctx = canvas.getContext("2d");
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(50, 50, 45, 0, 2 * Math.PI);
        ctx.fillStyle = '#999';
        ctx.lineWidth = 10;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(50, 50, 20, 1.5 * Math.PI, 1.5 * Math.PI + progress * 2 * Math.PI);
        ctx.lineWidth = 40;
        ctx.strokeStyle = '#0E93E3';
        ctx.stroke();
    },
    render() {
        return (
            <div className={this.props.isVisible? 'controller extend' : 'hidden'} onClick={this.props.onClick}>
                <canvas className='extend-progress' ref="extendProgress" width='100' height='100'/>
            </div>
        );
    }
});

export default Extend;
