import { expect } from 'chai';
import Segment from "../components/Segment";

describe('Segment suite', () => {

    it('segment should have a title', () => {
        var title = "header";
        var segment = new Segment({}, title);
        expect(segment.title).to.equal(title);
    });

});
