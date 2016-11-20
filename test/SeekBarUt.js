import { expect } from 'chai';
import ReactTestUtils from 'react-addons-test-utils'
import SeekBar from '../components/Controls/SeekBar';
import React from 'react';

describe('Seek bar test suite', () => {

    it('should display the current time in the item', () => {
        const component = ReactTestUtils.renderIntoDocument(
        <SeekBar seekListener={function(){}} itemStart={10000} itemLength={30000} itemTimeMs={19000} />
        );
        const currentTimeNode = component.refs.currentTime;
        const currentTime = currentTimeNode.innerHTML;
        expect(currentTime).to.be.equal('00:09');
    });

    it('should display item length', () => {
        const component = ReactTestUtils.renderIntoDocument(
            <SeekBar seekListener={function(){}} itemStart={10000} itemLength={33000} itemTimeMs={19000} />
        );
        const currentTimeNode = component.refs.itemLength;
        const currentTime = currentTimeNode.innerHTML;
        expect(currentTime).to.be.equal('00:33');
    });

    it('should display the seek bar value', () => {
        const component = ReactTestUtils.renderIntoDocument(
            <SeekBar seekListener={function(){}} itemStart={10000} itemLength={33000} itemTimeMs={19000} />
        );
        const bar = component.refs.bar;
        expect(bar.getAttribute('value')).to.be.equal('9');
    });

});
