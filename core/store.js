/**
 * React Static Boilerplate
 * https://github.com/kriasoft/react-static-boilerplate
 *
 * Copyright © 2015-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import ControlsStartStatus from '../components/Controls/ControlsStartStatus';
import AnalyticsReporter from '../components/StateMachine/AnalyticsReporter';
import { createStore } from 'redux';
import { load, save } from './localStorage';
import screenfull from 'screenfull';

const showTutorialCounter = +load('showTutorialCounter', 3);

const defaultState = {
    startStatus: ControlsStartStatus.PENDING,
    inExtend: false,
    isPlaying: false,
    isFullscreen: false,
    shouldShowExtendBtn: false,
    shouldShowTutorial: (showTutorialCounter > 0),
    showTutorialCounter: showTutorialCounter,
    volume: 1,

    numOfItems: 0,
    programId: '',

    itemNum: 0,
    itemStart: 0,
    itemLength: 0,
    itemTimeMs: 0,

    segmentProgress: 0,
    activeSegment: null
};

function reducer(state, action){
    // TODO: Add action handlers (aka "reduces")
    switch (action.type) {
        case 'EVENT_HANDLER':
            AnalyticsReporter.storeEvent(action.actionName, state);
            let newState;
            switch (action.actionName) {
                case 'extend':
                    newState = {inExtend: true};
                    break;
                case 'next':
                    newState = {inExtend: false};
                    break;
                case 'previous':
                    newState = {inExtend: false};
                    break;
                case 'no_action':
                    newState = {inExtend: false};
                    break;
                case 'pause':
                    newState = {isPlaying: false};
                    break;
                case 'play':
                    newState = {isPlaying: true, startStatus: ControlsStartStatus.ACTIVE};
                    break;
                default:
                    return state;
            }
            return Object.assign({}, state, newState);
        case 'SET_PENDING_FIRST_PLAY':
            return Object.assign({}, state, {pendingFirstPlayClick: action.pendingFirstPlayClick, isPlaying: !action.pendingFirstPlayClick});
        case 'FIRST_PLAY':
            return Object.assign({}, state, {startStatus: ControlsStartStatus.ACTIVE, isPlaying: true});
        case 'PLAY':
            return Object.assign({}, state, {isPlaying: true, pendingFirstPlayClick: false});
        case 'TOGGLE_PLAY':
            return Object.assign({}, state, {isPlaying: !state.isPlaying});
        case 'TOGGLE_FULLSCREEN':
            return Object.assign({}, state, {isFullscreen: !getFullScreenMode()});
        case 'VOLUME_CHANGE':
            return Object.assign({}, state, {volume: action.volume});
        case  'SET_DATA':
            var data = Object.assign({}, action);
            delete data.type;
            return Object.assign({}, state, data);
        case  'SET_SEGMENT':
            var data = Object.assign({}, action);
            data.shouldShowExtendBtn = shouldShowExtendButton(data.activeSegment),
            delete data.type;
            return Object.assign({}, state, data);
        case 'SWITCH_PLAYERS':
            const tfx = getTfx(state.programId);
            return Object.assign({}, state, {
                transitionEffect: tfx
            });
        case 'TRANSITION_EFFECT_END':
            return Object.assign({}, state, {transitionEffect: null});
        case 'UPDATE_TIME':
            const segmentData = {
                segmentProgress: calcSegmentProgress(state.activeSegment, state.itemTimeMs),
                itemTimeMs: action.itemTimeMs
            };
            return Object.assign({}, state, segmentData);
        case 'TFX_AUDIO_SET':
            if (state.startStatus !== ControlsStartStatus.PENDING) {
                return Object.assign({}, state, {tfxAudio: state.tfxAudio});
            } else {
                return state;
            }
        case 'TFX_AUDIO_END':
            return Object.assign({}, state, {tfxAudio: null});
        case 'DISMISS_TUTORIAL':
            save('showTutorialCounter', Math.max(0, state.showTutorialCounter - 1));
            return Object.assign({}, state, {shouldShowTutorial: false});
        default:
            return state;
    }
}

function shouldShowExtendButton(activeSegment){
    return activeSegment.extend ? true : false;
}

function calcSegmentProgress(segment, currentTime) {
    let progress = 0;
    try {
        const segmentLength = (segment.out - segment.in);
        const segmentProgressTime = currentTime - segment.in;
        progress = segmentProgressTime / segmentLength;
    } catch (e) {
    }
    return progress;
}

function getTfx(programId){
    const tfxMap = {
        '1234': 'NO_TFX',
        '5678': 'WHOOSH_REV',
        'd943a98e-d05b-4c9f-8370-c198a2105d34': 'NO_TFX',
        'e59df5d0-db3c-4d7e-8304-2ced65e952ac': 'BORDER_BLASTERS',
        'e603fdcf-fab1-4b67-8dc6-90bf82c35d58': 'STUDIO_A'
    };
    return tfxMap[programId] || 'NO_TFX';
}

function getFullScreenMode() {
    if (!screenfull.enabled) {
        return false;
    } else if (screenfull.isFullscreen) {
        return true;
    } else {
        return false;
    }
}

// Centralized application state
// For more information visit http://redux.js.org/
const store = createStore(reducer, defaultState);

export default store;
