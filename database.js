const Database = require("better-sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "database.sqlite");

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");


db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    customer_name TEXT NOT NULL,
    report_number TEXT NOT NULL UNIQUE,

    received_date TEXT,
    analysis_date TEXT,

    analyst TEXT,
    reviewer TEXT,

    title TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);


db.exec(`
  CREATE TABLE IF NOT EXISTS samples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    project_id INTEGER NOT NULL,
    sample_no INTEGER NOT NULL,

    sampling_location TEXT,
    sample_name TEXT NOT NULL,

    asbestos_content TEXT,
    asbestos_type TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id)
      REFERENCES projects(id)
      ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS
    index_samples_project_id_sample_no
  ON samples (
    project_id,
    sample_no
  );
`);

console.log("SQLite database connected.");
console.log("projects and samples tables are ready.");

module.exports = db;