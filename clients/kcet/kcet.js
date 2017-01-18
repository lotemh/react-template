import './kcet.css';
import '../../sdk/main.js';

import Tfx from '../../components/transitionEffects/TransitionEffect';


const kcetTfx = {
    SOCAL: 'em-tfx em-socal-tfx',
    STUDIO_A: 'em-tfx em-tfx-whoosh em-studio-a-tfx',
    BORDER_BLASTERS: 'em-tfx em-tfx-whoosh em-border-blasters-tfx',
}

Object.assign(Tfx, kcetTfx);
