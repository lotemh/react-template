/**
 * Created by user on 9/5/2016.
 */
import React, { PropTypes } from 'react';
import * as ReactDOM from "react/lib/ReactDOM";

function isSrcEqual(src, otherSrc) {
  return otherSrc.split("#")[0] === (src.split("#")[0]);
}

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
    return ReactDOM.findDOMNode(this);
  }

  render() {
    return (
      // <video className={this.getClassName()} preload="none">
      //   <source type="video/mp4" ref="source" src="https://s3.eu-central-1.amazonaws.com/phase1-episodes/mm080616.mp4"/>
      // </video>
      <div>
        <video id="myPlayerID"
               data-account="3676484087001"
               data-player="78ef7d78-18d9-4459-a6da-d94e46163076"
               data-embed="default"
               class="video-js"
               controls></video>
        <script src="//players.brightcove.net/3676484087001/78ef7d78-18d9-4459-a6da-d94e46163076_default/index.min.js"></script>
        <script src="//players.brightcove.net/videojs-overlay/lib/videojs-overlay.js"></script>
      </div>
    );
  }

  componentWillMount() {
    videojs("myPlayerID").on('loadedmetadata', function () {
      var myPlayer = this;
      myPlayer.play();
      myPlayer.overlay({
        overlays: [{
          content: 'This event-triggered overlay message appears when the video is playing',
          start: 'play',
          end: 'pause'
        }]
      });
    });
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

export default BrightCovePlayer;
