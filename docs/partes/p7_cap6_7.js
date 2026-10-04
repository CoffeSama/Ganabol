/** CAPÍTULO VI — DESARROLLO, IMPLEMENTACIÓN Y VALIDACIÓN, y
 *  CAPÍTULO VII — EVALUACIÓN DEL PROYECTO. */
const U = require('../univalle');

module.exports = function capitulos6y7() {
  const c = [];

  // ===================== CAPÍTULO VI =====================
  c.push(...U.portadaCapitulo('CAPÍTULO VI', 'DESARROLLO, IMPLEMENTACIÓN Y VALIDACIÓN'));

  c.push(U.p('Este capítulo documenta la construcción del sistema: el plan de trabajo, la preparación del entorno, la implementación de cada incremento, las pruebas ejecutadas y los resultados obtenidos. A diferencia de los capítulos anteriores, que describen lo previsto, este describe lo efectivamente construido y verificado, y distingue de forma explícita entre lo implementado y lo que permanece en estado de diseño.'));

  // --- 6.1 ---
  c.push(U.h1('6.1.', 'Plan de desarrollo'));

  c.push(U.h2('6.1.1.', 'Organización por incrementos'));
  c.push(U.p('El desarrollo se organiza en cuatro incrementos. El primero corresponde a la identidad, los accesos y la parametrización inicial, junto con el motor de sincronización. El segundo abarca el registro y la trazabilidad del inventario bovino y el historial sanitario con alertas. El tercero incorpora la estimación de peso mediante parámetros morfológicos y el mecanismo de evaluación ponderada para la selección de animales. El cuarto comprende el panel web de reportes consolidados. Cada incremento concluye con una sesión de validación con productores del grupo piloto. El Cuadro 6.1 detalla cada incremento con los requisitos que comprende y su estado.'));
  c.push(...U.cuadro('6.1', 'Incrementos del desarrollo y requisitos que comprenden',
    ['Incremento', 'Alcance', 'Requisitos', 'Estado'],
    [
      ['1', 'Identidad, accesos y motor de sincronización', 'RF1, RF3, RF10', 'Implementado y verificado'],
      ['2', 'Inventario, trazabilidad e historial sanitario con alertas', 'RF2, RF5, RF6, RF8, RF13', 'Implementado y verificado'],
      ['3', 'Estimación de peso y evaluación ponderada', 'RF4, RF7, RF14, RF15', 'Estimación de peso implementada; evaluación ponderada y reproducción en diseño'],
      ['4', 'Panel web de reportes consolidados', 'RF9, RF11, RF12', 'Diseñado'],
    ],
    'Elaboración propia, 2026.', [0.1, 0.33, 0.17, 0.4]));
  c.push(U.p('El estado consignado en el cuadro corresponde al momento de redacción del presente documento. Están construidos y verificados mediante pruebas automatizadas el Incremento 1 en su totalidad, el Incremento 2 en su totalidad y la estimación morfométrica del peso, que es el componente del Incremento 3 que concentra el aporte técnico del trabajo. Restan la evaluación ponderada para la venta, el control reproductivo y el panel web consolidado, que cuentan con su diseño completo —requisitos, casos de uso, modelo de datos y arquitectura— documentado en los capítulos anteriores, y cuya construcción corresponde a la continuación del cronograma.'));

  c.push(U.h2('6.1.2.', 'Cronograma de actividades'));
  c.push(U.p('El Cuadro 6.2 ordena las fases del proyecto con sus actividades y el hito que cierra cada una.'));
  c.push(...U.cuadro('6.2', 'Cronograma general del proyecto por fases',
    ['Fase', 'Actividades principales', 'Hito de cierre'],
    [
      ['Planificación y análisis', 'Diagnóstico de campo, levantamiento y especificación de requisitos, modelado', 'Especificación de requisitos aprobada'],
      ['Diseño', 'Arquitectura, modelo de datos, casos de uso, diseño de interfaz', 'Documentos de diseño aprobados'],
      ['Incremento 1', 'Identidad, accesos y motor de sincronización', 'Operación sin conexión verificada'],
      ['Incremento 2', 'Inventario, trazabilidad, sanidad y alertas', 'Inventario completo validado con productores'],
      ['Incremento 3', 'Estimación de peso, reproducción y evaluación ponderada', 'Estimación calibrada dentro del margen objetivo'],
      ['Incremento 4', 'Panel web, reportes y despliegue', 'Sistema completo en entorno de producción'],
      ['Validación y cierre', 'Sesiones de usabilidad, ajustes y documentación final', 'Puntaje de usabilidad igual o superior a 70'],
    ],
    'Elaboración propia, 2026.', [0.2, 0.47, 0.33]));

  c.push(U.h2('6.1.3.', 'Asignación de recursos'));
  c.push(U.p('El proyecto es desarrollado por una sola persona, que asume los roles de analista, diseñador, programador y responsable de pruebas. Esta condición determinó la elección metodológica y explica por qué el aseguramiento de la calidad se apoya en pruebas automatizadas antes que en revisión por pares: no hay un segundo desarrollador que revise el código, de modo que la verificación debe ser ejecutable y repetible.'));
  c.push(U.p('Los recursos materiales comprenden la estación de desarrollo, un dispositivo móvil de gama media como equipo de referencia para las pruebas, una instancia de servidor para el entorno de producción, y los recursos de campo necesarios para las visitas de diagnóstico y validación. Las herramientas de construcción, control de versiones y despliegue se obtienen bajo licencias libres o planes educativos, de modo que el costo de licenciamiento es nulo.'));

  c.push(U.h2('6.1.4.', 'Gestión de riesgos del proyecto'));
  c.push(U.p('El Cuadro 6.3 reúne los riesgos del proyecto con su efecto previsible y la medida adoptada para atenuarlos.'));
  c.push(...U.cuadro('6.3', 'Riesgos del proyecto y medidas de atenuación',
    ['Riesgo', 'Efecto', 'Medida de atenuación'],
    [
      ['Divergencia entre lo documentado y lo construido', 'Pérdida de coherencia del trabajo y de su defensa', 'El esquema implementado reproduce el diseño documentado; las diferencias se corrigen en el código y no en el documento'],
      ['Imposibilidad de reunir al grupo piloto en las fechas previstas', 'Validación tardía o incompleta', 'Validación en el establecimiento del caso de aplicación como respaldo'],
      ['Error de la estimación de peso superior al margen objetivo', 'Pérdida del aporte central del sistema', 'Calibración de la constante contra la muestra de referencia antes de liberar el incremento'],
      ['Pérdida de datos durante la consolidación', 'Pérdida de confianza del usuario en el sistema', 'Idempotencia del reenvío, bajas lógicas y pruebas específicas del escenario'],
      ['Alcance mayor que el tiempo disponible', 'Entrega incompleta', 'Organización por incrementos: cada uno cerrado es entregable por sí mismo'],
    ],
    'Elaboración propia, 2026.', [0.26, 0.24, 0.5]));

  // --- 6.2 ---
  c.push(U.h1('6.2.', 'Preparación del entorno tecnológico'));

  c.push(U.h2('6.2.1.', 'Instalación y configuración de herramientas'));
  c.push(U.p('El entorno de desarrollo comprende el kit de desarrollo de Flutter con su cadena de compilación para dispositivos móviles, el entorno de ejecución de Node.js para el servicio central, y la plataforma de contenedores que levanta el gestor de base de datos y el almacén en memoria. El entorno de desarrollo integrado utilizado es Visual Studio Code con las extensiones correspondientes a Dart y Flutter.'));

  c.push(U.h2('6.2.2.', 'Configuración del repositorio de código'));
  c.push(U.p('El código se versiona en un repositorio único que agrupa los tres componentes del sistema en carpetas separadas: la aplicación móvil, el servicio central y el panel web, junto con la documentación técnica. Esta disposición mantiene sincronizados los cambios que afectan a más de un componente, como una modificación del contrato de la interfaz de programación, que debe reflejarse simultáneamente en el servidor y en sus clientes.'));
  c.push(U.p('Cada incremento se registra mediante confirmaciones con mensaje descriptivo que documenta no solo qué cambió sino por qué, de modo que el historial del control de versiones constituya el registro de las decisiones de implementación y no un mero listado de archivos modificados.'));

  c.push(U.h2('6.2.3.', 'Configuración de la base de datos'));
  c.push(U.p('El esquema de la base de datos se gestiona mediante migraciones versionadas generadas a partir de la definición del modelo. Cada cambio estructural produce un archivo de migración con su marca temporal, que se aplica de forma ordenada y reproducible en todos los entornos. Esta práctica garantiza que el entorno de desarrollo, el de prueba y el de producción tengan exactamente el mismo esquema en todo momento, y que cualquier cambio sea reversible.'));
  c.push(U.p('Se dispone además de un procedimiento de carga inicial que crea un usuario por cada rol previsto, los potreros del establecimiento y un hato reducido de prueba, lo que permite levantar un entorno funcional completo sin ingresar datos a mano.'));

  c.push(U.h2('6.2.4.', 'Configuración de ambientes'));
  c.push(U.p('El entorno completo se levanta mediante contenedores orquestados con un único archivo de composición, que define el gestor de base de datos con su volumen persistente y las variables de configuración necesarias. La configuración sensible —credenciales de la base de datos, secretos de firma de los tokens— se inyecta mediante variables de entorno y queda excluida del control de versiones; el repositorio incluye únicamente un archivo de ejemplo con los nombres de las variables y valores de referencia sin validez en producción.'));

  c.push(U.h2('6.2.5.', 'Políticas de control de versiones'));
  c.push(U.p('El trabajo se organiza sobre una rama principal que mantiene en todo momento un estado funcional. Los artefactos generados —dependencias instaladas, código generado por las herramientas de construcción, compilaciones— se excluyen del repositorio, de modo que este contenga solo las fuentes y no sus productos derivados. Los archivos de configuración que contienen credenciales se excluyen explícitamente.'));

  // --- 6.3 ---
  c.push(U.h1('6.3.', 'Implementación de la solución'));
  c.push(U.p('Se documenta a continuación lo efectivamente construido. El alcance implementado comprende el Incremento 1 completo —identidad, accesos y motor de sincronización—, el Incremento 2 completo —inventario, trazabilidad, historial sanitario y calendario de alertas— y la estimación morfométrica del peso corporal, primer componente del Incremento 3. En términos del modelo de datos, están en servicio ocho de las quince tablas diseñadas; en términos de requisitos funcionales, siete de los quince especificados.'));

  c.push(U.h2('6.3.1.', 'Implementación de la base de datos'));
  c.push(U.p('El esquema implementado reproduce el diseño documentado en la sección 5.3: conserva sus nombres de tabla y de columna, sus dominios categóricos, sus reglas de integridad referencial y sus marcas de baja lógica. Las tablas construidas en esta etapa son las correspondientes al núcleo operativo: usuarios, potreros, animales y la bitácora de sincronización.'));
  c.push(U.p('Los dominios categóricos que el diseño define como restricciones de verificación sobre columnas de texto se implementaron como tipos enumerados del gestor de base de datos. La restricción resultante es la misma, con la ventaja adicional de que queda verificada también en tiempo de compilación por la capa de acceso a datos, lo que impide que un valor fuera de dominio llegue siquiera a la base. El Cuadro 6.4 contrasta el diseño documentado con el esquema efectivamente construido.'));
  c.push(...U.cuadro('6.4', 'Correspondencia entre el diseño documentado y el esquema implementado',
    ['Elemento del diseño', 'Implementación verificada'],
    [
      ['Identificador ULID de veintiséis caracteres como clave primaria', 'Columna de tipo carácter fijo con la longitud exacta'],
      ['Unicidad del número de caravana', 'Restricción de unicidad a nivel de tabla, verificada con una prueba'],
      ['Dominios categóricos de rol, categoría, sexo, fase y estado', 'Tipos enumerados del gestor; un valor fuera de dominio se rechaza con código 400'],
      ['Marca de baja lógica para la propagación de eliminaciones', 'Columna booleana con valor por omisión falso'],
      ['Marca temporal de última modificación fijada por el servidor', 'Columna de fecha y hora con zona, actualizada por la capa de acceso'],
      ['Integridad referencial que protege el historial', 'Restricción de restricción en las relaciones de animal con usuario y con sus eventos'],
      ['Bitácora de sincronización por entidad y operación', 'Tabla de registro con asiento por cada alta, modificación y baja'],
    ],
    'Elaboración propia, 2026, por contraste entre el documento de diseño de base de datos y el esquema construido.',
    [0.45, 0.55]));

  c.push(U.h2('6.3.2.', 'Implementación del servicio central'));
  c.push(U.p('El servicio se organiza en módulos independientes por dominio, conforme al diseño. El módulo de identidad implementa la autenticación con verificación del resumen de la contraseña, la emisión del token de acceso y del token de actualización, y las guardas que resuelven en cada petición si el rol del usuario autoriza la operación. El módulo de inventario implementa el alta, la consulta, la modificación y la baja del animal, junto con el punto de acceso que entrega los cambios producidos desde una marca temporal dada, que es el que alimenta la consolidación del cliente.'));
  c.push(U.p('Dos decisiones de implementación merecen mención porque no son evidentes en el diseño. La primera es que el alta de un animal se resuelve de forma idempotente: el servicio comprueba si el identificador recibido ya existe y, en ese caso, devuelve el registro existente en lugar de rechazar la petición. Sin esta decisión, un reintento tras una respuesta perdida produciría un error que el dispositivo no sabría interpretar. La segunda es que la verificación de la contraseña se ejecuta también cuando el correo no existe, contra un resumen de referencia, de modo que el tiempo de respuesta no revele qué correos están registrados.'));
  c.push(U.p('El registro en la bitácora de sincronización se ejecuta dentro de la misma transacción que produce el cambio, de modo que no pueda existir una modificación sin su asiento correspondiente ni un asiento sin su modificación.'));

  c.push(U.h2('6.3.3.', 'Implementación de la aplicación móvil'));
  c.push(U.p('La aplicación implementa la pantalla de ingreso, el listado del hato con búsqueda por caravana y filtro por fase de manejo, la ficha individual del animal y el formulario de alta y edición. Toda lectura y escritura se realiza contra la base local: ninguna pantalla espera a la red.'));
  c.push(U.p('Las consultas locales se exponen como flujos observables, propiedad que tiene una consecuencia visible para el usuario: cuando la consolidación trae cambios del servidor, la lista se actualiza sola, sin que el productor deba recargar nada ni enterarse de que hubo una sincronización. Esta es la expresión concreta del principio de que la red no debe interrumpir el trabajo.'));
  c.push(U.p('Las decisiones de interfaz derivadas de las condiciones de campo se implementaron de forma literal: los controles se dimensionaron por encima del mínimo recomendado por el sistema de diseño, y ningún estado se distingue únicamente por color, sino que cada indicador cromático va acompañado de su texto.'));

  c.push(U.h2('6.3.4.', 'Implementación del motor de sincronización'));
  c.push(U.p('La consolidación opera en dos sentidos dentro de una misma pasada. Primero envía los registros marcados como pendientes, distinguiendo el alta de la modificación según si la marca de creación coincide con la de última actualización. Después solicita al servicio los cambios producidos desde el cursor de la última consolidación y los incorpora a la base local, marcándolos como ya consolidados.'));
  c.push(U.p('El orden no es arbitrario: el envío precede a la recepción para que, si un animal se modificó tanto en el dispositivo como en el servidor, el servicio conozca ambos cambios antes de que el dispositivo adopte una sola versión. Cuando el servicio responde que la caravana ya existe asociada a otro identificador, el registro se marca como conflicto y sale de la cola de reintentos, porque se trata de una divergencia que solo el usuario puede resolver.'));

  c.push(U.h2('6.3.5.', 'Implementación de los controles de seguridad'));
  c.push(U.p('Las contraseñas se almacenan mediante una función de derivación de clave con sal, conforme exige el requisito no funcional de seguridad. A diferencia de las funciones de resumen clásicas, esta impone un costo de memoria además del de cómputo, lo que encarece sustancialmente los ataques apoyados en hardware dedicado.'));
  c.push(U.p('El control de acceso por rol se implementa de forma declarativa sobre cada punto de acceso, de modo que la autorización no dependa de que el programador recuerde verificarla en el cuerpo de cada operación. El usuario se revalida contra la base en cada petición autenticada, lo que impide que una cuenta dada de baja siga operando con un token aún vigente.'));
  c.push(U.p('El cifrado de la base de datos local en reposo, exigido por el mismo requisito, está previsto en el diseño pero no se encuentra implementado al momento de redacción de este documento. Se consigna como brecha pendiente entre la especificación y la implementación, y su cierre corresponde al endurecimiento previsto para el Incremento 2.'));

  // --- 6.4 ---
  c.push(U.h1('6.4.', 'Configuración y despliegue'));

  c.push(U.h2('6.4.1.', 'Puesta en marcha del entorno'));
  c.push(U.p('El entorno completo se levanta en tres pasos: el arranque de los contenedores que proveen el gestor de base de datos, la aplicación de las migraciones que crean el esquema, y la ejecución de la carga inicial que crea los usuarios de prueba y el hato de referencia. El procedimiento está documentado en el repositorio y se ejecuta sin configuración manual adicional.'));

  c.push(U.h2('6.4.2.', 'Carga inicial de datos'));
  c.push(U.p('La carga inicial crea cuatro usuarios, uno por cada rol previsto, tres potreros y cinco animales que cubren las categorías y fases de manejo del dominio. Su propósito es doble: permitir que cualquier persona levante un entorno funcional para revisar el sistema, y proveer un conjunto de datos conocido contra el cual verificar el comportamiento de las consultas.'));

  c.push(U.h2('6.4.3.', 'Configuración de usuarios y permisos'));
  c.push(U.p('Los cuatro roles del sistema quedan configurados con sus permisos diferenciados. El administrador y el propietario pueden dar de alta y dar de baja animales; el personal de campo puede dar de alta y modificar pero no dar de baja; el veterinario consulta el hato y registra eventos sanitarios, pero no da de alta ni modifica animales. Esta diferenciación se verificó mediante prueba, según consta en la sección siguiente.'));

  // --- 6.5 ---
  c.push(U.h1('6.5.', 'Pruebas de la solución'));
  c.push(U.p('Las pruebas que se documentan a continuación son automatizadas y ejecutables por cualquier persona que disponga del repositorio, condición que hace verificables los resultados reportados.'));

  c.push(U.h2('6.5.1.', 'Pruebas de la interfaz de programación'));
  c.push(U.p('Se ejecutaron nueve escenarios sobre el servicio central en funcionamiento, contra una base de datos real con el esquema y la carga inicial descritos. Los escenarios cubren el camino normal, los casos de error y las propiedades que exige la consolidación diferida. El Cuadro 6.5 recoge los nueve escenarios con su resultado esperado y el obtenido.'));
  c.push(...U.cuadro('6.5', 'Escenarios verificados sobre la interfaz de programación',
    ['N.º', 'Escenario', 'Resultado esperado', 'Obtenido'],
    [
      ['1', 'Ingreso con credenciales válidas', 'Token de acceso y de actualización', 'Correcto'],
      ['2', 'Listado del hato con el potrero asignado', 'Respuesta paginada', 'Correcto'],
      ['3', 'Alta de animal con identificador generado en el dispositivo', 'Registro creado', 'Correcto'],
      ['4', 'Reenvío del mismo identificador tras respuesta perdida', 'Actualización sin duplicar', 'Correcto'],
      ['5', 'Alta con número de caravana ya existente', 'Rechazo por conflicto', 'Rechazado'],
      ['6', 'Alta con categoría fuera del dominio documentado', 'Rechazo por dato inválido', 'Rechazado'],
      ['7', 'Consulta sin credencial', 'Rechazo por falta de autenticación', 'Rechazado'],
      ['8', 'Veterinario intenta dar de alta un animal', 'Rechazo por rol no autorizado', 'Rechazado'],
      ['9', 'Asiento en la bitácora tras un alta', 'Un asiento de operación de alta', 'Correcto'],
    ],
    'Elaboración propia, 2026. Ejecución sobre PostgreSQL 16 con el esquema implementado.',
    [0.06, 0.4, 0.3, 0.24]));
  c.push(U.p('El escenario 4 verifica la propiedad de idempotencia que exige la consolidación diferida: cuando el dispositivo pierde la respuesta del servicio y reintenta el envío, el registro no se duplica porque el identificador se genera en el cliente antes de la transmisión. El escenario 6 verifica que los dominios categóricos del diseño operan como restricción efectiva y no como mera documentación.'));

  c.push(U.h2('6.5.2.', 'Pruebas de la base de datos local'));
  c.push(U.p('Se ejecutaron doce pruebas unitarias sobre la base local, contra un motor en memoria, de modo que cada prueba parte de un estado limpio sin depender del dispositivo ni del servidor. El Cuadro 6.6 las enumera con la propiedad que verifica cada una.'));
  c.push(...U.cuadro('6.6', 'Pruebas unitarias de la base de datos local',
    ['Grupo', 'Caso verificado', 'Propiedad que verifica'],
    [
      ['Registro local', 'El animal registrado queda pendiente de consolidar', 'El alta funciona sin conexión y queda marcada para envío'],
      ['Registro local', 'No admite dos animales con la misma caravana', 'La unicidad opera también en el dispositivo'],
      ['Registro local', 'El reenvío del mismo identificador actualiza', 'Idempotencia del reintento'],
      ['Baja lógica', 'El animal dado de baja sale del hato pero sigue en la base', 'La baja puede propagarse al servidor'],
      ['Consultas', 'Devuelve el hato ordenado por caravana', 'Orden estable del listado'],
      ['Consultas', 'Filtra por fase de manejo', 'Filtro de crianza, destete y engorde'],
      ['Consultas', 'Busca por número de caravana', 'Búsqueda parcial sobre el identificador visible'],
      ['Sincronización', 'Cuenta los registros pendientes', 'Indicador de pendientes de la barra superior'],
      ['Sincronización', 'Un conflicto deja de reintentarse', 'El registro en conflicto sale de la cola'],
      ['Sincronización', 'Guarda y recupera el cursor de consolidación', 'Permite pedir solo lo modificado desde la última pasada'],
      ['Sincronización', 'El cierre de sesión vacía los datos locales', 'Los datos no quedan al alcance del siguiente usuario'],
      ['Potreros', 'Un animal puede quedar sin potrero asignado', 'La relación con potrero admite nulo, según el diseño'],
    ],
    'Elaboración propia, 2026. Ejecución sobre SQLite en memoria: doce de doce correctas.',
    [0.18, 0.42, 0.4]));

  c.push(U.h2('6.5.3.', 'Pruebas de la estimación morfométrica del peso'));
  c.push(U.p('La fórmula de estimación está implementada dos veces: en el dispositivo, porque el pesaje ocurre en el corral sin conexión y el personal necesita el resultado en el momento de tomar la medida; y en el servicio central, porque es este el que custodia la constante en vigor y recalcula al consolidar. Que ambas implementaciones coincidan hasta el segundo decimal se verifica con los mismos siete casos en las dos suites de prueba. La razón es concreta: si una se desviara de la otra, el peso que el productor vio en el campo cambiaría al sincronizar, y el historial de crecimiento del animal dejaría de ser comparable consigo mismo. El Cuadro 6.7 recoge los siete casos empleados en esa verificación cruzada.'));
  c.push(...U.cuadro('6.7', 'Casos de verificación cruzada de la estimación de peso',
    ['Perímetro torácico (cm)', 'Largo corporal (cm)', 'Peso estimado (kg)'],
    [
      ['180', '150', '448,42'],
      ['176', '143', '408,71'],
      ['168', '138', '359,38'],
      ['158', '131', '301,74'],
      ['186', '152', '485,20'],
      ['214', '176', '743,69'],
      ['94', '78', '63,59'],
    ],
    'Elaboración propia, 2026. Los siete casos se afirman de forma idéntica en la suite del dispositivo y en la del servicio central.',
    [0.36, 0.32, 0.32]));
  c.push(U.p('La validación de rangos opera sobre las medidas de entrada y también sobre el resultado, porque una combinación de medidas individualmente plausibles puede arrojar un peso que no lo es: un perímetro de sesenta centímetros con un largo de cincuenta, ambos dentro de su rango, producen una estimación de dieciséis kilogramos, menos que un ternero recién nacido. El sistema la rechaza y solicita repetir la medición.'));
  c.push(U.p('El procedimiento de calibración está implementado y verificado en su mecanismo: sobre una muestra construida a partir de una constante conocida, el ajuste por mínimos cuadrados la recupera y reduce el error medio absoluto por debajo del uno por mil. Conviene señalar con precisión qué significa esto y qué no. Se verifica que el procedimiento de ajuste funciona; no se valida que la estimación cumpla el objetivo del ocho por ciento de error. Esa validación requiere la muestra de referencia real, medida y pesada en campo, y permanece pendiente.'));

  c.push(U.h2('6.5.4.', 'Pruebas del historial sanitario y del calendario'));
  c.push(U.p('El calendario sanitario se verifica con la fecha de referencia como parámetro y no como lectura del reloj del sistema. La razón es que un calendario comprobado contra la fecha de ejecución pasaría hoy y fallaría dentro de seis meses sin que el código hubiera cambiado, y esa clase de prueba da una seguridad falsa. El Cuadro 6.8 recoge los nueve escenarios verificados.'));
  c.push(...U.cuadro('6.8', 'Escenarios verificados del calendario de alertas',
    ['N.º', 'Escenario', 'Propiedad que verifica'],
    [
      ['1', 'Primera generación del calendario sobre el hato', 'Las alertas se derivan del protocolo, de la categoría del animal y de su historial'],
      ['2', 'Segunda generación consecutiva, sin cambios de por medio', 'Idempotencia: la operación puede invocarse sin coordinación y no acumula duplicados'],
      ['3', 'Registro del evento que cumple un protocolo', 'La tarea sale de la bandeja de pendientes y queda como atendida'],
      ['4', 'Dos protocolos de vacunación sobre el mismo animal', 'Aplicar uno no da por cumplido el otro'],
      ['5', 'Evento registrado sin indicar protocolo', 'Se cierran las tareas del mismo tipo, que es lo más fiel que puede inferirse'],
      ['6', 'Vencimiento del ciclo siguiente, fuera de la ventana', 'El evento de hoy no lo da por cumplido'],
      ['7', 'Registro de un evento en un animal del hato', 'No altera las tareas de los demás animales'],
      ['8', 'Baja de un evento ya registrado', 'Las tareas que había cerrado vuelven a quedar pendientes'],
      ['9', 'Cierre de la tarea sin conexión', 'El dispositivo la marca de inmediato y el servicio confirma al consolidar'],
    ],
    'Elaboración propia, 2026.', [0.06, 0.4, 0.54]));
  c.push(U.p('El escenario 9 recoge una decisión de diseño que el entorno impone. Si el cierre de una tarea requiriera confirmación del servidor, el personal de campo seguiría viendo como pendiente una vacuna que acaba de aplicar, y la aplicaría dos veces. El dispositivo cierra la tarea en el momento y el servicio confirma el mismo cierre al consolidar el evento, aplicando la misma regla sobre los mismos datos.'));

  c.push(U.h2('6.5.5.', 'Verificación de la aplicación de principio a fin'));
  c.push(U.p('Además de las pruebas automatizadas, la aplicación se compiló y se recorrió contra el servicio central en funcionamiento: ingreso, sincronización, consulta del hato, calendario de alertas, ficha del animal con su historial de pesos y su historial sanitario, y registro de un pesaje nuevo con su consolidación. Esta verificación no sustituye a las pruebas automatizadas, pero alcanza una clase de defecto que aquellas no pueden detectar, porque no reside en ninguna función sino en el encuentro entre dos piezas que fueron escritas por separado y comprobadas por separado.'));

  c.push(U.h2('6.5.6.', 'Verificación estática del código'));
  c.push(U.p('El análisis estático de la aplicación móvil se ejecuta sobre el conjunto de reglas recomendado para el lenguaje, ampliado con reglas adicionales de estilo y de tipado explícito. El análisis no reporta advertencias ni errores. El servicio central se compila con verificación estricta de tipos y nulidad, de modo que una categoría entera de errores queda descartada antes de la ejecución.'));

  c.push(U.h2('6.5.4.', 'Pruebas pendientes'));
  c.push(U.p('Las pruebas de rendimiento bajo carga concurrente, las de seguridad sobre los riesgos del OWASP Top 10 y las de aceptación con el grupo piloto corresponden a los incrementos cuya construcción está en curso, y se ejecutarán conforme al diseño establecido en la sección 5.7.'));

  // --- 6.6 ---
  c.push(U.h1('6.6.', 'Resultados de las pruebas'));

  c.push(U.h2('6.6.1.', 'Resultados funcionales'));
  c.push(U.p('La verificación comprende ciento veintiséis pruebas automatizadas —cuarenta y ocho sobre el servicio central y setenta y ocho sobre la aplicación— y veinticinco escenarios ejecutados sobre el sistema en funcionamiento, todos con el resultado esperado. La operación sin conexión quedó verificada en su propiedad esencial: un registro realizado sin red queda disponible de inmediato para consulta en el mismo dispositivo y se consolida sin pérdida ni duplicación cuando la conexión se restablece. La estimación de peso quedó verificada en su propiedad crítica: el valor que el dispositivo calcula en el campo y el que el servicio recalcula al consolidar coinciden hasta el segundo decimal.'));

  c.push(U.h2('6.6.2.', 'Incidencias encontradas y correcciones aplicadas'));
  c.push(U.p('El proceso de verificación reveló seis incidencias que conviene documentar, porque el valor de una prueba reside precisamente en lo que descubre. Las tres primeras surgieron durante la construcción del Incremento 1; las tres restantes, al recorrer la aplicación de principio a fin, y ninguna de ellas podría haber aparecido en una prueba unitaria, porque no residen en una función sino en el encuentro entre dos piezas. El Cuadro 6.9 las documenta con su forma de detección y su resolución.'));
  c.push(...U.cuadro('6.9', 'Incidencias detectadas durante la verificación y su resolución',
    ['Incidencia', 'Detección', 'Resolución'],
    [
      ['El cursor de sincronización se recupera de la base expresado en hora local y no en tiempo universal', 'Prueba unitaria de recuperación del cursor', 'El instante es el mismo y la consulta de cambios ya convertía a tiempo universal antes de enviar; se ajustó la prueba para comparar el instante y no la zona horaria'],
      ['La capa de persistencia del navegador no arrancaba por falta de la configuración de sus archivos de ejecución', 'Carga de la aplicación en navegador', 'Se declaró de forma explícita la configuración requerida; sin ella la base no inicia y la aplicación falla al abrir'],
      ['El esquema construido había introducido una entidad de agrupación que el diseño documentado no contempla', 'Contraste entre el documento de diseño de base de datos y el esquema implementado', 'Se alineó la implementación al diseño documentado: se sustituyó la entidad por la que define el diseño y se ajustaron los dominios categóricos, la unicidad de la caravana y la función de resumen de las contraseñas'],
      ['Los identificadores generados en el dispositivo se emitían en minúsculas, mientras que el servicio valida el alfabeto canónico en mayúsculas', 'Consolidación de un pesaje registrado desde la aplicación', 'Todo registro creado en el dispositivo era rechazado al sincronizar. Se normalizó el identificador a su forma canónica en el punto de generación y se fijó la regla con una prueba que valida contra la misma expresión que aplica el servicio'],
      ['El servicio respondía a la autenticación con el código que su marco asigna por omisión a las peticiones de creación, y el cliente exigía el código exacto de consulta satisfactoria', 'Ingreso a la aplicación contra el servicio real', 'Era imposible iniciar sesión. Se corrigió en ambos extremos: el servicio declara el código que corresponde a una operación que no crea ningún recurso, y el cliente admite cualquier respuesta satisfactoria'],
      ['Las fechas del calendario, emitidas como día universal, se interpretaban en el dispositivo como instantes', 'Recorrido del calendario de alertas en la aplicación', 'En Bolivia, cuatro horas al oeste del meridiano de referencia, la conversión retrocedía la fecha un día y una tarea programada para hoy aparecía vencida ayer. Se separó el tratamiento de los días del almanaque del de los instantes, y las pruebas se ejecutan en el huso horario de La Paz'],
    ],
    'Elaboración propia, 2026.', [0.3, 0.22, 0.48]));
  c.push(U.p('La cuarta incidencia es la de mayor gravedad funcional. Anulaba por completo la captura sin conexión, que es la razón de ser del sistema, y no se había manifestado en ninguna de las pruebas anteriores porque en los escenarios de la interfaz de programación los identificadores se escribieron a mano, ya en la forma canónica. Es el ejemplo más claro de por qué una suite de pruebas unitarias, por extensa que sea, no sustituye a la verificación del sistema completo: cada pieza cumplía su contrato y el defecto estaba en que ambas entendían el contrato de forma distinta.'));
  c.push(U.p('La tercera incidencia es la de mayor relevancia metodológica. El código del Incremento 1 se construyó antes de disponer de los documentos técnicos de diseño, e introdujo un modelo de agrupación que el diseño nunca tuvo. La divergencia habría aparecido en cualquier revisión que contrastara el documento con el repositorio. La corrección se aplicó sobre el código y no sobre el documento, criterio que corresponde cuando el diseño ha sido revisado y aprobado.'));

  c.push(U.h2('6.6.3.', 'Cumplimiento de requisitos'));
  c.push(U.p('El Cuadro 6.10 consigna el estado de cada requisito funcional junto con la evidencia que lo respalda.'));
  c.push(...U.cuadro('6.10', 'Estado de cumplimiento de los requisitos funcionales',
    ['Requisito', 'Estado', 'Evidencia'],
    [
      ['RF1. Gestionar usuarios y roles', 'Implementado y verificado', 'Escenarios 1, 7 y 8 de la interfaz de programación'],
      ['RF2. Registrar y administrar el ganado', 'Implementado y verificado', 'Escenarios 2 a 6; pruebas de registro local'],
      ['RF3. Operar y registrar sin conexión', 'Implementado y verificado', 'Pruebas de registro local y de baja lógica'],
      ['RF10. Sincronizar los datos y resolver conflictos', 'Implementado y verificado', 'Escenarios 4 y 9; pruebas del grupo de sincronización'],
      ['RF4. Estimar el peso por método morfométrico', 'Implementado y verificado; calibración pendiente', 'Verificación cruzada de los siete casos del Cuadro 6.7'],
      ['RF5. Registrar eventos sanitarios', 'Implementado y verificado', 'Pruebas del historial sanitario local y del servicio'],
      ['RF13. Gestionar alertas del calendario', 'Implementado y verificado', 'Nueve escenarios del Cuadro 6.8'],
      ['RF8. Registrar movimientos y ubicación', 'Parcial: la ubicación en potrero está implementada; el historial de movimientos no', 'Prueba del grupo de potreros'],
      ['RF6, RF7, RF9, RF11, RF12, RF14, RF15', 'Diseñado, no implementado', 'Especificación y modelado de los Capítulos IV y V'],
    ],
    'Elaboración propia, 2026.', [0.3, 0.3, 0.4]));

  c.push(U.h2('6.6.4.', 'Cumplimiento de los requisitos no funcionales'));
  c.push(U.p('Los requisitos no funcionales admiten un tratamiento distinto del de los funcionales. Un requisito funcional está construido o no lo está; uno no funcional puede estar construido en parte, y su verificación suele exigir una medición que no se agota en una prueba automatizada. El Cuadro 6.11 consigna el estado de cada uno con el mismo criterio que el resto del capítulo: se distingue lo verificado de lo que solo está diseñado, y se nombra la brecha cuando existe.'));
  c.push(...U.cuadro('6.11', 'Estado de cumplimiento de los requisitos no funcionales',
    ['Requisito', 'Estado', 'Evidencia o brecha'],
    [
      ['RNF1. Seguridad', 'Parcial',
       'Construidos y verificados el resumen de contraseña con argon2id y sal y la verificación de rol por función. Pendientes el cifrado de la base local con SQLCipher, el factor local de apertura y la revocación remota de sesiones.'],
      ['RNF2. Usabilidad', 'No verificado',
       'Las decisiones de interfaz derivadas de las condiciones de campo están implementadas. La puntuación de la escala de usabilidad exige las sesiones con el grupo piloto, que no se han realizado.'],
      ['RNF3. Eficiencia de desempeño', 'No verificado',
       'La estimación del peso se calcula en el dispositivo sin consultar al servidor, de modo que no depende de la red. El tiempo de registro no se ha medido sobre el dispositivo de referencia.'],
      ['RNF4. Mantenibilidad', 'Parcial',
       'La separación en capas y por módulos está construida, y el análisis estático no reporta advertencias. La métrica prevista supone una revisión de código por un tercero, que la condición de autor único no permite.'],
      ['RNF5. Fiabilidad e integridad', 'Parcial',
       'Verificadas la operación sin conexión, la idempotencia del reenvío y la ejecución transaccional de las operaciones que afectan a varias tablas. Pendiente la copia local cifrada periódica.'],
      ['RNF6. Compatibilidad', 'No verificado',
       'La aplicación compila para las plataformas de destino. La ejecución sobre los dispositivos de referencia del establecimiento no se ha realizado.'],
      ['RNF7. Portabilidad', 'Parcial',
       'Una sola base de código para las plataformas de destino, y el entorno del servicio definido por contenedores. Verificada la compilación para navegador; pendiente la verificación sobre la plataforma móvil de destino.'],
      ['RNF8. Accesibilidad', 'Parcial',
       'El tema de la aplicación fija un objetivo táctil de cincuenta y seis píxeles, por encima del mínimo del nivel AA, y un contraste alto para el uso con sol directo. La verificación formal de contraste frente a los criterios de la pauta está pendiente.'],
    ],
    'Elaboración propia, 2026, conforme a los requisitos especificados en la sección 4.5.',
    [0.26, 0.16, 0.58]));
  c.push(U.p('Conviene señalar que el RNF1 enumera cuatro medidas de seguridad y solo dos están construidas. La especificación no se modifica para hacerla coincidir con lo implementado: fue revisada y aprobada, y rebajar un requisito para poder declararlo cumplido invertiría la relación entre el diseño y el código que este proyecto sostiene. Las tres medidas pendientes quedan consignadas como brecha, y su construcción corresponde al cierre del incremento en curso.'));

  // --- 6.7 ---
  c.push(U.h1('6.7.', 'Validación de la solución'));

  c.push(U.h2('6.7.1.', 'Validación técnica'));
  c.push(U.p('La validación técnica alcanzada al momento de redacción consiste en la verificación automatizada y el recorrido de la aplicación documentados en la sección 6.5. Su alcance es el del código construido, y no permite afirmar nada sobre los componentes que permanecen en estado de diseño. Corresponde señalar en particular que la precisión de la estimación de peso no está validada: lo verificado es que la fórmula se aplica de forma consistente en ambos extremos del sistema y que el procedimiento de calibración funciona, no que el peso estimado se aproxime al real dentro del margen declarado.'));

  c.push(U.h2('6.7.2.', 'Validación con usuarios'));
  c.push(U.p('Las sesiones de validación con el grupo piloto se ejecutan al cierre de cada incremento conforme al protocolo establecido en la sección 3.6.3. El puntaje de usabilidad y los resultados de las tareas asignadas se incorporarán al presente capítulo conforme las sesiones se realicen.'));

  c.push(U.h2('6.7.3.', 'Comparación con la situación inicial'));
  c.push(U.p('El contraste entre la situación diagnosticada y la situación alcanzada se realizará sobre los indicadores definidos en el Cuadro 3.2, una vez completadas las sesiones de validación. El indicador de mayor interés es el error de la estimación de peso frente al pesaje de referencia, por ser la funcionalidad que el propio diagnóstico identificó como de mayor impacto económico.'));

  // ===================== CAPÍTULO VII =====================
  c.push(...U.portadaCapitulo('CAPÍTULO VII', 'EVALUACIÓN DEL PROYECTO'));

  c.push(U.p('Este capítulo evalúa el proyecto respecto a sus objetivos, la calidad de la solución construida, su impacto previsto, sus costos y los riesgos que permanecen abiertos. La evaluación distingue de forma explícita entre lo verificado y lo proyectado, criterio sin el cual la valoración perdería su valor.'));

  // --- 7.1 ---
  c.push(U.h1('7.1.', 'Evaluación del cumplimiento de objetivos'));

  c.push(U.h2('7.1.1.', 'Objetivo específico 1: analizar los requerimientos'));
  c.push(U.p('Cumplido. El análisis se sustentó en un instrumento aplicado a veintitrés productores, entrevistas a tres especialistas del sector y observación directa en terreno. Su producto es la especificación del Capítulo IV: diecisiete necesidades de usuario, quince requisitos funcionales con criterio de verificación, ocho requisitos no funcionales según el modelo de calidad adoptado, nueve procesos de negocio documentados y la matriz de trazabilidad que vincula cada necesidad con el requisito que la satisface.'));

  c.push(U.h2('7.1.2.', 'Objetivo específico 2: diseñar la arquitectura y el modelo de datos'));
  c.push(U.p('Cumplido. El diseño del Capítulo V comprende la arquitectura de la solución con su justificación frente a las restricciones del entorno, la estrategia de operación sin conexión con sus cuatro decisiones fundamentales, el modelo de datos desde el plano conceptual hasta el físico con su diccionario y sus reglas de integridad, el diseño de interfaz derivado de las condiciones de campo y el diseño de los controles de seguridad.'));

  c.push(U.h2('7.1.3.', 'Objetivo específico 3: construir los módulos'));
  c.push(U.p('Cumplido parcialmente. Se construyeron y verificaron los módulos de identidad y accesos, de inventario y trazabilidad, el motor de sincronización, el historial sanitario con su calendario de alertas y la estimación morfométrica del peso. Ello constituye los Incrementos 1 y 2 completos y el componente central del Incremento 3. Los módulos de reproducción, comercialización, evaluación ponderada para la venta y reportes consolidados cuentan con su diseño completo y su construcción corresponde a la continuación del cronograma.'));
  c.push(U.p('El avance alcanzado cubre precisamente los componentes de mayor riesgo técnico del sistema: la operación sin conexión y la consolidación de datos divergentes. Los módulos restantes, aunque más numerosos, presentan una complejidad técnica menor por apoyarse sobre la infraestructura ya construida y verificada.'));

  c.push(U.h2('7.1.4.', 'Objetivo específico 4: evaluar el sistema'));
  c.push(U.p('Cumplido parcialmente. La evaluación funcional y técnica del código construido está ejecutada y documentada en la sección 6.5, con ciento veintiséis pruebas automatizadas y veinticinco escenarios verificados sobre el sistema en funcionamiento. La evaluación de usuario mediante la escala de usabilidad y la validación de la precisión de la estimación de peso corresponden a los incrementos en curso.'));

  // --- 7.2 ---
  c.push(U.h1('7.2.', 'Evaluación de la calidad de la solución'));
  c.push(U.p('La evaluación se estructura según las ocho características del modelo de calidad de producto de la norma ISO/IEC 25010, de modo que la valoración se apoye en un marco externo y no en el criterio del desarrollador. El Cuadro 7.1 presenta esa evaluación característica por característica.'));
  c.push(...U.cuadro('7.1', 'Evaluación de la calidad según el modelo ISO/IEC 25010',
    ['Característica', 'Estado', 'Evidencia o brecha'],
    [
      ['Adecuación funcional', 'Verificada en el alcance construido', 'Ciento veintiséis pruebas automatizadas y veinticinco escenarios ejecutados con el resultado esperado'],
      ['Eficiencia de desempeño', 'No evaluada', 'Las pruebas de carga corresponden al incremento en curso'],
      ['Compatibilidad', 'Parcial', 'La aplicación compila y se ejecuta para móvil, escritorio y navegador'],
      ['Usabilidad', 'No evaluada con usuarios', 'Las decisiones de interfaz están implementadas; falta la medición con el grupo piloto'],
      ['Fiabilidad', 'Verificada en el alcance construido', 'Idempotencia, bajas lógicas y cursor de consolidación verificados por prueba'],
      ['Seguridad', 'Parcial', 'Resumen con función de derivación de clave y control por rol verificados; quedan pendientes el cifrado de la base local, el factor local de apertura y la revocación remota de sesiones'],
      ['Mantenibilidad', 'Verificada', 'Separación en capas, análisis estático sin advertencias y pruebas automatizadas'],
      ['Portabilidad', 'Verificada', 'Entorno definido por contenedores; base de código única para las plataformas de destino'],
    ],
    'Elaboración propia, 2026, conforme al modelo de calidad de producto de la norma ISO/IEC 25010.',
    [0.22, 0.25, 0.53]));

  // --- 7.3 ---
  c.push(U.h1('7.3.', 'Evaluación de impacto'));

  c.push(U.h2('7.3.1.', 'Impacto técnico'));
  c.push(U.p('El proyecto documenta una arquitectura con funcionamiento sin conexión y resolución de conflictos diferenciada por riesgo de entidad, aplicada a un dominio donde la pérdida o la duplicación de un registro tiene consecuencias económicas concretas. La decisión de no resolver automáticamente los conflictos sobre pesos y eventos sanitarios es trasladable a cualquier sistema que maneje información cuya alteración silenciosa resulte inaceptable.'));

  c.push(U.h2('7.3.2.', 'Impacto operativo'));
  c.push(U.p('El sistema sustituye el registro en papel por un registro digital que no depende de la señal, y entrega al productor, en el momento de decidir una venta, una estimación de peso fundada en medidas y no en apreciación visual. El cambio operativo más relevante no es la digitalización en sí, sino que la información pase a estar disponible en el momento en que se la necesita, que es precisamente lo que el registro manual no logra.'));

  c.push(U.h2('7.3.3.', 'Impacto económico'));
  c.push(U.p('El impacto económico previsto proviene de corregir la asimetría de información en la negociación de venta, que el diagnóstico identificó en el cincuenta y cinco por ciento de los consultados. Su magnitud efectiva solo podrá establecerse una vez completada la validación de la precisión de la estimación y transcurrido un ciclo productivo con el sistema en uso, de modo que no se formula aquí una cifra que no estaría sustentada.'));

  c.push(U.h2('7.3.4.', 'Impacto social'));
  c.push(U.p('La herramienta reduce la dependencia del productor respecto de la visita técnica para decisiones que puede tomar con información propia: cuándo vacunar, qué animal está en condición de venderse, qué historial tiene un animal enfermo. En un sector donde el acceso a servicios veterinarios es irregular, esa autonomía tiene valor por sí misma, con independencia del resultado económico.'));

  c.push(U.h2('7.3.5.', 'Impacto institucional'));
  c.push(U.p('El trabajo aporta a la universidad documentación sobre un caso de aplicación poco explorado en la literatura nacional, y deja un sistema cuya arquitectura admite extensión hacia la integración con el registro nacional de identificación ganadera, según se señala en las recomendaciones.'));

  // --- 7.4 ---
  c.push(U.h1('7.4.', 'Análisis de costos'));

  c.push(U.h2('7.4.1.', 'Estructura de costos'));
  c.push(U.p('El componente predominante del costo del proyecto es el tiempo de desarrollo, que corresponde al trabajo del postulante. Los costos de infraestructura se limitan a la instancia de servidor del entorno de producción y al nombre de dominio. Los costos de campo comprenden el transporte y los viáticos de las visitas de diagnóstico y validación, y los materiales necesarios para las mediciones de referencia.'));

  c.push(U.h2('7.4.2.', 'Costos de licencias'));
  c.push(U.p('El costo de licenciamiento es nulo. El stack completo —marco de desarrollo móvil, marco del servicio central, gestor de base de datos, almacén en memoria, mapeador de datos y plataforma de contenedores— se compone de herramientas de código abierto. Las herramientas de control de versiones y de encuesta empleadas se usaron bajo planes gratuitos o educativos.'));
  c.push(U.p('Esta condición no es solo una ventaja presupuestaria del proyecto académico: determina que el sistema pueda mantenerse y extenderse sin incurrir en dependencias de proveedores comerciales, lo que resulta relevante para su eventual transferencia a organizaciones ganaderas.'));

  c.push(U.h2('7.4.3.', 'Costos de mantenimiento'));
  c.push(U.p('El mantenimiento previsto comprende la operación del servidor, la actualización de las dependencias del sistema y la atención de los defectos que el uso revele. La arquitectura adoptada reduce el costo de los dos últimos: la separación en capas acota el alcance de cualquier cambio, y las pruebas automatizadas permiten verificar que una actualización no rompió el comportamiento existente sin necesidad de revisión manual completa.'));

  c.push(U.h2('7.4.4.', 'Relación costo-beneficio'));
  c.push(U.p('El beneficio previsto se concentra en la corrección del error de estimación en la venta y en la reducción de las pérdidas sanitarias por falta de historial. El costo de adopción para el productor es prácticamente nulo, porque el sistema opera sobre el equipamiento que ya posee y no requiere conectividad ni licencia. Esa asimetría entre beneficio esperado y costo de adopción es la que sostiene la viabilidad de la propuesta más allá del ámbito académico.'));

  // --- 7.5 ---
  c.push(U.h1('7.5.', 'Riesgos residuales y sostenibilidad'));

  c.push(U.h2('7.5.1.', 'Riesgos no resueltos'));
  c.push(U.p('El Cuadro 7.2 reúne los riesgos que permanecen abiertos al cierre de este documento, con su efecto y el tratamiento previsto.'));
  c.push(...U.cuadro('7.2', 'Riesgos que permanecen abiertos al cierre del presente documento',
    ['Riesgo', 'Estado', 'Tratamiento previsto'],
    [
      ['Cifrado de la base de datos local no implementado', 'Abierto', 'Cierre previsto en el endurecimiento del Incremento 2'],
      ['Precisión de la estimación de peso no validada contra muestra de referencia', 'Abierto', 'Calibración y validación con los treinta animales de la muestra prevista'],
      ['Usabilidad no medida con usuarios reales', 'Abierto', 'Sesiones de validación al cierre de cada incremento'],
      ['Comportamiento bajo carga concurrente no evaluado', 'Abierto', 'Pruebas de carga conforme al diseño de la sección 5.7.4'],
      ['Dependencia de que el usuario registre con regularidad', 'Inherente', 'Se atenúa con el diseño de registro mínimo, no se elimina'],
    ],
    'Elaboración propia, 2026.', [0.36, 0.14, 0.5]));

  c.push(U.h2('7.5.2.', 'Dependencias tecnológicas'));
  c.push(U.p('El sistema depende de la continuidad de las tecnologías de código abierto que lo componen. El riesgo se atenúa por la madurez y la amplitud de adopción de cada una, y por la separación en capas, que acota el impacto de sustituir cualquiera de ellas: un cambio de gestor de base de datos afectaría a la capa de acceso a datos y no a la lógica del dominio.'));

  c.push(U.h2('7.5.3.', 'Escalabilidad futura'));
  c.push(U.p('El servicio central no mantiene estado en memoria entre peticiones, propiedad que permite levantar varias instancias tras un balanceador sin modificar el código. El crecimiento del volumen de datos se atiende mediante los índices previstos en el diseño de la base. Ninguna de estas capacidades se ejercita en el alcance del proyecto, pero ambas quedan disponibles sin rediseño.'));

  c.push(U.h2('7.5.4.', 'Sostenibilidad de la solución'));
  c.push(U.p('La sostenibilidad del sistema más allá del período académico depende de que exista quien lo mantenga. La ausencia de costos de licenciamiento, la definición del entorno mediante contenedores y la existencia de pruebas automatizadas reducen la barrera de entrada para quien asuma esa continuidad. La recomendación correspondiente se formula al cierre del documento.'));

  return c;
};
