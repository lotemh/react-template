/**
 * Created by user on 10/9/2016.
 */
import './main.css';
if (! window._babelPolyfill) {
    require("babel-polyfill");
}

import 'whatwg-fetch';


import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Brightcove from '../components/demoClients/kcetDemo';

import store from '../core/store';

var players = document.getElementsByClassName('video-js'),
    firstPlayer,
    parent,
    sdkSpace,
    props = {},
    scripts,
    scriptUrl,
    sdkComponent;

function render(sdkComponent) {
    ReactDOM.render(<Provider store={store}>{sdkComponent}</Provider>, sdkSpace);
}
if (!players[0].getAttribute("em-player")) {
    console.log("running");
    firstPlayer = players[0];
    if (!firstPlayer.getAttribute("id")) {
        firstPlayer.setAttribute("id", "originalPlayer1");
    }
    players[0].setAttribute("em-player", true);
    players[0].classList.add("player");
    parent = firstPlayer.parentNode;
    sdkSpace = document.createElement('div');
    parent.appendChild(sdkSpace);

    props["data-video-id"] = firstPlayer.getAttribute("data-video-id");
    props["data-account"] = firstPlayer.getAttribute("data-account");
    props["data-embed"] =  "default";
    props["data-player"] = firstPlayer.getAttribute("data-player");
    props["class"] = "video-js";
    props["data-application-id"] = "";
    props["publisherId"] = "9af0fb40-8c90-4006-a668-7844ed81b4d4";
    props["episodeId"] = firstPlayer.getAttribute("data-video-id");
    props["originalPlayerId"] = firstPlayer.getAttribute("id");
    scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].getAttribute("src") && scripts[i].getAttribute("src").startsWith("//players.brightcove.net/" + props["data-account"] + "/" + props["data-player"])) {
            scriptUrl = scripts[i].getAttribute("src");
        }
    }
    props["data-brightcove-script"] = scriptUrl;

    sdkComponent = React.createElement(Brightcove, props);;
    render(sdkComponent);
}

/*
const container = document.querySelector('[data-elastic-media-player]');

const clientMap = {
    'brightcove': createSdkWithBrightcovePlayer
};

function createSdkWithBrightcovePlayer(){
    var props = {};
    for (var i=0; i < container.attributes.length; i++){
        var attr = container.attributes[i];
        props[attr.nodeName] = attr.nodeValue;
    }
    return React.createElement(Brightcove, props);
}

function getClientByAccount(container) {
    var player = container.getAttribute('data-elastic-media-player');
    return clientMap[player](container);
}

var client = getClientByAccount(container);

function render(client) {
    ReactDOM.render(<Provider store={store}>{client}</Provider>, container);
}

render(client);
*/

// Eliminates the 300ms delay between a physical tap
// and the firing of a click event on mobile browsers
// https://github.com/ftlabs/fastclick
// This broke the ios buttons, so dont put it back unless its fixed
//FastClick.attach(document.body);

// Enable Hot Module Replacement (HMR)
if (module.hot) {
    //render(client);
}

