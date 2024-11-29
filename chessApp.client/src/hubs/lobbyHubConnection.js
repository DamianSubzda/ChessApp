import config from "./../config.json"
import * as singalR from '@microsoft/signalr';

export const createLobbyConnection = () => {
    return new singalR.HubConnectionBuilder()
    .withUrl(config.lobbyHubURL)
    .withAutomaticReconnect()
    .configureLogging(singalR.LogLevel.Information)
    .build();
};