import { api } from 'boot/axios'

/**
 * Servicio para Dashboard de Dirección Académica
 */

export const getDashboardStats = async (sedeId) => {
  const response = await api.get('/direccion/stats', { params: { sede_id: sedeId } })
  return response.data
}

export default {
  getDashboardStats,
}
