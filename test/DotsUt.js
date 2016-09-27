import { expect } from 'chai';
import * as TestUtils from 'react/lib/ReactTestUtils';
import Dots from '../components/Controls/Dots';
import ReactDOM from 'react-dom';
const React = require('react');

describe('Dots test suite', () => {

    it('test max number of dots in a page', () => {
        const component = TestUtils.renderIntoDocument(
            <Dots inExtend="false" itemNum="1" numOfItems="5" />
        );
        const domNode = ReactDOM.findDOMNode(component);
        expect(domNode.children.length).to.be.equal(5);
    });

});
