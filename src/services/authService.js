import { api } from 'boot/axios'

export const login = async (credenciales) => {
  const response = await api.post('/login', credenciales)
  return response.data
}

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post('/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
    new_password_confirmation: newPassword
  })
  return response.data
}

export const getMe = async () => {
  const response = await api.get('/me')
  return response.data
}
