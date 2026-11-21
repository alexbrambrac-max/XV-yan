-- XV Yan · configuración de Supabase
-- Pégalo completo en Supabase → SQL Editor → New query → Run.

-- 1) Tabla con los datos de cada foto
create table if not exists public.fotos (
  id uuid primary key default gen_random_uuid(),
  path text not null unique check (path ~ '^[0-9a-f-]{36}\.jpg$'),
  nombre text check (char_length(nombre) <= 40),
  mensaje text check (char_length(mensaje) <= 90),
  created_at timestamptz not null default now()
);
alter table public.fotos enable row level security;

-- Permisos explícitos (funciona aunque "Grant API access to new tables automatically" esté apagado)
revoke all on public.fotos from anon, authenticated;
grant insert on public.fotos to anon, authenticated;
grant select, delete on public.fotos to authenticated;

-- Invitados (sin cuenta) solo pueden AGREGAR. Solo los dueños (con cuenta) pueden ver y borrar.
drop policy if exists "invitados agregan" on public.fotos;
create policy "invitados agregan" on public.fotos for insert to anon, authenticated with check (true);
drop policy if exists "duenos ven" on public.fotos;
create policy "duenos ven" on public.fotos for select to authenticated using (true);
drop policy if exists "duenos borran" on public.fotos;
create policy "duenos borran" on public.fotos for delete to authenticated using (true);

-- 2) Cajón privado para los archivos (máx. 5 MB, solo JPG)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', false, 5242880, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg'];

drop policy if exists "invitados suben fotos" on storage.objects;
create policy "invitados suben fotos" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'fotos' and name ~ '^[0-9a-f-]{36}\.jpg$');
drop policy if exists "duenos ven fotos" on storage.objects;
create policy "duenos ven fotos" on storage.objects for select to authenticated using (bucket_id = 'fotos');
drop policy if exists "duenos borran fotos" on storage.objects;
create policy "duenos borran fotos" on storage.objects for delete to authenticated using (bucket_id = 'fotos');
