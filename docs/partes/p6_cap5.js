/** CAPÍTULO V — DISEÑO DE LA SOLUCIÓN. */
const U = require('../univalle');
const F = require('../fuentes');

/** Tablas del diccionario de datos que se incorporan al documento. */
const TABLAS_BD = [
  ['usuario', 'Personas que acceden al sistema'],
  ['potrero', 'Ubicaciones físicas del establecimiento'],
  ['animal', 'Animales del hato'],
  ['pesaje', 'Mediciones morfométricas y peso estimado'],
  ['evento_sanitario', 'Eventos sanitarios del animal'],
  ['movimiento', 'Traslados de animales entre potreros'],
  ['registro_sync', 'Control del estado de sincronización'],
];

module.exports = function capitulo5() {
  const c = [];
  c.push(...U.portadaCapitulo('CAPÍTULO V', 'DISEÑO DE LA SOLUCIÓN'));

  c.push(U.p('Este capítulo traduce los requisitos del capítulo anterior en decisiones técnicas concretas. Define la arquitectura de la solución y la justifica frente a las restricciones del entorno, descompone el sistema en módulos, desarrolla el modelo de datos desde el plano conceptual hasta el físico, establece los lineamientos de interfaz, los controles de seguridad, la infraestructura de despliegue y la estrategia de pruebas.'));
  c.push(U.p('Las decisiones que aquí se documentan no son preferencias del desarrollador: cada una responde a una restricción del contexto de uso o a un requisito no funcional establecido en la sección 4.5, y se enuncia junto con la razón que la sostiene.'));

  // --- 5.1 ---
  c.push(U.h1('5.1.', 'Arquitectura de la solución'));

  c.push(U.h2('5.1.1.', 'Principios arquitectónicos'));
  c.push(U.p('Tres principios gobiernan la arquitectura. El primero es que la base de datos del dispositivo es la fuente primaria de lectura y escritura: ninguna pantalla espera a la red, y el servicio central actúa como punto de consolidación y no como requisito de operación. El segundo es la separación de la lógica de negocio respecto de los marcos y de los mecanismos de persistencia, de modo que las reglas del dominio ganadero —el cálculo del peso, la lógica de selección, la resolución de conflictos— puedan probarse de forma aislada. El tercero es que toda decisión que afecte a la integridad de los datos se resuelve de forma explícita y no por omisión.'));

  c.push(U.h2('5.1.2.', 'Arquitectura general del sistema'));
  c.push(U.p('La solución se organiza en una aplicación móvil de captura en el campo, un servicio central que expone una interfaz de programación y persiste la información, y un panel administrativo de consulta. La comunicación entre los clientes y el servicio se realiza sobre HTTPS con intercambio de mensajes en formato JSON.'));
  {
    const t = F.tabla('decisiones', 'Cuadro 1. Capas de la solución y su justificación');
    c.push(...U.cuadro('5.1', 'Capas de la solución y justificación de cada elección',
      t.encabezados, t.filas,
      'Elaboración propia, 2026.', [0.2, 0.26, 0.54]));
  }

  c.push(U.h2('5.1.3.', 'Arquitectura lógica'));
  c.push(U.p('El código se organiza según los principios de arquitectura limpia, con las dependencias dirigidas hacia el núcleo del negocio. En la capa de dominio residen las entidades y los contratos de repositorio; en la de aplicación, los casos de uso; y en la de infraestructura, las implementaciones concretas de los repositorios, los controladores y la configuración de los marcos.'));
  c.push(U.p('Esta disposición tiene una consecuencia verificable: los casos de uso que contienen la lógica crítica del sistema pueden probarse sin levantar una base de datos ni un servidor, lo que hace alcanzable la cobertura de pruebas exigida por el requisito de mantenibilidad.'));

  c.push(U.h2('5.1.4.', 'Arquitectura física'));
  c.push(U.p('El dispositivo móvil ejecuta la aplicación sobre una base SQLite cifrada que contiene el subconjunto operativo de la información. El servidor aloja el servicio central, la base PostgreSQL con el estado consolidado de todo el establecimiento, y el almacén en memoria que atiende las tareas de soporte. El panel administrativo se sirve como aplicación web y consume la misma interfaz de programación que la aplicación móvil.'));

  c.push(U.h2('5.1.5.', 'Estrategia de operación sin conexión'));
  c.push(U.p('La operación sin conexión es el modo primario del sistema, dado que la conectividad en el campo es intermitente o inexistente. Esta condición gobierna cuatro decisiones de diseño que se enuncian a continuación.'));

  c.push(U.h3('5.1.5.1.', 'Identificadores generados en el dispositivo'));
  F.parrafos(F.seccion('decisiones', '3.1. Identificadores ULID', '3.2. Sincronización incremental'), { max: 2 })
    .forEach((t) => c.push(U.p(t)));

  c.push(U.h3('5.1.5.2.', 'Sincronización incremental'));
  F.parrafos(F.seccion('decisiones', '3.2. Sincronización incremental', '3.3. Resolución de conflictos'), { max: 2 })
    .forEach((t) => c.push(U.p(t)));

  c.push(U.h3('5.1.5.3.', 'Resolución de conflictos'));
  F.parrafos(F.seccion('decisiones', '3.3. Resolución de conflictos', '3.4. Borrado lógico'), { max: 3 })
    .forEach((t) => c.push(U.p(t)));

  c.push(U.h3('5.1.5.4.', 'Borrado lógico, marcas de baja e idempotencia'));
  F.parrafos(F.seccion('decisiones', '3.4. Borrado lógico y marcas de baja', '4. ESTIMACIÓN DEL PESO'), { max: 3 })
    .forEach((t) => c.push(U.p(t)));

  c.push(U.h2('5.1.6.', 'Diseño del cálculo del peso'));
  F.parrafos(F.seccion('decisiones', '4.1. Método', '4.2. Calibración'), { max: 2 })
    .forEach((t) => c.push(U.p(t)));
  F.parrafos(F.seccion('decisiones', '4.2. Calibración para ganado cebú', '4.3. Margen de error'), { max: 2 })
    .forEach((t) => c.push(U.p(t)));
  F.parrafos(F.seccion('decisiones', '4.3. Margen de error y validación', '5. SEGURIDAD'), { max: 2 })
    .forEach((t) => c.push(U.p(t)));
  c.push(...U.figura('74976b77a6946fb41bd3a31b89ef184bdfe3e43c.png', '5.1',
    'Secuencia de la estimación del peso por método morfométrico',
    'Elaboración propia, 2026. Notación UML de diagrama de secuencia.'));

  c.push(U.h2('5.1.7.', 'Justificación de la arquitectura seleccionada'));
  c.push(U.p('La arquitectura adoptada responde a la restricción que define el problema: si la aplicación exigiera conexión, no sería utilizable en el entorno para el que se construye, y el proyecto perdería su razón de ser. Las alternativas descartadas lo fueron por esa misma razón. Una aplicación web que consulte siempre al servidor resulta más simple de construir, pero inoperante sin señal. Una aplicación que guarde localmente y sincronice con una política única de última escritura resulta más simple de sincronizar, pero admite que un registro de peso o un evento sanitario se pierda en silencio, lo que es inaceptable en este dominio.'));
  c.push(U.p('El costo de la arquitectura elegida es la complejidad de la consolidación, y se asume de forma deliberada porque es el único camino que satisface simultáneamente la autonomía en campo y la integridad de la información.'));
  c.push(...U.figura('a4eec3283b6fded066327be99261acf655cf9c22.png', '5.2',
    'Secuencia de la sincronización y la resolución de conflictos',
    'Elaboración propia, 2026. Notación UML de diagrama de secuencia.'));

  // --- 5.2 ---
  c.push(U.h1('5.2.', 'Diseño de módulos y componentes'));

  c.push(U.h2('5.2.1.', 'Modelo de clases del dominio'));
  c.push(U.p('El modelo de clases representa las entidades del dominio ganadero con sus atributos y sus relaciones, con independencia de la tecnología de persistencia. Constituye la capa más interna de la arquitectura y es la que menos cambia a lo largo de la vida del sistema.'));
  c.push(...U.figura('c5175288991200b94ea245a4950ac69e1c4d4076.png', '5.3',
    'Diagrama de clases del sistema',
    'Elaboración propia, 2026. Notación UML según Booch, Rumbaugh y Jacobson (2005).'));
  {
    const t = F.tabla('uml', 'Cuadro 2. Clases del modelo y su responsabilidad');
    c.push(...U.cuadro('5.2', 'Clases del modelo y su responsabilidad',
      t.encabezados, t.filas, 'Elaboración propia, 2026.', [0.24, 0.76]));
  }

  c.push(U.h2('5.2.2.', 'Asociaciones y multiplicidad'));
  {
    const t = F.tabla('uml', 'Cuadro 3. Asociaciones del modelo de clases');
    c.push(...U.cuadro('5.3', 'Asociaciones del modelo de clases y su multiplicidad',
      t.encabezados, t.filas, 'Elaboración propia, 2026.'));
  }

  c.push(U.h2('5.2.3.', 'Módulo de identidad y control de acceso'));
  c.push(U.p('Concentra la autenticación y la autorización. Verifica las credenciales contra el resumen almacenado, emite el token de acceso de vigencia corta y el token de actualización de vigencia larga, y resuelve en cada petición si el rol del usuario autoriza la operación solicitada. La vigencia larga del token de actualización responde a una necesidad del dominio: el productor puede pasar semanas sin conectividad y no debe quedar fuera del sistema al volver a tener señal.'));

  c.push(U.h2('5.2.4.', 'Módulo de inventario y trazabilidad'));
  c.push(U.p('Gestiona el alta del animal, su identificación individual, su ubicación en el predio, sus fases de manejo y su baja. Es el módulo del que dependen todos los demás, porque ninguna otra entidad del sistema existe sin un animal al que referirse.'));

  c.push(U.h2('5.2.5.', 'Módulo de sincronización'));
  c.push(U.p('Implementa la consolidación bidireccional: el envío de los registros pendientes del dispositivo y la recepción de los cambios producidos en el servidor desde la última pasada. Mantiene el cursor de sincronización por entidad, marca los conflictos que requieren resolución del usuario y deja constancia de cada operación en la bitácora de sincronización.'));

  c.push(U.h2('5.2.6.', 'Módulos de negocio ganadero'));
  c.push(U.p('Los módulos de pesaje, sanidad, reproducción, nutrición y comercialización implementan cada uno su dominio funcional, con sus reglas propias y su acceso a datos encapsulado. La modularidad permite que un dominio evolucione sin afectar a los demás, y que la construcción se organice por incrementos sin que las dependencias se entrecrucen.'));

  c.push(U.h2('5.2.7.', 'Módulo de reportes'));
  c.push(U.p('Consolida la información de los demás módulos en indicadores del estado del hato. En la aplicación móvil los reportes se generan a partir de los datos locales, de modo que estén disponibles sin conexión; en el panel web se generan a partir del estado consolidado del servidor.'));

  // --- 5.3 ---
  c.push(U.h1('5.3.', 'Diseño de la base de datos'));

  c.push(U.h2('5.3.1.', 'Modelo entidad-relación'));
  c.push(U.p('El modelo entidad-relación representa las entidades del dominio, sus atributos y las relaciones entre ellas en el plano conceptual, antes de cualquier decisión sobre el gestor de base de datos.'));
  c.push(...U.figura('770ab90fe4d78f5e24e1fb9c2a14d4f7fdcba9ce.png', '5.4',
    'Diagrama entidad-relación del sistema',
    'Elaboración propia, 2026. Notación según Elmasri y Navathe (2016).'));
  {
    const t = F.tabla('entidadRelacion', 'Cuadro 3. Relaciones del modelo conceptual');
    c.push(...U.cuadro('5.4', 'Relaciones del modelo conceptual y su cardinalidad',
      t.encabezados, t.filas, 'Elaboración propia, 2026.'));
  }

  c.push(U.h2('5.3.2.', 'Normalización'));
  F.parrafos(F.seccion('entidadRelacion', '7. NORMALIZACIÓN', '8. TRANSFORMACIÓN'), { max: 3 })
    .forEach((t) => c.push(U.p(t)));

  c.push(U.h2('5.3.3.', 'Modelo lógico: esquema relacional'));
  c.push(U.p('La transformación del modelo conceptual produce el esquema relacional, en el que cada entidad se convierte en una tabla y cada relación en una clave foránea. El esquema comprende quince tablas. En el diagrama, la flecha se dirige desde la tabla referenciada hacia la que contiene la clave foránea, de modo que su sentido indica la dependencia de existencia entre ambas.'));
  c.push(...U.figura('1d8c4372cde51599f02616de4347045c68f92324.png', '5.5',
    'Esquema relacional de la base de datos',
    'Elaboración propia, 2026. Notación de esquema relacional según Elmasri y Navathe (2016).'));

  c.push(U.h2('5.3.4.', 'Modelo físico y diccionario de datos'));
  c.push(U.p('El gestor previsto en el servidor es PostgreSQL en su versión 16. El dispositivo replica el subconjunto operativo del esquema en SQLite, gestionado mediante Drift. El diccionario describe cada tabla con sus columnas, su tipo de dato, sus restricciones, su condición de nulidad y su significado; se indica con PK la clave primaria y con FK la clave foránea.'));
  c.push(U.p('Se presentan a continuación las tablas del núcleo operativo del sistema. El diccionario completo de las quince tablas se incorpora como apéndice.'));

  TABLAS_BD.forEach(([nombre, descripcion], i) => {
    c.push(U.h3(`5.3.4.${i + 1}.`, `Tabla ${nombre}`));
    c.push(U.p(`${descripcion}.`));
    const filas = F.tablaDespuesDe('baseDatos', `Tabla ${nombre}`)
      .filter((f) => f.length >= 4 && !/^columna$/i.test(f[0]));
    c.push(...U.cuadro(`5.${5 + i}`, `Diccionario de datos: tabla ${nombre}`,
      ['Columna', 'Tipo', 'Restricción', 'Nulo', 'Descripción'],
      filas.map((f) => [f[0], f[1], f[2] ?? '', f[3] ?? '', f[4] ?? '']),
      'Elaboración propia, 2026.', [0.19, 0.14, 0.13, 0.07, 0.47]));
  });

  c.push(U.h2('5.3.5.', 'Políticas de integridad y consistencia'));
  c.push(U.p('Cada tabla tiene una clave primaria de tipo ULID, no nula y única. La tabla de usuarios impone unicidad sobre el correo electrónico y la de animales sobre el número de caravana. La referencia nutricional impone unicidad sobre la combinación de raza y categoría, y el detalle de venta emplea una clave compuesta que impide duplicar un animal dentro de una misma venta.'));
  c.push(U.p('En las tablas operativas las bajas se realizan de forma lógica mediante la marca de eliminación, de modo que el registro pueda propagarse a los dispositivos en lugar de desaparecer sin rastro. Esta decisión condiciona las reglas de borrado en cascada: la integridad referencial protege el historial en lugar de permitir su pérdida.'));
  {
    const t = F.tabla('baseDatos', 'Cuadro 11. Restricciones referenciales');
    c.push(...U.cuadro('5.12', 'Restricciones referenciales del esquema',
      t.encabezados, t.filas,
      'Reglas de integridad referencial según Elmasri y Navathe (2016).', [0.25, 0.17, 0.14, 0.44]));
  }

  c.push(U.h2('5.3.6.', 'Gestión del esquema y migraciones'));
  F.parrafos(F.seccion('decisiones', '6. GESTIÓN DEL ESQUEMA Y MIGRACIONES', '7. RESPALDO'), { max: 3 })
    .forEach((t) => c.push(U.p(t)));

  c.push(U.h2('5.3.7.', 'Estrategia de respaldo y recuperación'));
  F.parrafos(F.seccion('decisiones', '7. RESPALDO Y RECUPERACIÓN', '8. DESPLIEGUE'), { max: 3 })
    .forEach((t) => c.push(U.p(t)));

  // --- 5.4 ---
  c.push(U.h1('5.4.', 'Diseño de interfaces'));

  c.push(U.h2('5.4.1.', 'Principios de usabilidad aplicados'));
  c.push(U.p('El diseño de la interfaz móvil parte de las condiciones de uso relevadas en la observación de campo, y no de convenciones generales de diseño. El productor opera el dispositivo con una sola mano, a la intemperie, bajo sol directo y con frecuencia con las manos sucias o mojadas. De esas condiciones se derivan cuatro decisiones.'));
  c.push(U.vinheta('**Objetivos táctiles amplios.** Los controles se dimensionan por encima del mínimo que recomienda el sistema de diseño adoptado, porque el uso con una sola mano y sin precisión fina hace frecuente el toque accidental.'));
  c.push(U.vinheta('**Color acompañado siempre de texto.** Ningún estado se distingue únicamente por color: bajo sol directo la pantalla se lava y la distinción cromática deja de ser confiable.'));
  c.push(U.vinheta('**Campos obligatorios mínimos.** El alta de un animal exige solo caravana, categoría, sexo y fase. En campo el productor rara vez dispone de todos los datos, y exigirlos empujaría a inventar información o a no registrar el animal.'));
  c.push(U.vinheta('**Terminología del negocio.** La interfaz emplea las palabras del dominio ganadero —caravana, potrero, destete— y no el vocabulario técnico del sistema. Los mensajes de error indican la causa y la acción que corresponde, sin códigos ni términos informáticos.'));

  c.push(U.h2('5.4.2.', 'Inventario de pantallas'));
  c.push(U.p('El sistema comprende las siguientes interfaces de usuario:'));
  F.items(F.seccion('srs', '3.4.1. Interfaces de usuario', '3.4.2. Interfaces de software'))
    .forEach((t) => c.push(U.vinheta(t)));

  c.push(U.h2('5.4.3.', 'Navegación e indicadores de estado'));
  c.push(U.p('La navegación es plana: las tres operaciones más frecuentes —registrar un animal, registrar un evento y consultar la ficha— se alcanzan desde la pantalla principal sin recorrer menús intermedios. El estado de sincronización se expresa mediante un indicador permanente en la barra superior, que muestra cuántos registros están pendientes de consolidar. El productor debe saber en todo momento si su información está solo en el dispositivo o ya confirmada en el servidor; sin ese indicador, la incertidumbre lo llevaría a registrar el mismo dato dos veces.'));

  c.push(U.h2('5.4.4.', 'Accesibilidad e interacción'));
  c.push(U.p('La interfaz sigue las pautas de accesibilidad para el contenido web en nivel AA en cuanto a contraste, tamaño del texto y dimensión de las áreas de interacción. En este sistema el criterio de contraste no responde a una consideración de inclusión sino a un requisito de funcionamiento: sin la relación mínima exigida, la pantalla resulta ilegible bajo sol directo aunque el usuario tenga visión perfecta.'));

  // --- 5.5 ---
  c.push(U.h1('5.5.', 'Diseño de seguridad'));

  c.push(U.h2('5.5.1.', 'Identificación de activos'));
  c.push(U.p('Los activos que el sistema debe proteger son tres: las credenciales de acceso de los usuarios, la información productiva y sanitaria del establecimiento —que es información comercial sensible—, y la integridad del historial de cada animal, cuya alteración o pérdida tiene consecuencias económicas y sanitarias no reversibles.'));

  c.push(U.h2('5.5.2.', 'Análisis de amenazas'));
  c.push(...U.cuadro('5.13', 'Amenazas identificadas y controles previstos',
    ['Amenaza', 'Activo afectado', 'Control previsto'],
    [
      ['Pérdida o sustracción del dispositivo en el campo', 'Información del establecimiento', 'Cifrado de la base de datos local en reposo'],
      ['Interceptación del tráfico en redes no confiables', 'Credenciales e información transmitida', 'Cifrado del transporte mediante HTTPS'],
      ['Acceso de un usuario a operaciones ajenas a su rol', 'Integridad del historial', 'Control de acceso por rol verificado en cada operación'],
      ['Obtención de contraseñas desde la base de datos', 'Credenciales de acceso', 'Resumen con función de derivación de clave y sal'],
      ['Inyección de instrucciones en las consultas', 'Integridad de los datos', 'Parametrización automática en la capa de acceso a datos'],
      ['Uso de un token tras la baja de la cuenta', 'Integridad del historial', 'Revalidación del usuario en cada petición autenticada'],
    ],
    'Elaboración propia sobre los riesgos del OWASP Top 10 aplicables al sistema, 2026.',
    [0.32, 0.24, 0.44]));

  c.push(U.h2('5.5.3.', 'Controles de acceso y protección de datos'));
  F.parrafos(F.seccion('decisiones', '5. SEGURIDAD', '6. GESTIÓN DEL ESQUEMA'), { max: 4 })
    .forEach((t) => c.push(U.p(t)));

  c.push(U.h2('5.5.4.', 'Registro y trazabilidad de la actividad'));
  c.push(U.p('El sistema deja constancia de cada operación que altera el estado de una entidad operativa en la bitácora de sincronización, con su tipo de operación, su marca temporal y el identificador del registro afectado. Esta bitácora cumple dos funciones: alimenta la consolidación entre dispositivos y provee la trazabilidad necesaria para reconstruir qué ocurrió ante una discrepancia.'));

  c.push(U.h2('5.5.5.', 'Gestión de sesiones'));
  c.push(U.p('La autenticación emplea tokens firmados, de modo que el servicio pueda verificarlos sin consultar la base de datos en cada petición y opere sin mantener estado de sesión en memoria. El token de acceso tiene vigencia corta para limitar la ventana de uso en caso de verse comprometido; el de actualización tiene vigencia larga para sostener el uso sin conexión. El usuario se revalida contra la base en cada petición autenticada, de modo que una cuenta dada de baja deje de operar aunque conserve un token vigente.'));

  // --- 5.6 ---
  c.push(U.h1('5.6.', 'Diseño de infraestructura'));

  c.push(U.h2('5.6.1.', 'Entornos y despliegue'));
  F.parrafos(F.seccion('decisiones', '8. DESPLIEGUE E INFRAESTRUCTURA', '9. RIESGOS'), { max: 4 })
    .forEach((t) => c.push(U.p(t)));

  c.push(U.h2('5.6.2.', 'Requerimientos de hardware'));
  c.push(...U.cuadro('5.14', 'Requerimientos de hardware por componente',
    ['Componente', 'Requerimiento mínimo', 'Justificación'],
    [
      ['Dispositivo móvil', 'Teléfono de gama media con almacenamiento disponible para la base local', 'Es el equipamiento que el productor ya posee; el sistema no exige inversión adicional'],
      ['Servidor', 'Instancia virtual con dos núcleos, memoria suficiente para el gestor de base de datos y almacenamiento persistente', 'Volumen de usuarios previsto para el alcance del proyecto'],
      ['Estación de desarrollo', 'Equipo con capacidad para ejecutar los contenedores del entorno y el emulador', 'Entorno completo reproducible en una sola máquina'],
    ],
    'Elaboración propia, 2026.', [0.2, 0.38, 0.42]));

  c.push(U.h2('5.6.3.', 'Requerimientos de software'));
  c.push(U.p('El entorno de ejecución se define mediante contenedores, lo que elimina la necesidad de instalar y configurar manualmente el gestor de base de datos, el almacén en memoria y el entorno de ejecución del servicio. El despliegue completo se levanta con un único comando, condición que hace reproducible la instalación en cualquier máquina y que sostiene el criterio de reproducibilidad establecido en la sección 3.7.6.'));

  c.push(U.h2('5.6.4.', 'Riesgos técnicos y mitigaciones'));
  {
    const t = F.tabla('decisiones', 'Cuadro 2. Principales riesgos y sus mitigaciones');
    c.push(...U.cuadro('5.15', 'Riesgos técnicos identificados y sus mitigaciones',
      t.encabezados, t.filas, 'Elaboración propia, 2026.'));
  }

  // --- 5.7 ---
  c.push(U.h1('5.7.', 'Diseño de pruebas'));

  c.push(U.h2('5.7.1.', 'Estrategia general'));
  c.push(U.p('La estrategia sigue el modelo de pirámide de pruebas: la mayor cantidad se sitúa en el nivel unitario, más rápido y barato de mantener; sobre él se construyen las pruebas de integración, que verifican la comunicación entre componentes; y en la cúspide se sitúan las pruebas con usuarios reales, que son las más costosas y se reservan para los escenarios críticos del negocio.'));

  c.push(U.h2('5.7.2.', 'Pruebas funcionales'));
  c.push(U.p('Cada requisito funcional tiene asociado al menos un caso de prueba derivado de su criterio de verificación. La correspondencia se controla mediante la matriz de trazabilidad: un requisito sin prueba asociada se considera no verificado, con independencia de que su código esté escrito.'));

  c.push(U.h2('5.7.3.', 'Pruebas de integración'));
  c.push(U.p('Verifican los flujos completos de cada módulo contra una base de datos de prueba que se inicializa antes de cada conjunto y se limpia al finalizar, de modo que ninguna prueba dependa de los datos que dejó la anterior. El escenario de consolidación con red interrumpida recibe tratamiento específico por ser el de mayor riesgo técnico del sistema.'));

  c.push(U.h2('5.7.4.', 'Pruebas de rendimiento'));
  c.push(U.p('Miden los tiempos de las operaciones más frecuentes sobre el dispositivo de referencia y el comportamiento del servicio bajo carga concurrente. Los umbrales provienen de los requisitos no funcionales y no de expectativas generales de desempeño.'));

  c.push(U.h2('5.7.5.', 'Pruebas de seguridad'));
  c.push(U.p('Verifican que los controles diseñados operan efectivamente: que un rol no autorizado recibe el rechazo correspondiente, que una petición sin credencial no accede a información, que la contraseña no se almacena en claro y que el transporte viaja cifrado.'));

  c.push(U.h2('5.7.6.', 'Criterios de aceptación'));
  c.push(U.p('Un incremento se considera terminado cuando todos sus requisitos superan sus criterios de verificación, cuando las pruebas automatizadas se ejecutan sin fallos, y cuando la sesión de validación con productores no revela defectos que impidan completar las tareas previstas. Los criterios cuantitativos globales del sistema son los establecidos en el Cuadro 3.2.'));

  return c;
};
