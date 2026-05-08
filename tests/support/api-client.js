import { request as playwrightRequest, expect } from '@playwright/test'
import { testEnv } from './env.js'

let cachedToken = null

function getBaseURL() {
  return testEnv.apiBaseUrl.replace(/\/?$/, '/')
}

export async function createApiContext() {
  return playwrightRequest.newContext({
    baseURL: getBaseURL(),
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  })
}

export async function loginDocenteApi(apiContext) {
  if (!cachedToken) {
    const response = await apiContext.post('login', {
      data: {
        username: testEnv.docenteUsername,
        password: testEnv.docentePassword,
      },
    })

    expect(response.ok()).toBeTruthy()
    const payload = await response.json()
    cachedToken = payload?.token
    expect(cachedToken).toBeTruthy()
  }

  await apiContext.dispose()

  return playwrightRequest.newContext({
    baseURL: getBaseURL(),
    extraHTTPHeaders: {
      Accept: 'application/json',
      Authorization: `Bearer ${cachedToken}`,
    },
  })
}

export async function createAuthenticatedDocenteApi() {
  const base = await createApiContext()
  return loginDocenteApi(base)
}

export function invalidateApiToken() {
  cachedToken = null
}

export async function cleanupBancoFiltrado(apiContext, overrides = {}) {
  const payload = {
    asignatura_id: testEnv.docenteAsignaturaId,
    grupo_teorico: testEnv.docenteGrupo,
    parcial: testEnv.docenteParcial,
    ...overrides,
  }

  return apiContext.post('banco-preguntas/bulk-delete', {
    data: payload,
  })
}
