import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBranches } from "@/hooks/useBranches";
import { useVisits } from "@/hooks/useInspections";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, CheckCircle2, XCircle, TrendingUp, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export default function Dashboard() {
  const { data: branches, isLoading: branchesLoading } = useBranches();
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const {
    data: visitsData,
    isLoading: visitsLoading,
    isError: visitsError,
  } = useVisits(selectedBranch);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const visits = Array.isArray(visitsData) ? visitsData.filter(Boolean) : [];

  const toSafeNumber = (value: unknown) => {
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const toSafeDate = (value?: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("pt-BR");
  };

  const latestVisit = visits[0];
  const totalPositive = toSafeNumber(latestVisit?.total_score);
  const maxPossible = toSafeNumber(latestVisit?.max_possible_score);
  const percentage = maxPossible > 0 ? Math.round((totalPositive / maxPossible) * 100) : 0;

  const handleDeleteVisit = async (visitId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta inspeção?")) return;
    try {
      await supabase.from("visit_results").delete().eq("visit_id", visitId);
      await supabase.from("visits").delete().eq("id", visitId);
      qc.invalidateQueries({ queryKey: ["visits"] });
      toast.success("Inspeção excluída");
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Troppo Buono" className="h-12 object-contain" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              CHECK-LIST – Higiene Pessoal, Higiene das instalações, equipamentos e utensílios
            </p>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Nutricionista Responsável: <span className="font-medium text-foreground">Rosani Sommer Bertão</span>
      </div>

      {/* Branch selector + Nova Inspeção */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-xs">
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
        {isAdmin && selectedBranch && (
          <Button size="sm" onClick={() => navigate(`/inspections?branch=${selectedBranch}`)}>
            <Plus className="mr-1 h-4 w-4" />
            Nova Inspeção
          </Button>
        )}
      </div>

      {!selectedBranch && (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">Selecione uma filial para ver o dashboard</p>
        </div>
      )}

      {selectedBranch && visitsLoading && (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">Carregando inspeções...</p>
        </div>
      )}

      {selectedBranch && visitsError && (
        <div className="flex h-40 items-center justify-center rounded-lg border border-destructive/40 bg-destructive/5 px-4 text-center">
          <p className="text-sm text-destructive">Erro ao carregar inspeções desta filial.</p>
        </div>
      )}

      {selectedBranch && !visitsLoading && !visitsError && (
        <>
          {/* Score cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Última Inspeção</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{toSafeDate(latestVisit?.visit_date)}</div>
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
                <div className="text-2xl font-bold">{visits.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent visits */}
          <Card>
            <CardHeader>
              <CardTitle>Últimas Inspeções</CardTitle>
            </CardHeader>
            <CardContent>
              {!visits.length ? (
                <p className="text-sm text-muted-foreground">Nenhuma inspeção registrada</p>
              ) : (
                <div className="space-y-2">
                  {visits.slice(0, 5).map((v) => {
                    const score = toSafeNumber(v?.total_score);
                    const max = toSafeNumber(v?.max_possible_score);
                    const visitPercentage = max > 0 ? Math.round((score / max) * 100) : 0;

                    return (
                      <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="text-sm font-medium">{toSafeDate(v?.visit_date)}</p>
                          {v?.notes && <p className="text-xs text-muted-foreground">{v.notes}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-bold">{score} pts</p>
                            <p className="text-xs text-muted-foreground">{max > 0 ? `${visitPercentage}%` : "—"}</p>
                          </div>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteVisit(v.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
