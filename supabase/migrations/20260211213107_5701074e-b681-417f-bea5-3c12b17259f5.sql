
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'employee');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'employee',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Branches (filiais)
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  responsible TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view branches" ON public.branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage branches" ON public.branches FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Inspection categories
CREATE TABLE public.inspection_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.inspection_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view categories" ON public.inspection_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage categories" ON public.inspection_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Inspection items (the 30 questions)
CREATE TABLE public.inspection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.inspection_categories(id) ON DELETE CASCADE NOT NULL,
  question_number INT NOT NULL,
  description TEXT NOT NULL,
  weight INT NOT NULL DEFAULT 1,
  points_positive INT NOT NULL DEFAULT 50,
  points_negative INT NOT NULL DEFAULT -100,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.inspection_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view items" ON public.inspection_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage items" ON public.inspection_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Visits / inspections log
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  inspector_id UUID REFERENCES auth.users(id),
  total_score INT DEFAULT 0,
  max_possible_score INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view visits" ON public.visits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage visits" ON public.visits FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Visit results (per inspection item)
CREATE TABLE public.visit_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
  inspection_item_id UUID REFERENCES public.inspection_items(id) ON DELETE CASCADE NOT NULL,
  is_conforming BOOLEAN,
  observations TEXT,
  score INT DEFAULT 0,
  UNIQUE(visit_id, inspection_item_id)
);
ALTER TABLE public.visit_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view results" ON public.visit_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage results" ON public.visit_results FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
