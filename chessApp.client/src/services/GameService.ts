import SignalRService from "./SignalRService.ts";
import config from "./../config.json";
import { Move } from "../types/Move";
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

  public onGameStarted(callback: () => void): void {
    this.on("GameStarted", callback);
  }

  public async onGameFull(callback: () => void): Promise<void> {
    this.on("GameFull", callback);
  }

  public onPlayerJoined(callback: (playerData: Player) => void): void {
    this.on("PlayerJoined", callback);
  }

  public async makeMove(move: Move) {
    await this.invoke("MakeMove", this.gameId, move);
  }

  public onOpponentMoveMade(callback: (move: Move) => void): void {
    this.on("MadeMove", callback);
  }

  public onPlayerLeft(callback: () => void): void {
    this.on("PlayerLeft", async () => {
        callback();
        await this.stopConnection();
    });
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
