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
import { createStore } from 'redux';

const defaultState = {
    startStatus: ControlsStartStatus.PENDING,
    inExtend: false,
    isPlaying: false,

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
            const segmentProgressData = {
                segmentProgress: calcSegmentProgress(state.activeSegment, state.itemTimeMs)
            };
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
                    newState = {isPlaying: true};
                    break;
                default:
                    return state;
            }
            return Object.assign({}, state, segmentProgressData, newState);
        case 'SET_PENDING_FIRST_PLAY':
            return Object.assign({}, state, {pendingFirstPlayClick: action.pendingFirstPlayClick, isPlaying: !action.pendingFirstPlayClick});
        case 'FIRST_PLAY':
            return Object.assign({}, state, {startStatus: ControlsStartStatus.ACTIVE, isPlaying: true});
        case 'PLAY':
            return Object.assign({}, state, {isPlaying: true, pendingFirstPlayClick: false});
        case 'TOGGLE_PLAY':
            return Object.assign({}, state, {isPlaying: !state.isPlaying});
        case  'SET_DATA':
            var data = Object.assign({}, action);
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
            return Object.assign({}, state, {tfxAudio: 'tfxAudioFadeIn'});
        case 'TFX_AUDIO_END':
            return Object.assign({}, state, {tfxAudio: null});
        default:
            return state;
    }
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
        '1234': 'WHOOSH',
        '5678': 'WHOOSH_REV',
        '1111': 'TEST'
    };
    return tfxMap[programId] || 'WHOOSH';
}

// Centralized application state
// For more information visit http://redux.js.org/
const store = createStore(reducer, defaultState);

export default store;
