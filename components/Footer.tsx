"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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

export function Footer({
  settings,
  collections: _collections = [],
  websiteName,
}: FooterProps) {
  const { t } = useTranslation("footer");
  const { t: tHome } = useTranslation("home");

  const copyright =
    settings?.copyright ?? "© 2025 MONADATY. All rights reserved.";
  const contactEmail = settings?.email;
  const socialLinks =
    settings?.socialLinks ?? {
      twitter: "",
      instagram: "https://instagram.com/monadaty",
      facebook: "",
    };

  const footerLinks = [
    { label: t("shop"), href: "/shop" },
    { label: t("collections"), href: "/collections" },
    { label: t("about"), href: "/about" },
    ...(contactEmail ? [{ label: t("contact_us"), href: `mailto:${contactEmail}` }] : []),
  ];

  const socialEntries = Object.entries(socialLinks).filter(([, value]) => value);

  return (
    <footer className="relative w-full overflow-hidden bg-black">
      {/* Top editorial divider */}
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 lg:px-16">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
      </div>

      <div className="mx-auto max-w-[1600px] px-6 md:px-10 lg:px-16">
        <div className="relative pt-20 pb-16 md:pt-28 md:pb-20 lg:pt-36 lg:pb-24">
          <div className="flex items-end justify-between">
            <span className="label-utility text-ivory/22">
              {tHome("footer_chapter")}
            </span>
            <span className="font-display text-[5rem] font-light leading-none tracking-[-0.04em] text-ivory/[0.05] md:text-[7rem]">
              03
            </span>
          </div>

          <div className="mt-10 md:mt-14 lg:mt-16">
            <Link
              href="/"
              aria-label={`${websiteName || "MONADATY"} — Home`}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            >
              <span className="block font-display text-[clamp(3.5rem,14vw,12rem)] font-normal leading-[0.85] tracking-[-0.04em] text-ivory transition-colors duration-700 group-hover:text-ivory/65">
                {websiteName || "MONADATY"}
              </span>
            </Link>

            <div className="mt-6 grid grid-cols-1 gap-4 md:mt-10 lg:mt-12 lg:grid-cols-12">
              <div className="lg:col-span-1" />
              <p className="font-display text-[clamp(1.4rem,2.4vw,2rem)] leading-[1.1] tracking-[-0.025em] text-ivory/75 lg:col-span-7">
                {tHome("footer_tagline_1")}
              </p>
              <p className="font-display text-[clamp(1.4rem,2.4vw,2rem)] leading-[1.1] tracking-[-0.025em] text-ivory/40 lg:col-span-3">
                {tHome("footer_tagline_2")}
              </p>
            </div>
          </div>

          <div className="mt-16 flex items-center gap-4 md:mt-24 lg:mt-32">
            <span className="h-px w-8 bg-gold/35" />
            <span className="label-utility text-ivory/22">
              {tHome("footer_marker")}
            </span>
            <span className="h-px flex-1 bg-ivory/[0.05]" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 md:px-10 lg:px-16">
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4 pb-10">
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[0.55rem] uppercase tracking-[0.25em] text-ivory/20 transition-colors duration-300 hover:text-gold/65"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            {socialEntries.map(([key, value]) => (
              <a
                key={key}
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={key.charAt(0).toUpperCase() + key.slice(1)}
                className="text-ivory/15 transition-colors duration-300 hover:text-gold/55"
              >
                {key === "twitter" && (
                  <svg width={12} height={12} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                )}
                {key === "instagram" && (
                  <svg width={13} height={13} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                )}
                {key === "facebook" && (
                  <svg width={12} height={12} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                )}
                {key === "tiktok" && (
                  <svg width={12} height={12} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.11v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.19 8.19 0 005.58 2.18v-3.45a4.85 4.85 0 01-3.77-1.69 4.83 4.83 0 01-.97-3.15h3.77z" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-5 border-t border-ivory/[0.04] py-8 md:flex-row md:items-center">
          <p className="text-[0.45rem] tracking-[0.18em] text-ivory/12">
            {copyright}
          </p>
          <div className="flex items-center gap-6">
            <span className="label-utility text-ivory/15">
              Casablanca · Morocco
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
