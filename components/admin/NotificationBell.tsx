"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { AdminNotificationType } from "@/lib/admin-notifications";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  initialNotifications: AdminNotificationType[];
  initialUnread: number;
};

export function NotificationBell({ initialNotifications, initialUnread }: Props) {
  const { t } = useTranslation("admin");
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unread, setUnread] = useState(initialUnread);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = useCallback(async (id: string) => {
    await fetch("/api/admin/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((prev) => Math.max(0, prev - 1));
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    await fetch("/api/admin/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }, []);

  const typeIcon: Record<string, string> = {
    new_order: "\uD83D\uDCE6",
    payment_received: "\uD83D\uDCB0",
    low_stock: "\u26A0\uFE0F",
    new_customer: "\uD83D\uDC65",
    failed_payment: "\u274C",
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-surface text-lg text-white/50 transition hover:border-white/20 hover:text-white"
        aria-label={unread > 0 ? t("notifications_unread", { count: unread }) : t("notifications")}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-red px-1 text-[0.6rem] font-bold text-white shadow-lg shadow-red/30">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-[380px] overflow-hidden rounded-xl border border-white/[0.06] bg-surface shadow-2xl animate-fade-in"
          role="menu"
          aria-label={t("notifications")}
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
            <span className="text-sm font-semibold text-white">{t("notifications")}</span>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[0.65rem] font-medium uppercase tracking-widest text-white/50 transition hover:text-yellow"
              >
                {t("mark_all_read")}
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-white/30">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <p className="text-sm text-white/50">{t("no_notifications")}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`group border-b border-white/[0.03] transition ${
                    !n.read ? "bg-white/[0.02]" : ""
                  }`}
                >
                  <Link
                    href={n.link || "#"}
                    onClick={() => {
                      if (!n.read) handleMarkRead(n.id);
                      setOpen(false);
                    }}
                    className={`flex gap-3 px-5 py-3 transition hover:bg-white/[0.02] ${
                      !n.read ? "border-l-2 border-l-yellow" : "border-l-2 border-l-transparent"
                    }`}
                  >
                    <span className="mt-0.5 text-base leading-none">{typeIcon[n.type] || "\uD83D\uDD14"}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? "font-medium text-white" : "text-white/50"}`}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-white/40">{n.message}</p>
                      <p className="mt-1 text-[0.6rem] text-white/30">
                        {formatTimeAgo(n.createdAt, t)}
                      </p>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date, t: (key: string, params?: string | Record<string, string | number | undefined>) => string): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("just_now");
  if (mins < 60) return t("minutes_ago", { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("hours_ago", { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return t("days_ago", { count: days });
  return new Date(date).toLocaleDateString();
}
