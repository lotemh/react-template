/**
 * Created by user on 8/29/2016.
 */

class Segment{
  constructor(segment, title){
    Object.keys(segment).forEach(key => this[key] = segment[key]);
    this.title = title;
  }
}

export default Segment;
