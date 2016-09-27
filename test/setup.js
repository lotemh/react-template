/**
 * Created by user on 9/27/2016.
 */

function setJsDomMocks() {
    var jsdom = require('jsdom')
    global.document = jsdom.jsdom('<!doctype html><html><body></body></html>') //This can be edited further
    global.window = global.document.defaultView
}

setJsDomMocks();
