-- Modelo de estudia 1.0.0. Toda fila de negocio lleva cliente.

alter table estudia_clientes add column if not exists correo_admin text;

create table if not exists estudia_cursos (
  id text primary key,
  cliente_id text not null references estudia_clientes (id),
  titulo text not null,
  slug text not null,
  descripcion text not null,
  categoria text not null,
  nivel text not null,
  instructor text not null,
  required_tier text not null,
  estado text not null,
  duracion_min integer not null default 0,
  orden integer not null default 0,
  constraint estudia_cursos_cliente_chk check (cliente_id <> ''),
  constraint estudia_cursos_tier_chk check (required_tier in ('free', 'pro', 'studio')),
  constraint estudia_cursos_estado_chk check (estado in ('published', 'draft')),
  unique (cliente_id, slug)
);

create index if not exists estudia_cursos_cliente_idx on estudia_cursos (cliente_id);

create table if not exists estudia_lecciones (
  id text primary key,
  cliente_id text not null references estudia_clientes (id),
  curso_id text not null references estudia_cursos (id),
  titulo text not null,
  modulo text not null,
  orden integer not null,
  video_tipo text not null,
  video_url text not null,
  duracion_min integer not null,
  resumen text not null,
  muestra boolean not null default false,
  constraint estudia_lecciones_cliente_chk check (cliente_id <> ''),
  constraint estudia_lecciones_video_chk check (video_tipo in ('youtube', 'vimeo', 'mp4')),
  unique (curso_id, orden)
);

create index if not exists estudia_lecciones_cliente_idx on estudia_lecciones (cliente_id, curso_id);

create table if not exists estudia_recursos (
  id text primary key,
  cliente_id text not null references estudia_clientes (id),
  titulo text not null,
  descripcion text not null,
  tipo text not null,
  url text,
  required_tier text not null,
  curso_id text references estudia_cursos (id),
  constraint estudia_recursos_cliente_chk check (cliente_id <> ''),
  constraint estudia_recursos_tier_chk check (required_tier in ('free', 'pro', 'studio'))
);

create index if not exists estudia_recursos_cliente_idx on estudia_recursos (cliente_id);

create table if not exists estudia_perfiles (
  user_id text not null,
  cliente_id text not null references estudia_clientes (id),
  nombre text not null,
  avatar text,
  titular text not null default '',
  bio text not null default '',
  especialidad text not null default '',
  xp integer not null default 0,
  lecciones_hechas integer not null default 0,
  cursos_hechos integer not null default 0,
  racha integer not null default 0,
  insignia text not null default '',
  display_tier text not null default 'free',
  primary key (user_id, cliente_id),
  constraint estudia_perfiles_tier_chk check (display_tier in ('free', 'pro', 'studio'))
);

create index if not exists estudia_perfiles_cliente_xp_idx on estudia_perfiles (cliente_id, xp desc);

create table if not exists estudia_privado (
  user_id text not null,
  cliente_id text not null references estudia_clientes (id),
  email text not null default '',
  rol text not null default 'student',
  plan text not null default 'free',
  primary key (user_id, cliente_id),
  constraint estudia_privado_rol_chk check (rol in ('student', 'instructor', 'admin')),
  constraint estudia_privado_plan_chk check (plan in ('free', 'pro', 'studio'))
);

create table if not exists estudia_admins_lms (
  user_id text not null,
  cliente_id text not null references estudia_clientes (id),
  primary key (user_id, cliente_id)
);

create table if not exists estudia_progreso (
  user_id text not null,
  cliente_id text not null references estudia_clientes (id),
  curso_id text not null references estudia_cursos (id),
  completadas text not null default '[]',
  ultima text,
  porcentaje integer not null default 0,
  primary key (user_id, cliente_id, curso_id)
);

create table if not exists estudia_posts (
  id text primary key,
  cliente_id text not null references estudia_clientes (id),
  autor_id text not null,
  autor_nombre text not null,
  categoria text not null,
  titulo text not null,
  cuerpo text not null,
  likes integer not null default 0,
  creado_en timestamptz not null default now(),
  constraint estudia_posts_cliente_chk check (cliente_id <> '')
);

create index if not exists estudia_posts_cliente_idx on estudia_posts (cliente_id, creado_en desc);

create table if not exists estudia_comentarios (
  id text primary key,
  cliente_id text not null references estudia_clientes (id),
  post_id text not null references estudia_posts (id),
  autor_id text not null,
  autor_nombre text not null,
  cuerpo text not null,
  creado_en timestamptz not null default now()
);

create index if not exists estudia_comentarios_post_idx on estudia_comentarios (cliente_id, post_id);

create table if not exists estudia_likes (
  post_id text not null references estudia_posts (id),
  user_id text not null,
  cliente_id text not null references estudia_clientes (id),
  primary key (post_id, user_id)
);

insert into estudia_clientes (id, nombre, correo_admin)
values ('demo-estudia', 'Academia EstudIA', 'abrionesh@gmail.com')
on conflict (id) do nothing;

insert into estudia_clientes (id, nombre)
values ('cliente-aislado', 'Otro cliente')
on conflict (id) do nothing;

insert into estudia_cursos (
  id, cliente_id, titulo, slug, descripcion, categoria, nivel, instructor,
  required_tier, estado, duracion_min, orden
) values
  (
    'curso-ia', 'demo-estudia', 'IA aplicada al oficio', 'ia-aplicada-al-oficio',
    'Cómo usar modelos en el trabajo diario sin soltar el criterio.',
    'IA y Desarrollo', 'Inicial', 'EstudIA',
    'free', 'published', 18, 1
  ),
  (
    'curso-diseno', 'demo-estudia', 'Diseño editorial para una marca', 'diseno-editorial',
    'Jerarquía, tipo y silencio. Una pieza que se lee antes de explicarse.',
    'Diseño y Producto', 'Intermedio', 'EstudIA',
    'free', 'published', 12, 2
  ),
  (
    'curso-mkt', 'demo-estudia', 'Marketing que no grita', 'marketing-que-no-grita',
    'Mensaje, oferta y ritmo para un negocio de barrio.',
    'Marketing Digital', 'Inicial', 'EstudIA',
    'pro', 'published', 9, 3
  ),
  (
    'curso-ajeno', 'cliente-aislado', 'Secreto de otro cliente', 'secreto',
    'No debe aparecer en Academia EstudIA.',
    'IA y Desarrollo', 'Inicial', 'Ajeno',
    'free', 'published', 4, 1
  )
on conflict (id) do nothing;

insert into estudia_lecciones (
  id, cliente_id, curso_id, titulo, modulo, orden, video_tipo, video_url, duracion_min, resumen, muestra
) values
  (
    'lec-ia-1', 'demo-estudia', 'curso-ia', 'Qué le pides a un modelo', 'Criterio', 1, 'mp4',
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    6, 'La tarea, el contexto y lo que no debe inventar.', true
  ),
  (
    'lec-ia-2', 'demo-estudia', 'curso-ia', 'De la respuesta al oficio', 'Práctica', 2, 'youtube',
    'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    12, 'Revisar, recortar y quedar responsable del resultado.', false
  ),
  (
    'lec-diseno-1', 'demo-estudia', 'curso-diseno', 'Una página, una idea', 'Composición', 1, 'vimeo',
    'https://vimeo.com/76979871',
    12, 'Título, cuerpo y un solo acento.', true
  ),
  (
    'lec-mkt-1', 'demo-estudia', 'curso-mkt', 'La oferta en una frase', 'Mensaje', 1, 'mp4',
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    9, 'A quién, qué cambia y por qué ahora.', false
  )
on conflict (id) do nothing;

insert into estudia_recursos (id, cliente_id, titulo, descripcion, tipo, url, required_tier, curso_id)
values
  (
    'rec-prompts', 'demo-estudia', 'Guía breve de prompts',
    'Escribe el oficio, el lector y la prohibición. Pide un borrador corto y revísalo tú.',
    'Prompts', null, 'free', 'curso-ia'
  ),
  (
    'rec-kit', 'demo-estudia', 'Kit de pieza editorial',
    'Retícula, escala tipográfica y un acento. El archivo se abre cuando el plan lo permite.',
    'Kit Figma', null, 'pro', 'curso-diseno'
  )
on conflict (id) do nothing;

insert into estudia_perfiles (
  user_id, cliente_id, nombre, titular, bio, especialidad, xp, lecciones_hechas, insignia, display_tier
) values
  ('seed-nuria', 'demo-estudia', 'Nuria Soler', 'Diseña piezas', 'Trabaja la marca de un obrador.', 'Diseño', 80, 3, 'Constancia', 'free'),
  ('seed-leo', 'demo-estudia', 'Leo Martín', 'Oficio digital', 'Prueba herramientas y se queda con pocas.', 'IA', 50, 2, 'Criterio', 'free'),
  ('seed-ines', 'demo-estudia', 'Inés Prado', 'Cuenta el barrio', 'Escribe sin adjetivos de más.', 'Marketing', 30, 1, 'Oficio', 'pro')
on conflict (user_id, cliente_id) do nothing;

insert into estudia_posts (id, cliente_id, autor_id, autor_nombre, categoria, titulo, cuerpo)
values
  (
    'post-duda', 'demo-estudia', 'seed-leo', 'Leo Martín', 'Dudas técnicas',
    '¿Dónde corto una respuesta larga?',
    'El modelo me devuelve un texto de más. ¿Lo recortáis por párrafos o por lo que el cliente puede usar mañana?'
  ),
  (
    'post-anuncio', 'demo-estudia', 'seed-nuria', 'Nuria Soler', 'Anuncios',
    'La primera lección se ve sin cuenta',
    'El resto pide sesión. El ranking de esta academia no sale de aquí.'
  )
on conflict (id) do nothing;

insert into estudia_comentarios (id, cliente_id, post_id, autor_id, autor_nombre, cuerpo)
values (
  'com-1', 'demo-estudia', 'post-duda', 'seed-ines', 'Inés Prado',
  'Me quedo con la frase que alguien podría decir en voz alta.'
)
on conflict (id) do nothing;
