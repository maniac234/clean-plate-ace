
-- Fix visit_results exposure: restrict SELECT to admins and the inspector who conducted the visit
DROP POLICY IF EXISTS "Authenticated can view results" ON public.visit_results;
CREATE POLICY "Restrict results access" ON public.visit_results 
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  EXISTS (
    SELECT 1 FROM visits v 
    WHERE v.id = visit_results.visit_id 
    AND v.inspector_id = auth.uid()
  )
);

-- Also restrict visits SELECT similarly for consistency
DROP POLICY IF EXISTS "Authenticated can view visits" ON public.visits;
CREATE POLICY "Restrict visits access" ON public.visits 
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  inspector_id = auth.uid()
);

-- Add CHECK constraints for text length limits
ALTER TABLE public.branches ADD CONSTRAINT branches_name_length CHECK (char_length(name) <= 100);
ALTER TABLE public.branches ADD CONSTRAINT branches_responsible_length CHECK (char_length(responsible) <= 100);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_full_name_length CHECK (char_length(full_name) <= 200);
ALTER TABLE public.visit_results ADD CONSTRAINT visit_results_observations_length CHECK (char_length(observations) <= 1000);
ALTER TABLE public.inspection_items ADD CONSTRAINT inspection_items_description_length CHECK (char_length(description) <= 500);
