import { expect } from 'chai';
import Segment from '../components/Segment';

describe('Segment suite', () => {

    it('segment should have a title', () => {
        const title = 'header';
        const segment = new Segment({}, title);
        expect(segment.title).to.equal(title);
    });

});
