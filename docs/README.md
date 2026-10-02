# Documento de proyecto de grado

El documento se genera por composición, no se edita a mano. Esto garantiza que
el contenido de los capítulos de análisis y diseño no pueda divergir de los
entregables técnicos de los que proviene.

## Generación

```bash
cd docs
node generar.js
```

Produce `GanaBol_Proyecto_de_Grado.docx` en formato institucional UNIVALLE:
carta, Arial 11, interlineado 1,5, texto justificado, cuadros con rótulo
arriba y fuente abajo, y numeración de página centrada al pie.

El índice de contenido se inserta como campo de Word: al abrir el documento,
hay que actualizarlo con clic derecho sobre él y «Actualizar campos».

## Estructura

| Archivo | Contenido |
|---|---|
| `univalle.js` | Formato institucional: párrafos, encabezados, cuadros y figuras |
| `fuentes.js` | Lectura de los entregables técnicos y extracción de sus cuadros |
| `partes/` | Un módulo por tramo del documento |
| `media/` | Diagramas de los entregables técnicos |
| `evidencias/` | Resultados de las pruebas ejecutadas |

## Procedencia del contenido

| Tramo | Procedencia |
|---|---|
| Introducción y Capítulo I | Perfil de proyecto aprobado |
| Capítulo II | Marco teórico, ampliado con el marco legal boliviano verificado |
| Capítulo III | Diseño metodológico del perfil |
| Capítulo IV | Documentos 01 (URS/SRS), 02 (procesos) y 03 (casos de uso) |
| Capítulo V | Documentos 04 (UML), 05 (base de datos), 06 (entidad-relación) y 07 (decisiones técnicas) |
| Capítulo VI | Código construido y resultados de las pruebas ejecutadas |
| Capítulo VII | Evaluación sobre el modelo de calidad ISO/IEC 25010 |

Los cuadros y las fichas de requisito y de caso de uso se leen de los
entregables técnicos en tiempo de generación. Un cambio en el entregable de
origen se refleja en el documento al volver a generarlo.

## Pendiente de incorporar

El documento señala de forma explícita lo que falta, en lugar de omitirlo:

- Resultados de las sesiones de usabilidad con el grupo piloto
- Validación de la precisión de la estimación de peso contra la muestra de referencia
- Pruebas de carga y de seguridad
- Apéndices y anexos, cuyo contenido debe adjuntarse
