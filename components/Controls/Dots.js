import React, { PropTypes } from 'react';
import Hammer from 'hammerjs';
import ReactDOM from 'react-dom';


var Dots = React.createClass({
    getImgSource(dotNum){
        if (dotNum === (this.props.itemNum % 5)) {
            return "images/bluedot.png";
        } else {
            return "images/dot.png";
        }
    },
    getClassName(name){
        if (name === "dots") {
            var className = 'dots';
            if (this.props.inExtend) {
                className += ' hidden';
            }
        } else {
            className = 'dot';
            let num = parseInt(name.substring(3, 4), 10);
            let lastSectionNum = Math.floor(this.props.numOfItems / 5);
            let currentSection = Math.floor(this.props.itemNum / 5);
            if (currentSection === lastSectionNum) {
                let numOfDots = this.props.numOfItems % 5;
                if (num >= numOfDots) {
                    className += ' hidden';
                }
            }
        }
        return className;
    },
    render(){
        var dots = [];
        for (var i = 0; i < 5; i++) {
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