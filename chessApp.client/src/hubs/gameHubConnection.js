import config from "../config.json"
import * as singalR from '@microsoft/signalr';

export const createGameConnection = () => {
    return new singalR.HubConnectionBuilder()
    .withUrl(config.gameHubURL)
    .withAutomaticReconnect()
    .configureLogging(singalR.LogLevel.Information)
    .build();
};