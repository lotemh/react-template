/**
 * Created by user on 9/27/2016.
 */

function setJsDomMocks() {
    const jsdom = require('jsdom'); // eslint-disable-line global-require
    // This can be edited further
    global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
    global.window = global.document.defaultView;
}

setJsDomMocks();
