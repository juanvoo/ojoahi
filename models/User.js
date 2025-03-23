const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ username, email, password, role, user_type }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await pool.execute(
        'INSERT INTO users (username, email, password, role, user_type) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, role, user_type || role]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, username, email, password, role, 
                IFNULL(phone, '') as phone, 
                IFNULL(address, '') as address,
                IFNULL(profile_image, '') as profile_image,
                created_at
         FROM users 
         WHERE id = ?`,
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      // Añadir propiedades vacías para los campos que podrían no existir
      const user = rows[0];
      user.name = user.name || '';
      user.bio = user.bio || '';
      user.availability = user.availability || '';
      user.updated_at = user.updated_at || user.created_at;
      
      return user;
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw error;
    }
  }

  static async getVolunteers() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username FROM users WHERE role = ?',
        ['volunteer']
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener voluntarios:', error);
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  static async updateProfile(userId, userData) {
    try {
      const { username, name, email, phone, address, bio, availability } = userData;
      
      // Verificar si el email o username ya están en uso por otro usuario
      if (email) {
        const [emailCheck] = await pool.execute(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, userId]
        );
        
        if (emailCheck.length > 0) {
          throw new Error('El email ya está en uso por otro usuario');
        }
      }
      
      if (username) {
        const [usernameCheck] = await pool.execute(
          'SELECT id FROM users WHERE username = ? AND id != ?',
          [username, userId]
        );
        
        if (usernameCheck.length > 0) {
          throw new Error('El nombre de usuario ya está en uso');
        }
      }
      
      // Obtener las columnas disponibles
      const [columns] = await pool.execute('SHOW COLUMNS FROM users');
      const columnNames = columns.map(col => col.Field);
      
      // Construir la consulta SQL dinámicamente
      let sql = 'UPDATE users SET ';
      const updateFields = [];
      const params = [];
      
      // Solo incluir campos que existen en la tabla
      if (username && columnNames.includes('username')) {
        updateFields.push('username = ?');
        params.push(username);
      }
      
      if (name && columnNames.includes('name')) {
        updateFields.push('name = ?');
        params.push(name);
      }
      
      if (email && columnNames.includes('email')) {
        updateFields.push('email = ?');
        params.push(email);
      }
      
      if (columnNames.includes('phone')) {
        updateFields.push('phone = ?');
        params.push(phone || '');
      }
      
      if (columnNames.includes('address')) {
        updateFields.push('address = ?');
        params.push(address || '');
      }
      
      if (bio && columnNames.includes('bio')) {
        updateFields.push('bio = ?');
        params.push(bio);
      }
      
      if (availability && columnNames.includes('availability')) {
        updateFields.push('availability = ?');
        params.push(availability);
      }
      
      // Si no hay campos para actualizar, devolver el usuario actual
      if (updateFields.length === 0) {
        return await this.findById(userId);
      }
      
      // Añadir la fecha de actualización si existe
      if (columnNames.includes('updated_at')) {
        updateFields.push('updated_at = NOW()');
      }
      
      sql += updateFields.join(', ');
      sql += ' WHERE id = ?';
      params.push(userId);
      
      console.log('SQL de actualización:', sql);
      console.log('Parámetros:', params);
      
      const [result] = await pool.execute(sql, params);
      
      console.log(`Perfil actualizado para el usuario ${userId}. Filas afectadas: ${result.affectedRows}`);
      
      // Obtener y devolver el usuario actualizado
      return await this.findById(userId);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      throw error;
    }
  }
  
  static async updateProfileImage(userId, imagePath) {
    try {
      const [result] = await pool.execute(
        'UPDATE users SET profile_image = ?, updated_at = NOW() WHERE id = ?',
        [imagePath, userId]
      );
      
      console.log(`Imagen de perfil actualizada para el usuario ${userId}. Filas afectadas: ${result.affectedRows}`);
      
      // Obtener y devolver el usuario actualizado
      return await this.findById(userId);
    } catch (error) {
      console.error('Error al actualizar la imagen de perfil:', error);
      throw error;
    }
  }
  
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      // Obtener el usuario actual
      const user = await this.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      // Verificar la contraseña actual
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error('La contraseña actual es incorrecta');
      }
      
      // Encriptar la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Actualizar la contraseña
      await pool.execute(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
        [hashedPassword, userId]
      );
      
      return true;
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      throw error;
    }
  }
  
  static async getStats(userId) {
    try {
      // Obtener el total de reservas completadas
      const [reservations] = await pool.execute(
        'SELECT COUNT(*) as total FROM reservations WHERE volunteer_id = ? AND status = "completed"',
        [userId]
      );
      
      // Obtener la calificación promedio y total de reseñas
      const [reviews] = await pool.execute(
        'SELECT COUNT(*) as total, AVG(rating) as average FROM reviews WHERE volunteer_id = ?',
        [userId]
      );
      
      return {
        totalReservations: reservations[0].total || 0,
        totalReviews: reviews[0].total || 0,
        averageRating: reviews[0].average ? parseFloat(reviews[0].average).toFixed(1) : '0.0'
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del usuario:', error);
      throw error;
    }
  }
}

module.exports = User;