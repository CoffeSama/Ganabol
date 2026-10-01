# Incremento 1 — Evidencia de pruebas

Alcance verificado: Incremento 1 del perfil de proyecto (identidad, accesos y
motor de sincronización) y el inventario bovino del Incremento 2.

El esquema implementado reproduce el diseño del documento «05 - Diagrama de
base de datos»: nombres de tabla y de columna, dominios categóricos, reglas de
integridad referencial y marcas de baja lógica.

## Entorno

- PostgreSQL 16.13 en el servidor; SQLite mediante Drift en el dispositivo
- Backend NestJS 10 con Prisma 6; aplicación Flutter 3.47.5 (Dart 3.13.4)
- Migración aplicada: `incremento1_identidad_accesos_e_inventario`
- Tablas creadas: `usuario`, `potrero`, `animal`, `registro_sync`
- Carga inicial: 4 usuarios (uno por rol), 3 potreros, 5 animales

## Pruebas de la interfaz de programación

| # | Escenario | Esperado | Obtenido |
|---|-----------|----------|----------|
| 1 | Listar el hato con su potrero asignado | 200 con paginación | Correcto |
| 2 | Alta de animal con ULID generado en el cliente | 201 | 201 |
| 3 | Reenvío del mismo ULID (reintento de consolidación) | 201 sin duplicar | 201 |
| 4 | Caravana ya existente | 409 Conflict | 409 |
| 5 | Categoría fuera del dominio documentado | 400 Bad Request | 400 |
| 6 | Consulta sin token de autenticación | 401 Unauthorized | 401 |
| 7 | Veterinario intenta dar de alta un animal | 403 Forbidden | 403 |
| 8 | Credenciales incorrectas | 401 Unauthorized | 401 |
| 9 | Bitácora `registro_sync` tras un alta | Un asiento de operación «alta» | Correcto |

El escenario 3 verifica la idempotencia que exige la consolidación diferida:
cuando el dispositivo pierde la respuesta del servidor y reintenta el envío, el
registro no se duplica porque el identificador se genera en el cliente antes de
la transmisión.

El escenario 5 verifica que los dominios categóricos del diseño operan como
restricción efectiva: `ternera` no pertenece al dominio documentado y el
servidor la rechaza.

## Pruebas de la base de datos local

Ejecución con `flutter test` sobre SQLite en memoria: 12 de 12 correctas.

| Grupo | Caso | Verifica |
|-------|------|----------|
| Registro local | Un animal registrado queda pendiente de sincronizar | El alta funciona sin conexión y queda marcada para envío |
| Registro local | No admite dos animales con la misma caravana | La restricción de unicidad opera también en el dispositivo |
| Registro local | Reenviar el mismo identificador actualiza en vez de duplicar | Idempotencia del reintento |
| Baja lógica | El animal dado de baja sale del hato pero sigue en la base | La marca de baja puede propagarse al servidor |
| Consultas | Devuelve el hato ordenado por caravana | Orden estable de la lista |
| Consultas | Filtra por fase de manejo | Filtro de crianza, destete y engorde |
| Consultas | Busca por número de caravana | Búsqueda parcial sobre el identificador visible |
| Sincronización | Cuenta los registros pendientes de envío | Indicador de pendientes de la barra superior |
| Sincronización | Un conflicto deja de reintentarse en cada pasada | El registro en conflicto sale de la cola |
| Sincronización | Guarda y recupera el cursor de sincronización | Permite pedir solo lo modificado desde la última pasada |
| Sincronización | Cerrar sesión vacía los datos del establecimiento | Los datos no quedan al alcance del siguiente usuario |
| Potreros | Un animal puede quedar sin potrero asignado | La relación con potrero admite nulo, según el diseño |

## Verificación de la aplicación en ejecución

La aplicación compila para navegador y la pantalla de ingreso se carga sin
errores de consola. El recorrido posterior al ingreso no se automatizó porque
Flutter dibuja los campos de texto sobre un lienzo y no aceptan escritura
simulada; esa verificación se realiza de forma manual sobre el dispositivo.

## Hallazgo durante las pruebas

El cursor de sincronización se guarda como marca de tiempo Unix y vuelve de la
base expresado en hora local, no en UTC. El instante es el mismo, pero la
comparación directa entre ambas representaciones falla. La consulta de cambios
convierte explícitamente a UTC antes de enviarla al servidor, de modo que el
comportamiento es correcto; la prueba se ajustó para comparar el instante y no
la zona horaria.
