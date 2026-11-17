/**
 * Sentencias de la biblioteca. Toda lectura de negocio filtra por cliente.
 * No añadir un listado sin ese predicado.
 */
export const SQL_LISTAR_FORMACIONES =
  "select id, titulo, cliente_id, creado_en::text as creado_en from estudia_formaciones where cliente_id = $1 order by creado_en desc";

export const SQL_CREAR_FORMACION =
  "insert into estudia_formaciones (id, cliente_id, titulo) values ($1, $2, $3) returning id, titulo, cliente_id, creado_en::text as creado_en";

export const SQL_LISTAR_CURSOS =
  "select id, titulo, cliente_id from estudia_cursos where cliente_id = $1 and estado = 'published' order by orden";
