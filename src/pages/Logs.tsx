import { useState } from "react";
import { useBranches } from "@/hooks/useBranches";
import { useVisits, useVisitResults } from "@/hooks/useInspections";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, Eye, CheckCircle, XCircle } from "lucide-react";

function VisitDetailsDialog({ visitId, open, onClose }: { visitId: string; open: boolean; onClose: () => void }) {
  const { data: results } = useVisitResults(visitId);

  const conformes = results?.filter((r) => r.is_conforming === true) ?? [];
  const irregulares = results?.filter((r) => r.is_conforming === false) ?? [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Detalhes da Inspeção</DialogTitle>
        </DialogHeader>

        {(!results || results.length === 0) && (
          <p className="text-sm text-muted-foreground py-4 text-center">Nenhum resultado registrado.</p>
        )}

        {conformes.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-1.5 text-success">
              <CheckCircle className="h-4 w-4" /> Conformes ({conformes.length})
            </h3>
            {conformes.map((r) => (
              <div key={r.id} className="rounded border border-success/20 bg-success/5 p-2 text-xs">
                <span className="font-medium">
                  {r.inspection_items?.question_number}. {r.inspection_items?.description}
                </span>
              </div>
            ))}
          </div>
        )}

        {irregulares.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-1.5 text-destructive">
              <XCircle className="h-4 w-4" /> Irregulares ({irregulares.length})
            </h3>
            {irregulares.map((r) => (
              <div key={r.id} className="rounded border border-destructive/20 bg-destructive/5 p-2 text-xs space-y-1">
                <span className="font-medium">
                  {r.inspection_items?.question_number}. {r.inspection_items?.description}
                </span>
                {r.observations && (
                  <p className="text-destructive/80 italic">Obs: {r.observations}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Logs() {
  const { data: branches } = useBranches();
  const [selectedBranch, setSelectedBranch] = useState("");
  const { data: visits } = useVisits(selectedBranch);
  const [detailVisitId, setDetailVisitId] = useState<string | null>(null);

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
                  <div key={v.id} className="flex items-center justify-between rounded-lg border p-3 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-xs font-medium">
                        {new Date(v.visit_date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold">{v.total_score} pts</span>
                      <Badge variant={pct >= 70 ? "default" : "destructive"} className="text-[10px]">{pct}%</Badge>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setDetailVisitId(v.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {detailVisitId && (
        <VisitDetailsDialog visitId={detailVisitId} open={!!detailVisitId} onClose={() => setDetailVisitId(null)} />
      )}
    </div>
  );
}