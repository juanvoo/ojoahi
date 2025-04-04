const pool = require('../config/database');

class HelpRequest {
  static async create({ user_id, volunteer_id, description, date, time }) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO help_requests (user_id, volunteer_id, description, date, time, status) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, volunteer_id || null, description, date, time, 'pending']
      );
      return result.insertId;
    } catch (error) {
      console.error('Error al crear la solicitud de ayuda:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT hr.*, u.username as user_name 
         FROM help_requests hr 
         JOIN users u ON hr.user_id = u.id 
         WHERE hr.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error al obtener la solicitud de ayuda por ID:', error);
      throw error;
    }
  }

  static async getByUserId(userId) {
    try {
      console.log(`Buscando solicitudes de ayuda para el usuario con ID: ${userId}`);
      
      const [rows] = await pool.execute(
        `SELECT hr.*, u.username as volunteer_name 
         FROM help_requests hr 
         LEFT JOIN users u ON hr.volunteer_id = u.id 
         WHERE hr.user_id = ?
         ORDER BY hr.date DESC, hr.time DESC`,
        [userId]
      );
      
      console.log(`Encontradas ${rows.length} solicitudes de ayuda para el usuario ${userId}`);
      return rows;
    } catch (error) {
      console.error('Error al obtener las solicitudes de ayuda del usuario:', error);
      throw error;
    }
  }

  static async getPendingByVolunteerId(volunteerId) {
    try {
      console.log(`Buscando solicitudes pendientes para el voluntario con ID: ${volunteerId}`);
      
      const [rows] = await pool.execute(
        `SELECT hr.*, u.username as user_name 
         FROM help_requests hr 
         JOIN users u ON hr.user_id = u.id 
         WHERE hr.status = 'pending' 
         AND hr.volunteer_id = ?  -- Only show requests assigned to this volunteer
         ORDER BY hr.created_at DESC`,
        [volunteerId]
      );
      
      console.log(`Encontradas ${rows.length} solicitudes pendientes para el voluntario ${volunteerId}`);
      return rows;
    } catch (error) {
      console.error('Error al obtener las solicitudes pendientes:', error);
      throw error;
    }
  }

  static async getAllPending() {
    try {
      const [rows] = await pool.execute(
        `SELECT hr.*, u.username as user_name 
         FROM help_requests hr 
         JOIN users u ON hr.user_id = u.id 
         WHERE hr.status = 'pending' AND hr.volunteer_id IS NULL
         ORDER BY hr.date ASC, hr.time ASC`
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener todas las solicitudes pendientes:', error);
      throw error;
    }
  }

  static async updateStatus(id, status, volunteerId = null) {
    try {
      let sql = 'UPDATE help_requests SET status = ? WHERE id = ?';
      let params = [status, id];
      
      if (volunteerId) {
        sql = 'UPDATE help_requests SET status = ?, volunteer_id = ? WHERE id = ?';
        params = [status, volunteerId, id];
      }
      
      const [result] = await pool.execute(sql, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar el estado de la solicitud:', error);
      throw error;
    }
  }
}

module.exports = HelpRequest;