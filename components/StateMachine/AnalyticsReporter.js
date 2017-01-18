import v4 from 'uuid/v4';
import {setCookie, getCookie} from '../utils/cookieUtils';
const LIMIT = 50;
const SEGMENT_TYPE = {
    'h': 0,
    'b': 1,
    't': 2
};
const EVENT_NUM = {
    'extend': 1,
    'next': 2,
    'previous': 3,
    'no_action': 4
};
let AnalyticsReporter = {};


/**
 * Created by user on 8/28/2016.
 */

AnalyticsReporter.start = function start(store) {
    AnalyticsReporter.events = [];
    AnalyticsReporter.sessionId = v4();
    AnalyticsReporter.publisherId = store.getState().publisherId;
    AnalyticsReporter.metadataId = store.getState().metadataId;
    AnalyticsReporter.episodeId =  store.getState().episodeId;
    AnalyticsReporter.lastActionTime = Date.now();
    AnalyticsReporter.interval = setInterval(reportEvents, 3000);
    AnalyticsReporter.userId = getCookie("emid");
    if (!AnalyticsReporter.userId) {
        AnalyticsReporter.userId = v4();
    }
    setCookie("emid", AnalyticsReporter.userId, 7);
}

AnalyticsReporter.storeEvent = function storeEvent(action, currentState) {
    let event = {
        eventTime: Date.now(),
    }
    if (!EVENT_NUM[action]) {
        return;
    }
    if (!currentState.activeSegment) {
        event.itemNum = 0;
        event.segmentType = 0;
        event.itemPlayedTime = 0;
        event.itemRealTime = 0;
        event.event = EVENT_NUM[action];
    } else {
        event.itemNum = currentState.itemNum + 1;
        event.segmentType = getSegmentType(currentState);
        event.itemPlayedTime = getPlayedTime(currentState);
        event.itemRealTime = Date.now() - AnalyticsReporter.lastActionTime;
        event.event = EVENT_NUM[action];
    }
    AnalyticsReporter.lastActionTime = Date.now();
    AnalyticsReporter.events.push(event);
}

function reportEvents() {
    let toSendRows,
        toSendObj,
        xmlhttp;
    if (!AnalyticsReporter.events.length) {
        return ;
    }
    toSendRows = AnalyticsReporter.events.splice(0, AnalyticsReporter.events.length);
    toSendObj = {
        publisherId: AnalyticsReporter.publisherId,
        episodeId: AnalyticsReporter.episodeId,
        reportId: AnalyticsReporter.sessionId,
        metaDataId: AnalyticsReporter.metadataId,
        userId: AnalyticsReporter.userId,
        segmentEvents: toSendRows
    };
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
            /*
             * retry policy we might add on demand
            if (xmlhttp.status !== 200) {
                AnalyticsReporter.events = AnalyticsReporter.events.concat(toSendRows);
            }
            */
        }
    };
    xmlhttp.open("POST", ANALYTICS_BASE_URL + "report", true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(JSON.stringify(toSendObj));
}

function getSegmentType(currentState) {
    let typeString,
        type;
    if (currentState.activeSegment && currentState.activeSegment.title) {
        typeString = currentState.activeSegment.title.substring(0, 1);
    }
    return SEGMENT_TYPE[typeString];
}

function getPlayedTime(currentState) {
    if (currentState.activeSegment && currentState.itemTimeMs && 
        (currentState.itemStart || currentState.itemStart === 0)) {
        return parseInt(currentState.itemTimeMs - currentState.itemStart, 10);
    } 
    return null;
}

export default AnalyticsReporter;
