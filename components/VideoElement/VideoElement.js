import React, { PropTypes } from 'react';
import * as ReactDOM from "react/lib/ReactDOM";

function isSrcEqual(src, otherSrc) {
  return otherSrc.split("#")[0] === (src.split("#")[0]);
}

class VideoElement extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      isHidden: true
    };
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

  getPlayer () {
    return ReactDOM.findDOMNode(this);
  }

  render() {
    return (
      <video className={this.getClassName()} preload="none">
        <source type="video/mp4" ref="source" src={this.props.src}/>
      </video>
    );
  }

  /******************************/

  pause() {
    this.getPlayer().pause();
  }

  play(){
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
