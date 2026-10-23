const { Pool, types } = require('pg');
require('dotenv').config();

// Return COUNT()/SUM() bigint results as numbers (mysql2 did the same for counts)
types.setTypeParser(types.builtins.INT8, (val) => parseInt(val, 10));

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'forte',
  max: 10,
  keepAlive: true
});

/**
 * Translate the MySQL-flavoured SQL used by the routes into PostgreSQL:
 *  - `?` placeholders become $1, $2, ...
 *  - `identifiers` become "identifiers"
 *  - TRUE/FALSE become 1/0 (boolean flags are smallint columns holding 1/0)
 *  - LIKE becomes ILIKE (MySQL's default collation is case-insensitive)
 * String literals are left untouched.
 */
const translate = (sql) => {
  let out = '';
  let index = 0;
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === "'") {
      let j = i + 1;
      while (j < sql.length && !(sql[j] === "'" && sql[j + 1] !== "'")) {
        j += sql[j] === "'" ? 2 : 1;
      }
      out += sql.slice(i, j + 1);
      i = j + 1;
    } else if (ch === '?') {
      out += '$' + ++index;
      i++;
    } else if (ch === '`') {
      out += '"';
      i++;
    } else if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < sql.length && /\w/.test(sql[j])) j++;
      const word = sql.slice(i, j);
      const upper = word.toUpperCase();
      if (upper === 'TRUE') out += '1';
      else if (upper === 'FALSE') out += '0';
      else if (upper === 'LIKE') out += 'ILIKE';
      else out += word;
      i = j;
    } else {
      out += ch;
      i++;
    }
  }
  return out;
};

const toParam = (value) => {
  if (value === undefined) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  return value;
};

/**
 * Run a query and return results shaped like mysql2's promise API:
 *  - SELECT: [rows, fields]
 *  - INSERT/UPDATE/DELETE: [{ insertId, affectedRows, changedRows }, undefined]
 */
const runQuery = async (client, sql, params = []) => {
  let text = translate(sql).trim().replace(/;$/, '');
  const isInsert = /^INSERT\b/i.test(text);
  if (isInsert && !/\bRETURNING\b/i.test(text)) {
    text += ' RETURNING *';
  }

  let result;
  try {
    result = await client.query(text, params.map(toParam));
  } catch (error) {
    error.sqlMessage = error.message;
    error.sql = text;
    if (error.code === '23505') error.code = 'ER_DUP_ENTRY';
    throw error;
  }

  if (isInsert || ['UPDATE', 'DELETE'].includes(result.command)) {
    return [{
      insertId: isInsert && result.rows[0] ? result.rows[0].id ?? 0 : 0,
      affectedRows: result.rowCount,
      changedRows: result.rowCount,
      warningStatus: 0
    }, undefined];
  }
  return [result.rows, result.fields];
};

const db = {
  query: (sql, params) => runQuery(pool, sql, params),
  execute: (sql, params) => runQuery(pool, sql, params),
  getConnection: async () => {
    const client = await pool.connect();
    return {
      query: (sql, params) => runQuery(client, sql, params),
      execute: (sql, params) => runQuery(client, sql, params),
      beginTransaction: () => client.query('BEGIN'),
      commit: () => client.query('COMMIT'),
      rollback: () => client.query('ROLLBACK'),
      release: () => client.release()
    };
  },
  end: () => pool.end(),
  pool
};

// Test database connection
const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log('Database connected successfully!');
    console.log('Database:', process.env.DB_NAME || 'forte');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
};

testConnection();

module.exports = db;
