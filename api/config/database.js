const mysql = require('mysql2/promise');
require('dotenv').config();
 
// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'forte_institute',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});
 
// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully!');
    console.log('Database:', process.env.DB_NAME || 'forte_institute');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
};
 
testConnection();
 
module.exports = pool;
 
 