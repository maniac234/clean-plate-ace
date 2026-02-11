import { useState } from "react";
import { useBranches, useAddBranch, useDeleteBranch } from "@/hooks/useBranches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function Branches() {
  const { data: branches } = useBranches();
  const addBranch = useAddBranch();
  const deleteBranch = useDeleteBranch();
  const [name, setName] = useState("");
  const [responsible, setResponsible] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      await addBranch.mutateAsync({ name, responsible });
      setName("");
      setResponsible("");
      toast.success("Filial adicionada!");
    } catch {
      toast.error("Erro ao adicionar filial");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta filial?")) return;
    try {
      await deleteBranch.mutateAsync(id);
      toast.success("Filial removida!");
    } catch {
      toast.error("Erro ao remover filial");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Filiais</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nova Filial</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Input
            placeholder="Nome da filial"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-xs"
          />
          <Input
            placeholder="Responsável (opcional)"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleAdd}>
            <Plus className="mr-1 h-4 w-4" />
            Adicionar
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {branches?.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{b.name}</p>
                {b.responsible && (
                  <p className="text-sm text-muted-foreground">{b.responsible}</p>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleDelete(b.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
