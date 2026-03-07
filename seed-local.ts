import db from './lib/db';

async function seed() {
    console.log('Seeding database...');

    // Simple script to seed the better-sqlite3 database
    const run = (sql: string, params: any[] = []) => db.prepare(sql).run(...params);

    // Clear tables
    run('DELETE FROM AuditLog');
    run('DELETE FROM AssetMovement');
    run('DELETE FROM AssetLocation');
    run('DELETE FROM Valuation');
    run('DELETE FROM Asset');
    run('DELETE FROM User');
    run('DELETE FROM Department');

    // Insert Departments
    run('INSERT INTO Department (id, name, description) VALUES (?, ?, ?)', ['dept-1', 'Computer Science', 'CS Dept']);
    run('INSERT INTO Department (id, name, description) VALUES (?, ?, ?)', ['dept-2', 'Engineering', 'Engineering Dept']);
    run('INSERT INTO Department (id, name, description) VALUES (?, ?, ?)', ['dept-3', 'Administration', 'Admin Dept']);

    // Insert Users
    run('INSERT INTO User (id, email, passwordHash, name, role, departmentId) VALUES (?, ?, ?, ?, ?, ?)', [
        'user-1', 'johndoe@example.com', 'hashed_pass', 'John Doe', 'SUPER_ADMIN', 'dept-3'
    ]);

    // Insert Assets
    const assets = [
        { id: 'AST-001', name: 'Dell XPS 15', category: 'Laptop', status: 'ACTIVE', condition: 'GOOD', qr: 'dev-qr-1', price: 2000, dept: 'dept-1' },
        { id: 'AST-002', name: 'MacBook Pro', category: 'Laptop', status: 'MISSING', condition: 'FAIR', qr: 'dev-qr-2', price: 2500, dept: 'dept-1' },
        { id: 'AST-003', name: 'Cisco Router', category: 'Network', status: 'ACTIVE', condition: 'EXCELLENT', qr: 'dev-qr-3', price: 500, dept: 'dept-2' },
    ];

    for (const a of assets) {
        run('INSERT INTO Asset (id, name, category, status, condition, qrCodeHash, purchasePrice, purchaseDate, currentDepartmentId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            a.id, a.name, a.category, a.status, a.condition, a.qr, a.price, new Date().toISOString(), a.dept
        ]);

        run('INSERT INTO Valuation (id, assetId, method, rate, currentBookValue) VALUES (?, ?, ?, ?, ?)', [
            `val-${a.id}`, a.id, 'STRAIGHT_LINE', 5, a.price - 100
        ]);
    }

    console.log('Database seeded successfully!');
}

seed();
