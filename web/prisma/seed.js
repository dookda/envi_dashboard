// CommonJS seed script — runs at container startup via Dockerfile CMD.
// Creates the admin user from ADMIN_EMAIL / ADMIN_PASSWORD env vars
// if no matching user already exists.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Administrator';

  if (!email || !password) {
    console.log('[seed] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin seed');
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] Admin already exists: ${email}`);
    return;
  }

  const hashed = bcrypt.hashSync(password, 12);
  await prisma.user.create({ data: { email, name, password: hashed, role: 'admin' } });
  console.log(`[seed] Admin user created: ${email}`);
}

main()
  .catch(e => { console.error('[seed] Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
