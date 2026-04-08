import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

function getUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error('DATABASE_URL is not set in .env');
  }
  return new URL(raw);
}

function quoteIdentifier(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

async function main() {
  const dbUrl = getUrl();
  const dbName = dbUrl.pathname.replace(/^\//, '');

  if (!dbName) {
    throw new Error(
      'DATABASE_URL must include a database name, e.g. ...:5432/marketplace_core',
    );
  }

  const adminUrl = new URL(dbUrl.toString());
  adminUrl.pathname = '/postgres';

  const adminClient = new Client({ connectionString: adminUrl.toString() });

  await adminClient.connect();
  try {
    const exists = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1 LIMIT 1',
      [dbName],
    );

    if (exists.rowCount && exists.rowCount > 0) {
      console.log(`Database "${dbName}" already exists.`);
      return;
    }

    await adminClient.query(`CREATE DATABASE ${quoteIdentifier(dbName)}`);
    console.log(`Created database "${dbName}".`);
  } finally {
    await adminClient.end();
  }
}

main().catch((err) => {
  console.error(err?.stack || err);
  process.exit(1);
});
