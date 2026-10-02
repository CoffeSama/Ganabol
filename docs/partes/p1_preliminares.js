/** Páginas preliminares: carátula, dedicatoria, agradecimientos, resumen,
 *  abstract, listas de siglas y glosario de apertura. */
const { AlignmentType } = require('docx');
const U = require('../univalle');

module.exports = function preliminares() {
  const c = [];

  // --- Carátula ---
  const centro = (t, { size = U.CUERPO, bold = false, after = 160, before = 0 } = {}) =>
    U.p(t, { alignment: AlignmentType.CENTER, sinSangria: true, size, bold, after, before });

  c.push(centro('UNIVERSIDAD PRIVADA DEL VALLE', { size: U.NIVEL1, bold: true, before: 1200 }));
  c.push(centro('FACULTAD DE INFORMÁTICA Y ELECTRÓNICA', { size: U.NIVEL2, bold: true }));
  c.push(centro('CARRERA DE LICENCIATURA EN INGENIERÍA DE SISTEMAS', { size: U.NIVEL2, bold: true, after: 700 }));
  c.push(centro(
    'GANABOL: SISTEMA MÓVIL DE GESTIÓN GANADERA CON FUNCIONAMIENTO SIN CONEXIÓN PARA EXPLOTACIONES BOVINAS TRADICIONALES DEL DEPARTAMENTO DE SANTA CRUZ, BOLIVIA',
    { size: U.NIVEL1, bold: true, after: 700 },
  ));
  c.push(centro('PROYECTO DE GRADO PARA OPTAR AL TÍTULO DE LICENCIATURA EN INGENIERÍA DE SISTEMAS', { after: 600 }));
  c.push(centro('POSTULANTE: Carlos Mateo Ibáñez Rodríguez', { bold: true }));
  c.push(centro('TUTOR: Jesús Bautista', { after: 700 }));
  c.push(centro('Santa Cruz de la Sierra – Bolivia'));
  c.push(centro('2026'));

  // --- Dedicatoria ---
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('DEDICATORIA', { before: 600, after: 400 }));
  c.push(U.p('A mi padre, Carlos Alberto Ibáñez Blanco, que me transmitió desde pequeño el interés y el respeto por la ganadería. De su esfuerzo y de las horas que dedicó al trabajo del campo nació la motivación de este proyecto, concebido no solo como requisito académico sino como una herramienta que pueda servir en la labor diaria.'));
  c.push(U.p('Este trabajo es también una forma de retribuir el apoyo, las enseñanzas y los valores que me ha dado a lo largo de la vida, y de contribuir a la modernización de la actividad familiar.'));
  c.push(U.p('Lo dedico asimismo a los productores ganaderos del departamento, en particular a quienes recién empiezan en el rubro, con la esperanza de que una herramienta accesible facilite su trabajo y abra oportunidades en el sector.'));

  // --- Agradecimientos ---
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('AGRADECIMIENTOS', { before: 600, after: 400 }));
  c.push(U.p('A la Universidad Privada del Valle, por la formación integral y el respaldo institucional que hicieron posible este trabajo.'));
  c.push(U.p('A los docentes de la carrera, que convirtieron cada desafío académico en una lección que terminó por formar un criterio profesional.'));
  c.push(U.p('A mi tutor, Jesús Bautista, por la orientación y el rigor con que acompañó el desarrollo del proyecto.'));
  c.push(U.p('A los productores ganaderos de Pailón, Abapó y San Julián que dedicaron su tiempo a responder el instrumento de diagnóstico y a recibirme en sus predios. Sin esa información de campo, este trabajo carecería de fundamento.'));
  c.push(U.p('A mi familia, por el apoyo constante durante toda la etapa académica.'));

  // --- Resumen ---
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('RESUMEN', { before: 500, after: 360 }));
  c.push(U.p('La ganadería bovina en explotaciones tradicionales del departamento de Santa Cruz se gestiona mediante métodos empíricos apoyados en la experiencia del productor, la observación visual del animal y registros manuales dispersos en cuadernos y planillas. Esta práctica limita el control productivo, impide conocer el historial individual de cada animal y debilita la posición del productor al momento de negociar una venta, porque desconoce el peso real de lo que ofrece.'));
  c.push(U.p('A estas limitaciones se suma una restricción del entorno que descarta las soluciones existentes en el mercado: la conectividad a internet en el campo es intermitente o inexistente, de modo que una aplicación que dependa de la red no resulta utilizable. El diagnóstico aplicado a veintitrés productores de los municipios de Pailón, Abapó y San Julián confirma la magnitud de la brecha: el ochenta y siete por ciento dispone de un teléfono inteligente con capacidad técnica suficiente, y ninguno utiliza una herramienta digital especializada para el manejo de su hato.'));
  c.push(U.p('El presente proyecto desarrolla GanaBol, un sistema móvil de gestión ganadera cuyo modo primario de operación es sin conexión. La aplicación, construida en Flutter sobre una base de datos local cifrada, permite registrar el inventario bovino con identificación individual, llevar el historial sanitario de cada animal, estimar su peso a partir de medidas corporales sin pesarlo físicamente y apoyar la decisión de venta mediante una evaluación ponderada de criterios objetivos. Un servicio central desarrollado en NestJS sobre PostgreSQL consolida la información cuando el dispositivo recupera conectividad, y un panel web permite la consulta de reportes.'));
  c.push(U.p('La solución resuelve tres problemas de ingeniería no triviales: la generación de identificadores en el dispositivo que hace idempotente el reenvío de registros, la resolución de conflictos diferenciada según el riesgo de cada entidad, y la propagación de las bajas mediante marcas lógicas. El caso de aplicación es el establecimiento ganadero Sabayones, en la zona del Izozog, Chaco del departamento de Santa Cruz.'));
  c.push(U.p('Palabras clave: gestión ganadera, estimación morfométrica de peso, aplicación móvil, funcionamiento sin conexión, sincronización diferida, trazabilidad bovina.', { bold: false }));

  // --- Abstract ---
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('ABSTRACT', { before: 500, after: 360 }));
  c.push(U.p('Cattle farming on traditional holdings in the department of Santa Cruz is managed through empirical methods that rely on the producer’s experience, visual assessment of the animal, and manual records scattered across notebooks and spreadsheets. This practice limits production control, makes the individual history of each animal inaccessible, and weakens the producer’s position when negotiating a sale, since the true weight of the animal on offer is unknown.'));
  c.push(U.p('A constraint of the setting compounds these limitations and rules out the solutions available on the market: internet connectivity in the field is intermittent or absent, so an application that depends on the network is unusable. A diagnostic survey of twenty-three producers in the municipalities of Pailón, Abapó and San Julián confirms the extent of the gap: eighty-seven per cent own a smartphone with sufficient technical capacity, and none uses a specialised digital tool to manage their herd.'));
  c.push(U.p('This project develops GanaBol, a mobile livestock management system whose primary mode of operation is offline. Built in Flutter on an encrypted local database, the application records the cattle inventory with individual identification, maintains each animal’s health history, estimates its weight from body measurements without physically weighing it, and supports the sale decision through a weighted evaluation of objective criteria. A central service built in NestJS on PostgreSQL consolidates the information once the device regains connectivity, and a web panel allows report consultation.'));
  c.push(U.p('The solution addresses three non-trivial engineering problems: device-side identifier generation that makes record resubmission idempotent, conflict resolution differentiated by the risk of each entity, and deletion propagation through logical markers. The applied case is the Sabayones cattle holding, in the Izozog area of the Bolivian Chaco, department of Santa Cruz.'));
  c.push(U.p('Keywords: livestock management, morphometric weight estimation, mobile application, offline operation, deferred synchronisation, cattle traceability.'));

  // --- Siglas ---
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('LISTA DE SIGLAS Y ABREVIATURAS', { before: 500, after: 360 }));
  const siglas = [
    ['API', 'Interfaz de programación de aplicaciones (Application Programming Interface)'],
    ['CU', 'Caso de uso'],
    ['GDP', 'Ganancia diaria de peso'],
    ['HLC', 'Reloj lógico híbrido (Hybrid Logical Clock)'],
    ['HTTPS', 'Protocolo de transferencia de hipertexto seguro'],
    ['IEEE', 'Instituto de Ingenieros Eléctricos y Electrónicos'],
    ['INE', 'Instituto Nacional de Estadística'],
    ['ISO', 'Organización Internacional de Normalización'],
    ['JSON', 'Notación de objetos de JavaScript (formato de intercambio de datos)'],
    ['JWT', 'Token web en formato JSON (JSON Web Token)'],
    ['LCC', 'Largo corporal'],
    ['LWW', 'Última escritura gana (Last Write Wins)'],
    ['ORM', 'Mapeo objeto-relacional'],
    ['PC', 'Perímetro torácico'],
    ['RBAC', 'Control de acceso basado en roles'],
    ['REST', 'Transferencia de estado representacional'],
    ['RF / RNF', 'Requisito funcional / Requisito no funcional'],
    ['SENASAG', 'Servicio Nacional de Sanidad Agropecuaria e Inocuidad Alimentaria'],
    ['SQL', 'Lenguaje de consultas estructurado'],
    ['SRS', 'Especificación de requisitos del software'],
    ['SUS', 'Escala de usabilidad del sistema (System Usability Scale)'],
    ['ULID', 'Identificador único ordenable en el tiempo'],
    ['UML', 'Lenguaje unificado de modelado'],
    ['URS', 'Especificación de requisitos del usuario'],
    ['UX', 'Experiencia de usuario'],
    ['WCAG', 'Pautas de accesibilidad para el contenido web'],
  ];
  siglas.forEach(([s, d]) => c.push(U.pMixto([[`${s}: `, { bold: true }], [d]], { sinSangria: true, after: 80 })));

  return c;
};
