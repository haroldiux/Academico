import { test, expect } from '@playwright/test'
import { createAuthenticatedDocenteApi } from '../support/api-client.js'
import { hasApiCredentials } from '../support/env.js'

test.describe('API docente mis evaluaciones', () => {
  test.skip(!hasApiCredentials, 'Faltan credenciales API del docente.')

  test('GET /mis-evaluaciones responde con colección o payload válido', async () => {
    const api = await createAuthenticatedDocenteApi()
    const response = await api.get('mis-evaluaciones')
    expect([200, 204, 404]).toContain(response.status())

    if (response.status() === 200) {
      const body = await response.json()
      expect(body).not.toBeNull()
    }

    await api.dispose()
  })
})
