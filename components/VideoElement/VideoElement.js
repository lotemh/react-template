import React, { PropTypes } from 'react';
import * as ReactDOM from "react/lib/ReactDOM";

class VideoElement extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      src: props.src || "",
      isPlaying: false,
      isHidden: true
    };
  }

  getClassName(){
    var className = 'player';
    className += this.state.isHidden ? ' hidden' : '';
    return className;
  }
  getPlayer () {
    return ReactDOM.findDOMNode(this);
  }
  pause() {
    this.getPlayer().pause();
  }
  play(){
    var playerdomElement = this.getPlayer();
    playerdomElement.play();
  }
  show(){
    this.setState({isHidden: false});
  }
  hide(){
    this.setState({isHidden: true});
  }
  prepare(src, callback){
    var playerDomElement = this.getPlayer();
    this.refs.source.setAttribute('src', src);
    playerDomElement.load();
    playerDomElement.addEventListener('loadeddata', function() {
      callback();
    }, false);
  }
  seek(timestamp){
    var timeInSeconds = timestamp/1000;
    this.getPlayer().currentTime = timeInSeconds;
  }
  getCurrentTime(){
    return this.getPlayer().currentTime * 1000;
  }
  getId(){
    return this.props.playerId;
  }
  addTimeUpdateEvent(listener){
    this.getPlayer().addEventListener("timeupdate", listener, false);
  }
  removeTimeUpdateEvent(listener){
    this.getPlayer().removeEventListener("timeupdate", listener);
  }
  render() {
    return (
      <video id={this.props.playerId} className={this.getClassName()} preload="">
        <source type="video/mp4" ref="source" src="https://s3.eu-central-1.amazonaws.com/phase1-episodes/mm080616.mp4"/>
      </video>
    );
  }

}

export default VideoElement;
