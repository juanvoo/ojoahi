const db = require('../config/database');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM users');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByEmail(email) {
    try {
      console.log('Buscando usuario por email:', email);
      const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      console.log('Resultado de la búsqueda:', rows[0] ? 'Usuario encontrado' : 'Usuario no encontrado');
      return rows[0];
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      throw error;
    }
  }

  static async create(userData) {
    const { username, email, password, user_type } = userData;
    try {
      console.log('Intentando crear usuario:', { username, email, user_type });
      const [result] = await db.execute(
        'INSERT INTO users (username, email, password, user_type) VALUES (?, ?, ?, ?)',
        [username, email, password, user_type]
      );
      console.log('Usuario creado con ID:', result.insertId);
      return { id: result.insertId, username, email, user_type };
    } catch (error) {
      console.error('Error detallado al crear usuario:', error);
      throw error;
    }
  }

  static async update(id, userData) {
    const { username, email, user_type } = userData;
    await db.execute(
      'UPDATE users SET username = ?, email = ?, user_type = ? WHERE id = ?',
      [username, email, user_type, id]
    );
    return this.findById(id);
  }

  static async deleteById(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Primero, actualizar las solicitudes de ayuda para este voluntario
      await connection.execute('UPDATE help_requests SET volunteer_id = NULL WHERE volunteer_id = ?', [id]);

      // Luego, eliminar las solicitudes de ayuda creadas por este usuario
      await connection.execute('DELETE FROM help_requests WHERE user_id = ?', [id]);

      // Finalmente, eliminar el usuario
      const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.error('Error al eliminar usuario:', error);
      throw error;
    } finally {
      connection.release();
    }
  }


  static async getAllVolunteers() {
    const [rows] = await db.execute('SELECT id, username, email FROM users WHERE user_type = ?', ['volunteer']);
    return rows;
  }

  static async getReservationsForUser(userId) {
    const [rows] = await pool.execute(
      'SELECT r.*, u.name as volunteer_name FROM reservations r LEFT JOIN users u ON r.volunteer_id = u.id WHERE r.user_id = ? ORDER BY r.date DESC',
      [userId]
    );
    return rows;
  }

  static async getReservationsForVolunteer(userId) {
    const [rows] = await pool.execute(
      'SELECT r.*, u.name as user_name FROM reservations r LEFT JOIN users u ON r.user_id = u.id WHERE r.volunteer_id = ? ORDER BY r.date DESC',
      [userId]
    );
    return rows;
  }

  static async getVolunteerReviews() {
    const [rows] = await pool.execute(`
      SELECT r.*, u.name as volunteer_name, b.name as blind_user_name
      FROM reviews r
      JOIN users u ON r.volunteer_id = u.id
      JOIN users b ON r.user_id = b.id
      ORDER BY r.created_at DESC
    `);
    return rows;
  }

  static async getPendingHelpRequests() {
    const [rows] = await pool.execute(
      'SELECT hr.*, u.name as blind_user_name FROM help_requests hr JOIN users u ON hr.user_id = u.id WHERE hr.status = "pending" ORDER BY hr.created_at DESC'
    );
    return rows;
  }

  static async getCompletedReservationsForUser(userId) {
    const [rows] = await pool.execute(`
      SELECT r.*, u.name as volunteer_name, 
      (SELECT COUNT(*) FROM reviews WHERE reservation_id = r.id) as has_review
      FROM reservations r 
      JOIN users u ON r.volunteer_id = u.id 
      WHERE r.user_id = ? AND r.status = 'completed'
      ORDER BY r.date DESC
    `, [userId]);
    return rows;
  }

  static async getVolunteers() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username FROM users WHERE role = "volunteer"'
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener voluntarios:', error);
      throw error;
    }
  }
}

module.exports = User;