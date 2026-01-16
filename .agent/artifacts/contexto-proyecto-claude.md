# Contexto del Proyecto - Sistema Académico UNITEPC

Este documento contiene toda la información necesaria para entender el proyecto y continuar el desarrollo.

---

## 1. Información General

- **Nombre del Proyecto:** SisAcad (Sistema de Gestión Académica)
- **Institución:** UNITEPC - Universidad Técnica Privada Cosmos
- **Framework Frontend:** Vue 3 + Quasar 2 + Vite
- **State Management:** Pinia
- **Generación de PDFs:** jsPDF + jspdf-autotable
- **Estilos:** CSS Custom (sin TailwindCSS en producción)

---

## 2. Estructura del Proyecto

```
SisAcad/
├── src/
│   ├── assets/           # Recursos estáticos
│   ├── boot/             # Plugins de inicialización
│   ├── components/       # Componentes reutilizables
│   ├── composables/      # Composables Vue (usePermisos.js)
│   ├── css/              # Estilos globales
│   ├── layouts/          # MainLayout.vue
│   ├── pages/            # Vistas organizadas por módulo
│   │   ├── admin/        # Páginas de administración
│   │   ├── dashboards/   # Dashboards por rol
│   │   ├── docente/      # Páginas del docente
│   │   ├── documentacion/# Documentación académica
│   │   └── preguntas/    # Banco de preguntas
│   ├── router/           # Definición de rutas
│   ├── services/         # Servicios (PDF, API)
│   │   ├── carpetaDocenteService.js  # Generador de Carpeta Docente PDF
│   │   └── pdfService.js             # Utilidades PDF generales
│   └── stores/           # Stores Pinia
│       ├── asignaturas.js  # Asignaturas, unidades, temas
│       ├── asistencia.js   # Control de asistencia
│       ├── auth.js         # Autenticación y roles
│       ├── carreras.js     # Gestión de carreras
│       ├── preguntas.js    # Banco de preguntas
│       ├── roles.js        # Gestión de roles
│       ├── sedes.js        # Sedes y campus
│       ├── theme.js        # Tema oscuro/claro
│       └── usuarios.js     # Gestión de usuarios
└── package.json
```

---

## 3. Roles del Sistema

| Rol | Descripción |
|-----|-------------|
| DOCENTE | Gestiona sus asignaturas, documenta temas, crea evaluaciones |
| DIRECTOR_CARRERA | Supervisa docentes y asignaturas de su carrera |
| DIRECCION_ACADEMICA | Vista de carreras y reportes de sede |
| VICERRECTOR_SEDE | Vista general de sede |
| VICERRECTOR_NACIONAL | Vista de todas las sedes |
| ADMIN | Administración completa del sistema |
| SUPER_ADMIN | Acceso total |

---

## 4. Jerarquía de Datos

```
SEDE (Cochabamba, La Paz, El Alto...)
  └── CAMPUS (Colonial, Juan Pablo II...)
       └── CARRERA (Medicina, Sistemas, Derecho...)
            └── MATERIA/ASIGNATURA (Anatomía I, Cálculo I...)
                 └── GRUPO(s) (Grupo 1, 2, 3...)
                      └── DOCENTE asignado
```

---

## 5. Módulos Implementados (100%)

1. ✅ Autenticación y Roles
2. ✅ Dashboards por Rol (6 dashboards)
3. ✅ Documentación Académica (Asignaturas, Unidades, Temas)
4. ✅ Banco de Preguntas con importación Excel
5. ✅ Gestión de Sedes
6. ✅ Gestión de Carreras
7. ✅ Gestión de Usuarios
8. ✅ Gestión de Roles
9. ✅ Gestión de Asignaturas
10. ✅ Gestión de Grupos
11. ✅ Gestión de Docentes
12. ✅ Estadísticas
13. ✅ Configuración
14. ✅ Campus por Sede
15. ✅ Evaluaciones
16. ✅ Planificación Semestral
17. ✅ Reportes (PDF/Excel)
18. ✅ Control de Asistencia (Llamar Lista)
19. ✅ Reporte de Asistencia Grid
20. ✅ Carpeta Pedagógica Docente (PDF completo)

---

## 6. Generación de PDFs - Carpeta Docente

El servicio `carpetaDocenteService.js` genera un PDF completo con:

1. **Portada** - Logo UNITEPC, datos de asignatura
2. **Índice** - Tabla de contenidos
3. **MVP** - Misión, Visión, Perfil Profesional
4. **Horario** - Cuadro semanal
5. **Programa Analítico** - Contenidos mínimos
6. **PAC (Programa de Asignatura por Competencias)** - 13 secciones:
   - Datos Generales
   - Información Docente
   - Justificación
   - Propósito General
   - Competencias (Global + Asignatura)
   - Elementos de Competencia (E.C.1-5)
   - Estructura de Unidades de Aprendizaje (tabla por temas)
   - Metodología General
   - Sistema de Evaluación
   - Reglamento y Normativa
   - Organización y Calendario
   - Bibliografía Básica
   - Bibliografía Complementaria
7. **Cronograma** - Calendario académico
8. **Planes de Clase** - Por cada tema

### Estructura de Datos de Tema (TemaEditPage.vue)

```javascript
formTema = {
  resultado_aprendizaje: '',
  logros_esperados: [
    { 
      id, codigo, descripcion, parcial,
      indicadores: [{ id, codigo, descripcion }]
    }
  ],
  contenidos: {
    conceptual: [],      // Array de strings
    procedimental: [],   // Array de strings
    actitudinal: []      // Array de strings
  },
  estrategias: {
    metodologicas: '',
    aprendizaje: '',
    recursos: []
  },
  evaluacion: {
    formativa: { actividades: [], instrumentos: [], evidencias: [] },
    sumativa: { actividades: [], instrumentos: [], evidencias: [] }
  },
  secuencia_didactica: [],
  referencias_bibliograficas: []
}
```

---

## 7. Rutas Principales

### Admin
- `/admin/usuarios` - Gestión de usuarios
- `/admin/roles` - Gestión de roles
- `/admin/sedes` - Gestión de sedes
- `/admin/carreras` - Gestión de carreras
- `/admin/asignaturas` - Gestión de asignaturas
- `/admin/grupos` - Gestión de grupos
- `/admin/docentes` - Gestión de docentes
- `/admin/estadisticas` - Estadísticas
- `/admin/configuracion` - Configuración

### Documentación
- `/documentacion` - Lista de asignaturas
- `/documentacion/:id` - Editar asignatura (AsignaturaEditPage.vue)
- `/documentacion/:id/unidad/:unidadId/tema/:temaId` - Editar tema (TemaEditPage.vue)
- `/documentacion/:id/planificacion` - Planificación semestral

### Docente
- `/docente/asistencia` - Llamar lista
- `/docente/reporte-asistencia` - Reporte grid
- `/docente/evaluaciones` - Mis evaluaciones

---

## 8. Colores Institucionales (para PDFs)

```javascript
const COLORS = {
  morado: [102, 51, 153],    // #663399 - Encabezados
  turquesa: [0, 128, 128],   // #008080 - Acentos
  gris: [200, 200, 200]      // Fondos alternos
}
```

---

## 9. Comandos de Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# Linting
npm run lint

# Build producción
npm run build
```

---

## 10. Dependencias Principales

```json
{
  "vue": "3.5.20",
  "quasar": "^2.16.0",
  "pinia": "^3.0.4",
  "vue-router": "^4.0.0",
  "jspdf": "^4.0.0",
  "jspdf-autotable": "^5.0.7",
  "axios": "^1.13.2",
  "xlsx": "^0.18.5"
}
```

---

## 11. Trabajo Reciente (Última Sesión)

### Mejoras al PDF del PAC:
1. Estructura de tabla de Datos Generales con 5 columnas y colSpan
2. Eliminación de textos de relleno (campos vacíos = en blanco)
3. Mapeo de datos reales desde la estructura del tema:
   - `contenidos.conceptual/procedimental/actitudinal` → columnas de Aprendizajes
   - `logros_esperados[].indicadores` → Criterios de Desempeño
   - `evaluacion.sumativa.instrumentos` → Instrumentos de Evaluación
4. Corrección de errores de ESLint (variables no utilizadas)

### Archivos Modificados:
- `src/services/carpetaDocenteService.js` - Reescrita función `generarPAC()`
- `src/stores/asignaturas.js` - Mock data actualizado

---

## 12. Próximos Pasos Sugeridos

1. Conectar con API backend real (actualmente usa mock data)
2. Agregar autenticación JWT
3. Implementar persistencia de datos de temas
4. Pruebas E2E con Cypress
5. Despliegue a producción

---

*Documento generado el 16/01/2026. Para compartir con otro asistente de IA.*
