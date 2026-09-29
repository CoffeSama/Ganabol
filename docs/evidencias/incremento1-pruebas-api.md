# Incremento 1 — Evidencia de pruebas de la API

Ejecución sobre PostgreSQL 16.13, backend NestJS 10 con Prisma 6.
Fecha de ejecución: 2026-09-29.

## Entorno

- Base de datos: PostgreSQL 16.13
- Migración aplicada: `20260929163616_incremento1_identidad_e_inventario`
- Tablas creadas: `predio`, `usuario`, `animal`, `_prisma_migrations`
- Carga inicial: 1 predio, 4 usuarios (uno por rol), 5 animales

## Resultados

| # | Escenario | Esperado | Obtenido |
|---|-----------|----------|----------|
| 1 | Login con credenciales válidas | 200 + access/refresh token | Correcto |
| 2 | Listar animales del predio autenticado | 200 con paginación | Correcto |
| 3 | Crear animal con ULID generado en el cliente | 201 | Correcto |
| 4 | Reenviar el mismo ULID (reintento de sincronización) | 201 sin duplicar | Correcto |
| 5 | Crear animal con caravana ya usada en el predio | 409 Conflict | 409 |
| 6 | Consultar sin token de autenticación | 401 Unauthorized | 401 |
| 7 | Veterinario intenta registrar un animal (RBAC) | 403 Forbidden | 403 |
| 8 | Login con contraseña incorrecta | 401 Unauthorized | 401 |
| 9 | Consultar cambios desde una marca temporal | 200 con lista y marca | Correcto |

## Observaciones

El escenario 4 verifica la propiedad de idempotencia exigida por la
sincronización diferida: cuando el dispositivo pierde la respuesta del
servidor y reintenta el envío, el registro no se duplica porque el
identificador lo genera el cliente antes de la transmisión.

El escenario 5 verifica que la restricción de unicidad de caravana opera a
nivel de predio y no global, de modo que dos establecimientos distintos
pueden usar la misma numeración de manejo sin interferencia.
