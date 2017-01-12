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
    'brightcove': renderBrightcoveClient,
    'html5': renderHTML5Client

};

main();

function main(){
    const container = document.querySelector('[data-elastic-media-player]');
    if (container){
        var player = container.getAttribute('data-elastic-media-player');
        return clientMap[player](container);
    } else {
        renderPlugin();
    }
}

function renderHTML5Client(container) {
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

function renderBrightcoveClient(container){
    var props = {};
    for (var i=0; i < container.attributes.length; i++){
        var attr = container.attributes[i];
        props[attr.nodeName] = attr.nodeValue;
    }
    props["publisherId"] = props["data-elastic-media-account"];
    const client = React.createElement(Brightcove, props);
    renderComponent(client, container);
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

function renderPlugin() {
    if (!document.currentScript || !document.currentScript.parentNode) {
        return;
    }
    let container = null;

    var players = document.currentScript.parentNode.querySelectorAll("[data-account]");
    let foundClient = false;
    let props = {};
    players.forEach((player, i)=> {
        if (foundClient) {
            return;
        }
        let brightcovePlayerId = player.getAttribute("data-player");
        if (brightcovePlayerId === "V1xBaDVb6l" && process.env.NODE_ENV !== "development") {
            return;
        }
        if (brightcovePlayerId !== "r1hasDFSe" &&
            brightcovePlayerId !== "V1xBaDVb6l" &&
            brightcovePlayerId !=="S1eJmZOTml" &&
            brightcovePlayerId !== "S1AxOqLme") {
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
            props["contentUrl"] = props["data-video-id"];
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


