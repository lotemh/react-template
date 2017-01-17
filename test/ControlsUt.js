import { expect } from 'chai';
import ReactTestUtils from 'react-addons-test-utils';
import React from 'react';
import Controls from '../components/Controls/BrightcoveControls';
import { Provider } from 'react-redux';
import Mocks from './mocks';

xdescribe('Controls test suite', () => {

    it('should display the default ui elements on first render', () => {
        const tree = ReactTestUtils.renderIntoDocument(
            <Provider store={Mocks.getStore()}>
                <Controls eventHandler={function(){}}/>
            </Provider>
        );
        const component = ReactTestUtils.findRenderedComponentWithType(tree, Controls);
        const seekBar = component.refs.seekBar;
        expect(seekBar).to.be.equal(undefined);
    });

});
