import { api } from 'boot/axios'

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats')
  return response.data
}

export const getDirectorStats = async (params) => {
  const response = await api.get('/admin/dashboard/director', { params })
  return response.data
}

export default {
  getAdminStats,
  getDirectorStats
}
