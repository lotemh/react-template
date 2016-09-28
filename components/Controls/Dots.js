import React, { PropTypes } from 'react';

var Dots = React.createClass({
    propTypes: {
        itemNum: PropTypes.number.isRequired,
        numOfItems: PropTypes.number.isRequired
    },
    getImgSource(dotNum){
        if (dotNum === (this.props.itemNum % 5)) {
            return "images/bluedot.png";
        } else {
            return "images/dot.png";
        }
    },
    getClassName(name){
        var className;
        if (name === "dots") {
            className = 'dots';
        } else {
            className = 'dot';
            let num = parseInt(name.match(/[\d\.]+/)[0], 10),
                lastSectionNum = Math.floor(this.props.numOfItems / 5),
                currentSection = Math.floor(this.props.itemNum / 5);
            if (currentSection === lastSectionNum) {
                let numOfDots = this.props.numOfItems % 5;
                if (num > numOfDots) {
                    className += ' hidden';
                }
            }
        }
        return className;
    },
    render(){
        var dots = [];
        for (let i = 0; i < 5; i++) {
            dots.push(<img src={this.getImgSource(i)} className={this.getClassName("dot" + i.toString())} key={i.toString()}/>);
        }
        return (
            <span id="dots" className={this.getClassName("dots")}>
                {dots}
            </span>
        );
    }
});

export default Dots;
