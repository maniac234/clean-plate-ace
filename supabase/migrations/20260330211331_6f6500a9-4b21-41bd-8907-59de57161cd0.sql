-- Fix branches SELECT policy: change from public to authenticated
DROP POLICY IF EXISTS "Authenticated users can view branches" ON public.branches;
CREATE POLICY "Authenticated users can view branches"
  ON public.branches
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix inspection_categories SELECT policy
DROP POLICY IF EXISTS "Authenticated can view categories" ON public.inspection_categories;
CREATE POLICY "Authenticated can view categories"
  ON public.inspection_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix inspection_items SELECT policy
DROP POLICY IF EXISTS "Authenticated can view items" ON public.inspection_items;
CREATE POLICY "Authenticated can view items"
  ON public.inspection_items
  FOR SELECT
  TO authenticated
  USING (true);