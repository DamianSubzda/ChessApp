import SignalRService from "./SignalRService.ts";
import config from "./../config.json";
import { Game } from "../types/Game.ts";
import { GameTurn } from "../types/GameTurn.ts";
import { GameResult } from "../types/GameResult.ts";
import { Player } from "../types/Player.ts";

class GameService extends SignalRService {
  private gameId: string | null;
  constructor() {
    super(config.gameHubURL);
  }

  public async joinGame(gameId: string, playerName: string): Promise<void> {
    this.gameId = gameId;
    await this.startConnection().then(async () => {
        await this.invoke("JoinGameRoom", this.gameId, playerName);
    });
  }

  public onGameStarted(callback: (game: Game) => void): void {
    this.on("GameStarted", callback);
  }

  public async onGameFull(callback: () => void): Promise<void> {
    this.on("GameFull", callback);
  }

  public onPlayerJoined(callback: (player: Player) => void): void {
    this.on("PlayerJoined", callback);
  }

  public async makeTurn(turn: GameTurn) {
    await this.invoke("PlayerMadeGameTurn", this.gameId, turn);
  }

  public onRecivedMove(callback: (turn: GameTurn) => void): void {
    this.on("MadeTurn", callback);
  }

  public onGameOver(callback: (result: GameResult) => void): void {
    this.on("GameOver", callback);
  }

  public async leaveGame(){
    await this.invoke("LeaveGameRoom", this.gameId);
  }

  public onTimeRunOut(callback: () => void): void {
    this.on("TimeRunOut", async () => {
        callback();
        await this.stopConnection();
    });
  }

  public async timeRunOut(){
    await this.invoke("TimeRunOut", this.gameId);
    await this.stopConnection();
  }

  public onCheckmate(callback: () => void): void {
    this.on("Checkmate", async () => {
        callback();
        await this.stopConnection();
    });
  }

  public async checkmate() {
    await this.invoke("PlayerCheckmated", this.gameId);
    await this.stopConnection();
  }

  public onPat(callback: () => void): void {
    this.on("Pat", async () => {
        callback();
        await this.stopConnection();
    });
  }

  public async pat() {
    await this.invoke("PlayerInPat", this.gameId);
    await this.stopConnection();
  }

  public onDrawRequest(callback: () => void): void {
    this.on("DrawRequest", callback);
  }

  public async sendDrawRequest() {
    await this.invoke("SendDrawRequest", this.gameId);
  }

  public onAcceptDraw(callback: () => void): void {
    this.on("AcceptDraw", async () => {
        callback();
        await this.stopConnection();
    });
  }
  
  public async acceptDraw(){
    await this.invoke("AcceptDrawRequest", this.gameId);
    await this.stopConnection();
  }

  public onDeclineDraw(callback: () => void): void {
    this.on("DeclineDraw", callback);
  }

  public async declineDraw(){
    await this.invoke("DeclineDrawRequest", this.gameId);
  }

  public onResign(callback: () => void): void {
    this.on("Resign", async () => {
        callback();
        await this.stopConnection();
    });
  }

  public async resignGame(): Promise<void> {
    await this.invoke("ResignGame", this.gameId);
    await this.stopConnection();
  }
}

export default new GameService();
