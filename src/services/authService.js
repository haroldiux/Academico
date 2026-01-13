import { api } from 'boot/axios'

export const login = async (credenciales) => {
  const response = await api.post('/login', credenciales)
  return response.data
}

// ... other auth services if needed, but mostly managed by useAuthStore
