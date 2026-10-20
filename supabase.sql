-- Ejecuta este archivo una sola vez en Supabase > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.felicitaciones (
  id uuid primary key default gen_random_uuid(),
  author text not null check (char_length(author) between 1 and 40),
  message text not null check (char_length(message) between 1 and 300),
  photo_url text,
  created_at timestamptz not null default now()
);

alter table public.felicitaciones enable row level security;

create policy "Cualquiera puede leer felicitaciones"
on public.felicitaciones for select
to anon
using (true);

create policy "Cualquiera puede añadir felicitaciones"
on public.felicitaciones for insert
to anon
with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('felicitaciones', 'felicitaciones', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Cualquiera puede ver las fotos"
on storage.objects for select
to anon
using (bucket_id = 'felicitaciones');

create policy "Cualquiera puede subir fotos"
on storage.objects for insert
to anon
with check (bucket_id = 'felicitaciones');
