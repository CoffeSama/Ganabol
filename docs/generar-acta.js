/**
 * Requerimientos de usuario — Paso 1: acta de reunión inicial.
 *
 * Reproduce el formato del modelo de la asignatura (Calibri, títulos
 * numerados «1.-», tablas con borde negro sin sombreado, rótulos «Tabla N.»
 * y priorización MoSCoW) con el contenido del proyecto GanaBol.
 *
 * El contenido es coherente con el Capítulo IV del proyecto de grado: los
 * actores son los del Cuadro 4.3, las reglas de negocio son las doce del
 * Cuadro 4.23 y los procesos son los nueve del Cuadro 4.1. Cada requerimiento
 * de usuario lleva internamente la necesidad UR del Cuadro 4.5 a la que
 * pertenece, de modo que ambos documentos puedan contrastarse.
 *
 * Los campos que son hechos de la reunión —fecha, nombres, observaciones y
 * firmas— quedan en blanco, como en el modelo.
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  BorderStyle, AlignmentType, Footer, PageNumber, LevelFormat,
} = require('docx');

const FUENTE = 'Calibri';

// --- Formato ----------------------------------------------------------------

function run(texto, { b = false, i = false, sz = 22 } = {}) {
  return new TextRun({ text: texto, font: FUENTE, size: sz, bold: b, italics: i });
}

/** Párrafo de cuerpo: 11 pt, interlineado 1,15, 7 pt después. */
function parrafo(texto, opc = {}) {
  return new Paragraph({
    spacing: { after: 140, line: 276 },
    children: [run(texto, opc)],
  });
}

/** Título de sección: 12 pt en negrita, 14 pt antes. */
function titulo(texto) {
  return new Paragraph({
    keepNext: true,
    spacing: { before: 280, after: 140 },
    children: [run(texto, { b: true, sz: 24 })],
  });
}

/** Subtítulo o rótulo de tabla: 11 pt en negrita. */
function rotulo(texto) {
  return new Paragraph({
    keepNext: true,
    spacing: { before: 120, after: 100 },
    children: [run(texto, { b: true })],
  });
}

function vineta(texto) {
  return new Paragraph({
    numbering: { reference: 'vinetas', level: 0 },
    spacing: { after: 60, line: 276 },
    children: [run(texto)],
  });
}

function numerado(texto) {
  return new Paragraph({
    numbering: { reference: 'acuerdos', level: 0 },
    spacing: { after: 60, line: 276 },
    children: [run(texto)],
  });
}

const BORDE = { style: BorderStyle.SINGLE, size: 6, color: '000000' };
const BORDES = { top: BORDE, bottom: BORDE, left: BORDE, right: BORDE };

function celda(texto, ancho, { b = false, centro = false, sz = 22 } = {}) {
  return new TableCell({
    width: { size: ancho, type: WidthType.DXA },
    borders: BORDES,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      alignment: centro ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { line: 252 },
      children: [run(texto, { b, sz })],
    })],
  });
}

/**
 * Tabla con el formato del modelo. `primeraNegrita` reproduce las tablas de
 * requerimientos, cuya columna de código va en negrita.
 */
function tabla(encabezados, filas, anchos, { sz = 22, primeraNegrita = false, centrado = false } = {}) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: anchos,
    rows: [
      new TableRow({
        tableHeader: true,
        children: encabezados.map((e, k) => celda(e, anchos[k], { b: true, centro: centrado })),
      }),
      ...filas.map((f) => new TableRow({
        children: f.map((t, k) => celda(t, anchos[k], {
          sz: k === 0 && primeraNegrita ? 20 : sz,
          b: k === 0 && primeraNegrita,
        })),
      })),
    ],
  });
}

function espacio() {
  return new Paragraph({ spacing: { after: 140 }, children: [] });
}

// --- Contenido --------------------------------------------------------------

const ACTORES = [
  {
    prefijo: 'RU-PRO', nombre: 'PROPIETARIO', titulo: 'propietario',
    funcion: 'Decidir sobre el manejo, la venta y la reposición del hato',
    necesidades: 'Conocer el estado del hato y el peso de sus animales sin recorrer el campo, y decidir la venta con datos objetivos',
    interfaz: 'Panel web y aplicación móvil (consulta)',
    intro: 'Se plantea que el propietario necesita conocer el estado de su hato y el peso de sus animales sin tener que recorrer el campo ni consultar al personal, y decidir qué animales vender a partir de criterios objetivos y no solo de la apreciación visual. Estas necesidades se validarán con él en la reunión.',
    filas: [
      ['RU-PRO-01', 'Necesito ver el estado de mi hato sin tener que recorrer el campo.', 'ENC', 'Debe', 'La vista resumida muestra el total de animales, su distribución por fase y categoría, y las tareas sanitarias pendientes.', 'UR-11'],
      ['RU-PRO-02', 'Necesito saber qué tan actualizada está la información que consulto.', 'PRO', 'Debe', 'Cada pantalla muestra la fecha y hora de la última sincronización.', 'UR-10'],
      ['RU-PRO-03', 'Necesito conocer el peso de mis animales antes de negociar una venta.', 'ENC', 'Debe', 'La ficha muestra el último peso estimado con su fecha y la indicación de que es un valor calculado.', 'UR-04'],
      ['RU-PRO-04', 'Necesito ver cómo evoluciona el peso de un animal.', 'PRO', 'Debería', 'La ficha muestra la curva de pesos y la ganancia media diaria entre pesajes.', 'UR-04'],
      ['RU-PRO-05', 'Necesito saber qué animales conviene vender sin decidir solo por lo que veo.', 'ENC', 'Debería', 'El sistema ordena los animales por un puntaje que combina peso estimado, edad y estado sanitario.', 'UR-17'],
      ['RU-PRO-06', 'Necesito decidir cuánto pesa cada criterio en esa selección.', 'PRO', 'Debería', 'La importancia relativa de cada criterio se modifica y el orden de los animales se recalcula.', 'UR-17'],
      ['RU-PRO-07', 'Necesito que se me avise si elijo para la venta un animal que está en carencia sanitaria.', 'ENT', 'Debe', 'Al seleccionar un animal en carencia, el sistema muestra la advertencia con la fecha en que termina.', 'UR-17'],
      ['RU-PRO-08', 'Necesito registrar una venta con el peso de referencia y el precio acordado.', 'ENC', 'Debería', 'La venta queda registrada con sus animales, peso y precio, y los animales salen del inventario activo.', 'UR-09'],
      ['RU-PRO-09', 'Necesito reportes del hato que pueda guardar o imprimir.', 'PRO', 'Debería', 'Los reportes de inventario, sanidad y ventas indican el período y la fecha de generación y se exportan en PDF.', 'UR-12'],
      ['RU-PRO-10', 'Necesito saber quién registró cada dato.', 'PRO', 'Debe', 'Cada registro conserva el usuario, la fecha y la hora en que se hizo.', 'UR-13'],
    ],
  },
  {
    prefijo: 'RU-ADM', nombre: 'ADMINISTRADOR', titulo: 'administrador',
    funcion: 'Gestionar los usuarios, la configuración del establecimiento y el respaldo',
    necesidades: 'Controlar quién accede y con qué permisos, y mantener la configuración y la información resguardadas',
    interfaz: 'Panel web',
    intro: 'Se plantea que el administrador necesita controlar quién accede al sistema y con qué permisos, mantener la configuración del establecimiento —potreros, protocolos sanitarios y parámetros— y garantizar que la información esté respaldada. Estas necesidades se validarán con él en la reunión.',
    filas: [
      ['RU-ADM-01', 'Necesito crear usuarios y asignarles un rol.', 'PRO', 'Debe', 'Cada usuario tiene uno de los cuatro roles: administrador, personal de campo, veterinario o propietario.', 'UR-01'],
      ['RU-ADM-02', 'Necesito desactivar a un usuario que ya no trabaja en el establecimiento.', 'PRO', 'Debe', 'Una cuenta desactivada no puede iniciar sesión ni sincronizar.', 'UR-01'],
      ['RU-ADM-03', 'Necesito registrar los potreros del establecimiento.', 'OBS', 'Debe', 'Cada potrero se registra con su nombre y queda disponible para asignar animales.', 'UR-08'],
      ['RU-ADM-04', 'Necesito configurar los protocolos sanitarios que rigen en la zona.', 'ENT', 'Debe', 'Cada protocolo se define con su producto, su periodicidad y las categorías a las que aplica.', 'UR-15'],
      ['RU-ADM-05', 'Necesito ajustar la constante de estimación del peso al ganado de la zona.', 'PRO', 'Debería', 'La constante se modifica sin cambiar el sistema y los teléfonos la reciben en la siguiente sincronización.', 'UR-04'],
      ['RU-ADM-06', 'Necesito cargar la referencia nutricional por raza y categoría.', 'DOC', 'Podría', 'La referencia se registra por combinación de raza y categoría, sin duplicados.', 'UR-07'],
      ['RU-ADM-07', 'Necesito una copia de la información que pueda recuperar si algo falla.', 'ENC', 'Debe', 'Existe un respaldo periódico y un procedimiento de recuperación probado.', 'UR-13'],
      ['RU-ADM-08', 'Necesito saber qué teléfonos sincronizaron y qué registros quedaron en conflicto.', 'PRO', 'Debería', 'La bitácora muestra por cada envío los registros recibidos, aceptados y en conflicto, con el dispositivo.', 'UR-10'],
    ],
  },
  {
    prefijo: 'RU-CAM', nombre: 'PERSONAL DE CAMPO', titulo: 'personal de campo',
    funcion: 'Registrar en el terreno los animales, los pesos, los eventos sanitarios y los movimientos',
    necesidades: 'Registrar de forma rápida y sencilla en el corral, donde casi nunca hay señal',
    interfaz: 'Aplicación móvil sin conexión',
    intro: 'Se plantea que el personal de campo necesita registrar los animales, sus pesos y sus eventos sanitarios en el corral, donde la señal es nula o intermitente, con una aplicación sencilla que no exija una báscula y que no pierda lo registrado. Estas necesidades se validarán con él en la reunión.',
    filas: [
      ['RU-CAM-01', 'Necesito entrar a la aplicación y seguir trabajando aunque no haya señal.', 'OBS', 'Debe', 'Tras el primer ingreso con conexión, la aplicación abre y opera sin conexión.', 'UR-03'],
      ['RU-CAM-02', 'Necesito registrar un animal con su número de caravana.', 'ENC', 'Debe', 'El animal se registra con caravana, raza, sexo, categoría, fecha de nacimiento y potrero.', 'UR-02'],
      ['RU-CAM-03', 'Necesito que no se repita la caravana de un animal.', 'OBS', 'Debe', 'El sistema no permite registrar dos animales activos con la misma caravana.', 'UR-02'],
      ['RU-CAM-04', 'Necesito encontrar rápido a un animal por su caravana.', 'OBS', 'Debe', 'La búsqueda por caravana funciona sin conexión.', 'UR-02'],
      ['RU-CAM-05', 'Necesito saber cuánto pesa un animal sin tener báscula.', 'ENC', 'Debe', 'Al ingresar el perímetro torácico y el largo corporal, la aplicación muestra el peso estimado en el momento.', 'UR-04'],
      ['RU-CAM-06', 'Necesito que la aplicación me avise si una medida está mal tomada.', 'ENT', 'Debe', 'Una medida fuera de rango no se acepta y se muestra el rango esperado.', 'UR-04'],
      ['RU-CAM-07', 'Necesito anotar las vacunas y tratamientos en el corral.', 'ENC', 'Debe', 'El evento se guarda con tipo, producto, dosis, fecha y responsable.', 'UR-05'],
      ['RU-CAM-08', 'Necesito registrar cuándo se desteta un animal y en qué fase está.', 'OBS', 'Debería', 'El cambio de fase se guarda con su fecha y la fase anterior queda en el historial.', 'UR-06'],
      ['RU-CAM-09', 'Necesito registrar cuando un animal pasa a otro potrero.', 'OBS', 'Debería', 'El traslado actualiza la ubicación del animal y queda en su historial de movimientos.', 'UR-08'],
      ['RU-CAM-10', 'Necesito ver qué vacunas o tratamientos tengo pendientes o vencidos.', 'ENC', 'Debe', 'El calendario lista las tareas por animal, de la más urgente a la menos urgente, sin conexión.', 'UR-15'],
      ['RU-CAM-11', 'Necesito saber cuántos registros tengo sin enviar.', 'PRO', 'Debe', 'La pantalla principal muestra el contador de registros pendientes de sincronizar.', 'UR-10'],
      ['RU-CAM-12', 'Necesito que lo que registré llegue al servidor cuando haya señal.', 'ENC', 'Debe', 'Los pendientes se envían al recuperar la conexión; reenviar el mismo registro no lo duplica.', 'UR-10'],
      ['RU-CAM-13', 'Necesito que no se pierda lo que registré si se apaga el teléfono.', 'ENC', 'Debe', 'Un registro guardado permanece al cerrar la aplicación o reiniciar el teléfono.', 'UR-03'],
    ],
  },
  {
    prefijo: 'RU-VET', nombre: 'VETERINARIO', titulo: 'veterinario',
    funcion: 'Atender la sanidad del hato y definir los tratamientos',
    necesidades: 'Conocer el historial sanitario de cada animal y no perder los vencimientos del calendario',
    interfaz: 'Aplicación móvil',
    intro: 'Se plantea que el veterinario necesita conocer lo que se le aplicó a cada animal antes de indicar un tratamiento, contar con avisos de los vencimientos del calendario sanitario y llevar el control reproductivo de las hembras. Estas necesidades se validarán con él en la reunión.',
    filas: [
      ['RU-VET-01', 'Necesito ver todo lo que se le aplicó a un animal antes de indicar un tratamiento.', 'ENT', 'Debe', 'El historial muestra cada evento con tipo, producto, dosis, fecha y responsable.', 'UR-05'],
      ['RU-VET-02', 'Necesito registrar los tratamientos que indico.', 'ENT', 'Debe', 'El tratamiento queda asociado al animal y a la fecha, con producto y dosis.', 'UR-05'],
      ['RU-VET-03', 'Necesito que el sistema avise de las vacunas y desparasitaciones que vencen.', 'ENT', 'Debe', 'La alerta aparece con 30 días de anticipación y se cierra al registrarse el evento que la cumple.', 'UR-15'],
      ['RU-VET-04', 'Necesito registrar los servicios, los diagnósticos de preñez y los partos.', 'ENT', 'Debería', 'Cada evento reproductivo queda registrado con su fecha y su resultado.', 'UR-16'],
      ['RU-VET-05', 'Necesito saber cuándo va a parir cada hembra servida.', 'ENT', 'Debería', 'El sistema calcula la fecha probable de parto a 283 días del servicio confirmado.', 'UR-16'],
      ['RU-VET-06', 'Necesito que un dato sanitario no se sobrescriba si dos personas lo cambian a la vez.', 'ENT', 'Debe', 'El conflicto sobre un evento sanitario se presenta al usuario para que decida; no se resuelve solo.', 'UR-10'],
    ],
  },
  {
    prefijo: 'RU-SIS', nombre: 'REQUERIMIENTOS TRANSVERSALES', titulo: null,
    filas: [
      ['RU-SIS-01', 'Necesitamos que cada persona ingrese con su propia cuenta.', 'ENC', 'Debe', 'No se permiten cuentas compartidas para registrar información.', 'UR-01'],
      ['RU-SIS-02', 'Necesitamos que cada usuario vea solo las funciones que le corresponden.', 'PRO', 'Debe', 'El sistema verifica el rol antes de ejecutar cada función.', 'UR-01'],
      ['RU-SIS-03', 'Necesitamos poder trabajar en el campo sin internet.', 'ENC', 'Debe', 'Registro y consulta completos sin conexión, sin perder información.', 'UR-03'],
      ['RU-SIS-04', 'Necesitamos que la información coincida entre el teléfono y el servidor.', 'PRO', 'Debe', 'Tras sincronizar, los totales del hato coinciden en ambos lados.', 'UR-10'],
      ['RU-SIS-05', 'Necesitamos que nada se borre definitivamente por error.', 'PRO', 'Debe', 'Toda eliminación es lógica y el dato se conserva.', 'UR-13'],
      ['RU-SIS-06', 'Necesitamos que la aplicación sea sencilla de aprender.', 'ENC', 'Debe', 'Una persona sin experiencia registra un animal y un pesaje tras una explicación de pocos minutos.', 'UR-14'],
      ['RU-SIS-07', 'Necesitamos mensajes claros, en español y con el lenguaje del campo.', 'OBS', 'Debe', 'Las pantallas usan la terminología ganadera, sin términos técnicos ni códigos de error.', 'UR-14'],
      ['RU-SIS-08', 'Necesitamos leer la pantalla a pleno sol y usarla con las manos sucias.', 'OBS', 'Debe', 'Texto de alto contraste, botones grandes y el color siempre acompañado de texto.', 'UR-14'],
      ['RU-SIS-09', 'Necesitamos usar los teléfonos que ya tenemos.', 'ENC', 'Debe', 'La aplicación funciona en teléfonos Android de gama media.', 'UR-03'],
      ['RU-SIS-10', 'Necesitamos que las contraseñas y los datos del teléfono estén protegidos.', 'PRO', 'Debe', 'Las contraseñas se guardan cifradas y la base del teléfono se protege si este se pierde.', 'UR-13'],
      ['RU-SIS-11', 'Necesitamos poder instalar el sistema siguiendo un manual.', 'PRO', 'Podría', 'En una máquina limpia, el sistema se levanta siguiendo el manual de instalación.', 'UR-13'],
      ['RU-SIS-12', 'Necesitamos que el sistema pueda crecer con nuevos módulos.', 'PRO', 'Podría', 'La solución permite agregar funciones sin reconstruir lo existente.', 'UR-13'],
    ],
  },
];

const EXCLUIDAS = [
  ['RU-FUT-01', 'Conectar una báscula electrónica para capturar el peso', 'En esta versión el peso se estima a partir de medidas corporales'],
  ['RU-FUT-02', 'Leer las caravanas por radiofrecuencia o NFC', 'El personal no cuenta con lectores; la identificación es por el número visual de la caravana'],
  ['RU-FUT-03', 'Gestionar ganado lechero', 'El sistema se orienta a las fases de crianza, destete y engorde'],
  ['RU-FUT-04', 'Gestionar otras especies (ovinos, caprinos, porcinos)', 'Fuera de la delimitación del proyecto'],
  ['RU-FUT-05', 'Conectarse en línea con el SENASAG o con frigoríficos', 'Requiere acuerdos con terceros fuera del alcance'],
  ['RU-FUT-06', 'Llevar la contabilidad y la facturación', 'Corresponde a un dominio distinto del productivo y sanitario'],
  ['RU-FUT-07', 'Emitir diagnósticos veterinarios desde el sistema', 'El sistema registra lo que indica el veterinario; no lo reemplaza'],
  ['RU-FUT-08', 'Predecir el peso futuro de los animales', 'La ganancia diaria se calcula sobre pesajes registrados; no se incluyen proyecciones'],
];

// Las doce reglas del Cuadro 4.23 del proyecto de grado, sin cambios.
const REGLAS = [
  ['RN-01', 'No se admiten dos animales activos con el mismo número de caravana.'],
  ['RN-02', 'El identificador del animal se genera en el dispositivo y no cambia a lo largo de su vida en el sistema.'],
  ['RN-03', 'Las medidas corporales fuera de rango plausible se rechazan antes de calcular el peso.'],
  ['RN-04', 'El peso estimado se registra siempre como valor calculado, nunca como pesaje físico.'],
  ['RN-05', 'Un evento sanitario queda asociado a un animal y a una fecha; no se admite el registro sin ambos.'],
  ['RN-06', 'El cambio de fase de manejo registra la fecha del evento y conserva la fase anterior en el historial.'],
  ['RN-07', 'Un animal con período de carencia sanitaria vigente se advierte al ser seleccionado para venta.'],
  ['RN-08', 'La eliminación de un registro es lógica; el dato se conserva para propagar la baja a los dispositivos.'],
  ['RN-09', 'El reenvío de un registro con el mismo identificador actualiza y nunca duplica.'],
  ['RN-10', 'Los conflictos sobre pesos y eventos sanitarios no se resuelven de forma automática.'],
  ['RN-11', 'La fecha probable de parto se calcula a partir de la fecha de servicio y el período de gestación de la especie.'],
  ['RN-12', 'Los criterios de la evaluación ponderada y sus pesos relativos son configurables por el propietario.'],
];

const TRAZABILIDAD = [
  ['El peso se estima a ojo y se vende por debajo del valor real', 'RU-CAM-05, RU-CAM-06, RU-PRO-03', 'P2. Estimación del peso', 'RN-03, RN-04'],
  ['No se sabe con certeza qué animal conviene vender', 'RU-PRO-05, RU-PRO-06, RU-PRO-07', 'P9. Evaluación para la venta', 'RN-07, RN-12'],
  ['Dudas al identificar a cada animal y caravanas repetidas', 'RU-CAM-02, RU-CAM-03, RU-CAM-04', 'P1. Alta y trazabilidad', 'RN-01, RN-02'],
  ['El historial sanitario está en cuadernos o en la memoria', 'RU-CAM-07, RU-VET-01, RU-VET-02', 'P3. Evento sanitario', 'RN-05'],
  ['Vacunas y desparasitaciones que se atrasan sin aviso', 'RU-CAM-10, RU-VET-03, RU-ADM-04', 'P7. Alertas', 'RN-05'],
  ['Sin señal en el corral no se puede registrar', 'RU-CAM-01, RU-CAM-13, RU-SIS-03', 'P6. Sincronización', 'RN-02, RN-09'],
  ['Registros que se pierden o se duplican', 'RU-CAM-12, RU-SIS-04, RU-ADM-08', 'P6. Sincronización', 'RN-08, RN-09, RN-10'],
  ['El destete y la fase de cada animal no quedan anotados', 'RU-CAM-08', 'P4. Destete y cambio de fase', 'RN-06'],
  ['No se sabe en qué potrero está cada animal', 'RU-CAM-09, RU-ADM-03', 'P1. Alta y trazabilidad', 'RN-01'],
  ['No se lleva el control de servicios y partos', 'RU-VET-04, RU-VET-05', 'P8. Evento reproductivo', 'RN-11'],
  ['Las ventas no quedan registradas con su peso y precio', 'RU-PRO-08', 'P5. Comercialización', 'RN-07'],
  ['Cualquier persona puede modificar cualquier dato', 'RU-ADM-01, RU-SIS-01, RU-SIS-02', 'Gestión de usuarios', 'RN-08'],
  ['La información puede perderse ante una falla', 'RU-ADM-07, RU-SIS-05', 'Respaldo y recuperación', 'RN-08'],
];

// --- Documento --------------------------------------------------------------

function construir() {
  const c = [];
  const todas = ACTORES.flatMap((a) => a.filas);
  const contar = (p) => todas.filter((f) => f[3] === p).length;
  let nTabla = 0;

  c.push(parrafo('Paso 1.- Acta de reunión inicial (Clientes, Dueños)'));
  c.push(parrafo('GanaBol: sistema móvil de gestión ganadera con funcionamiento sin conexión para explotaciones bovinas tradicionales del departamento de Santa Cruz, Bolivia. Caso de aplicación: establecimiento ganadero Sabayones, zona del Izozog, gestión 2026', { b: true }));
  c.push(parrafo('Estado: borrador para validar con el cliente. Las necesidades se derivan del diagnóstico del proyecto —encuesta a veintitrés productores (ENC), entrevistas a especialistas (ENT) y observación directa (OBS)— y de la propuesta del analista (PRO), y se actualizarán a CLI o VAL cuando se confirmen en la reunión.', { i: true }));

  // 1
  c.push(titulo('1.- Propósito del documento'));
  c.push(parrafo('El presente documento especifica el diseño y desarrollo del sistema móvil de gestión ganadera GanaBol para el establecimiento ganadero Sabayones.'));
  c.push(parrafo('Para lo cual el proyecto cumplirá con los siguientes puntos:'));
  [
    'Flujos propuestos en To-Be (flujos de la organización)',
    'Requerimientos del usuario',
    'Requerimientos funcionales y no funcionales (versión 1)',
    'Casos de uso (interacción con el software)',
    'Diseño del flujo propuesto para la solución (diagrama de flujo)',
    'Diagrama de arquitectura y tecnología',
    'Dimensionamiento y diseño de la base de datos',
    'Diseño de interfaces (mockup)',
    'Pruebas de aceptación',
  ].forEach((t) => c.push(vineta(t)));

  // 2
  c.push(titulo('2.- Contexto de la reunión con los clientes'));
  c.push(rotulo('2.1 Datos de la reunión'));
  c.push(tabla(['CAMPO', 'DESCRIPCIÓN'], [
    ['Nombre de la reunión', 'Reunión de levantamiento de datos'],
    ['Organización', 'Establecimiento ganadero Sabayones, zona del Izozog'],
    ['Fecha', '___ / ___ / 2026 (por definir)'],
    ['Modalidad', 'Presencial'],
    ['Objetivo', 'Identificar y validar las necesidades de los usuarios'],
    ['Responsable de levantamiento de datos', 'Carlos Mateo Ibáñez Rodríguez, analista de requerimientos'],
    ['Resultado esperado', 'Listar y validar los requerimientos del usuario de la reunión'],
  ], [3600, 5760], { centrado: true }));
  c.push(espacio());

  c.push(rotulo('2.2 Participan'));
  c.push(tabla(['Código', 'Participante', 'Responsabilidad en el negocio'], [
    ['C-01', 'Propietario', 'Decidir sobre el manejo, la venta y la reposición del hato'],
    ['C-02', 'Administrador', 'Gestionar usuarios, configuración del establecimiento y respaldo de la información'],
    ['C-03', 'Personal de campo', 'Registrar animales, pesos, eventos sanitarios y movimientos en el terreno'],
    ['C-04', 'Veterinario', 'Atender la sanidad del hato y definir los tratamientos y calendarios sanitarios'],
  ], [1500, 3000, 4860]));
  c.push(espacio());

  c.push(rotulo('2.3 Método empleado'));
  c.push(parrafo('Durante la reunión se utilizarán las siguientes técnicas:'));
  [
    'Entrevistas semiestructuradas',
    'Preguntas abiertas y cerradas',
    'Revisión de los procesos actuales y de los documentos (cuaderno de registro y constancias de vacunación)',
    'Identificación de problemas y necesidades',
    'Priorización de requerimientos mediante la metodología MoSCoW',
    'Validación verbal de los requerimientos',
    'Confirmación de los requerimientos mediante un acta de reunión',
  ].forEach((t) => c.push(vineta(t)));

  c.push(rotulo('2.4 Fuentes de derivación'));
  c.push(tabla(['Código', 'Fuente', 'Descripción'], [
    ['ENC', 'Encuesta', 'Necesidades relevadas en la encuesta de diagnóstico aplicada a veintitrés productores'],
    ['ENT', 'Entrevista', 'Necesidades tomadas en entrevistas a especialistas (veterinarios y técnico del SENASAG)'],
    ['OBS', 'Observación', 'Problemas identificados mediante la observación de los procesos en el campo'],
    ['DOC', 'Documento', 'Información obtenida de documentos o registros actuales (cuaderno, normativa SENASAG)'],
    ['CLI', 'Cliente', 'Entrevista verbal con el cliente'],
    ['PRO', 'Propuesta', 'Necesidades que el profesional (analista) encontró y propone validar'],
    ['VAL', 'Validación', 'Documentos confirmados y firmados por el cliente'],
  ], [1500, 2400, 5460]));

  // 3
  c.push(titulo('3.- Actores y necesidades en general'));
  c.push(tabla(['Actor', 'Función principal', 'Necesidades generales que se identifican', 'Interfaz principal'],
    ACTORES.filter((a) => a.titulo).map((a) => [
      a.titulo.charAt(0).toUpperCase() + a.titulo.slice(1), a.funcion, a.necesidades, a.interfaz,
    ]), [1500, 2300, 3060, 2500]));
  c.push(espacio());

  c.push(rotulo('Codificación'));
  c.push(tabla(['Prefijo', 'Actor', 'Cantidad'],
    ACTORES.map((a) => [a.prefijo, a.nombre, String(a.filas.length)]), [2000, 4500, 2860]));
  c.push(espacio());

  c.push(rotulo('Priorización de requerimientos mediante la metodología MoSCoW.'));
  c.push(tabla(['PRIORIDAD', 'SIGNIFICADO', 'CRITERIO DE ASIGNACIÓN'], [
    ['Debe', 'Imprescindible', 'Sin este requerimiento el sistema no resuelve el problema principal'],
    ['Debería', 'Importante', 'Aporta un valor significativo, aunque el negocio podría operar sin él'],
    ['Podría', 'Deseable', 'Mejora la solución, pero puede implementarse posteriormente'],
    ['No por ahora', 'Fuera del alcance', 'Es una necesidad válida, pero en esta versión no se contempla'],
  ], [2000, 2400, 4960]));

  // 4–8: requerimientos por actor
  ACTORES.forEach((a, k) => {
    nTabla += 1;
    const n = 4 + k;
    if (a.titulo) {
      c.push(titulo(`${n}. Requerimientos de usuario del ${a.titulo}`));
      c.push(parrafo(a.intro));
      c.push(rotulo(`Tabla ${nTabla}. Requerimientos del ${a.titulo}`));
    } else {
      c.push(titulo(`${n}. Requerimientos de usuario transversales`));
      c.push(parrafo('Estos requerimientos se plantean como necesidades comunes de todos los usuarios y como condiciones generales de aceptación del sistema. Se validarán en la reunión.'));
      c.push(rotulo(`Tabla ${nTabla}. Requerimientos transversales`));
    }
    c.push(tabla(
      ['ID', 'Necesidad expresada por el cliente', 'Fuente', 'Prioridad', 'Criterio de satisfacción'],
      a.filas.map((f) => f.slice(0, 5)),
      [1250, 3150, 850, 1100, 3010],
      { sz: 20, primeraNegrita: true },
    ));
  });

  // 9
  c.push(titulo('9. Necesidades excluidas de la primera versión'));
  c.push(parrafo('Se identificaron algunas necesidades que podrían ser útiles, pero que no forman parte del alcance de esta versión.'));
  c.push(tabla(['ID', 'Necesidad', 'Motivo de exclusión'], EXCLUIDAS, [1500, 4000, 3860], { sz: 20 }));

  // 10
  c.push(titulo('10. Reglas de negocio identificadas'));
  c.push(parrafo('Las siguientes reglas se proponen como condiciones que el sistema debe respetar en cualquier pantalla y en cualquier dispositivo. Se confirmarán con los participantes en la reunión.'));
  c.push(tabla(['Código', 'Regla de negocio'], REGLAS, [1300, 8060], { sz: 20 }));

  // 11
  c.push(titulo('11. Matriz de trazabilidad inicial'));
  c.push(tabla(['Problema a validar en la reunión', 'Requerimiento de usuario', 'Proceso relacionado', 'Regla de negocio'],
    TRAZABILIDAD, [2700, 2400, 2060, 2200], { sz: 19 }));

  // 12
  c.push(titulo('12. Distribución por prioridad'));
  c.push(tabla(['Prioridad', 'Cantidad'], [
    ['Debe', String(contar('Debe'))],
    ['Debería', String(contar('Debería'))],
    ['Podría', String(contar('Podría'))],
    ['No ahora', '0'],
    ['Total', String(todas.length)],
  ], [4680, 4680]));
  c.push(espacio());
  c.push(parrafo(`La mayoría de los requerimientos se clasifican como Debe (${contar('Debe')} de ${todas.length}) porque corresponden a las operaciones esenciales del sistema: identificar al animal, registrar sin conexión, estimar el peso sin báscula, mantener el historial sanitario con sus alertas, sincronizar sin pérdida ni duplicación y controlar el acceso. Los clasificados como Debería corresponden sobre todo a la evaluación para la venta, la comercialización, el control reproductivo y los reportes, además del registro del destete y los traslados y de algunos ajustes de configuración, que agregan valor sobre esa base.`));

  // 13
  c.push(titulo('13. Acta de validación con los clientes'));
  c.push(rotulo('13.1 Acuerdos alcanzados'));
  c.push(parrafo('Acuerdos propuestos para confirmar durante la reunión de levantamiento:'));
  [
    'El sistema debe identificar a cada animal por el número de su caravana, sin repetirse entre los animales activos.',
    'El peso se estima a partir del perímetro torácico y el largo corporal, sin báscula, y se registra siempre como valor calculado.',
    'La aplicación debe funcionar sin conexión en el campo y sincronizar cuando haya señal.',
    'Lo registrado en el teléfono no debe perderse ni duplicarse al sincronizar.',
    'Los eventos sanitarios se registran por animal y por fecha, con el producto aplicado y el responsable.',
    'El sistema debe avisar de las vacunas y tratamientos próximos o vencidos según los protocolos de la zona.',
    'Cada persona debe utilizar una cuenta individual y los permisos se asignan según su función.',
    'La información no se borra: toda eliminación es lógica.',
    'Los conflictos sobre pesos y eventos sanitarios los decide el usuario; el sistema no los resuelve solo.',
    'Los requerimientos clasificados como "Debe" serán considerados para la primera versión del sistema.',
    'Los requerimientos "Debería" y "Podría" serán evaluados según tiempo y disponibilidad.',
  ].forEach((t) => c.push(numerado(t)));

  c.push(rotulo('13.2 Observaciones de los clientes'));
  c.push(tabla(['Código', 'Observación', 'Tratamiento'], [
    ['OBS-CLI-01', '', ''],
    ['OBS-CLI-02', '', ''],
    ['OBS-CLI-03', '', ''],
  ], [1800, 4200, 3360]));
  c.push(espacio());

  c.push(rotulo('13.3 Criterio de aprobación'));
  c.push(parrafo('Los requerimientos se considerarán aprobados cuando:'));
  [
    'El cliente confirme que la necesidad está correctamente expresada.',
    'El actor asociado sea correcto.',
    'La prioridad sea aceptada.',
    'El criterio de satisfacción sea comprensible.',
    'No exista contradicción con otro requerimiento.',
    'El requerimiento pueda transformarse posteriormente en una funcionalidad verificable.',
  ].forEach((t) => c.push(vineta(t)));

  // 14
  c.push(titulo('14. Firmas de conformidad'));
  c.push(tabla(['Participante', 'Cargo', 'Firma', 'Fecha'], [
    ['', 'Propietario', '', '__/__/2026'],
    ['', 'Administrador', '', '__/__/2026'],
    ['', 'Personal de campo', '', '__/__/2026'],
    ['', 'Veterinario', '', '__/__/2026'],
    ['Carlos Mateo Ibáñez Rodríguez', 'Analista de requerimientos', '', '__/__/2026'],
  ], [2800, 2800, 2000, 1760]));

  return c;
}

const doc = new Document({
  styles: { default: { document: { run: { font: FUENTE, size: 22 } } } },
  numbering: {
    config: [
      {
        reference: 'vinetas',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: 'acuerdos',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ children: [PageNumber.CURRENT], font: FUENTE, size: 20 })],
        })],
      }),
    },
    children: construir(),
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  const salida = path.join(__dirname, 'Requerimientos_Usuario_GanaBol.docx');
  fs.writeFileSync(salida, buffer);
  console.log(`Generado: ${path.basename(salida)} (${(buffer.length / 1024).toFixed(0)} KB)`);
});
