/**
 * Convert a phpMyAdmin/mysqldump file (e.g. forte.sql) into PostgreSQL SQL.
 *
 * Usage: node scripts/mysql-to-postgres.js ../forte.sql ../forte_postgres.sql
 *
 * Type mapping keeps MySQL semantics the app relies on:
 *   tinyint(1) -> smallint (values stay 1/0), enum -> varchar + CHECK,
 *   AUTO_INCREMENT -> identity, ON UPDATE CURRENT_TIMESTAMP -> trigger.
 */
const fs = require('fs');

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('Usage: node mysql-to-postgres.js <input.sql> <output.sql>');
  process.exit(1);
}

const src = fs.readFileSync(input, 'utf8');

// Split into statements on ';' outside of quotes and comments
function splitStatements(sql) {
  const out = [];
  let cur = '';
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === "'" || ch === '"' || ch === '`') {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === '\\' && ch !== '`') { j += 2; continue; }
        if (sql[j] === ch) {
          if (sql[j + 1] === ch) { j += 2; continue; }
          break;
        }
        j++;
      }
      cur += sql.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (ch === '-' && sql[i + 1] === '-' && cur.trim() === '') {
      const nl = sql.indexOf('\n', i);
      i = nl === -1 ? sql.length : nl + 1;
      continue;
    }
    if (ch === '/' && sql[i + 1] === '*') {
      const end = sql.indexOf('*/', i + 2);
      i = end === -1 ? sql.length : end + 2;
      continue;
    }
    if (ch === ';') {
      if (cur.trim()) out.push(cur.trim());
      cur = '';
      i++;
      continue;
    }
    cur += ch;
    i++;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// Rewrite MySQL string literals ('..' with backslash escapes) to standard SQL,
// and `identifiers` to "identifiers"
function convertLiterals(sql) {
  let res = '';
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === '`') {
      const end = sql.indexOf('`', i + 1);
      res += '"' + sql.slice(i + 1, end) + '"';
      i = end + 1;
      continue;
    }
    if (ch === "'") {
      let val = '';
      let j = i + 1;
      while (j < sql.length) {
        const c = sql[j];
        if (c === '\\') {
          const n = sql[j + 1];
          val += { n: '\n', r: '\r', t: '\t', '0': '', Z: '\x1a', b: '\b' }[n] ?? n;
          j += 2;
          continue;
        }
        if (c === "'") {
          if (sql[j + 1] === "'") { val += "'"; j += 2; continue; }
          break;
        }
        val += c;
        j++;
      }
      res += "'" + val.replace(/'/g, "''") + "'";
      i = j + 1;
      continue;
    }
    res += ch;
    i++;
  }
  return res;
}

const q = (name) => '"' + name.replace(/`/g, '') + '"';

const tables = [];              // CREATE TABLE statements
const inserts = [];             // data
const constraints = [];         // PKs, unique, indexes
const foreignKeys = [];
const identities = [];          // { table, column, next }
const onUpdateCols = {};        // table -> [columns]

function convertColumn(table, line) {
  const m = line.match(/^`([^`]+)`\s+(.*?),?$/);
  if (!m) return null;
  const [, col] = m;
  let def = m[2];

  if (/ON UPDATE CURRENT_TIMESTAMP/i.test(def)) {
    (onUpdateCols[table] ||= []).push(col);
    def = def.replace(/\s*ON UPDATE CURRENT_TIMESTAMP(\(\))?/i, '');
  }

  def = def
    .replace(/\s*CHARACTER SET \w+/gi, '')
    .replace(/\s*COLLATE \w+/gi, '')
    .replace(/\s*COMMENT '(?:[^'\\]|\\.|'')*'/gi, '');

  let check = '';
  const enumMatch = def.match(/^enum\(((?:'(?:[^'\\]|\\.|'')*',?)+)\)/i);
  if (enumMatch) {
    check = ` CHECK (${q(col)} IN (${enumMatch[1]}))`;
    def = 'varchar(255)' + def.slice(enumMatch[0].length);
  }

  def = def
    .replace(/^tinyint(\(\d+\))?/i, 'smallint')
    .replace(/^smallint\(\d+\)/i, 'smallint')
    .replace(/^mediumint(\(\d+\))?/i, 'integer')
    .replace(/^int(\(\d+\))?/i, 'integer')
    .replace(/^bigint(\(\d+\))?/i, 'bigint')
    .replace(/^(tiny|medium|long)text/i, 'text')
    .replace(/^(tiny|medium|long)?blob/i, 'bytea')
    .replace(/^datetime(\(\d\))?/i, 'timestamp')
    .replace(/^year(\(\d\))?/i, 'smallint')
    .replace(/^double/i, 'double precision')
    .replace(/^float/i, 'real')
    .replace(/\s+unsigned/i, '');

  return `  ${q(col)} ${def}${check}`;
}

function handleCreate(stmt) {
  const table = stmt.match(/CREATE TABLE (?:IF NOT EXISTS )?`([^`]+)`/i)[1];
  const body = stmt.slice(stmt.indexOf('(') + 1, stmt.lastIndexOf(')'));
  const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
  const cols = [];
  for (const line of lines) {
    if (line.startsWith('`')) {
      cols.push(convertColumn(table, line));
    } else if (/^PRIMARY KEY/i.test(line)) {
      cols.push('  ' + convertLiterals(line.replace(/,$/, '')));
    }
    // inline KEY/INDEX definitions are not emitted by phpMyAdmin dumps
  }
  tables.push(`CREATE TABLE ${q(table)} (\n${cols.join(',\n')}\n);`);
}

function handleAlter(stmt) {
  const table = stmt.match(/ALTER TABLE `([^`]+)`/i)[1];
  const clauses = stmt.replace(/^ALTER TABLE `[^`]+`\s*/i, '').split(/,\n\s*/);
  for (let clause of clauses) {
    clause = clause.trim().replace(/,$/, '');
    let m;
    if ((m = clause.match(/^ADD PRIMARY KEY \((.+)\)$/i))) {
      constraints.push(`ALTER TABLE ${q(table)} ADD PRIMARY KEY (${convertLiterals(m[1])});`);
    } else if ((m = clause.match(/^ADD UNIQUE KEY `([^`]+)` \((.+)\)$/i))) {
      constraints.push(`ALTER TABLE ${q(table)} ADD CONSTRAINT ${q(table + '_' + m[1])} UNIQUE (${convertLiterals(m[2])});`);
    } else if ((m = clause.match(/^ADD (?:KEY|INDEX) `([^`]+)` \((.+)\)$/i))) {
      constraints.push(`CREATE INDEX ${q(table + '_' + m[1])} ON ${q(table)} (${convertLiterals(m[2])});`);
    } else if ((m = clause.match(/^ADD FULLTEXT KEY `([^`]+)` \((.+)\)$/i))) {
      // no direct equivalent; skip
    } else if ((m = clause.match(/^MODIFY `([^`]+)` .*AUTO_INCREMENT(?:, AUTO_INCREMENT=(\d+))?$/i))) {
      identities.push({ table, column: m[1], next: m[2] ? Number(m[2]) : 1 });
    } else if (/^ADD CONSTRAINT .* FOREIGN KEY/i.test(clause)) {
      foreignKeys.push(`ALTER TABLE ${q(table)} ${convertLiterals(clause)};`);
    } else if (clause) {
      console.warn(`Skipped ALTER clause on ${table}: ${clause}`);
    }
  }
}

for (const stmt of splitStatements(src)) {
  if (/^CREATE TABLE/i.test(stmt)) handleCreate(stmt);
  else if (/^INSERT INTO/i.test(stmt)) inserts.push(convertLiterals(stmt) + ';');
  else if (/^ALTER TABLE/i.test(stmt)) handleAlter(stmt);
  else if (/^(SET|START TRANSACTION|COMMIT|CREATE DATABASE|USE)\b/i.test(stmt)) continue;
  else console.warn('Skipped statement:', stmt.slice(0, 80));
}

const out = [];
out.push('-- Generated from MySQL dump by scripts/mysql-to-postgres.js');
out.push('BEGIN;');
out.push(`
CREATE OR REPLACE FUNCTION set_updated_columns() RETURNS trigger AS $$
DECLARE col text;
BEGIN
  FOREACH col IN ARRAY TG_ARGV LOOP
    NEW := json_populate_record(NEW, json_build_object(col, CURRENT_TIMESTAMP));
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`);
out.push(...tables, '');
out.push(...inserts, '');
out.push(...constraints, '');
for (const { table, column, next } of identities) {
  out.push(`ALTER TABLE ${q(table)} ALTER COLUMN ${q(column)} ADD GENERATED BY DEFAULT AS IDENTITY;`);
  out.push(
    `SELECT setval(pg_get_serial_sequence('${q(table)}', '${column}'), ` +
    `GREATEST(${next - 1}, (SELECT COALESCE(MAX(${q(column)}), 0) FROM ${q(table)}), 1), ` +
    `GREATEST(${next - 1}, (SELECT COALESCE(MAX(${q(column)}), 0) FROM ${q(table)})) > 0);`
  );
}
out.push('');
out.push(...foreignKeys, '');
for (const [table, cols] of Object.entries(onUpdateCols)) {
  out.push(
    `CREATE TRIGGER ${q(table + '_on_update')} BEFORE UPDATE ON ${q(table)} ` +
    `FOR EACH ROW EXECUTE FUNCTION set_updated_columns(${cols.map((c) => `'${c}'`).join(', ')});`
  );
}
out.push('COMMIT;', '');

fs.writeFileSync(output, out.join('\n'));
console.log(
  `Wrote ${output}: ${tables.length} tables, ${inserts.length} inserts, ` +
  `${identities.length} identity columns, ${foreignKeys.length} foreign keys, ` +
  `${Object.keys(onUpdateCols).length} update triggers`
);
