import { expect } from 'chai';
import ReactTestUtils from 'react-addons-test-utils';
import Dots from '../components/Controls/Dots';
import ReactDOM from 'react-dom';
import React from 'react';

describe('Dots test suite', () => {

    it('test max number of dots in a page', () => {
        const component = ReactTestUtils.renderIntoDocument(
            <Dots inExtend={false} itemNum={1} numOfItems={5} />
        );
        const domNode = ReactDOM.findDOMNode(component);
        expect(domNode.children.length).to.be.equal(5);
    });

});
