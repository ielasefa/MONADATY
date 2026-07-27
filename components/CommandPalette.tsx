"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  brandName?: string;
};

export function CommandPalette({ open, onClose, brandName = "MONADATY" }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState("");
  const { t: tCommon } = useTranslation("common");
  const { t: tHome } = useTranslation("home");
  const { t: tNavbar } = useTranslation("navbar");
  const { t: tWishlist } = useTranslation("wishlist");
  const { t: tCheckout } = useTranslation("checkout");
  const { t: tAdmin } = useTranslation("admin");
  const { t: tErrors } = useTranslation("errors");

  useEffect(() => {
    if (open) {
      setSearch("");
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const navigationItems = [
    { group: tCommon("shop"), label: tCommon("browse_all_drinks"), href: "/shop", icon: "cup" },
    { group: tCommon("shop"), label: tHome("best_sellers"), href: "/shop?sort=best-selling", icon: "star" },
    { group: tCommon("pages"), label: tNavbar("about"), href: "/about", icon: "scroll" },
    { group: tCommon("pages"), label: tWishlist("wishlist_title"), href: "/wishlist", icon: "heart" },
    { group: tCommon("pages"), label: tCheckout("checkout_title"), href: "/checkout", icon: "card" },
    { group: tCommon("account"), label: tAdmin("dashboard"), href: "/admin/dashboard", icon: "gear" },
  ];

  const iconPaths: Record<string, React.ReactNode> = {
    cup: <path d="M6 8h10v5a4 4 0 01-4 4H10a4 4 0 01-4-4V8zM16 9h2.5a2 2 0 010 4H16M8 3v2M12 3v2" strokeLinecap="round" strokeLinejoin="round" />,
    star: <path d="M12 4l2.2 4.6 5 .7-3.6 3.5.9 5L12 15.8 7.5 18.3l.9-5L4.8 9.3l5-.7L12 4z" strokeLinecap="round" strokeLinejoin="round" />,
    scroll: <path d="M7 4h9a2 2 0 012 2v11a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2zM7 8h8M7 12h8M7 16h5" strokeLinecap="round" strokeLinejoin="round" />,
    heart: <path d="M12 20s-6-4-8-7.5C2.5 9.5 4.5 6 8 6c2 0 3 1 4 2.5C13 7 14 6 16 6c3.5 0 5.5 3.5 4 6.5C18 16 12 20 12 20z" strokeLinecap="round" strokeLinejoin="round" />,
    card: <path d="M3 7h18v10H3V7zM3 10h18" strokeLinecap="round" strokeLinejoin="round" />,
    gear: <path d="M12 9a3 3 0 100 6 3 3 0 000-6zM19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 00-2-1.2l-.3-2.5h-4l-.3 2.5a7 7 0 00-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 002 1.2l.3 2.5h4l.3-2.5a7 7 0 002-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" strokeLinecap="round" strokeLinejoin="round" />,
    home: <path d="M4 11l8-7 8 7M6 9.5V20h12V9.5" strokeLinecap="round" strokeLinejoin="round" />,
  };

  const filtered = search
    ? navigationItems.filter(
        (item) =>
          item.label.toLowerCase().includes(search.toLowerCase()) ||
          item.group.toLowerCase().includes(search.toLowerCase()),
      )
    : navigationItems;

  const groups = [...new Set(filtered.map((item) => item.group))];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[18vh]"
          >
            <Command
              role="dialog"
              aria-modal="true"
              aria-label={tCommon("search_commands")}
              className="w-full max-w-xl overflow-hidden rounded-md liquid-glass shadow-premium-xl"
              loop
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Escape") onClose();
              }}
            >
              <div className="flex items-center gap-3 border-b border-ivory/[0.04] px-5">
                <svg width={20} height={20} className="shrink-0 text-ivory/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="4" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <Command.Input
                  ref={inputRef}
                  value={search}
                  onValueChange={setSearch}
                  placeholder={tCommon("search_drinks_commands")}
                  className="h-14 flex-1 bg-transparent text-[0.8rem] text-ivory outline-none placeholder:text-ivory/20 focus:ring-0"
                  aria-label={tCommon("search_commands")}
                />
                <kbd className="hidden rounded-md border border-ivory/[0.05] bg-ivory/[0.02] px-2 py-1 text-[0.55rem] font-medium text-ivory/25 sm:inline">
                  {tCommon("esc_key")}
                </kbd>
              </div>

              <Command.List className="max-h-80 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-ivory/10">
                <Command.Empty className="py-12 text-center text-[0.75rem] text-ivory/25">
                  {tCommon("no_results")}
                </Command.Empty>

                {groups.map((group) => (
                  <Command.Group
                    key={group}
                    heading={group}
                    className="mb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[0.5rem] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.22em] [&_[cmdk-group-heading]]:text-ivory/25"
                  >
                    {filtered
                      .filter((item) => item.group === group)
                      .map((item) => (
                        <Command.Item
                          key={item.href}
                          value={item.label}
                          onSelect={() => {
                            router.push(item.href);
                            onClose();
                          }}
                          className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-[0.75rem] text-ivory/40 transition-all duration-150 hover:translate-x-1 data-[selected=true]:bg-ivory/[0.04] data-[selected=true]:text-ivory"
                        >
                          <svg aria-hidden="true" width={20} height={20} className="shrink-0 text-ivory/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            {iconPaths[item.icon]}
                          </svg>
                          <span>{item.label}</span>
                          <span className="ml-auto text-[0.5rem] tracking-wider text-ivory/15">{item.group}</span>
                        </Command.Item>
                      ))}
                  </Command.Group>
                ))}

                <Command.Separator className="my-2 h-px bg-ivory/[0.04]" />

                <Command.Group
                  heading={tCommon("quick_actions")}
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[0.5rem] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.22em] [&_[cmdk-group-heading]]:text-burgundy/50"
                >
                  <Command.Item
                    value={tCommon("home")}
                    onSelect={() => {
                      router.push("/");
                      onClose();
                    }}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-[0.75rem] text-ivory/40 transition-all duration-150 hover:translate-x-1 data-[selected=true]:bg-ivory/[0.04] data-[selected=true]:text-ivory"
                  >
                    <svg aria-hidden="true" width={20} height={20} className="shrink-0 text-burgundy/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      {iconPaths.home}
                    </svg>
                    <span>{tErrors("go_home")}</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>

              <div className="flex items-center justify-between border-t border-ivory/[0.04] px-4 py-2.5">
                <div className="flex items-center gap-3 text-[0.5rem] text-ivory/15">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-ivory/[0.05] bg-ivory/[0.02] px-1.5 py-0.5">↑↓</kbd> {tCommon("navigate")}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-ivory/[0.05] bg-ivory/[0.02] px-1.5 py-0.5">↵</kbd> {tCommon("select")}
                  </span>
                </div>
                <Link href="/" onClick={onClose} className="text-[0.5rem] font-medium tracking-wider text-burgundy/40 hover:text-burgundy">
                  {brandName}
                </Link>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
