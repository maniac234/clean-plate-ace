import { useState } from "react";
import { useBranches } from "@/hooks/useBranches";
import { useVisits } from "@/hooks/useInspections";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Dashboard() {
  const { data: branches, isLoading: branchesLoading } = useBranches();
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const { data: visits } = useVisits(selectedBranch);

  const latestVisit = visits?.[0];
  const totalPositive = latestVisit?.total_score ?? 0;
  const maxPossible = latestVisit?.max_possible_score ?? 0;
  const percentage = maxPossible > 0 ? Math.round((totalPositive / maxPossible) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Troppo Buono" className="h-12 object-contain" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              CHECK-LIST – Higiene Pessoal, Higiene das instalações, equipamentos e utensílios, etapas operacionais, preenchimento das planilhas de controle e Controle de pragas
            </p>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Nutricionista Responsável: <span className="font-medium text-foreground">Rosani Sommer Bertão</span>
      </div>

      {/* Branch selector */}
      <div className="max-w-xs">
        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma filial" />
          </SelectTrigger>
          <SelectContent>
            {branches?.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedBranch && (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">Selecione uma filial para ver o dashboard</p>
        </div>
      )}

      {selectedBranch && (
        <>
          {/* Score cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Última Inspeção</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestVisit ? new Date(latestVisit.visit_date).toLocaleDateString("pt-BR") : "—"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pontuação Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPositive}</div>
                <p className="text-xs text-muted-foreground">de {maxPossible} possíveis</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Conformidade</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{percentage}%</div>
                <Badge variant={percentage >= 70 ? "default" : "destructive"} className="mt-1">
                  {percentage >= 70 ? "Bom" : "Atenção"}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Visitas</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visits?.length ?? 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent visits */}
          <Card>
            <CardHeader>
              <CardTitle>Últimas Inspeções</CardTitle>
            </CardHeader>
            <CardContent>
              {!visits?.length ? (
                <p className="text-sm text-muted-foreground">Nenhuma inspeção registrada</p>
              ) : (
                <div className="space-y-2">
                  {visits.slice(0, 5).map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(v.visit_date).toLocaleDateString("pt-BR")}
                        </p>
                        {v.notes && (
                          <p className="text-xs text-muted-foreground">{v.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{v.total_score} pts</p>
                        <p className="text-xs text-muted-foreground">
                          {v.max_possible_score > 0
                            ? `${Math.round((v.total_score / v.max_possible_score) * 100)}%`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
