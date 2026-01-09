---
description: Implementación de vistas y dashboards por rol
---

# Sistema de Vistas por Roles - UNITEPC

## Resumen de Roles y Permisos

| Rol | Alcance | Permisos | Dashboard |
|-----|---------|----------|-----------|
| DOCENTE | Materias asignadas (sede + grupo) | VER + EDITAR | Personal |
| DIRECTOR_CARRERA | Materias de su carrera y sede | VER + EDITAR | Carrera |
| DIRECCION_ACADEMICA | Todas las materias de su sede | SOLO VER | Académico |
| VICERRECTOR_SEDE | Todo de su sede | SOLO VER | Ejecutivo Sede |
| VICERRECTOR_NACIONAL | Todo el sistema | VER + EDITAR | Ejecutivo Nacional |
| ADMIN | Todo + estadísticas especiales | VER TODO | Administrativo |
| SUPER_ADMIN | Control total del sistema | VER + EDITAR TODO | Super Admin |

## Estructura de Datos Requerida

### Usuario
```javascript
{
  id: number,
  nombre: string,
  email: string,
  rol: string,
  sede_id: number,      // Sede asignada
  carrera_id: number,   // Solo para DIRECTOR_CARRERA
  grupos: [],           // Para DOCENTE - grupos asignados
  materias: []          // Para DOCENTE - materias asignadas
}
```

### Sede
```javascript
{
  id: number,
  nombre: string,       // Ej: "Cochabamba", "La Paz", "Santa Cruz"
  codigo: string
}
```

### Carrera
```javascript
{
  id: number,
  nombre: string,
  codigo: string,
  sede_id: number
}
```

## Componentes a Crear

### 1. Dashboards por Rol
- `src/pages/dashboards/DocenteDashboard.vue`
- `src/pages/dashboards/DirectorCarreraDashboard.vue`
- `src/pages/dashboards/DireccionAcademicaDashboard.vue`
- `src/pages/dashboards/VicerrectorSedeDashboard.vue`
- `src/pages/dashboards/VicerrectorNacionalDashboard.vue`
- `src/pages/dashboards/AdminDashboard.vue`

### 2. Composables de Permisos
- `src/composables/usePermisos.js` - Lógica de permisos
- `src/composables/useFiltroRol.js` - Filtrado de datos por rol

### 3. Guards de Ruta
- Protección de rutas según rol
- Redirección a dashboard correspondiente

### 4. Reportes por Rol
- DOCENTE: Progreso de sus materias, pendientes
- DIRECTOR_CARRERA: Avance por materia, docentes, estadísticas carrera
- DIRECCION_ACADEMICA: Resumen sede, comparativas carreras
- VICERRECTOR: Indicadores generales, KPIs
- ADMIN: Estadísticas globales, métricas especiales

## Implementación Paso a Paso

1. Crear stores adicionales (sedes, carreras)
2. Actualizar store de usuarios con campos de rol
3. Crear composable de permisos
4. Implementar dashboards específicos
5. Configurar rutas protegidas
6. Crear componentes de reportes
