const pool = require("../config/database")

class SupportChat {
  constructor(data) {
    this.id = data.id
    this.user_id = data.user_id
    this.support_agent_id = data.support_agent_id
    this.message = data.message
    this.is_from_user = data.is_from_user
    this.is_read = data.is_read || 0
    this.created_at = data.created_at
    this.chat_session_id = data.chat_session_id
    this.status = data.status || "active" // active, closed
  }

  static async createTable() {
    const connection = await pool.getConnection()
    try {
      // Crear tabla de sesiones de chat
      await connection.query(`
        CREATE TABLE IF NOT EXISTS support_chat_sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          support_agent_id INT,
          subject VARCHAR(255),
          status ENUM('waiting', 'active', 'closed') DEFAULT 'waiting',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (support_agent_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `)

      // Crear tabla de mensajes de chat
      await connection.query(`
        CREATE TABLE IF NOT EXISTS support_chat_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          chat_session_id INT NOT NULL,
          user_id INT NOT NULL,
          message TEXT NOT NULL,
          is_from_user TINYINT(1) DEFAULT 1,
          is_read TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (chat_session_id) REFERENCES support_chat_sessions(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `)

      console.log("Tablas de chat de soporte creadas o ya existentes")
    } catch (error) {
      console.error("Error al crear las tablas de chat de soporte:", error)
      throw error
    } finally {
      connection.release()
    }
  }

  // Métodos para sesiones de chat
  static async createSession(userId, subject) {
    try {
      const [result] = await pool.execute("INSERT INTO support_chat_sessions (user_id, subject) VALUES (?, ?)", [
        userId,
        subject,
      ])

      return result.insertId
    } catch (error) {
      console.error("Error al crear sesión de chat:", error)
      throw error
    }
  }

  static async getSessionById(sessionId) {
    try {
      const [rows] = await pool.execute(
        `SELECT s.*, u.username as user_username, u.profile_image as user_image,
                a.username as agent_username, a.profile_image as agent_image
         FROM support_chat_sessions s
         JOIN users u ON s.user_id = u.id
         LEFT JOIN users a ON s.support_agent_id = a.id
         WHERE s.id = ?`,
        [sessionId],
      )

      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error("Error al obtener sesión de chat:", error)
      throw error
    }
  }

  static async getUserSessions(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT s.*, u.username as user_username, 
                a.username as agent_username,
                (SELECT COUNT(*) FROM support_chat_messages 
                 WHERE chat_session_id = s.id AND is_from_user = 0 AND is_read = 0 AND user_id = ?) as unread_count
         FROM support_chat_sessions s
         JOIN users u ON s.user_id = u.id
         LEFT JOIN users a ON s.support_agent_id = a.id
         WHERE s.user_id = ?
         ORDER BY s.updated_at DESC`,
        [userId, userId],
      )

      return rows
    } catch (error) {
      console.error("Error al obtener sesiones de chat del usuario:", error)
      throw error
    }
  }

  static async getAgentSessions(agentId) {
    try {
      const [rows] = await pool.execute(
        `SELECT s.*, u.username as user_username, u.profile_image as user_image,
                a.username as agent_username,
                (SELECT COUNT(*) FROM support_chat_messages 
                 WHERE chat_session_id = s.id AND is_from_user = 1 AND is_read = 0) as unread_count
         FROM support_chat_sessions s
         JOIN users u ON s.user_id = u.id
         LEFT JOIN users a ON s.support_agent_id = a.id
         WHERE s.support_agent_id = ? OR s.support_agent_id IS NULL
         ORDER BY s.status ASC, s.updated_at DESC`,
        [agentId],
      )

      return rows
    } catch (error) {
      console.error("Error al obtener sesiones de chat del agente:", error)
      throw error
    }
  }

  static async assignAgentToSession(sessionId, agentId) {
    try {
      await pool.execute('UPDATE support_chat_sessions SET support_agent_id = ?, status = "active" WHERE id = ?', [
        agentId,
        sessionId,
      ])
    } catch (error) {
      console.error("Error al asignar agente a sesión:", error)
      throw error
    }
  }

  static async closeSession(sessionId) {
    try {
      await pool.execute('UPDATE support_chat_sessions SET status = "closed" WHERE id = ?', [sessionId])
    } catch (error) {
      console.error("Error al cerrar sesión de chat:", error)
      throw error
    }
  }

  // Métodos para mensajes de chat
  static async createMessage(sessionId, userId, message, isFromUser) {
    try {
      const [result] = await pool.execute(
        "INSERT INTO support_chat_messages (chat_session_id, user_id, message, is_from_user) VALUES (?, ?, ?, ?)",
        [sessionId, userId, message, isFromUser ? 1 : 0],
      )

      // Actualizar la fecha de actualización de la sesión
      await pool.execute("UPDATE support_chat_sessions SET updated_at = NOW() WHERE id = ?", [sessionId])

      return result.insertId
    } catch (error) {
      console.error("Error al crear mensaje de chat:", error)
      throw error
    }
  }

  static async getSessionMessages(sessionId) {
    try {
      const [rows] = await pool.execute(
        `SELECT m.*, u.username, u.profile_image
         FROM support_chat_messages m
         JOIN users u ON m.user_id = u.id
         WHERE m.chat_session_id = ?
         ORDER BY m.created_at ASC`,
        [sessionId],
      )

      return rows
    } catch (error) {
      console.error("Error al obtener mensajes de sesión:", error)
      throw error
    }
  }

  static async markMessagesAsRead(sessionId, isFromUser) {
    try {
      await pool.execute(
        "UPDATE support_chat_messages SET is_read = 1 WHERE chat_session_id = ? AND is_from_user = ?",
        [sessionId, isFromUser ? 1 : 0],
      )
    } catch (error) {
      console.error("Error al marcar mensajes como leídos:", error)
      throw error
    }
  }

  static async getUnreadCount(userId, isAgent = false) {
    try {
      let query
      let params

      if (isAgent) {
        // Para agentes: contar mensajes no leídos de usuarios en sesiones asignadas al agente
        query = `
          SELECT COUNT(*) as count 
          FROM support_chat_messages m
          JOIN support_chat_sessions s ON m.chat_session_id = s.id
          WHERE s.support_agent_id = ? AND m.is_from_user = 1 AND m.is_read = 0
        `
        params = [userId]
      } else {
        // Para usuarios: contar mensajes no leídos de agentes en sus sesiones
        query = `
          SELECT COUNT(*) as count 
          FROM support_chat_messages m
          JOIN support_chat_sessions s ON m.chat_session_id = s.id
          WHERE s.user_id = ? AND m.is_from_user = 0 AND m.is_read = 0
        `
        params = [userId]
      }

      const [rows] = await pool.execute(query, params)

      return rows[0].count
    } catch (error) {
      console.error("Error al obtener conteo de mensajes no leídos:", error)
      throw error
    }
  }

  static async getWaitingSessionsCount() {
    try {
      const [rows] = await pool.execute('SELECT COUNT(*) as count FROM support_chat_sessions WHERE status = "waiting"')

      return rows[0].count
    } catch (error) {
      console.error("Error al obtener conteo de sesiones en espera:", error)
      throw error
    }
  }
}

module.exports = SupportChat

