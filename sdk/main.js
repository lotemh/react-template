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

var container = document.querySelector('[data-elastic-media-player]');
var client;

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

if (container) {
    client = getClientByAccount(container);
} else {
    client = getClientByVideoElement();
}

function render(client) {
    ReactDOM.render(<Provider store={store}>{client}</Provider>, container);
}
if (client) {
    render(client);
}

// Eliminates the 300ms delay between a physical tap
// and the firing of a click event on mobile browsers
// https://github.com/ftlabs/fastclick
// This broke the ios buttons, so dont put it back unless its fixed
//FastClick.attach(document.body);

// Enable Hot Module Replacement (HMR)
if (module.hot) {
    render(client);
}

function getClientByVideoElement() {
    var players = document.querySelectorAll("[data-account]");
    let foundClient = false;
    let props = {};
    players.forEach((player, i)=> {
        if (foundClient) {
            return;
        }
        let brightcovePlayerId = player.getAttribute("data-player");
        if (brightcovePlayerId !== "V1xBaDVb6l" && brightcovePlayerId !== "default" && brightcovePlayerId !=="S1eJmZOTml" && brightcovePlayerId !== "S1AxOqLme") { 
            //TODO replace with desired playerId
            return;
        }
        if (!player.getAttribute("em-player")) {
            if (!player.getAttribute("id")) {
                player.setAttribute("id", "originalPlayer" + i);
            }
            foundClient = true;
            player.setAttribute("em-player", true);
            player.classList.add("player");
            parent = player.parentNode;
            container = document.createElement('div');
            parent.appendChild(container);

            props["data-video-id"] = player.getAttribute("data-video-id");
            props["data-account"] = player.getAttribute("data-account");
            props["data-embed"] =  "default";
            props["data-player"] = player.getAttribute("data-player");
            props["class"] = "video-js";
            props["data-application-id"] = "";
            props["publisherId"] = "9af0fb40-8c90-4006-a668-7844ed81b4d4";
            props["originalPlayerId"] = player.getAttribute("id");
            let scripts = document.getElementsByTagName("script");
            for (let i = 0; i < scripts.length; i++) {
                if (scripts[i].getAttribute("src") && scripts[i].getAttribute("src").startsWith("//players.brightcove.net/" + props["data-account"] + "/" + brightcovePlayerId)) {
                    props["data-brightcove-script"] = scripts[i].getAttribute("src");
                    break;
                }
            }
        }
        return true;
    });
    if (foundClient) {
        return React.createElement(Brightcove, props);
    } else {
        return null;
    }
}
