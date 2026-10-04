/**
 * Acta de levantamiento de requerimientos.
 *
 * Sigue la estructura del modelo de la asignatura: contexto de la reunión,
 * participantes, método, fuentes de derivación, requerimientos de usuario
 * agrupados por actor, necesidades excluidas, reglas de negocio, trazabilidad
 * inicial, distribución por prioridad, acta de validación y firmas.
 *
 * El contenido sustantivo —los diecisiete requerimientos con su prioridad, las
 * reglas de negocio, los procesos— proviene del documento de proyecto de
 * grado, de modo que ambos digan lo mismo.
 *
 * Lo que este generador NO puede producir queda como campo en blanco visible:
 * la fecha y el lugar de la reunión, los nombres de los participantes, sus
 * observaciones y sus firmas. Son hechos, no derivaciones, y completarlos sin
 * que hayan ocurrido convertiría el acta en un documento falso.
 */
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');
const U = require('./univalle');

const VACIO = '______________________';

/**
 * Cuadro sin rótulo numerado.
 *
 * El acta es un documento independiente: sus cuadros no entran en el índice de
 * cuadros del proyecto de grado y no deben llevar la numeración «Cuadro N».
 * Se reutiliza el constructor del módulo de formato —que resuelve anchos,
 * sombreado del encabezado y saltos de línea en las celdas— y se descarta el
 * párrafo del rótulo, que es el primer elemento que devuelve.
 */
function tabla(encabezados, filas, pesos) {
  // El constructor devuelve [rótulo, tabla, fuente]. El acta conserva solo la
  // tabla: no lleva rótulo numerado ni nota de fuente, que son convenciones
  // del documento académico y no de un documento administrativo que se firma.
  const partes = U.cuadro('', '', encabezados, filas, '', pesos);
  return [partes[1], espacio()];
}

/** Separación entre una tabla y el texto que la sigue. */
function espacio() {
  return new Paragraph({ spacing: { after: 240 }, children: [] });
}

/** Cuadro de campo y contenido, con el valor en blanco cuando es un hecho. */
function campos(filas) {
  return tabla(['Campo', 'Contenido'], filas, [0.3, 0.7]);
}

function encabezado(texto) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: texto, font: U.FUENTE, size: U.MENOR, color: '666666' })],
  });
}

// --- Requerimientos de usuario, agrupados por actor -------------------------
//
// La columna de fuente indica la técnica de la que procede cada necesidad.
// Es una propuesta derivada del Capítulo III y debe contrastarse con lo que
// efectivamente ocurrió antes de firmar el acta.

const REQUISITOS = [
  ['Propietario', 'C-01', [
    ['RU-PRO-01', 'UR-11', 'Necesito una vista resumida del estado del hato para decidir sin recorrer el campo.', 'ENC, OBS', 'Alta',
     'El propietario consulta en una sola pantalla el total del hato, su distribución por fase y las tareas pendientes.'],
    ['RU-PRO-02', 'UR-17', 'Necesito saber qué animal conviene vender y no decidir solo por lo que veo.', 'ENC, PRO', 'Media',
     'El sistema ordena los animales por un puntaje que combina peso, edad y estado sanitario, y el orden cambia al ajustar la importancia de cada criterio.'],
    ['RU-PRO-03', 'UR-09', 'Necesito registrar la venta con el peso de referencia y el precio acordado.', 'ENC, DOC', 'Media',
     'La venta queda registrada con sus animales, su peso de referencia y su precio, y los animales salen del inventario activo.'],
    ['RU-PRO-04', 'UR-12', 'Necesito poder sacar un reporte para mostrarlo o archivarlo.', 'PRO', 'Media',
     'El sistema emite reportes de inventario, sanidad y comercialización en un archivo que puede guardarse o imprimirse.'],
  ]],
  ['Personal de campo', 'C-02', [
    ['RU-CAM-01', 'UR-03', 'Necesito registrar en el corral aunque no haya señal, que es lo habitual.', 'ENC, OBS', 'Alta',
     'Un registro hecho sin conexión queda disponible de inmediato en el mismo dispositivo y se envía solo cuando aparece la señal.'],
    ['RU-CAM-02', 'UR-02', 'Necesito que cada animal esté identificado una sola vez y no se repita la caravana.', 'ENC, OBS', 'Alta',
     'El sistema rechaza dar de alta un animal con una caravana que ya existe entre los activos.'],
    ['RU-CAM-03', 'UR-04', 'Necesito saber cuánto pesa el animal sin tener báscula.', 'ENC, ENT', 'Alta',
     'Con dos medidas tomadas con cinta, el sistema muestra el peso estimado en el momento y lo guarda en el historial del animal.'],
    ['RU-CAM-04', 'UR-06', 'Necesito que quede anotado cuándo se desteta cada animal y en qué fase está.', 'OBS, ENT', 'Media',
     'El cambio de fase queda registrado con su fecha y el animal aparece en la fase que le corresponde.'],
    ['RU-CAM-05', 'UR-08', 'Necesito saber en qué potrero está cada animal y cuándo se movió.', 'ENC, OBS', 'Media',
     'El traslado actualiza la ubicación del animal y queda en su historial de movimientos.'],
  ]],
  ['Veterinario', 'C-03', [
    ['RU-VET-01', 'UR-05', 'Necesito ver qué se le aplicó a cada animal y cuándo, antes de indicar un tratamiento.', 'ENT, DOC', 'Alta',
     'El historial del animal muestra cada evento con su tipo, su fecha, el producto aplicado y el responsable.'],
    ['RU-VET-02', 'UR-15', 'Necesito que el sistema avise de las vacunas y desparasitaciones que vencen.', 'ENT, DOC', 'Alta',
     'El calendario muestra las tareas próximas y vencidas por animal, y la tarea desaparece al registrarse el evento que la cumple.'],
    ['RU-VET-03', 'UR-16', 'Necesito llevar el control reproductivo de las hembras y saber cuándo paren.', 'ENT', 'Media',
     'El servicio confirmado calcula la fecha probable de parto y el estado reproductivo queda consultable.'],
    ['RU-VET-04', 'UR-07', 'Necesito una referencia de alimentación según la raza y la categoría del animal.', 'ENT, DOC', 'Media',
     'El sistema presenta el requerimiento nutricional correspondiente a la raza y la categoría consultadas.'],
  ]],
  ['Administrador', 'C-04', [
    ['RU-ADM-01', 'UR-01', 'Necesito que cada persona entre con su cuenta y vea solo lo que le corresponde.', 'ENC, PRO', 'Alta',
     'Cada usuario accede con credenciales propias y el sistema rechaza toda función ajena a su rol.'],
    ['RU-ADM-02', 'UR-13', 'Necesito que la información no se pierda ni se altere, y que haya respaldo.', 'ENC, OBS', 'Alta',
     'La información consolidada no se altera sin registro y existe una copia local recuperable.'],
  ]],
  ['Transversales a todos los actores', '—', [
    ['RU-GEN-01', 'UR-10', 'Lo que se carga en el campo tiene que llegar al servidor sin perderse ni duplicarse.', 'ENC, PRO', 'Alta',
     'Una interrupción durante el envío no deja registros incompletos ni repetidos, y el reenvío del mismo registro no lo duplica.'],
    ['RU-GEN-02', 'UR-14', 'La aplicación tiene que poder usarse con una explicación corta.', 'ENC, OBS', 'Media',
     'Una persona sin experiencia previa completa el alta de un animal y un pesaje tras una explicación de pocos minutos.'],
  ]],
];

const EXCLUIDAS = [
  ['NE-01', 'Gestión de explotaciones de bovinos lecheros.', 'Fuera de la delimitación temática: el sistema se orienta a crianza, destete y engorde.'],
  ['NE-02', 'Gestión de ovinos, caprinos y camélidos.', 'Fuera de la delimitación temática.'],
  ['NE-03', 'Integración con sistemas de comercialización mayorista o con frigoríficos.', 'Requiere acuerdos con terceros que exceden el alcance del proyecto académico.'],
  ['NE-04', 'Lectura automática de caravanas por radiofrecuencia.', 'Exige equipamiento que el perfil de usuario relevado no posee.'],
  ['NE-05', 'Facturación y contabilidad de la explotación.', 'Corresponde a un dominio distinto del productivo y sanitario.'],
  ['NE-06', 'Operación con razas distintas de Nelore, Brahman, Criollo y Santa Gertrudis.', 'La calibración de la estimación de peso se define para esas cuatro.'],
];

const TRAZABILIDAD = [
  ['El productor no conoce el historial completo de cada animal.', 'RU-CAM-02, RU-VET-01', 'P1, P3', 'RN-01, RN-02, RN-05'],
  ['El peso se estima a ojo y se negocia sin dato objetivo.', 'RU-CAM-03, RU-PRO-02', 'P2, P9', 'RN-03, RN-04, RN-12'],
  ['Los registros se actualizan tarde o solo ante un evento.', 'RU-CAM-01, RU-GEN-01', 'P6', 'RN-08, RN-09, RN-10'],
  ['Las vacunas se retrasan porque nada avisa del vencimiento.', 'RU-VET-02', 'P7', 'RN-05'],
  ['La señal es intermitente y las soluciones existentes exigen conexión.', 'RU-CAM-01, RU-GEN-01', 'P6', 'RN-08, RN-09'],
  ['Se pierde información de animales.', 'RU-ADM-02', 'P1, P6', 'RN-08'],
  ['Cualquier persona puede modificar cualquier dato.', 'RU-ADM-01', 'P1 a P9', 'RN-02'],
  ['No se sabe en qué potrero está cada animal.', 'RU-CAM-05', 'P1', 'RN-01'],
];

function construir() {
  const c = [];

  c.push(encabezado('UNIVERSIDAD PRIVADA DEL VALLE · FACULTAD DE INFORMÁTICA Y ELECTRÓNICA'));
  c.push(U.tituloSimple('ACTA DE LEVANTAMIENTO DE REQUERIMIENTOS', { before: 200, after: 120 }));
  c.push(U.tituloSimple('Sistema móvil de gestión ganadera para explotaciones bovinas tradicionales',
    { size: U.NIVEL2, after: 320 }));

  // --- 1 ---
  c.push(U.h1('1.', 'Propósito del documento'));
  c.push(U.p('El presente documento deja constancia del levantamiento de requerimientos realizado con los interesados del establecimiento ganadero y con los productores consultados durante el diagnóstico. Recoge las necesidades tal como fueron expresadas, su fuente, su prioridad y el criterio con que cada una se considerará satisfecha.'));
  c.push(U.p('El acta es la base de la especificación de requisitos del Capítulo IV del proyecto de grado: cada necesidad de este documento se traduce allí en uno o más requisitos de software, con su criterio de verificación y su caso de uso asociado.'));

  // --- 2 ---
  c.push(U.h1('2.', 'Contexto de la reunión'));
  c.push(U.h2('2.1.', 'Datos de la reunión'));
  c.push(...campos([
    ['Nombre de la reunión', 'Reunión de levantamiento de requerimientos'],
    ['Organización', 'Establecimiento ganadero Sabayones, zona del Izozog'],
    ['Fecha', VACIO],
    ['Lugar', VACIO],
    ['Modalidad', VACIO],
    ['Objetivo', 'Identificar y validar las necesidades de los usuarios del sistema de gestión ganadera'],
    ['Responsable del levantamiento', VACIO],
    ['Resultado esperado', 'Listado de requerimientos de usuario, validado y firmado por los participantes'],
  ]));

  c.push(U.h2('2.2.', 'Participantes'));
  c.push(U.p('Los participantes se identifican con un código que se emplea en el resto del documento para atribuir cada necesidad a quien la expresó.'));
  c.push(...tabla(
    ['Código', 'Nombre', 'Rol en la explotación', 'Responsabilidad respecto del sistema'],
    [
      ['C-01', VACIO, 'Propietario', 'Decide sobre la venta, la reposición y la inversión en el hato'],
      ['C-02', VACIO, 'Personal de campo', 'Ejecuta el manejo diario y genera la información en el momento del hecho'],
      ['C-03', VACIO, 'Veterinario', 'Diagnostica, indica tratamientos y define los calendarios sanitarios'],
      ['C-04', VACIO, 'Administrador', 'Gestiona usuarios, parámetros del establecimiento y respaldo'],
      ['C-05', VACIO, 'Analista de requerimientos', 'Conduce el levantamiento y redacta el acta'],
    ], [0.09, 0.26, 0.2, 0.45]));

  c.push(U.h2('2.3.', 'Método empleado'));
  c.push(U.p('El levantamiento combinó las técnicas descritas en el Capítulo III del proyecto de grado:'));
  [
    'Entrevista semiestructurada con preguntas abiertas y cerradas, que permitió al entrevistado desarrollar sus respuestas más allá del cuestionario previsto.',
    'Encuesta de diagnóstico estructurada en cinco dimensiones, aplicada a productores del departamento.',
    'Observación directa de los procesos en la explotación, con registro de las condiciones reales de uso.',
    'Revisión documental de los registros existentes y de la normativa sanitaria aplicable.',
    'Priorización de las necesidades según su impacto sobre el problema diagnosticado.',
    'Validación verbal de las necesidades con los participantes y confirmación mediante la presente acta.',
  ].forEach((l) => c.push(U.vinheta(l)));

  c.push(U.h2('2.4.', 'Fuentes de derivación'));
  c.push(U.p('Cada necesidad indica la fuente de la que procede, con los códigos siguientes:'));
  c.push(...tabla(['Código', 'Fuente', 'Descripción'],
    [
      ['ENC', 'Encuesta', 'Necesidad relevada mediante el instrumento de diagnóstico aplicado a los productores'],
      ['ENT', 'Entrevista', 'Necesidad expresada por un especialista del sector en entrevista semiestructurada'],
      ['OBS', 'Observación', 'Necesidad identificada al observar el proceso en la explotación'],
      ['DOC', 'Documento', 'Necesidad derivada de la normativa sanitaria o de los registros existentes'],
      ['PRO', 'Propuesta', 'Necesidad propuesta por el analista a partir del diagnóstico y validada con el cliente'],
      ['VAL', 'Validación', 'Necesidad confirmada por el cliente en la reunión de validación'],
    ], [0.1, 0.2, 0.7]));
  c.push(U.pMixto([
    ['Advertencia sobre la columna de fuente. ', { bold: true }],
    ['La atribución de cada necesidad a una técnica concreta es una propuesta construida a partir del Capítulo III. Antes de firmar el acta corresponde contrastarla con lo que efectivamente ocurrió en el levantamiento y corregir lo que no coincida.'],
  ], { sinSangria: true, after: 200 }));

  // --- 3 ---
  c.push(U.h1('3.', 'Requerimientos de usuario por actor'));
  c.push(U.p('Se presentan agrupados por el actor que los expresó. La columna de necesidad del proyecto remite al código con que la misma necesidad figura en el Capítulo IV del proyecto de grado, de modo que ambos documentos puedan contrastarse.'));

  REQUISITOS.forEach(([actor, codigo, filas], i) => {
    c.push(U.h2(`3.${i + 1}.`, `Requerimientos de ${actor.toLowerCase()} (${codigo})`));
    c.push(...tabla(
      ['ID', 'Necesidad expresada', 'Necesidad del proyecto', 'Fuente', 'Prioridad', 'Criterio de satisfacción'],
      filas.map(([id, ur, nec, fuente, prio, crit]) => [id, nec, ur, fuente, prio, crit]), [0.1, 0.26, 0.09, 0.08, 0.08, 0.39]));
  });

  // --- 4 ---
  c.push(U.h1('4.', 'Necesidades excluidas de la primera versión'));
  c.push(U.p('Se deja constancia de lo que quedó fuera del alcance, porque una necesidad excluida sin registro reaparece después como un incumplimiento.'));
  c.push(...tabla(['Código', 'Necesidad excluida', 'Motivo'],
    EXCLUIDAS, [0.1, 0.4, 0.5]));

  // --- 5 ---
  c.push(U.h1('5.', 'Reglas de negocio identificadas'));
  c.push(U.p('Las reglas son condiciones del dominio ganadero que el sistema debe hacer cumplir con independencia de la pantalla desde la que se opere. Se reproducen del Capítulo IV del proyecto de grado, donde figuran con su proceso de origen.'));
  c.push(U.p('Se identifican como RN-01 a RN-12 y comprenden, entre otras, la unicidad de la caravana entre los animales activos, el rechazo de medidas corporales fuera de rango antes de calcular el peso, la asociación obligatoria de todo evento sanitario a un animal y a una fecha, el carácter lógico de toda eliminación y la resolución no automática de los conflictos sobre pesos y eventos sanitarios.'));

  // --- 6 ---
  c.push(U.h1('6.', 'Matriz de trazabilidad inicial'));
  c.push(U.p('La matriz vincula cada problema identificado en el levantamiento con los requerimientos que lo atienden, el proceso de negocio en que ocurre y las reglas que lo gobiernan.'));
  c.push(...tabla(
    ['Problema identificado', 'Requerimiento', 'Proceso', 'Regla de negocio'],
    TRAZABILIDAD, [0.42, 0.24, 0.14, 0.2]));

  // --- 7 ---
  c.push(U.h1('7.', 'Distribución por prioridad'));
  const todos = REQUISITOS.flatMap(([, , filas]) => filas);
  const altas = todos.filter((f) => f[4] === 'Alta').length;
  const medias = todos.length - altas;
  c.push(...tabla(['Prioridad', 'Cantidad', 'Criterio'],
    [
      ['Alta', String(altas), 'Atiende de forma directa una de las cuatro causas centrales del problema diagnosticado'],
      ['Media', String(medias), 'Mejora la gestión pero no condiciona la utilidad del sistema en su primera versión'],
      ['Total', String(todos.length), ''],
    ], [0.16, 0.14, 0.7]));
  c.push(U.p(`De los ${todos.length} requerimientos relevados, ${altas} son de prioridad alta y ${medias} de prioridad media. Los de prioridad alta son los que la planificación por incrementos aborda primero, conforme al cronograma del Capítulo VI.`));

  // --- 8 ---
  c.push(U.h1('8.', 'Acta de validación con los clientes'));

  c.push(U.h2('8.1.', 'Acuerdos alcanzados'));
  [
    'La aplicación debe funcionar sin conexión a internet y consolidar la información cuando la señal esté disponible.',
    'Cada animal se identifica de forma individual mediante su número de caravana, que no se repite entre los animales activos.',
    'El peso se estima a partir de medidas corporales tomadas con cinta, sin pesaje físico, y se registra siempre como valor calculado.',
    'Los eventos sanitarios se registran por animal y por fecha, con el producto aplicado y el responsable.',
    'El sistema avisa de las tareas sanitarias próximas y vencidas, y la tarea se cierra al registrarse el evento que la cumple.',
    'Cada persona accede con una cuenta propia y el sistema verifica su rol antes de ejecutar cada función.',
    'La información no se borra: toda eliminación es lógica y el dato se conserva.',
    'Los conflictos sobre pesos y eventos sanitarios no se resuelven de forma automática; los resuelve el usuario.',
  ].forEach((l) => c.push(U.vinheta(l)));

  c.push(U.h2('8.2.', 'Observaciones de los clientes'));
  c.push(U.p('Se consignan a continuación las observaciones formuladas por los participantes durante la validación:'));
  for (let i = 1; i <= 4; i += 1) {
    c.push(U.p(`${i}. ${'_'.repeat(92)}`, { sinSangria: true, after: 180 }));
  }

  c.push(U.h2('8.3.', 'Criterio de aprobación'));
  c.push(U.p('Los participantes dan por validado el listado de requerimientos cuando cada necesidad expresada figura en el documento con su prioridad y su criterio de satisfacción, y cuando las necesidades excluidas de esta versión constan con su motivo. La firma de la sección siguiente deja constancia de esa conformidad.'));

  // --- 9 ---
  c.push(U.h1('9.', 'Firmas de conformidad'));
  c.push(...tabla(['Participante', 'Rol', 'Firma', 'Fecha'],
    [
      // Las celdas de firma se dejan con alto suficiente para firmar a mano
      // sobre el documento impreso.
      [VACIO, 'Propietario', '\n\n', '____ / ____ / 2026'],
      [VACIO, 'Personal de campo', '\n\n', '____ / ____ / 2026'],
      [VACIO, 'Veterinario', '\n\n', '____ / ____ / 2026'],
      [VACIO, 'Administrador', '\n\n', '____ / ____ / 2026'],
      [VACIO, 'Analista de requerimientos', '\n\n', '____ / ____ / 2026'],
    ], [0.3, 0.24, 0.26, 0.2]));

  return c;
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: U.FUENTE, size: U.CUERPO } },
      heading1: { run: { font: U.FUENTE, size: U.NIVEL1, bold: true, color: '000000' } },
      heading2: { run: { font: U.FUENTE, size: U.NIVEL2, bold: true, italics: true, color: '000000' } },
    },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1417, right: 1134, bottom: 1417, left: 1701 },
      },
    },
    children: construir(),
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  const salida = path.join(__dirname, 'Acta_Levantamiento_Requerimientos.docx');
  fs.writeFileSync(salida, buffer);
  console.log(`Acta generada: ${path.basename(salida)} (${(buffer.length / 1024).toFixed(0)} KB)`);
});
