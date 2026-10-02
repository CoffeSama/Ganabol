# Incremento 2 — Evidencia de pruebas: pesaje morfométrico y sanidad

Alcance verificado: estimación del peso corporal por método morfométrico (RF4),
registro del historial sanitario (RF5) y calendario de alertas (RF13).

El esquema implementado reproduce el diseño del documento «05 - Diagrama de
base de datos» en las tablas `pesaje`, `evento_sanitario`, `plan_sanitario` y
`alerta`, con una adición que se justifica más abajo.

## Entorno

- PostgreSQL 16.13 en el servidor; SQLite mediante Drift en el dispositivo
- Backend NestJS 10 con Prisma 6; aplicación Flutter 3.47.5 (Dart 3.13.4)
- Migraciones aplicadas:
  - `incremento2_pesaje_sanidad_y_alertas`
  - `restricciones_de_rango_del_diccionario`
  - `evento_sanitario_referencia_al_protocolo`
- Tablas en servicio: ocho de las quince diseñadas
- Carga inicial añadida: 4 protocolos sanitarios, 6 pesajes, 5 eventos

## 1. Fórmula de estimación del peso

El peso vivo se estima con la fórmula de Schaeffer, `PV = (PT² × LC) / k`, con
las medidas en centímetros y el peso en kilogramos. La constante de partida es
la bibliográfica, `k = 10838`, recogida por Wangchuk et al. (2018).

La fórmula está implementada dos veces: en Dart, porque el pesaje ocurre en el
corral sin conexión y el personal necesita el resultado en el momento; y en
TypeScript, porque el servidor es quien custodia la constante en vigor y
recalcula al consolidar. Que ambas coincidan **al decimal** se verifica con los
mismos siete casos en las dos suites: si una se desviara, el peso que el
productor vio cambiaría al sincronizar.

| PT (cm) | LC (cm) | Peso estimado (kg) |
|---------|---------|--------------------|
| 180 | 150 | 448,42 |
| 176 | 143 | 408,71 |
| 168 | 138 | 359,38 |
| 158 | 131 | 301,74 |
| 186 | 152 | 485,20 |
| 214 | 176 | 743,69 |
| 94 | 78 | 63,59 |

### Validación de rangos

Las medidas se validan antes de calcular y el resultado también, porque una
combinación de medidas individualmente plausibles puede arrojar un peso que no
lo es.

| # | Escenario | Esperado | Obtenido |
|---|-----------|----------|----------|
| 1 | Alta de pesaje; el servidor calcula el peso | 201 con el peso derivado | 201, 448,42 kg |
| 2 | Comprobación aritmética independiente del caso 1 | 448,42 | 448,42 |
| 3 | Reenvío del mismo identificador | Sin duplicar el historial | 4 registros, no 5 |
| 4 | Perímetro torácico de 400 cm | 400 Bad Request | 400 |
| 5 | PT 60 cm y LC 50 cm (peso resultante de 16,61 kg) | 400 con indicación de repetir | 400 |

## 2. Calibración de la constante

El diseño prevé calibrar la constante para el ganado cebú de la zona, porque
las fórmulas clásicas se derivaron en razas europeas de conformación distinta.
El servicio expone el procedimiento: recibe una muestra de animales medidos y
pesados, y devuelve la constante que mejor la ajusta junto al error medio
absoluto de ambas constantes.

| # | Escenario | Obtenido |
|---|-----------|----------|
| 6 | Muestra sintética generada con `k = 10200` | La calibración recupera 10200 |
| 7 | Error de la constante calibrada sobre esa muestra | Inferior a 0,1 % |
| 8 | Error expresado en puntos porcentuales | Un sesgo del 10 % devuelve 10, no 0,1 |
| 9 | Muestra vacía o peso de referencia no positivo | Rechazo con error de rango |

> **Esta es la verificación del mecanismo, no la validación del método.** La
> muestra empleada es sintética: se construyó a partir de una constante
> conocida precisamente para comprobar que el ajuste la recupera. El objetivo
> declarado de un error medio absoluto no mayor al ocho por ciento solo puede
> darse por cumplido contra la muestra de referencia real, medida y pesada en
> campo. Ese contraste está pendiente y es el que determina la constante que
> el sistema debe adoptar.

## 3. Calendario sanitario

Los protocolos cargados reproducen el calendario de la zona: la campaña oficial
antiaftosa del SENASAG, semestral y obligatoria para todo el hato; la
desparasitación interna cuatrimestral; el carbunclo sintomático anual en
terneros; y la brucelosis anual en vaquillonas de reposición.

| # | Escenario | Esperado | Obtenido |
|---|-----------|----------|----------|
| 10 | Primera generación del calendario | Alertas según protocolo y categoría | 9 alertas |
| 11 | Segunda generación consecutiva | Sin cambios (operación idempotente) | 0 creadas, 0 actualizadas, 0 retiradas |
| 12 | Orden de la bandeja | De la más urgente a la menos | Correcto |
| 13 | Registro del evento del protocolo | La alerta sale de pendientes | `vencida` → `atendida` |
| 14 | Efecto sobre las demás alertas del mismo animal | Intactas | Intactas |
| 15 | Vencimiento siguiente tras el registro | Fuera de la ventana de 30 días | No se muestra |
| 16 | Sincronización incremental desde una marca | Protocolos, eventos y alertas | 4, 6 y 15 |
| 17 | Último peso de cada animal activo | Un registro por animal pesado | Correcto |

### Dos correcciones de diseño surgidas de la ejecución

**Protocolos distintos del mismo tipo.** El diccionario de datos identificaba
el evento sanitario solo por su tipo. Con dos protocolos de vacunación sobre el
mismo animal —antiaftosa y carbunclo—, ambos compartían el mismo «último evento
de vacunación», de modo que aplicar uno reiniciaba el conteo del otro. Se
añadió a `evento_sanitario` una referencia opcional al protocolo que cumple.
Es opcional porque el productor también registra lo que no estaba previsto: el
tratamiento de una herida no responde a ningún protocolo.

**Vencimientos anteriores al alta.** Un animal adulto cargado sin historial
producía alertas «vencidas» desde hacía años: su fecha de nacimiento más la
periodicidad del protocolo. Esa fecha afirma algo que el sistema no sabe, ya
que la falta de registro no prueba que el protocolo nunca se aplicara, sino que
el sistema no estaba en uso. La regla se corrigió para que un vencimiento
*inferido* no anteceda al alta del animal. Cuando hay un evento registrado, en
cambio, su fecha es evidencia real y el atraso que de ella se deriva se muestra
tal cual.

## 4. Verificación de la aplicación de principio a fin

La aplicación se compiló y se recorrió en un navegador contra el servidor real,
activando el árbol de semántica de Flutter para poder operar la interfaz.

| # | Escenario | Obtenido |
|---|-----------|----------|
| 18 | Inicio de sesión | Acceso concedido, hato vacío |
| 19 | Sincronización | 5 animales, 4 protocolos, 8 alertas, 7 pesajes |
| 20 | Lista del hato | Último peso por animal: 485, 448, 64 y 744 kg |
| 21 | Calendario | 8 tareas con caravana, categoría y plazo |
| 22 | Ficha del animal, pestaña de pesos | Curva y ganancia diaria de +0,90 y +0,96 kg/día |
| 23 | Ficha del animal, pestaña de sanidad | Historial con producto, dosis y responsable |
| 24 | Formulario de pesaje, PT 98 cm y LC 81 cm | 71,8 kg calculados mientras se escribe |
| 25 | Guardado y consolidación del pesaje | 201; el servidor calcula 71,78 kg por su cuenta |

### Tres defectos que solo apareció al recorrer la aplicación

Los tres estaban fuera del alcance de las pruebas unitarias, porque ninguno
reside en una función sino en el encuentro entre dos piezas.

**Identificadores en minúsculas.** La biblioteca que genera los ULID en el
dispositivo los devuelve en minúsculas, mientras que el alfabeto canónico de
Crockford —y la validación del servidor— es en mayúsculas. **Todo registro
creado en el dispositivo se rechazaba al sincronizar**, animales incluidos. Era
el defecto más grave encontrado, porque anulaba la captura sin conexión, que es
la razón de ser del sistema. No se había manifestado antes porque en las
pruebas de la interfaz de programación los identificadores se escribieron a
mano, ya en mayúsculas. Se corrigió normalizando a la forma canónica en el
punto de generación, y se fijó con una prueba que valida contra la misma
expresión que aplica el servidor.

**Código de respuesta del inicio de sesión.** El marco del servidor responde
201 a las peticiones POST por omisión, y el cliente exigía un 200 exacto, de
modo que descartaba como fallida una autenticación válida: era imposible entrar
a la aplicación. Se corrigió en los dos lados: el servidor declara 200, que es
lo que corresponde a una operación que no crea ningún recurso, y el cliente
admite cualquier respuesta satisfactoria.

**Fechas corridas un día.** Las fechas del calendario son días del almanaque y
el servidor las emite como medianoche UTC. El dispositivo las interpretaba como
instantes, y en Bolivia —cuatro horas al oeste de Greenwich— esa conversión las
retrocede un día: una tarea programada para hoy aparecía vencida ayer. Se
separó el tratamiento de los días del de los instantes y se fijó con pruebas
ejecutadas en el huso horario de La Paz.

## 5. Pruebas automatizadas

| Suite | Pruebas | Qué cubre |
|-------|---------|-----------|
| `schaeffer.spec.ts` | 25 | Fórmula, rangos, calibración y ganancia diaria en el servidor |
| `calendario.spec.ts` | 23 | Aritmética de fechas, alcance, programación y cierre de alertas |
| `schaeffer_test.dart` | 25 | La misma fórmula en el dispositivo, con los valores del servidor |
| `pesaje_sanidad_test.dart` | 18 | Persistencia local, historial y cierre de alertas sin conexión |
| `fechas_test.dart` | 13 | Días del almanaque frente a instantes |
| `identificadores_test.dart` | 10 | Forma canónica del ULID y orden cronológico |
| `database_test.dart` | 12 | Inventario local (incremento anterior) |
| **Total** | **126** | |

Las pruebas del calendario reciben la fecha de referencia como parámetro, de
modo que su resultado no depende del día en que se ejecuten: un calendario
comprobado contra la fecha del sistema pasaría hoy y fallaría en seis meses sin
que el código hubiera cambiado.

## 6. Lo que queda fuera de este incremento

- Cifrado de la base local con SQLCipher, exigido por el RNF1: está diseñado y
  la clave se deriva hoy de una constante de compilación; su custodia en el
  almacén seguro del dispositivo corresponde al endurecimiento previsto.
- Calibración de la constante contra la muestra de referencia real, con lo que
  el objetivo del ocho por ciento de error sigue siendo una meta declarada y no
  un resultado medido.
- Reloj lógico híbrido para ordenar cambios concurrentes: la ordenación actual
  usa la marca que fija el servidor al consolidar.
- Comercialización, control reproductivo, evaluación ponderada para la venta y
  panel web consolidado, que son los módulos de los incrementos siguientes.
- El sistema no advierte sobre ganancias de peso implausibles entre dos
  pesajes consecutivos, que sería la señal de una medición mal tomada.
