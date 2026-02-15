import { useState } from "react";
import { useBranches } from "@/hooks/useBranches";
import { useAllVisits } from "@/hooks/useInspections";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function getBarColor(pct: number) {
  if (pct >= 93) return "#22c55e"; // green
  if (pct >= 80) return "#f59e0b"; // yellow/amber
  if (pct >= 70) return "#f97316"; // orange
  return "#ef4444"; // red
}

export default function Charts() {
  const { data: branches } = useBranches();
  const currentYear = new Date().getFullYear();
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const { data: visits } = useAllVisits();

  const filteredVisits = visits?.filter((v) => {
    const d = new Date(v.visit_date);
    if (d.getFullYear() !== Number(selectedYear)) return false;
    if (selectedBranch !== "all" && v.branch_id !== selectedBranch) return false;
    return true;
  });

  // Aggregate by month
  const monthlyMap: Record<number, { total: number; max: number }> = {};
  filteredVisits?.forEach((v) => {
    const m = new Date(v.visit_date).getMonth();
    if (!monthlyMap[m]) monthlyMap[m] = { total: 0, max: 0 };
    monthlyMap[m].total += v.total_score ?? 0;
    monthlyMap[m].max += v.max_possible_score ?? 0;
  });

  const chartData = MONTHS.map((label, idx) => {
    const d = monthlyMap[idx];
    const pct = d && d.max > 0 ? Math.round((d.total / d.max) * 100) : 0;
    return { month: label, percentual: d ? pct : null };
  });

  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Evolução Mensal</h1>
          <p className="text-sm text-muted-foreground">Percentual de conformidade por mês</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Filiais</SelectItem>
              {branches?.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(v: number) => [`${v}%`, "Conformidade"]}
                cursor={{ fill: "hsl(var(--muted))" }}
              />
              <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="6 4" strokeWidth={1.5} />
              <Bar dataKey="percentual" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {chartData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.percentual !== null ? getBarColor(entry.percentual) : "transparent"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
            ≥93% Ótimo/Excelente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
            80-92% Satisfatório
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#f97316" }} />
            70-79% Regular
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
            &lt;70% Insuficiente
          </span>
        </div>
      </div>
    </div>
  );
}
