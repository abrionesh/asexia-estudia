import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { BIBLIOTECA_ESTUDIA, limpiarNombre, type Papel } from "./contrato.ts";
import {
  alternarLike,
  asegurarMiembro,
  completadasDe,
  crearComentario,
  crearCurso,
  crearLeccion,
  crearPost,
  crearRecurso,
  esCategoria,
  guardarPerfil,
  leerCurso,
  listarComentarios,
  listarCursos,
  listarLecciones,
  listarPosts,
  listarRecursos,
  marcarLeccion,
  nombreClienteLms,
  puedeGestionar,
  ranking,
  resolverCliente,
  sesionDe,
} from "./lms.server.ts";
import { alcanzaTier, esTier, fuenteVideo, type Tier } from "./video.ts";

const sesionOpcional = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const user = await getSessionUser(context.bearerToken);
    return next({ context: { userId: user?.id ?? null } });
  });

async function contexto(userId: string | null) {
  const resuelto = await resolverCliente(userId);
  if (userId) await asegurarMiembro(userId, resuelto.clienteId);
  const cliente = await nombreClienteLms(resuelto.clienteId);
  const sesion = userId ? await sesionDe(userId, resuelto.clienteId) : null;
  const gestor = userId ? await puedeGestionar(userId, resuelto.clienteId, resuelto.papel) : false;
  return { resuelto, cliente, sesion, gestor };
}

export const obtenerContexto = createServerFn({ method: "GET" })
  .middleware([sesionOpcional])
  .handler(async ({ context }) => {
    const { resuelto, cliente, sesion, gestor } = await contexto(context.userId);
    return {
      biblioteca: BIBLIOTECA_ESTUDIA,
      cliente: { id: cliente.id, nombre: cliente.nombre },
      papel: resuelto.papel as Papel,
      usuario: sesion
        ? {
            nombre: sesion.nombre,
            rol: sesion.rol,
            plan: sesion.plan,
            xp: sesion.xp,
            bio: sesion.bio,
            titular: sesion.titular,
            especialidad: sesion.especialidad,
            puedeGestionar: gestor,
          }
        : null,
    };
  });

export const obtenerAula = createServerFn({ method: "GET" })
  .middleware([sesionOpcional])
  .handler(async ({ context }) => {
    const { resuelto, gestor } = await contexto(context.userId);
    const cursos = await listarCursos(resuelto.clienteId, gestor);
    return { cursos };
  });

export const obtenerCursoVista = createServerFn({ method: "GET" })
  .middleware([sesionOpcional])
  .validator((cursoId: string) => cursoId.trim())
  .handler(async ({ context, data }) => {
    const { resuelto, sesion } = await contexto(context.userId);
    const curso = await leerCurso(resuelto.clienteId, data);
    if (!curso) return { curso: null, lecciones: [], completadas: [] as string[] };
    const gestorCurso = sesion?.rol === "admin" || sesion?.rol === "instructor";
    if (curso.estado !== "published" && !gestorCurso) {
      return { curso: null, lecciones: [], completadas: [] as string[] };
    }
    const lecciones = await listarLecciones(resuelto.clienteId, curso.id);
    const completadas = await completadasDe(context.userId, resuelto.clienteId, curso.id);
    const plan = sesion?.plan ?? "free";
    return {
      curso,
      completadas,
      lecciones: lecciones.map((leccion) => {
        const abierta = leccion.muestra || alcanzaTier(plan, curso.requiredTier);
        return {
          ...leccion,
          abierta,
          videoUrl: abierta ? leccion.videoUrl : "",
          fuente: abierta ? fuenteVideo(leccion.videoTipo, leccion.videoUrl) : null,
        };
      }),
    };
  });

export const obtenerComunidad = createServerFn({ method: "GET" })
  .middleware([sesionOpcional])
  .handler(async ({ context }) => {
    const { resuelto } = await contexto(context.userId);
    return { posts: await listarPosts(resuelto.clienteId) };
  });

export const obtenerHilo = createServerFn({ method: "GET" })
  .middleware([sesionOpcional])
  .validator((postId: string) => postId.trim())
  .handler(async ({ context, data }) => {
    const { resuelto } = await contexto(context.userId);
    return { comentarios: await listarComentarios(resuelto.clienteId, data) };
  });

export const obtenerRecursos = createServerFn({ method: "GET" })
  .middleware([sesionOpcional])
  .handler(async ({ context }) => {
    const { resuelto, sesion } = await contexto(context.userId);
    const plan = sesion?.plan ?? "free";
    const recursos = await listarRecursos(resuelto.clienteId);
    return {
      recursos: recursos.map((recurso) => {
        const abierto = alcanzaTier(plan, recurso.requiredTier);
        return { ...recurso, url: abierto ? recurso.url : null, abierto };
      }),
    };
  });

export const obtenerRanking = createServerFn({ method: "GET" })
  .middleware([sesionOpcional])
  .handler(async ({ context }) => {
    const { resuelto } = await contexto(context.userId);
    return { perfiles: await ranking(resuelto.clienteId) };
  });

export const completarLeccion = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((leccionId: string) => leccionId.trim())
  .handler(async ({ context, data }) => {
    const { resuelto } = await contexto(context.userId);
    return marcarLeccion(context.userId, resuelto.clienteId, data);
  });

export const publicarPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { titulo: string; cuerpo: string; categoria: string }) => {
    const titulo = input.titulo.trim().replace(/\s+/g, " ");
    const cuerpo = input.cuerpo.trim();
    if (titulo.length < 3 || titulo.length > 120) throw new Error("El título va de 3 a 120 caracteres");
    if (cuerpo.length < 3 || cuerpo.length > 2000) throw new Error("El texto va de 3 a 2000 caracteres");
    if (!esCategoria(input.categoria)) throw new Error("Categoría desconocida");
    return { titulo, cuerpo, categoria: input.categoria };
  })
  .handler(async ({ context, data }) => {
    const { resuelto } = await contexto(context.userId);
    return crearPost(context.userId, resuelto.clienteId, data.titulo, data.cuerpo, data.categoria);
  });

export const publicarComentario = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { postId: string; cuerpo: string }) => {
    const cuerpo = input.cuerpo.trim();
    if (cuerpo.length < 1 || cuerpo.length > 1000) throw new Error("El comentario va de 1 a 1000 caracteres");
    return { postId: input.postId.trim(), cuerpo };
  })
  .handler(async ({ context, data }) => {
    const { resuelto } = await contexto(context.userId);
    return crearComentario(context.userId, resuelto.clienteId, data.postId, data.cuerpo);
  });

export const votarPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((postId: string) => postId.trim())
  .handler(async ({ context, data }) => {
    const { resuelto } = await contexto(context.userId);
    return alternarLike(context.userId, resuelto.clienteId, data);
  });

export const editarPerfil = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { titular: string; bio: string; especialidad: string }) => ({
    titular: input.titular.trim().slice(0, 80),
    bio: input.bio.trim().slice(0, 400),
    especialidad: input.especialidad.trim().slice(0, 80),
  }))
  .handler(async ({ context, data }) => {
    const { resuelto } = await contexto(context.userId);
    await guardarPerfil(context.userId, resuelto.clienteId, data);
    return { ok: true };
  });

export const altaCurso = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { titulo: string; descripcion: string; categoria: string; nivel: string; requiredTier: string }) => {
    if (!esTier(input.requiredTier)) throw new Error("Plan desconocido");
    return {
      titulo: limpiarNombre(input.titulo),
      descripcion: input.descripcion.trim().slice(0, 600),
      categoria: input.categoria.trim(),
      nivel: input.nivel.trim(),
      requiredTier: input.requiredTier,
    };
  })
  .handler(async ({ context, data }) => {
    const { resuelto, gestor } = await contexto(context.userId);
    if (!gestor) throw new Error("Este papel no gestiona el contenido del cliente");
    if (!data.descripcion) throw new Error("Falta la descripción");
    return crearCurso(resuelto.clienteId, data);
  });

export const altaLeccion = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: { cursoId: string; titulo: string; modulo: string; videoTipo: string; videoUrl: string; muestra: boolean }): {
      cursoId: string;
      titulo: string;
      modulo: string;
      videoTipo: "youtube" | "vimeo" | "mp4";
      videoUrl: string;
      muestra: boolean;
    } => {
      const videoTipo = input.videoTipo;
      if (videoTipo !== "youtube" && videoTipo !== "vimeo" && videoTipo !== "mp4") {
        throw new Error("Tipo de vídeo desconocido");
      }
      if (!fuenteVideo(videoTipo, input.videoUrl.trim())) throw new Error("La URL del vídeo no es válida");
      return {
        cursoId: input.cursoId.trim(),
        titulo: limpiarNombre(input.titulo),
        modulo: input.modulo.trim().slice(0, 80) || "Módulo",
        videoTipo,
        videoUrl: input.videoUrl.trim(),
        muestra: Boolean(input.muestra),
      };
    },
  )
  .handler(async ({ context, data }) => {
    const { resuelto, gestor } = await contexto(context.userId);
    if (!gestor) throw new Error("Este papel no gestiona el contenido del cliente");
    return crearLeccion(resuelto.clienteId, data);
  });

export const altaRecurso = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { titulo: string; descripcion: string; tipo: string; requiredTier: string }) => {
    if (!esTier(input.requiredTier)) throw new Error("Plan desconocido");
    return {
      titulo: limpiarNombre(input.titulo),
      descripcion: input.descripcion.trim().slice(0, 600),
      tipo: input.tipo.trim().slice(0, 40) || "Guía PDF",
      requiredTier: input.requiredTier as Tier,
    };
  })
  .handler(async ({ context, data }) => {
    const { resuelto, gestor } = await contexto(context.userId);
    if (!gestor) throw new Error("Este papel no gestiona el contenido del cliente");
    return crearRecurso(resuelto.clienteId, data);
  });
