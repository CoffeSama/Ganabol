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

---

# Incremento 1 — Evidencia de pruebas de la aplicación móvil

Pruebas unitarias sobre la base de datos local (Drift/SQLite en memoria).
Flutter 3.47.5, Dart 3.13.4. Ejecución: `flutter test` — 11 de 11 correctas.

| Grupo | Caso | Verifica |
|-------|------|----------|
| Registro local | Un animal registrado queda pendiente de sincronizar | El alta funciona sin conexión y queda marcada para envío |
| Registro local | No admite dos animales con la misma caravana en el predio | La restricción de unicidad opera también en el dispositivo |
| Registro local | Reenviar el mismo identificador actualiza en vez de duplicar | Idempotencia del reintento de sincronización |
| Baja lógica | El animal dado de baja desaparece del hato pero sigue en la base | La baja se puede propagar al servidor |
| Consultas | Devuelve el hato ordenado por caravana | Orden estable de la lista |
| Consultas | Filtra por fase productiva | Filtro de crianza, destete y engorde |
| Consultas | Busca por caravana | Búsqueda parcial sobre el identificador visible |
| Consultas | Busca por nombre | Búsqueda parcial sobre el nombre |
| Sincronización | Cuenta los registros pendientes de envío | Indicador de pendientes de la barra superior |
| Sincronización | Guarda y recupera la marca temporal | Permite pedir solo lo modificado desde la última pasada |
| Sincronización | Cerrar sesión vacía los datos del predio | Los datos no quedan al alcance del siguiente usuario |

## Hallazgo durante las pruebas

La marca temporal de sincronización se guarda como timestamp Unix y vuelve de
la base expresada en hora local, no en UTC. El instante es el mismo, pero la
comparación directa entre ambas representaciones falla. La consulta de cambios
convierte explícitamente a UTC antes de enviarla al servidor, de modo que el
comportamiento es correcto; la prueba se ajustó para comparar el instante y no
la zona horaria.
