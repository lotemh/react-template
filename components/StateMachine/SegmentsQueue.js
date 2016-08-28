/**
 * Created by user on 8/28/2016.
 */

class SegmentsQueue {
  constructor(){
    this.queue = [];
  }

  add(segment){
    if (segment === undefined){
      return false;
    }
    if (this.queue.indexOf(segment) !== -1){
      return false;
    }
    this.queue.push(segment);
    return true;
  }

  next(){
    return this.queue.shift();
  }

  remove(segment){
    var segmentIndex = this.queue.indexOf(segment);
    this.queue.splice(segmentIndex, 1);
  }
}


export default SegmentsQueue;
