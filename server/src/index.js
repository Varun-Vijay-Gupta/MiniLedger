const config = require("./config");
const db = require("./db");
const app = require("./app");

async function start() {
  if (!config.databaseUrl) {
    console.error("DATABASE_URL is not set. Copy server/.env.example to server/.env.");
    process.exit(1);
  }

  try {
    await db.initSchema();
  } catch (err) {
    console.error("Could not connect to PostgreSQL or apply schema.");
    console.error(err.message);
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`MiniLedger API running on http://localhost:${config.port}`);
  });
}

start();
