const pool = require('../config/database');
const db = require('../config/database');

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

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT r.*, v.name as volunteer_name 
       FROM reservations r 
       JOIN volunteers v ON r.volunteer_id = v.id 
       WHERE r.id = ?`,
      [id]
    );
    return rows[0];
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
    const [rows] = await db.execute(
      `SELECT hr.*, u.username as user_name 
       FROM help_requests hr 
       JOIN users u ON hr.user_id = u.id 
       WHERE hr.volunteer_id = ?
       ORDER BY hr.date DESC, hr.time DESC`,
      [volunteerId]
    );
    return rows;
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