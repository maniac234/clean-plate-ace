import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useInspectionCategories() {
  return useQuery({
    queryKey: ["inspection_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inspection_categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useInspectionItems() {
  return useQuery({
    queryKey: ["inspection_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inspection_items")
        .select("*, inspection_categories(name)")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useVisits(branchId?: string) {
  return useQuery({
    queryKey: ["visits", branchId],
    queryFn: async () => {
      let query = supabase
        .from("visits")
        .select("*, branches(name)")
        .order("visit_date", { ascending: false });
      if (branchId) query = query.eq("branch_id", branchId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!branchId,
  });
}

export function useVisitResults(visitId?: string) {
  return useQuery({
    queryKey: ["visit_results", visitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visit_results")
        .select("*, inspection_items(question_number, description, weight, points_positive, points_negative, category_id, inspection_categories(name))")
        .eq("visit_id", visitId!);
      if (error) throw error;
      return data;
    },
    enabled: !!visitId,
  });
}

export function useCreateVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ branch_id, visit_date, notes }: { branch_id: string; visit_date: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from("visits")
        .insert({ branch_id, visit_date, notes, inspector_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visits"] }),
  });
}

export function useSaveVisitResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      visit_id,
      inspection_item_id,
      is_conforming,
      observations,
      score,
    }: {
      visit_id: string;
      inspection_item_id: string;
      is_conforming: boolean | null;
      observations?: string;
      score: number;
    }) => {
      const { data, error } = await supabase
        .from("visit_results")
        .upsert(
          { visit_id, inspection_item_id, is_conforming, observations, score },
          { onConflict: "visit_id,inspection_item_id" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["visit_results", vars.visit_id] });
      qc.invalidateQueries({ queryKey: ["visits"] });
    },
  });
}

export function useUpdateVisitScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ visitId, totalScore, maxPossible }: { visitId: string; totalScore: number; maxPossible: number }) => {
      const { error } = await supabase
        .from("visits")
        .update({ total_score: totalScore, max_possible_score: maxPossible })
        .eq("id", visitId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visits"] }),
  });
}
