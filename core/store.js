import { createStore } from 'redux';

const defaultState = {};

function reducer(state, action){
    // TODO: Add action handlers (aka "reduces")
    switch (action.type) {
        default:
            return state;
    }
}

const store = createStore(reducer, defaultState);

export default store;
