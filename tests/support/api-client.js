import { request as playwrightRequest, expect } from '@playwright/test'
import { testEnv } from './env.js'
import { getSharedToken, setSharedAuth, hasSharedToken } from './shared-auth.mjs'

const LOG = (...args) => console.log(`[TEST] [API-Client]`, ...args)

function getBaseURL() {
  return testEnv.apiBaseUrl.replace(/\/?$/, '/')
}

export async function createApiContext() {
  return playwrightRequest.newContext({
    baseURL: getBaseURL(),
    extraHTTPHeaders: { Accept: 'application/json' },
  })
}

async function fetchToken() {
  LOG('Obteniendo token de API...')
  const ctx = await playwrightRequest.newContext({
    baseURL: getBaseURL(),
    extraHTTPHeaders: { Accept: 'application/json' },
  })

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await ctx.post('login', {
        data: { username: testEnv.docenteUsername, password: testEnv.docentePassword },
      })
      if (response.ok()) {
        const payload = await response.json()
        setSharedAuth(payload.token, payload.user)
        await ctx.dispose()
        LOG('Token obtenido y compartido')
        return
      }
      if (response.status() === 429 || response.status() >= 500) {
        const delay = attempt * 4000
        LOG(`  ⚠ Status ${response.status()}. Intento ${attempt}/5. Esperando ${delay / 1000}s...`)
        await new Promise((r) => setTimeout(r, delay))
      } else {
        await ctx.dispose()
        throw new Error(`Login fallo: status ${response.status()}`)
      }
    } catch (e) {
      if (attempt >= 5) {
        await ctx.dispose()
        throw e
      }
      await new Promise((r) => setTimeout(r, attempt * 3000))
    }
  }
  await ctx.dispose()
  throw new Error('No se pudo obtener token despues de 5 intentos')
}

export async function createAuthenticatedDocenteApi() {
  if (!hasSharedToken()) await fetchToken()

  return playwrightRequest.newContext({
    baseURL: getBaseURL(),
    extraHTTPHeaders: {
      Accept: 'application/json',
      Authorization: `Bearer ${getSharedToken()}`,
    },
  })
}

export function invalidateApiToken() {
  LOG('Invalidando token compartido')
  setSharedAuth(null, null)
}

export async function cleanupBancoFiltrado(apiContext, overrides = {}) {
  const payload = {
    asignatura_id: testEnv.docenteAsignaturaId,
    grupo_teorico: testEnv.docenteGrupo,
    parcial: testEnv.docenteParcial,
    ...overrides,
  }
  LOG(
    `Limpiando banco: asig=${payload.asignatura_id} grupo=${payload.grupo_teorico} parcial=${payload.parcial}`,
  )
  return apiContext.post('banco-preguntas/bulk-delete', { data: payload })
}
