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
  data: { date: string; revenue: number }[];
};

export default function RevenueChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#141414] p-6">
        <p className="mb-4 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-white/50">
          Revenue (30 days)
        </p>
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-muted">No data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#141414] p-6">
      <p className="mb-4 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-white/50">
        Revenue (30 days)
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#9B9B9B", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis
              tick={{ fill: "#9B9B9B", fontSize: 10 }}
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
              labelFormatter={(label) => label}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#D4AF37"
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
