-- XV Yan · Revisión de fotos antes de salir en pantalla
-- Pégalo en Supabase → SQL Editor → New query → Run (después de setup.sql).

-- Cada foto tiene un estado. Los invitados SOLO pueden crearla como 'nueva';
-- solo los dueños (con cuenta) pueden cambiarla a 'aprobada', 'revisar' u 'oculta'.
alter table public.fotos add column if not exists estado text not null default 'nueva'
  check (estado in ('nueva', 'aprobada', 'revisar', 'oculta'));

drop policy if exists "invitados agregan" on public.fotos;
create policy "invitados agregan" on public.fotos for insert to anon, authenticated
  with check (estado = 'nueva');

grant update (estado) on public.fotos to authenticated;
drop policy if exists "duenos actualizan" on public.fotos;
create policy "duenos actualizan" on public.fotos for update to authenticated using (true) with check (true);

-- Las fotos que ya estaban (incluida cualquier prueba) quedan por revisar, no salen solas.
update public.fotos set estado = 'revisar' where estado = 'nueva';
