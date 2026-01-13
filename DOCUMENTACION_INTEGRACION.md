# Documentación Técnica - Sistema Académico UNITEPC (SisAcad)

Este documento sirve como guía para el equipo de integración y desarrollo backend, detallando la arquitectura frontend, tecnologías utilizadas, y el estado actual del proyecto.

## 1. Stack Tecnológico

El frontend está construido utilizando tecnologías modernas para garantizar rendimiento y escalabilidad:

- **Framework Principal**: [Quasar Framework](https://quasar.dev/) (v2.16.x) con Vue.js 3.
- **Build Tool**: Vite.
- **Lenguaje**: JavaScript (ES Modules).
- **Gestión de Estado**: Pinia.
- **Estilos**: TailwindCSS v4 + Clases de utilidad de Quasar + CSS Variables.
- **Cliente HTTP**: Axios.
- **Generación de Documentos**: jspdf, jspdf-autotable, xlsx.

## 2. Estructura del Proyecto

La estructura sigue las convenciones estándar de Quasar con Vite:

```
src/
├── boot/           # Inicialización de librerías (e.g., axios, pinia)
├── components/     # Componentes Vue reutilizables
├── composables/    # Lógica reutilizable (Vue Composables)
├── css/            # Estilos globales (app.css, tailwind base)
├── layouts/        # Plantillas principales (MainLayout, etc.)
├── pages/          # Vistas de la aplicación
│   ├── admin/      # Gestión de administradores (CRUDs)
│   ├── dashboards/ # Pantallas de inicio por rol
│   ├── docente/    # Funcionalidades específicas de docentes
│   └── ...
├── router/         # Configuración de Vue Router
├── services/       # Capa de comunicación con API (o Mocks)
└── stores/         # Stores de Pinia para estado global
```

## 3. Arquitectura y Navegación

### Roles y Permisos
El sistema maneja múltiples roles, definidos en las rutas (`src/router/routes.js`) mediante meta-tags. Los roles principales identificados son:
- **DOCENTE**: Acceso a gestión de asistencia, evaluaciones y carpeta docente.
- **DIRECTOR_CARRERA**: Supervisión de carrera.
- **DIRECCION_ACADEMICA**: Gestión académica.
- **VICERRECTOR_SEDE / NACIONAL**: Vistas gerenciales.
- **ADMIN**: Configuración total del sistema (Usuarios, Roles, Sedes, etc.).

### Rutas Clave
- `/` -> Login / Dashboard principal.
- `/docente/*` -> Módulos para docentes.
- `/admin/*` -> ABMs y configuraciones.
- `/documentacion/*` -> Módulo de gestión documental académica.
- `/vicerrector-sede/*` -> Panel Vicerrector Sede.
- `/vicerrector/*` -> Panel Vicerrector Nacional.

## 4. Gestión de Estado (Stores)

Se utiliza **Pinia** para manejar la información transversal. Los stores principales ubicados en `src/stores/` incluyen:
- `auth.js`: Autenticación y datos del usuario actual.
- `roles.js`, `usuarios.js`: Gestión de usuarios y perfiles.
- `asignaturas.js`, `carreras.js`: Datos académicos.
- `carpetaDocenteService.js` (Service/Store híbrido): Maneja la lógica compleja de documentos académicos.

## 5. Integración con Backend (Próximos Pasos)

Actualmente, el frontend simula ciertas respuestas o estructura los datos esperando una API RESTful.

### Puntos de Integración Requeridos:
El equipo de backend (Laravel 12) deberá proveer endpoints para:
1.  **Autenticación**: Login, Refresh Token, User Profile.
2.  **Gestión de Usuarios**: CRUD completo con asignación de roles.
3.  **Académico**:
    *   Sedes, Carreras, Asignaturas, Grupos.
    *   Asignación Docente-Grupo.
4.  **Procesos Docentes**:
    *   Registro de Asistencia (diaria/por clase).
    *   Gestión de Evaluaciones y Notas.
5.  **Reportes**: Endpoints optimizados para data de reportes (json) para generar PDFs en cliente o descarga directa.

## 6. Configuración de Desarrollo

### Requisitos Previos
- Node.js (v20 o superior recomendado).
- NPM.

### Comandos
```bash
# Instalar dependencias
npm install

# Levantar servidor de desarrollo
npm run dev
# o
quasar dev

# Construir para producción
npm run build
```

## 7. Notas Adicionales
- Se está migrando/utilizando TailwindCSS v4 junto con los estilos de Quasar.
- El sistema incluye generación de PDFs en el cliente usando `jspdf`.
