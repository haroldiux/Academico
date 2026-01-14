import { api } from 'boot/axios'

export default {
  getGrupos(params) {
    return api.get('/grupos', { params })
  },

  // Create group (assign teacher to subject)
  createGrupo(data) {
    // We don't have a specific pivot-create endpoint, usually we use Asignatura controller or a specific store method.
    // For now let's assume valid API endpoint or handle it via existing controllers.
    // Actually, GrupoController.store could handle creation.
    return api.post('/grupos', data)
  },

  updateGrupo(id, data) {
    return api.put(`/grupos/${id}`, data)
  },

  deleteGrupo(id) {
    return api.delete(`/grupos/${id}`)
  }
}
