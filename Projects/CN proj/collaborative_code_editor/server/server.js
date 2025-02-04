const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const udpServer = require('./udpserver');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let documentContent = '';
let users = [];
let currentLanguage = 'javascript'; 
const userMap = new Map();

app.use(express.static('../client'));

wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.send(JSON.stringify({
        type: 'load-document',
        content: documentContent,
        language: currentLanguage 
    }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'update-document':
                documentContent = data.content;
                broadcastToAll({ type: 'update-document', content: documentContent }, ws);
                break;
            case 'user-join':
                userMap.set(ws, data.username);
                users.push(data.username);
                broadcastToAll({ type: 'update-user-list', users });
                break;
            case 'chat':
                broadcastToAll({ type: 'chat', message: `${data.username}: ${data.message}` });
                break;
            case 'language-change':
                currentLanguage = data.language; 
                broadcastToAll({ type: 'language-change', language: currentLanguage });
                break;
        }
    });

    ws.on('close', () => {
        const username = userMap.get(ws);
        if (username) {
            users = users.filter(user => user !== username);
            userMap.delete(ws);
            broadcastToAll({ type: 'update-user-list', users });
        }
        console.log('Client disconnected');
    });
});

function broadcastToAll(data, excludeWs = null) {
    wss.clients.forEach(client => {
        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

udpServer();
