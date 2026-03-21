import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const EVALUATION_SCALE = [
  { min: 100, label: "EXCELENTE" },
  { min: 99, label: "ÓTIMO" },
  { min: 93, label: "ÓTIMO" },
  { min: 90, label: "ÓTIMO" },
  { min: 89, label: "SATISFATÓRIO" },
  { min: 83, label: "SATISFATÓRIO" },
  { min: 80, label: "SATISFATÓRIO" },
  { min: 79, label: "REGULAR" },
  { min: 73, label: "REGULAR" },
  { min: 70, label: "REGULAR" },
  { min: 0, label: "INSATISFATÓRIO" },
];

function getEvaluation(pct: number) {
  for (const entry of EVALUATION_SCALE) {
    if (pct >= entry.min) return entry.label;
  }
  return "INSATISFATÓRIO";
}

function getEvaluationColor(label: string) {
  switch (label) {
    case "EXCELENTE": return "bg-success text-success-foreground";
    case "ÓTIMO": return "bg-emerald-500 text-white";
    case "SATISFATÓRIO": return "bg-yellow-500 text-white";
    case "REGULAR": return "bg-orange-500 text-white";
    default: return "bg-destructive text-destructive-foreground";
  }
}

export default function Inspections() {
  const { isAdmin } = useAuth();
  const { data: branches } = useBranches();
  const { data: categories } = useInspectionCategories();
  const { data: items } = useInspectionItems();
  const [searchParams] = useSearchParams();
  const branchFromUrl = searchParams.get("branch") || "";
  const [selectedBranch, setSelectedBranch] = useState(branchFromUrl);
  const [selectedVisit, setSelectedVisit] = useState("");
  const [showNewVisit, setShowNewVisit] = useState(!!branchFromUrl);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [obsDialog, setObsDialog] = useState<{ itemId: string; obs: string } | null>(null);

  const { data: visits } = useVisits(selectedBranch);
  const { data: results } = useVisitResults(selectedVisit);
  const createVisit = useCreateVisit();
  const saveResult = useSaveVisitResult();
  const updateScore = useUpdateVisitScore();

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
      return;
    }

    try {
      await saveResult.mutateAsync({
        visit_id: selectedVisit,
        inspection_item_id: itemId,
        is_conforming: isConforming,
        score,
        observations: "",
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
  const percentage = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;
  const evaluationLabel = getEvaluation(percentage);
  const evaluationColor = getEvaluationColor(evaluationLabel);

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
          <CardContent className="flex flex-wrap items-end gap-3 pt-4">
            <div className="min-w-0">
              <label className="text-sm font-medium">Data da Visita</label>
              <Input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateVisit}>Criar</Button>
              <Button size="sm" variant="outline" onClick={() => setShowNewVisit(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluation Scale */}
      {selectedVisit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">PADRÃO DE AVALIAÇÃO DO CHECK-LIST</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
              <span className="text-xs font-medium">Pontuação:</span>
              <span className={`text-lg font-bold ${totalScore >= 0 ? "text-success" : "text-destructive"}`}>
                {totalScore}
              </span>
              <span className="text-xs text-muted-foreground">/ {maxPossible}</span>
              <span className="text-xs font-medium">({percentage}%)</span>
              <Badge className={`${evaluationColor} text-[10px] shrink-0`}>{evaluationLabel}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm sm:grid-cols-4">
              <div className="font-semibold">Percentual</div>
              <div className="font-semibold">Avaliação</div>
              <div className="hidden font-semibold sm:block">Percentual</div>
              <div className="hidden font-semibold sm:block">Avaliação</div>
              {[
                { pct: "100%", eval: "EXCELENTE" },
                { pct: "99%", eval: "ÓTIMO" },
                { pct: "93%", eval: "" },
                { pct: "90%", eval: "" },
                { pct: "89%", eval: "SATISFATÓRIO" },
                { pct: "83%", eval: "" },
                { pct: "80%", eval: "" },
                { pct: "79%", eval: "REGULAR" },
                { pct: "73%", eval: "" },
                { pct: "70%", eval: "" },
              ].map((row, i) => (
                <div key={i} className={`contents ${row.eval ? "font-medium" : "text-muted-foreground"}`}>
                  <div className="border-b py-1">{row.pct}</div>
                  <div className="border-b py-1">{row.eval || "—"}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
                  className={`rounded-lg border p-3 transition-colors ${
                    result?.is_conforming === true
                      ? "border-success/30 bg-success/5"
                      : result?.is_conforming === false
                      ? "border-destructive/30 bg-destructive/5"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                      {item.question_number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed">{item.description}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          Peso {item.weight} | +{item.points_positive} / {item.points_negative}
                        </Badge>
                        {result?.is_conforming === true && (
                          <Badge className="bg-success text-success-foreground text-[10px] px-1.5 py-0">Conforme</Badge>
                        )}
                        {result?.is_conforming === false && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Não Conforme</Badge>
                        )}
                      </div>
                      {result?.observations && (
                        <div className="mt-1.5 rounded bg-destructive/10 p-1.5 text-[10px] text-destructive">
                          <AlertCircle className="mr-1 inline h-3 w-3" />
                          {result.observations}
                        </div>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 mt-2 pl-7">
                      <Button
                        size="sm"
                        variant={result?.is_conforming === true ? "default" : "outline"}
                        className={`h-7 text-xs px-3 ${result?.is_conforming === true ? "bg-success hover:bg-success/90 text-success-foreground" : ""}`}
                        onClick={() => handleMark(item.id, true, item)}
                      >
                        OK
                      </Button>
                      <Button
                        size="sm"
                        variant={result?.is_conforming === false ? "destructive" : "outline"}
                        className="h-7 text-xs px-3"
                        onClick={() => handleMark(item.id, false, item)}
                      >
                        Irregular
                      </Button>
                    </div>
                  )}
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
            onChange={(e) => setObsDialog((prev) => prev ? { ...prev, obs: e.target.value.slice(0, 1000) } : null)}
            maxLength={1000}
            rows={5}
          />
          <p className="text-xs text-muted-foreground text-right">{(obsDialog?.obs ?? "").length}/1000</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setObsDialog(null)}>Cancelar</Button>
            <Button onClick={handleSaveObs}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
