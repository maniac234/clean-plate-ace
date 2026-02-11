import { useState } from "react";
import { useBranches } from "@/hooks/useBranches";
import { useVisits } from "@/hooks/useInspections";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

export default function Logs() {
  const { data: branches } = useBranches();
  const [selectedBranch, setSelectedBranch] = useState("");
  const { data: visits } = useVisits(selectedBranch);

  // Group by month
  const grouped = visits?.reduce<Record<string, typeof visits>>((acc, v) => {
    const d = new Date(v.visit_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Logs de Visitas</h1>

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

      {grouped && Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([month, monthVisits]) => {
        const [y, m] = month.split("-");
        const monthName = new Date(Number(y), Number(m) - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

        return (
          <Card key={month}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base capitalize">
                <CalendarDays className="h-4 w-4" />
                {monthName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {monthVisits.map((v) => {
                const pct = v.max_possible_score > 0 ? Math.round((v.total_score / v.max_possible_score) * 100) : 0;
                return (
                  <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {new Date(v.visit_date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">{v.total_score} pts</span>
                      <Badge variant={pct >= 70 ? "default" : "destructive"}>{pct}%</Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
