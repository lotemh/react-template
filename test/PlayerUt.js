import { expect } from 'chai';
import Player from '../components/VideoElement/Player';
import Mocks from './mocks';
import ControlsStartStatus from '../components/Controls/ControlsStartStatus';

describe('Player suite', () => {

    it('player should have id', () => {
        const id = '123';
        const player = new Player({}, id);
        expect(player.id).to.equal(id);
    });

    it('test API', () => {
        const player = new Player({}, '1122');
        expect(player).to.have.property('pause');
        expect(player).to.have.property('play');
        expect(player).to.have.property('show');
        expect(player).to.have.property('hide');
        expect(player).to.have.property('prepare');
        expect(player).to.have.property('seek');
        expect(player).to.have.property('getCurrentTime');
        expect(player).to.have.property('getSrc');
        expect(player).to.have.property('addTimeUpdateEvent');
        expect(player).to.have.property('removeTimeUpdateEvent');
        expect(player).to.have.property('getId');
    });

    xdescribe('play', () => {
        it('should reject promise if play event is not triggered in 1000 ms', (done) => {
            const customStore = Mocks.getStore({startStatus: ControlsStartStatus.ACTIVE});
            const player = Mocks.getBrightcovePlayer({}, customStore);
            const segment = Mocks.getDefaultSegment();

            player.play(segment).catch((e)=> {
                expect(e).to.equal("NotAllowedError");
                done();
            });
        });
    });
});
