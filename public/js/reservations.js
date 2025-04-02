// Cliente
const reservationSocket = io();

function initReservations(userId) {
  reservationSocket.emit('userAuthenticated', userId);

  // Escuchar actualizaciones de reservaciones
  reservationSocket.on('reservationCreated', (reservation) => {
    addReservation(reservation);
  });

  reservationSocket.on('reservationUpdated', (update) => {
    updateReservation(update);
  });

  reservationSocket.on('reservationCancelled', (reservationId) => {
    removeReservation(reservationId);
  });
}

function createReservation(reservationData) {
  reservationSocket.emit('createReservation', reservationData);
}

function updateReservation(update) {
  const reservationElement = document.querySelector(`[data-reservation-id="${update.id}"]`);
  if (reservationElement) {
    reservationElement.querySelector('.status').textContent = update.status;
    reservationElement.querySelector('.date').textContent = new Date(update.date).toLocaleString();
  }
}

function addReservation(reservation) {
  const reservationsList = document.getElementById('reservations-list');
  const reservationElement = document.createElement('div');
  reservationElement.classList.add('reservation');
  reservationElement.setAttribute('data-reservation-id', reservation.id);
  
  reservationElement.innerHTML = `
    <div class="reservation-content">
      <h3>${reservation.title}</h3>
      <p>${reservation.description}</p>
      <span class="status">${reservation.status}</span>
      <span class="date">${new Date(reservation.date).toLocaleString()}</span>
    </div>
  `;
  
  reservationsList.appendChild(reservationElement);
}

function removeReservation(reservationId) {
  const reservationElement = document.querySelector(`[data-reservation-id="${reservationId}"]`);
  if (reservationElement) {
    reservationElement.remove();
  }
}