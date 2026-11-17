# AsexiA estudia — Plataforma LMS de Formación Online

Plataforma de aprendizaje online en español diseñada con una estética editorial oscura y acentos cobalto/índigo, que integra Classroom multimedia, comunidad interactiva, seguimiento de progreso, ranking, biblioteca de recursos descargables y panel de administración sobre Firebase Authentication y Firestore, preparada para activar suscripciones en el futuro.

---

## Decisiones Confirmadas y Puntos Críticos

> [!IMPORTANT]
> **Resumen de decisiones confirmadas en la fase de aclaración y requisitos base de arquitectura:**

- **Temática de demostración**: Cursos, lecciones, recursos y debates centrados en **Tecnología, IA y desarrollo digital** junto con **Diseño, marketing y creación de contenido**.
- **Dirección visual**: **Oscuro editorial con acento cobalto e índigo**, superficies de elevación única con bordes finos de 1px, tipografía editorial y numeración tabular estricta.
- **Reproductor de vídeo híbrido**: Soporte nativo tanto para **URLs de YouTube y Vimeo** como para **vídeo directo HTML5 (MP4)**, configurable por lección desde el panel de administración.
- **Acceso inicial y autenticación**: **Vista previa pública del catálogo** (cursos, temarios, comunidad y ranking visibles sin fricción) combinada con **Google Login mediante Firebase Authentication** para guardar progreso, comentar/publicar, descargar recursos exclusivos y acceder al panel de administración.
- **Pagos desactivados y preparados para suscripciones**: No se integra pasarela de pago activa todavía; el modelo de datos y la interfaz incorporan niveles de plan (`Gratis`, `Pro`, `Studio`) para habilitar cobros recurrentes más adelante sin reescribir la base de datos.

> [!NOTE]
> Durante la ejecución se solicitará confirmar la provisión de Firebase en el entorno para habilitar Firestore y Google Login con reglas de seguridad endurecidas y el correo administrador preconfigurado (`abrionesh@gmail.com`).

---

## 1. Visión General y Concepto Central

### Qué hace la plataforma
**AsexiA estudia** unifica en un único espacio de trabajo con navegación lateral todo el ciclo de aprendizaje digital en español:
1. **Classroom estructurado**: Catálogo de cursos filtrable por temática y nivel, módulos ordenados, reproductor de vídeo con seguimiento automático y manual de lecciones completadas, notas de clase y adjuntos descargables.
2. **Comunidad de alumnos**: Foro categorizado (Dudas técnicas, Proyectos y feedback, Recursos compartidos, Anuncios) con publicaciones, comentarios anidados, reacciones y menciones de curso.
3. **Progreso, Perfiles y Ranking**: Perfil editable por el alumno, métricas reales de avance por curso, racha de estudio, puntos de experiencia (XP) por lecciones completadas y participación, y tabla de clasificación general.
4. **Biblioteca de Recursos Descargables**: Repositorio centralizado de plantillas, prompts, kits de diseño y guías descargables vinculadas a lecciones o accesibles de forma independiente.
5. **Panel de Administración (RBAC)**: Consola protegida por rol para crear y editar cursos, módulos, lecciones en vídeo (YouTube, Vimeo o MP4), recursos adjuntos, gestionar roles de usuarios (`student`, `instructor`, `admin`) y simular/asignar planes de suscripción para pruebas.

### Público objetivo y valor principal
Diseñada para academias digitales, creadores técnicos y escuelas de producto/diseño que necesitan una experiencia propia más limpia, rápida y cohesionada que las herramientas genéricas, con aislamiento estricto de datos privados y una base técnica lista para monetizar mediante membresías.

---

## 2. Experiencia de Usuario y Diseño Visual

### Flujos principales de usuario
1. **Exploración inicial (Visitante sin sesión)**:
   - Aterriza directamente en el espacio de trabajo oscuro con barra lateral responsive (colapsable en móvil) y catálogo de cursos destacados en IA, desarrollo, diseño y marketing.
   - Puede abrir cualquier curso para inspeccionar su temario, ver la primera lección de muestra abierta, leer publicaciones de la comunidad y consultar el ranking público.
   - Al intentar marcar una lección como completada, publicar en la comunidad o descargar un recurso restringido, un modal discreto le invita a iniciar sesión con Google.
2. **Experiencia del Alumno autenticado**:
   - Al iniciar sesión con Google se crea automáticamente su perfil público y registro privado de preferencias/suscripción (`free` por defecto).
   - En el **Classroom** reproduce vídeos (YouTube/Vimeo/MP4), marca lecciones como vistas, suma XP en tiempo real y visualiza su porcentaje de avance por módulo y curso.
   - En **Comunidad** publica hilos, filtra por categoría, comenta en publicaciones de otros alumnos y otorga votos útiles.
   - En **Mi Perfil** consulta su progreso global, cursos activos, insignias obtenidas y edita su biografía, especialidad y enlaces profesionales.
3. **Flujo de Administración (`admin` / `instructor`)**:
   - Desde la sección **Administración** en la barra lateral accede a tres pestañas operativas: *Gestión de Cursos y Lecciones*, *Gestión de Recursos* y *Usuarios, Roles y Planes*.
   - Puede dar de alta un nuevo curso, añadir módulos y lecciones indicando URL de YouTube/Vimeo o MP4, definir el nivel de acceso requerido (`free`, `pro`, `studio`) y publicar inmediatamente en Firestore.

### Identidad visual y sistema tipográfico
- **Dirección estética**: Oscuro editorial técnico, limpio y de alto contraste, inspirado en estudios de producto modernos y documentación de ingeniería.
- **Paleta 60-30-10**:
  - **60% Lienzo dominante**: Obsidiana profunda (`#090B10`) y pizarra nocturna (`#0D1119`) para el área principal y barra lateral.
  - **30% Superficies estructurales**: Tarjetas y paneles planos en `#131824` y `#192030` con bordes finos de 1px (`rgba(255, 255, 255, 0.08)`), sin sombras pesadas ni tarjetas anidadas dentro de tarjetas.
  - **10% Acento focal**: Azul cobalto e índigo (`#4F46E5` / `#6366F1` con realce `#3B82F6` para foco y estados activos), reservado estrictamente para llamadas a la acción primarias, pestaña activa y barras de progreso.
- **Tipografía (Regla 2+1)**:
  - **Display y títulos**: `Bricolage Grotesque` (titulares balanceados con `text-wrap: balance`, sin huérfanos).
  - **Cuerpo y navegación**: `Plus Jakarta Sans` (con compensación óptica para lectura en modo oscuro: peso 400–600 y espaciado cómodo).
  - **Datos, métricas y duraciones**: `JetBrains Mono` con `tabular-nums` obligatorio en contadores de progreso, XP, posiciones del ranking y tiempos de lección.
- **Disciplina visual**:
  - Metadatos sin cápsulas ni píldoras decorativas: categorías, duraciones y fechas se muestran como texto limpio separado por puntos tipográficos (`·`).
  - Controles y enlaces en una sola línea (`whitespace-nowrap shrink-0`), sin barras de estado falsas, sin bordes izquierdos gruesos (`border-l-4`) y sin puntos parpadeantes decorativos.
  - Imágenes generadas a medida (portadas de cursos y cabecera editorial) con contenedor de respaldo estilizado si alguna imagen falla.

---

## 3. Decisiones Clave de Producto y Compromisos

| Decisión | Enfoque elegido | Por qué | Alternativas descartadas |
| :--- | :--- | :--- | :--- |
| **Aislamiento de PII en Firestore** | Colección dividida: perfiles públicos visibles en catálogo/ranking (`profiles`) y datos sensibles (`email`, rol efectivo, estado de suscripción) en ruta privada por usuario (`userSecrets` / `admins`). | Cumple estrictamente las reglas de privacidad (PII) evitando exponer correos electrónicos en lecturas públicas del ranking o comunidad. | Guardar el `email` directamente en documentos públicos de usuario (riesgo de filtración de datos personales). |
| **Gestión de contenido demostrativo** | Semilla estructurada idempotente ejecutada al primer arranque o desde el panel admin, sincronizada con Firestore + respaldo de lectura inicial para visitantes. | Garantiza que la plataforma luzca completa desde el primer segundo y permita editar/ampliar cursos reales en Firestore sin perder persistencia. | Contenido estático hardcodeado en el cliente (imposibilitaría probar el panel admin real). |
| **Reproductor multimedia híbrido** | Detector inteligente de fuente (`youtube`, `vimeo`, `mp4`) que renderiza `iframe` limpio con parámetros de privacidad o reproductor `<video>` HTML5 con controles propios. | Permite al administrador pegar enlaces de YouTube/Vimeo o usar archivos MP4 directos de muestra sin depender de un único proveedor. | Usar solo `<video>` MP4 o solo YouTube (limitaría los flujos de creación en el panel admin). |
| **Preparación para suscripciones** | Campo `requiredTier` (`free`, `pro`, `studio`) en cursos/recursos y `subscriptionPlan` en el usuario, con vista informativa de planes y bloqueo visual suave sin pasarela de pago. | Deja lista la lógica de autorización por nivel de membresía para conectar Stripe o Lemon Squeezy en el futuro sin migrar esquemas. | Omitir niveles de acceso (obligaría a reestructurar cursos y reglas más adelante). |
| **Permisos por roles (RBAC)** | Colección dedicada `admins/{uid}` + documento de rol verificado en reglas de seguridad (`isAdmin()`, `isInstructor()`), evitando que un usuario se autoasigne privilegios. | Impide la escalada de privilegios desde el cliente; solo administradores verificados pueden promover instructores o publicar cursos. | Campo `role` editable libremente en el perfil del usuario (vulnerable a manipulación desde consola). |

---

## 4. Arquitectura Técnica y Estrategia de Datos

### Diagrama de arquitectura del sistema

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         INTERFAZ REACT (Responsive)                       │
│  ┌─────────────────┐   ┌───────────────────────────────────────────────┐  │
│  │ Navegación      │   │ Barra Superior (3 zonas: Título / Acciones)   │  │
│  │ Lateral (260px) │   ├───────────────────────────────────────────────┤  │
│  │                 │   │                                               │  │
│  │ · Classroom     │   │  Vistas activas sincronizadas en tiempo real: │  │
│  │ · Comunidad     │   │  [Classroom + Reproductor]  [Comunidad]       │  │
│  │ · Recursos      │   │  [Ranking y Progreso]       [Perfil Alumno]   │  │
│  │ · Ranking       │   │  [Planes (Vista previa)]    [Panel Admin]     │  │
│  │ · Mi Perfil     │   │                                               │  │
│  │ · Planes        │   └───────────────────────────────────────────────┘  │
│  │ · Admin (RBAC)  │                           ▲                          │
│  └─────────────────┘                           │ Contexto React +         │
│                                                │ Manejo de errores        │
└────────────────────────────────────────────────┼──────────────────────────┘
                                                 │
                    ┌────────────────────────────┴────────────────────────────┐
                    ▼                                                         ▼
┌───────────────────────────────────────┐   ┌─────────────────────────────────────────┐
│     FIREBASE AUTHENTICATION           │   │           CLOUD FIRESTORE               │
│                                       │   │                                         │
│ · Proveedor Google (signInWithPopup)  │   │ · courses / lessons (catálogo público)  │
│ · Sesión persistente y verificación   │   │ · resources (biblioteca descargable)    │
│ · Token verificado en Firestore Rules │   │ · posts / comments (comunidad)          │
│                                       │   │ · profiles (datos públicos y XP)        │
│                                       │   │ · userProgress (avance por usuario)     │
│                                       │   │ · userPrivate / admins (PII y RBAC)     │
└───────────────────────────────────────┘   └─────────────────────────────────────────┘
```

### Modelo de datos en Firestore (Esquema y Privacidad)
- **`courses/{courseId}`**: Título, slug, descripción editorial, categoría (`IA y Desarrollo`, `Diseño y Producto`, `Marketing Digital`), nivel (`Inicial`, `Intermedio`, `Avanzado`), imagen de portada, instructor, `requiredTier` (`free` | `pro` | `studio`), estado (`published` | `draft`), duración total y orden.
  - Subcolección **`courses/{courseId}/lessons/{lessonId}`**: Título, módulo al que pertenece, orden, tipo de vídeo (`youtube` | `vimeo` | `mp4`), `videoUrl`, duración en minutos, resumen editorial, `isFreePreview` y lista acotada de IDs o referencias a recursos adjuntos.
- **`resources/{resourceId}`**: Título, descripción, tipo (`Plantilla`, `Guía PDF`, `Kit Figma`, `Prompts`, `Código`), URL de descarga o contenido estructurado descargable, tamaño/formato, curso asociado opcional y `requiredTier`.
- **`profiles/{uid}`** *(Público, sin PII)*: Nombre visible, avatar, titular profesional, biografía, especialidad, `xp` acumulado, `completedLessonsCount`, `completedCoursesCount`, `streakDays`, insignia actual y `displayTier` (`free` | `pro` | `studio`).
- **`userPrivate/{uid}`** *(Solo propietario o Admin)*: Correo electrónico verificado, rol asignado (`student` | `instructor` | `admin`), estado de suscripción futuro (`plan`, `status`, `renewalDate: null`) y fecha de registro.
- **`admins/{uid}`** *(Fuente de verdad RBAC para reglas de seguridad)*: Documento marcador que otorga permisos administrativos verificados.
- **`userProgress/{uid}/courses/{courseId}`** *(Solo propietario o Admin)*: Array acotado de `completedLessonIds`, `lastLessonId`, porcentaje calculado y marcas de tiempo de actualización.
- **`posts/{postId}`** y subcolección **`posts/{postId}/comments/{commentId}`**: Publicaciones de comunidad con `authorId`, `authorName`, `authorAvatar`, categoría, título, cuerpo, contador de likes, subcolección **`likes/{uid}`** para evitar duplicados, y comentarios en tiempo real.

### Mapeo de interactividad y estado
- **Classroom y Reproductor**: Seleccionar un curso carga sus lecciones ordenadas; al abrir una lección se parsea automáticamente la URL (extrayendo ID de YouTube/Vimeo o cargando `<video>` HTML5). Pulsar *"Marcar como completada"* ejecuta una escritura atómica en `userProgress` e incrementa el `xp` en `profiles/{uid}` actualizando de inmediato la barra de progreso y la posición en el **Ranking**.
- **Comunidad**: Filtros por categoría y búsqueda en vivo; el formulario de nueva publicación valida longitud y categoría, persiste en `posts` con `serverTimestamp()` y los comentarios actualizan el hilo en vivo mediante `onSnapshot`.
- **Recursos Descargables**: Filtrado por tipo y nivel de acceso; si el recurso es accesible según el plan del usuario (o es `free`), permite descarga directa / apertura segura y registra el conteo. Si requiere un plan superior (`Pro`/`Studio`) muestra un aviso claro de membresía próxima sin pagos activos.
- **Panel de Administración**: Protegido en interfaz y en `firestore.rules`. Permite crear/editar/eliminar cursos, añadir o reordenar lecciones en vídeo, publicar recursos descargables y cambiar el rol o plan de prueba de los alumnos.
- **Resiliencia y Seguridad**: Validación de conexión inicial con `getDocFromServer`, envoltura con `ErrorBoundary` y manejador estructurado `handleFirestoreError` en todas las lecturas/escrituras y suscripciones `onSnapshot`, además de reglas `firestore.rules` validadas con `@firebase/eslint-plugin-security-rules`.
