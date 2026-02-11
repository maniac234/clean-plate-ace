import { useState } from "react";
import { useBranches } from "@/hooks/useBranches";
import { useVisits } from "@/hooks/useInspections";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Charts() {
  const { data: branches } = useBranches();
  const [selectedBranch, setSelectedBranch] = useState("");
  const { data: visits } = useVisits(selectedBranch);

  // Aggregate by month - take best score per month
  const monthlyData = visits?.reduce<Record<string, { total: number; max: number; count: number }>>((acc, v) => {
    const d = new Date(v.visit_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = { total: 0, max: 0, count: 0 };
    acc[key].total += v.total_score;
    acc[key].max += v.max_possible_score;
    acc[key].count += 1;
    return acc;
  }, {});

  const chartData = monthlyData
    ? Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => {
          const [y, m] = month.split("-");
          const label = new Date(Number(y), Number(m) - 1).toLocaleDateString("pt-BR", {
            month: "short",
            year: "2-digit",
          });
          const pct = data.max > 0 ? Math.round((data.total / data.max) * 100) : 0;
          return { month: label, percentual: pct };
        })
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Evolução Mensal</h1>

      <div className="max-w-xs">
        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a filial" />
          </SelectTrigger>
          <SelectContent>
            {branches?.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedBranch && (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">Selecione uma filial</p>
        </div>
      )}

      {selectedBranch && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Percentual de Conformidade por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Conformidade"]} />
                  <Bar dataKey="percentual" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.percentual >= 70 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedBranch && chartData.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">Nenhum dado disponível para esta filial</p>
        </div>
      )}
    </div>
  );
}
