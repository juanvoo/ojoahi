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
  
  static async find({ user_id, sort = {} }) {
    try {
      const query = 'SELECT r.*, v.name as volunteer_name FROM reservations r ' +
                   'LEFT JOIN volunteers v ON r.volunteer_id = v.id ' +
                   'WHERE r.user_id = $1 ' +
                   'ORDER BY r.date DESC';
      
      const result = await db.query(query, [user_id]);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener reservas:', error);
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
        `SELECT hr.*, u.username as volunteer_name 
         FROM help_requests hr 
         LEFT JOIN users u ON hr.volunteer_id = u.id 
         WHERE hr.user_id = ?
         ORDER BY hr.date DESC, hr.time DESC`,
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
      const [rows] = await pool.execute(
        `SELECT hr.*, u.username as user_name, hr.status
         FROM help_requests hr 
         JOIN users u ON hr.user_id = u.id 
         WHERE hr.volunteer_id = ? AND hr.status IN ('accepted', 'rejected')
         ORDER BY hr.date DESC, hr.time DESC`,
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

  static async cancel(id) {
    try {
      const query = 'UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *';
      const result = await db.query(query, ['cancelled', id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      throw error;
    }
  }
}

module.exports = Reservation;