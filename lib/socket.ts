import {WebSocketServer, WebSocket} from 'ws';

const wss = new WebSocketServer(
    {
        port: 8080
    }
);

wss.on('connection', (socket, request) => {
    
    const ip = request.socket.remoteAddress;

    console.log('Connection Established!!');

    socket.on('message', (rawData) => {
        const message = rawData.toString();

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) client.send(`Server message: ${message}`);
        });
    });

    socket.on('error', (error) => {
        console.log(`Error: ${error.message} on IP: ${ip}`);
    });

    socket.on('close', () => {
        console.log(`Connection closed on IP: ${ip}`);
    })
})