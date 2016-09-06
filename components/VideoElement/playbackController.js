/**
 * Created by user on 9/6/2016.
 */
import Logger from "../Logger/Logger";

class PlaybackController {
  constructor(logger){
    this.logger = logger || new Logger();
    this.activePlayer = null;
  }
  
  getActive(){
    return this.activePlayer;
  }
  
  setActive(player){
    this.activePlayer = player;
  }
}

export default PlaybackController;
