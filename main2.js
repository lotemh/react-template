/**
 * Created by user on 10/9/2016.
 */

import 'babel-polyfill';
import 'whatwg-fetch';

import React from 'react';
import ReactDOM from 'react-dom';
import FastClick from 'fastclick';
import { Provider } from 'react-redux';
import Brightcove from './components/demoClients/kcetDemo2';

import store from './core/store';

var players = document.querySelectorAll('.video-js'),
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

if (players.length ===  1 && 
    (players[0].getAttribute("data-player") === "V1xBaDVb6l" || players[0].getAttribute("data-player") === "default")) {
    firstPlayer = players[0];
    firstPlayer.setAttribute("id", "player0");
    if (document.getElementById("vjs_video_3_html5_api")) {
        document.getElementById("vjs_video_3_html5_api").setAttribute("id", "player0_html5_api");
    }
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
// Eliminates the 300ms delay between a physical tap
// and the firing of a click event on mobile browsers
// https://github.com/ftlabs/fastclick
FastClick.attach(document.body);

// Enable Hot Module Replacement (HMR)
if (module.hot) {
    //render(sdkComponent);
}

