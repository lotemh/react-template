import { expect } from 'chai';
import * as TestUtils from "react/lib/ReactTestUtils";
import Dots from '../components/Controls/Dots'
import ReactDOM from 'react-dom';
var React = require("react");


describe('Dots test suite', () => {

    it('test max number of dots in a page', () => {
        var component = TestUtils.renderIntoDocument(
            <Dots inExtend="false" itemNum="1" numOfItems="5"/>
        );
        var domNode = ReactDOM.findDOMNode(component);
        expect(domNode.children.length).to.be.equal(5);
    });

});
