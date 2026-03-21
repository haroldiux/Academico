import { api } from 'boot/axios'

export default {
  getAulas(params = {})  { return api.get('/aulas', { params }) },
  createAula(data)        { return api.post('/aulas', data) },
  updateAula(id, data)    { return api.put(`/aulas/${id}`, data) },
  deleteAula(id)          { return api.delete(`/aulas/${id}`) },
}
