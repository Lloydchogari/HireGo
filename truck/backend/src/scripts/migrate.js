// Small helper so you can run the schema.sql file with `npm run migrate`
// instead of needing the psql CLI directly (though psql works fine too).
const fs = require('fs');
const path = require('path');
const db = require('../db');

async function migrate() {
  const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  try {
    await db.query(sql);
    console.log('Database schema created successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

migrate();
