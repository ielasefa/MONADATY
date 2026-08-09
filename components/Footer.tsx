"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getLandingCopy } from "@/lib/landing-copy";
import { PREMIUM_EASE } from "@/lib/motion";

type SocialLinks = {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
};
type FooterSettings = {
  description?: string;
  copyright?: string;
  email?: string;
  phone?: string;
  address?: string;
  socialLinks?: SocialLinks;
};
type FooterProps = {
  settings?: FooterSettings;
  collections?: { slug: string; name: string }[];
  websiteName?: string;
};

function SocialIcon({
  platform,
  href,
  children,
}: {
  platform: string;
  href: string;
  children: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={platform}
      className="group relative inline-flex items-center justify-center text-white/40 transition-colors duration-300 hover:text-gold"
      whileHover={shouldReduceMotion ? undefined : { scale: 1.08, y: -2 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.25, ease: PREMIUM_EASE }}
    >
      {children}
      <span className="absolute -bottom-0.5 left-1/2 h-px w-3 -translate-x-1/2 scale-x-0 bg-gold/50 transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none" />
    </motion.a>
  );
}

export function Footer({
  settings,
  collections: _collections = [],
  websiteName,
}: FooterProps) {
  const { t, lang } = useTranslation("footer");
  const copy = getLandingCopy(lang);
  const isHomePage = usePathname() === "/";
  const shouldReduceMotion = useReducedMotion();

  const copyright =
    settings?.copyright ?? t("copyright", "© 2025 MONADATY. All rights reserved.");
  const contactEmail = settings?.email;
  const socialLinks = settings?.socialLinks ?? {
    twitter: "",
    instagram: "https://instagram.com/monadaty",
    facebook: "",
  };

  const shopLinks = [
    { label: t("all_drinks", "All Drinks"), href: "/shop" },
    { label: t("collections", "Collections"), href: "/collections" },
    { label: t("best_sellers", "Best Sellers"), href: "/shop" },
  ];

  const discoverLinks = [
    { label: t("about", "Our Story"), href: "/about" },
    { label: t("journal", "Journal"), href: "#" },
    ...(contactEmail
      ? [{ label: t("contact_us", "Contact"), href: `mailto:${contactEmail}` }]
      : []),
  ];

  const helpLinks = [
    { label: t("faq", "FAQ"), href: "#" },
    { label: t("shipping", "Shipping"), href: "#" },
    { label: t("returns", "Returns"), href: "#" },
  ];

  const legalLinks = [
    { label: t("privacy", "Privacy"), href: "#" },
    { label: t("terms", "Terms"), href: "#" },
  ];

  const socialEntries = Object.entries(socialLinks).filter(([, value]) => value);

  return (
    <footer className="storefront-theme relative w-full overflow-hidden bg-[#080807]">
      {/* Top gold divider */}
 {/* Top gold divider — luxury shimmer reveal */}
 <motion.div
   initial={shouldReduceMotion ? false : { opacity: 0, scaleX: 0.2 }}
   whileInView={{ opacity: 1, scaleX: 1 }}
   viewport={{ once: true, margin: "-100px" }}
   transition={{ duration: shouldReduceMotion ? 0 : 0.9, ease: PREMIUM_EASE }}
   className="mx-auto max-w-[1520px] px-5 sm:px-8 md:px-10 lg:px-16 xl:px-20"
 >
 <div className="relative h-px w-full overflow-hidden">
   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
   <motion.div
     aria-hidden
     className="absolute inset-0 will-change-transform"
     initial={shouldReduceMotion ? false : { x: "-100%", opacity: 0 }}
     whileInView={shouldReduceMotion ? { opacity: 0 } : { x: "100%", opacity: [0, 0.8, 0] }}
     viewport={{ once: true }}
     transition={{ duration: shouldReduceMotion ? 0 : 1.35, ease: PREMIUM_EASE, delay: shouldReduceMotion ? 0 : 0.25 }}
     style={{
       background: "linear-gradient(90deg, transparent 0%, rgba(214,179,90,0.5) 50%, transparent 100%)",
       filter: "blur(1px)",
     }}
   />
 </div>
 </motion.div>

      {isHomePage ? (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: PREMIUM_EASE }}
          className="mx-auto max-w-[1520px] px-5 sm:px-8 md:px-10 lg:px-16 xl:px-20"
        >
          <div className="grid gap-7 border-b border-white/[0.08] py-14 md:grid-cols-2 md:items-end md:py-16 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.34em] text-gold">
                {copy.footer.newsletterEyebrow}
              </p>
              <h2 className="mt-4 max-w-[15ch] font-display text-[clamp(2rem,4vw,3.75rem)] font-light leading-[0.92] tracking-[-0.04em] text-white">
                {copy.footer.newsletterTitle}
              </h2>
            </div>
            <form
              className="flex w-full max-w-xl flex-col gap-3 sm:flex-row lg:col-span-5 lg:col-start-8 lg:justify-self-end"
              onSubmit={(event) => event.preventDefault()}
            >
              <label className="min-w-0 flex-1">
                <span className="sr-only">{copy.footer.emailLabel}</span>
                <input
                  type="email"
                  placeholder={copy.footer.emailPlaceholder}
                  className="storefront-input bg-white/[0.035]"
                />
              </label>
              <button
                type="submit"
                className="btn-primary h-12"
              >
                {copy.footer.newsletterButton}
              </button>
            </form>
          </div>
        </motion.div>
      ) : null}

      {/* Main content */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: PREMIUM_EASE }}
        className="mx-auto max-w-[1520px] px-5 sm:px-8 md:px-10 lg:px-16 xl:px-20"
      >
        <div className="pb-14 pt-14 md:pb-16 md:pt-16 lg:pb-20 lg:pt-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Brand column */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: PREMIUM_EASE }}
              className="lg:col-span-4"
            >
              <Link
                href="/"
                aria-label={`${websiteName || "MONADATY"} — ${t("home_label", "Home")}`}
                className="group inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
              >
                <motion.span
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                  transition={{ duration: 0.3, ease: PREMIUM_EASE }}
                  className="block font-display text-[clamp(2rem,4vw,2.75rem)] font-normal leading-[0.9] tracking-[-0.04em] text-gold transition-colors duration-700 group-hover:text-gold/70"
                >
                  {websiteName || "MONADATY"}
                </motion.span>
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-[1.8] text-white/55">
                {copy.footer.brandDescription}
              </p>
              <div className="mt-6 flex items-center gap-5">
                {socialEntries.map(([key, value]) => (
                  <SocialIcon
                    key={key}
                    platform={
                      key.charAt(0).toUpperCase() + key.slice(1)
                    }
                    href={value}
                  >
                    {key === "instagram" && (
                      <svg
                        width={14}
                        height={14}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.097 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                      </svg>
                    )}
                    {key === "tiktok" && (
                      <svg
                        width={14}
                        height={14}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.11v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.19 8.19 0 005.58 2.18v-3.45a4.85 4.85 0 01-3.77-1.69 4.83 4.83 0 01-.97-3.15h3.77z" />
                      </svg>
                    )}
                    {key === "facebook" && (
                      <svg
                        width={13}
                        height={13}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {key === "twitter" && (
                      <svg
                        width={13}
                        height={13}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    )}
                  </SocialIcon>
                ))}
              </div>
            </motion.div>

 {/* Navigation columns */}
 <motion.div
   initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
   whileInView={{ opacity: 1, y: 0 }}
   viewport={{ once: true, margin: "-40px" }}
   transition={{
     duration: shouldReduceMotion ? 0 : 0.6,
     ease: PREMIUM_EASE,
     delay: shouldReduceMotion ? 0 : 0.12,
   }}
   className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7 lg:col-start-6 lg:gap-12"
 >
 <nav aria-label={t("shop", "Shop")}>
 <p className="text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-white/40">
   {t("shop", "SHOP")}
 </p>
 <ul className="mt-5 space-y-3.5">
   {shopLinks.map((link) => (
     <li key={link.label} className="relative">
       <Link
         href={link.href}
         className="relative text-[0.78rem] tracking-[0.03em] text-white/50 transition-all duration-300 after:absolute after:bottom-0 after:start-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:translate-x-0.5 hover:text-gold hover:after:w-full"
       >
         {link.label}
       </Link>
     </li>
   ))}
 </ul>
 </nav>

 <nav aria-label={t("discover", "Discover")}>
 <p className="text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-white/40">
   {t("discover", "DISCOVER")}
 </p>
 <ul className="mt-5 space-y-3.5">
   {discoverLinks.map((link) => (
     <li key={link.label} className="relative">
       <Link
         href={link.href}
         className="relative text-[0.78rem] tracking-[0.03em] text-white/50 transition-all duration-300 after:absolute after:bottom-0 after:start-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:translate-x-0.5 hover:text-gold hover:after:w-full"
       >
         {link.label}
       </Link>
     </li>
   ))}
 </ul>
 </nav>

 <nav aria-label={t("help", "Help")}>
 <p className="text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-white/40">
   {t("help", "HELP")}
 </p>
 <ul className="mt-5 space-y-3.5">
   {helpLinks.map((link) => (
     <li key={link.label} className="relative">
       <Link
         href={link.href}
         className="relative text-[0.78rem] tracking-[0.03em] text-white/50 transition-all duration-300 after:absolute after:bottom-0 after:start-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:translate-x-0.5 hover:text-gold hover:after:w-full"
       >
         {link.label}
       </Link>
     </li>
   ))}
 </ul>
 </nav>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bottom bar */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: PREMIUM_EASE }}
        className="border-t border-white/[0.06]"
      >
        <div className="mx-auto flex max-w-[1520px] flex-col items-start justify-between gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:px-10 lg:px-16 xl:px-20">
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: PREMIUM_EASE, delay: shouldReduceMotion ? 0 : 0.08 }}
            className="text-[0.48rem] tracking-[0.15em] text-white/50"
          >
            {copyright}
          </motion.p>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-5">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[0.48rem] tracking-[0.15em] text-white/50 transition-colors duration-300 hover:text-gold"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <span className="h-px w-px bg-ivory/[0.06]" />
            <span className="text-[0.42rem] tracking-[0.18em] text-white/40">
              {t("location", "Casablanca · Morocco")}
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
