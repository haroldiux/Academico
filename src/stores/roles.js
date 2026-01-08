import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRolesStore = defineStore('roles', () => {
  // State
  const roles = ref([
    {
      id: 1,
      nombre: 'SUPER ADMIN',
      codigo: 'SUPER_ADMIN',
      descripcion: 'Acceso completo al sistema con todos los permisos administrativos',
      color: '#dc2626',
      icono: 'admin_panel_settings',
      activo: true,
      permisos: ['*'],
      fechaCreacion: '2024-01-01',
      orden: 1
    },
    {
      id: 2,
      nombre: 'ADMIN',
      codigo: 'ADMIN',
      descripcion: 'Administrador del sistema con permisos de gestión general',
      color: '#ea580c',
      icono: 'manage_accounts',
      activo: true,
      permisos: ['usuarios', 'roles', 'configuracion'],
      fechaCreacion: '2024-01-01',
      orden: 2
    },
    {
      id: 3,
      nombre: 'VICERRECTORADO',
      codigo: 'VICERRECTORADO',
      descripcion: 'Autoridad académica superior con visión global institucional',
      color: '#7c3aed',
      icono: 'school',
      activo: true,
      permisos: ['reportes', 'estadisticas', 'aprobaciones'],
      fechaCreacion: '2024-01-01',
      orden: 3
    },
    {
      id: 4,
      nombre: 'DIRECCIÓN ACADÉMICA',
      codigo: 'DIRECCION_ACADEMICA',
      descripcion: 'Gestión y supervisión de procesos académicos institucionales',
      color: '#2563eb',
      icono: 'account_balance',
      activo: true,
      permisos: ['planificacion', 'seguimiento', 'reportes'],
      fechaCreacion: '2024-01-01',
      orden: 4
    },
    {
      id: 5,
      nombre: 'DIRECTOR DE CARRERA',
      codigo: 'DIRECTOR_CARRERA',
      descripcion: 'Responsable de la gestión académica de una carrera específica',
      color: '#0891b2',
      icono: 'engineering',
      activo: true,
      permisos: ['docentes', 'estudiantes', 'horarios', 'materias'],
      fechaCreacion: '2024-01-01',
      orden: 5
    },
    {
      id: 6,
      nombre: 'DOCENTE',
      codigo: 'DOCENTE',
      descripcion: 'Personal académico encargado de la enseñanza',
      color: '#059669',
      icono: 'person',
      activo: true,
      permisos: ['notas', 'asistencia', 'materiales'],
      fechaCreacion: '2024-01-01',
      orden: 6
    },
    {
      id: 7,
      nombre: 'EVALUACIONES',
      codigo: 'EVALUACIONES',
      descripcion: 'Gestión y supervisión del sistema de evaluaciones académicas',
      color: '#ca8a04',
      icono: 'quiz',
      activo: true,
      permisos: ['evaluaciones', 'examenes', 'resultados'],
      fechaCreacion: '2024-01-01',
      orden: 7
    }
  ])

  const loading = ref(false)
  const error = ref(null)

  // Getters
  const rolesActivos = computed(() => roles.value.filter(r => r.activo))
  const totalRoles = computed(() => roles.value.length)
  const rolesOrdenados = computed(() => [...roles.value].sort((a, b) => a.orden - b.orden))

  // Actions
  function getRolById(id) {
    return roles.value.find(r => r.id === id)
  }

  function addRol(rol) {
    const nuevoId = Math.max(...roles.value.map(r => r.id)) + 1
    const nuevoOrden = Math.max(...roles.value.map(r => r.orden)) + 1
    roles.value.push({
      ...rol,
      id: nuevoId,
      orden: nuevoOrden,
      fechaCreacion: new Date().toISOString().split('T')[0]
    })
    return nuevoId
  }

  function updateRol(id, datosActualizados) {
    const index = roles.value.findIndex(r => r.id === id)
    if (index !== -1) {
      roles.value[index] = { ...roles.value[index], ...datosActualizados }
      return true
    }
    return false
  }

  function deleteRol(id) {
    const index = roles.value.findIndex(r => r.id === id)
    if (index !== -1) {
      roles.value.splice(index, 1)
      return true
    }
    return false
  }

  function toggleRolActivo(id) {
    const rol = roles.value.find(r => r.id === id)
    if (rol) {
      rol.activo = !rol.activo
      return true
    }
    return false
  }

  return {
    // State
    roles,
    loading,
    error,
    // Getters
    rolesActivos,
    totalRoles,
    rolesOrdenados,
    // Actions
    getRolById,
    addRol,
    updateRol,
    deleteRol,
    toggleRolActivo
  }
})
