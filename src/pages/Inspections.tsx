import { useState, useEffect } from "react";
import { useBranches } from "@/hooks/useBranches";
import {
  useInspectionItems,
  useInspectionCategories,
  useVisits,
  useVisitResults,
  useCreateVisit,
  useSaveVisitResult,
  useUpdateVisitScore,
} from "@/hooks/useInspections";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export default function Inspections() {
  const { isAdmin } = useAuth();
  const { data: branches } = useBranches();
  const { data: categories } = useInspectionCategories();
  const { data: items } = useInspectionItems();
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedVisit, setSelectedVisit] = useState("");
  const [showNewVisit, setShowNewVisit] = useState(false);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [obsDialog, setObsDialog] = useState<{ itemId: string; obs: string } | null>(null);

  const { data: visits } = useVisits(selectedBranch);
  const { data: results } = useVisitResults(selectedVisit);
  const createVisit = useCreateVisit();
  const saveResult = useSaveVisitResult();
  const updateScore = useUpdateVisitScore();

  // Build a map of results
  const resultMap = new Map(results?.map((r) => [r.inspection_item_id, r]) ?? []);

  const handleCreateVisit = async () => {
    if (!selectedBranch) return;
    try {
      const visit = await createVisit.mutateAsync({ branch_id: selectedBranch, visit_date: visitDate });
      setSelectedVisit(visit.id);
      setShowNewVisit(false);
      toast.success("Visita criada!");
    } catch {
      toast.error("Erro ao criar visita");
    }
  };

  const handleMark = async (itemId: string, isConforming: boolean, item: any) => {
    if (!selectedVisit || !isAdmin) return;
    const score = isConforming ? item.points_positive : item.points_negative;

    if (!isConforming) {
      setObsDialog({ itemId, obs: resultMap.get(itemId)?.observations ?? "" });
    }

    try {
      await saveResult.mutateAsync({
        visit_id: selectedVisit,
        inspection_item_id: itemId,
        is_conforming: isConforming,
        score,
        observations: isConforming ? "" : resultMap.get(itemId)?.observations,
      });
    } catch {
      toast.error("Erro ao salvar resultado");
    }
  };

  const handleSaveObs = async () => {
    if (!obsDialog || !selectedVisit) return;
    const item = items?.find((i) => i.id === obsDialog.itemId);
    if (!item) return;
    try {
      await saveResult.mutateAsync({
        visit_id: selectedVisit,
        inspection_item_id: obsDialog.itemId,
        is_conforming: false,
        score: item.points_negative,
        observations: obsDialog.obs,
      });
      setObsDialog(null);
      toast.success("Observação salva");
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  // Recalculate score
  useEffect(() => {
    if (!selectedVisit || !results || !items) return;
    const totalScore = results.reduce((acc, r) => acc + (r.score ?? 0), 0);
    const maxPossible = items.reduce((acc, i) => acc + i.points_positive, 0);
    updateScore.mutate({ visitId: selectedVisit, totalScore, maxPossible });
  }, [results]);

  const groupedItems = categories?.map((cat) => ({
    ...cat,
    items: items?.filter((i) => i.category_id === cat.id) ?? [],
  }));

  const totalScore = results?.reduce((a, r) => a + (r.score ?? 0), 0) ?? 0;
  const maxPossible = items?.reduce((a, i) => a + i.points_positive, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <img src={logo} alt="Troppo Buono" className="h-10 object-contain" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inspeções</h1>
          <p className="text-xs text-muted-foreground">
            CHECK-LIST – Higiene Pessoal, Higiene das instalações, equipamentos e utensílios, etapas operacionais, preenchimento das planilhas de controle e Controle de pragas
          </p>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Nutricionista Responsável: <span className="font-medium text-foreground">Rosani Sommer Bertão</span>
      </div>

      {/* Selectors */}
      <div className="flex flex-wrap gap-4">
        <div className="w-60">
          <Select value={selectedBranch} onValueChange={(v) => { setSelectedBranch(v); setSelectedVisit(""); }}>
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

        {selectedBranch && (
          <div className="w-60">
            <Select value={selectedVisit} onValueChange={setSelectedVisit}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a visita" />
              </SelectTrigger>
              <SelectContent>
                {visits?.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {new Date(v.visit_date).toLocaleDateString("pt-BR")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isAdmin && selectedBranch && (
          <Button variant="outline" onClick={() => setShowNewVisit(true)}>
            + Nova Visita
          </Button>
        )}
      </div>

      {showNewVisit && (
        <Card>
          <CardContent className="flex items-end gap-4 pt-4">
            <div>
              <label className="text-sm font-medium">Data da Visita</label>
              <Input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
            </div>
            <Button onClick={handleCreateVisit}>Criar</Button>
            <Button variant="outline" onClick={() => setShowNewVisit(false)}>Cancelar</Button>
          </CardContent>
        </Card>
      )}

      {/* Score bar */}
      {selectedVisit && (
        <div className="flex items-center gap-4 rounded-lg border p-4">
          <span className="text-sm font-medium">Pontuação:</span>
          <span className={`text-xl font-bold ${totalScore >= 0 ? "text-success" : "text-destructive"}`}>
            {totalScore}
          </span>
          <span className="text-sm text-muted-foreground">/ {maxPossible} possíveis</span>
          <Badge variant={totalScore >= 0 ? "default" : "destructive"}>
            {maxPossible > 0 ? `${Math.round(((totalScore) / maxPossible) * 100)}%` : "—"}
          </Badge>
        </div>
      )}

      {/* Inspection items */}
      {selectedVisit && groupedItems?.map((cat) => (
        <Card key={cat.id}>
          <CardHeader>
            <CardTitle className="text-base">{cat.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cat.items.map((item) => {
              const result = resultMap.get(item.id);
              return (
                <div
                  key={item.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    result?.is_conforming === true
                      ? "border-success/30 bg-success/5"
                      : result?.is_conforming === false
                      ? "border-destructive/30 bg-destructive/5"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                      {item.question_number}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{item.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Peso {item.weight} | +{item.points_positive} / {item.points_negative}
                        </Badge>
                        {result?.is_conforming === true && (
                          <Badge className="bg-success text-success-foreground">Conforme</Badge>
                        )}
                        {result?.is_conforming === false && (
                          <Badge variant="destructive">Não Conforme</Badge>
                        )}
                      </div>
                      {result?.observations && (
                        <div className="mt-2 rounded bg-destructive/10 p-2 text-xs text-destructive">
                          <AlertCircle className="mr-1 inline h-3 w-3" />
                          {result.observations}
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleMark(item.id, true, item)}
                          className="rounded-lg p-2 transition-colors hover:bg-success/10"
                          title="Conforme"
                        >
                          <CheckCircle2 className={`h-5 w-5 ${result?.is_conforming === true ? "text-success" : "text-muted-foreground"}`} />
                        </button>
                        <button
                          onClick={() => handleMark(item.id, false, item)}
                          className="rounded-lg p-2 transition-colors hover:bg-destructive/10"
                          title="Não Conforme"
                        >
                          <XCircle className={`h-5 w-5 ${result?.is_conforming === false ? "text-destructive" : "text-muted-foreground"}`} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Observations Dialog */}
      <Dialog open={!!obsDialog} onOpenChange={(open) => !open && setObsDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Observações da Não Conformidade</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Descreva as observações relevantes e o que pode melhorar..."
            value={obsDialog?.obs ?? ""}
            onChange={(e) => setObsDialog((prev) => prev ? { ...prev, obs: e.target.value } : null)}
            rows={5}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setObsDialog(null)}>Cancelar</Button>
            <Button onClick={handleSaveObs}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
