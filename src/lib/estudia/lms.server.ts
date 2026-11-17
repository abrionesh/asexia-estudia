import { getSql } from "../db.ts";
import { leerAlcance } from "./alcance.server.ts";
import { Aislamiento, ClienteRequerido, type Papel } from "./contrato.ts";
import { alcanzaTier, esTier, type Tier } from "./video.ts";

export const CLIENTE_PUBLICO = "demo-estudia";

export type Curso = {
  id: string;
  clienteId: string;
  titulo: string;
  slug: string;
  descripcion: string;
  categoria: string;
  nivel: string;
  instructor: string;
  requiredTier: Tier;
  estado: string;
  duracionMin: number;
  orden: number;
};

export type Leccion = {
  id: string;
  clienteId: string;
  cursoId: string;
  titulo: string;
  modulo: string;
  orden: number;
  videoTipo: "youtube" | "vimeo" | "mp4";
  videoUrl: string;
  duracionMin: number;
  resumen: string;
  muestra: boolean;
};

export type Recurso = {
  id: string;
  clienteId: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  url: string | null;
  requiredTier: Tier;
  cursoId: string | null;
};

export type PerfilPublico = {
  userId: string;
  nombre: string;
  titular: string;
  bio: string;
  especialidad: string;
  xp: number;
  leccionesHechas: number;
  insignia: string;
  displayTier: Tier;
};

export type Post = {
  id: string;
  autorNombre: string;
  categoria: string;
  titulo: string;
  cuerpo: string;
  likes: number;
  creadoEn: string;
};

export type Comentario = {
  id: string;
  postId: string;
  autorNombre: string;
  cuerpo: string;
  creadoEn: string;
};

type CursoFila = {
  id: string;
  cliente_id: string;
  titulo: string;
  slug: string;
  descripcion: string;
  categoria: string;
  nivel: string;
  instructor: string;
  required_tier: string;
  estado: string;
  duracion_min: number;
  orden: number;
};

function exigir(clienteId: string) {
  if (!clienteId.trim()) throw new ClienteRequerido();
}

function esCierto(value: unknown): boolean {
  return value === true || value === 1 || value === "t" || value === "true" || value === "1";
}

function tier(value: string): Tier {
  return esTier(value) ? value : "free";
}

function aCurso(fila: CursoFila): Curso {
  return {
    id: fila.id,
    clienteId: fila.cliente_id,
    titulo: fila.titulo,
    slug: fila.slug,
    descripcion: fila.descripcion,
    categoria: fila.categoria,
    nivel: fila.nivel,
    instructor: fila.instructor,
    requiredTier: tier(fila.required_tier),
    estado: fila.estado,
    duracionMin: Number(fila.duracion_min),
    orden: Number(fila.orden),
  };
}

export async function resolverCliente(userId: string | null): Promise<{ clienteId: string; papel: Papel }> {
  if (!userId) return { clienteId: CLIENTE_PUBLICO, papel: "plataforma" };
  const alcance = await leerAlcance(userId);
  if (alcance.papel === "socio" && alcance.clienteId) {
    return { clienteId: alcance.clienteId, papel: alcance.papel };
  }
  if (alcance.papel === "administrador" && alcance.clienteId) {
    return { clienteId: alcance.clienteId, papel: alcance.papel };
  }
  return { clienteId: CLIENTE_PUBLICO, papel: alcance.papel };
}

export async function nombreClienteLms(clienteId: string): Promise<{ id: string; nombre: string; correoAdmin: string | null }> {
  exigir(clienteId);
  const sql = await getSql();
  const filas = await sql<{ id: string; nombre: string; correo_admin: string | null }>`
    select id, nombre, correo_admin from estudia_clientes where id = ${clienteId}
  `;
  const fila = filas[0];
  if (!fila) throw new Aislamiento("Ese cliente no existe");
  return { id: fila.id, nombre: fila.nombre, correoAdmin: fila.correo_admin };
}

export async function listarCursos(clienteId: string, incluirBorrador: boolean): Promise<Curso[]> {
  exigir(clienteId);
  const sql = await getSql();
  const filas = incluirBorrador
    ? await sql<CursoFila>`
        select id, cliente_id, titulo, slug, descripcion, categoria, nivel, instructor,
               required_tier, estado, duracion_min, orden
        from estudia_cursos
        where cliente_id = ${clienteId}
        order by orden
      `
    : await sql<CursoFila>`
        select id, cliente_id, titulo, slug, descripcion, categoria, nivel, instructor,
               required_tier, estado, duracion_min, orden
        from estudia_cursos
        where cliente_id = ${clienteId} and estado = 'published'
        order by orden
      `;
  return filas.filter((fila) => fila.cliente_id === clienteId).map(aCurso);
}

export async function leerCurso(clienteId: string, cursoId: string): Promise<Curso | null> {
  exigir(clienteId);
  const sql = await getSql();
  const filas = await sql<CursoFila>`
    select id, cliente_id, titulo, slug, descripcion, categoria, nivel, instructor,
           required_tier, estado, duracion_min, orden
    from estudia_cursos
    where id = ${cursoId} and cliente_id = ${clienteId}
  `;
  const fila = filas[0];
  return fila ? aCurso(fila) : null;
}

export async function listarLecciones(clienteId: string, cursoId: string): Promise<Leccion[]> {
  exigir(clienteId);
  const sql = await getSql();
  const filas = await sql<{
    id: string;
    cliente_id: string;
    curso_id: string;
    titulo: string;
    modulo: string;
    orden: number;
    video_tipo: "youtube" | "vimeo" | "mp4";
    video_url: string;
    duracion_min: number;
    resumen: string;
    muestra: boolean;
  }>`
    select id, cliente_id, curso_id, titulo, modulo, orden, video_tipo, video_url, duracion_min, resumen, muestra
    from estudia_lecciones
    where cliente_id = ${clienteId} and curso_id = ${cursoId}
    order by orden
  `;
  return filas
    .filter((fila) => fila.cliente_id === clienteId)
    .map((fila) => ({
      id: fila.id,
      clienteId: fila.cliente_id,
      cursoId: fila.curso_id,
      titulo: fila.titulo,
      modulo: fila.modulo,
      orden: Number(fila.orden),
      videoTipo: fila.video_tipo,
      videoUrl: fila.video_url,
      duracionMin: Number(fila.duracion_min),
      resumen: fila.resumen,
      muestra: esCierto(fila.muestra),
    }));
}

export async function listarRecursos(clienteId: string): Promise<Recurso[]> {
  exigir(clienteId);
  const sql = await getSql();
  const filas = await sql<{
    id: string;
    cliente_id: string;
    titulo: string;
    descripcion: string;
    tipo: string;
    url: string | null;
    required_tier: string;
    curso_id: string | null;
  }>`
    select id, cliente_id, titulo, descripcion, tipo, url, required_tier, curso_id
    from estudia_recursos
    where cliente_id = ${clienteId}
    order by titulo
  `;
  return filas
    .filter((fila) => fila.cliente_id === clienteId)
    .map((fila) => ({
      id: fila.id,
      clienteId: fila.cliente_id,
      titulo: fila.titulo,
      descripcion: fila.descripcion,
      tipo: fila.tipo,
      url: fila.url,
      requiredTier: tier(fila.required_tier),
      cursoId: fila.curso_id,
    }));
}

export async function ranking(clienteId: string): Promise<PerfilPublico[]> {
  exigir(clienteId);
  const sql = await getSql();
  const filas = await sql<{
    user_id: string;
    nombre: string;
    titular: string;
    bio: string;
    especialidad: string;
    xp: number;
    lecciones_hechas: number;
    insignia: string;
    display_tier: string;
  }>`
    select user_id, nombre, titular, bio, especialidad, xp, lecciones_hechas, insignia, display_tier
    from estudia_perfiles
    where cliente_id = ${clienteId}
    order by xp desc, nombre
  `;
  return filas.map((fila) => ({
    userId: fila.user_id,
    nombre: fila.nombre,
    titular: fila.titular,
    bio: fila.bio,
    especialidad: fila.especialidad,
    xp: Number(fila.xp),
    leccionesHechas: Number(fila.lecciones_hechas),
    insignia: fila.insignia,
    displayTier: tier(fila.display_tier),
  }));
}

export async function listarPosts(clienteId: string): Promise<Post[]> {
  exigir(clienteId);
  const sql = await getSql();
  const filas = await sql<{
    id: string;
    autor_nombre: string;
    categoria: string;
    titulo: string;
    cuerpo: string;
    likes: number;
    creado_en: string;
  }>`
    select id, autor_nombre, categoria, titulo, cuerpo, likes, creado_en::text as creado_en
    from estudia_posts
    where cliente_id = ${clienteId}
    order by creado_en desc
  `;
  return filas.map((fila) => ({
    id: fila.id,
    autorNombre: fila.autor_nombre,
    categoria: fila.categoria,
    titulo: fila.titulo,
    cuerpo: fila.cuerpo,
    likes: Number(fila.likes),
    creadoEn: String(fila.creado_en),
  }));
}

export async function listarComentarios(clienteId: string, postId: string): Promise<Comentario[]> {
  exigir(clienteId);
  const sql = await getSql();
  const filas = await sql<{
    id: string;
    post_id: string;
    autor_nombre: string;
    cuerpo: string;
    creado_en: string;
  }>`
    select id, post_id, autor_nombre, cuerpo, creado_en::text as creado_en
    from estudia_comentarios
    where cliente_id = ${clienteId} and post_id = ${postId}
    order by creado_en
  `;
  return filas.map((fila) => ({
    id: fila.id,
    postId: fila.post_id,
    autorNombre: fila.autor_nombre,
    cuerpo: fila.cuerpo,
    creadoEn: String(fila.creado_en),
  }));
}

export async function asegurarMiembro(userId: string, clienteId: string) {
  exigir(clienteId);
  const sql = await getSql();
  const usuarios = await sql<{ name: string; email: string; image: string | null }>`
    select name, email, image from "user" where id = ${userId}
  `;
  const usuario = usuarios[0];
  const nombre = usuario?.name?.trim() || "Alumno";
  const email = usuario?.email ?? "";
  await sql`
    insert into estudia_perfiles (user_id, cliente_id, nombre, avatar)
    values (${userId}, ${clienteId}, ${nombre}, ${usuario?.image ?? null})
    on conflict (user_id, cliente_id) do nothing
  `;
  await sql`
    insert into estudia_privado (user_id, cliente_id, email)
    values (${userId}, ${clienteId}, ${email})
    on conflict (user_id, cliente_id) do nothing
  `;
  const cliente = await nombreClienteLms(clienteId);
  if (email && cliente.correoAdmin && email.toLowerCase() === cliente.correoAdmin.toLowerCase()) {
    await sql`
      update estudia_privado set rol = 'admin' where user_id = ${userId} and cliente_id = ${clienteId}
    `;
    await sql`
      insert into estudia_admins_lms (user_id, cliente_id)
      values (${userId}, ${clienteId})
      on conflict (user_id, cliente_id) do nothing
    `;
  }
}

export async function sesionDe(userId: string, clienteId: string) {
  const sql = await getSql();
  const privado = await sql<{ rol: string; plan: string; email: string }>`
    select rol, plan, email from estudia_privado where user_id = ${userId} and cliente_id = ${clienteId}
  `;
  const perfil = await sql<{ nombre: string; xp: number; bio: string; titular: string; especialidad: string }>`
    select nombre, xp, bio, titular, especialidad
    from estudia_perfiles
    where user_id = ${userId} and cliente_id = ${clienteId}
  `;
  return {
    rol: (privado[0]?.rol ?? "student") as "student" | "instructor" | "admin",
    plan: tier(privado[0]?.plan ?? "free"),
    email: privado[0]?.email ?? "",
    nombre: perfil[0]?.nombre ?? "Alumno",
    xp: Number(perfil[0]?.xp ?? 0),
    bio: perfil[0]?.bio ?? "",
    titular: perfil[0]?.titular ?? "",
    especialidad: perfil[0]?.especialidad ?? "",
  };
}

export async function puedeGestionar(userId: string, clienteId: string, papel: Papel): Promise<boolean> {
  if (papel === "plataforma") return false;
  const sesion = await sesionDe(userId, clienteId);
  if (sesion.rol === "admin" || sesion.rol === "instructor") return true;
  const sql = await getSql();
  if (papel === "socio") {
    const filas = await sql`
      select cliente_id from estudia_anotaciones
      where user_id = ${userId} and cliente_id = ${clienteId} and hasta is null
    `;
    return filas.length > 0;
  }
  if (papel === "administrador") {
    const filas = await sql`
      select cliente_id from estudia_admin where user_id = ${userId} and cliente_id = ${clienteId}
    `;
    return filas.length > 0;
  }
  return false;
}

export async function completadasDe(userId: string | null, clienteId: string, cursoId: string): Promise<string[]> {
  if (!userId) return [];
  const sql = await getSql();
  const filas = await sql<{ completadas: string }>`
    select completadas from estudia_progreso
    where user_id = ${userId} and cliente_id = ${clienteId} and curso_id = ${cursoId}
  `;
  try {
    const lista = JSON.parse(filas[0]?.completadas ?? "[]") as unknown;
    return Array.isArray(lista) ? lista.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export async function marcarLeccion(userId: string, clienteId: string, leccionId: string) {
  exigir(clienteId);
  const sql = await getSql();
  const lecciones = await sql<{
    id: string;
    curso_id: string;
    muestra: boolean;
    cliente_id: string;
  }>`
    select id, curso_id, muestra, cliente_id from estudia_lecciones
    where id = ${leccionId} and cliente_id = ${clienteId}
  `;
  const leccion = lecciones[0];
  if (!leccion) throw new Aislamiento("La lección no es de este cliente");
  const curso = await leerCurso(clienteId, leccion.curso_id);
  if (!curso) throw new Aislamiento("El curso no es de este cliente");
  const sesion = await sesionDe(userId, clienteId);
  if (!leccion.muestra && !alcanzaTier(sesion.plan, curso.requiredTier)) {
    throw new Error("Esta lección pide un plan superior. El cobro aún no está activo.");
  }
  const hechas = await completadasDe(userId, clienteId, curso.id);
  if (hechas.includes(leccionId)) return { ya: true as const, xp: sesion.xp };
  const todas = await listarLecciones(clienteId, curso.id);
  const siguientes = [...hechas, leccionId];
  const porcentaje = Math.round((siguientes.length / Math.max(todas.length, 1)) * 100);
  await sql`
    insert into estudia_progreso (user_id, cliente_id, curso_id, completadas, ultima, porcentaje)
    values (${userId}, ${clienteId}, ${curso.id}, ${JSON.stringify(siguientes)}, ${leccionId}, ${porcentaje})
    on conflict (user_id, cliente_id, curso_id) do update
    set completadas = excluded.completadas, ultima = excluded.ultima, porcentaje = excluded.porcentaje
  `;
  await sql`
    update estudia_perfiles
    set xp = xp + 25, lecciones_hechas = lecciones_hechas + 1
    where user_id = ${userId} and cliente_id = ${clienteId}
  `;
  return { ya: false as const, xp: sesion.xp + 25 };
}

const CATEGORIAS = ["Dudas técnicas", "Proyectos y feedback", "Recursos compartidos", "Anuncios"];

export function esCategoria(value: string): boolean {
  return CATEGORIAS.includes(value);
}

export async function crearPost(userId: string, clienteId: string, titulo: string, cuerpo: string, categoria: string) {
  if (!esCategoria(categoria)) throw new Error("Categoría desconocida");
  const sesion = await sesionDe(userId, clienteId);
  const sql = await getSql();
  const id = crypto.randomUUID();
  await sql`
    insert into estudia_posts (id, cliente_id, autor_id, autor_nombre, categoria, titulo, cuerpo)
    values (${id}, ${clienteId}, ${userId}, ${sesion.nombre}, ${categoria}, ${titulo}, ${cuerpo})
  `;
  return { id };
}

export async function crearComentario(userId: string, clienteId: string, postId: string, cuerpo: string) {
  const sql = await getSql();
  const posts = await sql`select id from estudia_posts where id = ${postId} and cliente_id = ${clienteId}`;
  if (!posts[0]) throw new Aislamiento("Esa publicación no es de este cliente");
  const sesion = await sesionDe(userId, clienteId);
  const id = crypto.randomUUID();
  await sql`
    insert into estudia_comentarios (id, cliente_id, post_id, autor_id, autor_nombre, cuerpo)
    values (${id}, ${clienteId}, ${postId}, ${userId}, ${sesion.nombre}, ${cuerpo})
  `;
  return { id };
}

export async function alternarLike(userId: string, clienteId: string, postId: string) {
  const sql = await getSql();
  const posts = await sql`select id from estudia_posts where id = ${postId} and cliente_id = ${clienteId}`;
  if (!posts[0]) throw new Aislamiento("Esa publicación no es de este cliente");
  const ya = await sql`
    select post_id from estudia_likes where post_id = ${postId} and user_id = ${userId} and cliente_id = ${clienteId}
  `;
  if (ya[0]) {
    await sql`delete from estudia_likes where post_id = ${postId} and user_id = ${userId}`;
    await sql`update estudia_posts set likes = greatest(likes - 1, 0) where id = ${postId} and cliente_id = ${clienteId}`;
    return { activo: false };
  }
  await sql`
    insert into estudia_likes (post_id, user_id, cliente_id) values (${postId}, ${userId}, ${clienteId})
  `;
  await sql`update estudia_posts set likes = likes + 1 where id = ${postId} and cliente_id = ${clienteId}`;
  return { activo: true };
}

export async function guardarPerfil(
  userId: string,
  clienteId: string,
  datos: { titular: string; bio: string; especialidad: string },
) {
  const sql = await getSql();
  await sql`
    update estudia_perfiles
    set titular = ${datos.titular}, bio = ${datos.bio}, especialidad = ${datos.especialidad}
    where user_id = ${userId} and cliente_id = ${clienteId}
  `;
}

export async function crearCurso(
  clienteId: string,
  datos: { titulo: string; descripcion: string; categoria: string; nivel: string; requiredTier: Tier },
) {
  exigir(clienteId);
  const sql = await getSql();
  const id = crypto.randomUUID();
  const slug = id.slice(0, 8);
  await sql`
    insert into estudia_cursos (
      id, cliente_id, titulo, slug, descripcion, categoria, nivel, instructor, required_tier, estado, duracion_min, orden
    ) values (
      ${id}, ${clienteId}, ${datos.titulo}, ${slug}, ${datos.descripcion}, ${datos.categoria},
      ${datos.nivel}, 'Equipo', ${datos.requiredTier}, 'published', 0, 99
    )
  `;
  return { id };
}

export async function crearLeccion(
  clienteId: string,
  datos: { cursoId: string; titulo: string; modulo: string; videoTipo: "youtube" | "vimeo" | "mp4"; videoUrl: string; muestra: boolean },
) {
  const curso = await leerCurso(clienteId, datos.cursoId);
  if (!curso) throw new Aislamiento("El curso no es de este cliente");
  const sql = await getSql();
  const ordenFilas = await sql<{ orden: number }>`
    select coalesce(max(orden), 0) as orden from estudia_lecciones where curso_id = ${datos.cursoId} and cliente_id = ${clienteId}
  `;
  const orden = Number(ordenFilas[0]?.orden ?? 0) + 1;
  const id = crypto.randomUUID();
  await sql`
    insert into estudia_lecciones (
      id, cliente_id, curso_id, titulo, modulo, orden, video_tipo, video_url, duracion_min, resumen, muestra
    ) values (
      ${id}, ${clienteId}, ${datos.cursoId}, ${datos.titulo}, ${datos.modulo}, ${orden},
      ${datos.videoTipo}, ${datos.videoUrl}, 8, ${datos.titulo}, ${datos.muestra}
    )
  `;
  return { id };
}

export async function crearRecurso(
  clienteId: string,
  datos: { titulo: string; descripcion: string; tipo: string; requiredTier: Tier },
) {
  exigir(clienteId);
  const sql = await getSql();
  const id = crypto.randomUUID();
  await sql`
    insert into estudia_recursos (id, cliente_id, titulo, descripcion, tipo, required_tier)
    values (${id}, ${clienteId}, ${datos.titulo}, ${datos.descripcion}, ${datos.tipo}, ${datos.requiredTier})
  `;
  return { id };
}
