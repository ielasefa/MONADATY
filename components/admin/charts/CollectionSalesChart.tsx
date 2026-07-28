"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

type Props = {
  data: { name: string; value: number }[];
};

const COLORS = ["#D5B87D", "#8F1F30", "#0F8B6F", "#3B82F6", "#8B5CF6", "#D5B87D"];

export default function CollectionSalesChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#141414] p-6">
        <p className="mb-4 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-white/50">
          Sales by Collection
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
        Sales by Collection
      </p>
      <div className="flex h-48 items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={60}
              innerRadius={30}
              animationDuration={800}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
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
          </PieChart>
        </ResponsiveContainer>
        <div className="ml-2 space-y-1.5">
          {data.slice(0, 4).map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-[0.6rem] text-muted">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
