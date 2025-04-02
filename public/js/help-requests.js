// Cliente
const helpSocket = io();

function initHelpRequests(userId) {
  helpSocket.emit('userAuthenticated', userId);

  // Escuchar nuevas solicitudes de ayuda
  helpSocket.emit('joinHelpChannel', userId);
  
  helpSocket.on('newHelpRequest', (request) => {
    updateHelpRequestsList(request);
  });

  helpSocket.on('helpRequestUpdated', (update) => {
    updateRequestStatus(update);
  });
}

function createHelpRequest(requestData) {
  helpSocket.emit('createHelpRequest', requestData);
}

function updateHelpRequestsList(request) {
  const requestsList = document.getElementById('help-requests-list');
  const requestElement = document.createElement('div');
  requestElement.classList.add('help-request');
  requestElement.setAttribute('data-request-id', request.id);
  
  requestElement.innerHTML = `
    <div class="request-content">
      <h3>${request.title}</h3>
      <p>${request.description}</p>
      <span class="status">${request.status}</span>
      <span class="timestamp">${new Date(request.timestamp).toLocaleString()}</span>
    </div>
  `;
  
  requestsList.appendChild(requestElement);
}

function updateRequestStatus(update) {
  const requestElement = document.querySelector(`[data-request-id="${update.requestId}"]`);
  if (requestElement) {
    const statusElement = requestElement.querySelector('.status');
    statusElement.textContent = update.status;
    statusElement.className = `status ${update.status.toLowerCase()}`;
  }
}