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

const container = document.querySelector('[data-elastic-media-account]');

var clientMap = {
    '1234': Kcet
};

function getClientByAccount(account) {
    return clientMap[account];
}

function getClient(container) {
    var account = container.getAttribute('data-elastic-media-account');
    var props = {};
    var playerAttributesList = [];
    for (var i=0; i < container.attributes.length; i++){
        var attr = container.attributes[i];
        if (attr.nodeName === 'data-video-id'){
            props.contentUrl = attr.nodeValue;
        }
        props[attr.nodeName] = attr.nodeValue;
    }
    var client = getClientByAccount(account);
    return React.createElement(client, props);
}

var client = getClient(container);

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

