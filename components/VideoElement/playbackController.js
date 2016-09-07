/**
 * Created by user on 9/6/2016.
 */
import Logger from "../Logger/Logger";
import Player from "./Player";

class PlaybackController {
  constructor(logger){
    this.logger = logger || new Logger();
    this.activePlayer = null;
  }

  setPlayers(players){
    this.players = players;
  }

  createPlayers(players){
    var id = 0;
    return players.map(p => new Player(p, "player" + id++));
  }

  getActive(){
    return this.activePlayer;
  }

  setActive(player){
    this.activePlayer = player;
  }

  returnPlayer(player){
    this.players.push(player);
  }

  getFreePlayer(){
    return this.players.pop();
  }

  deactivatePlayer(player) {
    if (player) {
      player.pause();
      player.hide();
      this.returnPlayer(player)
    }
  }

  switchPlayers(oldPlayer, nextPlayer) {
    if (!nextPlayer) return;
    this.activatePlayer(nextPlayer);
    if (oldPlayer !== nextPlayer){
      this.deactivatePlayer(oldPlayer);
    }
  }

  activatePlayer(player){
    if (!player) {return;}
    this.setActive(player);
    var activePlayer = this.getActive();
    activePlayer.show();
    activePlayer.play();
  }

  play(){
    this.getActive().play();
  }

  pause(){
    this.getActive().pause();
  }
}

export default PlaybackController;
