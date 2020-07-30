const socket = io('http://localhost:3000/');

let messageContainer = document.getElementById('messages');
let messageForm = document.getElementById('send-container');
let messageInput = document.getElementById('message-input');
let someoneTypingText = document.getElementById('someone-typing');

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
socket.emit('user-connected', {
    message: `${name} Joined the Chat`,
    user: name
})

socket.on('user-refresh', () => {
    socket.emit('refresh-user', name);
})

socket.on('sent-message', data => {
    appendSentMessage(data.message);
})

socket.on('recieved-chat-message', data => {
    appendRecievedMessage(data.message, data.user);
})

socket.on('user-disconnected', name => {
    appendRecievedMessage(`${name} disconnected`);
})

socket.on('notify-users-someone-is-typing', user => {
    if(user) {
        someoneTypingText.innerHTML = `${user} is typing`;
    }
})

socket.on('clear-user-is-typing', () => {
    someoneTypingText.innerHTML = '';
})


messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    if(message) {
        socket.emit('send-chat-message', { message: message, user: name });
        socket.emit('user-is-done-typing');
        messageInput.value = '';
    }
})

const debounce = (fnc, wait, immediate) => {
    let timeout;

    return function executedFunction() {
        let context = this;
        let args = arguments;

        let later = () => {
            timeout = null;
            if(!immediate) fnc.apply(context, args);
        };

        let callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if(callNow) fnc.apply(context, args);
    }
}

const notifyUserIsDoneTyping = debounce(() => {
    socket.emit('user-is-done-typing');
}, 1500)

messageInput.addEventListener('keypress', e => {
    if (e.key !== 'Enter') {
        socket.emit('user-is-typing');
    }
})

messageInput.addEventListener('keypress', notifyUserIsDoneTyping);
