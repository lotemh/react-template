/**
 * Created by user on 9/5/2016.
 */
import React, { PropTypes } from 'react';
import * as ReactDOM from "react/lib/ReactDOM";

class BrightCovePlayer extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      src: props.src || "",
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
    return this.refs.player;
  }

  render() {
    return (
      <div>
        <video className={this.getClassName()} ref="player" data-account="5114477724001"
               data-player="ryxQpOD6j"
               data-embed="default"
               data-application-id>
          <source type="video/mp4" ref="source" src={this.props.src}/>
        </video>
        <script src="//players.brightcove.net/5114477724001/ryxQpOD6j_default/index.min.js"></script>
      </div>
    );
  }

  /******************************/

  pause() {
    this.getPlayer().pause();
  }

  play(){
    return this.getPlayer().play();
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

  seek(timeInSeconds){
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

export default BrightCovePlayer;
