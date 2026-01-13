import { api } from 'src/boot/axios'

export default {
  // Obtener todos los usuarios
  getUsuarios(search = '') {
    const params = {}
    if (search) params.search = search
    return api.get('/usuarios', { params })
  },

  // Obtener un usuario por ID
  getUsuario(id) {
    return api.get(`/usuarios/${id}`)
  },

  // Crear un nuevo usuario
  createUsuario(data) {
    return api.post('/usuarios', data)
  },

  // Actualizar un usuario existente
  updateUsuario(id, data) {
    return api.put(`/usuarios/${id}`, data)
  },

  // Eliminar un usuario
  deleteUsuario(id) {
    return api.delete(`/usuarios/${id}`)
  }
}
