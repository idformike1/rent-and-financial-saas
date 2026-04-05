import prisma from './lib/prisma';
async function check() {
  const t = await prisma.tenant.findUnique({
    where: { id: '751f5ecd-724f-449b-89c2-097b0ebad3f3' }
  });
  console.log("Tenant found:", !!t);
  if (t) console.log("Org ID:", t.organizationId);
  
  const sessionUser = await prisma.user.findFirst();
  if (sessionUser) console.log("User Org ID:", sessionUser.organizationId);
}
check();
