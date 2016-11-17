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
    inExtend: false,
    numOfItems: 0,
    itemNum: 0,
    isPlaying: false,
    startStatus: ControlsStartStatus.PENDING,
    itemLength: "00:00",
    activeSegment: null
};

function reducer(state, action){
    // TODO: Add action handlers (aka "reduces")
    switch (action.type) {
        case 'EVENT_HANDLER':
            const inExtend = action.actionName === 'extend';
            switch (action.actionName) {
                case 'extend':
                    return Object.assign({}, state, {inExtend: inExtend});
                case 'next':
                    return Object.assign({}, state, {inExtend: inExtend});
                case 'pause':
                    return Object.assign({}, state, {isPlaying: false});
                case 'play':
                    return Object.assign({}, state, {isPlaying: true});
                default:
                    return state;
            }
            break;
        case 'SET_PENDING_FIRST_PLAY':
            return Object.assign({}, state, {pendingFirstPlayClick: action.pendingFirstPlayClick, isPlaying: !action.pendingFirstPlayClick});
        case 'FIRST_PLAY':
            return Object.assign({}, state, {startStatus: ControlsStartStatus.ACTIVE, isPlaying: true});
        case 'PLAY':
            return Object.assign({}, state, {isPlaying: true, pendingFirstPlayClick: false});
        case 'TOGGLE_PLAY':
            return Object.assign({}, state, {isPlaying: !state.isPlaying});
        case 'SET_DATA':
            var data = Object.assign({}, action);
            delete data.type;
            return Object.assign({}, state, data);
        case 'SET_ACTIVE_SEGMENT':
            return Object.assign({}, state, {activeSegment: action.activeSegment, itemNum: action.itemNum});
        case 'SWITCH_PLAYERS':
            //check if we need transition effect and which one we need
            return Object.assign({}, state, {
                // activePlayer: action.activePlayer,
                transitionEffect: 'WHOOSH'
            });
        case 'TRANSITION_EFFECT_END':
            return Object.assign({}, state, {transitionEffect: null});
        default:
            return state;
    }
}

// Centralized application state
// For more information visit http://redux.js.org/
const store = createStore(reducer, defaultState);

export default store;
