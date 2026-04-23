import { prisma } from './lib/prisma.ts';
import bcrypt from 'bcryptjs';

async function forge() {
  const email = "admin@sovereign.os"; 
  const password = "admin-password-123"; 
  
  const hash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash: hash,
        isSystemAdmin: true,
        accountStatus: 'ACTIVE',
      },
      create: {
        email: email,
        passwordHash: hash,
        isSystemAdmin: true,
        accountStatus: 'ACTIVE',
        name: 'Supreme Admin'
      }
    });
    console.log('✅ ADMIN FORGED/UPDATED:', email);
  } catch (e: any) {
    console.error('❌ FORGE FAILED:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
forge();
