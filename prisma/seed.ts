import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: ['info'] })

async function main() {
    console.log('Seeding database...')

    // Clean existing data
    await prisma.auditLog.deleteMany()
    await prisma.assetMovement.deleteMany()
    await prisma.assetLocation.deleteMany()
    await prisma.valuation.deleteMany()
    await prisma.asset.deleteMany()
    await prisma.user.deleteMany()
    await prisma.department.deleteMany()

    // 1. Create Departments
    const cs = await prisma.department.create({
        data: { name: 'Computer Science', description: 'CS Dept' }
    })
    const eng = await prisma.department.create({
        data: { name: 'Engineering', description: 'Engineering Dept' }
    })
    const admin = await prisma.department.create({
        data: { name: 'Administration', description: 'Admin Dept' }
    })
    const lib = await prisma.department.create({
        data: { name: 'Library', description: 'Library Dept' }
    })
    const media = await prisma.department.create({
        data: { name: 'Media Studies', description: 'Media Studies Dept' }
    })

    // 2. Create Users
    const user1 = await prisma.user.create({
        data: {
            email: 'johndoe@example.com',
            passwordHash: 'hashed_password',
            name: 'John Doe',
            role: 'DEPT_OFFICER',
            departmentId: cs.id
        }
    })

    // 3. Create Assets
    const assets = [
        {
            name: 'Dell XPS 15',
            category: 'Electronics',
            status: 'MISSING',
            condition: 'GOOD',
            qrCodeHash: 'qr1',
            purchaseDate: new Date('2023-01-15'),
            purchasePrice: 2000,
            currentDepartmentId: cs.id,
            assignedUserId: user1.id,
            id: 'AST-2023-014'
        },
        {
            name: 'Canon DSLR Camera',
            category: 'Electronics',
            status: 'MISSING',
            condition: 'FAIR',
            qrCodeHash: 'qr2',
            purchaseDate: new Date('2022-08-10'),
            purchasePrice: 1500,
            currentDepartmentId: media.id,
            assignedUserId: user1.id,
            id: 'AST-2022-089'
        },
        {
            name: 'Epson Projector',
            category: 'Electronics',
            status: 'MISSING',
            condition: 'GOOD',
            qrCodeHash: 'qr3',
            purchaseDate: new Date('2024-02-05'),
            purchasePrice: 800,
            currentDepartmentId: eng.id,
            id: 'AST-2024-002'
        },
        {
            name: 'MacBook Pro M3',
            category: 'Electronics',
            status: 'ACTIVE',
            condition: 'EXCELLENT',
            qrCodeHash: 'qr4',
            purchaseDate: new Date('2024-01-10'),
            purchasePrice: 3500,
            currentDepartmentId: admin.id,
        },
        {
            name: 'Library Desktop PC',
            category: 'Electronics',
            status: 'ACTIVE',
            condition: 'GOOD',
            qrCodeHash: 'qr5',
            purchaseDate: new Date('2021-05-20'),
            purchasePrice: 1200,
            currentDepartmentId: lib.id,
        },
    ]

    for (const assetData of assets) {
        const asset = await prisma.asset.create({
            data: assetData
        })

        // Create Valuation
        await prisma.valuation.create({
            data: {
                assetId: asset.id,
                method: 'STRAIGHT_LINE',
                rate: 5,
                accumulatedDepreciation: 100,
                currentBookValue: assetData.purchasePrice - 100
            }
        })
    }

    console.log('Database seeded successfully')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
