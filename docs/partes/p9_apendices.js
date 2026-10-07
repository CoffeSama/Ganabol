/**
 * Apéndices y anexos.
 *
 * El índice distingue lo que este documento incorpora de lo que queda por
 * adjuntar, porque enumerar un apéndice sin contenido es peor que no
 * enumerarlo: promete una evidencia que el lector no encuentra.
 *
 * Los apéndices D y E se componen a partir de los documentos técnicos del
 * proyecto en el momento de generar, de modo que no pueden divergir de su
 * origen. Los apéndices F, G y H y los anexos E y F recogen material del
 * repositorio y de la ejecución real de las pruebas.
 */
const fs = require('fs');
const path = require('path');
const U = require('../univalle');
const F = require('../fuentes');

const CASOS_USO = [
  ['5.1. CU-01. GESTIONAR USUARIOS Y ROLES', 'CU-01'],
  ['5.2. CU-02. REGISTRAR Y ADMINISTRAR EL GANADO', 'CU-02'],
  ['5.3. CU-03. OPERAR Y REGISTRAR SIN CONEXIÓN', 'CU-03'],
  ['5.4. CU-04. ESTIMAR EL PESO POR MÉTODO MORFOMÉTRICO', 'CU-04'],
  ['5.5. CU-05. REGISTRAR EVENTO SANITARIO', 'CU-05'],
  ['5.6. CU-06. GESTIONAR FASES Y DESTETE', 'CU-06'],
  ['5.7. CU-07. CONSULTAR REFERENCIA NUTRICIONAL', 'CU-07'],
  ['5.8. CU-08. REGISTRAR MOVIMIENTOS Y UBICACIÓN', 'CU-08'],
  ['5.9. CU-09. REGISTRAR LA COMERCIALIZACIÓN', 'CU-09'],
  ['5.10. CU-10. SINCRONIZAR Y RESOLVER CONFLICTOS', 'CU-10'],
  ['5.11. CU-11. CONSULTAR EL ESTADO DEL HATO', 'CU-11'],
  ['5.12. CU-12. EMITIR REPORTES', 'CU-12'],
  ['5.13. CU-13. GESTIONAR ALERTAS', 'CU-13'],
  ['5.14. CU-14. REGISTRAR UN EVENTO REPRODUCTIVO', 'CU-14'],
  ['5.15. CU-15. EVALUAR ANIMAL PARA VENTA', 'CU-15'],
];

const TABLAS = [
  ['usuario', 'Personas que acceden al sistema'],
  ['potrero', 'Ubicaciones físicas del establecimiento'],
  ['animal', 'Animales del hato'],
  ['pesaje', 'Mediciones morfométricas y peso estimado'],
  ['evento_sanitario', 'Eventos sanitarios del hato'],
  ['movimiento', 'Traslados de animales entre potreros'],
  ['referencia_nutricional', 'Requerimientos nutricionales por raza y categoría'],
  ['venta', 'Operaciones de comercialización'],
  ['venta_detalle', 'Animales comprendidos en cada venta'],
  ['registro_sync', 'Control del estado de sincronización'],
  ['plan_sanitario', 'Protocolos sanitarios configurables'],
  ['alerta', 'Tareas sanitarias y reproductivas pendientes'],
  ['evento_reproductivo', 'Servicios, diagnósticos de preñez y partos'],
  ['criterio_evaluacion', 'Criterios y pesos de la evaluación ponderada'],
  ['evaluacion', 'Puntaje ponderado por animal'],
];

/** Lee un archivo del repositorio y devuelve el tramo de líneas indicado. */
function fragmento(relativo, desde, hasta) {
  const ruta = path.join(__dirname, '..', '..', relativo);
  if (!fs.existsSync(ruta)) return [`[No disponible: ${relativo}]`];
  return fs.readFileSync(ruta, 'utf8').split('\n').slice(desde - 1, hasta);
}

/** Bloque de código, en tipografía monoespaciada e interlineado sencillo. */
const codigo = U.bloqueCodigo;

/** Texto de un archivo de salida capturado durante la ejecución real. */
function salida(ruta, max = 200) {
  if (!fs.existsSync(ruta)) return ['[Salida no disponible]'];
  return fs.readFileSync(ruta, 'utf8').split('\n').slice(0, max);
}

module.exports = function apendices() {
  const c = [];

  // ===================== APÉNDICES =====================
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('APÉNDICES', { enIndice: true, before: 300, after: 300 }));
  c.push(U.p('Los apéndices recogen material elaborado por el autor que amplía el contenido del documento sin resultar imprescindible para su lectura. Se indica junto a cada uno si se incorpora al presente documento o si queda pendiente de adjuntar.'));

  [
    ['Apéndice A', 'Instrumento de diagnóstico aplicado a los productores, con sus cinco dimensiones y el detalle de las respuestas tabuladas.', false],
    ['Apéndice B', 'Guía de la entrevista semiestructurada aplicada a los especialistas del sector.', true],
    ['Apéndice C', 'Ficha de observación directa empleada en las visitas a las explotaciones.', true],
    ['Apéndice D', 'Especificación completa de los quince casos de uso del sistema.', true],
    ['Apéndice E', 'Diccionario de datos completo de las quince tablas del esquema relacional.', true],
    ['Apéndice F', 'Casos de prueba derivados de los criterios de verificación de cada requisito.', true],
    ['Apéndice G', 'Fragmentos seleccionados del código fuente de los módulos construidos.', true],
    ['Apéndice H', 'Manual de instalación y puesta en marcha del entorno completo.', true],
    ['Apéndice I', 'Manual de usuario de la aplicación móvil.', false],
  ].forEach(([a, d, incluido]) => c.push(U.pMixto([
    [`${a}. `, { bold: true }],
    [d],
    [incluido ? ' Se incorpora a continuación.' : ' Pendiente de adjuntar.', { italics: true }],
  ], { sinSangria: true, after: 120 })));

  // --- Apéndice B: guía de la entrevista -----------------------------------
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('APÉNDICE B', { enIndice: true, before: 200, after: 120 }));
  c.push(U.tituloSimple('Guía de la entrevista semiestructurada a especialistas', { size: U.NIVEL2, after: 240 }));
  c.push(U.p('La guía se aplicó a tres especialistas del sector: dos médicos veterinarios en ejercicio en la zona y un técnico del Servicio Nacional de Sanidad Agropecuaria e Inocuidad Alimentaria. Su propósito fue establecer el contenido sanitario y reproductivo que el sistema debe modelar, materia en la que el criterio del productor no basta y la bibliografía general no alcanza al calendario que rige en el departamento.'));
  c.push(U.p('La modalidad es semiestructurada: las preguntas fijan los temas que la entrevista debe cubrir, pero el entrevistado desarrolla su respuesta sin la restricción de un cuestionario cerrado. Por eso cada bloque enuncia además lo que la pregunta busca determinar, que es el dato que la entrevista debía producir con independencia de la forma que tomara la conversación.'));

  c.push(...U.cuadro('B.1', 'Datos de registro de cada entrevista',
    ['Campo', 'Contenido'],
    [
      ['Código del entrevistado', 'E-01, E-02 o E-03'],
      ['Especialidad y años de ejercicio', 'Se consigna sin el nombre, conforme al tratamiento de datos personales de la sección 3.9.1'],
      ['Zona de trabajo', 'Localidad o corredor ganadero en que ejerce'],
      ['Fecha y duración', 'Fecha de la entrevista y tiempo efectivo de la conversación'],
      ['Modalidad', 'Presencial o a distancia'],
      ['Registro empleado', 'Notas escritas o grabación con autorización del entrevistado'],
    ],
    'Elaboración propia, 2026.', [0.3, 0.7]));

  const BLOQUES_ENTREVISTA = [
    ['Bloque 1. Calendario sanitario obligatorio', [
      ['¿Qué aplicaciones sanitarias son obligatorias en el departamento y con qué periodicidad?',
       'La lista de protocolos obligatorios y su frecuencia, que el sistema precarga.'],
      ['¿Qué margen admite la campaña oficial antiaftosa y qué consecuencia tiene aplicarla fuera de la ventana?',
       'La ventana de anticipación con que el calendario debe avisar.'],
      ['¿Qué constancia exige la normativa de cada aplicación y quién debe firmarla?',
       'Los campos que el registro de un evento sanitario debe capturar para servir como respaldo.'],
      ['¿Qué ocurre cuando un animal ingresa al establecimiento sin historial sanitario conocido?',
       'La regla aplicable al animal cargado sin antecedentes, que el sistema no puede inventar.'],
    ]],
    ['Bloque 2. Protocolos preventivos por fase de manejo', [
      ['¿Qué cuidados sanitarios requiere el ternero en la fase de crianza y en qué momento?',
       'Los protocolos que el sistema debe programar por edad y no por fecha fija.'],
      ['¿Qué problemas sanitarios aparecen con el estrés del destete y cómo se previenen?',
       'Las alertas propias de la transición de fase.'],
      ['¿Qué controles corresponden durante el engorde y con qué frecuencia?',
       'La periodicidad de la desparasitación y de los controles de la fase final.'],
      ['¿Qué protocolos se aplican solo a una categoría de animal y a cuál?',
       'El alcance de cada protocolo, que determina a qué animales genera alerta.'],
    ]],
    ['Bloque 3. Criterios de registro y trazabilidad', [
      ['¿Qué información de un tratamiento resulta imprescindible conservar y cuál es prescindible?',
       'La distinción entre los campos obligatorios y los opcionales del evento sanitario.'],
      ['¿Con qué frecuencia necesita consultar el historial de un animal antes de indicar un tratamiento?',
       'La prioridad del historial individual frente a otras funciones.'],
      ['¿Qué errores de registro observa con mayor frecuencia en los establecimientos?',
       'Las validaciones que el sistema debe imponer en el momento de la carga.'],
      ['¿Qué registro reproductivo resulta indispensable y cuál es el período de gestación que emplea en su práctica?',
       'Los campos del evento reproductivo y la constante de la fecha probable de parto.'],
    ]],
    ['Bloque 4. Estimación del peso sin báscula', [
      ['¿Qué método emplea o ha visto emplear para estimar el peso de un bovino sin báscula?',
       'La aceptación del método morfométrico entre quienes trabajan en la zona.'],
      ['¿Qué margen de error considera aceptable en una estimación destinada a una negociación de venta?',
       'El umbral de error que el objetivo del sistema debe declarar.'],
      ['¿Qué particularidades del ganado cebú de la zona afectarían a una fórmula derivada en razas europeas?',
       'La necesidad de calibrar la constante y los factores que la afectan.'],
    ]],
    ['Bloque 5. Cierre', [
      ['¿Qué función consideraría imprescindible en una herramienta de este tipo y cuál prescindible?',
       'La priorización de los requerimientos desde el criterio técnico.'],
      ['¿Qué riesgo advierte en que el productor dependa de una estimación en lugar de una medición?',
       'Las advertencias que el sistema debe mostrar junto a un valor calculado.'],
    ]],
  ];

  BLOQUES_ENTREVISTA.forEach(([titulo, preguntas], i) => {
    c.push(U.p(titulo, { sinSangria: true, bold: true, before: 200, after: 120 }));
    c.push(...U.cuadro(`B.${i + 2}`, titulo.replace(/^Bloque \d+\. /, ''),
      ['N.º', 'Pregunta', 'Qué busca determinar'],
      preguntas.map(([q, obj], j) => [String(j + 1), q, obj]),
      'Elaboración propia, 2026.', [0.06, 0.47, 0.47]));
  });

  c.push(U.p('Las respuestas de los tres entrevistados fundamentan los protocolos precargados en el sistema, la ventana de anticipación de treinta días del calendario, los campos obligatorios del evento sanitario y la constante de gestación de doscientos ochenta y tres días, todos ellos documentados en el Capítulo V.'));

  // --- Apéndice C: ficha de observación -----------------------------------
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('APÉNDICE C', { enIndice: true, before: 200, after: 120 }));
  c.push(U.tituloSimple('Ficha de observación directa en explotaciones', { size: U.NIVEL2, after: 240 }));
  c.push(U.p('La ficha se completó durante las visitas a las explotaciones. Su propósito fue registrar las condiciones de trabajo que no se enuncian en una entrevista pero se observan en terreno: con qué dispositivo trabaja el personal, si hay señal en el lugar donde ocurre el hecho que se registra, cuánto tarda una anotación y de qué manera se lleva hoy el registro. Varias decisiones de interfaz del Capítulo V proceden de esta observación y no del cuestionario.'));
  c.push(U.p('Se consigna una ficha por visita. Los campos de observación se completan por constatación directa y no por declaración del productor; cuando el dato proviene de lo que el productor refiere y no de lo observado, la ficha lo indica en la columna correspondiente.'));

  c.push(...U.cuadro('C.1', 'Identificación de la visita',
    ['Campo', 'Contenido'],
    [
      ['Código de la visita', 'V-01, V-02, …'],
      ['Localidad', 'Zona o municipio del departamento'],
      ['Fecha y hora de inicio y de cierre', 'Permite dimensionar la duración de la observación'],
      ['Tamaño aproximado del hato', 'Rango, no cifra exacta, conforme a la sección 3.9.2'],
      ['Fases presentes en el predio', 'Crianza, destete, engorde o combinación'],
      ['Personas observadas y su rol', 'Sin consignar nombres'],
    ],
    'Elaboración propia, 2026.', [0.34, 0.66]));

  const BLOQUES_OBSERVACION = [
    ['Condiciones de conectividad', [
      ['Señal de telefonía móvil en el casco del predio', 'Nula / intermitente / estable'],
      ['Señal en el corral de manejo y en los potreros alejados', 'Nula / intermitente / estable, por punto observado'],
      ['Disponibilidad de energía eléctrica para recargar el dispositivo', 'Red / generador / solar / ninguna'],
      ['Frecuencia con que el personal baja al pueblo o accede a conexión', 'Diaria / semanal / mayor'],
    ]],
    ['Equipamiento disponible', [
      ['Tipo de dispositivo que el personal porta en el campo', 'Teléfono inteligente / teléfono básico / ninguno'],
      ['Antigüedad y estado aproximado del dispositivo', 'Observación directa'],
      ['Almacenamiento disponible declarado en el dispositivo', 'Se consigna si el productor lo permite verificar'],
      ['Uso de guantes, condiciones de suciedad, lluvia o sol directo al operar', 'Observación directa; condiciona el tamaño de los controles'],
      ['Existencia de báscula ganadera en el predio o en la zona', 'Sí, en el predio / en la zona / no disponible'],
    ]],
    ['Prácticas actuales de registro', [
      ['Soporte en que se registra hoy', 'Cuaderno / hojas sueltas / planilla digital / memoria'],
      ['Momento en que se registra respecto del hecho', 'En el momento / al final de la jornada / después / no se registra'],
      ['Tiempo observado en completar una anotación', 'Medición directa, en minutos'],
      ['Forma de identificar al animal', 'Caravana / marca / seña / reconocimiento visual'],
      ['Capacidad de recuperar un dato pasado del animal', 'Se solicita un dato concreto y se mide si se encuentra y en cuánto tiempo'],
      ['Estado de conservación del soporte de registro', 'Observación directa'],
    ]],
    ['Organización del predio y del manejo', [
      ['Número de potreros y forma de identificarlos', 'Observación directa'],
      ['Distancia aproximada entre el casco y el potrero más alejado', 'Condiciona la autonomía exigida al dispositivo'],
      ['Punto donde ocurren el pesaje y las aplicaciones sanitarias', 'Corral de manejo / brete / potrero'],
      ['Personas que intervienen en un mismo manejo', 'Determina si varios dispositivos registran a la vez'],
    ]],
    ['Indicios del problema diagnosticado', [
      ['Forma en que se estima el peso al vender', 'A ojo / balanza del comprador / báscula propia'],
      ['Existencia de constancia de las aplicaciones sanitarias', 'Sí, documentada / solo de memoria / inexistente'],
      ['Casos referidos de aplicación repetida u omitida por falta de registro', 'Se consigna lo referido, distinguiéndolo de lo observado'],
      ['Reacción del personal ante la idea de registrar en el teléfono', 'Observación de la actitud, no de la declaración'],
    ]],
  ];

  BLOQUES_OBSERVACION.forEach(([titulo, filas], i) => {
    c.push(...U.cuadro(`C.${i + 2}`, titulo,
      ['Aspecto observado', 'Registro'],
      filas, 'Elaboración propia, 2026.', [0.52, 0.48]));
  });

  c.push(U.p('La ficha reserva al cierre un campo abierto para la observación no prevista, que es el que con mayor frecuencia aportó información útil: el dato que ninguna casilla anticipaba resultó ser, en varias visitas, el que explicaba por qué una práctica se mantiene.'));

  // --- Apéndice D: casos de uso -------------------------------------------
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('APÉNDICE D', { enIndice: true, before: 200, after: 120 }));
  c.push(U.tituloSimple('Especificación completa de los casos de uso', { size: U.NIVEL2, after: 240 }));
  c.push(U.p('Se reproducen las quince fichas con idéntica estructura a la de las tres que el Capítulo IV detalla en su cuerpo: actor principal y secundarios, propósito, precondiciones, flujo principal, flujos alternativos, postcondiciones, requisito asociado y proceso de negocio al que pertenece.'));

  CASOS_USO.forEach(([marcador, codigoCu], i) => {
    const ficha = F.ficha('casosUso', `***${marcador}***`);
    const nombre = ficha.find(([k]) => /nombre/i.test(k))?.[1] ?? codigoCu;
    c.push(...U.cuadro(`D.${i + 1}`, `${codigoCu}. ${nombre}`,
      ['Campo', 'Contenido'], ficha,
      'Elaboración propia, 2026.', [0.26, 0.74]));
  });

  // --- Apéndice E: diccionario de datos ------------------------------------
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('APÉNDICE E', { enIndice: true, before: 200, after: 120 }));
  c.push(U.tituloSimple('Diccionario de datos completo', { size: U.NIVEL2, after: 240 }));
  c.push(U.p('El Capítulo V presenta las tablas del núcleo operativo. Se reproducen aquí las quince del esquema, cada una con sus columnas, su tipo de dato, sus restricciones, su condición de nulidad y el significado de cada campo.'));

  TABLAS.forEach(([nombre, descripcion], i) => {
    const filas = F.tablaDespuesDe('baseDatos', `Tabla ${nombre}`)
      .filter((f) => f.length >= 4 && !/^columna$/i.test(f[0]));
    c.push(...U.cuadro(`E.${i + 1}`, `Tabla ${nombre}. ${descripcion}`,
      ['Columna', 'Tipo', 'Restricción', 'Nulo', 'Descripción'],
      filas, 'Elaboración propia, 2026.', [0.19, 0.14, 0.15, 0.08, 0.44]));
  });

  // --- Apéndice F: casos de prueba -----------------------------------------
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('APÉNDICE F', { enIndice: true, before: 200, after: 120 }));
  c.push(U.tituloSimple('Casos de prueba derivados de los criterios de verificación', { size: U.NIVEL2, after: 240 }));
  c.push(U.p('Cada requisito funcional lleva en su ficha un criterio de verificación. El cuadro siguiente lo traduce en un caso de prueba ejecutable y consigna su resultado. Los requisitos cuya construcción corresponde a incrementos posteriores conservan su caso de prueba definido y sin ejecutar, de modo que el criterio quede fijado antes de construir y no después.'));

  c.push(...U.cuadro('F.1', 'Casos de prueba por requisito funcional',
    ['Requisito', 'Caso de prueba', 'Resultado'],
    [
      ['RF1', 'Ingreso con credenciales válidas; ingreso con credenciales incorrectas; acceso a una función sin el rol requerido', 'Ejecutado: correcto'],
      ['RF2', 'Alta de animal; alta con caravana repetida; alta con categoría fuera del dominio', 'Ejecutado: correcto'],
      ['RF3', 'Alta sin conexión y consulta inmediata en el mismo dispositivo', 'Ejecutado: correcto'],
      ['RF4', 'Estimación con medidas conocidas contrastada contra el valor calculado de forma independiente; medida fuera de rango; combinación de medidas que arroja un peso implausible', 'Ejecutado: correcto'],
      ['RF5', 'Registro de una vacunación y consulta del historial del animal', 'Ejecutado: correcto'],
      ['RF6', 'Transición de fase válida e inválida; registro del destete con su fecha', 'Definido, sin ejecutar'],
      ['RF7', 'Consulta de la referencia nutricional por raza y categoría', 'Definido, sin ejecutar'],
      ['RF8', 'Asignación de potrero al dar de alta un animal; traslado y consulta del historial de movimientos', 'Parcial: la asignación está ejecutada; el historial, definido'],
      ['RF9', 'Registro de una venta con sus animales y consulta del comprobante', 'Definido, sin ejecutar'],
      ['RF10', 'Reenvío del mismo identificador tras una respuesta perdida; consolidación de un cambio concurrente sobre un peso', 'Ejecutado: correcto'],
      ['RF11', 'Consulta del estado del hato sin conexión', 'Definido, sin ejecutar'],
      ['RF12', 'Emisión del reporte de inventario en formato portátil', 'Definido, sin ejecutar'],
      ['RF13', 'Protocolo próximo a vencer que genera alerta; registro del evento que la cierra; evento que no debe cerrar el vencimiento del ciclo siguiente', 'Ejecutado: correcto'],
      ['RF14', 'Servicio confirmado que calcula la fecha probable de parto a doscientos ochenta y tres días', 'Definido, sin ejecutar'],
      ['RF15', 'Cambio del peso relativo de un criterio y recálculo del ranking', 'Definido, sin ejecutar'],
    ],
    'Elaboración propia, 2026. Los criterios proceden de las fichas de requisito del Capítulo IV.',
    [0.1, 0.62, 0.28]));

  // --- Apéndice G: código fuente -------------------------------------------
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('APÉNDICE G', { enIndice: true, before: 200, after: 120 }));
  c.push(U.tituloSimple('Fragmentos del código fuente', { size: U.NIVEL2, after: 240 }));
  c.push(U.p('Se reproducen los tramos que concentran la lógica del sistema, no los que ocupan más líneas. El criterio de selección es que cada uno resuelva un problema que el documento plantea en sus capítulos de análisis y diseño. El código completo está disponible en el repositorio del proyecto.'));

  const bloques = [
    ['G.1', 'Estimación del peso por la fórmula de Schaeffer',
     'Función del dominio, sin dependencia del marco de trabajo ni de la base de datos. La constante es un parámetro y no un valor fijado en el cálculo, porque el diseño prevé calibrarla para el ganado cebú de la zona.',
     'backend/src/pesajes/dominio/schaeffer.ts', 83, 110],
    ['G.2', 'Programación de una tarea del calendario sanitario',
     'La fecha de referencia se recibe como parámetro en lugar de leerse del reloj del sistema, de modo que el comportamiento pueda comprobarse con fechas fijas.',
     'backend/src/sanidad/dominio/calendario.ts', 147, 184],
    ['G.3', 'Alta idempotente con asiento de sincronización',
     'El cliente genera el identificador sin conexión, de modo que un reintento puede reenviar un registro ya consolidado. El reenvío actualiza y no duplica; el asiento de sincronización va en la misma transacción que el alta.',
     'backend/src/pesajes/pesajes.service.ts', 49, 96],
    ['G.4', 'Escritura local y consolidación diferida en el dispositivo',
     'Toda escritura va primero a la base local y la consolidación se intenta después sin esperarla. Es lo que permite que la interfaz no dependa de la red.',
     'mobile/lib/data/repositories/pesajes_repository.dart', 65, 102],
    ['G.5', 'Identificadores en su forma canónica',
     'La biblioteca que genera los ULID los devuelve en minúsculas y el servidor valida el alfabeto canónico en mayúsculas. Sin esta normalización, todo registro creado en el dispositivo se rechaza al sincronizar.',
     'mobile/lib/domain/identificadores.dart', 13, 26],
  ];

  bloques.forEach(([num, titulo, nota, archivo, desde, hasta]) => {
    c.push(U.h2(num, titulo));
    c.push(U.p(nota));
    c.push(U.pMixto([['Archivo: ', { bold: true }], [archivo]], { sinSangria: true, size: U.MENOR, after: 100 }));
    c.push(...codigo(fragmento(archivo, desde, hasta)));
    c.push(U.p(' ', { sinSangria: true, after: 160 }));
  });

  // --- Apéndice H: manual de instalación -----------------------------------
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('APÉNDICE H', { enIndice: true, before: 200, after: 120 }));
  c.push(U.tituloSimple('Manual de instalación y puesta en marcha', { size: U.NIVEL2, after: 240 }));
  c.push(U.p('El procedimiento levanta el entorno completo —base de datos, servicio central y aplicación— sobre una estación de trabajo limpia. Los comandos se ejecutan desde la raíz del repositorio.'));

  [
    ['H.1', 'Requisitos previos',
     ['Node.js 20 o superior y su gestor de paquetes.',
      'Docker y Docker Compose, para el gestor de base de datos.',
      'SDK de Flutter 3.27 o superior, con el canal estable.',
      'SDK de Android, para compilar la aplicación sobre el dispositivo de destino.']],
    ['H.2', 'Base de datos',
     ['docker compose up -d        # levanta PostgreSQL 16',
      'cd backend',
      'npm install',
      'npx prisma migrate deploy   # aplica el esquema',
      'npx prisma db seed          # carga usuarios, potreros y hato de prueba']],
    ['H.3', 'Servicio central',
     ['cd backend',
      'cp .env.example .env        # ajustar credenciales y secretos',
      'npm run build',
      'npm run start:prod          # escucha en http://localhost:3000/api']],
    ['H.4', 'Aplicación móvil',
     ['cd mobile',
      'flutter pub get',
      'dart run build_runner build # genera el código de la base local',
      'flutter run --dart-define=API_URL=http://10.0.2.2:3000/api']],
    ['H.5', 'Verificación de la instalación',
     ['cd backend && npx jest                      # 48 pruebas',
      'cd mobile && TZ=America/La_Paz flutter test # 78 pruebas']],
  ].forEach(([num, titulo, lineas]) => {
    c.push(U.h2(num, titulo));
    if (num === 'H.1') {
      lineas.forEach((l) => c.push(U.vinheta(l)));
    } else {
      c.push(...codigo(lineas));
      c.push(U.p(' ', { sinSangria: true, after: 120 }));
    }
  });

  c.push(U.p('La dirección 10.0.2.2 es el alias del equipo anfitrión desde el emulador de Android. Sobre un teléfono físico corresponde indicar la dirección de la estación en la red local, condición que importa porque el establecimiento no dispone de resolución de nombres.'));

  // ===================== ANEXOS =====================
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('ANEXOS', { enIndice: true, before: 300, after: 300 }));
  c.push(U.p('Los anexos recogen documentación de respaldo no elaborada por el autor, o evidencia documental del trabajo de campo y de la ejecución del sistema.'));

  [
    ['Anexo A', 'Carta de autorización del propietario del establecimiento ganadero que sirve de caso de aplicación.', false],
    ['Anexo B', 'Actas de las reuniones de levantamiento de requisitos con los productores y los especialistas consultados.', false],
    ['Anexo C', 'Registro fotográfico de las visitas de campo y de las condiciones de uso observadas.', false],
    ['Anexo D', 'Normativa del SENASAG aplicable a la identificación y al calendario sanitario del ganado bovino.', false],
    ['Anexo E', 'Resultados completos de la ejecución de las pruebas automatizadas.', true],
    ['Anexo F', 'Capturas de pantalla de la aplicación construida.', true],
    ['Anexo G', 'Formularios de la escala de usabilidad aplicados en las sesiones de validación.', false],
    ['Anexo H', 'Actas de las sesiones de validación con el grupo piloto de productores.', false],
  ].forEach(([a, d, incluido]) => c.push(U.pMixto([
    [`${a}. `, { bold: true }],
    [d],
    [incluido ? ' Se incorpora a continuación.' : ' Pendiente de adjuntar.', { italics: true }],
  ], { sinSangria: true, after: 120 })));

  // --- Anexo E: salida de las pruebas --------------------------------------
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('ANEXO E', { enIndice: true, before: 200, after: 120 }));
  c.push(U.tituloSimple('Resultados de la ejecución de las pruebas automatizadas', { size: U.NIVEL2, after: 240 }));
  c.push(U.p('Se reproduce la salida literal de las dos suites, tal como la emiten los ejecutores. Las pruebas del dispositivo se ejecutan con el huso horario del departamento, porque entre ellas hay reglas que dependen del día del almanaque y una ejecución en tiempo universal no las verificaría.'));

  c.push(U.h2('E.1', 'Servicio central'));
  c.push(U.pMixto([['Orden: ', { bold: true }], ['cd backend && npx jest --verbose']], { sinSangria: true, size: U.MENOR, after: 100 }));
  c.push(...codigo(salida('/tmp/salida-jest.txt')));

  c.push(U.saltoPagina());
  c.push(U.h2('E.2', 'Aplicación móvil'));
  c.push(U.pMixto([['Orden: ', { bold: true }], ['cd mobile && TZ=America/La_Paz flutter test']], { sinSangria: true, size: U.MENOR, after: 100 }));
  c.push(...codigo(salida('/tmp/salida-flutter.txt')));

  // --- Anexo F: capturas de pantalla ---------------------------------------
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('ANEXO F', { enIndice: true, before: 200, after: 120 }));
  c.push(U.tituloSimple('Capturas de pantalla de la aplicación', { size: U.NIVEL2, after: 240 }));
  c.push(U.p('Las capturas corresponden a la aplicación compilada ejecutándose contra el servicio central en funcionamiento, con los datos de la carga inicial ya consolidados. Se presentan en el orden del recorrido descrito en la sección 6.5.5.'));

  const CAPTURAS = [
    ['F.1', 'Ingreso al sistema', 'captura-01-ingreso.png'],
    ['F.2', 'Lista del hato con el último peso estimado de cada animal y el contador de tareas del calendario', 'captura-02-hato.png'],
    ['F.3', 'Calendario sanitario con las tareas ordenadas por vencimiento', 'captura-03-calendario.png'],
    ['F.4', 'Historial de pesos de un animal con su ganancia media diaria', 'captura-04-pesos.png'],
    ['F.5', 'Historial sanitario de un animal', 'captura-05-sanidad.png'],
    ['F.6', 'Registro de un pesaje, con el peso estimado mientras se toman las medidas', 'captura-06-pesaje.png'],
  ];

  CAPTURAS.forEach(([num, titulo, archivo]) => {
    c.push(...U.figura(archivo, num, titulo,
      'Elaboración propia, 2026. Aplicación compilada contra el servicio central en funcionamiento.',
      { anchoMax: 260, altoMax: 520 }));
  });

  return c;
};
