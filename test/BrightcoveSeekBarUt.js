import { expect } from 'chai';
import ReactTestUtils from 'react-addons-test-utils'
import BrightcoveSeekBar from '../components/Controls/BrightcoveSeekBar';
import React from 'react';
import ReactDOM from 'react-dom';

describe('Brightcove Seek bar test suite', () => {

    it('should display the current time in the item', () => {
        const component = ReactTestUtils.renderIntoDocument(
        <BrightcoveSeekBar seekListener={function(){}} itemStart={10000} itemLength={30000} itemTimeMs={19000} isVisible={true}/>
        );
        const currentTimeNode = component.refs.currentTime;
        const currentTime = currentTimeNode.innerHTML;
        expect(currentTime).to.be.equal('00:09');
    });

    it('should display item length', () => {
        const component = ReactTestUtils.renderIntoDocument(
            <BrightcoveSeekBar seekListener={function(){}} itemStart={10000} itemLength={33000} itemTimeMs={19000} isVisible={true}/>
        );
        const currentTimeNode = component.refs.itemLength;
        const currentTime = currentTimeNode.innerHTML;
        expect(currentTime).to.be.equal('00:33');
    });

    it('should display the seek bar value', () => {
        const component = ReactTestUtils.renderIntoDocument(
            <BrightcoveSeekBar seekListener={function(){}} itemStart={10000} itemLength={33000} itemTimeMs={19000} isVisible={true}/>
        );
        const bar = ReactDOM.findDOMNode(component).getElementsByClassName("vjs-load-progress")[0];
        var width = parseInt(bar.style.width.replace('%',''), 10);
        expect(width).to.be.equal(27);
    });

});
