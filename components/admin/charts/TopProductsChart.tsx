"use client";

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
  data: { name: string; value: number }[];
};

export default function TopProductsChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#141414] p-6">
        <p className="mb-4 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-white/50">
          Top Products
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
        Top Products
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              type="number"
              tick={{ fill: "#9B9B9B", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "#9B9B9B", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={80}
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
              formatter={(value) => [value, "Sold"]}
            />
            <Bar
              dataKey="value"
              fill="#D4AF37"
              radius={[0, 3, 3, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
