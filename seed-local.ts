import db from './lib/db';
import bcrypt from 'bcryptjs';

async function seed() {
    console.log('🚀 Seeding professional database...');

    const run = (sql: string, params: any[] = []) => db.prepare(sql).run(...params);

    // Clear tables
    run('DELETE FROM AuditLog');
    run('DELETE FROM AssetMovement');
    run('DELETE FROM AssetLocation');
    run('DELETE FROM Valuation');
    run('DELETE FROM Asset');
    run('DELETE FROM User');
    run('DELETE FROM Department');
    run('DELETE FROM Campus');

    // Insert Campuses
    run('INSERT INTO Campus (id, name, location, coordinates) VALUES (?, ?, ?, ?)', ['campus-1', 'Harare Main Campus', 'Mount Pleasant, Harare', '-17.783,31.050']);
    run('INSERT INTO Campus (id, name, location, coordinates) VALUES (?, ?, ?, ?)', ['campus-2', 'Bulawayo Regional Centre', 'Ascot, Bulawayo', '-20.150,28.583']);

    // Insert Departments
    run('INSERT INTO Department (id, name, description, campusId) VALUES (?, ?, ?, ?)', ['dept-1', 'Computer Science', 'Main Campus - Faculty of IT', 'campus-1']);
    run('INSERT INTO Department (id, name, description, campusId) VALUES (?, ?, ?, ?)', ['dept-2', 'Engineering', 'West Wing - Engineering Block', 'campus-1']);
    run('INSERT INTO Department (id, name, description, campusId) VALUES (?, ?, ?, ?)', ['dept-3', 'Administration', 'Central Admin Office', 'campus-1']);

    // Insert Users with Real Hashes
    const passwordHash = await bcrypt.hash('password123', 10);

    run('INSERT INTO User (id, email, passwordHash, name, role, departmentId) VALUES (?, ?, ?, ?, ?, ?)', [
        'user-admin', 'admin@zou.ac.zw', passwordHash, 'System Admin', 'SUPER_ADMIN', 'dept-3'
    ]);

    run('INSERT INTO User (id, email, passwordHash, name, role, departmentId) VALUES (?, ?, ?, ?, ?, ?)', [
        'user-officer', 'officer@zou.ac.zw', passwordHash, 'John Doe', 'DEPT_OFFICER', 'dept-1'
    ]);

    // Insert Assets
    const assets = [
        { id: 'ZOU-LAP-001', name: 'Dell Latitude 5420', category: 'Laptop', status: 'ACTIVE', condition: 'EXCELLENT', qr: 'QR-LAP-001', price: 1200, dept: 'dept-1' },
        { id: 'ZOU-LAP-002', name: 'MacBook Air M2', category: 'Laptop', status: 'MISSING', condition: 'GOOD', qr: 'QR-LAP-002', price: 1400, dept: 'dept-1' },
        { id: 'ZOU-SRV-001', name: 'HP ProLiant DL380', category: 'Server', status: 'ACTIVE', condition: 'GOOD', qr: 'QR-SRV-01', price: 4500, dept: 'dept-3' },
        { id: 'ZOU-PRN-001', name: 'Kyocera TaskAlpha', category: 'Printer', status: 'SCRAP', condition: 'SCRAP', qr: 'QR-PRN-01', price: 800, dept: 'dept-2' },
    ];

    for (const a of assets) {
        run('INSERT INTO Asset (id, name, category, status, condition, qrCodeHash, purchasePrice, purchaseDate, currentDepartmentId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            a.id, a.name, a.category, a.status, a.condition, a.qr, a.price, new Date('2024-01-15').toISOString(), a.dept
        ]);

        run('INSERT INTO Valuation (id, assetId, method, rate, currentBookValue, accumulatedDepreciation) VALUES (?, ?, ?, ?, ?, ?)', [
            `val-${a.id}`, a.id, 'STRAIGHT_LINE', 10, a.price * 0.9, a.price * 0.1
        ]);
    }

    // Insert a pending movement for demonstration
    run('INSERT INTO AssetMovement (id, assetId, fromDepartmentId, toDepartmentId, requestedById, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        'mov-1', 'ZOU-LAP-001', 'dept-1', 'dept-2', 'user-officer', 'PENDING', 'Temporary transfer for workshop'
    ]);

    console.log('✅ Database seeded successfully with real users!');
    console.log('Admin Email: admin@zou.ac.zw');
    console.log('Password: password123');
}

seed().catch(err => console.error('Seed crash:', err));
