const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const port = 3000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
io.eio.pingTimeout = 120000; // 2 minutes
io.eio.pingInterval = 5000;  // 5 seconds

const users = {};

const updateAllClients = (socket, data) => {
    if(!users[socket.id]) {
        socket.emit('user-refresh');
    } 
    socket.broadcast.emit('recieved-chat-message', { message: data.message, user: users[socket.id] });
    socket.emit('sent-message', { message: data.message });
    
}

const handleNewUserConnected = (socket, data) => {
    console.log(`${data.user} Connected!`);
    users[socket.id] = data.user;
    socket.broadcast.emit('recieved-chat-message', { message: data.message });
    socket.emit('sent-message', { message: data.message, user: undefined });
}

const handleUserDisconnected = (socket) => {
    if(users[socket.id]) {
        console.log(`${users[socket.id]} Disconnected!`);
        socket.broadcast.emit('user-disconnected', users[socket.id]);
        delete users[socket.id];
    }
}

io.on('connection', socket => {

    socket.on('user-connected', data => {
        handleNewUserConnected(socket, data);
    });

    socket.on('refresh-user', name => {
        users[socket.id] = name;
    })

    socket.on('send-chat-message', data => {
        updateAllClients(socket, data);
    });

    socket.on('user-is-typing', () => {
        if(!users[socket.id]) {
            socket.emit('user-refresh');
        }
        socket.broadcast.emit('notify-users-someone-is-typing', 
        users[socket.id]);
    })

    socket.on('user-is-done-typing', () => {
        socket.broadcast.emit('clear-user-is-typing');
    })

    socket.on('disconnect', () => {
        handleUserDisconnected(socket);
    })
});

server.listen(port, () => console.log(`\x1b[40m`, `\x1b[32m`,
    `
    [+] Server         : http://localhost:${port}
    [+] Socket         : ws://localhost:${port}
    [~] Running Server...
`, `\x1b[0m`));