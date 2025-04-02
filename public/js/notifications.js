// Cliente
const notificationSocket = io();

function initNotifications(userId) {
  notificationSocket.emit('userAuthenticated', userId);

  // Escuchar nuevas notificaciones
  notificationSocket.on('newNotification', (notification) => {
    showNotification(notification);
  });
}

function showNotification(notification) {
  const notificationContainer = document.getElementById('notification-container');
  const notificationElement = document.createElement('div');
  notificationElement.classList.add('notification');
  
  notificationElement.innerHTML = `
    <div class="notification-content">
      <h4>${notification.title}</h4>
      <p>${notification.message}</p>
      <span class="timestamp">${new Date(notification.timestamp).toLocaleString()}</span>
    </div>
  `;
  
  notificationContainer.appendChild(notificationElement);

  // Eliminar notificación después de 5 segundos
  setTimeout(() => {
    notificationElement.remove();
  }, 5000);
}