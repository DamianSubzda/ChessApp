import * as signalR from "@microsoft/signalr";

export default abstract class SignalRService {
  protected connection: signalR.HubConnection | null = null;
  constructor(private hubUrl: string) {}

  public async startConnection(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log("Connection already active.");
      return;
    }

    if (this.connection?.state === signalR.HubConnectionState.Disconnecting) {
      await new Promise((resolve) => {
        const checkState = setInterval(() => {
          if (this.connection?.state !== signalR.HubConnectionState.Disconnecting) {
            clearInterval(checkState);
            resolve(null);
          }
        }, 100)
      });
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      console.log(`Connected to hub: ${this.hubUrl}`);
    } catch (error) {
      console.error(`Error starting connection to ${this.hubUrl}:`, error);
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.stop();
      console.log(`Connection to ${this.hubUrl} stopped.`);
      this.connection = null;
    }
  }

  public async invoke(methodName: string, ...args: any[]): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connecting) {
      await new Promise((resolve) => {
        const checkState = setInterval(() => {
          if (this.connection?.state !== signalR.HubConnectionState.Connecting) {
            clearInterval(checkState);
            resolve(null);
          }
        }, 100)
      });
    }

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke(methodName, ...args);
      } catch (error) {
        console.error(`Error invoking method '${methodName}' on ${this.hubUrl}:`, error);
        throw error;
      }
    } else {
      console.warn(`Cannot invoke '${methodName}', connection is not active.`);
    }
  }

  public async on(methodName: string,callback: (...args: any[]) => void): Promise<void> {
    if (!this.connection) {
      console.warn(`Cannot register listener for '${methodName}', connection not initialized.`);
      return;
    }
    this.connection.off(methodName);
    this.connection.on(methodName, (...args) => {
      callback(...args);
    });
    } 

}
