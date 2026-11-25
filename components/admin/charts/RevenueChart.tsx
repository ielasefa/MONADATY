"use client";

import { useTranslation } from "@/hooks/useTranslation";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Props = {
  data: { date: string; revenue: number }[];
};

export default function RevenueChart({ data }: Props) {
  const { t } = useTranslation("admin");
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-card p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
          {t("revenue_30d", "Revenue (30 days)")}
        </p>
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-muted">{t("no_data_yet", "No data yet")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-card p-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
        {t("revenue_30d", "Revenue (30 days)")}
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stopColor="#8C6228" stopOpacity={0.2} />
  <stop offset="100%" stopColor="#8C6228" stopOpacity={0} />
  </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(69,4,7,0.08)" />
  <XAxis
    dataKey="date"
    tick={{ fill: "#6B6560", fontSize: 12 }}
    tickLine={false}
    axisLine={false}
    tickFormatter={(v) => v.slice(5)}
  />
  <YAxis
    tick={{ fill: "#6B6560", fontSize: 12 }}
    tickLine={false}
    axisLine={false}
    tickFormatter={(v) => Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(1)}k` : String(v)}
  />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #E8E1D8",
                borderRadius: "12px",
                backdropFilter: "blur(16px)",
                color: "#171717",
                fontSize: "12px",
              }}
              formatter={(value) => [`${Number(value).toFixed(2)} DH`, t("revenue", "Revenue")]}
              labelFormatter={(label) => label}
            />
  <Area
    type="monotone"
    dataKey="revenue"
    stroke="#8C6228"
    strokeWidth={2}
    fill="url(#revenueGradient)"
    animationDuration={800}
  />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
