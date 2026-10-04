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
  c.push(U.p('Para la construcción del sistema se adopta el modelo incremental, fundamentado en la sección 2.4.4. Cada incremento contempla actividades de análisis, diseño, desarrollo y pruebas, y culmina con una versión utilizable que se valida con productores antes de avanzar al siguiente. Las fases que se describen a continuación se recorren dentro de cada incremento, no una sola vez a lo largo del proyecto.'));

  c.push(U.h2('3.7.1.', 'Fase de inicio'));
  c.push(U.p('Delimitación del alcance del incremento, identificación de los requisitos que comprende y definición de sus criterios de aceptación. Esta fase produce el acuerdo verificable sobre qué significará que el incremento esté terminado.'));

  c.push(U.h2('3.7.2.', 'Fase de planificación'));
  c.push(U.p('Descomposición del alcance en tareas, estimación del esfuerzo y ordenamiento según dependencias técnicas. Se identifican además los riesgos del incremento y las medidas previstas para atenuarlos.'));

  c.push(U.h2('3.7.3.', 'Fase de análisis'));
  c.push(U.p('Detalle funcional de los requisitos del incremento: flujos principales y alternativos, reglas de negocio aplicables y condiciones de error. El producto de esta fase son las fichas de caso de uso y las reglas documentadas en el Capítulo IV.'));

  c.push(U.h2('3.7.4.', 'Fase de diseño'));
  c.push(U.p('Definición de la estructura de la solución: componentes, modelo de datos, contratos de la interfaz de programación y diseño de las pantallas. Las decisiones de esta fase se documentan en el Capítulo V.'));

  c.push(U.h2('3.7.5.', 'Fase de construcción'));
  c.push(U.p('Implementación del código del incremento, con pruebas unitarias escritas junto con la funcionalidad y no después de ella. Cada avance se versiona en el repositorio, de modo que el historial del control de versiones constituye el registro de la construcción.'));

  c.push(U.h2('3.7.6.', 'Fase de pruebas'));
  c.push(U.p('Verificación del incremento en sus tres niveles: pruebas unitarias sobre la lógica de negocio, pruebas de integración sobre los puntos de acceso de la interfaz de programación, y pruebas del escenario de consolidación con red interrumpida, que es el de mayor riesgo técnico del sistema.'));

  c.push(U.h2('3.7.7.', 'Fase de despliegue'));
  c.push(U.p('Publicación del incremento en el entorno de prueba y preparación de la versión instalable para las sesiones de validación con productores.'));

  c.push(U.h2('3.7.8.', 'Fase de evaluación y cierre'));
  c.push(U.p('Sesión de validación con productores del grupo piloto, contraste de los resultados contra los criterios de aceptación definidos en la fase de inicio, y registro de las observaciones que alimentarán el incremento siguiente. El incremento se da por cerrado cuando sus criterios se cumplen; las observaciones que no comprometen esos criterios se incorporan al alcance posterior en lugar de retrasar el cierre.'));

  // --- 3.6 ---
  c.push(U.h1('3.8.', 'Métodos de evaluación'));

  c.push(U.h2('3.8.1.', 'Evaluación funcional'));
  c.push(U.p('Verifica que cada requisito funcional se cumple según su criterio de verificación, establecido en la ficha correspondiente del Capítulo IV. La cobertura se controla mediante la matriz de trazabilidad: ningún requisito debe quedar sin al menos una prueba asociada.'));

  c.push(U.h2('3.8.2.', 'Evaluación de calidad del software'));
  c.push(U.p('Se estructura según las ocho características del modelo de calidad de producto de la norma ISO/IEC 25010, de modo que la valoración no dependa del criterio del desarrollador sino de un marco externo. El desarrollo de esta evaluación constituye el Capítulo VII.'));

  c.push(U.h2('3.8.3.', 'Evaluación de usabilidad'));
  c.push(U.p('Se aplica la escala de usabilidad del sistema al cierre de cada sesión de validación. El instrumento consta de diez afirmaciones con respuesta en escala de cinco niveles y produce un puntaje único comparable entre sistemas. Se adopta como referencia un puntaje mínimo de setenta puntos, equivalente a una calificación de buena usabilidad según los rangos establecidos por Bangor et al. (2009).'));
  c.push(U.p('Las sesiones siguen un protocolo en el que el productor opera la aplicación de forma autónoma, sin asistencia del desarrollador durante la fase de uso, de modo que lo medido sea la claridad de la interfaz y no la calidad de la explicación recibida.'));

  c.push(U.h2('3.8.4.', 'Evaluación de rendimiento'));
  c.push(U.p('Mide los tiempos de respuesta de las operaciones más frecuentes sobre el dispositivo de referencia, y el comportamiento del servicio central bajo escenarios de carga concurrente. Los criterios cuantitativos se establecen en los requisitos no funcionales del Capítulo IV.'));

  c.push(U.h2('3.8.5.', 'Evaluación de seguridad'));
  c.push(U.p('Verifica el cumplimiento de los controles previstos: aislamiento del acceso por rol, cifrado del transporte y de la base local, almacenamiento de contraseñas mediante función de derivación de clave, y ausencia de los riesgos del OWASP Top 10 aplicables al sistema.'));

  c.push(U.h2('3.8.6.', 'Evaluación comparativa antes y después'));
  c.push(U.p('Contrasta la situación de partida documentada en el diagnóstico con la situación posterior a la incorporación del sistema, sobre indicadores observables: tiempo dedicado al registro, proporción de alertas sanitarias atendidas a tiempo y disponibilidad del historial individual al momento de decidir una venta.'));

  c.push(U.h2('3.8.7.', 'Validación con usuarios y expertos'));
  c.push(U.p('La validación con usuarios se realiza con el grupo piloto de productores. La validación con expertos se apoya en los especialistas entrevistados, a quienes se somete la coherencia del calendario sanitario implementado y la pertinencia de los criterios de la evaluación ponderada para la selección de animales.'));

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
