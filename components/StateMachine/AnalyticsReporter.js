import Logger from '../Logger/Logger';
import v4 from 'uuid/v4';
import {setCookie, getCookie} from '../utils/cookieUtils';
const LIMIT = 50;
const SEGMENT_TYPE = {
    'h': 1,
    'b': 2,
    't': 3
};
const EVENT_NUM = {
    'extend': 1,
    'next': 2,
    'previous': 3,
    'no_action': 4
};


/**
 * Created by user on 8/28/2016.
 */

class AnalyticsReporter {
    constructor(store) {
        this.logger = new Logger();
        this.store = store;
        this.events = [];
        this.sessionId = v4();
        this.publisherId = store.getState().publisherId;
        this.metadataId = store.getState().metadataId;
        this.episodeId =  store.getState().episodeId;
        this.interval = setInterval(this.report.bind(this), 3000); 
        this.userId = getCookie("emid");
        if (!this.userId) {
            this.userId = v4();
        }
        setCookie("emid", this.userId, 7); 
    }

    storeEvent(action) {
        let event;
        let currentState = this.store.getState();
        if (!currentState.activeSegment) {
            this.lastActionTime = Date.now();
            return;
        }
        event = {
            eventTime: Date.now(),
            itemNum: currentState.itemNum + 1,
            segmentType: this.getSegmentType(currentState),
            itemPlayedTime: this.getPlayedTime(currentState),
            itemRealTime: Date.now() - this.lastActionTime,
            event: EVENT_NUM[action]
        }
        this.lastActionTime = Date.now();
        this.events.push(event);
    }

    reportEvents() {
        let toSendRows,
            toSendObj,
            xmlhttp;
        if (!this.events.length) {
            return ;
        }
        toSendRows = this.events.splice(0, this.events.length);
        toSendObj = {
            publisherId: this.publisherId,
            episodeId: this.episodeId,
            reportId: this.sessionId,
            metaDataId: this.metadataId,
            userId: this.userId,
            segmentEvents: toSendRows
        };
        xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                /*
                 * retry policy we might add on demand
                if (xmlhttp.status !== 200) {
                    this.events = this.events.concat(toSendRows);
                }
                */
            }
        };
        xmlhttp.open("POST", ANALYTICS_BASE_URL + "report", true);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(JSON.stringify(toSendObj));
    }
    getSegmentType(currentState) {
        let typeString,
            type;
        if (currentState.activeSegment && currentState.activeSegment.title) {
            typeString = currentState.activeSegment.title.substring(0, 1);
        }
        if (currentState.inExtend) {
            typeString = "b";
        }
        return SEGMENT_TYPE[typeString];
    }

    getPlayedTime(currentState) {
        if (currentState.activeSegment && currentState.itemTimeMs && 
            (currentState.activeSegment.in || currentState.activeSegment.in === 0)) {
            return parseInt(currentState.itemTimeMs - currentState.activeSegment.in, 10);
        } 
        return null;
    }
}

export default AnalyticsReporter;
