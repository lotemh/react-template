/**
 * Created by user on 10/9/2016.
 */

import 'babel-polyfill';
import 'whatwg-fetch';

import React from 'react';
import ReactDOM from 'react-dom';
import FastClick from 'fastclick';
import { Provider } from 'react-redux';
import Kcet from './components/demoClients/kcetDemo';

import store from './core/store';

const container = document.querySelector('[data-elastic-media-player]');

const clientMap = {
    'brightcove': createKcetElement
};

function createKcetElement(){
    var props = {};
    for (var i=0; i < container.attributes.length; i++){
        var attr = container.attributes[i];
        props[attr.nodeName] = attr.nodeValue;
    }
    return React.createElement(Kcet, props);
}

function getClientByAccount(container) {
    var account = container.getAttribute('data-elastic-media-player');
    return clientMap[account](container);
}

var client = getClientByAccount(container);

function render(client) {
    ReactDOM.render(<Provider store={store}>{client}</Provider>, container);
}

render(client);

// Eliminates the 300ms delay between a physical tap
// and the firing of a click event on mobile browsers
// https://github.com/ftlabs/fastclick
FastClick.attach(document.body);

// Enable Hot Module Replacement (HMR)
if (module.hot) {
    render();
}

