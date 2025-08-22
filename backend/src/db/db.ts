import Database from "better-sqlite3";
import fs from 'fs';
import path from 'path';

// Define the path to the db
const setupSQL = fs.readFileSync(path.join(__dirname, 'setup.sql'), 'utf-8');

// Create and open SQLite db with absolut path
const dbPath = path.join(__dirname, '../../database.db');
const db = new Database(dbPath);

// Apply setup only if tables don't exist
const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();

if (!tableExists) {
	db.exec(setupSQL);
	console.log('Database initialized with tables');
}

export default db;
