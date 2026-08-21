import { deleteImage } from "@/lib/cloudinary";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

type ProductImageReference = {
  publicId?: string | null;
  url?: string | null;
};

function uniqueImageReferences(images: ProductImageReference[]): ProductImageReference[] {
  const seen = new Set<string>();
  return images.filter((image) => {
    const publicId = image.publicId?.trim();
    const url = image.url?.trim();
    const key = publicId || url;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function markProductUploadsAttached(images: ProductImageReference[]): Promise<void> {
  const publicIds = [...new Set(images.map((image) => image.publicId?.trim()).filter((value): value is string => Boolean(value)))];
  if (publicIds.length === 0) return;

  try {
    await prisma.tempUpload.updateMany({
      where: { publicId: { in: publicIds }, isAttached: false },
      data: { isAttached: true, attachedAt: new Date() },
    });
  } catch (error) {
    // The product is already durable at this point; metadata cleanup must not
    // turn a successful save into a retry that creates a duplicate product.
    logError(error, "PRODUCT_UPLOAD_ATTACH");
  }
}

export async function cleanupUnreferencedProductImages(images: ProductImageReference[]): Promise<void> {
  for (const image of uniqueImageReferences(images)) {
    const publicId = image.publicId?.trim();
    const url = image.url?.trim();
    if (!publicId || !url?.startsWith("/uploads/")) continue;

    try {
      const remainingReferences = await prisma.productImage.count({ where: { publicId } });
      if (remainingReferences > 0) continue;

      await deleteImage(url);
      await prisma.tempUpload.deleteMany({ where: { publicId } });
    } catch (error) {
      // Database deletion has already committed. Record cleanup failures
      // without returning a false failure that encourages a destructive retry.
      logError(error, "PRODUCT_IMAGE_CLEANUP", { publicId });
    }
  }
}
