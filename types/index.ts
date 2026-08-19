declare global {
  // eslint-disable-next-line no-var
  var __prismaSigtermRegistered: boolean | undefined;
}

export type StoredProductImage = {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
  isCover: boolean;
  width: number;
  height: number;
  format: string;
  publicId?: string;
  bytes?: number;
  imageHash?: string;
  blurDataURL?: string;
};

export type ProductVariantData = {
  id?: string;
  productId?: string;
  name: string;
  size: string;
  price: string;
  salePrice: string;
  stock: number;
  sku: string;
  barcode: string;
  image: string;
  weight: string;
  sortOrder: number;
  status: string;
  isDefault: boolean;
};

export type ProductHistoryEntry = {
  id: string;
  productId: string;
  adminId: string;
  adminName: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
  createdAt: string;
};

export type StoredProduct = {
  id: string;
  name: string;
  slug: string;
  price: string;
  comparePrice: string;
  image: string;
  gallery: string[];
  category: string;
  collection: string;
  visual?: string;
  accent?: string;
  description: string;
  shortDescription?: string;
  ingredients: string;
  nutrition: string;
  badges: string[];
  stock: number;
  lowStockThreshold?: number;
  featured: boolean;
  isBestSeller?: boolean;
  available: boolean;
  status?: "Draft" | "Active" | "Hidden" | "Archived";
  sku?: string;
  barcode?: string;
  brand?: string;
  salePrice?: string;
  costPrice?: string;
  images?: StoredProductImage[];
  createdAt?: string;
  updatedAt?: string;
};

export type ProductFormData = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  sku: string;
  barcode: string;
  regularPrice: string;
  salePrice: string;
  costPrice: string;
  currency: string;
  stock: number;
  lowStockThreshold: number;
  categoryId: string;
  collectionId: string;
  brand: string;
  status: "Draft" | "Active" | "Hidden" | "Archived";
  featured: boolean;
  isBestSeller: boolean;
  images: StoredProductImage[];
};

export type StoredCollection = {
  slug: string;
  title: string;
  description: string;
  accent: string;
  tone: string;
  previewLabel: string;
  image: string;
  order: number;
};

export type StoredCategory = {
  name: string;
  slug: string;
  description: string;
  image: string;
};

export type StoredArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  publishDate: string;
  published: boolean;
  order: number;
};

export type StoredTestimonial = {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
  visible: boolean;
  order: number;
};

export type StoredFAQ = {
  id: string;
  question: string;
  answer: string;
  order: number;
};

export type SiteSettings = {
  websiteName: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  phone: string;
  address: string;
  socialLinks: { twitter: string; instagram: string; facebook: string };
  footer: { description: string; copyright: string; email: string; phone: string; address: string };
  hero: { enabled: boolean; title: string; subtitle: string; description: string; ctaText: string; ctaLink: string; media: string[] };
  featuredProducts: { enabled: boolean; title: string; subtitle: string };
  collectionsSection: { enabled: boolean; title: string; subtitle: string };
  articlesSection: { enabled: boolean; title: string; subtitle: string };
  aboutSection: { enabled: boolean; title: string; subtitle: string; description: string; image: string };
  testimonialsSection: { enabled: boolean; title: string; subtitle: string };
  announcementBar: { enabled: boolean; text: string; link: string; buttonText: string; bgColor: string; textColor: string };
  navbarBanner: { enabled: boolean; text: string; image: string };
  newsletter: { enabled: boolean; title: string; subtitle: string; description: string; placeholder: string; buttonText: string };
  sectionOrder: string[];
};

export type StoredOrderItem = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

export type StoredOrder = {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "refunded";
  orderStatus: "pending" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "completed" | "cancelled" | "refunded";
  subtotal: string;
  shipping: string;
  shippingMethod: string;
  tax: string;
  total: string;
  currency: string;
  items: StoredOrderItem[];
  idempotencyKey: string;
  estimatedDelivery: string;
  actualDeliveryDate: string;
  deliveryCompany: string;
  trackingNumber: string;
  deliveryNotes: string;
  discountAmount: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductData = {
  id: string;
  name: string;
  slug: string;
  price: string;
  comparePrice: string;
  image: string;
  gallery: string[];
  category: string;
  collection: string;
  brand?: string;
  visual?: "can" | "bottle" | "glass";
  accent?: string;
  description: string;
  shortDescription: string;
  ingredients: string;
  nutrition: string;
  badges: string[];
  stock: number;
  featured: boolean;
  isBestSeller?: boolean;
  available: boolean;
};

export type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  brand?: string;
  visual?: "can" | "bottle" | "glass";
  accent?: string;
  description: string;
  gallery: string[];
  stock?: number;
  available?: boolean;
  badges?: string[];
  ingredients?: string;
  nutrition?: string;
  comparePrice?: string;
  collection?: string;
  featured?: boolean;
  slug?: string;
};

export type CollectionData = {
  slug: string;
  title: string;
  description: string;
  accent: string;
  tone: string;
  previewLabel: string;
  image: string;
  order: number;
};
