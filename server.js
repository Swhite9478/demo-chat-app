const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const port = 3000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', socket => {
    console.log('New Connection');

    socket.on('new-join', data => {
        socket.broadcast.emit('recieved-chat-message', { message: data.message});
        socket.emit('sent-message', { message: data.message, user:undefined });
    });

    socket.on('send-chat-message', data => {
        socket.broadcast.emit('recieved-chat-message', {message: data.message, user: data.user});
        socket.emit('sent-message',{message: data.message});
    });
});

io.on('disconnect', () => {
    console.log('Client Disconnected!');
})

server.listen(port, () => console.log(`\x1b[40m`, `\x1b[32m`,
    `
    [+] Server         : http://localhost:${port}
    [+] Socket         : ws://localhost:${port}
    [~] Running Server...
`, `\x1b[0m`));