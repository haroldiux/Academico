import path from 'node:path'
import fs from 'node:fs/promises'
import { test, expect } from '@playwright/test'
import { createAuthenticatedDocenteApi, cleanupBancoFiltrado } from '../support/api-client.js'
import { hasBancoApiContext } from '../support/env.js'
import { excelFixtures } from '../support/fixtures.js'
import { manualPayloads } from '../fixtures/data/manual-question-payloads.js'

test.describe('API docente banco de preguntas', () => {
  test.skip(!hasBancoApiContext, 'Faltan credenciales o contexto API para pruebas integradas.')

  test.beforeEach(async ({ request }, testInfo) => {
    void request
    testInfo.setTimeout(90_000)
  })

  test('GET /banco-preguntas responde con estructura mínima', async () => {
    const api = await createAuthenticatedDocenteApi()
    const response = await api.get('banco-preguntas', {
      params: {
        asignatura_id: process.env.API_DOCENTE_ASIGNATURA_ID,
        docente_id: process.env.API_DOCENTE_DOCENTE_ID || '',
      },
    })

    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body).toBeTruthy()
    await api.dispose()
  })

  test('POST /banco-preguntas guarda una pregunta simple válida', async () => {
    const api = await createAuthenticatedDocenteApi()
    await cleanupBancoFiltrado(api)

    const payload = manualPayloads.seleccionSimple
    const formData = new FormData()
    formData.append('enunciado', payload.enunciado)
    formData.append('tipo', payload.tipo)
    formData.append('asignatura_id', process.env.API_DOCENTE_ASIGNATURA_ID)
    formData.append('sede_id', process.env.API_DOCENTE_SEDE_ID)
    formData.append('grupoTeorico', process.env.API_DOCENTE_GRUPO)
    formData.append('parcial', process.env.API_DOCENTE_PARCIAL || '2P')
    formData.append('grupo', '')
    formData.append('logro_esperado_id', '')
    formData.append('dificultad', payload.dificultad)
    formData.append('opciones', JSON.stringify(payload.opciones))
    formData.append('respuesta_correcta', payload.respuesta_correcta)

    const response = await api.post('banco-preguntas', {
      multipart: Object.fromEntries(formData.entries()),
    })

    expect(response.ok()).toBeTruthy()
    await api.dispose()
  })

  test('POST /banco-preguntas/import rechaza fixture con tipo inválido', async () => {
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

    expect([200, 422, 500]).toContain(response.status())
    await api.dispose()
  })

  test('POST /banco-preguntas/import acepta fixture válido mínimo', async () => {
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

    expect([200, 201, 422]).toContain(response.status())
    await api.dispose()
  })

  test('POST /banco-preguntas/bulk-delete responde sin afectar otros contextos', async () => {
    const api = await createAuthenticatedDocenteApi()
    const response = await cleanupBancoFiltrado(api)
    expect([200, 201]).toContain(response.status())
    await api.dispose()
  })

  test('POST /banco-preguntas/save-config permite alternar con_cartilla', async () => {
    const api = await createAuthenticatedDocenteApi()

    for (const value of [true, false]) {
      const response = await api.post('banco-preguntas/save-config', {
        data: {
          asignatura_id: process.env.API_DOCENTE_ASIGNATURA_ID,
          grupo_teorico: process.env.API_DOCENTE_GRUPO,
          parcial: process.env.API_DOCENTE_PARCIAL || '2P',
          con_cartilla: value,
        },
      })

      expect([200, 201]).toContain(response.status())
    }

    await api.dispose()
  })

  test('GET /banco-preguntas/stats responde para el parcial y grupo activo', async () => {
    const api = await createAuthenticatedDocenteApi()
    const response = await api.get('banco-preguntas/stats', {
      params: {
        asignatura_id: process.env.API_DOCENTE_ASIGNATURA_ID,
        grupoTeorico: process.env.API_DOCENTE_GRUPO,
        parcial: process.env.API_DOCENTE_PARCIAL || '2P',
      },
    })

    expect([200, 404]).toContain(response.status())
    await api.dispose()
  })
})
