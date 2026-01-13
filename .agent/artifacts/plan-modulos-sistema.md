# Plan de Implementación - Sistema Académico UNITEPC

## Estado Actual del Sistema (Actualizado: 10/01/2026)

### ✅ Módulos Implementados:
1. **Autenticación y Roles** - auth.js, RolSwitcher
2. **Dashboards por Rol** - 6 dashboards (Docente, Director Carrera, Dir. Académica, Vicerrector Sede, Vicerrector Nacional, Admin)
3. **Documentación Académica** - Asignaturas, Unidades, Temas
4. **Banco de Preguntas** - Importación Excel, CRUD preguntas
5. **Gestión de Sedes** - SedesPage.vue ✅
6. **Gestión de Carreras** - CarrerasPage.vue ✅
7. **Gestión de Usuarios** - UsuariosPage.vue ✅
8. **Gestión de Roles** - RolesPage.vue ✅
9. **Gestión de Asignaturas** - AsignaturasPage.vue ✅
10. **Gestión de Grupos** - GruposPage.vue ✅ (reestructurado por materia)
11. **Gestión de Docentes** - DocentesPage.vue ✅
12. **Estadísticas** - EstadisticasPage.vue ✅
13. **Configuración** - ConfiguracionPage.vue ✅
14. **Campus por Sede** - Store de sedes actualizado ✅
15. **Evaluaciones** - EvaluacionesPage.vue ✅
16. **Planificación Semestral** - PlanificacionPage.vue ✅ (con horario y unidades desde documentación)
17. **Reportes** - ReportesPage.vue ✅ (por docente, carrera, sede + exportación PDF/Excel)
18. **Llamar Lista (Asistencia)** - AsistenciaPage.vue ✅
19. **Reporte de Asistencia Grid** - ReporteAsistenciaPage.vue ✅ (grid estudiantes x clases)
20. **Carpeta Pedagógica Docente PDF** - carpetaDocenteService.js ✅ (Portada, Índice, MVP, Horarios, PA, PAC, Cronograma, Planes de Clase)

### 🎉 SISTEMA COMPLETO + MEJORAS
Todos los módulos principales implementados. Mejoras recientes en asistencia y generación de PDFs.

## Estructura de Datos (Jerarquía)

```
SEDE (Cochabamba, La Paz, El Alto, Ivirgarzama...)
  └── CAMPUS (Colonial, Juan Pablo II, Florida...) - 1 o más por sede
       └── CARRERA (Medicina, Sistemas, Derecho...)
            └── MATERIA (Anatomía I, Cálculo I...) - específica de la carrera
                 └── GRUPO(s) (1, 2, 3, 4...) - una materia tiene varios grupos
                      └── DOCENTE asignado
```

Ver más detalles en: `estructura-datos.md`

---

## Rutas Implementadas:

### Admin
- `/admin/usuarios` - Gestión de usuarios
- `/admin/roles` - Gestión de roles
- `/admin/sedes` - Gestión de sedes
- `/admin/carreras` - Gestión de carreras
- `/admin/asignaturas` - Gestión de asignaturas
- `/admin/grupos` - Gestión de grupos por materia
- `/admin/docentes` - Gestión de docentes
- `/admin/estadisticas` - Estadísticas del sistema
- `/admin/configuracion` - Configuración general

### Documentación
- `/documentacion` - Vista de asignaturas
- `/documentacion/asignatura/:id` - Detalle de asignatura con unidades y temas
- `/documentacion/banco-preguntas/:id` - Banco de preguntas por tema

### Dashboards
- `/docente/dashboard` - Dashboard de docente
- `/director-carrera/dashboard` - Dashboard de director de carrera
- `/direccion-academica/dashboard` - Dashboard de dirección académica
- `/vicerrector-sede/dashboard` - Dashboard de vicerrector de sede
- `/vicerrector-nacional/dashboard` - Dashboard de vicerrector nacional
- `/admin/dashboard` - Dashboard de administrador

---

## Navegación por Rol:

### DOCENTE
- Dashboard
- Mis Asignaturas
- Documentación
- Banco de Preguntas
- Mi Perfil

### DIRECTOR DE CARRERA
- Dashboard
- Docentes de mi Carrera
- Asignaturas
- Grupos
- Documentación
- Reportes de Carrera

### DIRECCIÓN ACADÉMICA
- Dashboard
- Vista Carreras (solo lectura)
- Reportes de Sede
- Estadísticas

### VICERRECTOR SEDE
- Dashboard
- Vista General Sede
- Reportes
- Estadísticas

### VICERRECTOR NACIONAL
- Dashboard Nacional
- Todas las Sedes
- Todas las Carreras
- Reportes Nacionales
- Estadísticas Nacionales

### ADMIN / SUPER ADMIN
- Dashboard
- Usuarios
- Roles
- Sedes
- Carreras
- Asignaturas
- Grupos
- Docentes
- Documentación
- Estadísticas
- Configuración
