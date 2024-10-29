const db = require('../config/database');
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

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getAllVolunteers() {
    const [rows] = await db.execute('SELECT id, username, email FROM users WHERE user_type = ?', ['volunteer']);
    return rows;
  }
}

module.exports = User;