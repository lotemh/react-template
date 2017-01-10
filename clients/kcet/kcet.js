require('./kcet.css');
require('../../sdk/main.js')

const Tfx = require('../../components/transitionEffects/TransitionEffect');

console.log(Tfx);

const kcetTfx = {
    SOCAL: 'tfx socal-tfx',
    STUDIO_A: 'tfx tfx-whoosh studio-a-tfx',
    BORDER_BLASTERS: 'tfx tfx-whoosh border-blasters-tfx',
}

Object.assign(Tfx.TransitionEffect, kcetTfx);
