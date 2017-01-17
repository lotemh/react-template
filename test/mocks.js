import './setup';
import PlaybackController from '../components/playbackController/playbackController'
import Segment from '../components/Segment';
import store from '../core/store';
import BrightCovePlayer from '../components/VideoElement/brightCovePlayer';
import ReactTestUtils from 'react-addons-test-utils'
import sinon from 'sinon';
import React from 'react';
import {ReactDOM} from 'react-dom';
import { Provider } from 'react-redux';

class Mocks{

    static getStore(properties){
        return Object.assign(store, properties);
    }

    static getPlaybackController(){
        let mockStore = Mocks.getStore();
        const player = Mocks.getBrightcovePlayer();
        const playbackController = new PlaybackController(mockStore);
        playbackController.createPlayers([player]);
        return playbackController;
    }

    static getBrightcovePlayer(props, store){
        const mockedDomPlayer = {
            currentTime: 0,
            on: sinon.spy(),
            off: sinon.spy(),
            userActive: sinon.spy(),
            play: sinon.spy(),
        };
        store = store || Mocks.getStore();
        const tree = ReactTestUtils.renderIntoDocument(
        <Provider store={store || Mocks.getStore()}>
            <BrightCovePlayer data-video-id="http://example.com" {...props}/>
        </Provider>
        );
        const brightcovePlayer = ReactTestUtils.findRenderedComponentWithType(tree, BrightCovePlayer);
        brightcovePlayer.getPlayer = () => {return mockedDomPlayer};
        return brightcovePlayer;
    }

    static getDefaultSegment(){
        return new Segment({in: 3030, out: 4040}, "h1");
    }

}

export default Mocks;
