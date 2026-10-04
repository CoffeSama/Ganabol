/** Cierre del documento: conclusiones, recomendaciones, referencias,
 *  glosario, apéndices y anexos. */
const U = require('../univalle');

module.exports = function cierre() {
  const c = [];

  // ===================== CONCLUSIONES =====================
  c.push(...U.portadaCapitulo('CONCLUSIONES Y RECOMENDACIONES', ''));

  c.push(U.tituloSimple('CONCLUSIONES', { enIndice: true, before: 200, after: 300 }));
  c.push(U.p('Las conclusiones se formulan en correspondencia con los objetivos específicos planteados y con los resultados efectivamente obtenidos, distinguiendo lo verificado de lo proyectado.'));

  c.push(U.h2('1.', 'Respecto al diagnóstico y al análisis de requisitos'));
  c.push(U.p('El diagnóstico aplicado a veintitrés productores permitió caracterizar con evidencia empírica las condiciones bajo las cuales opera la explotación ganadera tradicional del departamento, y reveló una paradoja que define el problema: el ochenta y siete por ciento de los consultados dispone de un teléfono inteligente con capacidad técnica suficiente, y ninguno utiliza una herramienta digital especializada. La barrera no es el equipamiento ni el desinterés del productor, sino la inadecuación de la oferta existente a un entorno donde la conectividad es intermitente.'));
  c.push(U.p('Los impactos económicos cuantificados —el cincuenta y cinco por ciento que vendió por debajo del valor real por desconocer el peso, el sesenta por ciento que perdió información de algún animal— confirman que el problema no es de modernización por conveniencia sino de pérdida económica concreta. Cada funcionalidad del sistema quedó trazada hasta una de esas necesidades mediante la matriz de trazabilidad, de modo que ninguna responde a un supuesto del desarrollador.'));

  c.push(U.h2('2.', 'Respecto al diseño de la arquitectura y del modelo de datos'));
  c.push(U.p('La restricción de conectividad no admitía tratarse como un caso de excepción a resolver con un mensaje de error: obligaba a invertir la relación habitual entre cliente y servidor y a situar la base de datos del dispositivo como fuente primaria de lectura y escritura. Esa decisión arrastró tres consecuencias que constituyen el núcleo técnico del trabajo: la generación del identificador en el dispositivo, que vuelve idempotente el reenvío de un registro; la baja lógica, que permite propagar una eliminación en lugar de perderla; y la resolución de conflictos diferenciada según el riesgo de cada entidad.'));
  c.push(U.p('Esta última merece destacarse porque se aparta de la práctica habitual. Resolver todos los conflictos con una política única de última escritura es más simple de implementar, pero admite que un registro de peso o un evento sanitario se sobrescriba en silencio. En un dominio donde esa pérdida tiene consecuencias económicas y sanitarias no reversibles, la simplicidad de implementación no es un criterio suficiente, y el sistema exige en esos casos la resolución explícita del usuario.'));

  c.push(U.h2('3.', 'Respecto a la construcción del sistema'));
  c.push(U.p('Se construyeron y verificaron los Incrementos 1 y 2 completos —identidad, accesos, motor de sincronización, inventario, trazabilidad, historial sanitario y calendario de alertas— junto con la estimación morfométrica del peso corporal. El alcance alcanzado cubre precisamente los componentes de mayor riesgo técnico del sistema: la operación sin conexión, la consolidación de datos divergentes y la estimación del peso sin báscula. Los módulos restantes presentan una complejidad menor por apoyarse sobre la infraestructura ya construida.'));
  c.push(U.p('El proceso de verificación arrojó un hallazgo metodológico que conviene consignar. El contraste entre el documento de diseño de base de datos y el esquema construido reveló que la implementación había introducido una entidad de agrupación que el diseño nunca contempló. La divergencia se corrigió sobre el código y no sobre el documento, criterio que corresponde cuando el diseño ha sido revisado y aprobado, y que deja constancia de que la coherencia entre documentación e implementación no se obtiene por buena voluntad sino por verificación deliberada.'));

  c.push(U.h2('4.', 'Respecto a la evaluación del sistema'));
  c.push(U.p('La evaluación funcional y técnica del código construido se ejecutó mediante ciento veintiséis pruebas automatizadas y veinticinco escenarios sobre el sistema en funcionamiento, todos con el resultado esperado. La propiedad esencial del sistema quedó verificada: un alta realizada sin red queda disponible de inmediato en el dispositivo y se consolida sin pérdida ni duplicación cuando la conexión se restablece.'));
  c.push(U.p('La evaluación de usabilidad con el grupo piloto y la validación de la precisión de la estimación de peso contra la muestra de referencia permanecen pendientes, y corresponden a los incrementos en curso. El presente documento no formula afirmaciones sobre ellas, por no disponer de la evidencia que las sustentaría.'));

  c.push(U.h2('5.', 'Respecto a la viabilidad del proyecto'));
  c.push(U.p('El proyecto es ejecutable con las herramientas y los conocimientos disponibles en el entorno universitario. El stack es íntegramente de código abierto, lo que anula el costo de licenciamiento y, más importante, elimina la dependencia de proveedores comerciales para la continuidad del sistema. La organización por incrementos acotó el riesgo de incumplimiento: cada incremento cerrado constituye una versión funcional y entregable, no un avance parcial inutilizable.'));

  // ===================== RECOMENDACIONES =====================
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('RECOMENDACIONES', { enIndice: true, before: 200, after: 300 }));

  c.push(U.h2('1.', 'Para la continuación del desarrollo'));
  c.push(U.p('Se recomienda cerrar la brecha del cifrado de la base de datos local antes de iniciar cualquier despliegue con datos reales de un establecimiento. El requisito está especificado y el diseño lo contempla, pero mientras no esté implementado el dispositivo transporta información comercial sensible sin protección en reposo, y el dispositivo viaja al campo y puede perderse.'));
  c.push(U.p('Se recomienda asimismo priorizar la calibración de la constante de la fórmula de estimación contra la muestra de referencia antes de construir las funcionalidades que dependen del peso. La evaluación ponderada para la selección de venta opera sobre el peso estimado; si la estimación no está calibrada, el orden que produzca esa evaluación carecerá de fundamento aunque el mecanismo funcione correctamente.'));

  c.push(U.h2('2.', 'Para la operación y el mantenimiento'));
  c.push(U.p('Se recomienda mantener la disciplina de que toda modificación del esquema de base de datos se realice mediante migraciones versionadas y nunca mediante intervención manual sobre la base. Esta práctica es la que garantiza que los entornos de desarrollo, prueba y producción permanezcan idénticos, y su abandono es una de las causas más frecuentes de divergencia difícil de diagnosticar.'));
  c.push(U.p('Se recomienda incorporar un mecanismo de registro de errores en el servicio que capture las excepciones no controladas con su contexto completo. En un sistema cuyos usuarios operan en condiciones variables de conectividad y con dispositivos heterogéneos, la reproducción controlada de un fallo reportado es difícil, y el registro reduce sustancialmente el tiempo de diagnóstico.'));

  c.push(U.h2('3.', 'Para la seguridad'));
  c.push(U.p('Se recomienda someter el sistema a una revisión de seguridad centrada en los riesgos del OWASP Top 10 antes del despliegue en producción, y no confiar únicamente en que los controles estén implementados. La verificación de que un control existe es distinta de la verificación de que opera efectivamente ante un intento de evasión.'));
  c.push(U.p('Se recomienda además establecer un procedimiento de rotación de los secretos de firma de los tokens, que en el estado actual se definen por configuración y permanecen fijos.'));

  c.push(U.h2('4.', 'Para futuras ampliaciones'));
  c.push(U.p('Se recomienda evaluar la integración con el sistema nacional de identificación e información ganadera del SENASAG. El modelo de datos del sistema contempla la identificación individual de forma que esa integración resulte posible sin rediseño, y constituiría un paso hacia la trazabilidad oficial que exigen los mercados de exportación.'));
  c.push(U.p('Se recomienda asimismo evaluar la incorporación del reloj lógico híbrido para el ordenamiento de los cambios entre dispositivos. El sistema actual ordena mediante la marca temporal del servidor, lo que resulta suficiente para el escenario de un establecimiento con pocos dispositivos, pero el reloj lógico híbrido —ya contemplado en el glosario del documento de especificación— sería necesario si el número de dispositivos concurrentes creciera.'));

  c.push(U.h2('5.', 'Para nuevas investigaciones'));
  c.push(U.p('Se recomienda que trabajos posteriores evalúen el efecto del sistema sobre el resultado económico del productor a lo largo de un ciclo productivo completo. El presente trabajo establece que la herramienta funciona y que atiende una necesidad relevada, pero el período de evaluación no permite medir el efecto sobre la rentabilidad, que es la pregunta que en definitiva interesa al productor.'));
  c.push(U.p('Se recomienda igualmente que la universidad explore un convenio con alguna asociación ganadera del departamento para dar continuidad al sistema más allá del período académico. Un sistema de software para un sector productivo genera su valor cuando es adoptado y mantenido en el tiempo, condición que difícilmente se cumple si queda archivado al término del proyecto de grado.'));

  // ===================== REFERENCIAS =====================
  c.push(U.saltoPagina());
  c.push(U.tituloSimple('REFERENCIAS BIBLIOGRÁFICAS', { enIndice: true, before: 300, after: 300 }));
  [
    'Ambler, S. W. (2002). Agile modeling: Effective practices for extreme programming and the unified process. Wiley.',
    'Bangor, A., Kortum, P. y Miller, J. (2009). Determining what individual SUS scores mean: Adding an adjective rating scale. Journal of Usability Studies, 4(3), 114–123.',
    'Bavera, G. A. (2005). Manejo de bovinos para carne. Sitio Argentino de Producción Animal.',
    'Bertalanffy, L. von. (1968). General system theory: Foundations, development, applications. George Braziller.',
    'Blanchard, B. S. y Fabrycky, W. J. (2011). Systems engineering and analysis (5.ª ed.). Prentice Hall.',
    'Bolivia. (1992). Ley 1322 de Derecho de Autor, de 13 de abril de 1992.',
    'Bolivia. (1997). Decreto Supremo 24582, Reglamento del Soporte Lógico o Software.',
    'Bolivia. (1997). Ley 1768 de modificaciones al Código Penal, de 10 de marzo de 1997.',
    'Bolivia. (2011). Ley 164 General de Telecomunicaciones, Tecnologías de Información y Comunicación, de 8 de agosto de 2011.',
    'Bolivia. (2012). Decreto Supremo 1391, Reglamento General a la Ley 164.',
    'Booch, G., Rumbaugh, J. y Jacobson, I. (2005). The unified modeling language user guide (2.ª ed.). Addison-Wesley.',
    'Brown, S. (2018). The C4 model for visualising software architecture. https://c4model.com',
    'Centro de Investigación y Promoción del Campesinado. (2023). Situación de la ganadería en la región del Chaco boliviano. CIPCA.',
    'Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. MIS Quarterly, 13(3), 319–340.',
    'Elmasri, R. y Navathe, S. B. (2016). Fundamentals of database systems (7.ª ed.). Pearson.',
    'Federación de Ganaderos de Santa Cruz. (2021). Datos y estadísticas del sector ganadero cruceño. FEGASACRUZ.',
    'Gilbert, S. y Lynch, N. (2002). Brewer’s conjecture and the feasibility of consistent, available, partition-tolerant web services. ACM SIGACT News, 33(2), 51–59.',
    'Institute of Electrical and Electronics Engineers. (1990). IEEE Standard Glossary of Software Engineering Terminology (IEEE Std 610.12-1990).',
    'Institute of Electrical and Electronics Engineers. (1998). IEEE 830-1998. Recommended practice for software requirements specifications.',
    'Instituto Nacional de Estadística. (2018). Encuesta agropecuaria. Estado Plurinacional de Bolivia.',
    'Instituto Nacional de Estadística. (2024). Estadísticas del sector agropecuario. Estado Plurinacional de Bolivia.',
    'International Organization for Standardization. (2023). ISO/IEC 25010. Systems and software engineering. SQuaRE. Product quality model.',
    'ISO/IEC/IEEE. (2017). ISO/IEC/IEEE 12207: Systems and software engineering — Software life cycle processes.',
    'ISO/IEC/IEEE. (2018). ISO/IEC/IEEE 29148: Systems and software engineering — Requirements engineering.',
    'Kleppmann, M. (2019). Designing data-intensive applications. O’Reilly Media.',
    'Kleppmann, M., Wiggins, A., van Hardenberg, P. y McGranaghan, M. (2019). Local-first software: You own your data, in spite of the cloud. Onward! 2019.',
    'Larman, C. y Basili, V. R. (2003). Iterative and incremental developments: A brief history. Computer, 36(6), 47–56.',
    'Laudon, K. C. y Laudon, J. P. (2016). Management information systems: Managing the digital firm (14.ª ed.). Pearson.',
    'National Research Council. (2016). Nutrient requirements of beef cattle (8.ª ed. rev.). National Academies Press.',
    'Pressman, R. S. y Maxim, B. R. (2015). Software engineering: A practitioner’s approach (8.ª ed.). McGraw-Hill.',
    'Rogers, E. M. (2003). Diffusion of innovations (5.ª ed.). Free Press.',
    'Servicio Nacional de Sanidad Agropecuaria e Inocuidad Alimentaria. (2023). Normativa de identificación y trazabilidad del ganado bovino. SENASAG.',
    'Servicio Nacional de Sanidad Agropecuaria e Inocuidad Alimentaria. Reglamento General de Sanidad Animal (REGENSA). SENASAG.',
    'Sommerville, I. (2016). Software engineering (10.ª ed.). Pearson.',
    'Wangchuk, K., Wangdi, J. y Mindu, M. (2018). Comparison and reliability of techniques to estimate live cattle body weight. Journal of Applied Animal Research, 46(1).',
    'World Wide Web Consortium. (2018). Web Content Accessibility Guidelines (WCAG) 2.1. W3C.',
  ].forEach((r) => c.push(U.referencia(r)));

  return c;
};
