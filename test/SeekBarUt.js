import { expect } from 'chai';
import * as TestUtils from 'react/lib/ReactTestUtils';
import SeekBar from '../components/Controls/SeekBar';
import React from 'react';

describe('Seek bar test suite', () => {

    it('should display the current time in the item', () => {
        const component = TestUtils.renderIntoDocument(
        <SeekBar itemNum="1" numOfItems="5"
        seekListener={function(){}} itemStart={10000} itemLength={30000} itemTimeMs={19000} />
        );
        const currentTimeNode = component.refs.currentTime;
        const currentTime = currentTimeNode.innerHTML;
        expect(currentTime).to.be.equal('00:09');
    });

});
