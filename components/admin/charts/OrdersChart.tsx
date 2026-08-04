"use client";

import { useTranslation } from "@/hooks/useTranslation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Props = {
  data: { date: string; orders: number }[];
};

export default function OrdersChart({ data }: Props) {
  const { t } = useTranslation("admin");
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-surface p-6">
        <p className="mb-4 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-white/50">
          Orders (30 days)
        </p>
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-muted">{t("no_data_yet", "No data yet")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface p-6">
      <p className="mb-4 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-white/50">
        Orders (30 days)
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
  <XAxis
    dataKey="date"
    tick={{ fill: "#969087", fontSize: 10 }}
    tickLine={false}
    axisLine={false}
    tickFormatter={(v) => v.slice(5)}
  />
  <YAxis
    tick={{ fill: "#969087", fontSize: 10 }}
    tickLine={false}
    axisLine={false}
    allowDecimals={false}
  />
            <Tooltip
              contentStyle={{
                background: "rgba(16,16,16,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                backdropFilter: "blur(16px)",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(value) => [value, "Orders"]}
              labelFormatter={(label) => label}
            />
            <Bar
              dataKey="orders"
              fill="#C1121F"
              radius={[3, 3, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
