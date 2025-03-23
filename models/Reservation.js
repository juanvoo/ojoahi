const pool = require('../config/database');

class Reservation {
  static async create({ user_id, volunteer_id, date, time, notes, status, help_request_id }) {
    try {
      const sql = 'INSERT INTO reservations (user_id, volunteer_id, date, time, notes, status, help_request_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const params = [user_id, volunteer_id, date, time, notes, status || 'pending', help_request_id || null];
  
      const [result] = await pool.execute(sql, params);
      return result.insertId;
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      throw error;
    }
  }

  static async getByUserId(userId) {
    try {
      console.log(`Buscando reservas para el usuario con ID: ${userId}`);
      
      const [rows] = await pool.execute(
        `SELECT r.*, u.username as volunteer_name 
         FROM reservations r 
         JOIN users u ON r.volunteer_id = u.id 
         WHERE r.user_id = ?
         ORDER BY r.date DESC, r.time DESC`,
        [userId]
      );
      
      console.log(`Encontradas ${rows.length} reservas para el usuario ${userId}`);
      return rows;
    } catch (error) {
      console.error('Error al obtener las reservas del usuario:', error);
      throw error;
    }
  }

  static async getByVolunteerId(volunteerId) {
    try {
      console.log(`Buscando reservas para el voluntario con ID: ${volunteerId}`);
      
      // Consulta modificada para no depender de help_request_id
      const [rows] = await pool.execute(
        `SELECT r.*, u.username as user_name 
         FROM reservations r 
         JOIN users u ON r.user_id = u.id 
         WHERE r.volunteer_id = ?
         ORDER BY r.date DESC, r.time DESC`,
        [volunteerId]
      );
      
      console.log(`Encontradas ${rows.length} reservas para el voluntario ${volunteerId}`);
      return rows;
    } catch (error) {
      console.error('Error al obtener las reservas del voluntario:', error);
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      const [result] = await pool.execute(
        'UPDATE reservations SET status = ? WHERE id = ?',
        [status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar el estado de la reserva:', error);
      throw error;
    }
  }
}

module.exports = Reservation;