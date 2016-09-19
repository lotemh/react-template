/**
 * Created by user on 8/29/2016.
 */
import SegmentsQueue from "./SegmentsQueue";
import Segment from "../Segment";

class SegmentManager {
    constructor(segments, logger){
        //todo: clone segments
        for (var segment in segments){
            segments[segment] = new Segment(segments[segment], segment);
        }
        this.segments = segments;
        this.activeSegment = this.segments.root;
        this.logger = logger;
    }

    /**
     * we need to choose the data structure
     * @returns {*}
     */
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

    getSegmentsToPrepare() {
        var newSegments = new SegmentsQueue();
        newSegments.add(this.getNext());
        var noActionSegment = this.get(this.getNextSegmentAccordingToAction("no_action"));
        if (noActionSegment !== undefined) {
            newSegments.add(noActionSegment);
            var noActionSegment2 = this.get(noActionSegment.no_action);
            newSegments.add(noActionSegment2);
        }
        return newSegments;
    }

    getNextSegmentAccordingToAction(action) {
        var segmentName = this.getActive()[action];
        return this.get(segmentName);
    }
    setContentUrl(url){
        this.getSegmentsSet().forEach(seg=>{seg.src = seg.src || url});
    }
    getNumberOtItems() {
        let maxNum = 0;
        Object.keys(this.segments).forEach((key) => {
            let num = SegmentManager.getItemNum(key);
            if (num && num > maxNum) {
                maxNum = num;
            }
        })
        return maxNum;
    }

    static getItemNum(title) {
        if (title && title.match(/[\d\.]+/))
            return parseInt(title.match(/[\d\.]+/)[0], 10) - 1;
    }
}

export default SegmentManager;
