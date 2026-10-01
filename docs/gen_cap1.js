const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  PageNumber, Footer, Table, TableRow, TableCell, WidthType, ShadingType,
  BorderStyle, PageBreak, LevelFormat, convertInchesToTwip,
} = require('docx');

// --- Formato institucional UNIVALLE -----------------------------------------
const FUENTE = 'Arial';
const CUERPO = 22;   // 11 pt (medios puntos)
const H1 = 26;       // 13 pt
const H2 = 24;       // 12 pt
const H3 = 22;       // 11 pt
const INTERLINEADO = 360; // 1,5 líneas
const SANGRIA = 709;      // ~1,25 cm

const p = (texto, opc = {}) => new Paragraph({
  alignment: opc.alignment ?? AlignmentType.JUSTIFIED,
  spacing: { line: INTERLINEADO, after: opc.after ?? 120 },
  indent: opc.sinSangria ? undefined : { firstLine: SANGRIA },
  children: [new TextRun({ text: texto, font: FUENTE, size: opc.size ?? CUERPO, bold: opc.bold, italics: opc.italics })],
});

// Párrafo con tramos de formato mixto: [['texto', {bold:true}], ...]
const pMixto = (tramos, opc = {}) => new Paragraph({
  alignment: opc.alignment ?? AlignmentType.JUSTIFIED,
  spacing: { line: INTERLINEADO, after: opc.after ?? 120 },
  indent: opc.sinSangria ? undefined : { firstLine: SANGRIA },
  children: tramos.map(([t, f = {}]) => new TextRun({ text: t, font: FUENTE, size: CUERPO, ...f })),
});

const h1 = (numero, texto) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 240, line: INTERLINEADO },
  children: [new TextRun({ text: `${numero}\t${texto.toUpperCase()}`, font: FUENTE, size: H1, bold: true })],
});

const h2 = (numero, texto) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 300, after: 180, line: INTERLINEADO },
  children: [new TextRun({ text: `${numero}\t${texto.toUpperCase()}`, font: FUENTE, size: H2, bold: true, italics: true })],
});

const h3 = (numero, texto) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 240, after: 160, line: INTERLINEADO },
  children: [new TextRun({ text: `${numero}\t${texto}`, font: FUENTE, size: H3, italics: true })],
});

const tituloCapitulo = (linea1, linea2) => [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2400, after: 240 },
    children: [new TextRun({ text: linea1, font: FUENTE, size: H1, bold: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 480 },
    children: [new TextRun({ text: linea2, font: FUENTE, size: H1, bold: true })] }),
];

const saltoPagina = () => new Paragraph({ children: [new PageBreak()] });

// Cuadro con rótulo arriba y fuente abajo, según la norma institucional.
const cuadro = (numero, titulo, encabezados, filas, fuente) => {
  const anchoTotal = 9360;
  const anchos = encabezados.map((_, i) => i === 0
    ? Math.round(anchoTotal * 0.26)
    : Math.round((anchoTotal * 0.74) / (encabezados.length - 1)));

  const celda = (texto, { negrita = false, sombreado = false } = {}, ancho) => new TableCell({
    width: { size: ancho, type: WidthType.DXA },
    shading: sombreado ? { type: ShadingType.CLEAR, fill: 'D9D9D9' } : undefined,
    margins: { top: 80, bottom: 80, left: 110, right: 110 },
    children: [new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { line: 240, after: 0 },
      children: [new TextRun({ text: texto, font: FUENTE, size: 20, bold: negrita })],
    })],
  });

  return [
    new Paragraph({
      spacing: { before: 240, after: 100 }, alignment: AlignmentType.LEFT,
      children: [
        new TextRun({ text: `Cuadro ${numero}. `, font: FUENTE, size: CUERPO, bold: true }),
        new TextRun({ text: titulo, font: FUENTE, size: CUERPO }),
      ],
    }),
    new Table({
      columnWidths: anchos,
      width: { size: anchoTotal, type: WidthType.DXA },
      rows: [
        new TableRow({
          tableHeader: true,
          children: encabezados.map((e, i) => celda(e, { negrita: true, sombreado: true }, anchos[i])),
        }),
        ...filas.map((f) => new TableRow({ children: f.map((c, i) => celda(c, {}, anchos[i])) })),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 240 }, alignment: AlignmentType.LEFT,
      children: [
        new TextRun({ text: 'Fuente: ', font: FUENTE, size: 20, bold: true }),
        new TextRun({ text: fuente, font: FUENTE, size: 20 }),
      ],
    }),
  ];
};

// --- Contenido ---------------------------------------------------------------
const contenido = [];

// ===== INTRODUCCIÓN =====
contenido.push(...tituloCapitulo('INTRODUCCIÓN', ''));

contenido.push(p('La ganadería bovina es una de las actividades económicas más importantes del departamento de Santa Cruz. Según la Federación de Ganaderos de Santa Cruz, el departamento concentra cerca de siete millones de cabezas, distribuidas entre grandes empresas agropecuarias y cientos de productores organizados en asociaciones locales: la Asociación de Ganaderos de Pailón en la provincia Chiquitos, la de Abapó en Cordillera, y distintas agrupaciones de la Chiquitanía, como las de San Julián y Cuatro Cañadas.'));

contenido.push(p('Buena parte de esos productores maneja el ganado hoy como se hacía hace décadas: con cuadernos, estimaciones visuales y memoria. El animal nace, se anota algo en un papel, y el resto queda en la cabeza del dueño. El historial de vacunas, los tratamientos y los eventos reproductivos dependen de que el productor los recuerde o los encuentre en alguna hoja suelta. No es falta de interés: es que no existe una herramienta que funcione en esas condiciones.'));

contenido.push(p('El presente proyecto desarrolla GanaBol, un sistema móvil de gestión ganadera con funcionamiento sin conexión, orientado a explotaciones bovinas tradicionales del departamento de Santa Cruz. El sistema permite registrar el inventario bovino con identificación individual, llevar el historial sanitario de cada animal, estimar su peso en campo mediante parámetros morfológicos sin pesarlo físicamente, y apoyar la decisión de venta mediante criterios objetivos. El caso de estudio aplicado es el establecimiento ganadero Sabayones, ubicado en la zona del Izozog, Chaco del departamento de Santa Cruz.'));

contenido.push(p('El alcance de la propuesta comprende una aplicación móvil desarrollada en Flutter, que opera con almacenamiento local y sincroniza con el servidor cuando hay conectividad, y un panel web de administración para la consulta de reportes consolidados. La metodología de desarrollo adoptada es el modelo incremental, que organiza la construcción en ciclos sucesivos, cada uno con sus propias fases de análisis, diseño, implementación y pruebas, y cada uno validado con usuarios reales antes de iniciar el siguiente.'));

contenido.push(p('Como resultado se espera un sistema funcional, validado en campo mediante la escala de usabilidad del sistema (SUS), que permita al productor sustituir el registro en papel por un registro digital que no dependa de la señal de internet. El diagnóstico que sustenta el diseño proviene de un instrumento aplicado a veintitrés productores del departamento, complementado con observación directa y entrevistas informales en terreno.'));

contenido.push(p('El documento se organiza en siete capítulos. El Capítulo I plantea el problema, los objetivos y la justificación del proyecto. El Capítulo II desarrolla el marco teórico y referencial que fundamenta las decisiones técnicas. El Capítulo III describe el marco metodológico de la investigación y del desarrollo. El Capítulo IV presenta el análisis y la especificación de requisitos. El Capítulo V documenta el diseño de la solución. El Capítulo VI detalla el desarrollo, la implementación y la validación del sistema. El Capítulo VII evalúa el proyecto respecto a sus objetivos, su calidad y su impacto. Finalmente se presentan las conclusiones, las recomendaciones, las referencias bibliográficas, el glosario, los apéndices y los anexos.'));

contenido.push(saltoPagina());

// ===== CAPÍTULO I =====
contenido.push(...tituloCapitulo('CAPÍTULO I', 'PLANTEAMIENTO DEL PROBLEMA'));

// --- 1.1 ANTECEDENTES ---
contenido.push(h1('1.1.', 'Antecedentes'));

contenido.push(h2('1.1.1.', 'Antecedentes institucionales'));
contenido.push(p('El departamento de Santa Cruz concentra más del 60 % del hato bovino de Bolivia. La Federación de Ganaderos de Santa Cruz (FEGASACRUZ) agrupa a las asociaciones departamentales, entre ellas la Asociación de Ganaderos de Pailón en la provincia Chiquitos y la de Abapó en Cordillera, además de distintas agrupaciones de la Chiquitanía como las de San Julián y Cuatro Cañadas. Estas asociaciones concentran a productores que operan en superficies extensas, con escasa cobertura de conectividad y acceso irregular a servicios técnicos.'));
contenido.push(p('El caso de estudio aplicado del presente proyecto es el establecimiento ganadero Sabayones, propiedad familiar ubicada en la zona del Izozog, Chaco del departamento de Santa Cruz. El establecimiento opera bajo un sistema de pastoreo extensivo en campo natural y presenta las mismas condiciones que caracterizan a la mayoría de las explotaciones de la zona: ausencia de registros digitales, conectividad intermitente y distancias considerables entre las áreas de manejo del hato.'));

contenido.push(h2('1.1.2.', 'Antecedentes tecnológicos'));
contenido.push(p('El productor ganadero de la zona dispone hoy de más capacidad tecnológica de la que utiliza. El instrumento aplicado durante el diagnóstico de este proyecto reveló que el 87 % de los encuestados posee un teléfono inteligente con capacidad técnica suficiente para ejecutar una aplicación de gestión, mientras que ninguno utiliza actualmente una herramienta digital especializada para el manejo de su hato. La brecha, por tanto, no está en el hardware disponible sino en la ausencia de software adecuado al contexto.'));
contenido.push(p('En paralelo, la maduración de los marcos de desarrollo multiplataforma y de las bases de datos embebidas en el dispositivo ha hecho viable construir aplicaciones que operan de forma autónoma sin conexión permanente, sincronizando con un servidor central únicamente cuando la red está disponible. Esta capacidad técnica, que hace una década implicaba un esfuerzo de ingeniería considerable, hoy está al alcance de un proyecto de grado.'));

contenido.push(h2('1.1.3.', 'Antecedentes investigativos'));
contenido.push(p('La literatura zootécnica documenta desde hace décadas la posibilidad de estimar el peso vivo de un bovino a partir de medidas morfológicas tomadas con cinta métrica, sin necesidad de pesarlo físicamente. Bavera (2005) documenta además el patrón de gestión empírica en productores de menos de doscientas cabezas en varios países de la región, con consecuencias directas sobre la sanidad y la rentabilidad del hato. Cano et al. (2016) desarrollan la relación entre el perímetro torácico, la longitud corporal y el peso vivo, base de la fórmula que incorpora el presente sistema.'));
contenido.push(p('Sobre la adopción de tecnología en entornos rurales, los modelos de Davis (1989) y Rogers (2003) establecen que la utilidad percibida y la facilidad de uso son los dos factores determinantes en la decisión de uso continuo de una herramienta digital. Esta evidencia orientó las decisiones de diseño de interfaz documentadas en el Capítulo V.'));

contenido.push(h2('1.1.4.', 'Soluciones existentes en el mercado'));
contenido.push(p('En el mercado existen plataformas de gestión ganadera como SIGGAN o BoviGest, orientadas al registro del inventario, el seguimiento sanitario y la generación de reportes productivos. Ambas resuelven el problema de la gestión del hato para operaciones de escala considerable, con infraestructura tecnológica disponible y personal capacitado para operarlas.'));

contenido.push(h2('1.1.5.', 'Limitaciones de las soluciones actuales'));
contenido.push(p('Estas plataformas están pensadas para un contexto distinto al del productor cruceño tradicional. Requieren conexión permanente a internet, dispositivos de gama alta y un nivel de capacitación digital que no corresponde al perfil del usuario objetivo. En zonas como Pailón, Abapó o buena parte de la Chiquitanía, la señal de internet es intermitente en el mejor de los casos y, con frecuencia, inexistente.'));
contenido.push(p('A la restricción de conectividad se suma el costo: las licencias de estas plataformas superan lo que el productor de este perfil puede o está dispuesto a pagar, especialmente cuando la herramienta no resuelve el problema que más le cuesta dinero, que es estimar correctamente el peso del animal al momento de venderlo. Esta brecha entre lo que el mercado ofrece y lo que el productor necesita es la que el presente proyecto busca cerrar.'));

// --- 1.2 SITUACIÓN PROBLEMÁTICA ---
contenido.push(h1('1.2.', 'Descripción de la situación problemática'));

contenido.push(h2('1.2.1.', 'Descripción del contexto'));
contenido.push(p('La actividad ganadera en las zonas de Abapó, el Izozog y la Chiquitanía se organiza en torno a los ciclos biológicos del ganado bovino: la gestión reproductiva, el seguimiento sanitario, el control del peso y la planificación de la comercialización. Cada ciclo genera información que, registrada y procesada adecuadamente, permitiría al productor tomar decisiones informadas sobre el manejo de su hato.'));
contenido.push(p('Las explotaciones de la zona se caracterizan por superficies extensas, conectividad escasa y condiciones climáticas que dificultan el acceso permanente a los predios. El productor trabaja a la intemperie, con las manos ocupadas, y registra los datos en el momento en que ocurren los hechos: durante la vacunación, al medir un animal, al detectar una enfermedad. Cualquier herramienta que no funcione en esas condiciones queda sin uso.'));

contenido.push(h2('1.2.2.', 'Actores involucrados'));
contenido.push(p('En la operación del establecimiento ganadero intervienen cuatro actores con responsabilidades diferenciadas, que el sistema debe reconocer y delimitar mediante permisos distintos:'));
contenido.push(...cuadro(
  '1.1', 'Actores involucrados en la gestión del establecimiento ganadero',
  ['Actor', 'Responsabilidad principal', 'Relación con la información'],
  [
    ['Propietario', 'Decidir sobre la venta, la reposición y la inversión en el hato', 'Necesita la información consolidada para decidir; hoy depende de su memoria y de registros dispersos'],
    ['Personal de campo', 'Ejecutar el manejo diario: vacunación, traslados, observación del hato', 'Genera la información en el momento del hecho, pero carece de un medio para registrarla en el lugar'],
    ['Veterinario', 'Diagnosticar, indicar tratamientos y definir calendarios sanitarios', 'Requiere el historial previo del animal, que habitualmente no está disponible en la visita'],
    ['Administrador', 'Gestionar usuarios, parámetros del predio y respaldo de la información', 'Responsable de que los datos existan, sean consistentes y estén resguardados'],
  ],
  'Elaboración propia, 2026.',
));

contenido.push(h2('1.2.3.', 'Procesos actuales'));
contenido.push(p('El productor trabaja, en términos generales, sin registros confiables. No porque no quiera llevarlos, sino porque los métodos disponibles no se adaptan a cómo trabaja en campo. Revisar un cuaderno bajo la lluvia, buscar un dato entre hojas sueltas o recordar cuándo fue la última vacuna de un animal entre ciento cincuenta son problemas cotidianos que ningún sistema del mercado ha resuelto para este perfil de usuario.'));
contenido.push(p('El diagnóstico aplicado confirma este patrón: el 52 % de los encuestados lleva sus registros en cuadernos físicos o planillas de cálculo, y un porcentaje significativo declara no llevar ningún registro formal. El 70 % actualiza su información de forma mensual o únicamente cuando ocurre un evento relevante, como un nacimiento, una muerte, una venta o una vacunación. Esto implica que los datos disponibles al momento de tomar una decisión comercial o sanitaria pueden estar desactualizados por semanas.'));

contenido.push(h2('1.2.4.', 'Recursos tecnológicos disponibles'));
contenido.push(p('El productor dispone de un teléfono inteligente, habitualmente de gama media o baja, que utiliza para comunicación y mensajería. No dispone de conexión estable a internet en el predio, de computadora de escritorio en el lugar de trabajo, ni de equipamiento de pesaje en la mayoría de los casos. El acceso a electricidad en las áreas de manejo es limitado, lo que restringe la autonomía de cualquier dispositivo que dependa de carga frecuente.'));
contenido.push(p('Esta configuración de recursos define el marco dentro del cual la solución debe operar: un único dispositivo, sin red garantizada, con batería limitada y sin equipamiento complementario.'));

contenido.push(h2('1.2.5.', 'Deficiencias identificadas'));
contenido.push(p('Las consecuencias de la gestión actual son concretas y cuantificables. Cuando el productor va a vender un animal, estima el peso visualmente y con frecuencia se equivoca, lo que le genera pérdidas directas en la negociación: el 55 % de los encuestados reconoce haber vendido algún animal por debajo de su valor real de mercado por desconocer su peso. No sabe qué animal tiene mejor condición para vender porque no cuenta con un historial objetivo. Las vacunas se retrasan porque no hay un sistema que avise. Y si un animal se enferma, es difícil determinar si ya tuvo ese problema antes o qué tratamientos recibió: el 60 % declara haber perdido información importante sobre algún animal.'));
contenido.push(p('Estas deficiencias convergen en cuatro problemas centrales: la ausencia de trazabilidad individual del ganado, la desactualización crónica de los registros, la falta de herramientas de apoyo a la comercialización y la imposibilidad de usar las soluciones existentes por la restricción de conectividad.'));

// --- 1.3 FORMULACIÓN ---
contenido.push(h1('1.3.', 'Formulación del problema'));
contenido.push(p('¿De qué manera el desarrollo de un sistema móvil de gestión ganadera con funcionamiento sin conexión puede mejorar el registro del inventario bovino, el seguimiento sanitario individual y la toma de decisiones estratégicas a lo largo de las fases de crianza, destete y engorde en explotaciones ganaderas tradicionales del departamento de Santa Cruz, Bolivia?'));

// --- 1.4 SISTEMATIZACIÓN ---
contenido.push(h1('1.4.', 'Sistematización del problema'));
contenido.push(p('De la pregunta central se desprenden cinco preguntas específicas que orientan el desarrollo del proyecto:'));

contenido.push(h2('1.4.1.', '¿Cuáles son las características del proceso actual?'));
contenido.push(p('Cómo registra hoy el productor la información de su hato, con qué medios, con qué frecuencia y qué información se pierde en el camino. La respuesta a esta pregunta se desarrolla en el diagnóstico del Capítulo IV.'));

contenido.push(h2('1.4.2.', '¿Qué necesidades funcionales y no funcionales deben considerarse?'));
contenido.push(p('Qué debe hacer el sistema para resolver los problemas identificados y bajo qué restricciones de operación, rendimiento, seguridad y usabilidad debe hacerlo, considerando que el entorno de uso impone condiciones que no son negociables.'));

contenido.push(h2('1.4.3.', '¿Qué arquitectura tecnológica resulta adecuada?'));
contenido.push(p('Qué organización de componentes permite que la aplicación opere de forma autónoma sin conexión, sincronice de forma confiable cuando la red aparece y mantenga la integridad de los datos durante ese proceso.'));

contenido.push(h2('1.4.4.', '¿Cómo se verificará la calidad de la solución?'));
contenido.push(p('Con qué pruebas y con qué criterios medibles se determinará que el sistema cumple lo que promete, tanto en su comportamiento técnico como en su utilidad para el productor en condiciones reales de campo.'));

contenido.push(h2('1.4.5.', '¿Qué beneficios técnicos y organizacionales se obtendrán?'));
contenido.push(p('Qué cambia en la operación del establecimiento ganadero al incorporar el sistema, y qué evidencia permite afirmar que ese cambio representa una mejora respecto a la situación de partida.'));

// --- 1.5 OBJETIVOS ---
contenido.push(h1('1.5.', 'Objetivos'));

contenido.push(h2('1.5.1.', 'Objetivo general'));
contenido.push(p('Desarrollar un sistema móvil con panel de administración web que permita a productores ganaderos tradicionales del departamento de Santa Cruz gestionar el inventario bovino con registro de identificación individual e historial sanitario completo, estimar el peso de los animales mediante parámetros morfológicos medibles en campo sin pesarlos físicamente, generar alertas automáticas sobre eventos sanitarios y reproductivos pendientes, y apoyar la selección de animales para venta mediante una evaluación ponderada de criterios objetivos, con funcionamiento sin conexión en entornos rurales con conectividad limitada o nula.'));

contenido.push(h2('1.5.2.', 'Objetivos específicos'));
contenido.push(p('Para alcanzar el objetivo general se plantean los siguientes objetivos específicos:', { sinSangria: true }));

const especificos = [
  ['a)', 'Diseñar e implementar una arquitectura móvil con funcionamiento sin conexión y sincronización diferida que permita el uso estable del sistema en zonas del departamento de Santa Cruz con conectividad nula o limitada, garantizando el registro continuo de datos sin importar en qué área de la explotación se encuentren los animales.'],
  ['b)', 'Desarrollar un módulo de registro y trazabilidad de inventario bovino que identifique a cada animal de forma individual y permita hacer un seguimiento estructurado de su transición a través de las fases productivas de crianza, destete y engorde.'],
  ['c)', 'Implementar un módulo de historial sanitario individual con registro de vacunas y tratamientos, generando alertas automáticas específicas para los protocolos preventivos que requiere cada etapa: cuidados del ternero en crianza, manejo del estrés en destete y sanidad en engorde.'],
  ['d)', 'Integrar fórmulas morfológicas basadas en bibliografía zootécnica para estimar el peso corporal en campo sin pesar al animal, facilitando el monitoreo de la curva de crecimiento y la ganancia de peso diaria, especialmente durante la fase de engorde.'],
  ['e)', 'Implementar un mecanismo de evaluación ponderada que asista en la toma de decisiones estratégicas, determinando el momento óptimo para la venta o la finalización del engorde con base en criterios objetivos como el peso estimado, la edad y el estado sanitario.'],
  ['f)', 'Desarrollar un panel de administración web que, al contar con conectividad, permita visualizar reportes consolidados del hato, analizando índices de eficiencia, mermas o mejoras en el rendimiento entre las etapas de crianza, destete y engorde.'],
];
especificos.forEach(([letra, texto]) => {
  contenido.push(pMixto([[`${letra} `, { bold: true }], [texto]], { sinSangria: true, after: 160 }));
});

// --- 1.6 JUSTIFICACIÓN ---
contenido.push(h1('1.6.', 'Justificación'));

contenido.push(h2('1.6.1.', 'Justificación técnica'));
contenido.push(p('El principal desafío técnico de este proyecto no es el registro de animales, que por sí solo sería insuficiente para un trabajo de grado, sino la combinación de tres componentes que implican complejidad real.'));
contenido.push(p('El primero es la arquitectura con funcionamiento sin conexión: lograr que la aplicación opere de forma completamente autónoma sin internet, gestione los conflictos de sincronización cuando la conexión aparece y garantice la integridad de los datos en ese proceso. Es un problema de ingeniería concreto y no trivial, que condiciona el diseño desde la generación misma de los identificadores.'));
contenido.push(p('El segundo es la estimación de peso mediante parámetros morfológicos. Existen fórmulas validadas en la bibliografía zootécnica, basadas en el perímetro torácico y la longitud corporal, que permiten aproximar el peso de un bovino sin pesarlo físicamente. Implementarlas en una aplicación usable en campo, con entrada de datos simple y resultado inmediato, tiene valor técnico y práctico.'));
contenido.push(p('El tercero es el mecanismo de evaluación ponderada para la selección de animales. Asignar puntajes según criterios objetivos y generar un orden que oriente la decisión de venta es un componente de apoyo a la decisión que eleva la complejidad del sistema más allá del registro simple.'));

contenido.push(h2('1.6.2.', 'Justificación económica'));
contenido.push(p('Para un productor con ochenta animales, equivocarse en quince kilos al estimar el peso de venta de diez de ellos puede significar una pérdida de varios cientos de dólares por ciclo. No es un número hipotético: es el resultado directo de negociar sin datos, y lo confirma el 55 % de encuestados que reconoce haber vendido por debajo del valor real. A eso se suma el costo de las enfermedades no detectadas a tiempo, los tratamientos repetidos por falta de historial y la venta de animales que no eran los más convenientes porque no había forma objetiva de compararlos.'));
contenido.push(p('Una herramienta que corrija esos tres problemas tiene un retorno económico tangible, incluso si mejora la precisión solo de forma parcial. Al estar diseñada para los dispositivos que el productor ya posee y funcionar sin internet, el costo de adopción es prácticamente nulo: no requiere inversión en infraestructura, no tiene licencia mensual y no depende de que el predio tenga señal.'));

contenido.push(h2('1.6.3.', 'Justificación social'));
contenido.push(p('Las asociaciones de ganaderos del departamento agrupan a productores que, en su mayoría, no tienen acceso regular a veterinarios ni a técnicos agropecuarios. El conocimiento sobre sanidad animal y manejo productivo se transmite por experiencia propia y por lo que se comparte entre vecinos. No es que falte disposición: falta acceso.'));
contenido.push(p('Una aplicación que lleve el historial sanitario, avise cuándo vence una vacuna y ayude a decidir qué animal vender no reemplaza al técnico, pero reduce la dependencia de uno. El productor puede tomar mejores decisiones de forma autónoma, en su propio predio, sin esperar una visita que quizás tarde semanas. En un sector donde la brecha digital sigue siendo amplia, una herramienta así funciona además como punto de entrada a la tecnificación de la gestión ganadera.'));

contenido.push(h2('1.6.4.', 'Justificación académica'));
contenido.push(p('El proyecto integra en un mismo sistema conocimientos de varias áreas de la carrera de Ingeniería de Sistemas: arquitectura de software, bases de datos distribuidas, sincronización de datos, seguridad informática, desarrollo móvil multiplataforma e interacción humano-computadora. La resolución del problema de sincronización con conectividad intermitente, en particular, obliga a aplicar de forma concreta los conceptos de consistencia eventual y resolución de conflictos que la literatura trata habitualmente en el plano teórico.'));
contenido.push(p('El trabajo aporta además documentación sobre un caso de aplicación poco explorado en la literatura nacional: el diseño de sistemas de información para el sector ganadero boliviano bajo restricciones severas de conectividad. La evidencia de campo recogida y los resultados de la validación de usabilidad quedan disponibles como base para trabajos posteriores en el mismo sector.'));

// --- 1.7 ALCANCES Y LIMITACIONES ---
contenido.push(h1('1.7.', 'Alcances y limitaciones'));

contenido.push(h2('1.7.1.', 'Alcance funcional'));
contenido.push(p('El sistema comprende la gestión de identidad y accesos con control por roles, el registro y la trazabilidad del inventario bovino con identificación individual, el historial sanitario con alertas de vencimiento, la estimación de peso mediante parámetros morfológicos, el mecanismo de evaluación ponderada para la selección de animales y un panel web para la consulta de reportes consolidados.'));
contenido.push(p('Quedan fuera del alcance la gestión contable y financiera del establecimiento, la integración con sistemas oficiales de trazabilidad nacional, la facturación de ventas y el control de inventario de insumos distintos a los sanitarios.'));

contenido.push(h2('1.7.2.', 'Alcance tecnológico'));
contenido.push(p('La aplicación móvil se desarrolla en Flutter con base de datos local, el servidor en NestJS sobre Node.js con PostgreSQL como base de datos central, y el panel de administración web en Next.js. El despliegue se realiza mediante contenedores. La comunicación entre la aplicación y el servidor se efectúa sobre una interfaz de programación de tipo REST protegida con autenticación por token.'));

contenido.push(h2('1.7.3.', 'Alcance institucional y geográfico'));
contenido.push(p('El caso de estudio aplicado es el establecimiento ganadero Sabayones, en la zona del Izozog, Chaco del departamento de Santa Cruz. El diagnóstico que fundamenta el diseño abarca productores de Abapó, la Chiquitanía y otras localidades del departamento. Los resultados son extensibles a explotaciones con características similares dentro del departamento, pero no se formulan afirmaciones sobre su validez en otras regiones del país o en sistemas productivos distintos al pastoreo extensivo.'));

contenido.push(h2('1.7.4.', 'Limitaciones'));
contenido.push(p('La estimación de peso mediante fórmulas morfológicas tiene un margen de error inherente al método y no sustituye al pesaje directo cuando se dispone de equipamiento. El sistema entrega una aproximación útil para la toma de decisiones, no una medición certificada para efectos comerciales o legales.'));
contenido.push(p('La validación de usabilidad se realiza con un grupo piloto reducido, lo que permite detectar problemas de diseño pero no sustenta inferencias estadísticas sobre la población total de productores del departamento. El período de evaluación posterior a la entrega es acotado y no permite medir efectos de largo plazo sobre la rentabilidad del hato.'));
contenido.push(p('Finalmente, el sistema depende de que el productor registre la información con regularidad. La herramienta reduce el esfuerzo de registro, pero no elimina la necesidad de que alguien ingrese los datos en el momento en que ocurren los hechos.'));

// --- 1.8 DELIMITACIÓN ---
contenido.push(h1('1.8.', 'Delimitación del proyecto'));

contenido.push(h2('1.8.1.', 'Delimitación temporal'));
contenido.push(p('El proyecto se ejecuta durante la gestión académica 2026, conforme al cronograma detallado en el Capítulo VI. El diagnóstico de campo se realizó durante el primer semestre de ese año.'));

contenido.push(h2('1.8.2.', 'Delimitación espacial'));
contenido.push(p('El desarrollo y la validación se circunscriben al establecimiento ganadero Sabayones, en la zona del Izozog, Chaco del departamento de Santa Cruz, con participación complementaria de productores de Abapó y la Chiquitanía durante la fase de diagnóstico.'));

contenido.push(h2('1.8.3.', 'Delimitación temática'));
contenido.push(p('El trabajo aborda la gestión operativa del hato bovino en sus fases de crianza, destete y engorde. No comprende aspectos de genética, mejoramiento zootécnico, nutrición formulada ni manejo de pasturas, que exceden tanto el alcance de la carrera como el del presente proyecto.'));

contenido.push(h2('1.8.4.', 'Delimitación tecnológica'));
contenido.push(p('La solución se construye exclusivamente con herramientas de código abierto, sin dependencia de licencias comerciales en ninguna de sus capas. La aplicación móvil está destinada a dispositivos de gama media y baja, que son los disponibles en el entorno de uso.'));

// --- Referencias del capítulo ---
contenido.push(new Paragraph({
  spacing: { before: 400, after: 120 }, alignment: AlignmentType.LEFT,
  children: [new TextRun({ text: 'Referencias del capítulo', font: FUENTE, size: CUERPO, bold: true })],
}));
const refs = [
  'Bavera, G. A. (2005). Manejo de bovinos para carne. Sitio Argentino de Producción Animal. https://www.produccion-animal.com.ar',
  'Cano, G., Blanco, M., Casasús, I., Cortés-Lacruz, X., & Villalba, D. (2016). Comparison of B-splines and non-linear functions to describe growth patterns. Journal of Animal Science, 94(5), 1787–1799.',
  'Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. MIS Quarterly, 13(3), 319–340.',
  'Federación de Ganaderos de Santa Cruz. (2021). Memoria institucional. FEGASACRUZ.',
  'Instituto Nacional de Estadística. (2024). Estadísticas del sector agropecuario. INE Bolivia. https://www.ine.gob.bo',
  'Rogers, E. M. (2003). Diffusion of innovations (5.ª ed.). Free Press.',
];
refs.forEach((r) => contenido.push(new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing: { line: INTERLINEADO, after: 100 },
  indent: { left: 567, hanging: 567 },
  children: [new TextRun({ text: r, font: FUENTE, size: 20 })],
})));

// --- Documento ---------------------------------------------------------------
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: FUENTE, size: CUERPO } },
      heading1: { run: { font: FUENTE, size: H1, bold: true, color: '000000' } },
      heading2: { run: { font: FUENTE, size: H2, bold: true, italics: true, color: '000000' } },
      heading3: { run: { font: FUENTE, size: H3, italics: true, color: '000000' } },
    },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { left: 1701, right: 1134, top: 1417, bottom: 1417 },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ children: [PageNumber.CURRENT], font: FUENTE, size: CUERPO })],
        })],
      }),
    },
    children: contenido,
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync('/home/claude/ganabol/docs/GanaBol_Cap1_Planteamiento.docx', buffer);
  console.log('Documento generado.');
});
