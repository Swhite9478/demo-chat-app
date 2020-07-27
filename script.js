const socket = io('http://localhost:3000/');

let messageContainer = document.getElementById('messages');
let messageForm = document.getElementById('send-container');
let messageInput = document.getElementById('message-input');

const getTimeStamp = () => {
    return new Date().toLocaleString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

const appendRecievedMessage = (message, user) => {
    const messageElement = document.createElement('div');
    const lineBreak = document.createElement("br");
    messageElement.id = "recieved-message";
    messageElement.className = "split left"
    console.log(user);
    if (user === undefined) {
        messageElement.innerText = `${message} - ${getTimeStamp()}`;
        
    } else {
        messageElement.innerText = `${user}: ${message} - ${getTimeStamp()}`;
    }
    
    messageContainer.append(messageElement);
    messageContainer.append(lineBreak);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

const appendSentMessage = message => {
    const messageElement = document.createElement('div');
    const lineBreak = document.createElement("br");
    messageElement.id = "sent-message";
    messageElement.className ="split right"
    messageElement.innerText = `${getTimeStamp()} - ${message}`;
    messageContainer.append(messageElement);
    messageContainer.append(lineBreak);
    messageContainer.scrollTop = messageContainer.scrollHeight;

}

const name = prompt('What is your name?');
socket.emit('new-join', {
    message: `${name} Joined the Chat`,
})

socket.on('sent-message', data => {
    appendSentMessage(data.message);
})

socket.on('recieved-chat-message', data => {
    appendRecievedMessage(data.message, data.user);
})

messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    socket.emit('send-chat-message', {message: message, user: name});
    messageInput.value = '';
})

