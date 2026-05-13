# Tutorial Remotion: Registrar Pregunta de Verdadero o Falso Simple

## Objetivo

Crear un tutorial breve para docentes sobre el registro manual de una pregunta de tipo
`Verdadero o Falso Simple` desde el apartado `Banco de Preguntas`.

El flujo corresponde al modulo de documentacion academica, dentro de una asignatura, en el tab
`Banco de Preguntas`. El registro manual esta habilitado para `2do Parcial` y requiere seleccionar
un `Grupo Teorico`.

## Audiencia

Docentes que deben cargar preguntas evaluables en el banco antes de la generacion del examen.

## Duracion Recomendada

90 a 120 segundos.

## Estructura Del Video

| Tiempo    | Escena                 | Visual Principal                                                                | Narracion                                                                                                                          |
| --------- | ---------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 0:00-0:08 | Apertura               | Titulo sobre interfaz del sistema: `Registrar pregunta Verdadero/Falso`         | En este tutorial veremos como registrar una pregunta de tipo Verdadero o Falso Simple desde el Banco de Preguntas.                 |
| 0:08-0:18 | Ubicacion              | Pantalla de asignatura/documentacion con tab `Banco de Preguntas` resaltado     | Desde la asignatura, ingresa al apartado Banco de Preguntas. Aqui se gestiona el banco asociado al parcial y al grupo teorico.     |
| 0:18-0:32 | Seleccion de contexto  | Resaltar selector de parcial y selector de grupo                                | Selecciona el `2do Parcial` y luego el `Grupo Teorico` correspondiente. Estos campos definen donde quedara registrada la pregunta. |
| 0:32-0:42 | Nueva pregunta         | Resaltar boton `Nueva pregunta`                                                 | Cuando el parcial y el grupo esten seleccionados, pulsa `Nueva pregunta` para abrir el formulario de registro.                     |
| 0:42-0:55 | Tipo de pregunta       | Modal `Registrar Nueva Pregunta`, selector `Tipo de Pregunta`                   | En el campo `Tipo de Pregunta`, selecciona `Verdadero o Falso Simple`. El sistema mostrara una guia breve del tipo seleccionado.   |
| 0:55-1:08 | Dificultad y enunciado | Resaltar botones `Facil`, `Medio`, `Dificil` y campo `Enunciado de la pregunta` | Selecciona la dificultad y escribe una afirmacion clara. Esta afirmacion debe poder responderse unicamente como verdadera o falsa. |
| 1:08-1:20 | Respuesta correcta     | Resaltar `A. Verdadero` y `B. Falso`                                            | Marca la respuesta correcta: `A. Verdadero` si la afirmacion es verdadera o `B. Falso` si la afirmacion es falsa.                  |
| 1:20-1:32 | Imagen opcional        | Resaltar `Adjuntar/Cambiar Imagen`                                              | Si la pregunta lo requiere, puedes adjuntar una imagen. El tamano maximo permitido es de 5 MB.                                     |
| 1:32-1:45 | Previsualizacion       | Resaltar boton `Previsualizar PDF`                                              | Antes de guardar, usa `Previsualizar PDF` para revisar como se vera la pregunta en el examen.                                      |
| 1:45-1:58 | Guardado               | Resaltar boton `Registrar Pregunta` y notificacion de exito                     | Finalmente, pulsa `Registrar Pregunta`. El sistema guardara la pregunta en el banco del parcial y grupo seleccionados.             |
| 1:58-2:05 | Cierre                 | Lista del banco con pregunta creada resaltada                                   | Verifica que la pregunta aparezca en la lista del banco y revisa los conteos de avance.                                            |

## Guion De Voz En Off

En este tutorial veremos como registrar una pregunta de tipo Verdadero o Falso Simple desde el
Banco de Preguntas.

Primero, ingresa a la asignatura y abre el apartado `Banco de Preguntas`.

Antes de crear la pregunta, selecciona el `2do Parcial` y el `Grupo Teorico` correspondiente. Este
paso es importante porque define en que banco quedara registrada la pregunta.

Cuando el contexto este seleccionado, pulsa `Nueva pregunta`.

En el formulario, abre el campo `Tipo de Pregunta` y selecciona `Verdadero o Falso Simple`.

Luego selecciona la dificultad: `Facil`, `Medio` o `Dificil`.

En `Enunciado de la pregunta`, escribe una afirmacion clara. Por ejemplo: `La capital constitucional
de Bolivia es Sucre`.

En `Respuesta correcta`, marca `A. Verdadero` si la afirmacion es verdadera o `B. Falso` si la
afirmacion es falsa.

Si necesitas apoyar la pregunta con una imagen, usa el campo `Adjuntar/Cambiar Imagen`. La imagen es
opcional y no debe superar los 5 MB.

Antes de guardar, pulsa `Previsualizar PDF` para comprobar que la pregunta se vea correctamente.

Si todo esta correcto, pulsa `Registrar Pregunta`.

La pregunta quedara registrada en el banco del `2do Parcial` y del `Grupo Teorico` seleccionado.
Finalmente, revisa que aparezca en la lista y que los conteos del banco se actualicen.

## Texto En Pantalla

- `Paso 1: Abre Banco de Preguntas`
- `Paso 2: Selecciona 2do Parcial`
- `Paso 3: Selecciona Grupo Teorico`
- `Paso 4: Nueva pregunta`
- `Tipo: Verdadero o Falso Simple`
- `Escribe una afirmacion clara`
- `A = Verdadero | B = Falso`
- `Previsualiza antes de guardar`
- `Pregunta registrada correctamente`

## Reglas Funcionales Que Deben Mostrarse

- El registro manual se habilita cuando hay `2do Parcial`, `Grupo Teorico` y asignatura activa.
- El modal muestra `Parcial Activo` y `Grupo Teorico` como campos de solo lectura.
- Para `Verdadero o Falso Simple`, las opciones son fijas:
  - `A. Verdadero`
  - `B. Falso`
- La dificultad es obligatoria para esta pregunta.
- El enunciado es obligatorio.
- La respuesta correcta es obligatoria.
- La imagen es opcional y admite hasta 5 MB.
- `Previsualizar PDF` se habilita cuando el formulario cumple las validaciones.
- `Registrar Pregunta` guarda la pregunta mediante el endpoint `/banco-preguntas`.
- El sistema evita duplicados por enunciado dentro del mismo grupo y parcial de `2do Parcial`.

## Ejemplo Para El Tutorial

```txt
Tipo de Pregunta:
Verdadero o Falso Simple

Dificultad:
Facil

Enunciado:
La capital constitucional de Bolivia es Sucre.

Respuesta correcta:
A. Verdadero
```

## Indicaciones Visuales Para Remotion

- Usar formato horizontal 16:9, 1920x1080.
- Estilo institucional limpio: blanco, azul, deep-purple y verde para acciones positivas.
- Animar un cursor o foco circular sobre:
  - tab `Banco de Preguntas`
  - selector `2do Parcial`
  - selector `Grupo Teorico`
  - boton `Nueva pregunta`
  - selector `Tipo de Pregunta`
  - campo `Enunciado de la pregunta`
  - opciones `A. Verdadero` y `B. Falso`
  - boton `Previsualizar PDF`
  - boton `Registrar Pregunta`
- Usar zoom suave en el modal cuando se expliquen los campos.
- Mostrar una barra de progreso inferior con los pasos del flujo.
- Mantener subtitulos sincronizados con la voz en off.

## Referencias De Codigo

- `src/pages/documentacion/AsignaturaEditPage.vue`
  - Tab `Banco de Preguntas`.
  - Boton `Nueva pregunta`.
  - Modal `Registrar Nueva Pregunta`.
  - Tipo `FALSO_VERDADERO`.
  - Opciones `A. Verdadero` y `B. Falso`.
  - Validaciones de registro manual.
- `Servidor/academico-backend/app/Http/Controllers/BancoPreguntaController.php`
  - Endpoint `POST /banco-preguntas`.
  - Normalizacion del tipo `FALSO_VERDADERO`.
  - Validacion de duplicados para `2do Parcial`.
