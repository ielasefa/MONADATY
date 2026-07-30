"use client";

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
  data: { month: string; revenue: number }[];
};

export default function MonthlyRevenueChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-surface p-6">
        <p className="mb-4 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-white/50">
          Monthly Revenue
        </p>
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-muted">No data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface p-6">
      <p className="mb-4 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-white/50">
        Monthly Revenue
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
  <linearGradient id="monthlyRevenueGradient" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stopColor="#D5B87D" stopOpacity={0.18} />
  <stop offset="100%" stopColor="#D5B87D" stopOpacity={0} />
  </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#969087", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "#969087", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
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
              formatter={(value) => [`${Number(value).toFixed(2)} DH`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0F8B6F"
              strokeWidth={2}
              fill="url(#monthlyRevenueGradient)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
