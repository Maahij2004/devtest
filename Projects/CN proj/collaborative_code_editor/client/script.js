const socket = new WebSocket('ws://localhost:3000');
const editor = document.getElementById('editor');
const chatInput = document.getElementById('chat-input');
const chatBox = document.getElementById('chat-box');
const usernameInput = document.getElementById('username');
const joinButton = document.getElementById('joinButton');
const sendChatButton = document.getElementById('sendChatButton');
const languageSelect = document.getElementById('language-select'); 
let username = '';
let currentLanguage = 'javascript';  

joinButton.addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username) {
        socket.send(JSON.stringify({ type: 'user-join', username }));
        editor.disabled = false;
    }
});

socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
        case 'load-document':
            editor.value = data.content;
            currentLanguage = data.language;  
            updateEditorLanguage(currentLanguage);
            break;
        case 'update-document':
            editor.value = data.content;
            break;
        case 'update-user-list':
            updateUserList(data.users);
            break;
        case 'chat':
            addChatMessage(data.message);
            break;
        case 'language-change':
            currentLanguage = data.language;  
            updateEditorLanguage(currentLanguage);
            break;
    }
});

editor.addEventListener('input', () => {
    socket.send(JSON.stringify({ type: 'update-document', content: editor.value }));
});

sendChatButton.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
        socket.send(JSON.stringify({ type: 'chat', username, message }));
        chatInput.value = '';
    }
});


languageSelect.addEventListener('change', () => {
    const selectedLanguage = languageSelect.value;
    if (selectedLanguage !== currentLanguage) {
        currentLanguage = selectedLanguage;
        socket.send(JSON.stringify({ type: 'language-change', language: currentLanguage }));
        updateEditorLanguage(currentLanguage);
    }
});

function updateEditorLanguage(language) {
    const editor = CodeMirror(document.getElementById('editor'), {
        value: '',
        mode: 'javascript' 
      });
      
      document.getElementById('language-select').addEventListener('change', (event) => {
          const selectedLanguage = event.target.value;
          editor.setOption("mode", selectedLanguage);
      });
    monaco.editor.setModelLanguage(editor.getModel(), language);
}
function addChatMessage(message) {
    const msgElement = document.createElement('div');
    msgElement.textContent = message;
    chatBox.appendChild(msgElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function updateUserList(users) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.textContent = user;
        userList.appendChild(userElement);
    });
}
