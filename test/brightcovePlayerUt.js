import { expect } from 'chai';
import Mocks from './mocks';

xdescribe('Brightcove Player suite', () => {
    let brightcovePlayer;

    beforeEach(()=>{
        brightcovePlayer = Mocks.getBrightcovePlayer({"data-video-id": "http://example2.com"});
    });

    it('should have src', ()=>{
        expect(brightcovePlayer.getSrc()).to.equal("http://example2.com");
    });

    describe('play', () => {
        before(()=> {
            navigator.userAgent = "iPhone";
        });

        it('should reject promise if user agent = iPhone', (done) => {
            const brightcovePlayer = Mocks.getBrightcovePlayer();

            brightcovePlayer.play()
                .then(()=>{throw new Error("did not detect iPhone")})
                .catch((e) => {
                    expect(e).to.equal("NotAllowedError");
                    done();
                });
        });

        after(()=>{
            navigator.userAgent = "node.js";
        });
    });
});
