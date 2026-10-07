/** CAPÍTULO III — MARCO METODOLÓGICO. */
const U = require('../univalle');

module.exports = function capitulo3() {
  const c = [];
  c.push(...U.portadaCapitulo('CAPÍTULO III', 'MARCO METODOLÓGICO'));

  c.push(U.p('Este capítulo describe cómo se condujo la investigación y cómo se organizó la construcción del sistema. Establece el enfoque y el tipo de investigación, el diseño muestral y los instrumentos de recolección, la metodología de desarrollo con sus fases, los métodos de evaluación y las consideraciones éticas que rigen el tratamiento de la información recogida en campo.'));

  // --- 3.1 ---
  c.push(U.h1('3.1.', 'Enfoque de investigación'));

  c.push(U.h2('3.1.1.', 'Enfoque mixto'));
  c.push(U.p('El proyecto adopta un enfoque mixto, que combina componentes cualitativos y cuantitativos. El componente cualitativo busca comprender cómo trabaja el productor, qué necesita realmente y qué tan dispuesto está a cambiar una práctica que lleva años ejecutando de cierta manera. Esa comprensión no se obtiene con un número: requiere entrevistas, observación directa en terreno y criterio para interpretar lo observado.'));
  c.push(U.p('El componente cuantitativo aporta las mediciones que permiten verificar si el sistema cumple lo que promete: el error de la estimación de peso frente a una referencia, los tiempos de registro, el porcentaje de alertas generadas correctamente y el puntaje de usabilidad obtenido en la validación con usuarios.'));

  c.push(U.h2('3.1.2.', 'Justificación del enfoque seleccionado'));
  c.push(U.p('Un enfoque puramente cuantitativo no habría permitido descubrir las condiciones de uso que terminaron determinando el diseño de la interfaz: que el productor opera el dispositivo con una mano mientras sostiene al animal con la otra, bajo sol directo y con la pantalla sucia. Un enfoque puramente cualitativo, en cambio, no habría permitido afirmar que la estimación de peso es suficientemente precisa para la decisión de venta. La combinación es necesaria porque las dos preguntas del proyecto —qué necesita el productor y si el sistema funciona— son de naturaleza distinta.'));

  // --- 3.2 ---
  c.push(U.h1('3.2.', 'Tipo de investigación'));

  c.push(U.h2('3.2.1.', 'Investigación aplicada'));
  c.push(U.p('La investigación es aplicada: su objetivo no es generar teoría sino construir una solución a un problema concreto y verificable, identificado en un contexto productivo determinado.'));

  c.push(U.h2('3.2.2.', 'Investigación tecnológica'));
  c.push(U.p('Es además tecnológica, en tanto el producto del trabajo es un artefacto de software cuyo diseño requiere resolver problemas de ingeniería —la operación sin conexión, la consolidación de datos divergentes, la estimación morfométrica— que no se resuelven por aplicación directa de conocimiento existente.'));

  c.push(U.h2('3.2.3.', 'Investigación descriptiva'));
  c.push(U.p('Es descriptiva en su fase inicial, porque antes de diseñar cualquier cosa fue necesario caracterizar la situación actual: cómo gestiona el productor su hato, con qué limitaciones y en qué condiciones trabaja. Esa caracterización, documentada en el Capítulo IV, es la base empírica de todas las decisiones posteriores.'));

  c.push(U.h2('3.2.4.', 'Investigación proyectiva o de desarrollo'));
  c.push(U.p('Es proyectiva porque el resultado final es una propuesta de solución que surge directamente del diagnóstico y no de supuestos del desarrollador. Cada funcionalidad del sistema es trazable a una necesidad relevada en campo, según documenta la matriz de trazabilidad del Capítulo IV.'));

  // --- 3.3 ---
  c.push(U.h1('3.3.', 'Métodos de investigación'));
  c.push(U.p('El trabajo articula cuatro métodos, cada uno aplicado a un momento distinto del proceso. Separarlos importa porque cada fase del proyecto exige una forma de razonar diferente, y emplear la misma en todas produce o un marco teórico sin anclaje empírico o un diseño sin fundamento.'));

  c.push(U.h2('3.3.1.', 'Análisis documental'));
  c.push(U.p('Se aplica en la construcción del marco teórico y en la revisión del estado del arte de las soluciones existentes. Su resultado es la identificación de los aportes de la literatura y, sobre todo, de sus vacíos: la estimación morfométrica del peso está documentada desde hace décadas, pero no su incorporación a una herramienta que opere sin conexión en manos del propio productor.'));

  c.push(U.h2('3.3.2.', 'Inductivo-deductivo'));
  c.push(U.p('Se aplica en la formulación del problema y de los objetivos. La fase inductiva parte de lo particular: el diagnóstico aplicado a productores reales, las visitas a las explotaciones y la observación de cómo registran o dejan de registrar su información. De ahí se generalizan las limitaciones del proceso actual. La fase deductiva recorre el camino inverso: toma principios establecidos —la arquitectura con funcionamiento sin conexión, las fórmulas morfométricas validadas, los patrones de apoyo a la decisión— y los aplica al caso específico.'));

  c.push(U.h2('3.3.3.', 'Enfoque de sistemas'));
  c.push(U.p('Se aplica en el análisis y el diseño de la solución. Considera la interacción entre los componentes —aplicación móvil, servicio central y panel web—, la información que fluye entre ellos y los actores externos que intervienen en cada uno. Es el método que obliga a tratar la consolidación de datos como un problema del conjunto y no de una de las partes.'));

  c.push(U.h2('3.3.4.', 'Modelación'));
  c.push(U.p('Se aplica en la representación del sistema antes de construirlo: los diagramas de proceso, de casos de uso, de clases, de secuencia y el modelo de datos del Capítulo V. Su función no es ilustrar lo ya decidido sino obligar a decidir, porque una ambigüedad que la prosa tolera, un diagrama la hace evidente.'));

  c.push(U.h1('3.4.', 'Fuentes de información'));
  c.push(U.p('Las fuentes primarias corresponden a las entrevistas, la observación directa y la encuesta aplicadas a productores de las asociaciones del departamento, así como a los datos recogidos durante la validación piloto. Son las que sostienen el diagnóstico y, con él, la justificación de cada requisito.'));
  c.push(U.p('Las fuentes secundarias comprenden las publicaciones científicas sobre estimación morfométrica del peso bovino, la normativa del Servicio Nacional de Sanidad Agropecuaria e Inocuidad Alimentaria, las estadísticas del Instituto Nacional de Estadística y de la Federación de Ganaderos de Santa Cruz, y la documentación técnica sobre desarrollo móvil y arquitecturas con funcionamiento sin conexión.'));

  c.push(U.h1('3.5.', 'Diseño de investigación'));

  c.push(U.h2('3.5.1.', 'Unidad de análisis'));
  c.push(U.p('La unidad de análisis es la explotación ganadera bovina tradicional del departamento de Santa Cruz, orientada a las etapas de crianza, destete y engorde, y en particular el proceso de gestión de la información productiva y sanitaria dentro de ella.'));

  c.push(U.h2('3.5.2.', 'Población y muestra'));
  c.push(U.p('La población objetivo está constituida por los productores ganaderos del departamento de Santa Cruz dedicados a explotaciones tradicionales orientadas a las etapas de crianza, destete y engorde de ganado bovino. Por la naturaleza dispersa de la población y la inexistencia de un marco muestral oficial actualizado, se aplica un muestreo no probabilístico de tipo intencional para las distintas técnicas. El Cuadro 3.1 detalla la muestra de cada una y el criterio con que fue seleccionada.'));
  c.push(...U.cuadro('3.1', 'Muestras por técnica de recolección y criterio de selección',
    ['Técnica', 'Muestra', 'Criterio de selección'],
    [
      ['Encuesta de diagnóstico', 'Veintitrés productores de Pailón, Abapó y San Julián', 'Accesibilidad y representatividad del perfil productivo objetivo'],
      ['Entrevista semiestructurada', 'Tres especialistas del sector: dos veterinarios y un técnico del SENASAG', 'Rol institucional y conocimiento técnico del calendario sanitario'],
      ['Validación piloto', 'Entre cinco y diez productores', 'Disponibilidad y disposición a participar en las sesiones al cierre de cada incremento'],
      ['Prueba de precisión del peso', 'Treinta animales de las cuatro razas en estudio, distribuidos por categoría', 'Cobertura de las razas y categorías presentes en el hato'],
    ],
    'Elaboración propia, 2026.', [0.25, 0.3, 0.45]));

  c.push(U.h2('3.5.3.', 'Variables y categorías de análisis'));
  c.push(U.p('El diagnóstico organiza la información en cinco dimensiones: el perfil del productor y del predio, las prácticas actuales de registro y control, las problemáticas operativas, la disposición y las barreras hacia la adopción tecnológica, y los requisitos de usabilidad percibida. La evaluación del sistema, por su parte, opera sobre las características de calidad de la norma ISO/IEC 25010, según se detalla en el Capítulo VII.'));

  c.push(U.h2('3.5.4.', 'Indicadores de evaluación'));
  c.push(U.p('Los indicadores con que se evalúa el sistema se enuncian junto a su criterio de aceptación, de modo que el resultado pueda contrastarse sin ambigüedad. El Cuadro 3.2 los reúne con el instrumento que los mide.'));
  c.push(...U.cuadro('3.2', 'Indicadores de evaluación del sistema y su criterio de aceptación',
    ['Indicador', 'Instrumento', 'Criterio de aceptación'],
    [
      ['Usabilidad percibida', 'Escala de usabilidad del sistema (SUS)', 'Puntaje promedio igual o superior a 70'],
      ['Precisión de la estimación de peso', 'Comparación contra pesaje de referencia', 'Error medio absoluto no superior al ocho por ciento'],
      ['Integridad de la consolidación', 'Pruebas de sincronización con red interrumpida', 'Sin pérdida ni duplicación de registros'],
      ['Cobertura de requisitos', 'Matriz de trazabilidad y pruebas funcionales', 'Todo requisito con al menos una prueba asociada'],
      ['Autonomía sin conexión', 'Prueba de operación con red deshabilitada', 'Registro y consulta completos sin conectividad'],
    ],
    'Elaboración propia, 2026, sobre los criterios de usabilidad de Bangor et al. (2009).', [0.3, 0.33, 0.37]));

  c.push(U.h2('3.5.5.', 'Técnicas e instrumentos de recolección de datos'));
  c.push(U.p('Las técnicas aplicadas y los instrumentos correspondientes se describen en la sección siguiente. Los instrumentos en su versión aplicada se incorporan como apéndices del presente documento.'));

  // --- 3.4 ---
  c.push(U.h1('3.6.', 'Técnicas de recolección de información'));

  c.push(U.h2('3.6.1.', 'Observación directa'));
  c.push(U.p('Se realizó observación directa en explotaciones ganaderas de la zona, con ficha estructurada. El objetivo fue registrar de primera mano las condiciones reales de trabajo: el tipo de dispositivo que usa el productor, la disponibilidad de señal, la organización del predio y la forma en que se lleva el registro actualmente. Hay condiciones que no se enuncian en una entrevista pero se observan en terreno, y varias de las decisiones de diseño de interfaz provienen precisamente de esa observación.'));

  c.push(U.h2('3.6.2.', 'Entrevistas'));
  c.push(U.p('Se aplicaron entrevistas semiestructuradas a tres especialistas del sector: dos médicos veterinarios y un técnico del Servicio Nacional de Sanidad Agropecuaria e Inocuidad Alimentaria. La guía abordó el calendario sanitario obligatorio, los protocolos preventivos por fase de manejo y los criterios de registro que exige la normativa. La modalidad semiestructurada permitió que el entrevistado desarrollara sus respuestas más allá del cuestionario previsto.'));

  c.push(U.h2('3.6.3.', 'Encuestas'));
  c.push(U.p('El instrumento de diagnóstico se estructuró en las cinco dimensiones señaladas y se distribuyó de forma digital, alcanzando veintitrés respuestas válidas de productores y personas vinculadas al sector ganadero del departamento. Las zonas de procedencia comprenden Abapó, la Chiquitanía y otras localidades del departamento, distribución que asegura presencia en dos de los principales corredores ganaderos, caracterizados por baja conectividad y elevada extensión territorial por unidad productiva.'));

  c.push(U.h2('3.6.4.', 'Revisión documental'));
  c.push(U.p('La revisión documental comprendió bibliografía zootécnica sobre estimación de peso morfométrico, la normativa del SENASAG sobre sanidad animal e identificación del ganado, datos estadísticos del Instituto Nacional de Estadística y de las federaciones departamentales de ganaderos, y documentación técnica sobre arquitecturas con funcionamiento sin conexión. Esta revisión fundamenta tanto el marco teórico como los criterios técnicos del sistema.'));

  c.push(U.h2('3.6.5.', 'Pruebas técnicas sobre el software'));
  c.push(U.p('La verificación del comportamiento del sistema se realiza mediante pruebas automatizadas sobre el código construido —unitarias, de integración y de carga— cuyos resultados se documentan en el Capítulo VI. Estas pruebas constituyen una técnica de recolección en sí misma: producen la evidencia cuantitativa sobre la que se apoya la evaluación de calidad del Capítulo VII.'));

  // --- 3.5 ---
  c.push(U.h1('3.7.', 'Metodología de desarrollo del proyecto'));
  c.push(U.p('La construcción del sistema siguió el modelo incremental, cuya elección se fundamenta en la sección 2.4.4. El desarrollo se organizó en cuatro incrementos, detallados en el Cuadro 6.1: el primero comprendió la identidad, los accesos y el motor de sincronización; el segundo, el inventario, la trazabilidad y el historial sanitario con alertas; el tercero, la estimación del peso y la evaluación ponderada; y el cuarto, el panel web de reportes consolidados.'));
  c.push(U.p('Las fases que se describen a continuación se recorrieron dentro de cada incremento y no una sola vez a lo largo del proyecto. Al momento de redacción del presente documento, los incrementos primero y segundo se encuentran construidos y verificados, del tercero está construida la estimación morfométrica del peso, y el cuarto cuenta con su diseño completo. Para cada fase se indica qué produjo en este proyecto y en qué parte del documento consta.'));

  c.push(U.h2('3.7.1.', 'Fase de inicio'));
  c.push(U.p('Es la fase que delimita el alcance y fija los criterios de aceptación antes de construir. En este proyecto partió del perfil aprobado, cuya delimitación se recoge en la sección 1.8, y se concretó en las fichas de requisito del Capítulo IV: cada requisito funcional lleva un criterio de verificación redactado antes de su construcción, de modo que lo que significa que un incremento esté terminado quedó establecido de antemano y no se ajustó después a lo obtenido.'));

  c.push(U.h2('3.7.2.', 'Fase de planificación'));
  c.push(U.p('Es la fase que ordena el trabajo según sus dependencias. En este proyecto la dependencia decisiva fue técnica: ningún módulo podía registrar sin conexión antes de que existieran los identificadores generados en el dispositivo y el motor de sincronización, por lo que ambos se ubicaron en el primer incremento, aunque no aportan una funcionalidad visible para el productor. El resultado de la fase es el cronograma de la sección 6.1.2 y la gestión de riesgos de la sección 6.1.4.'));

  c.push(U.h2('3.7.3.', 'Fase de análisis'));
  c.push(U.p('Es la fase que detalla qué debe hacer el sistema. En este proyecto partió del diagnóstico de campo —la encuesta a veintitrés productores, las entrevistas a tres especialistas y la observación directa— y produjo los nueve procesos de negocio, los diecisiete requerimientos de usuario, los requisitos funcionales y no funcionales, las quince fichas de caso de uso y las doce reglas de negocio documentados en el Capítulo IV. El levantamiento con los interesados del establecimiento consta en el acta del Anexo B.'));

  c.push(U.h2('3.7.4.', 'Fase de diseño'));
  c.push(U.p('Es la fase que define la estructura de la solución. En este proyecto produjo la arquitectura en tres componentes, la comparación de alternativas tecnológicas del Cuadro 5.2, el modelo de clases, el esquema relacional de quince tablas y la estrategia de resolución de conflictos diferenciada por entidad, documentados en el Capítulo V. El diseño se completó para los cuatro incrementos, incluidos los que aún no se construyen, de modo que la construcción pendiente parte de decisiones ya tomadas.'));

  c.push(U.h2('3.7.5.', 'Fase de construcción'));
  c.push(U.p('Es la fase en que se escribe el código, con sus pruebas unitarias junto con la funcionalidad. En este proyecto la construcción se versionó en un repositorio Git, cuyo historial registra cada cambio con su fecha y su motivo, y comprendió el servicio central en NestJS, la aplicación móvil en Flutter y los dos esquemas de datos. La construcción del segundo incremento obligó a corregir el diseño en un punto: dos protocolos de vacunación aplicados al mismo animal compartían un único último evento, de modo que aplicar uno reiniciaba el conteo del otro, y se añadió al evento sanitario la referencia al protocolo que cumple. La sección 6.3 documenta lo construido.'));

  c.push(U.h2('3.7.6.', 'Fase de pruebas'));
  c.push(U.p('Es la fase que verifica el incremento contra sus criterios. En este proyecto se ejecutó en dos niveles. El primero, de pruebas automatizadas, comprende ciento veintiséis pruebas: cuarenta y ocho sobre el servicio central y setenta y ocho sobre la aplicación. El segundo consistió en recorrer la aplicación compilada contra el servidor real, en veinticinco escenarios, y fue el que detectó los tres defectos de mayor gravedad del proyecto —los identificadores generados en minúsculas, el código de respuesta del inicio de sesión y el corrimiento de las fechas en un día—, ninguno de los cuales podía aparecer en una prueba unitaria porque residían en el encuentro entre dos componentes. La sección 6.5 y el Cuadro 6.9 los documentan.'));

  c.push(U.h2('3.7.7.', 'Fase de despliegue'));
  c.push(U.p('Es la fase que pone el incremento en un entorno donde puede usarse. En este proyecto se alcanzó el entorno de prueba: la base de datos se levanta mediante contenedores con un único comando, el servicio central opera sobre ella con una carga inicial de datos de prueba, y la aplicación se compiló y ejecutó para móvil, escritorio y navegador. El procedimiento consta en el Apéndice H. La versión instalable para las sesiones de validación con productores corresponde a la fase siguiente del cronograma.'));

  c.push(U.h2('3.7.8.', 'Fase de evaluación y cierre'));
  c.push(U.p('Es la fase que contrasta el resultado con los criterios de aceptación y decide el cierre del incremento. En este proyecto el contraste técnico se realizó para los incrementos construidos: sus requisitos se verificaron contra el criterio de cada ficha, con el resultado consignado en el Apéndice F. La validación con el grupo piloto de productores, prevista como parte de esta fase, no se ha realizado al momento de redacción del presente documento; su protocolo se describe en la sección 3.8.3 y sus resultados se incorporarán en los Anexos G y H.'));

  // --- 3.6 ---
  c.push(U.h1('3.8.', 'Métodos de evaluación'));
  c.push(U.p('Se describen a continuación los siete métodos con que se evalúa el sistema. No todos pueden aplicarse en el mismo momento: los que miden el código pueden ejecutarse desde que este existe, mientras que los que miden el uso por parte del productor requieren una versión instalada en sus manos. El Cuadro 3.3 distingue los métodos ya aplicados de los pendientes, de modo que el lector sepa en cada caso si lo que sigue describe un resultado o un procedimiento previsto.'));
  c.push(...U.cuadro('3.3', 'Estado de aplicación de los métodos de evaluación',
    ['Método', 'Estado', 'Evidencia o condición pendiente'],
    [
      ['Evaluación funcional', 'Aplicado al alcance construido', 'Ciento veintiséis pruebas automatizadas y veinticinco escenarios de principio a fin (sección 6.5 y Apéndice F)'],
      ['Calidad según ISO/IEC 25010', 'Aplicado parcialmente', 'Valoración por característica en el Capítulo VII, sobre el alcance construido'],
      ['Usabilidad (SUS)', 'Pendiente', 'Requiere las sesiones con el grupo piloto'],
      ['Rendimiento', 'Pendiente', 'Pruebas de carga concurrente diseñadas en la sección 5.7.4, sin ejecutar'],
      ['Seguridad', 'Aplicado parcialmente', 'Verificados el resumen de contraseñas con argon2id y el control de acceso por rol; pendientes el cifrado de la base local y la revisión según el OWASP Top 10'],
      ['Comparativa antes y después', 'Pendiente', 'Requiere el uso sostenido del sistema en el establecimiento'],
      ['Validación con usuarios y expertos', 'Pendiente', 'Requiere las sesiones con el grupo piloto y la revisión del calendario por los especialistas'],
    ],
    'Elaboración propia, 2026.', [0.26, 0.2, 0.54]));

  c.push(U.h2('3.8.1.', 'Evaluación funcional'));
  c.push(U.p('Verifica que cada requisito funcional cumple el criterio de verificación de su ficha del Capítulo IV, y controla la cobertura mediante la matriz de trazabilidad: ningún requisito queda sin una prueba asociada. En este proyecto se aplicó a los requisitos construidos, y los de incrementos posteriores conservan su caso de prueba definido y sin ejecutar en el Apéndice F, de modo que el criterio quedó fijado antes de construir.'));

  c.push(U.h2('3.8.2.', 'Evaluación de calidad del software'));
  c.push(U.p('Se estructura según las ocho características del modelo de calidad de producto de la norma ISO/IEC 25010, para que la valoración no dependa del criterio del desarrollador sino de un marco externo. En este proyecto se desarrolla en el Capítulo VII, que valora cada característica sobre lo construido y declara como parcial lo que depende de la parte pendiente.'));

  c.push(U.h2('3.8.3.', 'Evaluación de usabilidad'));
  c.push(U.p('Se aplicará la escala de usabilidad del sistema al cierre de cada sesión de validación. El instrumento consta de diez afirmaciones con respuesta en escala de cinco niveles y produce un puntaje único comparable entre sistemas. Se adopta como referencia un puntaje mínimo de setenta puntos, equivalente a una calificación de buena usabilidad según los rangos establecidos por Bangor et al. (2009).'));
  c.push(U.p('El protocolo prevé que el productor opere la aplicación de forma autónoma, sin asistencia del desarrollador durante la fase de uso, de modo que lo medido sea la claridad de la interfaz y no la calidad de la explicación recibida. Esta evaluación no se ha aplicado al momento de redacción del presente documento.'));

  c.push(U.h2('3.8.4.', 'Evaluación de rendimiento'));
  c.push(U.p('Mide los tiempos de respuesta de las operaciones más frecuentes sobre el dispositivo de referencia y el comportamiento del servicio central bajo carga concurrente, contra los umbrales de los requisitos no funcionales del Capítulo IV. En este proyecto las pruebas de carga están diseñadas y su ejecución corresponde al cierre de la construcción, porque medir la carga sobre un servicio incompleto produciría una cifra que dejaría de valer al agregar los módulos restantes.'));

  c.push(U.h2('3.8.5.', 'Evaluación de seguridad'));
  c.push(U.p('Verifica el cumplimiento de los controles previstos: el aislamiento del acceso por rol, el cifrado del transporte y de la base local, el almacenamiento de contraseñas mediante una función de derivación de clave y la ausencia de los riesgos del OWASP Top 10 aplicables al sistema. En este proyecto están construidos y verificados el resumen de contraseñas con argon2id y la verificación del rol en cada función; el cifrado de la base local y la revisión según el OWASP Top 10 quedan pendientes, y así se consigna en el Cuadro 6.11.'));

  c.push(U.h2('3.8.6.', 'Evaluación comparativa antes y después'));
  c.push(U.p('Contrastará la situación de partida documentada en el diagnóstico con la posterior a la incorporación del sistema, sobre indicadores observables: el tiempo dedicado al registro, la proporción de alertas sanitarias atendidas a tiempo y la disponibilidad del historial individual al decidir una venta. Su aplicación requiere un período de uso sostenido en el establecimiento, posterior a la entrega de la versión instalable.'));

  c.push(U.h2('3.8.7.', 'Validación con usuarios y expertos'));
  c.push(U.p('La validación con usuarios se realizará con el grupo piloto de productores. La validación con expertos se apoyará en los especialistas entrevistados, a quienes se someterá la coherencia del calendario sanitario implementado y la pertinencia de los criterios de la evaluación ponderada. El calendario sanitario construido reproduce los protocolos relevados en esas entrevistas, documentados en el Apéndice B, de modo que la validación consistirá en contrastar el resultado con su propia fuente.'));

  // --- 3.7 ---
  c.push(U.h1('3.9.', 'Consideraciones éticas y de seguridad'));

  c.push(U.h2('3.9.1.', 'Tratamiento de datos personales'));
  c.push(U.p('La información recogida en el diagnóstico se trata de forma agregada y anónima. Los resultados se presentan como proporciones del conjunto y en ningún caso permiten identificar a un productor individual ni asociar una respuesta a una persona determinada. Aunque Bolivia carece de una ley específica de protección de datos personales, el proyecto adopta este criterio por decisión propia, conforme a lo expuesto en la sección 2.8.1.'));

  c.push(U.h2('3.9.2.', 'Confidencialidad de la información'));
  c.push(U.p('Los datos productivos del establecimiento que sirve de caso de aplicación son información comercial sensible: el tamaño del hato, el estado sanitario y los precios de venta. Esa información no se publica en el documento y se emplea únicamente para verificar el funcionamiento del sistema.'));

  c.push(U.h2('3.9.3.', 'Autorización institucional'));
  c.push(U.p('El uso de los datos del establecimiento ganadero que sirve de caso de aplicación cuenta con autorización escrita de su propietario, que se incorpora como anexo. Los productores que participaron del diagnóstico y de las sesiones de validación lo hicieron de forma voluntaria y tras ser informados del propósito académico del trabajo.'));

  c.push(U.h2('3.9.4.', 'Uso responsable de las herramientas de seguridad'));
  c.push(U.p('Las pruebas de seguridad se ejecutan exclusivamente sobre la infraestructura del propio proyecto, en entornos de prueba controlados. No se realizan pruebas sobre sistemas de terceros ni sobre infraestructura ajena al alcance del trabajo.'));

  c.push(U.h2('3.9.5.', 'Protección de credenciales y evidencias'));
  c.push(U.p('Las credenciales de los entornos de desarrollo y producción se gestionan mediante variables de entorno y quedan excluidas del control de versiones. Las credenciales que aparecen en el presente documento y en los datos de carga inicial corresponden a usuarios de prueba del entorno de desarrollo, sin validez en el entorno de producción.'));

  c.push(U.h2('3.9.6.', 'Reproducibilidad y trazabilidad del proyecto'));
  c.push(U.p('El código del sistema se versiona en un repositorio con historial completo, de modo que cada decisión de implementación queda registrada con su fecha y su justificación. El entorno de ejecución se define mediante contenedores, lo que permite reproducir la instalación completa en cualquier máquina sin depender de configuración manual. Las pruebas son automatizadas y ejecutables por cualquier persona que disponga del repositorio, condición que hace verificables los resultados reportados en el Capítulo VI.'));

  return c;
};
