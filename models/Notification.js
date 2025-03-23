const pool = require('../config/database');

class Notification {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.content = data.content || data.message || ''; // Soporte para diferentes nombres de columna
    this.type = data.type || 'general';
    this.link = data.link || null;
    this.is_read = data.is_read || 0;
    this.created_at = data.created_at;
  }

  static async createTable() {
    const connection = await pool.getConnection();
    try {
      // Verificar si la tabla existe
      const [tables] = await connection.query('SHOW TABLES LIKE "notifications"');
      
      if (tables.length === 0) {
        // La tabla no existe, crearla
        await connection.query(`
          CREATE TABLE notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            type VARCHAR(50) DEFAULT 'general',
            link VARCHAR(255),
            is_read TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
        console.log('Tabla de notificaciones creada');
      } else {
        // La tabla existe, verificar si tiene la columna content
        const [columns] = await connection.query('DESCRIBE notifications');
        const columnNames = columns.map(col => col.Field);
        
        if (!columnNames.includes('content')) {
          // Verificar si tiene una columna message
          if (columnNames.includes('message')) {
            console.log('La tabla notifications tiene una columna message en lugar de content');
          } else {
            // Añadir la columna content
            await connection.query('ALTER TABLE notifications ADD COLUMN content TEXT NOT NULL AFTER title');
            console.log('Columna content añadida a la tabla notifications');
          }
        }
      }
    } catch (error) {
      console.error('Error al crear/verificar la tabla de notificaciones:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async create(data) {
    try {
      // Validar que todos los campos requeridos estén presentes
      if (data.user_id === undefined) {
        throw new Error('El ID del usuario es requerido');
      }
      
      if (data.title === undefined) {
        throw new Error('El título es requerido');
      }
      
      // Verificar la estructura de la tabla
      const [columns] = await pool.execute('DESCRIBE notifications');
      const columnNames = columns.map(col => col.Field);
      
      // Preparar la consulta SQL basada en las columnas disponibles
      let sql = 'INSERT INTO notifications (';
      const fields = ['user_id', 'title'];
      const placeholders = ['?', '?'];
      const values = [data.user_id, data.title];
      
      // Añadir content o message según corresponda
      if (columnNames.includes('content')) {
        fields.push('content');
        placeholders.push('?');
        values.push(data.content || '');
      } else if (columnNames.includes('message')) {
        fields.push('message');
        placeholders.push('?');
        values.push(data.content || data.message || '');
      }
      
      // Añadir type si existe
      if (columnNames.includes('type')) {
        fields.push('type');
        placeholders.push('?');
        values.push(data.type || 'general');
      }
      
      // Añadir link si existe
      if (columnNames.includes('link')) {
        fields.push('link');
        placeholders.push('?');
        values.push(data.link || null);
      }
      
      sql += fields.join(', ') + ') VALUES (' + placeholders.join(', ') + ')';
      
      console.log('SQL para crear notificación:', sql);
      console.log('Valores:', values);
      
      const [result] = await pool.execute(sql, values);
      
      return result.insertId;
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  }

  static async getByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
        [userId]
      );
      
      return rows;
    } catch (error) {
      console.error('Error al obtener notificaciones del usuario:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId) {
    try {
      await pool.execute(
        'UPDATE notifications SET is_read = 1 WHERE id = ?',
        [notificationId]
      );
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      throw error;
    }
  }

  static async getUnreadCount(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
        [userId]
      );
      
      return rows[0].count;
    } catch (error) {
      console.error('Error al obtener conteo de notificaciones no leídas:', error);
      throw error;
    }
  }
}

module.exports = Notification;