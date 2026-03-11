import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const db = createClient({
  url: url,
  authToken: authToken,
});

/**
 * Initialize Schema on Turso (Remote)
 * This is meant to be run once or as a migration.
 */
export async function initDb() {
  const schema = `
    CREATE TABLE IF NOT EXISTS Campus (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      location TEXT,
      coordinates TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Department (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      campusId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campusId) REFERENCES Campus(id)
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

    CREATE TABLE IF NOT EXISTS MaintenanceJob (
      id TEXT PRIMARY KEY,
      assetId TEXT NOT NULL,
      type TEXT DEFAULT 'ROUTINE',
      status TEXT DEFAULT 'SCHEDULED',
      scheduledDate DATETIME NOT NULL,
      completedDate DATETIME,
      notes TEXT,
      createdById TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assetId) REFERENCES Asset(id),
      FOREIGN KEY (createdById) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS Alert (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      type TEXT DEFAULT 'INFO',
      isRead INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User(id)
    );
  `;

  try {
    // split by semicolon and filter empty lines to run each statement
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    
    for (const statement of statements) {
      await db.execute(statement);
    }
    
    console.log("Turso Schema Initialized Successfully");
  } catch (error) {
    console.error("Turso Schema Initialization Failed:", error);
  }
}

export default db;
