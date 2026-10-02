# Plan de trabajo GanaBol

Estado al 2 de octubre de 2026: **7 de 15 requisitos funcionales** y **8 de 15
tablas** implementados y verificados.

Cada tarea de abajo es una sesión de trabajo. El orden no es el del documento
de diseño sino el del valor para la defensa.

> **Una tarea por sesión.** No pidas varias de corrido. Las razones están al
> final, en «Por qué de a una».

| # | Tarea | Requisito | Sesiones | Estado |
|---|-------|-----------|----------|--------|
| 0 | Convenciones del repositorio | — | 0,5 | Pendiente |
| 1 | Evaluación ponderada para la venta | RF15 | 2 | Pendiente |
| 2 | Estado del hato | RF11 | 1 | Pendiente |
| 3 | Fases de manejo y destete | RF6 | 1 | Pendiente |
| 4 | Historial de movimientos | RF8 | 1 | Pendiente |
| 5 | Cifrado de la base local | RNF1 | 1 | Pendiente |

Con las seis se llega a **10 de 15 requisitos y 11 de 15 tablas**. Si el tiempo
alcanza solo para tres, son la 0, la 1 y la 2.

---

## La verificación de cada tarea

Corre igual en las seis. No se pasa a la siguiente con algo en rojo.

```bash
# Servidor
cd backend
npx tsc --noEmit        # sin salida es correcto
npx jest                # todas en verde
npm run build

# Móvil
cd ../mobile
flutter analyze                        # "No issues found!"
TZ=America/La_Paz flutter test         # el huso importa, hay reglas de fecha
```

Si la tarea tocó la base de datos:

```bash
cd backend
npx prisma migrate dev --name <nombre_de_la_migracion>
npx prisma db seed
psql -U ganabol -d ganabol -c '\dt'
```

Si la tarea agregó pantallas, el recorrido real:

```bash
# Terminal 1
cd backend && npm run start:dev

# Terminal 2
cd mobile && flutter run --dart-define=API_URL=http://10.0.2.2:3000/api
```

Tres cosas que mirar siempre, porque son las que ya fallaron una vez:

1. Que el registro nuevo **llegue al servidor**. Si queda con icono de nube o
   de error, no sincronizó.
2. Que las **fechas** muestren el día correcto, no el anterior.
3. Que la pantalla **no se quede cargando**: suele ser un error de red que la
   aplicación se tragó en silencio.

---

## Tarea 0 — Convenciones del repositorio

Crear `CLAUDE.md` en la raíz del repositorio. Claude Code lo lee antes de cada
tarea, de modo que las convenciones no hay que repetirlas en cada petición.
Importa directamente: *consistencia* es uno de los cuatro criterios de la
revisión.

El contenido está en la sección «Tarea 0» del plan compartido, o se puede pedir
así:

```
Crea CLAUDE.md en la raiz del repositorio con las convenciones del proyecto.
Deducilas del codigo que ya existe, no las inventes: lee backend/src/pesajes/,
backend/src/sanidad/, mobile/lib/data/repositories/ y mobile/lib/domain/, y
escribi las reglas que ese codigo ya sigue.

Tiene que cubrir al menos: idioma espanol en todo, comentarios que explican el
porque y no el que, la estructura de modulos del backend con dominio/ puro,
idempotencia de las altas, asiento en registro_sync, baja logica, endpoints de
cambios, el patron local-first del movil, el uso obligatorio de
nuevoIdentificador() y de diaAJson/diaDesdeJson, la migracion de schemaVersion
en Drift, y las reglas de prueba.

Agrega una seccion "Lo que no se hace" con: no inventar entidades que el
documento 05 no define, no cambiar el diseno para que coincida con el codigo,
y no dar una tarea por terminada sin correr la verificacion completa.
```

**Verificación.** En Claude Code, escribir `/context`. `CLAUDE.md` tiene que
aparecer en lo que cargó.

---

## Tarea 1 — Evaluación ponderada para la venta (RF15)

Tablas nuevas: `criterio_evaluacion` y `evaluacion`.

Es la tarea más valiosa: la justificación técnica del proyecto la nombra como
el tercer componente que eleva el sistema por encima de un registro simple, y
hoy no existe.

El criterio de aceptación del requisito es concreto: al cambiar el peso
relativo de un criterio, el ranking se recalcula de forma coherente.

### Petición

```
Implementa RF15, evaluacion ponderada para la seleccion de venta, segun el
diseno del documento 05 (tablas criterio_evaluacion y evaluacion) y la ficha
de RF15 del documento 01. Segui las convenciones de CLAUDE.md.

BACKEND

1. Esquema Prisma: agrega CriterioEvaluacion (idCriterio, nombre,
   pesoRelativo Decimal(4,2), activo) y Evaluacion (idEvaluacion, idAnimal FK
   Restrict, fecha Date, puntajeTotal Decimal(6,2), decision opcional,
   actualizadoEn, eliminado). Migracion aparte con el CHECK
   peso_relativo >= 0 que pide el diccionario.

2. Modulo src/evaluaciones/ con dominio/ponderacion.ts como funcion PURA, sin
   Nest ni Prisma. Ahi va toda la logica:

   - Normalizacion min-max por criterio sobre el conjunto de candidatos:
     cada valor se lleva a 0..1 segun el minimo y el maximo del hato
     evaluado. Es lo que permite sumar peso en kg con edad en meses sin que
     el kilaje domine solo por tener numeros mas grandes.
   - Caso borde que importa: si todos los animales tienen el mismo valor en
     un criterio, el rango es cero y la division no existe. Decidi que pasa
     y comentalo: ese criterio no discrimina, de modo que debe aportar lo
     mismo a todos y no romper el calculo.
   - Criterios: peso estimado (mas es mejor), edad en meses (mas es mejor
     hasta el optimo de faena y peor despues, no es monotono), estado
     sanitario (menos eventos abiertos es mejor, de modo que invierte).
     El sentido de cada criterio es parte de su definicion, no algo que se
     asuma.
   - Puntaje = suma ponderada de los valores normalizados, con los pesos
     relativos normalizados para que sumen 1. Si el usuario carga pesos que
     suman 3, el puntaje tiene que seguir siendo comparable.
   - Decision recomendada a partir del puntaje, con el umbral explicito y
     comentado, nunca un numero magico suelto.

3. Servicio y controlador: CRUD de criterios, POST /evaluaciones/calcular que
   evalua el hato activo y devuelve el ranking ordenado, GET
   /evaluaciones/cambios para sincronizar. Alta idempotente y asiento en
   registro_sync como el resto.

4. Semilla: tres criterios con pesos que sumen algo distinto de 1, para que
   la normalizacion quede ejercitada desde el primer arranque.

MOVIL

5. lib/domain/evaluacion/ponderacion.dart con la MISMA funcion pura, y la
   misma prueba con los mismos valores esperados que la del servidor.
6. Tablas Drift CriteriosEvaluacion y Evaluaciones, schemaVersion a 3 con su
   paso en onUpgrade.
7. Repositorio y providers siguiendo el patron de pesajes_repository.dart.
8. Pantalla de ranking: lista ordenada por puntaje con el valor de cada
   criterio visible, y los pesos relativos editables en la misma pantalla de
   modo que al moverlos el orden se recalcule a la vista. Eso es exactamente
   el criterio de aceptacion del requisito, asi que tiene que verse.

PRUEBAS

9. En los dos lados: normalizacion correcta, el caso de rango cero, que
   cambiar un peso relativo cambia el orden del ranking, que los pesos se
   normalizan, y que un animal sin pesaje no rompe el calculo.

No inventes criterios que el documento no menciona. No toques los documentos
de diseno. Cuando termines, corre la verificacion completa y pegame la salida.
```

### Verificación propia

```bash
# Ranking con los pesos de la semilla
curl -s -X POST localhost:3000/api/evaluaciones/calcular \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Subir el peso del criterio de kilaje y recalcular
curl -s -X PATCH localhost:3000/api/criterios/<id> \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"pesoRelativo": 5}'

curl -s -X POST localhost:3000/api/evaluaciones/calcular \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**Quedó bien si** el orden cambia entre las dos corridas, y cambia en la
dirección esperada: al subir el peso del criterio de kilaje, el animal más
pesado sube posiciones.

**Quedó mal si** algún puntaje sale `NaN` o `null`. Casi siempre es el caso de
rango cero.

---

## Tarea 2 — Estado del hato (RF11)

Sin tablas nuevas: son agregaciones sobre lo que ya existe. Mejor relación
entre esfuerzo y efecto, porque es la primera pantalla que alguien ve.

### Petición

```
Implementa RF11, presentar el estado del hato, segun la ficha del documento
01. Segui las convenciones de CLAUDE.md. No hay tablas nuevas: son consultas
agregadas sobre animal, pesaje, evento_sanitario y alerta.

BACKEND

1. Modulo src/hato/ con GET /hato/estado que devuelva en una sola respuesta:
   - total de animales activos, y su desglose por fase y por categoria
   - peso total estimado del hato y peso promedio por categoria
   - ganancia media diaria del hato en los ultimos 30 dias
   - alertas abiertas separadas en vencidas y pendientes
   - cuantos animales no tienen ningun pesaje registrado

2. Resolve las agregaciones en la base, con groupBy o SQL, nunca trayendo
   todos los animales a memoria para contarlos ahi.

3. El ultimo punto es el que mas le sirve al productor: le dice de que
   animales no sabe nada. Que la respuesta lo traiga explicito y no obligue a
   deducirlo restando.

MOVIL

4. Pantalla de inicio que reemplace a la lista como destino despues del
   ingreso, con la lista a un toque de distancia. Tarjetas grandes y legibles
   con sol directo, siguiendo el criterio del tema: contraste alto, tipografia
   grande, objetivos tactiles de 56.

5. Importante: esta pantalla tiene que funcionar SIN CONEXION. Calcula los
   numeros desde la base local con consultas de Drift, no pidiendoselos al
   servidor. El endpoint del servidor es para el panel web, no para esta
   pantalla.

6. Cada tarjeta lleva al detalle correspondiente: las alertas al calendario,
   los animales sin pesaje a la lista filtrada por esa condicion.

PRUEBAS

7. Las agregaciones locales con datos conocidos: un hato de prueba de cinco
   animales con pesajes y alertas conocidos, y los totales esperados escritos
   a mano en la prueba, no calculados por el mismo codigo que se prueba.

Cuando termines, corre la verificacion completa y pegame la salida.
```

### Verificación propia

**Quedó bien si** al apagar el servidor y abrir la aplicación, la pantalla de
inicio sigue mostrando los números. Si se queda cargando o muestra ceros, se
construyó contra el servidor y hay que rehacerla contra la base local.

Los totales tienen que cuadrar con la lista: si dice 5 animales activos, la
lista tiene 5.

---

## Tarea 3 — Fases de manejo y destete (RF6)

La columna `fase` ya existe en `animal`. Falta la regla de transición y el
registro del destete como evento con fecha.

### Petición

```
Implementa RF6, gestionar las fases de manejo y el destete, segun la ficha del
documento 01. Segui las convenciones de CLAUDE.md.

1. La columna fase ya existe en animal. Falta la regla: las transiciones
   validas son crianza -> destete -> engorde, en ese orden y sin saltear.
   Pone esa regla en una funcion pura, en dominio/, en los dos lados, y
   probala con la matriz completa de transiciones: las tres validas y todas
   las invalidas, incluida la de una fase a si misma.

2. Pensa si el retroceso debe permitirse. Un animal no vuelve de engorde a
   crianza, pero una fase mal cargada si tiene que poder corregirse. Decidi
   que hacer y comentalo: una regla de dominio y una correccion de un error de
   captura no son lo mismo, y confundirlas obliga al usuario a dar de baja el
   animal para arreglar un tipeo.

3. El destete es un evento con fecha, no solo un cambio de columna: el
   productor necesita saber cuando fue. Registralo de la forma que el diseno
   ya permite sin inventar una tabla nueva.

4. En la aplicacion: cambio de fase desde la ficha del animal, mostrando solo
   las transiciones validas desde la fase actual en lugar de ofrecerlas todas
   y rechazar despues. El filtro por fase de la lista ya existe; verifica que
   siga funcionando.

Cuando termines, corre la verificacion completa y pegame la salida.
```

### Verificación propia

**Quedó bien si** al abrir el cambio de fase de un animal en crianza, la única
opción ofrecida es destete.

Y si el intento de saltar de crianza a engorde devuelve 400 desde el servidor
aunque la aplicación no lo ofrezca: la regla va en los dos lados, porque la
aplicación no es la única forma de llegar al servidor.

---

## Tarea 4 — Historial de movimientos (RF8)

Tabla nueva: `movimiento`. RF8 figura hoy como parcial porque la ubicación
actual está pero el historial no.

### Petición

```
Implementa RF8 completo, registrar movimientos y ubicacion del ganado, segun
el documento 05 (tabla movimiento) y la ficha del documento 01. Segui las
convenciones de CLAUDE.md.

1. Tabla movimiento: idMovimiento, idAnimal FK Restrict, idPotreroOrigen FK
   opcional, idPotreroDestino FK obligatorio, fecha Date, actualizadoEn,
   eliminado. El origen es opcional porque el primer movimiento de un animal
   recien dado de alta no tiene de donde venir.

2. Regla central: al registrar un movimiento, el campo idPotrero del animal se
   actualiza al destino, y las dos escrituras van en la MISMA transaccion. Si
   se separaran, un fallo entre ambas dejaria al animal con una ubicacion que
   su historial no respalda, y el historial es justamente lo que da valor al
   requisito.

3. El origen no se recibe del cliente: se toma del idPotrero que el animal
   tiene en ese momento. Pedirselo al cliente permitiria registrar un traslado
   desde un potrero donde el animal no estaba.

4. Endpoints: POST /movimientos, GET /movimientos/animal/:id para el
   historial, GET /movimientos/cambios para sincronizar.

5. En la aplicacion: seccion de ubicacion en la ficha del animal con su
   historial, y la accion de trasladar. Local-first como todo lo demas, con
   la misma actualizacion transaccional en la base local.

6. Pruebas: que el traslado actualiza la ubicacion del animal, que el origen
   se toma del estado previo y no de lo que mande el cliente, que el primer
   movimiento admite origen nulo, y que el historial sale ordenado por fecha
   descendente.

Cuando termines, corre la verificacion completa y pegame la salida.
```

### Verificación propia

```sql
-- El animal y su ultimo movimiento tienen que coincidir.
-- Si no, la transaccion no es una sola.
SELECT a.caravana, a.id_potrero AS potrero_actual,
       m.id_potrero_destino AS ultimo_destino, m.fecha
  FROM animal a
  LEFT JOIN LATERAL (
    SELECT * FROM movimiento
     WHERE id_animal = a.id_animal AND eliminado = FALSE
     ORDER BY fecha DESC LIMIT 1
  ) m ON TRUE
 WHERE a.eliminado = FALSE;
```

**Quedó bien si** `potrero_actual` y `ultimo_destino` coinciden en todas las
filas que tienen movimiento.

---

## Tarea 5 — Cifrado de la base local (RNF1)

Es una brecha que el propio documento declara abierta. El motivo no es formal:
el dispositivo va al campo y puede perderse o ser robado con los datos del
establecimiento adentro.

### Petición

```
Implementa el cifrado en reposo de la base local que exige el RNF1, usando
SQLCipher con Drift. Segui las convenciones de CLAUDE.md.

1. Hoy la clave se deriva de una constante de compilacion. Cambialo: la clave
   se genera aleatoriamente la primera vez que se abre la base y se guarda en
   el almacen seguro del dispositivo con flutter_secure_storage, que ya esta
   en el proyecto para los tokens.

2. Pensa el orden de las operaciones al abrir la aplicacion. La clave hay que
   leerla del almacen seguro ANTES de abrir la base, y esa lectura es
   asincronica. Si la base se abre antes de tener la clave, o se abre sin
   cifrar la primera vez y se cifra despues, el cifrado no sirve de nada.

3. Que pasa si la lectura del almacen seguro falla, o si la clave se perdio
   porque el usuario reinstalo la aplicacion. Decidi que hacer y comentalo: la
   base cifrada con una clave que ya no existe es ilegible, y el usuario
   necesita entender que paso en lugar de ver la aplicacion en blanco.

4. Las pruebas corren contra SQLite en memoria sin cifrar; asegurate de que la
   apertura sea inyectable para que las pruebas actuales sigan pasando sin
   cambios.

5. Actualiza el comentario de BaseDatosLocal, que hoy dice que la custodia de
   la clave esta pendiente.

Cuando termines, corre la verificacion completa y pegame la salida.
```

### Verificación propia

Es la única verificación que prueba de verdad que el cifrado funciona:

```bash
adb shell "run-as bo.ganabol.app cat databases/ganabol.sqlite" > /tmp/ganabol.sqlite
sqlite3 /tmp/ganabol.sqlite ".tables"
```

**Quedó bien si** `sqlite3` responde `file is not a database` o
`file is encrypted`.

**Quedó mal si** lista las tablas: la base está en claro y el requisito no está
cumplido, por más que el código mencione SQLCipher.

Guardar la salida de ese comando: es la evidencia del RNF1.

---

## Si sobra tiempo

En orden de valor. No empezar ninguna que no se pueda terminar y verificar:
media funcionalidad sin pruebas resta más de lo que suma.

| Requisito | Qué es | Tablas | Sesiones |
|-----------|--------|--------|----------|
| RF14 | Control reproductivo | `evento_reproductivo` | 2 |
| RF9 | Comercialización | `venta`, `venta_detalle` | 2 |
| RF7 | Referencia nutricional | `referencia_nutricional` | 1 |
| RF12 | Reportes en PDF | — | 2 |

RF14 tiene una regla verificable que queda bien en la defensa: la fecha
probable de parto es la del servicio más 283 días. Función pura, se prueba en
dos líneas, y usa el mismo patrón de dominio que Schaeffer y el calendario.

El panel web queda fuera: es el último incremento del cronograma y no entra en
el tiempo disponible. Se defiende como está, diseñado, con su arquitectura
documentada en el Capítulo V.

---

## Por qué de a una

La tentación de pedir las seis tareas de corrido tiene cuatro problemas
concretos, no teóricos.

**Los defectos que importaron no los encontraron las pruebas.** Los tres fallos
reales de este proyecto —identificadores en minúsculas, código de respuesta del
inicio de sesión, fechas corridas un día— pasaron las 126 pruebas automatizadas
y aparecieron al recorrer la aplicación contra el servidor. Una tanda de cinco
tareas entrega cinco veces más código sin haberlo ejecutado nunca.

**Los errores se acumulan.** Si la normalización de la Tarea 1 queda mal, la
Tarea 2 la hereda al mostrar los pesos. El error se descubre al final, con
cinco tareas de código encima que hay que desenredar.

**Hay que poder defenderlo.** En la defensa interna la pregunta es «¿por qué
normalización min-max y no otra cosa?». Esa respuesta se tiene por haber estado
ahí cuando se decidió, no por leer el resultado después.

**La sesión se queda sin contexto.** Cinco tareas en una sesión obligan a
compactar, y después de compactar se pierden los detalles de las convenciones
que se venían siguiendo. La calidad baja justo donde se califica consistencia.

### La forma que sí funciona

Una sesión por tarea, con `/clear` entre una y otra, y esta petición:

```
Lee docs/PLAN.md. Hace UNICAMENTE la Tarea N, incluida su verificacion.

No empieces la siguiente. Cuando termines, pegame la salida real de cada
comando de verificacion, sin resumirla, y decime en una frase cada una: que
archivos tocaste, que regla de negocio nueva quedo cubierta por prueba, y que
quedo sin cubrir.
```

Esa última pregunta es la que importa. Si no puede decir qué quedó sin cubrir,
es que no lo pensó.

---

## Cuando algo falla

| Síntoma | Casi siempre es | Qué hacer |
|---------|-----------------|-----------|
| `flutter analyze` limpio pero no compila | Código generado desactualizado | `dart run build_runner build` |
| Una prueba de fecha pasa sola y falla en el conjunto | Depende del reloj del sistema | Pasar la fecha como parámetro |
| El registro queda con icono de error | El servidor lo rechazó | Mirar la respuesta: suele ser validación del DTO |
| La pantalla se queda cargando | Error de red que la aplicación se tragó | Revisar el `catch` que no informa nada |
| `prisma migrate` reporta deriva | La base no coincide con las migraciones | `npx prisma migrate reset` y volver a sembrar |
| Las pruebas pasan y el recorrido falla | Las dos piezas entienden distinto el contrato | Mirar la petición real en la red |

La última fila es la importante.

### Cuando Claude Code se traba

Después de dos o tres intentos sin salir, no insistir con la misma petición:

```
Para. No intentes arreglarlo todavia.

Explicame en no mas de diez lineas: que esperabas que pasara, que paso
realmente, y cual es tu hipotesis de por que. Si no tenes una hipotesis,
decime que necesitarias mirar para formarla.
```

Eso corta el ciclo de parches a ciegas, que es la forma más rápida de romper
algo que funcionaba.

---

## Lo que no se resuelve con código

De los cuatro criterios de la revisión, este plan cubre uno y medio.

**Evidencia de reuniones.** Ocho anexos y nueve apéndices listados, todos
vacíos. La carta de autorización y la exportación del Jotform se resuelven en
una tarde. Las entrevistas a los tres especialistas que declara el Perfil son
la pregunta de fondo.

**Defensa interna.** Sin empezar. Dos horas, aunque signifique sacrificar una
tarea de código. Hay que poder explicar con palabras propias por qué ULID y no
autoincremental, por qué resolución diferenciada por riesgo, y por qué baja
lógica.
