const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let messages = [];
let clients = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        message = JSON.parse(message)

        if(message.type === 'system'){
            const userInfo = {username: message.user}
            clients.set(ws, userInfo)
            console.log('Client connected:', userInfo.username)

            broadcast({
                type: 'system',
                text: `${userInfo.username} joined the chat`,
                time: new Date().toLocaleTimeString()
            })
        } else {
            const newMessage = {
                type: 'chat',
                text: message.text,
                time: new Date().toLocaleTimeString()
            }

            const client = clients.get(ws)
            if(client) {
                const msg = {
                    type: 'chat',
                    user: client.username,
                    text: message.text,
                    time: new Date().toLocaleTimeString()
                }

                broadcast(msg)
            }
            messages.push(newMessage)
        }

    })
})

function broadcast(data) {
    const msg = JSON.stringify(data)
    wss.clients.forEach(client => {
        client.send(msg)
    })
}

/*TODO: Handle client disconnection */
wss.on('close', (ws) => {
    console.log('Client disconnected')
})


server.listen(3000, () => {
    console.log('Server running on port: 3000')
})