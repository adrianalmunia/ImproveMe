const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.usuarios.findFirst();
  console.log('USER_ID:', user ? user.id : 'NONE');
  process.exit(0);
}

main();
