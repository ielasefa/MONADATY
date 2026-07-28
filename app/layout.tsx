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
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { GlobalErrorHandler } from "@/components/GlobalErrorHandler";
import { getLanguageFromCookie, LANGUAGE_COOKIE } from "@/lib/translations";

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

export const metadata: Metadata = {
  title: { default: siteName, template: `%s | ${siteName}` },
  description: process.env.APP_DESCRIPTION || "Crafted in Morocco. Built around taste.",
  manifest: "/manifest.json",
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

  return (
    <html lang={langFromCookie} dir={dirFromLang} className={`${dmSerifDisplay.variable} ${dmSans.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" sizes="180x180" />
        <meta name="msapplication-TileColor" content="#0B0B0A" />
        <meta name="theme-color" content="#0B0B0A" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="prefetch" href="/shop" as="document" />
      </head>
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-burgundy focus:px-6 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:outline-none" aria-label="Skip to main content">
          Skip to main content
        </a>
        {isAdmin ? (
          <LanguageProvider initialLang={langFromCookie}>
            <main id="main-content" role="main">{children}</main>
          </LanguageProvider>
        ) : (
          <CartProvider>
            <WishlistProvider>
              <LanguageProvider initialLang={langFromCookie}>
                <NavbarWrapper />
                <main id="main-content" role="main">{children}</main>
                <FooterWrapper />
              </LanguageProvider>
            </WishlistProvider>
          </CartProvider>
        )}
        <ToastProvider />
        <ServiceWorkerRegistration />
        <GlobalErrorHandler />
      </body>
    </html>
  );
}
