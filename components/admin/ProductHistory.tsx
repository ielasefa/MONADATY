"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import type { ProductHistoryEntry } from "@/types";

const ACTION_ICONS: Record<string, string> = {
  Created: "✦",
  Edited: "✎",
  "Price Changed": "¤",
  "Stock Changed": "↕",
  "Status Changed": "⬡",
  "Deleted Image": "✕",
  "Uploaded Image": "⊕",
  "Cover Changed": "⊡",
  "Variant Added": "⊞",
  "Variant Updated": "⊟",
  "Variant Deleted": "⊠",
};

const ACTION_COLORS: Record<string, string> = {
  Created: "text-gold",
  Edited: "text-white/70",
  "Price Changed": "text-gold",
  "Stock Changed": "text-gold",
  "Status Changed": "text-gold/80",
  "Deleted Image": "text-burgundy",
  "Uploaded Image": "text-gold",
  "Cover Changed": "text-gold",
  "Variant Added": "text-gold",
  "Variant Updated": "text-white/70",
  "Variant Deleted": "text-burgundy",
};

export function ProductHistory({ productId }: { productId: string }) {
  const { t } = useTranslation("common");
  const [history, setHistory] = useState<ProductHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/history`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-white/5" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-white/5" />
              <div className="h-3 w-24 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-white/50">
        <span className="text-2xl">⏱</span>
        <p className="text-sm">{t("no_history_recorded", "No history recorded yet")}</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {history.map((entry, idx) => {
        const icon = ACTION_ICONS[entry.action] || "•";
        const color = ACTION_COLORS[entry.action] || "text-white/50";
        const isLast = idx === history.length - 1;

        return (
          <div key={entry.id} className="relative flex gap-4 pb-6">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-4 top-8 bottom-0 w-px bg-white/[0.06]" />
            )}

            {/* Icon */}
            <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-bg ${color}`}>
              <span className="text-xs">{icon}</span>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className={`text-sm font-medium ${color}`}>{entry.action}</span>
                <span className="text-xs text-white/50">
                  {new Date(entry.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {entry.adminName && (
                <p className="mt-0.5 text-xs text-white/50">by {entry.adminName}</p>
              )}
              {entry.field && (
                <p className="mt-1 text-xs text-white/50">
                  Field: <span className="text-white/60">{entry.field}</span>
                </p>
              )}
              {(entry.oldValue || entry.newValue) && (
                <div className="mt-1 flex items-center gap-2 text-xs">
                  {entry.oldValue && (
                    <span className="rounded bg-burgundy/10 px-1.5 py-0.5 text-burgundy line-through">
                      {entry.oldValue.length > 60
                        ? entry.oldValue.slice(0, 60) + "..."
                        : entry.oldValue}
                    </span>
                  )}
                  {(entry.oldValue && entry.newValue) && (
                    <span className="text-white/50">→</span>
                  )}
                  {entry.newValue && (
                    <span className="rounded bg-gold/10 px-1.5 py-0.5 text-gold">
                      {entry.newValue.length > 60
                        ? entry.newValue.slice(0, 60) + "..."
                        : entry.newValue}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
