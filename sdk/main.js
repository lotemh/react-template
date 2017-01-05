/**
 * Created by user on 10/9/2016.
 */
import './main.css';
import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Brightcove from '../components/demoClients/kcetDemo';
import HTML5 from '../components/demoClients/html5Demo';
import store from '../core/store';
if (! window._babelPolyfill) {
    require("babel-polyfill");
}

const clientMap = {
    'brightcove': createSdkWithBrightcovePlayer
};

main();

function main(){
    if (isBrightcove()){
        renderBrightcoveClient();
    } else if (isHTML5()){
        renderHTML5Client();
    } else {
        getClientByVideoElement();
    }
}

function renderBrightcoveClient() {
    const container = document.querySelector('[data-elastic-media-player]');
    const client = createSdkCompByAccount(container);
    renderComponent(client, container);
}

function isBrightcove(){
    return !!document.querySelector('[data-elastic-media-player="brightcove"]');
}
function isHTML5(){
    return !!document.querySelector('[data-elastic-media-player="html5"]');
}

function renderHTML5Client() {
    const container = document.querySelector('[data-elastic-media-player="html5"]');
    var props = {};
    for (var i=0; i < container.attributes.length; i++){
        var attr = container.attributes[i];
        props[attr.nodeName] = attr.nodeValue;
    }
    props["publisherId"] = props["data-elastic-media-account"];
    props["src"] = props["data-video-url"];
    const client = React.createElement(HTML5, props);
    renderComponent(client, container);
}

function createSdkWithBrightcovePlayer(){
    const container = document.querySelector('[data-elastic-media-player]');
    var props = {};
    for (var i=0; i < container.attributes.length; i++){
        var attr = container.attributes[i];
        props[attr.nodeName] = attr.nodeValue;
    }
    return React.createElement(Brightcove, props);
}

function createSdkCompByAccount(container) {
    var player = container.getAttribute('data-elastic-media-player');
    return clientMap[player]();
}

function renderComponent(client, container){
    if (client) {
        render(client, container);
    }

// Enable Hot Module Replacement (HMR)
    if (module.hot) {
        render(client, container);
    }
}

function render(client, container) {
    ReactDOM.render(<Provider store={store}>{client}</Provider>, container);
}

function getClientByVideoElement() {
    if (!document.currentScript || !document.currentScript.parentNode) {
        return;
    }
    let container = null;

    hideVjsControlsBar();
    var players = document.currentScript.parentNode.querySelectorAll("[data-account]");
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
        const sdkClient = React.createElement(Brightcove, props);
        renderComponent(sdkClient, container);
    }
}

function hideVjsControlsBar() {
    const vjsControlBar = document.querySelector('[data-account="136368194"] .vjs-control-bar');
    if (vjsControlBar) {
        vjsControlBar.style.display = 'none';
        vjsControlBar.classList.add('hide-controls');
    }
}
