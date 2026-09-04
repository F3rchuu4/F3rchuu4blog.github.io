-- ============================================================
-- CONFIGURACIÓN DE SUPABASE PARA EL BLOG DE FERCHUU
-- Ejecutá TODO este archivo en Supabase > SQL Editor.
-- ============================================================

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text default '',
  content text not null,
  image_url text,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

-- Público: cualquiera puede leer solamente posts publicados.
drop policy if exists "public can read published posts" on public.posts;
create policy "public can read published posts"
on public.posts for select
to anon, authenticated
using (published = true);

-- Admin: usuarios autenticados pueden administrar posts.
drop policy if exists "authenticated can manage posts" on public.posts;
create policy "authenticated can manage posts"
on public.posts for all
to authenticated
using (true)
with check (true);

-- Bucket público para imágenes del blog.
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;

-- Cualquiera puede ver las imágenes públicas.
drop policy if exists "public can view blog images" on storage.objects;
create policy "public can view blog images"
on storage.objects for select
to public
using (bucket_id = 'blog-images');

-- Solamente usuarios autenticados pueden subir imágenes.
drop policy if exists "authenticated can upload blog images" on storage.objects;
create policy "authenticated can upload blog images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'blog-images');

-- Solamente usuarios autenticados pueden modificar/eliminar imágenes.
drop policy if exists "authenticated can update blog images" on storage.objects;
create policy "authenticated can update blog images"
on storage.objects for update
to authenticated
using (bucket_id = 'blog-images')
with check (bucket_id = 'blog-images');

drop policy if exists "authenticated can delete blog images" on storage.objects;
create policy "authenticated can delete blog images"
on storage.objects for delete
to authenticated
using (bucket_id = 'blog-images');

-- IMPORTANTE:
-- Esta política da administración a cualquier usuario autenticado del proyecto.
-- Si en el futuro creás más usuarios, restringí estas policies a tu propio
-- usuario/rol antes de permitirles acceso al panel.
