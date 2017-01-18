import React, { PropTypes } from 'react';

const Dots = React.createClass({
    propTypes: {
        itemNum: PropTypes.number.isRequired,
        numOfItems: PropTypes.number.isRequired,
        isVisible: PropTypes.bool,
        dotsClassName: PropTypes.string
    },
    getImgSource(dotNum) {
        if (dotNum === (this.props.itemNum % 5)) {
            return require("../../sdk/images/bluedot.png");
        } else {
            return require("../../sdk/images/dot.png");
        }
    },
    getClassName(name) {
        let className;
        if (name === 'dots') {
            className = this.props.isVisible? this.props.dotsClassName || 'em-dots' : 'em-hidden';
        } else {
            className = 'em-dot';
            let num = parseInt(name.match(/[\d\.]+/)[0], 10),
                lastSectionNum = Math.floor(this.props.numOfItems / 5),
                currentSection = Math.floor(this.props.itemNum / 5);
            if (currentSection === lastSectionNum) {
                const numOfDots = this.props.numOfItems % 5;
                if (num > numOfDots) {
                    className += ' em-hidden';
                }
            }
        }
        return className;
    },
    render() {
        const dots = [];
        for (let i = 0; i < 5; i++) {
            dots.push(<img src={this.getImgSource(i)} className={this.getClassName(`dot${i.toString()}`)} key={i.toString()} />);
        }
        return (
            <span className={this.getClassName('dots')}>
                {dots}
            </span>
        );
    }
});

export default Dots;
