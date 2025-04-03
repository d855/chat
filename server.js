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
            const userInfo = {
                username: message.user,
                color: getRandomColor()
            }
            clients.set(ws, userInfo)
            console.log('Client connected:', userInfo.username)

            // send message history to the connected client
            ws.send(JSON.stringify({ "type": "history", "messages": messages}))

            broadcast({
                type: 'system',
                text: `${userInfo.username} joined the chat`,
                time: new Date().toLocaleTimeString(),
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
                    time: new Date().toLocaleTimeString(),
                    color: client.color
                }

                broadcast(msg)
            }
            messages.push(newMessage)
        }

    })

    ws.on('close', () => {
        let msg = clients.get(ws).username + ' left the chat';

        broadcast({
            type: 'system',
            text: msg,
        })

        console.log(msg)
    })
})

function broadcast(data) {
    const msg = JSON.stringify(data)
    wss.clients.forEach(client => {
        client.send(msg)
    })
}

function getRandomColor(){
    const hue = Math.floor(Math.random() * 360);

    return `hsl(${hue}, 70%, 80%)`;
}

server.listen(3000, () => {
    console.log('Server running on port: 3000')
})