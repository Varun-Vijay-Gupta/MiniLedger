const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const config = require("../config");

const pool =
  process.env.NODE_ENV === "test"
    ? null
    : new Pool({
        connectionString: config.databaseUrl,
      });

async function query(text, params) {
  if (!pool) {
    throw new Error("Database is not configured.");
  }
  return pool.query(text, params);
}

async function initSchema() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  await pool.query(sql);
}

module.exports = {
  pool,
  query,
  initSchema,
};
