const { readdirSync, readFileSync } = require('fs');
const { join } = require('path');
const { Pool } = require('pg');

function loadEnvironmentFile() {
  const environmentPath = join(__dirname, '..', '.env');
  const environmentFile = readFileSync(environmentPath, 'utf8');

  for (const line of environmentFile.split(/\r?\n/)) {
    const parsedLine = parseEnvironmentLine(line);

    if (parsedLine !== null) {
      process.env[parsedLine.key] = parsedLine.value;
    }
  }
}

function parseEnvironmentLine(line) {
  const trimmedLine = line.trim();

  if (trimmedLine.length === 0 || trimmedLine.startsWith('#')) {
    return null;
  }

  const separatorIndex = trimmedLine.indexOf('=');

  if (separatorIndex === -1) {
    throw new Error(`Invalid .env line: received "${line}"; expected KEY=value`);
  }

  return {
    key: trimmedLine.slice(0, separatorIndex),
    value: trimmedLine.slice(separatorIndex + 1).replace(/^"|"$/g, ''),
  };
}

async function runMigration() {
  loadEnvironmentFile();

  if (process.env.DATABASE_URL === undefined) {
    throw new Error('Invalid environment: received missing DATABASE_URL; expected database URL');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    for (const migrationName of listMigrationNames()) {
      const migrationSql = readFileSync(
        join(__dirname, '..', 'migrations', migrationName),
        'utf8',
      );
      await pool.query(migrationSql);
      console.log(`Applied migration ${migrationName}`);
    }
  } finally {
    await pool.end();
  }
}

function listMigrationNames() {
  return readdirSync(join(__dirname, '..', 'migrations'))
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort();
}

runMigration().catch((error) => {
  console.error(error);
  process.exit(1);
});
