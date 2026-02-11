import { useState } from "react";
import { useInspectionItems, useInspectionCategories } from "@/hooks/useInspections";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function InspectionSettings() {
  const { data: categories } = useInspectionCategories();
  const { data: items } = useInspectionItems();
  const qc = useQueryClient();

  const [newDesc, setNewDesc] = useState("");
  const [newCat, setNewCat] = useState("");
  const [newWeight, setNewWeight] = useState("1");

  const handleAdd = async () => {
    if (!newDesc.trim() || !newCat) return;
    const weight = Number(newWeight);
    const maxNum = Math.max(0, ...(items?.map((i) => i.question_number) ?? []));
    try {
      const { error } = await supabase.from("inspection_items").insert({
        category_id: newCat,
        question_number: maxNum + 1,
        description: newDesc,
        weight,
        points_positive: weight === 2 ? 100 : 50,
        points_negative: weight === 2 ? -200 : -100,
        sort_order: maxNum + 1,
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["inspection_items"] });
      setNewDesc("");
      toast.success("Item adicionado!");
    } catch {
      toast.error("Erro ao adicionar");
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    const { error } = await supabase
      .from("inspection_items")
      .update({ is_active: active })
      .eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar");
    } else {
      qc.invalidateQueries({ queryKey: ["inspection_items"] });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este item de inspeção?")) return;
    const { error } = await supabase.from("inspection_items").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover");
    } else {
      qc.invalidateQueries({ queryKey: ["inspection_items"] });
      toast.success("Item removido!");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Configurações de Inspeção</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Novo Item de Inspeção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={newCat} onValueChange={setNewCat}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Descrição do item de inspeção"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <div className="flex gap-3">
            <Select value={newWeight} onValueChange={setNewWeight}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Peso 1</SelectItem>
                <SelectItem value="2">Peso 2</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAdd}>
              <Plus className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {categories?.map((cat) => (
        <Card key={cat.id}>
          <CardHeader>
            <CardTitle className="text-base">{cat.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items
              ?.filter((i) => i.category_id === cat.id)
              .map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-bold">{item.question_number}.</span> {item.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Peso {item.weight} | +{item.points_positive} / {item.points_negative}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.is_active}
                      onCheckedChange={(checked) => handleToggle(item.id, checked)}
                    />
                    <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
