import { expect } from 'chai';
import * as TestUtils from 'react/lib/ReactTestUtils';
import Controls from '../components/Controls/Controls';
import React from 'react';

describe('Controls test suite', () => {

    it('should display the default ui elements on first render', () => {
        const component = TestUtils.renderIntoDocument( <Controls eventHandler={function(){}}/> );
        const seekBar = component.refs.seekBar;
        expect(seekBar).to.be.equal(undefined);
    });

});
