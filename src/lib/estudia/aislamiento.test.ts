import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SQL_LISTAR_CURSOS, SQL_LISTAR_FORMACIONES } from "./consultas.ts";
import {
  Aislamiento,
  ALIAS_NO_BIBLIOTECA,
  BIBLIOTECA_ESTUDIA,
  ClienteRequerido,
  puedeFijarNegocio,
  puedeReabrir,
  rechazarSiAjeno,
} from "./contrato.ts";
import { alcanzaTier, fuenteVideo } from "./video.ts";
import { comprobarAislamiento } from "./comprobar.ts";

describe("contrato estudia", () => {
  it("declara estudia 1.0.0 y no trata formacion como otra biblioteca", () => {
    assert.equal(BIBLIOTECA_ESTUDIA.id, "estudia");
    assert.equal(BIBLIOTECA_ESTUDIA.version, "1.0.0");
    assert.notEqual(ALIAS_NO_BIBLIOTECA, BIBLIOTECA_ESTUDIA.id);
  });

  it("la lectura de formaciones siempre filtra por cliente", () => {
    assert.match(SQL_LISTAR_FORMACIONES, /where cliente_id = \$1/);
    assert.doesNotMatch(SQL_LISTAR_FORMACIONES, /from estudia_formaciones\s*$/i);
  });

  it("el catálogo de cursos también filtra por cliente", () => {
    assert.match(SQL_LISTAR_CURSOS, /where cliente_id = \$1/);
  });

  it("no reabre un cliente que no anotaste", () => {
    assert.equal(puedeReabrir(["a"], "a"), true);
    assert.equal(puedeReabrir(["a"], "b"), false);
  });

  it("el cliente del negocio no se cambia", () => {
    assert.equal(puedeFijarNegocio(false), true);
    assert.equal(puedeFijarNegocio(true), false);
  });

  it("un id ajeno no pasa el corte", () => {
    assert.throws(() => rechazarSiAjeno("a", "b"), Aislamiento);
    assert.throws(() => rechazarSiAjeno(null, "b"), ClienteRequerido);
    assert.doesNotThrow(() => rechazarSiAjeno("a", "a"));
  });

  it("el reproductor solo acepta https conocido", () => {
    assert.equal(alcanzaTier("free", "pro"), false);
    assert.equal(alcanzaTier("pro", "free"), true);
    const youtube = fuenteVideo("youtube", "https://www.youtube.com/watch?v=aqz-KE-bpKQ");
    assert.equal(youtube?.tipo, "youtube");
    assert.equal(fuenteVideo("mp4", "http://inseguro/a.mp4"), null);
  });
  it("el motor aísla dos clientes y la plataforma", async () => {
    const resultado = await comprobarAislamiento();
    assert.equal(resultado.ok, true, JSON.stringify(resultado.pasos));
  });
});
