import "dotenv/config";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL!, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const FALLBACK_IMAGE = "/images/placeholder.svg";

const REPLACEMENTS: [string, string][] = [
  ["https://source.unsplash.com/collection/190727/800x800?sig=101&soda,can,white", FALLBACK_IMAGE],
];

async function main() {
  console.log("Fixing product images...");

  const products = await prisma.product.findMany({
    select: { id: true, name: true, image: true, gallery: true },
  });

  let updatedCount = 0;
  let galleryFixCount = 0;

  for (const product of products) {
    let needsUpdate = false;
    let newImage = product.image;
    const newGallery = [...(product.gallery ?? [])];

    for (const [oldUrl, newUrl] of REPLACEMENTS) {
      if (newImage.includes(oldUrl)) {
        newImage = newUrl;
        needsUpdate = true;
      }
      for (let i = 0; i < newGallery.length; i++) {
        if (newGallery[i].includes(oldUrl)) {
          newGallery[i] = newUrl;
          needsUpdate = true;
          galleryFixCount++;
        }
      }
    }

    if (newImage.startsWith("https://source.unsplash.com")) {
      newImage = FALLBACK_IMAGE;
      needsUpdate = true;
    }

    for (let i = 0; i < newGallery.length; i++) {
      if (newGallery[i].startsWith("https://source.unsplash.com")) {
        newGallery[i] = FALLBACK_IMAGE;
        needsUpdate = true;
        galleryFixCount++;
      }
    }

    if (needsUpdate) {
      await prisma.product.update({
        where: { id: product.id },
        data: { image: newImage, gallery: newGallery },
      });
      updatedCount++;
      console.log(`  Fixed: ${product.name} (${product.id})`);
    }
  }

  console.log(`\nDone. Updated ${updatedCount} products, fixed ${galleryFixCount} gallery images.`);
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
