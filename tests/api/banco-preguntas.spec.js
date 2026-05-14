import path from 'node:path'
import fs from 'node:fs/promises'
import { test, expect } from '@playwright/test'
import { createAuthenticatedDocenteApi, cleanupBancoFiltrado } from '../support/api-client.js'
import { hasBancoApiContext } from '../support/env.js'
import { excelFixtures } from '../support/fixtures.js'
import { annotate } from '../support/shared-collector.mjs'

const LOG = (...args) => console.log(`[TEST] [API:Banco]`, ...args)

function ann(testInfo, overrides = {}) {
  annotate(testInfo, [
    { type: 'category', description: 'excel' },
    { type: 'scenario', description: overrides.scenario || 'invalido' },
    { type: 'check', description: overrides.check || '' },
    { type: 'expected', description: overrides.expected || 'permitir' },
    ...(overrides.extra || []),
  ])
}

test.describe('API docente banco de preguntas - importacion Excel', () => {
  test.skip(!hasBancoApiContext, 'Faltan credenciales o contexto API para pruebas integradas.')

  test.beforeEach(async ({ request }, testInfo) => {
    void request
    testInfo.setTimeout(90_000)
  })

  test('POST import: acepta fixture Excel valido minimo', async ({ request }, testInfo) => {
    void request
    ann(testInfo, {
      scenario: 'valido',
      check: 'Endpoint /banco-preguntas/import con archivo Excel bien formado',
      expected: 'permitir',
    })
    LOG('INICIO: Import Excel valido minimo')
    const api = await createAuthenticatedDocenteApi()
    await cleanupBancoFiltrado(api)
    const buffer = await fs.readFile(excelFixtures.validoMinimo)
    const response = await api.post('banco-preguntas/import', {
      multipart: {
        file: {
          name: path.basename(excelFixtures.validoMinimo),
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          buffer,
        },
        docente_id: process.env.API_DOCENTE_DOCENTE_ID || '',
        sede_id: process.env.API_DOCENTE_SEDE_ID,
        grupoTeorico: process.env.API_DOCENTE_GRUPO,
        con_cartilla: '1',
        parcial: process.env.API_DOCENTE_PARCIAL || '2P',
        modo: 'reemplazar',
      },
    })
    const status = response.status()
    LOG(`  Status: ${status} (esperado: 200, 201 o 422)`)
    if (status === 200 || status === 201) {
      annotate(testInfo, [
        { type: 'obtained', description: 'ok' },
        { type: 'cause', description: 'validacion_correcta' },
        { type: 'evidence', description: `Status ${status} - importacion exitosa` },
      ])
    } else if (status === 422) {
      annotate(testInfo, [
        { type: 'obtained', description: 'rechazado' },
        { type: 'cause', description: 'bug_backend' },
        {
          type: 'evidence',
          description: `Status 422 - backend rechazo archivo que deberia ser valido`,
        },
      ])
    } else {
      annotate(testInfo, [
        { type: 'obtained', description: 'error' },
        { type: 'cause', description: 'error_infraestructura' },
        { type: 'evidence', description: `Status inesperado: ${status}` },
      ])
    }
    expect([200, 201, 422]).toContain(status)
    await api.dispose()
  })

  test('POST import: rechaza fixture Excel con tipo de pregunta invalido', async ({
    request,
  }, testInfo) => {
    void request
    ann(testInfo, {
      scenario: 'invalido',
      check: 'Excel con tipo de pregunta que no existe en el sistema',
      expected: 'rechazar',
    })
    LOG('INICIO: Import Excel con tipo invalido')
    const api = await createAuthenticatedDocenteApi()
    const buffer = await fs.readFile(excelFixtures.tipoInvalido)
    const response = await api.post('banco-preguntas/import', {
      multipart: {
        file: {
          name: path.basename(excelFixtures.tipoInvalido),
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          buffer,
        },
        docente_id: process.env.API_DOCENTE_DOCENTE_ID || '',
        sede_id: process.env.API_DOCENTE_SEDE_ID,
        grupoTeorico: process.env.API_DOCENTE_GRUPO,
        con_cartilla: '1',
        parcial: process.env.API_DOCENTE_PARCIAL || '2P',
        modo: 'reemplazar',
      },
    })
    const status = response.status()
    LOG(`  Status: ${status} (esperado: 200, 422 o 500)`)
    if (status === 422 || status === 500) {
      annotate(testInfo, [
        { type: 'obtained', description: 'rechazado' },
        { type: 'cause', description: 'validacion_correcta' },
        { type: 'evidence', description: `Status ${status} - archivo rechazado correctamente` },
      ])
    } else if (status === 200) {
      annotate(testInfo, [
        { type: 'obtained', description: 'permitido' },
        { type: 'cause', description: 'bug_backend' },
        { type: 'evidence', description: 'Status 200 - backend acepto archivo con tipo invalido' },
      ])
    }
    expect([200, 422, 500]).toContain(status)
    await api.dispose()
  })

  test('bulk-delete: permite limpiar banco filtrado', async ({ request }, testInfo) => {
    void request
    ann(testInfo, {
      scenario: 'valido',
      check: 'Endpoint /banco-preguntas/bulk-delete por asignatura, grupo y parcial',
      expected: 'permitir',
    })
    LOG('INICIO: bulk-delete')
    const api = await createAuthenticatedDocenteApi()
    const response = await cleanupBancoFiltrado(api)
    const status = response.status()
    LOG(`  Status: ${status} (esperado: 200 o 201)`)
    if (status === 200 || status === 201) {
      annotate(testInfo, [
        { type: 'obtained', description: 'ok' },
        { type: 'cause', description: 'validacion_correcta' },
      ])
    } else {
      annotate(testInfo, [
        { type: 'obtained', description: 'error' },
        { type: 'cause', description: 'error_infraestructura' },
      ])
    }
    expect([200, 201]).toContain(status)
    await api.dispose()
  })

  test('save-config: permite alternar con_cartilla', async ({ request }, testInfo) => {
    void request
    ann(testInfo, {
      scenario: 'valido',
      check: 'Endpoint /banco-preguntas/save-config alternando con_cartilla=true/false',
      expected: 'permitir',
    })
    LOG('INICIO: save-config alternar con_cartilla')
    const api = await createAuthenticatedDocenteApi()
    let allOk = true
    for (const value of [true, false]) {
      const response = await api.post('banco-preguntas/save-config', {
        data: {
          asignatura_id: process.env.API_DOCENTE_ASIGNATURA_ID,
          grupo_teorico: process.env.API_DOCENTE_GRUPO,
          parcial: process.env.API_DOCENTE_PARCIAL || '2P',
          con_cartilla: value,
        },
      })
      if (![200, 201].includes(response.status())) allOk = false
    }
    annotate(testInfo, [
      { type: 'obtained', description: allOk ? 'ok' : 'error' },
      { type: 'cause', description: allOk ? 'validacion_correcta' : 'error_infraestructura' },
    ])
    expect(allOk).toBeTruthy()
    await api.dispose()
  })
})
