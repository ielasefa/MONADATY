import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import { headers, cookies } from "next/headers";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";
import { WishlistProvider } from "@/components/wishlist-context";
import { LanguageProvider } from "@/context/LanguageContext";
import { FooterWrapper } from "@/components/FooterWrapper";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import { ToastProvider } from "@/components/ToastProvider";
import { LegacyServiceWorkerCleanup } from "@/components/LegacyServiceWorkerCleanup";
import { GlobalErrorHandler } from "@/components/GlobalErrorHandler";
import { MotionConfigWrapper } from "@/components/MotionConfigWrapper";
import { getLanguageFromCookie, getTranslation, loadTranslations, LANGUAGE_COOKIE } from "@/lib/translations";
import { TranslationHydrator } from "@/components/TranslationHydrator";
import { StorefrontRouteTransition } from "@/components/StorefrontRouteTransition";
import { getAppUrl } from "@/lib/env-validator";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

const siteName = process.env.APP_NAME || "MONADATY";
const siteDescription =
  process.env.APP_DESCRIPTION ||
  "Shop sodas, water, juices and more at great prices with MONADATY.";
const siteUrl = getAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s | ${siteName}` },
  description: siteDescription,
  applicationName: siteName,
  manifest: "/manifest.webmanifest",
  keywords: ["MONADATY", "soda", "water", "juice", "soft drinks", "Morocco"],
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
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.svg",
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
  themeColor: "#0B0B0A",
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
  const commonTr = await loadTranslations("common");
  const skipLabel = getTranslation(commonTr, "skip_to_main", langFromCookie, "Skip to main content");

  return (
    <html lang={langFromCookie} dir={dirFromLang} className={`${dmSerifDisplay.variable} ${dmSans.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" sizes="180x180" />
        <meta name="msapplication-TileColor" content="#0B0B0A" />
        <meta name="theme-color" content="#0B0B0A" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
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
        <CartProvider>
          <WishlistProvider>
            <LanguageProvider initialLang={langFromCookie}>
              <TranslationHydrator initialLang={langFromCookie} initialTranslations={commonTr} />
              {!isAdmin && <NavbarWrapper />}
              <main id="main-content" role="main" className={isAdmin ? undefined : "storefront-shell"}>
                {isAdmin ? children : <StorefrontRouteTransition>{children}</StorefrontRouteTransition>}
              </main>
              {!isAdmin && <FooterWrapper />}
            </LanguageProvider>
          </WishlistProvider>
        </CartProvider>
        <ToastProvider />
        <LegacyServiceWorkerCleanup />
        <GlobalErrorHandler />
        </MotionConfigWrapper>
      </body>
    </html>
  );
}
