import Database from 'better-sqlite3';
import path from 'path';

// Local SQL file (Offline-ready)
const DB_PATH = path.resolve(process.cwd(), 'local.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Initialize Schema
export function initDb() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS Department (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'DEPT_OFFICER',
      departmentId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (departmentId) REFERENCES Department(id)
    );

    CREATE TABLE IF NOT EXISTS Asset (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      serialNumber TEXT UNIQUE,
      description TEXT,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      condition TEXT DEFAULT 'GOOD',
      qrCodeHash TEXT UNIQUE NOT NULL,
      imageUrl TEXT,
      purchaseDate DATETIME NOT NULL,
      purchasePrice REAL NOT NULL,
      currentDepartmentId TEXT,
      assignedUserId TEXT,
      assignedTo TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (currentDepartmentId) REFERENCES Department(id),
      FOREIGN KEY (assignedUserId) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS Valuation (
      id TEXT PRIMARY KEY,
      assetId TEXT UNIQUE NOT NULL,
      method TEXT DEFAULT 'STRAIGHT_LINE',
      rate REAL NOT NULL,
      accumulatedDepreciation REAL DEFAULT 0,
      currentBookValue REAL NOT NULL,
      lastCalculatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assetId) REFERENCES Asset(id)
    );

    CREATE TABLE IF NOT EXISTS AssetLocation (
      id TEXT PRIMARY KEY,
      assetId TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      address TEXT,
      recordedById TEXT NOT NULL,
      recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assetId) REFERENCES Asset(id),
      FOREIGN KEY (recordedById) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS AssetMovement (
      id TEXT PRIMARY KEY,
      assetId TEXT NOT NULL,
      fromDepartmentId TEXT,
      toDepartmentId TEXT NOT NULL,
      requestedById TEXT NOT NULL,
      approvedById TEXT,
      status TEXT DEFAULT 'PENDING',
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assetId) REFERENCES Asset(id),
      FOREIGN KEY (fromDepartmentId) REFERENCES Department(id),
      FOREIGN KEY (toDepartmentId) REFERENCES Department(id),
      FOREIGN KEY (requestedById) REFERENCES User(id),
      FOREIGN KEY (approvedById) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS AuditLog (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      entityType TEXT NOT NULL,
      entityId TEXT NOT NULL,
      userId TEXT,
      details TEXT,
      ipAddress TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User(id)
    );
  `);

    // Migration: Add serialNumber if it doesn't exist
    try {
        db.exec("ALTER TABLE Asset ADD COLUMN serialNumber TEXT");
        db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_serial ON Asset(serialNumber)");
    } catch (e) { }

    try {
        db.exec("ALTER TABLE Asset ADD COLUMN assignedTo TEXT");
    } catch (e) { }
}

// Initial Call
initDb();

export default db;
