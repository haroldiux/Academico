# Documentacion Tecnica de Endpoints (Incremental)

Este documento servira como referencia viva y verificada de los endpoints del sistema. Se actualizara modulo por modulo conforme se verifique contra el Frontend desplegado.

---


El frontend envía estos campos. El backend los mapea internamente a las columnas correctas.

> > > > > > > bb0efec01818361c4ce30bc06a0acd28515648ff

```json
{
  "sigla": "SIS-301",
  "descripcion": "Introduccion a...",
  "objetivo_general": "Desarrollar competencias...", // Se guarda en 'proposito_general'
  "justificacion": "La ingeniería...",
  "saberes_previos": "Programación I...", // Se guarda en 'requisitos'
  "contenido_minimo": "Ciclo de vida...",
  "metodologia_ensenanza": "Clases magistrales...", // Se guarda en 'metodologia_general'
  "criterios_evaluacion": "Exámenes...", // Se guarda en 'sistema_evaluacion'
  "horas_teoricas": 40,
  "horas_practicas": 20,
  "horas_laboratorio": 20
}
```

### 1.2 Editar Tema Completo (Unificado)


Este endpoint permite guardar todos los datos del formulario de un tema: contenidos, estrategias, evaluaciones y bibliografía.


- **Metodo:** `PUT`
- **URL:** `/api/planificacion/temas/{ID}/contenido`
- **Controlador:** `PlanificacionController@updateTema`

#### Payload (JSON Request)


Estructura exacta que envía el Frontend (`formTema`):


```json
{
  "contenidos": {
    "conceptual": ["Concepto 1", "Concepto 2"], // Array de Strings
    "procedimental": ["Procedimiento 1"], // Array de Strings
    "actitudinal": ["Actitud 1"] // Array de Strings
  },
  "estrategias": {
    "metodologicas": "Explicación magistral...", // Texto (TextArea)
    "aprendizaje": "El estudiante resume...", // Texto (TextArea)
    "recursos": ["Proyector", "Pizarra"] // Array de Strings
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


### 1.3 Secuencia Didáctica

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


### 2.1 Listar Carreras (Con Filtros y Estadísticas)

> > > > > > > Retorna la lista de carreras activas, incluyendo contadores de asignaturas y docentes.

- **Metodo:** `GET`
- **URL:** `/api/carreras`
- **Parámetros (Query):**
  - `sede_id` (Opcional): ID de la sede para filtrar (Ej: `1` para Cochabamba).
- **Controlador:** `CarreraController@index`

#### Respuesta (JSON)

Formato exacto esperado por el Store `carreras.js`.

```json
[
  {
    "id": 1,
    "nombre": "Ingeniería de Sistemas",
    "codigo": "SIS", // Usado en las tarjetas
    "sede_id": 1, // Mapeado a partir del branchCode (CBA -> 1)
    "activo": true,
    "asignaturas_count": 45, // Contador real de base de datos local
    "docentes_count": 12 // Contador real (basado en asignaturas vinculadas)
  }
]
```

---


Recupera la configuración de calendario, los horarios semanales y la lista de sesiones generadas (si existen).


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


### 3.2 Guardar Configuración y Horarios

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


### 3.3 Guardar Planificación (Sesiones)

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


## Módulo 4: Gestión de Bibliografía

**Estado de Verificación:** 🔄 COMPLETADO
**Archivo Frontend Referencia:** `Academico/src/pages/documentacion/AsignaturaEditPage.vue` (Sección Bibliografía)


Gestion maestra de libros y recursos de la asignatura.


### 4.1 CRUD Bibliografía


- **Listar:** `GET /api/bibliografias?asignatura_id={ID}`
- **Crear:** `POST /api/bibliografias`
- **Actualizar:** `PUT /api/bibliografias/{ID}`
- **Eliminar:** `DELETE /api/bibliografias/{ID}`

#### Payload (JSON)


Campos soportados según la vista "Nueva Bibliografía":


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


## Módulo 5: Unidades y Logros de Aprendizaje

**Estado de Verificación:** 🔄 COMPLETADO
**Archivo Frontend Referencia:** `Academico/src/pages/documentacion/AsignaturaEditPage.vue` (Sección Unidades)


Gestion de la estructura curricular, logros esperados e indicadores.


El sistema sincroniza automáticamente los códigos de la API con los IDs del Frontend:


- `CBA`, `CBB` -> **1** (Cochabamba)
- `LPZ` -> **2** (La Paz)
- `SCZ` -> **3** (Santa Cruz)
- (Resto de sedes mapeadas secuencialmente)
