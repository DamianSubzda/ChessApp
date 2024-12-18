import SignalRService from "./SignalRService.ts";
import config from "../config.json";
import { Game } from "../types/Game.ts";

class LobbyService extends SignalRService {
  constructor() {
    super(config.lobbyHubURL);
  }

  public async waitingGames(){
    await this.invoke("GetCurrentWaitingGames");
  }

  public onGameAdded(callback: (newgame: Game) => void): void{
    this.on("GameAdded", callback);
  }

  public onGameRemoved(callback: (oldGame: Game) => void): void{
    this.on("GameRemoved", callback);
  }

  public onWaitingGames(callback: (waitingGames: Game[]) => void): void{
    this.on("WaitingGames", callback);
  }

  public onGameStarted(callback: (game: Game) => void): void {
    this.on("GameStarted", callback);
  }

  public async joinGame(gameId: string){
    await this.invoke("JoinGame", gameId);
  }

  public async createGame(playerName: string){
    await this.invoke("CreateGame", playerName);
  }

  public onGameCreated(callback: (game: Game) => void): void {
    this.on("GameCreated", callback);
  }
  
}

export default new LobbyService();
