const Reservation = require('../models/Reservation');

exports.createReservation = (req, res) => {
  Reservation.create(req.body, (err, reservationId) => {
    if (err) {
      return res.status(500).json({ error: 'Error al crear la reserva' });
    }
    res.status(201).json({ message: 'Reserva creada exitosamente', reservationId });
  });
};

exports.getUserReservations = (req, res) => {
  Reservation.findByUser(req.params.userId, (err, reservations) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener las reservas' });
    }
    res.json(reservations);
  });
};

exports.updateReservationStatus = (req, res) => {
  Reservation.update(req.params.id, req.body.status, (err, success) => {
    if (err) {
      return res.status(500).json({ error: 'Error al actualizar la reserva' });
    }
    if (success) {
      res.json({ message: 'Estado de la reserva actualizado exitosamente' });
    } else {
      res.status(404).json({ error: 'Reserva no encontrada' });
    }
  });
};