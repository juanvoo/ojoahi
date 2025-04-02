// Archivo para el cliente
const socket = io();
let currentUser = null;

// Función para inicializar el chat
function initChat(userId) {
  currentUser = userId;
  socket.emit('userAuthenticated', userId);

  // Escuchar nuevos mensajes
  socket.on('newMessage', (message) => {
    appendMessage(message);
  });
}

// Función para enviar mensaje
function sendMessage(message) {
  if (!currentUser) return;
  
  const messageData = {
    userId: currentUser,
    message: message,
    timestamp: new Date(),
  };
  
  socket.emit('sendMessage', messageData);
}

// Función para mostrar mensaje en el chat
function appendMessage(message) {
  const chatContainer = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(message.userId === currentUser ? 'sent' : 'received');
  
  messageElement.innerHTML = `
    <div class="message-content">
      <p>${message.message}</p>
      <span class="timestamp">${new Date(message.timestamp).toLocaleTimeString()}</span>
    </div>
  `;
  
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}