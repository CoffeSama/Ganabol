/** CAPÍTULO IV — ANÁLISIS Y ESPECIFICACIÓN DE REQUISITOS. */
const U = require('../univalle');
const F = require('../fuentes');

const PROCESOS = [
  ['P1', 'Alta y trazabilidad del animal', '91a52004d2cdd2cf8c11ff61879f43493a54b449.png'],
  ['P2', 'Estimación del peso por método morfométrico', 'b19c092a39c829d67f08861054f2f34451e21821.png'],
  ['P3', 'Registro de un evento sanitario', '7b0fb474cb737feae3a649e391212fe3f8fef626.png'],
  ['P4', 'Destete y cambio de fase de manejo', '697afa33206d1295e32fc1ee743a70fa96e47c4b.png'],
  ['P5', 'Registro de la comercialización', '8ad656b562f67d9a48a9693111680757976d985e.png'],
  ['P6', 'Sincronización entre el dispositivo y el servidor', '52d8d1384e255c84794d52998b1420772ea01b29.png'],
  ['P7', 'Generación y atención de una alerta', 'f8064500999df27c52f995445b67cb3a873eb1ff.png'],
  ['P8', 'Registro de un evento reproductivo', '999d09fd0db9f93ed0849cbc1fc5cd5a076ae050.png'],
  ['P9', 'Evaluación ponderada para la selección de venta', '287407dce583232a09d7c8a6023715f17f8f37d3.png'],
];

const REQUISITOS = [
  'RF1. Gestionar usuarios y roles',
  'RF2. Registrar y administrar el ganado',
  'RF3. Operar y registrar información sin conexión',
  'RF4. Estimar el peso corporal por método morfométrico',
  'RF5. Registrar eventos sanitarios',
  'RF6. Gestionar las fases de manejo y el destete',
  'RF7. Consultar la referencia nutricional por raza y categoría',
  'RF8. Registrar movimientos y ubicación del ganado',
  'RF9. Registrar la comercialización',
  'RF10. Sincronizar los datos y resolver conflictos',
  'RF11. Presentar el estado del hato',
  'RF12. Emitir reportes',
  'RF13. Gestionar alertas del calendario sanitario y reproductivo',
  'RF14. Registrar el control reproductivo',
  'RF15. Evaluar animales para la selección de venta',
];

const CASOS_DETALLADOS = [
  ['5.2. CU-02. REGISTRAR Y ADMINISTRAR EL GANADO', 'CU-02'],
  ['5.4. CU-04. ESTIMAR EL PESO POR MÉTODO MORFOMÉTRICO', 'CU-04'],
  ['5.10. CU-10. SINCRONIZAR Y RESOLVER CONFLICTOS', 'CU-10'],
];

module.exports = function capitulo4() {
  const c = [];
  c.push(...U.portadaCapitulo('CAPÍTULO IV', 'ANÁLISIS Y ESPECIFICACIÓN DE REQUISITOS'));

  c.push(U.p('Este capítulo traduce el diagnóstico de campo en una especificación verificable de lo que el sistema debe hacer. Describe el contexto de aplicación, documenta el proceso actual y sus puntos críticos, identifica a los usuarios y sus necesidades, y formula los requisitos funcionales y no funcionales con sus criterios de verificación. Cierra con el modelado de los requisitos y el análisis de factibilidad del proyecto.'));
  c.push(U.p('La estructura y el contenido de la especificación siguen las recomendaciones del estándar IEEE 830, referente para la práctica de especificación de requisitos de software, complementado con el modelo de calidad de la norma ISO/IEC 25010 para los requisitos no funcionales.'));

  // --- 4.1 ---
  c.push(U.h1('4.1.', 'Descripción del contexto de aplicación'));

  c.push(U.h2('4.1.1.', 'El establecimiento ganadero'));
  c.push(U.p('El caso de aplicación es el establecimiento ganadero Sabayones, propiedad familiar ubicada en la zona del Izozog, Chaco del departamento de Santa Cruz. Opera bajo un sistema de pastoreo extensivo en campo natural, con el hato distribuido en potreros y un corral de manejo donde se concentran las tareas sanitarias y de medición.'));
  c.push(U.p('El establecimiento presenta las condiciones que caracterizan a la explotación tradicional de la zona: superficie extensa, conectividad celular intermitente, acceso irregular a servicios veterinarios y ausencia total de registros digitales. Esas condiciones son las que el sistema debe tolerar, y no supuestos que el sistema pueda modificar.'));

  c.push(U.h2('4.1.2.', 'Objetivos de la unidad productiva'));
  c.push(U.p('La explotación persigue tres objetivos operativos que el sistema debe apoyar: mantener el hato sano mediante el cumplimiento del calendario sanitario, lograr que los animales alcancen la condición de venta en el menor tiempo posible, y vender en el momento y al precio que maximicen el retorno. Los tres dependen de información que hoy no existe de forma sistemática.'));

  c.push(U.h2('4.1.3.', 'Área donde se aplica la solución'));
  c.push(U.p('La solución se aplica sobre el proceso completo de gestión del hato en sus fases de crianza, destete y engorde: el registro del animal, su seguimiento sanitario, el control de su peso, su ubicación dentro del predio, su historial reproductivo y la decisión de comercialización.'));

  c.push(U.h2('4.1.4.', 'Situación actual del registro'));
  c.push(U.p('El seguimiento del hato se apoya hoy en registros manuales en cuadernos y planillas dispersas, que se consolidan de forma tardía y no permiten conocer con oportunidad el estado individual de cada animal. El diagnóstico aplicado a veintitrés productores de Pailón, Abapó y San Julián confirmó que el seguimiento del peso se realiza de forma visual o esporádica, que la conectividad a internet en el campo es intermitente y que ninguno de los consultados emplea una herramienta digital especializada.'));

  // --- 4.2 ---
  c.push(U.h1('4.2.', 'Diagnóstico del proceso actual'));

  c.push(U.h2('4.2.1.', 'Inventario de procesos'));
  c.push(U.p('El análisis identificó nueve procesos de negocio que el sistema debe soportar. Cada uno tiene un disparador propio, un resultado verificable y una frecuencia característica que condiciona las prioridades de diseño: un proceso que ocurre varias veces al día impone exigencias de rapidez que uno mensual no impone. El Cuadro 4.1 los inventaria con su disparador, su resultado verificable y su frecuencia.'));
  {
    const t = F.tabla('procesos', 'Cuadro 1. Inventario de procesos del sistema');
    c.push(...U.cuadro('4.1', 'Inventario de procesos del negocio ganadero',
      t.encabezados, t.filas,
      'Elaboración propia a partir del diagnóstico aplicado a productores de Pailón, Abapó y San Julián, 2026.',
      [0.08, 0.26, 0.24, 0.26, 0.16]));
  }

  c.push(U.h2('4.2.2.', 'Diagramas de flujo de los procesos'));
  c.push(U.p('Los procesos se representan mediante diagramas de flujo con carriles funcionales, notación que permite ver simultáneamente la secuencia de actividades y el actor responsable de cada una. La distinción importa en este dominio: buena parte de las dificultades operativas proviene de que la información se genera en un rol y se necesita en otro. Las Figuras 4.1 a 4.9 recogen un diagrama por proceso, en el mismo orden del inventario anterior.'));

  PROCESOS.forEach(([codigo, titulo, imagen], i) => {
    c.push(U.h3(`4.2.2.${i + 1}.`, `Proceso ${codigo}. ${titulo}`));
    const desc = F.parrafos(
      F.seccion('procesos', `PROCESO ${codigo}. ${titulo.toUpperCase()}`,
        i + 1 < PROCESOS.length ? `PROCESO ${PROCESOS[i + 1][0]}.` : '9. REFERENCIAS'),
      { max: 2 },
    );
    desc.forEach((t) => c.push(U.p(t)));
    c.push(...U.figura(imagen, `4.${i + 1}`, `Proceso ${codigo}. ${titulo}`,
      'Elaboración propia, 2026. Notación de diagrama de flujo con carriles funcionales según Sommerville (2016).'));
  });

  c.push(U.h2('4.2.3.', 'Actores y responsables'));
  c.push(U.p('La operación involucra a cuatro actores con responsabilidades diferenciadas, ya presentados en el Cuadro 1.1. La separación es relevante para el diseño del control de acceso: el personal de campo genera la mayor parte de la información pero no debe modificar la parametrización del sistema; el veterinario registra eventos sanitarios pero no da de alta animales; el propietario consulta y decide pero no opera en el terreno.'));

  c.push(U.h2('4.2.4.', 'Problemas y puntos críticos'));
  c.push(U.p('El diagnóstico identificó cuatro problemas centrales, cada uno con una consecuencia económica o sanitaria verificable:'));
  c.push(U.vinheta('**Ausencia de trazabilidad individual.** El productor no conoce el historial completo de cada animal, lo que lleva a decisiones de manejo y de venta basadas en estimaciones subjetivas. El sesenta por ciento de los encuestados ha perdido información relevante de algún animal.'));
  c.push(U.vinheta('**Desactualización crónica de los registros.** El setenta por ciento actualiza su información de forma mensual o solo ante un evento, lo que abre una brecha temporal entre la realidad del hato y la información disponible al decidir.'));
  c.push(U.vinheta('**Ausencia de apoyo a la comercialización.** El cincuenta y cinco por ciento negocia sin conocer el peso real del animal que ofrece, lo que produce una asimetría de información que favorece sistemáticamente al comprador.'));
  c.push(U.vinheta('**Conectividad insuficiente.** La intermitencia de la señal impide el uso de las aplicaciones existentes, lo que explica que ninguno de los encuestados emplee una herramienta digital pese a disponer del dispositivo.'));

  c.push(U.h2('4.2.5.', 'Indicadores de la situación actual'));
  c.push(U.p('El diagnóstico cuantificó la situación de partida sobre cinco indicadores, cada uno con una implicación directa sobre el diseño. El Cuadro 4.2 los reúne con el valor relevado y la consecuencia que de él se desprende.'));
  c.push(...U.cuadro('4.2', 'Indicadores del proceso actual relevados en el diagnóstico',
    ['Indicador', 'Valor relevado', 'Implicación para el diseño'],
    [
      ['Productores con teléfono inteligente', '87 %', 'El equipamiento no es la barrera; el sistema puede asumir su disponibilidad'],
      ['Productores que usan una herramienta digital', '0 %', 'No hay solución adoptada; la oferta existente no sirve al contexto'],
      ['Registro en cuaderno o planilla', '52 %', 'El reemplazo debe ser al menos tan rápido como escribir en papel'],
      ['Actualización mensual o solo ante evento', '70 %', 'El registro debe ocurrir en el momento del hecho, no después'],
      ['Pérdida de información de algún animal', '60 %', 'La persistencia local debe ser confiable ante cierres inesperados'],
      ['Venta por debajo del valor real', '55 %', 'La estimación de peso es la funcionalidad de mayor impacto económico'],
    ],
    'Elaboración propia a partir del instrumento de diagnóstico aplicado a veintitrés productores, 2026.',
    [0.33, 0.14, 0.53]));
  c.push(U.p('Los valores anteriores corresponden a proporciones sobre veintitrés respuestas válidas y se presentan redondeados, conforme fueron tabulados en el instrumento de diagnóstico cuyo detalle se incorpora como apéndice.'));

  // --- 4.3 ---
  c.push(U.h1('4.3.', 'Análisis de usuarios y partes interesadas'));

  c.push(U.h2('4.3.1.', 'Identificación de usuarios'));
  c.push(U.p('El sistema reconoce cuatro tipos de usuario, que se corresponden con los actores identificados en el diagnóstico del proceso actual. El Cuadro 4.3 precisa la responsabilidad de cada uno dentro del sistema.'));
  {
    const t = F.tabla('srs', 'Cuadro 2. Actores del sistema y su responsabilidad');
    c.push(...U.cuadro('4.3', 'Actores del sistema y su responsabilidad',
      t.encabezados, t.filas,
      'Elaboración propia a partir del diagnóstico aplicado a productores de Pailón, Abapó y San Julián, 2026.',
      [0.17, 0.33, 0.5]));
  }

  c.push(U.h2('4.3.2.', 'Perfil de los usuarios'));
  c.push(U.p('El perfil condiciona el diseño de la interfaz más que cualquier otra variable. El personal de campo, que es quien más usa el sistema, es también quien menos conocimiento informático tiene; de ahí que las pantallas de registro sean las más simples del sistema y las de administración las únicas que admiten densidad. El Cuadro 4.4 reúne el perfil de cada tipo de usuario previsto.'));
  {
    const t = F.tabla('srs', 'Cuadro 4. Perfil de los usuarios previstos');
    c.push(...U.cuadro('4.4', 'Perfil de los usuarios previstos',
      t.encabezados, t.filas,
      'Elaboración propia a partir del diagnóstico de productores de las zonas relevadas, 2026.'));
  }

  c.push(U.h2('4.3.3.', 'Necesidades de los usuarios'));
  c.push(U.p('Las necesidades se enuncian en el lenguaje del negocio ganadero, sin comprometer una solución técnica, y se identifican con el prefijo UR. Cada una se traduce después en uno o más requisitos de software, según establece la matriz de trazabilidad de la sección 4.6.6. El Cuadro 4.5 las enumera con la prioridad que les asignó el diagnóstico.'));
  {
    const t = F.tabla('srs', 'Cuadro 3. Necesidades de los usuarios');
    c.push(...U.cuadro('4.5', 'Necesidades de los usuarios',
      t.encabezados, t.filas,
      'Necesidades relevadas en el diagnóstico aplicado a veintitrés productores de Pailón, Abapó y San Julián, 2026.',
      [0.1, 0.76, 0.14]));
  }

  c.push(U.h2('4.3.4.', 'Restricciones y supuestos del usuario'));
  F.items(F.seccion('srs', '2.4. Restricciones y supuestos del usuario', '3. ESPECIFICACIÓN DE REQUISITOS DE SOFTWARE'))
    .forEach((t) => c.push(U.vinheta(t)));

  c.push(U.h2('4.3.5.', 'Matriz de partes interesadas'));
  c.push(U.p('Más allá de quienes operan el sistema, hay partes interesadas que condicionan su adopción sin usarlo directamente. El Cuadro 4.6 las sitúa según su interés en el proyecto y su capacidad de influir sobre él.'));
  c.push(...U.cuadro('4.6', 'Matriz de partes interesadas',
    ['Parte interesada', 'Interés en el proyecto', 'Influencia', 'Estrategia de involucramiento'],
    [
      ['Propietario del establecimiento', 'Mejorar el control del hato y el resultado de las ventas', 'Alta', 'Participa en la definición de criterios y valida cada incremento'],
      ['Personal de campo', 'Reducir el esfuerzo de registro sin perder información', 'Alta', 'Opera la aplicación en las sesiones de validación'],
      ['Veterinario', 'Disponer del historial sanitario en la visita', 'Media', 'Valida el calendario sanitario implementado'],
      ['Productores del grupo piloto', 'Acceder a una herramienta adecuada a su contexto', 'Media', 'Participan en las sesiones de validación de usabilidad'],
      ['Tutor académico', 'Rigor metodológico y cumplimiento del plan', 'Alta', 'Revisa los entregables al cierre de cada fase'],
      ['SENASAG', 'Trazabilidad conforme a la normativa', 'Baja', 'Se consulta su normativa; no participa del desarrollo'],
    ],
    'Elaboración propia, 2026.', [0.22, 0.28, 0.1, 0.4]));

  // --- 4.4 ---
  c.push(U.h1('4.4.', 'Requisitos funcionales'));

  c.push(U.h2('4.4.1.', 'Identificación de módulos'));
  c.push(U.p('Los requisitos funcionales se agrupan en módulos que corresponden a los dominios del negocio ganadero. Esta modularidad no es una comodidad de redacción: determina la organización del código del servicio central, donde cada módulo encapsula sus controladores, servicios y repositorios, y determina también el orden de construcción, porque las dependencias entre módulos fijan qué puede implementarse antes. El Cuadro 4.7 presenta esa agrupación con los requisitos que comprende cada módulo.'));
  c.push(...U.cuadro('4.7', 'Módulos funcionales del sistema y requisitos que comprenden',
    ['Módulo', 'Requisitos', 'Propósito'],
    [
      ['Identidad y accesos', 'RF1', 'Autenticación de usuarios y control de acceso por rol'],
      ['Inventario y trazabilidad', 'RF2, RF6, RF8', 'Alta del animal, fases de manejo y ubicación en el predio'],
      ['Operación sin conexión', 'RF3, RF10', 'Persistencia local y consolidación con el servicio central'],
      ['Pesaje', 'RF4', 'Estimación morfométrica e historial de pesos'],
      ['Sanidad', 'RF5, RF13', 'Eventos sanitarios y alertas del calendario'],
      ['Reproducción', 'RF14', 'Servicios, preñez, partos y fecha probable de parto'],
      ['Nutrición', 'RF7', 'Referencia nutricional por raza y categoría, según los requerimientos del National Research Council (2016)'],
      ['Comercialización', 'RF9, RF15', 'Registro de ventas y evaluación ponderada para la selección'],
      ['Reportes', 'RF11, RF12', 'Estado del hato y reportes exportables'],
    ],
    'Elaboración propia, 2026.', [0.24, 0.2, 0.56]));

  c.push(U.h2('4.4.2.', 'Especificación de los requisitos funcionales'));
  c.push(U.p('Cada requisito se describe mediante una ficha que indica su código, su nombre, su descripción, sus entradas, el proceso que ejecuta, sus salidas, su prioridad, el criterio con que se verificará su cumplimiento y la necesidad de usuario de la que proviene. El criterio de verificación es el elemento que convierte el requisito en comprobable: sin él, el cumplimiento quedaría sujeto a interpretación. Los Cuadros 4.8 a 4.22 contienen las quince fichas, en el orden en que se identifican los requisitos.'));

  REQUISITOS.forEach((titulo, i) => {
    const num = i + 1;
    c.push(U.h3(`4.4.2.${num}.`, titulo));
    const f = F.ficha('srs', `*${titulo}*`);
    c.push(...U.cuadro(`4.${7 + num}`, titulo,
      ['Campo', 'Contenido'], f,
      'Elaboración propia conforme al estándar IEEE 830, 2026.', [0.26, 0.74]));
  });

  c.push(U.h2('4.4.3.', 'Reglas de negocio'));
  c.push(U.p('Las reglas de negocio son condiciones del dominio ganadero que el sistema debe hacer cumplir con independencia de la pantalla desde la que se opere. Se derivan de los procesos documentados en la sección 4.2 y de las entrevistas con los especialistas del sector. El Cuadro 4.23 las enuncia con el requisito sobre el que operan.'));
  c.push(...U.cuadro('4.23', 'Reglas de negocio del sistema',
    ['Código', 'Regla', 'Origen'],
    [
      ['RN-01', 'No se admiten dos animales activos con el mismo número de caravana.', 'P1'],
      ['RN-02', 'El identificador del animal se genera en el dispositivo y no cambia a lo largo de su vida en el sistema.', 'P1, P6'],
      ['RN-03', 'Las medidas corporales fuera de rango plausible se rechazan antes de calcular el peso.', 'P2'],
      ['RN-04', 'El peso estimado se registra siempre como valor calculado, nunca como pesaje físico.', 'P2'],
      ['RN-05', 'Un evento sanitario queda asociado a un animal y a una fecha; no se admite el registro sin ambos.', 'P3'],
      ['RN-06', 'El cambio de fase de manejo registra la fecha del evento y conserva la fase anterior en el historial.', 'P4'],
      ['RN-07', 'Un animal con período de carencia sanitaria vigente se advierte al ser seleccionado para venta.', 'P5, P9'],
      ['RN-08', 'La eliminación de un registro es lógica; el dato se conserva para propagar la baja a los dispositivos.', 'P6'],
      ['RN-09', 'El reenvío de un registro con el mismo identificador actualiza y nunca duplica.', 'P6'],
      ['RN-10', 'Los conflictos sobre pesos y eventos sanitarios no se resuelven de forma automática.', 'P6'],
      ['RN-11', 'La fecha probable de parto se calcula a partir de la fecha de servicio y el período de gestación de la especie.', 'P8'],
      ['RN-12', 'Los criterios de la evaluación ponderada y sus pesos relativos son configurables por el propietario.', 'P9'],
    ],
    'Elaboración propia a partir de los procesos de negocio y de las entrevistas con especialistas del sector, 2026.',
    [0.1, 0.76, 0.14]));

  c.push(U.h2('4.4.4.', 'Priorización de requisitos'));
  c.push(U.p('La prioridad de cada requisito, consignada en su ficha, determina el incremento en que se construye. Los requisitos de prioridad alta corresponden a las funcionalidades sin las cuales el sistema no resuelve el problema diagnosticado: la operación sin conexión, el registro del animal, la estimación de peso y la consolidación de datos. Los de prioridad media aportan valor pero admiten postergación sin comprometer la utilidad del producto en sus primeras versiones.'));

  // --- 4.5 ---
  c.push(U.h1('4.5.', 'Requisitos no funcionales'));
  c.push(U.p('Los requisitos no funcionales se organizan según las características del modelo de calidad de producto de la norma ISO/IEC 25010. Su formulación incluye una métrica de verificación, de modo que el cumplimiento pueda evaluarse con una medición y no con una apreciación. El Cuadro 4.24 los especifica con la métrica que permite verificar cada uno.'));
  {
    const t = F.tabla('srs', 'Cuadro 5. Requisitos no funcionales');
    c.push(...U.cuadro('4.24', 'Requisitos no funcionales según el modelo de calidad ISO/IEC 25010',
      t.encabezados, t.filas,
      'Características de calidad según ISO/IEC 25010 y criterio de usabilidad de Bangor et al. (2009).',
      [0.08, 0.17, 0.47, 0.28]));
  }
  c.push(U.p('De las ocho características, tres condicionan el diseño de forma determinante. La fiabilidad, porque la pérdida de un registro sanitario tiene consecuencias económicas que el usuario no puede revertir. La usabilidad, porque el usuario principal carece de formación técnica y abandona la herramienta si no la comprende. Y la seguridad, porque el dispositivo viaja al campo y puede perderse con los datos del establecimiento dentro, de donde se sigue la exigencia de cifrar la base local.'));

  // --- 4.6 ---
  c.push(U.h1('4.6.', 'Modelado de requisitos'));

  c.push(U.h2('4.6.1.', 'Actores del sistema'));
  c.push(U.p('Los actores del modelo de casos de uso se derivan de los usuarios identificados en la sección 4.3, distinguiendo su tipo de participación. El Cuadro 4.25 los presenta con esa distinción.'));
  {
    const t = F.tabla('casosUso', 'Cuadro 1. Actores del sistema');
    c.push(...U.cuadro('4.25', 'Actores del sistema y su tipo de participación',
      t.encabezados, t.filas, 'Elaboración propia, 2026.', [0.22, 0.14, 0.64]));
  }

  c.push(U.h2('4.6.2.', 'Diagrama de casos de uso'));
  c.push(U.p('El diagrama general presenta los quince casos de uso del sistema y su relación con cada actor. Su lectura permite verificar que la cobertura funcional corresponde a los actores identificados y que ningún actor queda sin casos asociados. La Figura 4.10 presenta ese diagrama.'));
  c.push(...U.figura('ace0bf388601354f0157ccddca4e5946a3ff771a.png', '4.10',
    'Diagrama de casos de uso del sistema',
    'Elaboración propia, 2026. Notación UML según Booch, Rumbaugh y Jacobson (2005).'));

  c.push(U.h2('4.6.3.', 'Resumen de los casos de uso'));
  c.push(U.p('El Cuadro 4.26 resume los quince casos de uso con el actor que los inicia y el requisito funcional que realizan, de modo que la correspondencia entre ambos modelos quede a la vista.'));
  {
    const t = F.tabla('casosUso', 'Cuadro 2. Resumen de los casos de uso del sistema');
    c.push(...U.cuadro('4.26', 'Resumen de los casos de uso y su trazabilidad',
      t.encabezados, t.filas,
      'Elaboración propia, 2026.', [0.1, 0.4, 0.22, 0.16, 0.12]));
  }

  c.push(U.h2('4.6.4.', 'Especificación de los casos de uso críticos'));
  c.push(U.p('Se detallan a continuación los tres casos de uso de mayor riesgo técnico o de mayor impacto sobre el negocio. El resto de las fichas, con idéntica estructura, se incorpora como apéndice del documento. Los Cuadros 4.27 a 4.29 recogen sus fichas.'));
  CASOS_DETALLADOS.forEach(([marcador, codigo], i) => {
    const f = F.ficha('casosUso', `***${marcador}***`);
    const nombre = f.find(([k]) => /nombre/i.test(k))?.[1] ?? codigo;
    c.push(U.h3(`4.6.4.${i + 1}.`, `${codigo}. ${nombre}`));
    c.push(...U.cuadro(`4.${27 + i}`, `Especificación del caso de uso ${codigo}`,
      ['Campo', 'Contenido'], f,
      'Elaboración propia, 2026.', [0.24, 0.76]));
  });

  c.push(U.h2('4.6.5.', 'Diagramas de actividades'));
  c.push(U.p('Los diagramas de actividades representan el flujo de decisión de las dos operaciones de mayor complejidad lógica del sistema: el cálculo del peso a partir de las medidas y la consolidación con resolución de conflictos. A diferencia del diagrama de secuencia, que muestra qué componente llama a cuál, el de actividades muestra qué decide el sistema en cada punto. Las Figuras 4.11 y 4.12 representan respectivamente una y otra.'));
  c.push(...U.figura('80b4baf6233fc247fcff54d8ae2c7915fed97a32.png', '4.11',
    'Actividades de la estimación del peso',
    'Elaboración propia, 2026. Notación UML de diagrama de actividades.'));
  c.push(...U.figura('9095b750c8263e2daaded1b311b53712aacab602.png', '4.12',
    'Actividades de la sincronización y la resolución de conflictos',
    'Elaboración propia, 2026. Notación UML de diagrama de actividades.'));

  c.push(U.h2('4.6.6.', 'Modelo conceptual de datos'));
  c.push(U.p('El modelo conceptual identifica las entidades del dominio con independencia de su implementación. Su desarrollo como modelo entidad-relación, con atributos, cardinalidades y normalización, se presenta en la sección 5.3 del capítulo siguiente. El Cuadro 4.30 enumera las entidades identificadas con el papel que cumple cada una.'));
  {
    const t = F.tabla('entidadRelacion', 'Cuadro 1. Entidades del modelo conceptual');
    c.push(...U.cuadro('4.30', 'Entidades del modelo conceptual',
      t.encabezados, t.filas,
      'Elaboración propia, 2026. Notación de modelo entidad-relación según Elmasri y Navathe (2016).',
      [0.2, 0.14, 0.46, 0.2]));
  }

  c.push(U.h2('4.6.7.', 'Matriz de trazabilidad de requisitos'));
  c.push(U.p('La matriz vincula cada necesidad del usuario con el requisito de software que la satisface y con el caso de uso que la realiza. Su función es doble: garantiza que ninguna necesidad relevada quede sin atender, y garantiza que ninguna funcionalidad construida carezca de origen en una necesidad real. Toda funcionalidad del sistema es, por tanto, trazable hasta el diagnóstico de campo. El Cuadro 4.31 presenta la matriz completa.'));
  {
    const t = F.tabla('srs', 'Cuadro 6. Matriz de trazabilidad de requisitos');
    c.push(...U.cuadro('4.31', 'Matriz de trazabilidad entre necesidades, requisitos y casos de uso',
      t.encabezados, t.filas, 'Elaboración propia, 2026.'));
  }

  // --- 4.7 ---
  c.push(U.h1('4.7.', 'Factibilidad del proyecto'));

  c.push(U.h2('4.7.1.', 'Factibilidad técnica'));
  c.push(U.p('El proyecto es ejecutable con las herramientas y los conocimientos disponibles. El stack completo es de código abierto y está documentado, el problema de la operación sin conexión tiene soluciones conocidas en la literatura, y la estimación morfométrica se apoya en fórmulas validadas. El riesgo técnico de mayor entidad es la consolidación de datos divergentes, que se atiende mediante la estrategia diferenciada por riesgo de entidad descrita en la sección 5.1.'));

  c.push(U.h2('4.7.2.', 'Factibilidad operativa'));
  c.push(U.p('Los usuarios disponen del equipamiento necesario: el ochenta y siete por ciento posee un teléfono inteligente con capacidad suficiente. El sistema no exige infraestructura adicional en el predio ni conectividad permanente, que son precisamente las condiciones que impiden adoptar las soluciones existentes. La disposición a usarlo está relevada: el ochenta y siete por ciento declaró que usaría la aplicación si funcionara sin conexión.'));

  c.push(U.h2('4.7.3.', 'Factibilidad económica'));
  c.push(U.p('El componente predominante del costo es el tiempo de desarrollo. Las herramientas de construcción, despliegue y notificación se obtienen bajo licencias libres o planes educativos, de modo que el costo de licenciamiento es nulo. El detalle del presupuesto se presenta en la sección 6.1.3.'));

  c.push(U.h2('4.7.4.', 'Factibilidad legal'));
  c.push(U.p('No existen impedimentos legales. El stack es íntegramente de código abierto con licencias que permiten su uso, modificación y distribución. El tratamiento de la información se ajusta a las prácticas descritas en la sección 3.9, y el uso de los datos del establecimiento cuenta con autorización escrita de su propietario.'));

  c.push(U.h2('4.7.5.', 'Factibilidad temporal'));
  c.push(U.p('El cronograma previsto es compatible con los plazos académicos establecidos por la universidad. La organización por incrementos reduce el riesgo de incumplimiento: aun si el alcance total no se completara, cada incremento cerrado constituye una versión funcional y entregable del sistema, y no un avance parcial inutilizable.'));

  return c;
};
