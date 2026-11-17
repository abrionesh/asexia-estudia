# AsexiA EstudIA — Contrato de arquitectura para construcción

**Fecha:** 2026-11-17  
**Estado:** Arquitectura definida. No construir en el hilo de arquitectura.  
**Fuente de verdad:** Índice vivo en `abrionesh/asexia-confia360/INDEX.md`. Los chats no son la fuente.  
**Documento de origen:** ASEXIA ESTUDIA implementation_plan1.md (analizado y adaptado).

---

## 1. Propósito y límites

AsexiA EstudIA es la app PWA que consume la biblioteca versionada `estudia` (o `formacion`) del ecosistema ConfIA360.

**Qué es:**
- Classroom (cursos, módulos, lecciones con vídeo híbrido).
- Comunidad (foro con categorías, comentarios, reacciones).
- Progreso, perfiles, ranking y XP por cliente.
- Biblioteca de recursos descargables.
- Panel de administración por cliente.

**Qué no es:**
- No es el radar.
- No es comunicaciones.
- No es voces ni WhatsApp Ana.
- No es motor-crm, calendario ni fichaje (integraciones opcionales futuras, no obligatorias).
- No es CRMSal.

**Reglas de este contrato:**
- Un cliente, sus locales. Varias apps. Cada una escribe lo suyo.
- Todo dato lleva `cliente`. Sin ese id no se lee. Un cliente no ve a otro.
- Biblioteca con versión: la app declara qué versión de `estudia` usa.
- Papeles separados aunque hoy los lleve la misma persona.
- PWA (manifest + service worker).

---

## 2. Biblioteca versionada `estudia`

La app no es la biblioteca. La app consume la biblioteca.

**Responsabilidades de la biblioteca `estudia`:**
- Esquema de datos y contratos (cursos, lecciones, progreso, comunidad, recursos, perfiles).
- Aislamiento por `cliente` (reglas, filtros, índices).
- Lógica de progreso, XP, ranking y permisos.
- Versionado explícito (la app declara la versión).

**Responsabilidades de la app (AsexiA EstudIA):**
- Interfaz (Classroom, comunidad, perfil, ranking, recursos, admin).
- Reproductor de vídeo híbrido.
- PWA (instalable, offline básico).
- Autenticación y sesión.
- Consumo de la biblioteca según la versión declarada.

Cada cliente (Fogón, Tío Eulogio, clínica, resto) usa su propia instancia de datos. Pueden compartir la misma versión de la biblioteca; cambian marca, cursos y dominio si procede.

---

## 3. Roles

Aunque hoy los lleve la misma persona:

| Papel | Alcance | Límites |
| :--- | :--- | :--- |
| **Plataforma** | Posee la biblioteca `estudia`, el esquema, el aislamiento y el versionado. | No gestiona contenido de un cliente concreto. |
| **Socio AsExIA** | Configura un cliente cada vez (inicializa cursos, recursos, instructores o planes de ese cliente). Anotado. | Un cliente cada vez. No ve datos de otros clientes. |
| **Administrador del negocio** | Solo gestiona lo de su cliente: cursos, lecciones, recursos, personal inscrito, progreso de su equipo. | Solo sus artículos, precios, personal, cursos. No toca la biblioteca ni ve otros clientes. |

Roles internos del LMS (`student`, `instructor`, `admin`) viven dentro del cliente. No escalan a plataforma.

---

## 4. Aislamiento por cliente (obligatorio)

Todo documento o colección lleva `cliente` (id del cliente).

- Lectura sin `cliente` → denegada.
- Un cliente no ve cursos, lecciones, progreso, posts, recursos ni perfiles de otro.
- Ranking y comunidad son por cliente.
- `admins` y roles efectivos viven bajo el cliente.
- Perfiles públicos (`profiles`) son públicos solo dentro del cliente (nombre, avatar, XP, bio). PII (email, rol real, suscripción) en ruta privada (`userPrivate` o equivalente).

El plan original (Firebase mono-tenant) se adapta: se añade el campo `cliente` y las reglas lo exigen.

---

## 5. Modelo de datos (adaptado)

Todas las colecciones/documentos incluyen `cliente`.

- `courses/{courseId}`: título, slug, descripción, categoría, nivel, portada, instructor, `requiredTier`, estado, duración, orden, **cliente**.
  - Subcolección `lessons`: título, módulo, orden, tipo de vídeo (`youtube` \| `vimeo` \| `mp4`), `videoUrl`, duración, resumen, `isFreePreview`, recursos adjuntos, **cliente**.
- `resources/{resourceId}`: título, tipo, URL o contenido, `requiredTier`, curso asociado opcional, **cliente**.
- `profiles/{uid}`: datos públicos (nombre, avatar, bio, XP, rachas, insignias, `displayTier`), **cliente**.
- `userPrivate/{uid}`: email, rol efectivo, plan de suscripción, **cliente**. Solo propietario o admin del cliente.
- `admins/{uid}`: marcador de privilegios, **cliente**.
- `userProgress/{uid}/courses/{courseId}`: lecciones completadas, último lesson, porcentaje, **cliente**.
- `posts` + `comments` + `likes`: comunidad por cliente.

Semilla idempotente permitida (contenido demo de Tecnología/IA y Diseño/Marketing), siempre con `cliente`.

---

## 6. Experiencia y diseño (del plan original, respetando aislamiento)

**Flujos:**
1. Visitante sin sesión: catálogo y primera lección de muestra del cliente (o contenido de plataforma explícitamente permitido). Modal de login al intentar completar, publicar o descargar restringido.
2. Alumno autenticado: Classroom, marca lecciones, suma XP, comunidad, perfil, ranking del cliente.
3. Admin/instructor del cliente: gestión de cursos, lecciones, recursos, roles y planes de su cliente.

**Identidad visual:**
- Oscuro editorial: lienzo `#090B10` / `#0D1119`, superficies `#131824` / `#192030`, acento cobalto/índigo `#4F46E5` / `#6366F1`.
- Tipografía: Bricolage Grotesque (display), Plus Jakarta Sans (cuerpo), JetBrains Mono (datos/tabular-nums).
- Disciplina: bordes 1px, sin sombras pesadas, metadatos con `·`, sin píldoras decorativas.

**Reproductor híbrido:** detección automática YouTube / Vimeo / MP4. Configurable por lección desde el admin del cliente.

---

## 7. PWA

Obligatorio en la app:
- Manifest (nombre, iconos, display standalone, theme_color acorde a la paleta).
- Service worker: cache de assets estáticos, offline básico para lecciones ya vistas y recursos descargados.
- Instalable en móvil y escritorio.
- Acceso desde el personal del cliente sin fricción.

---

## 8. Autenticación y pagos

- Google Login (Firebase Auth o equivalente). Sesión persistente.
- Vista previa pública del catálogo del cliente.
- Pagos desactivados. Campos `requiredTier` y `subscriptionPlan` preparados (`free` \| `pro` \| `studio`) para activar más adelante sin migrar esquema.
- Correo admin de referencia del plan: `abrionesh@gmail.com` (configurable por cliente).

---

## 9. Decisiones de producto heredadas y adaptadas

| Decisión | Enfoque en ConfIA360 |
| :--- | :--- |
| Aislamiento PII | `profiles` público dentro del cliente; `userPrivate` privado. |
| Contenido demo | Semilla idempotente con `cliente`. Editable desde el admin del cliente. |
| Reproductor | Híbrido YouTube/Vimeo/MP4. |
| Suscripciones | Campos preparados. Sin pasarela. |
| RBAC | `admins` + reglas bajo `cliente`. No auto-asignación. |

---

## 10. Contrato para la conversación de construcción

La conversación de construcción (AsexiA EstudIA – construcción) debe:

1. Consumir la biblioteca versionada `estudia`.
2. Respetar el aislamiento por `cliente` en todo dato y regla.
3. Entregar la app como PWA.
4. Mapear roles según la tabla anterior.
5. No mezclar con radar, comunicaciones, voces ni motor-crm.
6. Si surge una decisión de arquitectura, volver a este hilo o actualizar el índice vivo.

**No construir la app en el hilo de arquitectura.**

---

**Documento generado para uso en la conversación de construcción.**  
Índice vivo: `abrionesh/asexia-confia360/INDEX.md`.  
Actualizado: 2026-11-17.
