import db from './lib/db';
import bcrypt from 'bcryptjs';

async function seed() {
    console.log('🚀 Seeding Turso database...');

    const run = async (sql: string, params: any[] = []) => {
        try {
            await db.execute({ sql, args: params });
        } catch (e) {
            console.error(`Error running SQL: ${sql}`, e);
        }
    };

    // Clear tables
    console.log('Cleaning up existing data...');
    await run('DELETE FROM AuditLog');
    await run('DELETE FROM AssetMovement');
    await run('DELETE FROM AssetLocation');
    await run('DELETE FROM Valuation');
    await run('DELETE FROM Asset');
    await run('DELETE FROM User');
    await run('DELETE FROM Department');
    await run('DELETE FROM Campus');

    // Insert Campuses
    console.log('Inserting campuses...');
    await run('INSERT INTO Campus (id, name, location, coordinates) VALUES (?, ?, ?, ?)', ['campus-1', 'Harare Main Campus', 'Mount Pleasant, Harare', '-17.783,31.050']);
    await run('INSERT INTO Campus (id, name, location, coordinates) VALUES (?, ?, ?, ?)', ['campus-2', 'Bulawayo Regional Centre', 'Ascot, Bulawayo', '-20.150,28.583']);

    // Insert Departments
    console.log('Inserting departments...');
    await run('INSERT INTO Department (id, name, description, campusId) VALUES (?, ?, ?, ?)', ['dept-1', 'Computer Science', 'Main Campus - Faculty of IT', 'campus-1']);
    await run('INSERT INTO Department (id, name, description, campusId) VALUES (?, ?, ?, ?)', ['dept-2', 'Engineering', 'West Wing - Engineering Block', 'campus-1']);
    await run('INSERT INTO Department (id, name, description, campusId) VALUES (?, ?, ?, ?)', ['dept-3', 'Administration', 'Central Admin Office', 'campus-1']);

    // Insert Users with Real Hashes
    console.log('Inserting users...');
    const passwordHash = await bcrypt.hash('password123', 10);

    await run('INSERT INTO User (id, email, passwordHash, name, role, departmentId) VALUES (?, ?, ?, ?, ?, ?)', [
        'user-admin', 'admin@zou.ac.zw', passwordHash, 'System Admin', 'SUPER_ADMIN', 'dept-3'
    ]);

    await run('INSERT INTO User (id, email, passwordHash, name, role, departmentId) VALUES (?, ?, ?, ?, ?, ?)', [
        'user-officer', 'officer@zou.ac.zw', passwordHash, 'John Doe', 'DEPT_OFFICER', 'dept-1'
    ]);

    // Insert Assets
    console.log('Inserting assets...');
    const assets = [
        { id: 'ZOU-LAP-001', name: 'Dell Latitude 5420', category: 'Laptop', status: 'ACTIVE', condition: 'EXCELLENT', qr: 'QR-LAP-001', price: 1200, dept: 'dept-1' },
        { id: 'ZOU-LAP-002', name: 'MacBook Air M2', category: 'Laptop', status: 'MISSING', condition: 'GOOD', qr: 'QR-LAP-002', price: 1400, dept: 'dept-1' },
        { id: 'ZOU-SRV-001', name: 'HP ProLiant DL380', category: 'Server', status: 'ACTIVE', condition: 'GOOD', qr: 'QR-SRV-01', price: 4500, dept: 'dept-3' },
        { id: 'ZOU-PRN-001', name: 'Kyocera TaskAlpha', category: 'Printer', status: 'SCRAP', condition: 'SCRAP', qr: 'QR-PRN-01', price: 800, dept: 'dept-2' },
    ];

    for (const a of assets) {
        await run('INSERT INTO Asset (id, name, category, status, condition, qrCodeHash, purchasePrice, purchaseDate, currentDepartmentId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            a.id, a.name, a.category, a.status, a.condition, a.qr, a.price, new Date('2024-01-15').toISOString(), a.dept
        ]);

        await run('INSERT INTO Valuation (id, assetId, method, rate, currentBookValue, accumulatedDepreciation) VALUES (?, ?, ?, ?, ?, ?)', [
            `val-${a.id}`, a.id, 'STRAIGHT_LINE', 10, a.price * 0.9, a.price * 0.1
        ]);
    }

    // Insert a pending movement for demonstration
    await run('INSERT INTO AssetMovement (id, assetId, fromDepartmentId, toDepartmentId, requestedById, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        'mov-1', 'ZOU-LAP-001', 'dept-1', 'dept-2', 'user-officer', 'PENDING', 'Temporary transfer for workshop'
    ]);

    // Insert Maintenance Jobs
    await run('INSERT INTO MaintenanceJob (id, assetId, type, status, scheduledDate, notes, createdById) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        'maint-1', 'ZOU-LAP-001', 'ROUTINE', 'SCHEDULED', new Date('2024-03-20').toISOString(), 'Annual hardware checkup', 'user-admin'
    ]);
    await run('INSERT INTO MaintenanceJob (id, assetId, type, status, scheduledDate, notes, createdById) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        'maint-2', 'ZOU-SRV-001', 'CRITICAL', 'SCHEDULED', new Date('2024-03-05').toISOString(), 'Server uptime optimization', 'user-admin'
    ]);
    await run('INSERT INTO MaintenanceJob (id, assetId, type, status, scheduledDate, notes, createdById) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        'maint-3', 'ZOU-PRN-001', 'REPAIR', 'COMPLETED', new Date('2024-02-15').toISOString(), 'Replaced fuser unit', 'user-admin'
    ]);

    // Insert Audit Logs
    await run('INSERT INTO AuditLog (id, action, entityType, entityId, userId, details, ipAddress) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        'log-1', 'ASSET_CREATED', 'Asset', 'ZOU-LAP-001', 'user-admin', 'Initial asset enrollment into system', '192.168.1.10'
    ]);
    await run('INSERT INTO AuditLog (id, action, entityType, entityId, userId, details, ipAddress) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        'log-2', 'QR_SCAN_SUCCESS', 'Asset', 'ZOU-LAP-001', 'user-officer', 'Manual audit performed via QR scan', '192.168.1.15'
    ]);
    await run('INSERT INTO AuditLog (id, action, entityType, entityId, userId, details, ipAddress) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        'log-3', 'TRANSFER_REQUESTED', 'AssetMovement', 'mov-1', 'user-officer', 'Departmental transfer initiated', '192.168.1.15'
    ]);

    // Insert Alerts
    await run('INSERT INTO Alert (id, userId, title, message, type) VALUES (?, ?, ?, ?, ?)', [
        'alert-1', 'user-admin', 'Pending Approval', 'A new asset movement request requires your attention.', 'INFO'
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('Admin Email: admin@zou.ac.zw');
    console.log('Password: password123');
}

seed().catch(err => console.error('Seed crash:', err));
