// prisma/seed-superadmin.ts
import { prisma } from '@/src/lib/prisma'; // Importing your pre-configured Sovereign OS client
import bcrypt from 'bcryptjs';

async function forgeMasterKey() {
    console.log('Initiating Master Key Forge...');

    const email = 'idforraju1@gmail.com';
    const plainTextPassword = 'idforraju1@gmail.com';

    // We NEVER store plaintext. We encrypt it with a heavy salt round (12).
    console.log('Encrypting credentials...');
    const hashedPassword = await bcrypt.hash(plainTextPassword, 12);

    try {
        const superadmin = await prisma.user.upsert({
            where: { email },
            update: {
                passwordHash: hashedPassword,
                isSystemAdmin: true,
                accountStatus: 'ACTIVE',
            },
            create: {
                email,
                name: 'Supreme Administrator',
                passwordHash: hashedPassword,
                isSystemAdmin: true,
                accountStatus: 'ACTIVE',
            },
        });

        console.log(`\n✅ Master Key Forged Successfully.`);
        console.log(`📧 User: ${superadmin.email}`);
        console.log(`🛡️  Role: System Admin`);
        console.log(`🟢 Status: ${superadmin.accountStatus}`);
    } catch (error) {
        console.error('❌ Forge Failed:', error);
    }
}

forgeMasterKey();