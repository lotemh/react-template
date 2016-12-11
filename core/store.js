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
            //check if we need transition effect and which one we need
            return Object.assign({}, state, {
                // activePlayer: action.activePlayer,
                transitionEffect: 'WHOOSH'
            });
        case 'TRANSITION_EFFECT_END':
            return Object.assign({}, state, {transitionEffect: null});
        case 'UPDATE_TIME':
            const segmentData = {
                segmentProgress: calcSegmentProgress(state.activeSegment, state.itemTimeMs),
                itemTimeMs: action.itemTimeMs
            };
            return Object.assign({}, state, segmentData);
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

// Centralized application state
// For more information visit http://redux.js.org/
const store = createStore(reducer, defaultState);

export default store;
