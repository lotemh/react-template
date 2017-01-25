/**
 * Created by user on 10/9/2016.
 */
import './main.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from '../components/App';
import store from '../core/store';
if (! window._babelPolyfill) {
    require("babel-polyfill");
}

main();

function main(){
    const container = document.querySelector('#parent');
    if (container){
        const client = React.createElement(App, {});
        ReactDOM.render(<Provider store={store}>{client}</Provider>, container);
    }
}



