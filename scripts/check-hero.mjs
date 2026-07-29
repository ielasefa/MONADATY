import { PrismaClient } from '../generated/prisma/client.js';
const p = new PrismaClient();
try {
  const row = await p.setting.findUnique({ where: { key: 'site_settings' } });
  if (row) {
    const val = JSON.parse(row.value);
    console.log('hero media:', JSON.stringify(val.hero?.media));
  } else {
    console.log('no row');
  }
} finally {
  await p.$disconnect();
}
