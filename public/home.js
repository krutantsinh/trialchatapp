$(function () {
    $('#modal-username').focus();

    const socket = io();
    const usernameInput = $('#modal-username');
    const modalSubmitButton = $('#modal-submit');
    const form = $('#form');
    const input = $('#input');
    const nameModal = $('#nameModal');
    let currentUsername = '';

    nameModal.show();

    modalSubmitButton.click(() => {
        const username = usernameInput.val().trim();
        if (username !== '') {
            currentUsername = username;
            socket.emit('user joined', username);
            nameModal.hide();
        }
    });

    input.keydown((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const inputValue = input.val().trim();
            if (inputValue.startsWith('/')) {
                handleSlashCommand(inputValue);
                input.val('');
            } else {
                sendChatMessage();
            }
        }
    });

    form.submit((e) => {
        e.preventDefault();
        sendChatMessage();
        return false;
    });

    function handleSlashCommand(command) {
        const commandArgs = command.split(' ');
        const commandName = commandArgs[0].toLowerCase();

        if (commandName === '/rem') {
            handleRemCommand(commandArgs);
            return;
        }

        if (commandName === '/calc') {
            handleCalcCommand(commandArgs);
            return;
        }

        // Handle other commands here
    }

    function handleRemCommand(commandArgs) {
        const name = commandArgs[1];
        const value = commandArgs.slice(2).join(' ');
        localStorage.setItem(`rem-${name}`, value);
        sendSystemMessage(`Stored value "${value}" for name "${name}"`);
    }

    function handleCalcCommand(commandArgs) {
        const expression = commandArgs.slice(1).join(' ');
        try {
            const result = eval(expression);
            sendSystemMessage(`Result: ${expression} = ${result}`);
        } catch (error) {
            sendSystemMessage(`Error: ${error.message}`);
        }
    }

    function sendSystemMessage(message) {
        $('#messages').append($('<li>').addClass('system-message').text(message));
    }

    function sendChatMessage() {
        const message = input.val();
        if (message.trim() !== '') {
            socket.emit('chat message', { username: currentUsername, message });
            input.val('');
        }
    }

    socket.on('chat message', (msg) => {
        const messageWithEmojis = replaceEmojis(msg.message);
        $('#messages').append($('<li>').text(`${msg.username}: ${messageWithEmojis}`));
    });

    socket.on('user joined', (username) => {
        $('#names').append($('<li>').text(username));
        const connectedMessage = `${username} has joined the chat`;
        $('#messages').append($('<li>').addClass('system-message').text(connectedMessage));
        updateOnlineUserCount();
    });

    socket.on('user left', (username) => {
        $(`#names li:contains('${username}')`).remove();
        const disconnectedMessage = `${username} has left the chat`;
        $('#messages').append($('<li>').addClass('system-message').text(disconnectedMessage));
        updateOnlineUserCount();
    });

    function replaceEmojis(message) {
        const replacements = {
            'react': '⚛️',
            'woah': '😯',
            'hey': '👋',
            'lol': '😂',
            'like': '🤍',
            'congratulations': '🎉'
        };

        for (const word in replacements) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            message = message.replace(regex, replacements[word]);
        }

        return message;
    }

    function updateOnlineUserCount() {
        const userCount = $('#names li').length;
        $('#count').text(userCount);
    }
});
