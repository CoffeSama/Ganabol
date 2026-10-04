/** INTRODUCCIÓN y CAPÍTULO I — PLANTEAMIENTO DEL PROBLEMA. */
const U = require('../univalle');

module.exports = function introYCapitulo1() {
  const c = [];

  // ===================== INTRODUCCIÓN =====================
  c.push(...U.portadaCapitulo('INTRODUCCIÓN', ''));

  c.push(U.p('La ganadería bovina es una de las actividades económicas más importantes del departamento de Santa Cruz. El departamento concentra alrededor del cuarenta y cuatro por ciento del hato bovino nacional y cerca del cuarenta y siete por ciento del valor de la producción bovina del país (Federación de Ganaderos de Santa Cruz, 2021; Instituto Nacional de Estadística, 2018). Ese hato se distribuye entre empresas agropecuarias de gran escala y cientos de productores organizados en asociaciones locales: la Asociación de Ganaderos de Pailón en la provincia Chiquitos, la de Abapó en Cordillera, y distintas agrupaciones de la Chiquitanía, como las de San Julián y Cuatro Cañadas.'));
  c.push(U.p('Buena parte de esos productores maneja el ganado hoy como se hacía hace décadas: con cuadernos, estimaciones visuales y memoria. El animal nace, se anota algo en un papel, y el resto queda en la cabeza del dueño. El historial de vacunas, los tratamientos y los eventos reproductivos dependen de que el productor los recuerde o los encuentre en alguna hoja suelta. No es falta de interés: es que no existe una herramienta que funcione en esas condiciones.'));
  c.push(U.p('El presente proyecto desarrolla GanaBol, un sistema móvil de gestión ganadera cuyo modo primario de operación es sin conexión, orientado a explotaciones bovinas tradicionales del departamento de Santa Cruz. El sistema permite registrar el inventario bovino con identificación individual, llevar el historial sanitario de cada animal, estimar su peso en campo a partir de medidas corporales sin pesarlo físicamente, y apoyar la decisión de venta mediante criterios objetivos.'));
  c.push(U.p('El alcance comprende una aplicación móvil desarrollada en Flutter, que opera sobre una base de datos local y consolida su información con un servicio central cuando dispone de conectividad, y un panel web de administración para la consulta de reportes. La metodología de desarrollo adoptada es el modelo incremental, que organiza la construcción en ciclos sucesivos, cada uno con sus propias fases de análisis, diseño, implementación y pruebas, y cada uno validado con productores antes de iniciar el siguiente.'));
  c.push(U.p('El diagnóstico que sustenta el diseño proviene de un instrumento aplicado a veintitrés productores de los municipios de Pailón, Abapó y San Julián, complementado con entrevistas a especialistas del sector y observación directa en terreno. El caso de aplicación del sistema es el establecimiento ganadero Sabayones, en la zona del Izozog, Chaco del departamento de Santa Cruz.'));
  c.push(U.p('Como resultado se espera un sistema funcional, validado en campo mediante la escala de usabilidad del sistema, que permita al productor sustituir el registro en papel por un registro digital que no dependa de la señal de internet, y que le entregue al momento de vender una estimación de peso fundada en medidas y no en apreciación visual.'));
  c.push(U.p('El documento se organiza en siete capítulos. El Capítulo I plantea el problema, los objetivos y la justificación. El Capítulo II desarrolla el marco teórico y referencial que fundamenta las decisiones técnicas. El Capítulo III describe el marco metodológico de la investigación y del desarrollo. El Capítulo IV presenta el análisis y la especificación de requisitos. El Capítulo V documenta el diseño de la solución. El Capítulo VI detalla el desarrollo, la implementación y la validación. El Capítulo VII evalúa el proyecto respecto a sus objetivos, su calidad y su impacto. Cierran el documento las conclusiones, las recomendaciones, las referencias, el glosario, los apéndices y los anexos.'));

  // ===================== CAPÍTULO I =====================
  c.push(...U.portadaCapitulo('CAPÍTULO I', 'PLANTEAMIENTO DEL PROBLEMA'));

  // --- 1.1 ---
  c.push(U.h1('1.1.', 'Antecedentes'));

  c.push(U.h2('1.1.1.', 'Antecedentes institucionales'));
  c.push(U.p('El departamento de Santa Cruz concentra alrededor del cuarenta y cuatro por ciento del hato bovino nacional y cerca del cuarenta y siete por ciento del valor de la producción bovina del país (Federación de Ganaderos de Santa Cruz, 2021; Instituto Nacional de Estadística, 2018). La Federación de Ganaderos de Santa Cruz agrupa a las asociaciones departamentales, entre ellas la Asociación de Ganaderos de Pailón en la provincia Chiquitos y la de Abapó en Cordillera, además de distintas agrupaciones de la Chiquitanía como las de San Julián y Cuatro Cañadas. Estas asociaciones reúnen a productores que operan en superficies extensas, con escasa cobertura de conectividad y acceso irregular a servicios técnicos.'));
  c.push(U.p('El caso de aplicación del presente proyecto es el establecimiento ganadero Sabayones, propiedad familiar ubicada en la zona del Izozog, Chaco del departamento de Santa Cruz. El establecimiento opera bajo pastoreo extensivo en campo natural y presenta las condiciones que caracterizan a la mayoría de las explotaciones de la zona: ausencia de registros digitales, conectividad intermitente y distancias considerables entre las áreas de manejo del hato.'));

  c.push(U.h2('1.1.2.', 'Antecedentes tecnológicos'));
  c.push(U.p('El productor ganadero de la zona dispone hoy de más capacidad tecnológica de la que utiliza. El instrumento aplicado durante el diagnóstico reveló que el ochenta y siete por ciento de los encuestados posee un teléfono inteligente con capacidad técnica suficiente para ejecutar una aplicación de gestión, mientras que ninguno utiliza una herramienta digital especializada para el manejo de su hato. La brecha, por tanto, no está en el equipamiento disponible sino en la ausencia de software adecuado al contexto.'));
  c.push(U.p('El dato nacional confirma esa asimetría. En los hogares rurales de Bolivia el acceso a internet alcanza apenas al cincuenta y tres coma nueve por ciento, mientras que el ochenta y uno coma cinco por ciento dispone de teléfono móvil (Instituto Nacional de Estadística, 2024). El dispositivo está; lo que falta es la red, y ese desfase es precisamente la condición que una aplicación con funcionamiento sin conexión aprovecha en lugar de padecer.'));
  c.push(U.p('En paralelo, la maduración de los marcos de desarrollo multiplataforma y de las bases de datos embebidas ha hecho viable construir aplicaciones que operan de forma autónoma sin conexión permanente, consolidando con un servicio central únicamente cuando la red está disponible. Esta capacidad técnica, que hace una década implicaba un esfuerzo de ingeniería considerable, hoy está al alcance de un proyecto de grado.'));

  c.push(U.h2('1.1.3.', 'Antecedentes investigativos'));
  c.push(U.p('La literatura zootécnica documenta desde hace décadas la posibilidad de estimar el peso vivo de un bovino a partir de medidas corporales tomadas con cinta métrica, sin pesarlo físicamente. Wangchuk, Wangdi y Mindu (2018) comparan la fiabilidad de las distintas técnicas de estimación de peso vivo en ganado bovino y constituyen la referencia metodológica directa del módulo de estimación del presente sistema. Bavera (2005) documenta además el patrón de gestión empírica en productores de hato reducido en varios países de la región, con consecuencias directas sobre la sanidad y la rentabilidad.'));
  c.push(U.p('Sobre la adopción de tecnología en entornos rurales, los modelos de Davis (1989) y Rogers (2003) establecen que la utilidad percibida y la facilidad de uso son los factores determinantes de la decisión de uso continuo de una herramienta digital. Esta evidencia orientó las decisiones de diseño de interfaz documentadas en el Capítulo V.'));
  c.push(U.p('En el plano de la ingeniería, el trabajo de Kleppmann, Wiggins, van Hardenberg y McGranaghan (2019) sobre software local-first establece los principios de diseño de las aplicaciones que operan sin conexión permanente, y es la referencia conceptual de la arquitectura adoptada.'));

  c.push(U.h2('1.1.4.', 'Soluciones existentes en el mercado'));
  c.push(U.p('En el mercado regional existen plataformas de gestión ganadera orientadas al registro del inventario, el seguimiento sanitario y la generación de reportes productivos, entre ellas SIGGAN y BoviGest. Ambas resuelven la gestión del hato para explotaciones de escala considerable, con infraestructura tecnológica disponible y personal capacitado para operarlas.'));

  c.push(U.h2('1.1.5.', 'Limitaciones de las soluciones actuales'));
  c.push(U.p('Estas plataformas están pensadas para un contexto distinto al del productor cruceño tradicional. Requieren conexión permanente a internet, dispositivos de gama alta y un nivel de capacitación digital que no corresponde al perfil del usuario objetivo. En zonas como Pailón, Abapó o buena parte de la Chiquitanía, la señal de internet es intermitente en el mejor de los casos y, con frecuencia, inexistente.'));
  c.push(U.p('A la restricción de conectividad se suma el costo: las licencias de estas plataformas superan lo que el productor de este perfil puede o está dispuesto a pagar, especialmente cuando la herramienta no resuelve el problema que más le cuesta dinero, que es estimar correctamente el peso del animal al momento de venderlo. Esta brecha entre lo que el mercado ofrece y lo que el productor necesita es la que el presente proyecto busca cerrar.'));

  // --- 1.2 ---
  c.push(U.h1('1.2.', 'Descripción de la situación problemática'));

  c.push(U.h2('1.2.1.', 'Descripción del contexto'));
  c.push(U.p('La actividad ganadera en las zonas de Pailón, Abapó, San Julián y el Izozog se organiza en torno a los ciclos biológicos del ganado bovino: la gestión reproductiva, el seguimiento sanitario, el control del peso y la planificación de la comercialización. Cada ciclo genera información que, registrada y procesada adecuadamente, permitiría al productor tomar decisiones informadas sobre el manejo de su hato.'));
  c.push(U.p('Las explotaciones de la zona se caracterizan por superficies extensas, conectividad escasa y condiciones climáticas que dificultan el acceso permanente a los predios. El productor trabaja a la intemperie, con las manos ocupadas, y registra los datos en el momento en que ocurren los hechos: durante la vacunación, al medir un animal, al detectar una enfermedad. Cualquier herramienta que no funcione en esas condiciones queda sin uso.'));

  c.push(U.h2('1.2.2.', 'Actores involucrados'));
  c.push(U.p('En la operación del establecimiento ganadero intervienen cuatro actores con responsabilidades diferenciadas, que el sistema debe reconocer y delimitar mediante permisos distintos. El Cuadro 1.1 los identifica junto con la responsabilidad que asume cada uno.'));
  c.push(...U.cuadro('1.1', 'Actores involucrados en la gestión del establecimiento ganadero',
    ['Actor', 'Responsabilidad principal', 'Relación con la información'],
    [
      ['Propietario', 'Decidir sobre la venta, la reposición y la inversión en el hato', 'Necesita la información consolidada para decidir; hoy depende de su memoria y de registros dispersos'],
      ['Personal de campo', 'Ejecutar el manejo diario: vacunación, traslados, observación del hato', 'Genera la información en el momento del hecho, pero carece de un medio para registrarla en el lugar'],
      ['Veterinario', 'Diagnosticar, indicar tratamientos y definir calendarios sanitarios', 'Requiere el historial previo del animal, que habitualmente no está disponible en la visita'],
      ['Administrador', 'Gestionar usuarios, parámetros del establecimiento y respaldo de la información', 'Responsable de que los datos existan, sean consistentes y estén resguardados'],
    ],
    'Elaboración propia a partir del diagnóstico aplicado a productores de Pailón, Abapó y San Julián, 2026.',
    [0.2, 0.4, 0.4]));

  c.push(U.h2('1.2.3.', 'Procesos actuales'));
  c.push(U.p('El productor trabaja, en términos generales, sin registros confiables. No porque no quiera llevarlos, sino porque los métodos disponibles no se adaptan a cómo trabaja en campo. Revisar un cuaderno bajo la lluvia, buscar un dato entre hojas sueltas o recordar cuándo fue la última vacuna de un animal entre ciento cincuenta son problemas cotidianos que ningún sistema del mercado ha resuelto para este perfil de usuario.'));
  c.push(U.p('El diagnóstico aplicado confirma el patrón: el cincuenta y dos por ciento de los encuestados lleva sus registros en cuadernos físicos o planillas de cálculo, y un porcentaje significativo declara no llevar ningún registro formal. El setenta por ciento actualiza su información de forma mensual o únicamente cuando ocurre un evento relevante, como un nacimiento, una muerte, una venta o una vacunación. Esto implica que los datos disponibles al momento de tomar una decisión comercial o sanitaria pueden estar desactualizados por semanas.'));

  c.push(U.h2('1.2.4.', 'Recursos tecnológicos disponibles'));
  c.push(U.p('El productor dispone de un teléfono inteligente, habitualmente de gama media o baja, que utiliza para comunicación y mensajería. No dispone de conexión estable a internet en el predio, de computadora de escritorio en el lugar de trabajo, ni de equipamiento de pesaje en la mayoría de los casos. El acceso a electricidad en las áreas de manejo es limitado, lo que restringe la autonomía de cualquier dispositivo que dependa de carga frecuente.'));
  c.push(U.p('Esta configuración de recursos define el marco dentro del cual la solución debe operar: un único dispositivo, sin red garantizada, con batería limitada y sin equipamiento complementario.'));

  c.push(U.h2('1.2.5.', 'Deficiencias identificadas'));
  c.push(U.p('Las consecuencias de la gestión actual son concretas y cuantificables. Cuando el productor va a vender un animal, estima el peso visualmente y con frecuencia se equivoca, lo que le genera pérdidas directas en la negociación: el cincuenta y cinco por ciento de los encuestados reconoce haber vendido algún animal por debajo de su valor real de mercado por desconocer su peso. No sabe qué animal tiene mejor condición para vender porque no cuenta con un historial objetivo. Las vacunas se retrasan porque no hay un sistema que avise. Y si un animal se enferma, es difícil determinar si ya tuvo ese problema antes o qué tratamientos recibió: el sesenta por ciento declara haber perdido información importante sobre algún animal.'));
  c.push(U.p('Estas deficiencias convergen en cuatro problemas centrales: la ausencia de trazabilidad individual del ganado, la desactualización crónica de los registros, la falta de herramientas de apoyo a la comercialización y la imposibilidad de usar las soluciones existentes por la restricción de conectividad.'));

  // --- 1.3 Objeto de estudio y formulación ---
  c.push(U.h2('1.2.6.', 'Árbol del problema'));
  c.push(U.p('Las deficiencias descritas no son independientes entre sí: unas originan a otras, y todas convergen en un problema central del que se desprenden consecuencias económicas y sanitarias concretas. La Figura 1.1 ordena esa relación en los cuatro niveles habituales del análisis, de las causas raíz a los efectos.'));
  c.push(...U.figura('arbol-problema.png', '1.1', 'Árbol del problema de la gestión del ganado bovino en explotaciones tradicionales',
    'Elaboración propia, 2026, a partir del diagnóstico aplicado a productores de Pailón, Abapó y San Julián.',
    { anchoMax: 600 }));
  c.push(U.p('La lectura del árbol de abajo hacia arriba explica por qué una solución parcial no resuelve el problema. Digitalizar el registro sin que funcione sin conexión deja intacta la causa raíz de la cuarta columna; incorporar conectividad sin resolver la estimación del peso deja intacta la de la tercera. El sistema que este proyecto propone actúa sobre las cuatro causas a la vez, y esa simultaneidad es lo que define su alcance.'));

  c.push(U.h2('1.2.7.', 'Análisis estratégico del proyecto'));
  c.push(U.p('El árbol ordena el problema; el análisis estratégico sitúa al proyecto frente a él. El Cuadro 1.2 presenta la matriz de fortalezas, oportunidades, debilidades y amenazas, que contrasta las condiciones internas del proyecto con las del entorno en que se aplicará.'));
  c.push(...U.cuadro('1.2', 'Matriz de fortalezas, oportunidades, debilidades y amenazas del proyecto',
    ['Fortalezas', 'Oportunidades'],
    [
      [
        '— Demanda real validada mediante diagnóstico empírico con productores del área de influencia.\n— Acceso directo a usuarios reales para la validación piloto.\n— Conjunto de tecnologías maduro y sin costo de licencias.\n— Funcionamiento sin conexión asumido como decisión arquitectónica de primer orden.',
        '— Inexistencia de una solución nacional adaptada al contexto productivo cruceño.\n— Expansión de la cobertura celular en zonas rurales del oriente boliviano.\n— Impulso de digitalización del SENASAG en materia de trazabilidad sanitaria.\n— Base potencial de usuarios en las provincias del departamento.',
      ],
      ['**Debilidades**', '**Amenazas**'],
      [
        '— Equipo de desarrollo conformado por una sola persona.\n— Recursos limitados para la validación experimental en campo.\n— Riesgo de alcance excesivo dada la cantidad de módulos funcionales planteados.',
        '— Resistencia inicial del productor tradicional a la adopción de herramientas digitales.\n— Conectividad rural intermitente, condición que el sistema atenúa pero que también limita la consolidación con el servidor.\n— Eventual ingreso de competidores internacionales con plan gratuito.\n— Sostenibilidad posterior al piloto no garantizada por un proyecto académico.',
      ],
    ],
    'Elaboración propia, 2026.', [0.5, 0.5]));
  c.push(U.p('La lectura cruzada de la matriz explica dos decisiones del proyecto. La debilidad del equipo unipersonal frente al riesgo de alcance excesivo es lo que justifica la organización por incrementos cerrados, cada uno entregable por sí mismo. Y la amenaza de la conectividad intermitente, que es a la vez la oportunidad que ninguna solución existente aprovecha, es lo que convierte el funcionamiento sin conexión en el eje de la arquitectura y no en una característica más.'));

  c.push(U.h1('1.3.', 'Objeto de estudio y formulación del problema'));

  c.push(U.h2('1.3.1.', 'Objeto de estudio'));
  c.push(U.p('La gestión de la información productiva y sanitaria del ganado bovino en las etapas de crianza, destete y engorde, en explotaciones tradicionales del departamento de Santa Cruz, Bolivia.'));

  c.push(U.h2('1.3.2.', 'Formulación del problema'));
  c.push(U.p('¿Cómo sistematizar la gestión productiva y sanitaria del ganado bovino en explotaciones tradicionales del departamento de Santa Cruz, Bolivia —actualmente basada en registros manuales dispersos y en decisiones sustentadas en la apreciación visual y la experiencia—, a fin de fortalecer el control del ganado y la toma de decisiones en contextos de conectividad limitada?'));

  // --- 1.4 Sistematización ---
  c.push(U.h1('1.4.', 'Sistematización del problema'));
  c.push(U.p('De la pregunta central se desprenden cinco preguntas específicas que orientan el desarrollo del proyecto:'));

  c.push(U.h2('1.4.1.', '¿Cuáles son las características del proceso actual?'));
  c.push(U.p('Cómo registra hoy el productor la información de su hato, con qué medios, con qué frecuencia y qué información se pierde en el camino. La respuesta se desarrolla en el diagnóstico del Capítulo IV.'));
  c.push(U.h2('1.4.2.', '¿Qué necesidades funcionales y no funcionales deben considerarse?'));
  c.push(U.p('Qué debe hacer el sistema para resolver los problemas identificados y bajo qué restricciones de operación, rendimiento, seguridad y usabilidad debe hacerlo, considerando que el entorno de uso impone condiciones que no son negociables.'));
  c.push(U.h2('1.4.3.', '¿Qué arquitectura tecnológica resulta adecuada?'));
  c.push(U.p('Qué organización de componentes permite que la aplicación opere de forma autónoma sin conexión, consolide de forma confiable cuando la red aparece y mantenga la integridad de los datos durante ese proceso.'));
  c.push(U.h2('1.4.4.', '¿Cómo se verificará la calidad de la solución?'));
  c.push(U.p('Con qué pruebas y con qué criterios medibles se determinará que el sistema cumple lo que promete, tanto en su comportamiento técnico como en su utilidad para el productor en condiciones reales de campo.'));
  c.push(U.h2('1.4.5.', '¿Qué beneficios técnicos y organizacionales se obtendrán?'));
  c.push(U.p('Qué cambia en la operación del establecimiento al incorporar el sistema, y qué evidencia permite afirmar que ese cambio representa una mejora respecto a la situación de partida.'));

  // --- 1.5 Objetivos (los aprobados en el perfil) ---
  c.push(U.h1('1.5.', 'Objetivos'));

  c.push(U.h2('1.5.1.', 'Objetivo general'));
  c.push(U.p('Desarrollar un sistema móvil con arquitectura de funcionamiento sin conexión y panel de administración web que permita a los productores de explotaciones bovinas tradicionales del departamento de Santa Cruz sistematizar el registro del inventario, el historial sanitario, la estimación de peso y la selección de animales en las etapas de crianza, destete y engorde, a fin de fortalecer el control del ganado y la toma de decisiones en contextos de conectividad limitada, durante el periodo 2026–2027.'));

  c.push(U.h2('1.5.2.', 'Objetivos específicos'));
  c.push(U.p('Para alcanzar el objetivo general se plantean los siguientes objetivos específicos:', { sinSangria: true }));
  [
    'Analizar los requerimientos funcionales y técnicos a partir de las prácticas de gestión del ganado en explotaciones tradicionales del departamento de Santa Cruz, para orientar el diseño del sistema.',
    'Diseñar la arquitectura móvil con funcionamiento sin conexión y sincronización diferida, junto con el modelo de datos del sistema, para estructurar una solución estable en contextos de conectividad limitada.',
    'Construir los módulos de inventario y trazabilidad, historial sanitario con alertas, estimación de peso mediante parámetros morfológicos y evaluación ponderada para la selección de animales, junto con el panel web de reportes consolidados.',
    'Evaluar el sistema mediante pruebas funcionales, técnicas y de usuario, para verificar su utilidad en la gestión de los animales en condiciones reales de campo.',
  ].forEach((t, i) => c.push(U.pMixto([[`${i + 1}. `, { bold: true }], [t]], { sinSangria: true, after: 140 })));

  // --- 1.6 Justificación ---
  c.push(U.h1('1.6.', 'Justificación'));
  c.push(U.p('La realización del presente proyecto se sustenta en argumentos de distinto orden que justifican su pertinencia, su viabilidad y su relevancia. Se exponen agrupados por tipo, conforme a la práctica recomendada en la formulación de proyectos académicos.'));

  c.push(U.h2('1.6.1.', 'Justificación técnica'));
  c.push(U.p('El proyecto integra tres componentes que trascienden el simple almacenamiento de datos. El primero es una arquitectura con funcionamiento sin conexión y sincronización diferida, que permite operar sin red y resolver la consistencia de los datos al restablecerse la conexión, lo que constituye un problema de ingeniería no trivial en cuanto a integridad y gestión de conflictos.'));
  c.push(U.p('El segundo es la estimación de peso a partir de parámetros morfológicos, sustentada en fórmulas validadas en la bibliografía zootécnica, cuya implementación en una aplicación usable en campo —con entrada de datos simple y resultado inmediato— tiene valor técnico y práctico.'));
  c.push(U.p('El tercero es un mecanismo de evaluación ponderada que asiste la decisión de venta: asignar puntajes según criterios objetivos y generar un orden que oriente al productor es un componente de apoyo a la decisión que eleva la complejidad del sistema por encima del registro simple.'));

  c.push(U.h2('1.6.2.', 'Justificación económica'));
  c.push(U.p('Para un productor con ochenta animales, equivocarse en quince kilos al estimar el peso de venta de diez de ellos puede significar una pérdida de varios cientos de dólares por ciclo. No es un número hipotético: es el resultado directo de negociar sin datos, y lo confirma el cincuenta y cinco por ciento de encuestados que reconoce haber vendido por debajo del valor real. A eso se suma el costo de las enfermedades no detectadas a tiempo, los tratamientos repetidos por falta de historial y la venta de animales que no eran los más convenientes porque no había forma objetiva de compararlos.'));
  c.push(U.p('Una herramienta que corrija esos tres problemas tiene un retorno económico tangible, incluso si mejora la precisión solo de forma parcial. Al estar diseñada para los dispositivos que el productor ya posee y funcionar sin internet, el costo de adopción es prácticamente nulo: no requiere inversión en infraestructura, no tiene licencia mensual y no depende de que el predio tenga señal.'));

  c.push(U.h2('1.6.3.', 'Justificación social'));
  c.push(U.p('Las asociaciones de ganaderos del departamento agrupan a productores que, en su mayoría, no tienen acceso regular a veterinarios ni a técnicos agropecuarios. El conocimiento sobre sanidad animal y manejo productivo se transmite por experiencia propia y por lo que se comparte entre vecinos. No es que falte disposición: falta acceso.'));
  c.push(U.p('Una aplicación que lleve el historial sanitario, avise cuándo vence una vacuna y ayude a decidir qué animal vender no reemplaza al técnico, pero reduce la dependencia de uno. El productor puede tomar mejores decisiones de forma autónoma, en su propio predio, sin esperar una visita que quizás tarde semanas. En un sector donde la brecha digital sigue siendo amplia, una herramienta así funciona además como punto de entrada a la tecnificación de la gestión ganadera.'));

  c.push(U.h2('1.6.4.', 'Justificación académica'));
  c.push(U.p('El proyecto integra en un mismo sistema conocimientos de varias áreas de la carrera: arquitectura de software, bases de datos distribuidas, sincronización de datos, seguridad informática, desarrollo móvil multiplataforma e interacción humano-computadora. La resolución del problema de sincronización con conectividad intermitente obliga a aplicar de forma concreta los conceptos de consistencia eventual y resolución de conflictos que la literatura trata habitualmente en el plano teórico.'));
  c.push(U.p('El trabajo aporta además documentación sobre un caso de aplicación poco explorado en la literatura nacional: el diseño de sistemas de información para el sector ganadero boliviano bajo restricciones severas de conectividad. La evidencia de campo recogida y los resultados de la validación de usabilidad quedan disponibles como base para trabajos posteriores.'));

  // --- 1.7 Alcances y limitaciones ---
  c.push(U.h1('1.7.', 'Alcances y limitaciones'));

  c.push(U.h2('1.7.1.', 'Alcance funcional'));
  c.push(U.p('El sistema comprende la gestión de identidad y accesos con control por roles, el registro y la trazabilidad del inventario bovino con identificación individual, el historial sanitario con alertas de vencimiento, la estimación de peso mediante parámetros morfológicos, el registro de movimientos entre potreros, el control reproductivo, la referencia nutricional por raza y categoría, el registro de la comercialización, el mecanismo de evaluación ponderada para la selección de animales y un panel web para la consulta de reportes consolidados.'));
  c.push(U.p('Quedan fuera del alcance la contabilidad general del establecimiento, la gestión de planillas de personal, la gestión de compras e insumos y la integración con sistemas tributarios.'));

  c.push(U.h2('1.7.2.', 'Alcance tecnológico'));
  c.push(U.p('La aplicación móvil se desarrolla en Flutter con el lenguaje Dart, sobre una base de datos local en SQLite gestionada mediante Drift. El servicio central se desarrolla en NestJS con el mapeador Prisma sobre PostgreSQL, con apoyo de Redis para tareas de soporte. El panel de administración web se construye en Next.js. El despliegue se realiza mediante contenedores. La comunicación entre los clientes y el servicio se efectúa sobre una interfaz de programación de estilo REST protegida con autenticación por token.'));

  c.push(U.h2('1.7.3.', 'Alcance institucional y geográfico'));
  c.push(U.p('El desarrollo del sistema se realiza desde la ciudad de Santa Cruz de la Sierra. El caso de aplicación es el establecimiento ganadero Sabayones, en la zona del Izozog, Chaco del departamento de Santa Cruz. La validación piloto se ejecuta con productores de los municipios de Pailón, Abapó y San Julián, seleccionados por su representatividad del perfil productivo objetivo: explotaciones tradicionales con conectividad celular intermitente. Los resultados son potencialmente extensibles a otros departamentos del oriente boliviano que comparten ese perfil, pero esa extensión queda fuera del alcance del trabajo.'));

  c.push(U.h2('1.7.4.', 'Limitaciones'));
  c.push(U.p('La estimación de peso mediante fórmulas morfológicas tiene un margen de error inherente al método y no sustituye al pesaje directo cuando se dispone de equipamiento. El sistema entrega una aproximación útil para la toma de decisiones, no una medición certificada para efectos comerciales o legales.'));
  c.push(U.p('La validación de usabilidad se realiza con un grupo piloto reducido, lo que permite detectar problemas de diseño pero no sustenta inferencias estadísticas sobre la población total de productores del departamento. El período de evaluación posterior a la entrega es acotado y no permite medir efectos de largo plazo sobre la rentabilidad del hato.'));
  c.push(U.p('Finalmente, el sistema depende de que alguien registre la información con regularidad. La herramienta reduce el esfuerzo de registro, pero no elimina la necesidad de que los datos se ingresen en el momento en que ocurren los hechos.'));

  // --- 1.8 Delimitación ---
  c.push(U.h1('1.8.', 'Delimitación del proyecto'));

  c.push(U.h2('1.8.1.', 'Delimitación temática'));
  c.push(U.p('El estudio se circunscribe a la gestión productiva de explotaciones bovinas tradicionales orientadas a las etapas de crianza, destete y engorde, y abarca los procesos de control de inventario, gestión sanitaria, control reproductivo, estimación de peso, alimentación y comercialización. Quedan fuera del alcance temático las explotaciones de bovinos lecheros, los rubros de ovinos, caprinos y camélidos, y la integración con sistemas externos de comercialización mayorista o frigoríficos.'));
  c.push(U.p('Las razas consideradas para la calibración del algoritmo de estimación de peso son Nelore, Brahman, Criollo y Santa Gertrudis. Los marcos de referencia aplicados incluyen el estándar IEEE 830 para la especificación de requisitos, las pautas WCAG 2.1 en nivel AA para accesibilidad, las recomendaciones zootécnicas para ganado bovino tropical y la normativa sanitaria del SENASAG para el calendario obligatorio de vacunaciones.'));

  c.push(U.h2('1.8.2.', 'Delimitación espacial'));
  c.push(U.p('El desarrollo se realiza desde la ciudad de Santa Cruz de la Sierra. El caso de aplicación es el establecimiento ganadero Sabayones, en la zona del Izozog. La validación piloto se ejecuta con productores de Pailón, Abapó y San Julián.'));

  c.push(U.h2('1.8.3.', 'Delimitación temporal'));
  c.push(U.p('El trabajo de investigación, desarrollo y validación se ejecuta durante el periodo 2026–2027, conforme al cronograma detallado en el Capítulo VI. El diagnóstico de campo se aplicó durante el primer semestre de 2026.'));

  c.push(U.h2('1.8.4.', 'Delimitación tecnológica'));
  c.push(U.p('La solución se construye exclusivamente con herramientas de código abierto, sin dependencia de licencias comerciales en ninguna de sus capas, conforme a la restricción presupuestaria establecida en la especificación de requisitos. La aplicación móvil está destinada a dispositivos de gama media y baja, que son los disponibles en el entorno de uso.'));

  return c;
};
