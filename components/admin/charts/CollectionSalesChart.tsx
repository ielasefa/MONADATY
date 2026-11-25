"use client";

import { useTranslation } from "@/hooks/useTranslation";
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

const COLORS = ["#8C6228", "#8F1F30", "#0F8B6F", "#3B82F6", "#8B5CF6", "#8C6228"];

export default function CollectionSalesChart({ data }: Props) {
  const { t } = useTranslation("admin");
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-card p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
          {t("sales_by_collection", "Sales by Collection")}
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
        {t("sales_by_collection", "Sales by Collection")}
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
                background: "#FFFFFF",
                border: "1px solid #E8E1D8",
                borderRadius: "12px",
                backdropFilter: "blur(16px)",
                color: "#171717",
                fontSize: "12px",
              }}
              formatter={(value) => [`${Number(value).toFixed(2)} DH`, t("revenue", "Revenue")]}
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
              <span className="text-xs text-muted">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
