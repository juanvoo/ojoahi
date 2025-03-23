const pool = require("../config/database")

class FAQ {
  constructor(data) {
    this.id = data.id
    this.question = data.question
    this.answer = data.answer
    this.position = data.position || 0
    this.is_active = data.is_active || 1
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }

  static async createTable() {
    const connection = await pool.getConnection()
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS faqs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          question VARCHAR(255) NOT NULL,
          answer TEXT NOT NULL,
          position INT DEFAULT 0,
          is_active TINYINT(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `)
      console.log("Tabla de FAQs creada o ya existente")
    } catch (error) {
      console.error("Error al crear la tabla de FAQs:", error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async getAll() {
    try {
      const [rows] = await pool.execute("SELECT * FROM faqs ORDER BY position ASC")

      return rows
    } catch (error) {
      console.error("Error al obtener FAQs:", error)
      throw error
    }
  }

  static async getActive() {
    try {
      const [rows] = await pool.execute("SELECT * FROM faqs WHERE is_active = 1 ORDER BY position ASC");

      return rows;
    } catch (error) {
      console.error("Error al obtener FAQs activas:", error)
      throw error
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute("SELECT * FROM faqs WHERE id = ?", [id])

      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error("Error al obtener FAQ por ID:", error)
      throw error
    }
  }

  static async create(data) {
    try {
      const [result] = await pool.execute(
        "INSERT INTO faqs (question, answer, position, is_active) VALUES (?, ?, ?, ?)",
        [data.question, data.answer, data.position || 0, data.is_active || 1],
      )

      return result.insertId
    } catch (error) {
      console.error("Error al crear FAQ:", error)
      throw error
    }
  }

  static async update(id, data) {
    try {
      await pool.execute("UPDATE faqs SET question = ?, answer = ?, position = ?, is_active = ? WHERE id = ?", [
        data.question,
        data.answer,
        data.position,
        data.is_active,
        id,
      ])
    } catch (error) {
      console.error("Error al actualizar FAQ:", error)
      throw error
    }
  }

  static async delete(id) {
    try {
      await pool.execute("DELETE FROM faqs WHERE id = ?", [id])
    } catch (error) {
      console.error("Error al eliminar FAQ:", error)
      throw error
    }
  }
}

module.exports = FAQ

