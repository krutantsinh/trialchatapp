$(function () {
    $('#modal-username').focus();

    const socket = io();
    const usernameInput = $('#modal-username');
    const modalSubmitButton = $('#modal-submit');
    const form = $('#form');
    const input = $('#input');
    const nameModal = $('#nameModal');
    let currentUsername = '';
    let isUsersPanelCollapsed = true;

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
                input.val(''); // Clear the input after processing slash command
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
        switch (commandName) {
            case '/help':
                showHelpPopup();
                break;
            case '/random':
                sendRandomNumber();
                break;
            case '/clear':
                clearChat();
                break;
            default:
                sendChatMessage();
                break;
        }
    }

    function showHelpPopup() {
        const helpMessage = `
            '/help - show this message
            /random - print a random number
            /clear - clears the chat'
        `;
        alert(helpMessage);
    }

    function sendRandomNumber() {
        const randomNum = Math.floor(Math.random() * 90000) + 10000;
        socket.emit('chat message', { username: currentUsername, message: `Your Random No. is :  ${randomNum}` });
    }

    function clearChat() {
        $('#messages').empty();
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
    });

    socket.on('user left', (username) => {
        $(`#names li:contains('${username}')`).remove();
        const disconnectedMessage = `${username} has left the chat`;
        $('#messages').append($('<li>').addClass('system-message').text(disconnectedMessage));
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
});