import { expect } from 'chai';
import ReactTestUtils from 'react-addons-test-utils';
//import Controls from '../components/Controls/Controls';
import React from 'react';

describe('Controls test suite', () => {

    xit('should display the default ui elements on first render', () => {
        const component = ReactTestUtils.renderIntoDocument( <Controls eventHandler={function(){}}/> );
        const seekBar = component.refs.seekBar;
        expect(seekBar).to.be.equal(undefined);
    });

});
