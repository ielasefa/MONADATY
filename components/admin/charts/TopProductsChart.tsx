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
  data: { name: string; value: number }[];
};

export default function TopProductsChart({ data }: Props) {
  const { t } = useTranslation("admin");
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-card p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
          {t("top_products", "Top Products")}
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
        {t("top_products", "Top Products")}
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(69,4,7,0.08)" />
  <XAxis
    type="number"
    tick={{ fill: "#6B6560", fontSize: 12 }}
    tickLine={false}
    axisLine={false}
  />
  <YAxis
    type="category"
    dataKey="name"
    tick={{ fill: "#6B6560", fontSize: 12 }}
    tickLine={false}
    axisLine={false}
    width={80}
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
              formatter={(value) => [value, t("sold_label", "sold")]}
            />
  <Bar
    dataKey="value"
    fill="#8C6228"
    radius={[0, 3, 3, 0]}
    animationDuration={800}
  />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
