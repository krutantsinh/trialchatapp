const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const userDefinedValues = {};

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files
app.use(express.static(__dirname + '/public'));

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for incoming messages
    socket.on('chat message', (msg) => {
        if (msg.message.startsWith('/rem')) {
            handleRemCommand(msg);
        } else {
            io.emit('chat message', msg);
        }
    });
    function handleRemCommand(msg) {
        const commandArgs = msg.message.split(' ');
        if (commandArgs.length >= 3 && commandArgs[0] === '/rem') {
            const name = commandArgs[1];
            const value = commandArgs.slice(2).join(' ');
            userDefinedValues[name] = value;
            io.emit('chat message', { username: msg.username, message: `Value set for ${name}` });
        } else if (commandArgs.length === 2 && commandArgs[0] === '/rem') {
            const name = commandArgs[1];
            const value = userDefinedValues[name];
            if (value !== undefined) {
                io.emit('chat message', { username: msg.username, message: `${name}: ${value}` });
            } else {
                io.emit('chat message', { username: msg.username, message: `No value set for ${name}` });
            }
        }
    }

    // Handle user joined
    socket.on('user joined', (username) => {
        io.emit('user joined', username);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
