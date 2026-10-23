/**
 * Create the database (if missing) and load a converted SQL file into it.
 *
 * Usage: node scripts/import-postgres.js ../forte_postgres.sql [--reset]
 *   --reset drops and recreates the database first.
 */
const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config();

const [file, flag] = process.argv.slice(2);
if (!file) {
  console.error('Usage: node import-postgres.js <file.sql> [--reset]');
  process.exit(1);
}

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};
const dbName = process.env.DB_NAME || 'forte';

(async () => {
  const admin = new Client({ ...config, database: 'postgres' });
  await admin.connect();
  if (flag === '--reset') {
    await admin.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
  }
  const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (!rowCount) {
    await admin.query(`CREATE DATABASE "${dbName}" ENCODING 'UTF8'`);
    console.log(`Created database ${dbName}`);
  }
  await admin.end();

  const client = new Client({ ...config, database: dbName });
  await client.connect();
  await client.query(fs.readFileSync(file, 'utf8'));
  const { rows } = await client.query(
    "SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'"
  );
  console.log(`Imported ${file} into ${dbName}: ${rows[0].n} tables`);
  await client.end();
})().catch((err) => {
  console.error('Import failed:', err.message);
  if (err.position) console.error('At position', err.position);
  process.exit(1);
});
