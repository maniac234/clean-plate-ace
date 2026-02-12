
-- Fix branches policies
DROP POLICY IF EXISTS "Authenticated users can view branches" ON public.branches;
DROP POLICY IF EXISTS "Admins can manage branches" ON public.branches;
CREATE POLICY "Authenticated users can view branches" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Admins can manage branches" ON public.branches FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix inspection_categories policies
DROP POLICY IF EXISTS "Authenticated can view categories" ON public.inspection_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.inspection_categories;
CREATE POLICY "Authenticated can view categories" ON public.inspection_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.inspection_categories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix inspection_items policies
DROP POLICY IF EXISTS "Authenticated can view items" ON public.inspection_items;
DROP POLICY IF EXISTS "Admins can manage items" ON public.inspection_items;
CREATE POLICY "Authenticated can view items" ON public.inspection_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage items" ON public.inspection_items FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix visits policies
DROP POLICY IF EXISTS "Authenticated can view visits" ON public.visits;
DROP POLICY IF EXISTS "Admins can manage visits" ON public.visits;
CREATE POLICY "Authenticated can view visits" ON public.visits FOR SELECT USING (true);
CREATE POLICY "Admins can manage visits" ON public.visits FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix visit_results policies
DROP POLICY IF EXISTS "Authenticated can view results" ON public.visit_results;
DROP POLICY IF EXISTS "Admins can manage results" ON public.visit_results;
CREATE POLICY "Authenticated can view results" ON public.visit_results FOR SELECT USING (true);
CREATE POLICY "Admins can manage results" ON public.visit_results FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix user_roles policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
