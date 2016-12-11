import {getTimeInSeconds} from '../utils/timeUtils';

const isSrcEqual = function(src, otherSrc) {
  return otherSrc.split("#")[0] === (src.split("#")[0]);
};

const buildSrc = function(src, inTime, outTime) {
    let segment = `${src}#t=${getTimeInSeconds(inTime)}`;
    if (outTime) {
        segment += `,${getTimeInSeconds(outTime)}`;
    }
    return segment;
};

export {isSrcEqual, buildSrc}


