/**
 * Created by user on 8/29/2016.
 */

class Segment{
  constructor(segment, title){
    segment.title = title;
    segment.player = null;
    segment.isLoading = false;
    return segment;
  }
  
  isReady(){
    return this.player !== null;
  }
  
  isLoading(){
    return this.isLoading;
  }
}

export default Segment;
