/**
 * Created by user on 8/29/2016.
 */

class Segment{
  constructor(segment, title){
    Object.keys(segment).forEach(key => this[key] = segment[key]);
    this.title = title;
    this.player = null;
    this.isLoadingFlag = false;
  }

  isReady(){
    return this.player !== null;
  }

  isLoading(){
    return this.isLoadingFlag;
  }
}

export default Segment;
