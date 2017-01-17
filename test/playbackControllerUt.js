import { expect } from 'chai';
import PlaybackController from '../components/playbackController/playbackController'
import Player from '../components/VideoElement/Player';
import Segment from '../components/Segment';
import sinon from 'sinon';
import Mocks from './mocks';


describe('Playback Controller suite', () => {

    xdescribe('play segment', (done) => {
        it('should continue playing if src and time are equal', () => {
            const playbackController = Mocks.getPlaybackController();
            const segment = new Segment({in: 3030, out: 4040}, "h1");

            playbackController.playSegment(segment)
                .then(done)
                .catch((e) => {
                    throw new Error("did not play")
                });
        });
    });


});

