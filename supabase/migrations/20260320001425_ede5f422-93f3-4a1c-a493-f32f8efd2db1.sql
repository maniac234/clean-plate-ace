
ALTER TABLE public.profiles
ADD COLUMN branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL;
