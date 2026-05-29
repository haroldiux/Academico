# Documentacion Tecnica de Endpoints (Incremental)

Este documento servira como referencia viva y verificada de los endpoints del sistema. Se actualizara modulo por modulo conforme se verifique contra el Frontend desplegado.

---

<<<<<<< HEAD

## Modulo 1: Asignaturas y Planificacion

**Estado de Verificacion:** [COMPLETADO] COMPLETADO PARCIAL (Detalles + Temas)
**Archivo Frontend Referencia:** `Academico/src/pages/documentacion/AsignaturaEditPage.vue`

### 1.1 Detalles de Asignatura (Informacion General)

# Permite editar la informacion base, incluyendo campos extendidos que no vienen de la API.

## Módulo 1: Asignaturas y Planificación

**Estado de Verificación:** ✅ COMPLETADO PARCIAL (Detalles + Temas)
**Archivo Frontend Referencia:** `Academico/src/pages/documentacion/AsignaturaEditPage.vue`

### 1.1 Detalles de Asignatura (Información General)

Permite editar la información base, incluyendo campos extendidos que no vienen de la API.

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

- **Metodo:** `PUT`
- **URL:** `/api/asignaturas/{ID}`
- **Controlador:** `AsignaturaController@update`

#### Payload (JSON Request)

<<<<<<< HEAD
El frontend envia estos campos. El backend los mapea internamente a las columnas correctas.
=======

El frontend envía estos campos. El backend los mapea internamente a las columnas correctas.

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

```json
{
  "sigla": "SIS-301",
  "descripcion": "Introduccion a...",
  "objetivo_general": "Desarrollar competencias...", // Se guarda en 'proposito_general'
<<<<<<< HEAD
  "justificacion": "La ingenieria...",
  "saberes_previos": "Programacion I...",            // Se guarda en 'requisitos'
  "contenido_minimo": "Ciclo de vida...",
  "metodologia_ensenanza": "Clases magistrales...",  // Se guarda en 'metodologia_general'
  "criterios_evaluacion": "Examenes...",             // Se guarda en 'sistema_evaluacion'
=======
  "justificacion": "La ingeniería...",
  "saberes_previos": "Programación I...", // Se guarda en 'requisitos'
  "contenido_minimo": "Ciclo de vida...",
  "metodologia_ensenanza": "Clases magistrales...", // Se guarda en 'metodologia_general'
  "criterios_evaluacion": "Exámenes...", // Se guarda en 'sistema_evaluacion'
>>>>>>> bb0efec01818361c4ce30bc06a0acd28515648ff
  "horas_teoricas": 40,
  "horas_practicas": 20,
  "horas_laboratorio": 20
}
```

### 1.2 Editar Tema Completo (Unificado)

<<<<<<< HEAD
Este endpoint permite guardar todos los datos del formulario de un tema: contenidos, estrategias, evaluaciones y bibliografia.
=======

Este endpoint permite guardar todos los datos del formulario de un tema: contenidos, estrategias, evaluaciones y bibliografía.

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

- **Metodo:** `PUT`
- **URL:** `/api/planificacion/temas/{ID}/contenido`
- **Controlador:** `PlanificacionController@updateTema`

#### Payload (JSON Request)

<<<<<<< HEAD
Estructura exacta que envia el Frontend (`formTema`):
=======

Estructura exacta que envía el Frontend (`formTema`):

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

```json
{
  "contenidos": {
    "conceptual": ["Concepto 1", "Concepto 2"], // Array de Strings
    "procedimental": ["Procedimiento 1"], // Array de Strings
    "actitudinal": ["Actitud 1"] // Array de Strings
  },
  "estrategias": {
<<<<<<< HEAD
    "metodologicas": "Explicacion magistral...",    // Texto (TextArea)
    "aprendizaje": "El estudiante resume...",       // Texto (TextArea)
    "recursos": ["Proyector", "Pizarra"]            // Array de Strings
=======
    "metodologicas": "Explicación magistral...", // Texto (TextArea)
    "aprendizaje": "El estudiante resume...", // Texto (TextArea)
    "recursos": ["Proyector", "Pizarra"] // Array de Strings
>>>>>>> bb0efec01818361c4ce30bc06a0acd28515648ff
  },
  "evaluacion": {
    "formativa": {
      "actividades": ["Debate"], // Array (Select Multiple)
      "instrumentos": ["Lista de Cotejo"], // Array (Select Multiple)
      "evidencias": ["Informe"] // Array (Select Multiple)
    },
    "sumativa": {
      "actividades": ["Examen Final"],
      "instrumentos": ["Rubrica"],
      "evidencias": ["Examen Escrito"]
    }
  },
  "referencias_bibliograficas": [
    {
      "bibliografia_id": 15, // ID de la tabla `bibliografias`
      "pagina_desde": 10, // Entero
      "pagina_hasta": 25 // Entero
    }
  ]
}
```

#### Tablas en Base de Datos

- **`temas`**:
  - `contenido_conceptual` (JSON)
  - `contenido_procedimental` (JSON)
  - `contenido_actitudinal` (JSON)
  - `estrategias_metodologicas` (TEXT)
  - `estrategias_aprendizaje` (TEXT)
  - `estrategias_recursos` (JSON)
  - `evaluacion_formativa` (JSON)
  - `evaluacion_sumativa` (JSON)
- **`tema_bibliografia`** (Pivot):
  - `tema_id`
  - `bibliografia_id`
  - `pagina_desde`
  - `pagina_hasta`

---

### 1.2 Obtener Datos del Tema

Recupera el objeto completo para poblar la vista.

- **Metodo:** `GET`
- **URL:** `/api/planificacion/temas/{ID}/full`
- **Respuesta:** Mismo formato JSON que el Payload de envio, mas IDs y timestamps.

---

<<<<<<< HEAD

### 1.3 Secuencia Didactica

=======

### 1.3 Secuencia Didáctica

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff
> > > > > > > Endpoints para gestionar los "momentos" de la clase (Inicio, Desarrollo, Cierre).

- **Crear Momento:** `POST /api/planificacion/temas/{ID}/secuencias`
  - Payload: `{ "momento": "INICIO", "actividad": "...", "duracion_minutos": 15 }`
- **Eliminar Momento:** `DELETE /api/planificacion/secuencias/{ID}`
- **Tabla:** `secuencias_temas`

---

### 1.4 Banco de Preguntas

Endpoints para gestionar preguntas asociadas a Logros Esperados.

- **Importar Excel:** `POST /api/banco-preguntas/import`
  - Payload (Multipart): `file` (.xlsx), `logro_esperado_id`.
- **Listar:** `GET /api/banco-preguntas?logro_id={ID}`
- **Tabla:** `banco_preguntas`

---

<<<<<<< HEAD

## Modulo 2: Gestion de Carreras (Dashboard)

# **Estado de Verificacion:** [COMPLETADO] COMPLETADO

## Módulo 2: Gestión de Carreras (Dashboard)

**Estado de Verificación:** ✅ COMPLETADO

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff
> > > > > > > **Archivo Frontend Referencia:** `Academico/src/pages/admin/CarrerasPage.vue`

Este modulo funciona en modo **Sincronizacion Hibrida**. Al consultar la lista, el backend recupera datos frescos de la API University, actualiza la base de datos local y devuelve los registros locales enriquecidos con contadores y estados.

<<<<<<< HEAD

### 2.1 Listar Carreras (Con Filtros y Estadisticas)

=======

### 2.1 Listar Carreras (Con Filtros y Estadísticas)

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff
> > > > > > > Retorna la lista de carreras activas, incluyendo contadores de asignaturas y docentes.

- **Metodo:** `GET`
- **URL:** `/api/carreras`
  <<<<<<< HEAD
- **Parametros (Query):** - `sede_id` (Opcional): ID de la sede para filtrar (Ej: `1` para Cochabamba).
  =======
- **Parámetros (Query):**
  - `sede_id` (Opcional): ID de la sede para filtrar (Ej: `1` para Cochabamba).
    > > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff
- **Controlador:** `CarreraController@index`

#### Respuesta (JSON)

Formato exacto esperado por el Store `carreras.js`.

```json
[
  {
    "id": 1,
<<<<<<< HEAD
    "nombre": "Ingenieria de Sistemas",
    "codigo": "SIS",            // Usado en las tarjetas
    "sede_id": 1,              // Mapeado a partir del branchCode (CBA -> 1)
=======
    "nombre": "Ingeniería de Sistemas",
    "codigo": "SIS", // Usado en las tarjetas
    "sede_id": 1, // Mapeado a partir del branchCode (CBA -> 1)
>>>>>>> bb0efec01818361c4ce30bc06a0acd28515648ff
    "activo": true,
    "asignaturas_count": 45, // Contador real de base de datos local
    "docentes_count": 12 // Contador real (basado en asignaturas vinculadas)
  }
]
```

---

<<<<<<< HEAD

## Modulo 3: Planificacion Semestral (Nuevo)

# **Estado de Verificacion:** [EN_PROGRESO] EN PROGRESO (Backend Listo)

## Módulo 3: Planificación Semestral (Nuevo)

**Estado de Verificación:** 🔄 EN PROGRESO (Backend Listo)

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff
> > > > > > > **Archivo Frontend Referencia:** `Academico/src/pages/documentacion/PlanificacionPage.vue`

Este modulo maneja la distribucion de temas en el tiempo (Generador Automatico).

### 3.1 Obtener Estado Completo

<<<<<<< HEAD
Recupera la configuracion de calendario, los horarios semanales y la lista de sesiones generadas (si existen).
=======

Recupera la configuración de calendario, los horarios semanales y la lista de sesiones generadas (si existen).

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

- **Metodo:** `GET`
- **URL:** `/api/planificacion-semestral/{asignaturaId}`
- **Respuesta:**
  ```json
  {
    "config": {
      "fecha_inicio_clases": "2026-02-09",
      "fecha_fin_clases": "2026-06-27",
      "gestion_academica": "2026-I"
    },
    "horarios": [{ "dia": "Martes", "hora_inicio": "07:00", "hora_fin": "09:00", "aula": "301" }],
    "planificacion": [
      { "numero_sesion": 1, "fecha": "2026-02-10", "tema": "Intro", "contenido_conceptual": "..." }
    ]
  }
  ```

<<<<<<< HEAD

### 3.2 Guardar Configuracion y Horarios

=======

### 3.2 Guardar Configuración y Horarios

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff
> > > > > > > Guarda las fechas del semestre y los horarios de clase (Lunes, Martes...).

- **Metodo:** `POST`
- **URL:** `/api/planificacion-semestral/{asignaturaId}/config`
- **Payload:**
  ```json
  {
    "fecha_inicio_clases": "2026-02-09",
    "fecha_fin_clases": "2026-06-27",
    "gestion_academica": "2026-I",
    "horarios": [{ "dia": "Martes", "hora_inicio": "07:00", "hora_fin": "09:00", "aula": "301" }]
  }
  ```

<<<<<<< HEAD

### 3.3 Guardar Planificacion (Sesiones)

=======

### 3.3 Guardar Planificación (Sesiones)

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff
> > > > > > > Guarda (sobrescribe) el listado de sesiones generado o editado en el grid.

- **Metodo:** `POST`
- **URL:** `/api/planificacion-semestral/{asignaturaId}/sesiones`
- **Payload:**
  ```json
  {
    "sesiones": [
      {
        "numeroGlobal": 1,
        "fecha": "10/02/26",
        "semana": 1,
        "periodoExamen": null,
        "conceptual": "Texto editable...",
        "procedimental": "Texto editable...",
        "actitudinal": "Texto editable...",
        "criteriosDesempeno": "...",
        "instrumentosEvaluacion": "..."
  ```

<<<<<<< HEAD

### 3.4 Generar Planificacion Automatica

Genera 20 semanas de sesiones basado en el calendario y horario de la asignatura.
**Logica de Negocio:**

- # Detecta automaticamente las semanas de examen: **Sem 7-8 (1er Parcial)**, **Sem 14-15 (2do Parcial)**, **Sem 18-19 (Final)**, **Sem 20 (2da Instancia)**.

### 3.4 Generar Planificación Automática

Genera 20 semanas de sesiones basado en el calendario y horario de la asignatura.
**Lógica de Negocio:**

- Detecta automáticamente las semanas de examen: **Sem 7-8 (1er Parcial)**, **Sem 14-15 (2do Parcial)**, **Sem 18-19 (Final)**, **Sem 20 (2da Instancia)**.
  > > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff
- En semanas de examen, no se crea contenido, solo se marca el periodo.

- **Metodo:** `POST`
- **URL:** `/api/planificacion-semestral/{asignaturaId}/generar`
- **Respuesta:** `{ "message": "Planificacion generada", "total": 45 }`

<<<<<<< HEAD

### 3.5 Copiar Planificacion (Unificacion)

# Permite importar el **contenido** (temas, metodologias, evaluaciones) de otra asignatura (ej: Grupo 1 -> Grupo 2), manteniendo las fechas del grupo destino.

### 3.5 Copiar Planificación (Unificación)

Permite importar el **contenido** (temas, metodologías, evaluaciones) de otra asignatura (ej: Grupo 1 -> Grupo 2), manteniendo las fechas del grupo destino.

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

- **Metodo:** `POST`
- **URL:** `/api/planificacion-semestral/{asignaturaId}/copiar`
- **Payload:**
  ```json
  {
    "source_asignatura_id": 5 // ID de la asignatura "Master" o fuente
  }
  ```

<<<<<<< HEAD

### 3.4 Generar Planificacion Automatica

Genera 20 semanas de sesiones basado en el calendario y horario de la asignatura.
**Logica de Negocio:**

- # Detecta automaticamente las semanas de examen: **Sem 7-8 (1er Parcial)**, **Sem 14-15 (2do Parcial)**, **Sem 18-19 (Final)**, **Sem 20 (2da Instancia)**.

### 3.4 Generar Planificación Automática

Genera 20 semanas de sesiones basado en el calendario y horario de la asignatura.
**Lógica de Negocio:**

- Detecta automáticamente las semanas de examen: **Sem 7-8 (1er Parcial)**, **Sem 14-15 (2do Parcial)**, **Sem 18-19 (Final)**, **Sem 20 (2da Instancia)**.
  > > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff
- En semanas de examen, no se crea contenido, solo se marca el periodo.

- **Metodo:** `POST`
- **URL:** `/api/planificacion-semestral/{asignaturaId}/generar`
- **Respuesta:** `{ "message": "Planificacion generada", "total": 45 }`

<<<<<<< HEAD

### 3.5 Copiar Planificacion (Unificacion)

# Permite importar el **contenido** (temas, metodologias, evaluaciones) de otra asignatura (ej: Grupo 1 -> Grupo 2), manteniendo las fechas del grupo destino.

### 3.5 Copiar Planificación (Unificación)

Permite importar el **contenido** (temas, metodologías, evaluaciones) de otra asignatura (ej: Grupo 1 -> Grupo 2), manteniendo las fechas del grupo destino.

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

- **Metodo:** `POST`
- **URL:** `/api/planificacion-semestral/{asignaturaId}/copiar`
- **Payload:**
  ```json
  {
    "source_asignatura_id": 5 // ID de la asignatura "Master" o fuente
  }
  ```

---

<<<<<<< HEAD

## Modulo 4: Gestion de Bibliografia

**Estado de Verificacion:** [EN_PROGRESO] COMPLETADO
**Archivo Frontend Referencia:** `Academico/src/pages/documentacion/AsignaturaEditPage.vue` (Seccion Bibliografia)
=======

## Módulo 4: Gestión de Bibliografía

**Estado de Verificación:** 🔄 COMPLETADO
**Archivo Frontend Referencia:** `Academico/src/pages/documentacion/AsignaturaEditPage.vue` (Sección Bibliografía)

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

Gestion maestra de libros y recursos de la asignatura.

<<<<<<< HEAD

### 4.1 CRUD Bibliografia

=======

### 4.1 CRUD Bibliografía

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

- **Listar:** `GET /api/bibliografias?asignatura_id={ID}`
- **Crear:** `POST /api/bibliografias`
- **Actualizar:** `PUT /api/bibliografias/{ID}`
- **Eliminar:** `DELETE /api/bibliografias/{ID}`

#### Payload (JSON)

<<<<<<< HEAD
Campos soportados segun la vista "Nueva Bibliografia":
=======

Campos soportados según la vista "Nueva Bibliografía":

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

```json
{
  "asignatura_id": 1,
  "titulo": "Ingenieria del Software",
  "autor": "Roger Pressman",
  "editorial": "McGraw Hill",
  "edicion": "8va Edicion",
  "anio": "2015",
  "tipo": "Basica", // Select: Basica | Complementaria
  "isbn": "978-1234567890", // Opcional (Nullable en BD)
  "paginas": "100-150" // Opcional. Texto libre.
}
```

> **Nota:** El campo `paginas` es referencial. El detalle exacto se gestiona en el Plan de Clase. El `isbn` tambien es opcional.

---

<<<<<<< HEAD

## Modulo 5: Unidades y Logros de Aprendizaje

**Estado de Verificacion:** [EN_PROGRESO] COMPLETADO
**Archivo Frontend Referencia:** `Academico/src/pages/documentacion/AsignaturaEditPage.vue` (Seccion Unidades)
=======

## Módulo 5: Unidades y Logros de Aprendizaje

**Estado de Verificación:** 🔄 COMPLETADO
**Archivo Frontend Referencia:** `Academico/src/pages/documentacion/AsignaturaEditPage.vue` (Sección Unidades)

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

Gestion de la estructura curricular, logros esperados e indicadores.

<<<<<<< HEAD

### 5.0 Gestion Detalles de Unidad

# Editar el "Elemento de Competencia" o descripcion de la unidad.

### 5.0 Gestión Detalles de Unidad

Editar el "Elemento de Competencia" o descripción de la unidad.

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

- **URL:** `PUT /api/planificacion/unidades/{ID}`
- **Payload:** `{ "objetivo": "Analiza e interpreta los fundamentos..." }`

<<<<<<< HEAD

### 5.1 Gestion de Logros Esperados

# Cada tema tiene multiples logros. Ahora incluye el "Periodo" o parcial.

### 5.1 Gestión de Logros Esperados

Cada tema tiene múltiples logros. Ahora incluye el "Periodo" o parcial.

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

- **Crear Logro:** `POST /api/planificacion/temas/{ID}/logros`
- **Eliminar:** `DELETE /api/planificacion/logros/{ID}`

#### Payload (JSON)

```json
{
<<<<<<< HEAD
  "descripcion": "Define correctamente el concepto de ingenieria...",
  "tipo_logro": "Saber",          // Saber | Hacer | Ser
  "periodo": "1er Parcial"        // Nuevo Campo: Periodo de evaluacion al que pertenece
}
```

### 5.2 Gestion de Indicadores

# Cada logro tiene multiples indicadores de evidencia.

"descripcion": "Define correctamente el concepto de ingeniería...",
"tipo_logro": "Saber", // Saber | Hacer | Ser
"periodo": "1er Parcial" // Nuevo Campo: Periodo de evaluación al que pertenece
}

````

### 5.2 Gestión de Indicadores

Cada logro tiene múltiples indicadores de evidencia.
>>>>>>> bb0efec01818361c4ce30bc06a0acd28515648ff

- **Crear Indicador:** `POST /api/planificacion/logros/{ID}/indicadores`
- **Payload:** `{ "descripcion": "Explica con precision..." }`
- **Eliminar:** `DELETE /api/planificacion/indicadores/{ID}`

---

<<<<<<< HEAD
## Modulo 6: Banco de Preguntas
**Estado de Verificacion:** [EN_PROGRESO] COMPLETADO
=======
## Módulo 6: Banco de Preguntas

**Estado de Verificación:** 🔄 COMPLETADO
>>>>>>> bb0efec01818361c4ce30bc06a0acd28515648ff
**Archivo Frontend Referencia:** `Academico/src/pages/documentacion/BancoPreguntasPage.vue`

Gestion de preguntas vinculadas a un Logro Esperado especifico. Soporta carga masiva.

### 6.1 CRUD Preguntas

- **Listar:** `GET /api/banco-preguntas?logro_id={ID}`
- **Crear:** `POST /api/banco-preguntas`
- **Eliminar:** `DELETE /api/banco-preguntas/{ID}`

#### Payload (JSON)

Coincide con el formulario "Nueva Pregunta".

```json
{
  "logro_esperado_id": 15,
<<<<<<< HEAD
  "enunciado": "¿Cual es el objetivo principal...?",
  "tipo": "SELECCION_UNICA",   // SELECCION_UNICA | SELECCION_MULTIPLE | FALSO_VERDADERO
  "dificultad": "Media",       // Alta | Media | Baja
  "peso": 10,                  // Entero (Puntaje)
=======
  "enunciado": "¿Cuál es el objetivo principal...?",
  "tipo": "SELECCION_UNICA", // SELECCION_UNICA | SELECCION_MULTIPLE | FALSO_VERDADERO
  "dificultad": "Media", // Alta | Media | Baja
  "peso": 10, // Entero (Puntaje)
>>>>>>> bb0efec01818361c4ce30bc06a0acd28515648ff
  "opciones": [
    { "id": "A", "text": "Opcion 1" },
    { "id": "B", "text": "Opcion 2" }
  ],
<<<<<<< HEAD
  "respuesta_correcta": "B"    // ID de la opcion correcta (o Array ["A","B"] si es multiple)
  // "created_by": 1           // (Automatico) Se guarda el ID del usuario autenticado.
=======
  "respuesta_correcta": "B" // ID de la opción correcta (o Array ["A","B"] si es múltiple)
  // "created_by": 1           // (Automático) Se guarda el ID del usuario autenticado.
>>>>>>> bb0efec01818361c4ce30bc06a0acd28515648ff
}
````

### 6.2 Importar desde Excel

(Igual que antes)

---

<<<<<<< HEAD

## Modulo 7: Evaluaciones y Patron

# **Estado de Verificacion:** [EN_PROGRESO] EN PROCESO

## Módulo 7: Evaluaciones y Patrón

**Estado de Verificación:** 🔄 EN PROCESO

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff
> > > > > > > **Archivo Frontend Referencia:** `Academico/src/pages/documentacion/EvaluacionesPage.vue`

Gestion de examenes parciales, configuracion, y generacion de patrones de respuestas.

<<<<<<< HEAD

### 7.1 Crear Evaluacion (y Generar Patron Automaticamente)

# Crea la configuracion del examen y genera aleatoriamente una version "Tipo A" seleccionando preguntas de los Logros del Parcial indicado.

### 7.1 Crear Evaluación (y Generar Patrón Automaticamente)

Crea la configuración del examen y genera aleatoriamente una versión "Tipo A" seleccionando preguntas de los Logros del Parcial indicado.

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

- **Metodo:** `POST`
- **URL:** `/api/evaluaciones`
- **Payload (JSON):**
  <<<<<<< HEAD
  ```json
  {
  "asignatura_id": 5,
  "nombre": "Examen 1er Parcial - Anatomia I",
  "parcial": "1er Parcial", // Sirve para filtrar preguntas por Logro.
  "fecha_examen": "2026-03-15",
  "hora_inicio": "08:00",
  "duracion_minutos": 45,
  "mezclar_preguntas": true,
  "mezclar_opciones": true, // Para el render en linea, no afecta patron impreso salvo el orden.
        // Distribucion de Dificultad (Suma DEBE ser <= total preguntas disponibles)
        "distribucion_facil": 5,
        "distribucion_medio": 10,
        "distribucion_dificil": 5
      }
      ```
- **Respuesta:** Objeto `Evaluacion` con array `examenes_generados`.

### 7.2 Obtener Datos del Patron (PDF)

# Devuelve la estructura JSON lista para renderizar la vista "Patron de Respuestas" (Circulos A-E).

```json
{
  "asignatura_id": 5,
  "nombre": "Examen 1er Parcial - Anatomía I",
  "parcial": "1er Parcial", // Sirve para filtrar preguntas por Logro.
  "fecha_examen": "2026-03-15",
  "hora_inicio": "08:00",
  "duracion_minutos": 45,
  "mezclar_preguntas": true,
  "mezclar_opciones": true, // Para el render en linea, no afecta patrón impreso salvo el orden.

  // Distribución de Dificultad (Suma DEBE ser <= total preguntas disponibles)
  "distribucion_facil": 5,
  "distribucion_medio": 10,
  "distribucion_dificil": 5
}
```

- **Respuesta:** Objeto `Evaluacion` con array `examenes_generados`.

### 7.2 Obtener Datos del Patrón (PDF)

Devuelve la estructura JSON lista para renderizar la vista "Patrón de Respuestas" (Círculos A-E).

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

- **Metodo:** `GET`
- **URL:** `/api/examenes-generados/{id}/patron`
- **Respuesta (Ejemplo):**
  `json
  {
    "institucion": "UNIVERSIDAD TECNICA PRIVADA COSMOS",
    "asignatura": "Anatomia I",
    "examen_titulo": "1er Parcial",
    "tipo_examen": "TIPO A",
    "fecha": "2026-03-15",
    "preguntas": [
      { "numero": 1, "respuesta_correcta": "B" },
      { "numero": 2, "respuesta_correcta": "A" },
      // ... hasta la 20
    ]
  }
  `
  Carga masiva de preguntas para un logro.

- **Metodo:** `POST`
- **URL:** `/api/banco-preguntas/import`
- **Body (FormData):**
  - `file`: Archivo `.xlsx`
  - `logro_esperado_id`: ID del logro destino.

#### Mapeo de Sedes (Backend)

<<<<<<< HEAD
El sistema sincroniza automaticamente los codigos de la API con los IDs del Frontend:
=======

El sistema sincroniza automáticamente los códigos de la API con los IDs del Frontend:

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

- `CBA`, `CBB` -> **1** (Cochabamba)
- `LPZ` -> **2** (La Paz)
- `SCZ` -> **3** (Santa Cruz)
- (Resto de sedes mapeadas secuencialmente)
