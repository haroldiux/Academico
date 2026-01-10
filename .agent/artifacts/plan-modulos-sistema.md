# Plan de Implementación - Sistema Académico UNITEPC

## Estado Actual del Sistema

### ✅ Módulos Implementados:
1. **Autenticación y Roles** - auth.js, RolSwitcher
2. **Dashboards por Rol** - 6 dashboards (Docente, Director Carrera, Dir. Académica, Vicerrector Sede, Vicerrector Nacional, Admin)
3. **Documentación Académica** - Asignaturas, Unidades, Temas
4. **Banco de Preguntas** - Importación Excel, CRUD preguntas
5. **Gestión de Sedes** - SedesPage.vue
6. **Gestión de Carreras** - CarrerasPage.vue
7. **Gestión de Usuarios** - UsuariosPage.vue (pendiente verificar)
8. **Gestión de Roles** - RolesPage.vue (pendiente verificar)

### 🔧 Módulos por Implementar:

## 1. MÓDULO DE USUARIOS (Admin)
- [x] Listado de usuarios con filtros
- [ ] CRUD completo de usuarios
- [ ] Asignación de roles a usuarios
- [ ] Asignación de sede/carrera a usuarios
- [ ] Estado activo/inactivo

## 2. MÓDULO DE ROLES (Admin)
- [x] Listado de roles
- [ ] Vista de permisos por rol
- [ ] Edición de permisos (opcional)

## 3. MÓDULO DE SEDES (Admin)
- [x] Listado de sedes
- [ ] CRUD completo de sedes
- [ ] Estadísticas por sede

## 4. MÓDULO DE CARRERAS (Admin)
- [x] Listado de carreras por sede
- [ ] CRUD completo de carreras
- [ ] Asignación de director

## 5. MÓDULO DE ASIGNATURAS (Admin/Director)
- [ ] Listado de asignaturas por carrera
- [ ] CRUD de asignaturas
- [ ] Asignación de docentes
- [ ] Plan de estudios

## 6. MÓDULO DE DOCENTES (Admin/Director)
- [ ] Listado de docentes
- [ ] Asignación de grupos
- [ ] Carga horaria
- [ ] Historial de materias

## 7. MÓDULO DE GRUPOS (Director/Docente)
- [ ] Listado de grupos por carrera
- [ ] Asignación docente-grupo-materia
- [ ] Horarios

## 8. MÓDULO DE EVALUACIONES
- [ ] Configuración de evaluaciones
- [ ] Generación de exámenes desde banco de preguntas
- [ ] Aplicación de evaluaciones
- [ ] Reportes de resultados

## 9. MÓDULO DE REPORTES
- [ ] Reportes por docente
- [ ] Reportes por carrera
- [ ] Reportes por sede
- [ ] Exportación PDF/Excel

## 10. MÓDULO DE ESTADÍSTICAS
- [ ] Gráficos de progreso
- [ ] Comparativas entre sedes/carreras
- [ ] Indicadores de rendimiento

---

## Orden de Implementación Propuesto:

### Fase 1: Completar CRUD de Administración
1. UsuariosPage.vue - CRUD completo
2. RolesPage.vue - Vista de permisos
3. SedesPage.vue - CRUD completo
4. CarrerasPage.vue - CRUD completo

### Fase 2: Gestión Académica
5. AsignaturasPage.vue - Gestión de materias
6. GruposPage.vue - Gestión de grupos
7. DocentesPage.vue - Gestión de docentes

### Fase 3: Evaluaciones
8. EvaluacionesPage.vue - Configuración
9. ExamenesPage.vue - Generación de exámenes
10. ResultadosPage.vue - Resultados

### Fase 4: Reportes y Análisis
11. ReportesPage.vue - Exportación
12. EstadisticasPage.vue - Gráficos

---

## Estructura de Navegación por Rol:

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

### ADMIN
- Dashboard
- Usuarios
- Roles
- Sedes
- Carreras
- Asignaturas
- Configuración

### SUPER ADMIN
- Todo lo de Admin
- Configuración del Sistema
- Logs de Auditoría
