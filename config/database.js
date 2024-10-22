// const mysql = require('mysql2');

// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'tu_contraseña',
//   database: 'ojoahi_db'
// });

// connection.connect((err) => {
//   if (err) {
//     console.error('Error conectando a la base de datos:', err);
//     return;
//   }
//   console.log('Conexión a la base de datos establecida');
// });

// module.exports = connection;

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'ojoahi_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;