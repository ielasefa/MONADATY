import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
const main = async () => {
  const pool = new Pool({ connectionString: "postgresql://postgres@127.0.0.1:5432/monadaty" });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const configs = await prisma.landingConfig.findMany({ orderBy: { createdAt: "asc" }, include: { hero: true, featured: true } });
  for (const c of configs) {
    console.log("--- CONFIG ---");
    console.log("id:", c.id);
    console.log("status:", c.status);
    console.log("publishedAt:", c.publishedAt?.toISOString());
    console.log("createdAt:", c.createdAt.toISOString());
    console.log("sectionOrder:", c.sectionOrder);
    console.log("hero.title:", JSON.stringify((c as any).hero?.title));
    console.log("hero.enabled:", (c as any).hero?.enabled);
    console.log("featured.productIds:", (c as any).featured?.productIds);
  }
  await prisma.$disconnect();
};
main().catch((e)=>{ console.error(e); process.exit(1); });
