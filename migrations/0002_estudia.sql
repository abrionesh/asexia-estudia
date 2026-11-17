-- Biblioteca estudia 1.0.0. Todo dato de negocio lleva cliente.
-- El user_id solo ata el papel de la persona. No autoriza a leer otro cliente.

create table if not exists estudia_clientes (
  id text primary key,
  nombre text not null,
  creado_en timestamptz not null default now(),
  constraint estudia_clientes_id_chk check (id <> ''),
  constraint estudia_clientes_nombre_chk check (length(trim(nombre)) > 0)
);

create table if not exists estudia_papel (
  user_id text primary key,
  papel text not null,
  constraint estudia_papel_chk check (papel in ('plataforma', 'socio', 'administrador'))
);

create table if not exists estudia_admin (
  user_id text primary key,
  cliente_id text not null references estudia_clientes (id),
  fijado_en timestamptz not null default now()
);

create table if not exists estudia_anotaciones (
  id text primary key,
  user_id text not null,
  cliente_id text not null references estudia_clientes (id),
  nota text not null,
  desde timestamptz not null default now(),
  hasta timestamptz,
  constraint estudia_anotaciones_nota_chk check (length(trim(nota)) between 1 and 280)
);

create index if not exists estudia_anotaciones_user_idx
  on estudia_anotaciones (user_id);

create index if not exists estudia_anotaciones_user_cliente_idx
  on estudia_anotaciones (user_id, cliente_id);

-- Un socio, un cliente abierto. El anterior queda cerrado (hasta).
create unique index if not exists estudia_anotacion_abierta_idx
  on estudia_anotaciones (user_id)
  where hasta is null;

create table if not exists estudia_formaciones (
  id text primary key,
  cliente_id text not null references estudia_clientes (id),
  titulo text not null,
  creado_en timestamptz not null default now(),
  constraint estudia_formaciones_cliente_chk check (cliente_id <> ''),
  constraint estudia_formaciones_titulo_chk check (length(trim(titulo)) between 1 and 120)
);

create index if not exists estudia_formaciones_cliente_idx
  on estudia_formaciones (cliente_id);
