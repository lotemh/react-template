/**
 * Created by user on 8/29/2016.
 */
import SegmentsQueue from "./SegmentsQueue";
import Segment from "../Segment";

class SegmentManager {
  constructor(segments, logger){
    //todo: clone segments
    for (var segment in segments){
      segments[segment].title = segment;
      segments[segment] = new Segment(segments[segment], segment);
    }
    this.segments = segments;
    this.activeSegment = this.segments.root;
    // this.segmentsQueue = new SegmentsQueue();
    // this.segmentsQueue.add(this.getNext());
    this.readySegments = {};
    this.segmentLoading = null;
    this.logger = logger;
  }

  getSegments(){
    return this.segments;
  }

  getSegmentsSet(){
    return Object.keys(this.getSegments()).map(seg => this.get(seg));
  }

  get(key){
    if (key === undefined){
      return undefined;
    }
    return this.getSegments()[key];
  }

  getNext() {
    return this.get(this.getActive().next);
  }

  getActive(){
    return this.activeSegment;
  }

  setActive(segment){
    this.activeSegment = segment;
  }

  getPrepareQueue(){
    return this.segmentsQueue;
  }

  insertNextSegmentToPrepareQueue() {
    var nextSegment = this.getNext();
    this.segmentsQueue.add(nextSegment);
  }

  setReady(segment){
    var loadedSegment = this.segmentLoading;
    this.segmentLoading = null;
    this.readySegments[segment] = segment;
    loadedSegment.loadedCallback();
  }

  setLoading(segment, callback){
    segment.loadedCallback = callback;
    this.segmentLoading = segment;
  }

  getDeprecatedSegments(){
    var segmentsToPrepare = this.getSegmentsToPrepare();
    var deprecated = Object.keys(this.readySegments)
      .filter(s => !segmentsToPrepare.get(this.readySegments[s].title))
      .map(s => this.readySegments[s]);
    deprecated.forEach(s => delete this.readySegments[s.title]);
    return deprecated;
  }

  getSegmentsToPrepare() {
    var newSegments = new SegmentsQueue();
    newSegments.add(this.getNext());
    var noActionSegment = this.get(this.getActive().no_action);
    newSegments.add(noActionSegment);
    if (noActionSegment !== undefined) {
      var noActionSegment2 = this.get(noActionSegment.no_action);
      newSegments.add(noActionSegment2);
    }
    return newSegments;
  }

  setSegmentsQueue(){
    this.segmentsQueue = this.getSegmentsToPrepare();
  }

  isLoading(){
    return this.segmentLoading !== null;
  }
}

export default SegmentManager;
