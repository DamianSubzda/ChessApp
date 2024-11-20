
import * as singalR from '@microsoft/signalr';

export const createLobbyConnection = () => {
    return new singalR.HubConnectionBuilder()
    .withUrl('https://localhost:7168/lobbyHub')
    .withAutomaticReconnect()
    .configureLogging(singalR.LogLevel.Information)
    .build();
};