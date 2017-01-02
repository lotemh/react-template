import Logger from '../Logger/Logger';

/**
 * Created by user on 8/28/2016.
 */

class AnalyticsReporter {
    constructor(store) {
        this.logger = new Logger();
        this.store = store;
        //store.subscribe(this.storeListener.bind(this));
    }

    reportAction(action) {
        let currentState = this.store.getState();
        console.log("stateChanged!!!" + action);
        console.log(currentState);
    }

    storeListener() {
        let previousState = this.currentState,
            stateChanged = false;
        this.currentState = this.store.getState();
        if (!this.currentState.activeSegment) {
            return;
        }
        if (this.currentState.inExtend && !previousState.inExtend) {
            console.log("first change");
            stateChanged = true;
        }
        if (!previousState.activeSegment || previousState.activeSegment.title !== this.currentState.activeSegment.title) {
            console.log("second change");
            if (!previousState.activeSegment) {
                console.log("second secondg change");
            } else {
                console.log(previousState.activeSegment);
                console.log(previousState.activeSegment.title);
                console.log(this.currentState.activeSegment.title);
            }
            stateChanged = true;
        }
        if (stateChanged) {
            console.log("stateChanged!!!");
            console.log(this.store.getState());
            console.log(previousState);
        }
    }
}

export default AnalyticsReporter;
