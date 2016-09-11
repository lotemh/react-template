import React, { PropTypes } from 'react';
import * as ReactDOM from "react/lib/ReactDOM";

function isSrcEqual(src, otherSrc) {
  return otherSrc.split("#")[0] === (src.split("#")[0]);
}

class VideoElement extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      isHidden: true
    };

  };

  handleResize(e) {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    }, () => {
      this.props.updateStyle({
        width: this.state.width,
        height: this.state.height
      });
    });
  };

  componentDidMount() {
    window.addEventListener('resize', this.handleResize.bind(this));
    this.props.updateStyle({
      width: this.state.width,
      height: this.state.height
    });
  };

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  static propTypes = {
    src: PropTypes.string,
    className: PropTypes.string
  };

  getClassName(){
    var className = 'player';
    className += this.state.isHidden ? ' hidden' : '';
    return className;
  }

  metaDataLoaded (m) {
    //console.log("got meta data!!", m);
    //console.log("video width: ", ReactDOM.findDOMNode(this.refs.video).videoWidth);
    //console.log("video height: ", ReactDOM.findDOMNode(this.refs.video).videoHeight);
  }
  getPlayer () {
    return ReactDOM.findDOMNode(this);
  }

  render() {
    return (
      <video ref={"video"}
             width={this.state.width}
             height={this.state.height}
             className={this.getClassName()}
             onLoadedMetadata={this.metaDataLoaded.bind(this)}
             webkit-playsinline
             preload="none">
        <source type="video/mp4" ref="source" src={this.props.src}/>
      </video>
    );
  }

  /******************************/

  pause() {
    this.getPlayer().pause();
  }

  play(callbackOnPlay){
    this.getPlayer().onplay = function() {
      console.log("on play fired!!!");
      if (callbackOnPlay) {
        callbackOnPlay(true);
      }
    };
    this.getPlayer().play();
  }

  show(){
    this.setState({isHidden: false});
  }

  hide(){
    this.setState({isHidden: true});
  }

  setSrc(src){
    this.refs.source.setAttribute('src', src);
  }

  load(){
    this.getPlayer().load();
  }

  seek(timeInMs){
    var timeInSeconds = timeInMs/1000;
    this.getPlayer().currentTime = timeInSeconds;
  }

  getCurrentTime(){
    return this.getPlayer().currentTime * 1000;
  }

  addLoadedDataEvent(listener){
    this.getPlayer().addEventListener('loadeddata', listener);
  }

  addTimeUpdateEvent(listener){
    this.getPlayer().addEventListener("timeupdate", listener, false);
  }

  removeTimeUpdateEvent(listener){
    this.getPlayer().removeEventListener("timeupdate", listener);
  }

}

export default VideoElement;
