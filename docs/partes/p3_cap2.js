/** CAPÍTULO II — MARCO TEÓRICO Y REFERENCIAL. */
const U = require('../univalle');

module.exports = function capitulo2() {
  const c = [];
  c.push(...U.portadaCapitulo('CAPÍTULO II', 'MARCO TEÓRICO Y REFERENCIAL'));

  c.push(U.p('Este capítulo establece los fundamentos conceptuales, tecnológicos y normativos sobre los que se construye el sistema. Comienza por los principios generales de la ingeniería de sistemas y de software, continúa con los fundamentos específicos del problema que el proyecto aborda —aplicaciones que operan sin conexión permanente y estimación morfométrica del peso bovino—, describe las tecnologías del stack adoptado, revisa las metodologías y estándares aplicables, examina el estado del arte en soluciones comparables y cierra con el marco legal boliviano que condiciona el tratamiento de la información.'));

  // --- 2.1 ---
  c.push(U.h1('2.1.', 'Fundamentos de ingeniería de sistemas'));

  c.push(U.h2('2.1.1.', 'Sistemas y teoría general de sistemas'));
  c.push(U.p('Un sistema es un conjunto de elementos interrelacionados que operan de forma conjunta para alcanzar un propósito que ninguno de ellos alcanzaría por separado. La Teoría General de Sistemas, formulada por Ludwig von Bertalanffy, establece que las propiedades de un sistema emergen de las relaciones entre sus partes y no de las partes consideradas de forma aislada, principio que explica por qué el comportamiento de un sistema no puede deducirse únicamente del estudio de sus componentes individuales (Bertalanffy, 1968).'));
  c.push(U.p('Esta noción es directamente aplicable al presente proyecto. El sistema de gestión ganadera no es la suma de una aplicación móvil, un servicio central y una base de datos: es la relación entre ellos lo que produce la capacidad de registrar información en un predio sin señal y recuperarla, consolidada y consistente, desde otro dispositivo días después. La propiedad que interesa —la continuidad del registro pese a la intermitencia de la red— no reside en ningún componente por separado.'));

  c.push(U.h2('2.1.2.', 'Ingeniería de sistemas'));
  c.push(U.p('La ingeniería de sistemas es la disciplina que se ocupa del diseño, la integración y la gestión de sistemas complejos a lo largo de su ciclo de vida. Su enfoque es interdisciplinario: considera no solo los componentes técnicos, sino también las personas que los operan, los procesos en que se insertan y las restricciones del entorno en que funcionan (Blanchard y Fabrycky, 2011).'));
  c.push(U.p('En este proyecto, ese enfoque se manifiesta en que las decisiones técnicas no se tomaron a partir de criterios puramente tecnológicos, sino de las condiciones reales de operación: la ausencia de conectividad, el tipo de dispositivo disponible, las condiciones físicas de uso en campo y el perfil del usuario que opera el sistema.'));

  c.push(U.h2('2.1.3.', 'Sistemas de información'));
  c.push(U.p('Un sistema de información es un conjunto organizado de personas, procesos, datos y tecnología que recopila, procesa, almacena y distribuye información para apoyar la toma de decisiones y el control dentro de una organización (Laudon y Laudon, 2016). La distinción respecto a un simple programa informático es relevante: el sistema incluye a las personas que ingresan los datos y a los procedimientos que rigen ese ingreso.'));
  c.push(U.p('El sistema propuesto lo es en sentido pleno: su valor no reside en el software, sino en que la información registrada por el personal de campo llegue, consolidada y a tiempo, a quien debe decidir sobre la venta de un animal. Si el registro no ocurre, el software carece de utilidad. Esta constatación orientó buena parte de las decisiones de diseño de interfaz documentadas en el Capítulo V.'));

  c.push(U.h2('2.1.4.', 'Ingeniería de software'));
  c.push(U.p('La ingeniería de software es la aplicación de un enfoque sistemático, disciplinado y cuantificable al desarrollo, la operación y el mantenimiento del software (IEEE, 1990). Su objeto es producir software que satisfaga los requisitos del usuario dentro de restricciones de tiempo, costo y calidad, y que pueda mantenerse y evolucionar sin degradarse.'));
  c.push(U.p('Pressman y Maxim (2015) sostienen que la calidad de un producto de software depende tanto del proceso seguido para construirlo como de las decisiones técnicas puntuales. Esta premisa fundamenta la adopción, en este proyecto, de una metodología explícita de desarrollo, de pruebas automatizadas y de criterios de aceptación verificables por incremento, documentados en los Capítulos III y VI.'));

  c.push(U.h2('2.1.5.', 'Ciclo de vida de los sistemas'));
  c.push(U.p('El ciclo de vida de un sistema comprende las etapas por las que atraviesa desde su concepción hasta su retiro: análisis de requisitos, diseño, construcción, pruebas, despliegue, operación, mantenimiento y eventual sustitución. La norma ISO/IEC/IEEE 12207 establece el marco de referencia internacional para estos procesos (ISO/IEC/IEEE, 2017).'));
  c.push(U.p('El presente proyecto cubre las etapas de análisis, diseño, construcción, pruebas y despliegue inicial. Las de operación sostenida y mantenimiento exceden el horizonte académico del trabajo, aunque las decisiones de arquitectura se tomaron considerando su impacto sobre ellas.'));

  // --- 2.2 ---
  c.push(U.h1('2.2.', 'Fundamentos del área específica'));
  c.push(U.p('El problema que aborda este proyecto combina dos dominios que no suelen tratarse de forma conjunta: la construcción de aplicaciones que operan sin conexión permanente, y la estimación del peso bovino mediante medidas corporales. Esta sección desarrolla los fundamentos de ambos.'));

  c.push(U.h2('2.2.1.', 'Arquitectura con funcionamiento sin conexión'));
  c.push(U.p('Una aplicación con funcionamiento sin conexión, denominada en la literatura técnica aplicación local-first, es aquella en la que la base de datos del dispositivo es la fuente primaria de lectura y escritura, y el servicio central actúa como punto de consolidación y respaldo, no como requisito de operación. La aplicación funciona a plena capacidad sin red; la conexión, cuando existe, sirve para propagar los cambios y recibir los que otros dispositivos hayan producido (Kleppmann et al., 2019).'));
  c.push(U.p('Este enfoque invierte la relación habitual entre cliente y servidor. En una aplicación convencional, la interfaz solicita datos al servidor y espera su respuesta antes de mostrar resultados; una interrupción de la red detiene el trabajo. En una aplicación local-first, la interfaz consulta la base de datos del dispositivo y responde de inmediato, con independencia del estado de la red. La consolidación ocurre en segundo plano y no bloquea al usuario.'));
  c.push(U.p('La contrapartida es la complejidad: al permitir escrituras simultáneas en varios dispositivos sin coordinación previa, el sistema debe resolver qué hacer cuando dos de ellos modifican el mismo registro. Este problema, inexistente en una arquitectura con servidor central obligatorio, es el costo técnico de la autonomía.'));

  c.push(U.h2('2.2.2.', 'Consistencia eventual y resolución de conflictos'));
  c.push(U.p('El teorema CAP, formulado por Brewer y demostrado formalmente por Gilbert y Lynch (2002), establece que un sistema distribuido no puede garantizar simultáneamente consistencia, disponibilidad y tolerancia a particiones de red. Ante una partición —que es exactamente lo que ocurre cuando el dispositivo del productor pierde señal—, el sistema debe elegir entre rechazar la operación para preservar la consistencia, o aceptarla y resolver después las divergencias.'));
  c.push(U.p('Para el contexto de este proyecto la elección es forzosa: rechazar el registro de un animal porque no hay señal equivale a no tener sistema. Se adopta por tanto un modelo de consistencia eventual, en el que las réplicas convergen al mismo estado una vez restablecida la comunicación, aceptando que durante el intervalo sin red puedan diferir.'));
  c.push(U.p('La estrategia de resolución de conflictos se diferencia según el riesgo asociado a cada entidad. Para los datos descriptivos del animal se adopta la regla de última escritura, en la que prevalece la versión con marca temporal más reciente, porque el costo de equivocarse es bajo y recuperable. Para los datos de alto riesgo —registros de peso y eventos sanitarios— la resolución automática no es aceptable: una vacuna registrada dos veces o un peso sobrescrito tienen consecuencias sanitarias y económicas, de modo que el conflicto se marca y se somete a resolución explícita del usuario.'));

  c.push(U.h2('2.2.3.', 'Identificadores generados en el dispositivo'));
  c.push(U.p('Una consecuencia directa del funcionamiento sin conexión es que el identificador de cada registro debe generarse en el dispositivo, antes de cualquier contacto con el servidor. Un identificador autoincremental asignado por la base de datos central obligaría a esperar respuesta para saber con qué clave quedó guardado el animal, lo que es imposible sin red.'));
  c.push(U.p('El identificador universal único resuelve el problema al ser generado localmente con probabilidad de colisión despreciable. El sistema emplea la variante ULID, que a diferencia del identificador aleatorio incorpora una marca temporal en sus primeros caracteres, por lo que los identificadores resultan ordenables cronológicamente. Esta propiedad mejora el comportamiento de los índices de la base de datos, porque las inserciones sucesivas se concentran al final del índice en lugar de dispersarse de forma aleatoria.'));
  c.push(U.p('La generación del identificador en el dispositivo tiene además una consecuencia valiosa para la consolidación: convierte el envío de un registro en una operación idempotente. Si el dispositivo transmite un animal y pierde la respuesta del servidor, puede reintentar el envío sin riesgo de duplicarlo, porque el servidor reconoce el identificador y actualiza en lugar de crear.'));

  c.push(U.h2('2.2.4.', 'Estimación morfométrica del peso bovino'));
  c.push(U.p('La estimación del peso vivo a partir de medidas corporales es una práctica documentada en la zootecnia desde hace más de un siglo. Se fundamenta en la correlación entre el volumen corporal del animal y su masa: el perímetro torácico, medido con cinta métrica detrás de las paletas, es el predictor individual de mayor correlación con el peso vivo, y su combinación con el largo corporal mejora la precisión de la estimación (Wangchuk et al., 2018).'));
  c.push(U.p('La fórmula de Schaeffer expresa el peso vivo como el producto del cuadrado del perímetro torácico por el largo corporal, dividido por una constante que depende de la conformación del animal. El uso de dos medidas, en lugar de una sola como en las cintas bovinométricas comerciales, reduce el error en animales cuya conformación se aparta del promedio.'));
  c.push(U.p('La constante varía según la raza y la categoría, razón por la cual una fórmula única aplicada a todo el hato introduce error sistemático en los extremos del rango de peso. Las fórmulas clásicas se derivaron en su mayoría de razas europeas, de conformación distinta a la del ganado cebú predominante en el Chaco cruceño, lo que obliga a calibrar la constante contra una muestra de referencia local.'));
  c.push(U.p('El método presenta un margen de error inherente que la bibliografía sitúa en un rango de un dígito porcentual en condiciones adecuadas de medición. Para la decisión que debe tomar el productor —si un animal está en condiciones de venderse y en qué rango de precio— esa precisión es suficiente, y es sustancialmente mejor que la estimación visual que constituye la práctica actual. El sistema presenta el valor como estimación y no como medición, de modo que el usuario conozca su naturaleza aproximada.'));

  // --- 2.3 ---
  c.push(U.h1('2.3.', 'Tecnologías relacionadas con la solución'));
  c.push(U.p('El stack tecnológico se seleccionó buscando coherencia entre capas, madurez del ecosistema y adecuación a un equipo de desarrollo reducido. La fundamentación comparativa de cada elección se desarrolla en el Capítulo V; esta sección describe las tecnologías en sí.'));

  c.push(U.h2('2.3.1.', 'Lenguajes de programación'));
  c.push(U.p('Dart es el lenguaje de la aplicación móvil. De tipado estático y orientado a objetos, ofrece soporte nativo para programación asíncrona mediante futuros y flujos de datos. Su compilación anticipada a código nativo permite que la aplicación se ejecute sin intérprete intermedio, lo que resulta determinante para el rendimiento en dispositivos de gama baja.'));
  c.push(U.p('TypeScript es el lenguaje del servicio central y del panel web. Construido sobre JavaScript, agrega un sistema de tipos verificado en compilación que detecta antes de la ejecución una categoría entera de errores. En un sistema donde los datos sanitarios y de peso condicionan decisiones económicas, esa verificación tiene valor concreto, y su uso en ambas capas reduce la fricción de mantener el sistema con un equipo pequeño.'));

  c.push(U.h2('2.3.2.', 'Frameworks y bibliotecas'));
  c.push(U.p('Flutter es el marco de la aplicación móvil. A diferencia de los marcos multiplataforma que traducen a componentes nativos del sistema operativo, Flutter dibuja su propia interfaz sobre el lienzo del dispositivo. La consecuencia práctica es que el rendimiento resulta predecible con independencia del fabricante y de la versión del sistema operativo, condición necesaria para garantizar la usabilidad en el hardware disponible en el entorno de uso.'));
  c.push(U.p('NestJS es el marco del servicio central. Construido sobre Node.js y diseñado para TypeScript, organiza el código en módulos independientes por dominio de negocio, cada uno con sus controladores, servicios y repositorios. Su sistema de inyección de dependencias permite que la lógica de negocio reciba sus repositorios como interfaces, sin conocer la implementación concreta, lo que la hace probable de forma aislada. Sus mecanismos de guardas simplifican la implementación del control de acceso por roles.'));
  c.push(U.p('Next.js es el marco del panel web de administración. Extiende React con enrutamiento basado en el sistema de archivos, varias estrategias de renderizado seleccionables por página y manejo integrado de configuración.'));
  c.push(U.p('Entre las bibliotecas de apoyo, Riverpod gestiona el estado de la aplicación móvil y la inyección de dependencias; go_router resuelve la navegación declarativa; Drift provee acceso tipado a la base de datos local; Prisma cumple la función equivalente en el servidor; y Dio gestiona la comunicación con la interfaz de programación, incluida la renovación automática de credenciales.'));

  c.push(U.h2('2.3.3.', 'Sistemas gestores de bases de datos'));
  c.push(U.p('PostgreSQL es la base de datos del servicio central. Es un gestor relacional de código abierto con más de tres décadas de desarrollo, reconocido por su cumplimiento del estándar SQL, sus garantías transaccionales y su soporte para tipos de datos avanzados. Para este sistema resultan particularmente relevantes sus transacciones completas, que garantizan que una consolidación que involucra múltiples escrituras se complete íntegramente o no se complete en absoluto, sin dejar el sistema en estado inconsistente.'));
  c.push(U.p('SQLite es la base de datos del dispositivo móvil. Es un motor embebido que opera como una biblioteca dentro del proceso de la aplicación, sin servidor ni configuración, y almacena la base completa en un único archivo. Es el motor de base de datos más desplegado del mundo y constituye la opción estándar para la persistencia local en aplicaciones móviles.'));
  c.push(U.p('Drift es la capa de acceso que el proyecto emplea sobre SQLite. Genera, a partir de la definición de las tablas en Dart, el código de acceso con tipos verificados en compilación, y expone las consultas como flujos observables. Esta última propiedad es la que permite que la interfaz se actualice sola cuando la consolidación escribe en la base, sin que ninguna pantalla deba recargarse explícitamente.'));

  c.push(U.h2('2.3.4.', 'Servidores y servicios de infraestructura'));
  c.push(U.p('Node.js es el entorno de ejecución del servicio central. Su modelo de entrada y salida no bloqueante resulta adecuado para un servicio que atiende numerosas peticiones de corta duración, como las que genera la consolidación de dispositivos móviles. Redis atiende las tareas de soporte: colas de trabajo y almacenamiento en caché.'));
  c.push(U.p('Docker empaqueta la aplicación junto con sus dependencias en contenedores que se comportan de forma idéntica en cualquier entorno, eliminando las discrepancias entre la máquina de desarrollo y el servidor de producción. Docker Compose orquesta el conjunto como un único servicio. Nginx opera como proxy inverso en el despliegue de producción, gestionando la terminación del cifrado de transporte y la distribución de peticiones.'));

  c.push(U.h2('2.3.5.', 'Herramientas de desarrollo'));
  c.push(U.p('Git gestiona el control de versiones del proyecto, alojado en un repositorio remoto que sirve además como respaldo del código y registro histórico de las decisiones de implementación. El entorno de desarrollo integrado utilizado es Visual Studio Code, con las extensiones correspondientes a Dart y Flutter.'));

  c.push(U.h2('2.3.6.', 'Herramientas de monitoreo y pruebas'));
  c.push(U.p('Jest ejecuta las pruebas del servicio central, tanto unitarias sobre la lógica de negocio como de integración sobre los puntos de acceso de la interfaz de programación. El marco de pruebas incorporado en Flutter cumple la función equivalente en la aplicación móvil, con la particularidad de que las pruebas de la base local se ejecutan contra SQLite en memoria, lo que garantiza que cada prueba parta de un estado limpio sin depender del dispositivo.'));
  c.push(U.p('Para las pruebas de carga del servicio se emplea k6, que permite simular usuarios concurrentes y medir los tiempos de respuesta bajo distintos escenarios de demanda.'));

  c.push(U.h2('2.3.7.', 'Tecnologías de integración e interoperabilidad'));
  c.push(U.p('La comunicación entre la aplicación móvil, el panel web y el servicio central se realiza mediante una interfaz de programación de estilo REST, que organiza los recursos del sistema como direcciones fijas sobre las que operan los métodos estándar del protocolo HTTP. Su ventaja frente a alternativas como GraphQL, en este caso concreto, es que cada operación pendiente en la cola de consolidación corresponde a una petición individual que puede reintentarse de forma independiente.'));
  c.push(U.p('El formato de intercambio es JSON. La autenticación se resuelve mediante JSON Web Token, un formato de credencial firmada digitalmente que el servidor puede verificar sin consultar la base de datos en cada petición, propiedad que reduce la latencia y permite que el servicio opere sin mantener estado de sesión en memoria.'));

  // --- 2.4 ---
  c.push(U.h1('2.4.', 'Metodologías y modelos de desarrollo'));

  c.push(U.h2('2.4.1.', 'Metodologías tradicionales'));
  c.push(U.p('Las metodologías tradicionales organizan el desarrollo en fases secuenciales, donde cada una debe completarse antes de iniciar la siguiente. El modelo en cascada es su expresión más conocida: análisis, diseño, implementación, pruebas y mantenimiento se suceden de forma lineal, con documentación formal como producto de cada fase (Sommerville, 2016).'));
  c.push(U.p('Su fortaleza es la previsibilidad: cuando los requisitos están completamente definidos y son estables, la planificación resulta confiable. Su debilidad es simétrica: el producto solo es visible al final, de modo que un malentendido en los requisitos iniciales se descubre cuando corregirlo resulta más costoso.'));

  c.push(U.h2('2.4.2.', 'Metodologías ágiles'));
  c.push(U.p('Las metodologías ágiles surgen como respuesta a las limitaciones del enfoque secuencial en contextos de requisitos cambiantes. Privilegian la entrega frecuente de software funcional, la colaboración con el usuario por encima de la negociación contractual y la respuesta al cambio por sobre el seguimiento de un plan rígido.'));
  c.push(U.p('Scrum organiza el trabajo en iteraciones de duración fija con roles y ceremonias definidos, y supone un equipo de varias personas con dedicación sostenida. Kanban se enfoca en visualizar el flujo de trabajo y limitar el trabajo en curso, sin imponer iteraciones de duración fija.'));

  c.push(U.h2('2.4.3.', 'El modelo incremental'));
  c.push(U.p('El modelo incremental construye el sistema en partes sucesivas denominadas incrementos. Cada incremento atraviesa sus propias fases de análisis, diseño, implementación y pruebas, y se integra al producto existente antes de iniciar el siguiente (Pressman y Maxim, 2015). A diferencia del modelo en cascada, entrega valor de forma continua; a diferencia de Scrum, no exige la estructura de roles y ceremonias de un equipo numeroso.'));
  c.push(U.p('Larman y Basili (2003) documentan que el desarrollo iterativo e incremental es una de las prácticas más antiguas y exitosas de la ingeniería de software, aplicada desde la década de 1950 en proyectos de gran escala. Su efectividad radica en la reducción del riesgo acumulado: los problemas de integración y los malentendidos sobre los requisitos se detectan de forma temprana, antes de que su impacto sea crítico.'));

  c.push(U.h2('2.4.4.', 'Justificación de la metodología elegida'));
  c.push(U.p('El proyecto adopta el modelo incremental por tres razones. La primera es la estructura de dependencias del sistema: no es posible implementar la estimación de peso sin contar antes con el registro de animales, ni activar la consolidación sin una capa previa de autenticación. Esta jerarquía natural hace que la construcción por incrementos no sea solo conveniente, sino necesaria.'));
  c.push(U.p('La segunda es el tamaño del equipo. El proyecto es desarrollado por una sola persona, lo que vuelve inaplicables las ceremonias y roles de Scrum sin incurrir en formalismo vacío. El modelo incremental conserva el beneficio de la entrega progresiva sin imponer esa estructura.'));
  c.push(U.p('La tercera es la naturaleza de los requisitos. Los del primer incremento están bien definidos, pero el alcance total puede evolucionar conforme se valida con usuarios reales. Pressman y Maxim (2015) señalan precisamente esa condición como el escenario de aplicación del modelo incremental. El Cuadro 2.1 contrasta las tres metodologías consideradas frente a las condiciones concretas de este proyecto.'));
  c.push(...U.cuadro('2.1', 'Comparación de metodologías frente a las condiciones del proyecto',
    ['Criterio', 'Cascada', 'Scrum', 'Incremental'],
    [
      ['Equipo de una persona', 'Compatible', 'Requiere varios roles', 'Compatible'],
      ['Requisitos que evolucionan', 'Poco tolerante', 'Tolerante', 'Tolerante'],
      ['Entrega temprana de valor', 'Al final del proyecto', 'Por iteración', 'Por incremento'],
      ['Validación con usuarios', 'Al cierre', 'Continua', 'Al cierre de cada incremento'],
      ['Carga de ceremonias', 'Baja', 'Alta para un equipo pequeño', 'Baja'],
    ],
    'Elaboración propia, 2026.', [0.28, 0.24, 0.24, 0.24]));

  c.push(U.h2('2.4.5.', 'Adaptación de la metodología al proyecto'));
  c.push(U.p('El modelo se adapta al contexto académico en dos aspectos. Primero, cada incremento cierra con un conjunto de criterios de aceptación verificables, de modo que el avance pueda evaluarse de forma objetiva y no por percepción. Segundo, la validación con usuarios al cierre de cada incremento se realiza con productores del grupo piloto, lo que permite observar el uso en condiciones reales en lugar de en un entorno simulado.'));

  // --- 2.5 ---
  c.push(U.h1('2.5.', 'Modelos, estándares y buenas prácticas'));
  c.push(U.p('Las normas internacionales proveen marcos de referencia que permiten fundamentar las decisiones de ingeniería en criterios establecidos y no en preferencias del desarrollador. Esta sección describe las aplicables al proyecto. El marco de ciberseguridad del NIST no se incluye por estar orientado a la gestión de riesgo organizacional en infraestructuras críticas, alcance que excede al de este sistema.'));

  c.push(U.h2('2.5.1.', 'ISO/IEC/IEEE 12207: procesos del ciclo de vida del software'));
  c.push(U.p('Esta norma define el marco de procesos del ciclo de vida del software, estableciendo un vocabulario común y un conjunto de procesos de acuerdo, organizacionales, técnicos de gestión y técnicos (ISO/IEC/IEEE, 2017). Del conjunto de procesos técnicos que define, el proyecto cubre los de definición de requisitos de las partes interesadas, análisis de requisitos del sistema, diseño de arquitectura, implementación, integración, verificación y validación.'));

  c.push(U.h2('2.5.2.', 'ISO/IEC 25010: modelo de calidad del producto'));
  c.push(U.p('La norma ISO/IEC 25010 establece un modelo de calidad del producto organizado en ocho características: adecuación funcional, eficiencia de desempeño, compatibilidad, usabilidad, fiabilidad, seguridad, mantenibilidad y portabilidad. Su relevancia para este proyecto es doble: estructura los requisitos no funcionales del Capítulo IV y provee el esquema de la evaluación de calidad del Capítulo VII.'));
  c.push(U.p('Las características de mayor peso en este sistema son la usabilidad, porque el usuario objetivo no tiene formación técnica y abandona la herramienta si no la comprende; la fiabilidad, porque la pérdida de un registro sanitario tiene consecuencias económicas; y la eficiencia de desempeño, porque el hardware del entorno de uso impone límites estrictos.'));

  c.push(U.h2('2.5.3.', 'ISO/IEC 27001 e ISO/IEC 27002: seguridad de la información'));
  c.push(U.p('La norma ISO/IEC 27001 especifica los requisitos de un sistema de gestión de seguridad de la información, mientras que la ISO/IEC 27002 desarrolla el catálogo de controles aplicables. Aunque la certificación de un sistema de gestión excede el alcance de un proyecto de grado, varios de sus controles orientan directamente las decisiones de diseño: el control de acceso basado en roles, el cifrado de las comunicaciones y de la base local, la protección de las credenciales almacenadas y el registro de la actividad del sistema.'));

  c.push(U.h2('2.5.4.', 'OWASP Top 10'));
  c.push(U.p('El OWASP Top 10 enumera los riesgos de seguridad más críticos en aplicaciones web, actualizado periódicamente a partir de datos de incidentes reales. Para este sistema resultan particularmente aplicables el control de acceso defectuoso, atendido mediante la verificación de permisos en cada operación; los fallos criptográficos, atendidos mediante el almacenamiento de contraseñas con función de derivación de clave y el cifrado del transporte; y la inyección, prevenida por la parametrización automática de consultas que proveen las capas de acceso a datos empleadas.'));

  c.push(U.h2('2.5.5.', 'UML y modelado de sistemas'));
  c.push(U.p('El Lenguaje Unificado de Modelado es una notación visual estandarizada para especificar, visualizar y documentar los artefactos de un sistema de software. No constituye una metodología sino un conjunto de diagramas que representan distintas vistas del sistema (Booch et al., 2005).'));
  c.push(U.p('El proyecto emplea los diagramas de casos de uso, para modelar la interacción entre los actores y las funcionalidades; los diagramas de secuencia, para representar los flujos críticos en el tiempo, en particular la consolidación; los diagramas de actividades, para los flujos de decisión; y el diagrama de clases, para documentar el modelo de dominio. Esta selección responde al principio de modelado mínimo suficiente: producir únicamente los artefactos que aporten valor al diseño y a la comunicación (Ambler, 2002).'));
  c.push(U.p('Para la documentación de la arquitectura se emplea complementariamente el modelo C4, que organiza la descripción en niveles progresivos de abstracción —contexto, contenedores, componentes y código—, lo que permite presentar el sistema a audiencias distintas con el nivel de detalle apropiado para cada una (Brown, 2018).'));

  c.push(U.h2('2.5.6.', 'IEEE 830 e ISO/IEC/IEEE 29148: ingeniería de requisitos'));
  c.push(U.p('El estándar IEEE 830 es la referencia que estructura la especificación de requisitos del presente proyecto, complementado por la norma ISO/IEC/IEEE 29148, que define las características que todo requisito debe cumplir: ser necesario, verificable, no ambiguo, completo, singular, factible y trazable. El Capítulo IV aplica estos criterios en la formulación de los requisitos y establece la matriz de trazabilidad que vincula cada necesidad del usuario con el requisito que la traduce, el caso de uso que la ejercita y el criterio que la verifica.'));

  c.push(U.h2('2.5.7.', 'Accesibilidad, usabilidad e interoperabilidad'));
  c.push(U.p('Las Pautas de Accesibilidad para el Contenido Web en su versión 2.1 constituyen el estándar internacional de referencia en la materia. El proyecto aplica los criterios de nivel AA, de los cuales el de mayor incidencia es la relación de contraste mínima entre texto y fondo, que en este caso no responde a una consideración de inclusión sino a un requisito de funcionamiento: sin ese contraste la pantalla resulta ilegible bajo sol directo, que es la condición habitual de uso (W3C, 2018).'));
  c.push(U.p('Material Design 3 es el sistema de diseño adoptado para la aplicación móvil. Establece un área mínima de interacción táctil para todos los elementos operables, especificación que el proyecto amplía por encima del mínimo recomendado en atención a que el usuario opera el dispositivo con una sola mano y con las manos frecuentemente sucias o mojadas.'));
  c.push(U.p('En materia de interoperabilidad, la adopción de formatos y protocolos abiertos —HTTP, JSON, REST— garantiza que cualquier cliente capaz de realizar peticiones sobre el protocolo estándar pueda integrarse con el sistema, sin dependencia de tecnologías propietarias.'));

  // --- 2.6 ---
  c.push(U.h1('2.6.', 'Estado del arte'));

  c.push(U.h2('2.6.1.', 'Investigaciones internacionales'));
  c.push(U.p('La literatura internacional sobre sistemas de información para el sector ganadero se concentra en dos líneas. La primera aborda la trazabilidad individual del ganado como requisito de los mercados de exportación, con énfasis en la identificación electrónica y en la integración con sistemas nacionales de registro. La segunda estudia la adopción de tecnología digital por parte de productores rurales, y converge en que la utilidad percibida y la facilidad de uso son los factores determinantes de la adopción sostenida, por encima de la sofisticación funcional de la herramienta (Davis, 1989; Rogers, 2003).'));
  c.push(U.p('En el plano zootécnico, Wangchuk et al. (2018) comparan la fiabilidad de las técnicas de estimación del peso vivo y establecen el respaldo metodológico del módulo de estimación. En el plano técnico, Kleppmann et al. (2019) establecen los principios de diseño del software local-first, referencia conceptual directa de la arquitectura adoptada.'));

  c.push(U.h2('2.6.2.', 'Investigaciones nacionales'));
  c.push(U.p('La producción académica boliviana sobre sistemas de información aplicados al sector ganadero es escasa. Los trabajos disponibles se concentran en el diagnóstico del sector y en la caracterización de los sistemas productivos, con aportes del Instituto Nacional de Estadística, de las federaciones departamentales de ganaderos y del Centro de Investigación y Promoción del Campesinado, pero sin desarrollos de software documentados que aborden la restricción de conectividad como condición de diseño.'));
  c.push(U.p('Esta escasez constituye en sí misma un hallazgo relevante: el problema que el proyecto aborda no ha sido tratado de forma sistemática en la literatura nacional, lo que refuerza la pertinencia del trabajo y limita a la vez la posibilidad de apoyarse en antecedentes locales directos.'));

  c.push(U.h2('2.6.3.', 'Soluciones tecnológicas similares'));
  c.push(U.p('En el mercado regional existen plataformas de gestión ganadera orientadas al registro del inventario, el seguimiento sanitario y la generación de reportes productivos, entre ellas SIGGAN y BoviGest. Ambas resuelven la gestión del hato para explotaciones de escala considerable, con infraestructura tecnológica disponible y personal capacitado.'));

  c.push(U.h2('2.6.4.', 'Comparación de soluciones existentes'));
  c.push(U.p('El Cuadro 2.2 contrasta las soluciones relevadas con la propuesta sobre los criterios que el contexto impone: la operación sin conexión, el costo de adopción y la adecuación a la escala de la explotación tradicional.'));
  c.push(...U.cuadro('2.2', 'Comparación de las soluciones existentes frente al sistema propuesto',
    ['Dimensión', 'Plataformas existentes', 'Sistema propuesto'],
    [
      ['Conectividad requerida', 'Conexión permanente a internet', 'Operación completa sin conexión, con consolidación diferida'],
      ['Estimación de peso', 'Requiere el peso como dato de entrada', 'Lo estima a partir de medidas corporales, sin pesar al animal'],
      ['Perfil de dispositivo', 'Gama alta', 'Gama media y baja, el disponible en el entorno de uso'],
      ['Escala objetivo', 'Explotaciones de escala considerable', 'Explotaciones tradicionales del departamento'],
      ['Costo de adopción', 'Licenciamiento periódico', 'Sin licencia; stack íntegramente de código abierto'],
      ['Apoyo a la decisión de venta', 'Reportes productivos', 'Evaluación ponderada con criterios configurables'],
    ],
    'Elaboración propia, 2026, sobre la base de la documentación pública de las plataformas analizadas.',
    [0.22, 0.34, 0.44]));

  c.push(U.h2('2.6.5.', 'Brecha identificada'));
  c.push(U.p('La comparación revela que la brecha no está en la funcionalidad sino en las condiciones de operación. Las plataformas existentes resuelven correctamente el registro y el seguimiento del hato, pero bajo supuestos —conectividad permanente, hardware de gama alta, capacidad de pago de una licencia, disponibilidad de equipamiento de pesaje— que no se cumplen en el entorno del productor cruceño tradicional.'));
  c.push(U.p('El diagnóstico lo confirma de forma directa: ninguno de los productores consultados utiliza una herramienta digital especializada, pese a que la gran mayoría dispone de un dispositivo con capacidad técnica suficiente. La barrera no es el acceso al equipamiento ni el desinterés del productor, sino la inadecuación de la oferta existente al contexto de uso.'));

  c.push(U.h2('2.6.6.', 'Contribución del proyecto'));
  c.push(U.p('El proyecto contribuye en tres planos. En el técnico, documenta el diseño e implementación de una arquitectura con funcionamiento sin conexión y resolución de conflictos diferenciada por riesgo de entidad, aplicada a un dominio donde la pérdida o duplicación de un registro tiene consecuencias económicas concretas.'));
  c.push(U.p('En el aplicado, pone a disposición del productor una herramienta que opera bajo las condiciones reales de su entorno e integra la estimación de peso sin requerir equipamiento adicional, atendiendo el problema que el propio diagnóstico identifica como de mayor impacto económico.'));
  c.push(U.p('En el académico, aporta evidencia de campo sobre las prácticas de gestión y las barreras de adopción tecnológica en el sector ganadero cruceño, y documenta los resultados de la validación de usabilidad en un contexto poco representado en la literatura nacional.'));

  // --- 2.7 ---
  c.push(U.h1('2.7.', 'Marco conceptual'));
  c.push(U.p('Se definen a continuación los términos técnicos y del dominio ganadero empleados a lo largo del documento, organizados alfabéticamente.'));
  [
    ['Caravana', 'Dispositivo de identificación individual que se coloca en la oreja del animal y porta su número único de manejo. Cuando el animal cuenta con identificación oficial, corresponde al número asignado por el SENASAG.'],
    ['Consistencia eventual', 'Propiedad de un sistema distribuido según la cual las réplicas convergen al mismo estado una vez que cesa la actualización y se restablece la comunicación, admitiendo divergencias temporales.'],
    ['Crianza', 'Primera fase del ciclo productivo bovino, que comprende desde el nacimiento del ternero hasta su separación de la madre.'],
    ['Destete', 'Fase del ciclo productivo en que el ternero se separa de la madre y pasa a alimentarse de forma autónoma.'],
    ['Engorde', 'Fase final del ciclo productivo, orientada al incremento de peso del animal hasta alcanzar la condición de venta.'],
    ['Ganancia diaria de peso', 'Incremento promedio de peso vivo por día, calculado entre dos pesajes sucesivos del mismo animal.'],
    ['Hato', 'Conjunto de animales bovinos que conforman la unidad productiva de un establecimiento ganadero.'],
    ['Idempotencia', 'Propiedad de una operación que produce el mismo resultado al ejecutarse una o varias veces. En la consolidación, permite reintentar un envío sin duplicar el registro.'],
    ['Largo corporal', 'Longitud del cuerpo del animal, empleada junto al perímetro torácico en la estimación morfométrica del peso.'],
    ['Local-first', 'Enfoque de diseño en que la base de datos del dispositivo es la fuente primaria de lectura y escritura, y el servicio central actúa como punto de consolidación y no como requisito de operación.'],
    ['Marca de baja', 'Registro que señala que un dato fue dado de baja, conservado para propagar la eliminación durante la consolidación.'],
    ['Perímetro torácico', 'Circunferencia del tórax del animal medida con cinta métrica detrás de las paletas. Es el predictor individual de mayor correlación con el peso vivo.'],
    ['Potrero', 'División física del establecimiento destinada al pastoreo, que delimita la ubicación del animal dentro del predio.'],
    ['Reloj lógico híbrido', 'Marca de tiempo que combina el reloj físico con un contador lógico para ordenar los cambios entre dispositivos sin depender de la hora exacta de cada uno.'],
    ['Trazabilidad', 'Capacidad de seguir la historia, la ubicación y los eventos de un animal a lo largo de su ciclo productivo mediante su identificación individual.'],
    ['Última escritura', 'Política de resolución de conflictos que conserva el registro más reciente según la marca de tiempo asignada por el servidor.'],
    ['ULID', 'Identificador único ordenable en el tiempo, generado en el dispositivo sin coordinación con el servidor.'],
  ].forEach(([t, d]) => c.push(U.glosa(t, d)));

  // --- 2.8 ---
  c.push(U.h1('2.8.', 'Marco legal y normativo'));
  c.push(U.p('El sistema almacena información sobre la actividad productiva de personas y establecimientos, lo que lo somete a un conjunto de normas que condicionan su diseño. Esta sección revisa el marco boliviano aplicable.'));

  c.push(U.h2('2.8.1.', 'Legislación sobre datos personales'));
  c.push(U.p('Bolivia no cuenta a la fecha con una ley específica de protección de datos personales, situación que la distingue de la mayoría de los países de la región. Existen anteproyectos en discusión, pero ninguno ha sido promulgado. En ausencia de una norma especializada, la protección de los datos personales se sustenta en disposiciones dispersas.'));
  c.push(U.p('La Constitución Política del Estado reconoce el derecho a la privacidad, la intimidad y la honra, y establece la acción de protección de privacidad como garantía procesal para quien considere que sus datos personales registrados por cualquier medio afectan indebidamente esos derechos.'));
  c.push(U.p('La Ley 164 de 8 de agosto de 2011, General de Telecomunicaciones, Tecnologías de Información y Comunicación, junto con su reglamento aprobado por Decreto Supremo 1391 de 2012, contiene disposiciones sobre la inviolabilidad y el secreto de las comunicaciones, la confidencialidad de los datos de los usuarios y el régimen de documentos y firmas digitales.'));
  c.push(U.p('La ausencia de una norma específica no exime al sistema de proteger la información que administra. Por el contrario, a falta de un estándar legal obligatorio, el proyecto adopta por decisión de diseño las prácticas establecidas en la norma ISO/IEC 27002: almacenamiento de contraseñas mediante función de derivación de clave, cifrado del transporte y de la base de datos local, y control de acceso por roles. Estas medidas se documentan en el Capítulo V.'));

  c.push(U.h2('2.8.2.', 'Normativa sobre delitos informáticos'));
  c.push(U.p('El Código Penal boliviano, modificado por la Ley 1768 de 1997, incorporó las figuras de manipulación informática y de alteración, acceso y uso indebido de datos informáticos. La doctrina nacional coincide en que este marco resulta insuficiente frente a las modalidades actuales de delito informático, y existen iniciativas de actualización en discusión.'));
  c.push(U.p('Para el presente sistema, la relevancia de esta normativa es doble. Por una parte, las medidas de control de acceso implementadas constituyen la barrera técnica frente al acceso no autorizado que la norma tipifica. Por otra, el registro de la actividad del sistema provee la trazabilidad necesaria para acreditar un acceso indebido en caso de que llegara a producirse.'));

  c.push(U.h2('2.8.3.', 'Propiedad intelectual y licenciamiento de software'));
  c.push(U.p('La Ley 1322 de 13 de abril de 1992, de Derecho de Autor, protege los programas de computación, protección desarrollada por el Decreto Supremo 24582 de 1997, que establece el régimen de los programas de ordenador y las bases de datos, asimilándolos a las obras literarias.'));
  c.push(U.p('El sistema se construye íntegramente sobre componentes de código abierto, cuyas licencias permiten su uso, modificación y distribución sin contraprestación económica. Esta decisión, adoptada desde la selección del stack y recogida como restricción en la especificación de requisitos, evita dependencias de proveedores comerciales y permite que el sistema se mantenga y extienda sin incurrir en costos de licenciamiento.'));

  c.push(U.h2('2.8.4.', 'Normativa sectorial: sanidad animal y trazabilidad'));
  c.push(U.p('El Servicio Nacional de Sanidad Agropecuaria e Inocuidad Alimentaria es la autoridad competente en materia de sanidad animal en Bolivia. El Reglamento General de Sanidad Animal regula el registro de los establecimientos pecuarios, la identificación individual de los animales, el sistema nacional de rastreabilidad y los programas sanitarios de cumplimiento obligatorio, entre ellos los correspondientes a fiebre aftosa y brucelosis.'));
  c.push(U.p('Esta normativa incide directamente sobre el diseño en dos aspectos. Primero, la identificación individual que el reglamento establece es la que el sistema debe reflejar y respetar, de modo que el número de caravana registrado se corresponda con el identificador oficial cuando el animal lo posee. Segundo, los calendarios de vacunación obligatoria constituyen la base de las alertas sanitarias que el sistema genera, por lo que su configuración debe permitir el ajuste a los intervalos que la autoridad establezca.'));
  c.push(U.p('El sistema no se integra con el registro nacional en el alcance del presente proyecto, pero su modelo de datos contempla la identificación individual de forma que esa integración resulte posible sin rediseño, según se señala en las recomendaciones.'));

  c.push(U.h2('2.8.5.', 'Normativa institucional'));
  c.push(U.p('El proyecto se rige por el reglamento de la modalidad de graduación de la Universidad Privada del Valle, que establece la estructura del documento, los plazos de presentación y las instancias de evaluación. Los datos del establecimiento ganadero que sirve de caso de aplicación se emplean con autorización de su propietario, constancia que se incorpora como anexo.'));

  return c;
};
