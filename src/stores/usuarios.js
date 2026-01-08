import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUsuariosStore = defineStore('usuarios', () => {
  // State
  const usuarios = ref([
    {
      id: 1,
      nombre: 'Carlos',
      apellido: 'Mendoza Quispe',
      email: 'carlos.mendoza@unitepc.edu.bo',
      telefono: '+591 71234567',
      ci: '8765432',
      rolId: 1,
      rolNombre: 'SUPER ADMIN',
      estado: 'activo',
      avatar: null,
      ultimoAcceso: '2024-01-07 15:30:00',
      fechaCreacion: '2024-01-01',
      carrera: null
    },
    {
      id: 2,
      nombre: 'María',
      apellido: 'Fernández López',
      email: 'maria.fernandez@unitepc.edu.bo',
      telefono: '+591 72345678',
      ci: '7654321',
      rolId: 2,
      rolNombre: 'ADMIN',
      estado: 'activo',
      avatar: null,
      ultimoAcceso: '2024-01-07 14:20:00',
      fechaCreacion: '2024-01-02',
      carrera: null
    },
    {
      id: 3,
      nombre: 'Roberto',
      apellido: 'García Vargas',
      email: 'roberto.garcia@unitepc.edu.bo',
      telefono: '+591 73456789',
      ci: '6543210',
      rolId: 3,
      rolNombre: 'VICERRECTORADO',
      estado: 'activo',
      avatar: null,
      ultimoAcceso: '2024-01-07 10:15:00',
      fechaCreacion: '2024-01-03',
      carrera: null
    },
    {
      id: 4,
      nombre: 'Ana',
      apellido: 'Mamani Churata',
      email: 'ana.mamani@unitepc.edu.bo',
      telefono: '+591 74567890',
      ci: '5432109',
      rolId: 4,
      rolNombre: 'DIRECCIÓN ACADÉMICA',
      estado: 'activo',
      avatar: null,
      ultimoAcceso: '2024-01-06 16:45:00',
      fechaCreacion: '2024-01-04',
      carrera: null
    },
    {
      id: 5,
      nombre: 'Juan',
      apellido: 'Condori Apaza',
      email: 'juan.condori@unitepc.edu.bo',
      telefono: '+591 75678901',
      ci: '4321098',
      rolId: 5,
      rolNombre: 'DIRECTOR DE CARRERA',
      estado: 'activo',
      avatar: null,
      ultimoAcceso: '2024-01-07 09:30:00',
      fechaCreacion: '2024-01-05',
      carrera: 'Ingeniería de Sistemas'
    },
    {
      id: 6,
      nombre: 'Patricia',
      apellido: 'Ticona Flores',
      email: 'patricia.ticona@unitepc.edu.bo',
      telefono: '+591 76789012',
      ci: '3210987',
      rolId: 6,
      rolNombre: 'DOCENTE',
      estado: 'activo',
      avatar: null,
      ultimoAcceso: '2024-01-07 08:00:00',
      fechaCreacion: '2024-01-06',
      carrera: 'Ingeniería de Sistemas'
    },
    {
      id: 7,
      nombre: 'Miguel',
      apellido: 'Huanca Quispe',
      email: 'miguel.huanca@unitepc.edu.bo',
      telefono: '+591 77890123',
      ci: '2109876',
      rolId: 6,
      rolNombre: 'DOCENTE',
      estado: 'inactivo',
      avatar: null,
      ultimoAcceso: '2024-01-05 11:20:00',
      fechaCreacion: '2024-01-07',
      carrera: 'Administración de Empresas'
    },
    {
      id: 8,
      nombre: 'Lucia',
      apellido: 'Choque Mamani',
      email: 'lucia.choque@unitepc.edu.bo',
      telefono: '+591 78901234',
      ci: '1098765',
      rolId: 7,
      rolNombre: 'EVALUACIONES',
      estado: 'activo',
      avatar: null,
      ultimoAcceso: '2024-01-07 12:00:00',
      fechaCreacion: '2024-01-08',
      carrera: null
    }
  ])

  const loading = ref(false)
  const error = ref(null)

  // Getters
  const usuariosActivos = computed(() => usuarios.value.filter(u => u.estado === 'activo'))
  const usuariosInactivos = computed(() => usuarios.value.filter(u => u.estado === 'inactivo'))
  const totalUsuarios = computed(() => usuarios.value.length)
  
  const usuariosPorRol = computed(() => {
    const grupos = {}
    usuarios.value.forEach(u => {
      if (!grupos[u.rolNombre]) {
        grupos[u.rolNombre] = []
      }
      grupos[u.rolNombre].push(u)
    })
    return grupos
  })

  // Actions
  function getUsuarioById(id) {
    return usuarios.value.find(u => u.id === id)
  }

  function addUsuario(usuario) {
    const nuevoId = Math.max(...usuarios.value.map(u => u.id)) + 1
    usuarios.value.push({
      ...usuario,
      id: nuevoId,
      fechaCreacion: new Date().toISOString().split('T')[0],
      ultimoAcceso: null
    })
    return nuevoId
  }

  function updateUsuario(id, datosActualizados) {
    const index = usuarios.value.findIndex(u => u.id === id)
    if (index !== -1) {
      usuarios.value[index] = { ...usuarios.value[index], ...datosActualizados }
      return true
    }
    return false
  }

  function deleteUsuario(id) {
    const index = usuarios.value.findIndex(u => u.id === id)
    if (index !== -1) {
      usuarios.value.splice(index, 1)
      return true
    }
    return false
  }

  function toggleUsuarioEstado(id) {
    const usuario = usuarios.value.find(u => u.id === id)
    if (usuario) {
      usuario.estado = usuario.estado === 'activo' ? 'inactivo' : 'activo'
      return true
    }
    return false
  }

  function buscarUsuarios(termino) {
    const terminoLower = termino.toLowerCase()
    return usuarios.value.filter(u => 
      u.nombre.toLowerCase().includes(terminoLower) ||
      u.apellido.toLowerCase().includes(terminoLower) ||
      u.email.toLowerCase().includes(terminoLower) ||
      u.rolNombre.toLowerCase().includes(terminoLower)
    )
  }

  return {
    // State
    usuarios,
    loading,
    error,
    // Getters
    usuariosActivos,
    usuariosInactivos,
    totalUsuarios,
    usuariosPorRol,
    // Actions
    getUsuarioById,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    toggleUsuarioEstado,
    buscarUsuarios
  }
})
