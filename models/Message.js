const pool = require('../config/database');

class Message {
  constructor(data) {
    this.id = data.id;
    this.sender_id = data.sender_id;
    this.receiver_id = data.receiver_id;
    this.content = data.content;
    this.is_read = data.is_read || 0;
    this.created_at = data.created_at;
  }

  static async createTable() {
    const connection = await pool.getConnection();
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          sender_id INT NOT NULL,
          receiver_id INT NOT NULL,
          content TEXT NOT NULL,
          is_read TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('Tabla de mensajes creada o ya existente');
    } catch (error) {
      console.error('Error al crear la tabla de mensajes:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async create(data) {
    try {
      // Validar que todos los campos requeridos estén presentes y no sean undefined
      if (data.sender_id === undefined) {
        throw new Error('El ID del remitente es requerido');
      }
      
      if (data.receiver_id === undefined) {
        throw new Error('El ID del destinatario es requerido');
      }
      
      if (data.content === undefined) {
        throw new Error('El contenido del mensaje es requerido');
      }
      
      // Convertir posibles valores undefined a null (aunque ya deberían estar validados)
      const sender_id = data.sender_id !== undefined ? data.sender_id : null;
      const receiver_id = data.receiver_id !== undefined ? data.receiver_id : null;
      const content = data.content !== undefined ? data.content : '';
      
      console.log('Insertando mensaje en la base de datos:');
      console.log('- sender_id:', sender_id);
      console.log('- receiver_id:', receiver_id);
      console.log('- content:', content);
      
      const [result] = await pool.execute(
        'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
        [sender_id, receiver_id, content]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error al crear mensaje:', error);
      throw error;
    }
  }

  static async getConversation(user1Id, user2Id, limit = 50) {
    try {
      const [rows] = await pool.execute(
        `SELECT m.*, 
                u_sender.username as sender_username, 
                u_sender.profile_image as sender_image,
                u_receiver.username as receiver_username,
                u_receiver.profile_image as receiver_image
         FROM messages m
         JOIN users u_sender ON m.sender_id = u_sender.id
         JOIN users u_receiver ON m.receiver_id = u_receiver.id
         WHERE (m.sender_id = ? AND m.receiver_id = ?) 
            OR (m.sender_id = ? AND m.receiver_id = ?)
         ORDER BY m.created_at DESC
         LIMIT ?`,
        [user1Id, user2Id, user2Id, user1Id, limit]
      );
      
      return rows.reverse();
    } catch (error) {
      console.error('Error al obtener conversación:', error);
      throw error;
    }
  }

  static async getUserConversations(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          u.id, u.username, u.profile_image, u.role,
          (SELECT content FROM messages 
           WHERE (sender_id = ? AND receiver_id = u.id) 
              OR (sender_id = u.id AND receiver_id = ?)
           ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM messages 
           WHERE (sender_id = ? AND receiver_id = u.id) 
              OR (sender_id = u.id AND receiver_id = ?)
           ORDER BY created_at DESC LIMIT 1) as last_message_time,
          (SELECT COUNT(*) FROM messages 
           WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) as unread_count
        FROM users u
        WHERE u.id IN (
          SELECT DISTINCT 
            CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as contact_id
          FROM messages
          WHERE sender_id = ? OR receiver_id = ?
        )
        ORDER BY last_message_time DESC`,
        [userId, userId, userId, userId, userId, userId, userId, userId]
      );
      
      return rows;
    } catch (error) {
      console.error('Error al obtener conversaciones del usuario:', error);
      throw error;
    }
  }

  static async markAsRead(senderId, receiverId) {
    try {
      await pool.execute(
        'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
        [senderId, receiverId]
      );
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
      throw error;
    }
  }

  static async getUnreadCount(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0',
        [userId]
      );
      
      return rows[0].count;
    } catch (error) {
      console.error('Error al obtener conteo de mensajes no leídos:', error);
      throw error;
    }
  }
}

module.exports = Message;