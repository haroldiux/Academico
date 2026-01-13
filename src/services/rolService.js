import { api } from 'src/boot/axios'

export default {
  // Obtener todos los roles
  getRoles() {
    return api.get('/roles')
  },

  // Obtener un rol por ID
  getRol(id) {
    return api.get(`/roles/${id}`)
  },

  // Crear un nuevo rol
  createRol(data) {
    return api.post('/roles', data)
  },

  // Actualizar un rol existente
  updateRol(id, data) {
    return api.put(`/roles/${id}`, data) // Laravel uses PUT/PATCH
  },

  // Eliminar un rol
  deleteRol(id) {
    return api.delete(`/roles/${id}`)
  }
}
