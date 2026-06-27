import { test, expect } from '@playwright/test'
import { createAuthenticatedDocenteApi, cleanupBancoFiltrado } from '../support/api-client.js'
import { hasApiCredentials } from '../support/env.js'

const LOG = (...args) => console.log(`[TEST] [API:Evaluaciones]`, ...args)

test.describe('API docente mis evaluaciones', () => {
  test.skip(!hasApiCredentials, 'Faltan credenciales API del docente.')

  test('GET /mis-evaluaciones responde con colección o payload válido', async () => {
    LOG('INICIO: GET /mis-evaluaciones')
    const api = await createAuthenticatedDocenteApi()
    const response = await api.get('mis-evaluaciones')
    LOG(`  Status: ${response.status()}`)
    expect([200, 204, 404]).toContain(response.status())

    if (response.status() === 200) {
      const body = await response.json()
      expect(body).not.toBeNull()
      LOG(`  Body: ${typeof body === 'object' ? 'objeto/array valido' : 'invalido'}`)
    }

    await api.dispose()
    LOG('PASS: GET /mis-evaluaciones responde correctamente')
  })
})
