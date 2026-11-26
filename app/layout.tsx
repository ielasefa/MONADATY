import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers, cookies } from "next/headers";
import "./globals.css";
import "./admin.css";
import "./typography.css";
import { CartProvider } from "@/components/cart-context";
import { WishlistProvider } from "@/components/wishlist-context";
import { LanguageProvider } from "@/context/LanguageContext";
import { FooterWrapper } from "@/components/FooterWrapper";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import { ToastProvider } from "@/components/ToastProvider";
import { LegacyServiceWorkerCleanup } from "@/components/LegacyServiceWorkerCleanup";
import { GlobalErrorHandler } from "@/components/GlobalErrorHandler";
import { MotionConfigWrapper } from "@/components/MotionConfigWrapper";
import { getCanonicalSiteUrl } from "@/lib/env-validator";
import { getLanguageFromCookie, getTranslation, loadTranslationNamespaces, LANGUAGE_COOKIE } from "@/lib/translations";
import { TranslationProvider } from "@/components/TranslationHydrator";
import { SiteShell } from "@/components/SiteShell";

const playfairDisplay = localFont({
  src: "./fonts/playfair-display-latin.woff2",
  weight: "400 700",
  variable: "--font-playfair",
  display: "swap",
});

const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

const arabic = localFont({
  src: "./fonts/noto-sans-arabic.woff2",
  weight: "100 900",
  variable: "--font-arabic",
  display: "swap",
});

const siteName = process.env.APP_NAME || "MONADATY";
const siteDescription =
  "Commandez vos boissons en gros pour épiceries, cafés, restaurants et commerces, avec livraison jusqu’à vous.";
const siteUrl = getCanonicalSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName} — Boissons en gros pour professionnels`, template: `%s | ${siteName}` },
  description: siteDescription,
  applicationName: siteName,
  manifest: "/manifest.webmanifest",
  keywords: ["MONADATY", "boissons en gros", "wholesale beverages", "soda", "water", "juice", "Morocco"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName,
    url: "/",
    title: siteName,
    description: siteDescription,
    locale: "en_US",
    alternateLocale: ["fr_FR", "ar_MA"],
    images: [{ url: "/uploads/monadaty/hero/8236e9ab9f624611.png", width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/uploads/monadaty/hero/8236e9ab9f624611.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteName,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#780B10",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const isAdmin = headersList.get("x-admin-route") === "1";
  const cookieStore = await cookies();
  const langFromCookie = getLanguageFromCookie(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const dirFromLang = langFromCookie === "ar" ? "rtl" : "ltr";
  const initialTranslations = await loadTranslationNamespaces(
    isAdmin
      ? ["common", "navbar", "footer", "products", "cart", "buttons", "errors", "admin", "auth", "inventory", "invoice"]
      : ["common", "navbar", "footer", "products", "cart", "buttons", "errors", "shop", "checkout", "success", "wishlist"],
  );
  const commonTr = initialTranslations.common ?? {};
  const skipLabel = getTranslation(commonTr, "skip_to_main", langFromCookie, "Skip to main content");

  return (
    <html lang={langFromCookie} dir={dirFromLang} className={`${playfairDisplay.variable} ${inter.variable} ${arabic.variable}`}>
      <head>
        <meta name="msapplication-TileColor" content="#780B10" />
        <link rel="prefetch" href="/shop" as="document" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: siteName,
                url: siteUrl,
                logo: `${siteUrl}/icons/icon-512.png`,
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: siteName,
                url: siteUrl,
              },
            ]),
          }}
        />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-burgundy focus:px-6 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:outline-none" aria-label={skipLabel}>
          {skipLabel}
        </a>
        <MotionConfigWrapper>
          <LanguageProvider initialLang={langFromCookie}>
            <TranslationProvider initialTranslations={initialTranslations}>
              <CartProvider>
                <WishlistProvider>
                  <SiteShell
                    navbar={<NavbarWrapper />}
                    footer={<FooterWrapper />}
                  >
                    {children}
                  </SiteShell>
                </WishlistProvider>
              </CartProvider>
            </TranslationProvider>
          </LanguageProvider>
          <ToastProvider />
          <LegacyServiceWorkerCleanup />
          <GlobalErrorHandler />
        </MotionConfigWrapper>
      </body>
    </html>
  );
}
