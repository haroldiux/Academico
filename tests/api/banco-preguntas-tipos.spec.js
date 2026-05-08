import { test, expect } from '@playwright/test'
import {
  createAuthenticatedDocenteApi,
  cleanupBancoFiltrado,
} from '../support/api-client.js'
import { hasBancoApiContext, testEnv } from '../support/env.js'
import { manualPayloads } from '../fixtures/data/manual-question-payloads.js'

function uniqueText(prefix) {
  return `${prefix} ${Date.now()} ${Math.random().toString(36).slice(2, 7)}`
}

function baseMultipart(overrides = {}) {
  return {
    asignatura_id: testEnv.docenteAsignaturaId,
    sede_id: testEnv.docenteSedeId,
    grupoTeorico: testEnv.docenteGrupo,
    parcial: testEnv.docenteParcial || '2P',
    grupo: '',
    logro_esperado_id: '',
    enunciado: uniqueText('Pregunta QA'),
    tipo: 'SELECCION_SIMPLE',
    dificultad: '2',
    opciones: JSON.stringify([]),
    respuesta_correcta: '',
    ...overrides,
  }
}

function buildSimplePayload(payload, overrides = {}) {
  return baseMultipart({
    enunciado: uniqueText(payload.enunciado),
    tipo: payload.tipo,
    grupo: payload.grupo || '',
    dificultad: payload.dificultad ?? '',
    opciones: JSON.stringify(payload.opciones || []),
    respuesta_correcta: Array.isArray(payload.respuesta_correcta)
      ? JSON.stringify(payload.respuesta_correcta)
      : (payload.respuesta_correcta ?? ''),
    ...overrides,
  })
}

function buildProblemaPayloads(overrides = {}) {
  const grupo = uniqueText('Caso QA')
  const header = buildSimplePayload(manualPayloads.problema, {
    enunciado: uniqueText('Caso clínico QA'),
    grupo,
    ...overrides.header,
  })

  const hijos = (manualPayloads.problema.preguntasLigadas || []).map((item, index) =>
    baseMultipart({
      enunciado: uniqueText(`${item.enunciado} ${index + 1}`),
      tipo: 'SUBPROBLEMA',
      grupo,
      dificultad: item.dificultad,
      opciones: JSON.stringify(item.opciones || []),
      respuesta_correcta: item.respuesta_correcta,
      ...(overrides.children?.[index] || {}),
    }),
  )

  return [header, ...hijos]
}

function buildEmparejamientoPayloads(overrides = {}) {
  const grupo = uniqueText('Emp QA')
  const header = buildSimplePayload(manualPayloads.emparejamiento, {
    enunciado: uniqueText('Emparejamiento QA'),
    grupo,
    ...overrides.header,
  })

  const plantilla = manualPayloads.emparejamiento.preguntasLigadas?.[0]
  const hijosBase = [
    {
      ...plantilla,
      enunciado: 'Elemento ligado A',
      respuesta_correcta: 'A',
      dificultad: '1',
    },
    {
      ...plantilla,
      enunciado: 'Elemento ligado B',
      respuesta_correcta: 'B',
      dificultad: '2',
    },
  ]

  const hijos = hijosBase.map((item, index) =>
    baseMultipart({
      enunciado: uniqueText(`${item.enunciado} ${index + 1}`),
      tipo: 'OPCION_EMPAREJAMIENTO',
      grupo,
      dificultad: item.dificultad,
      opciones: JSON.stringify([]),
      respuesta_correcta: item.respuesta_correcta,
      ...(overrides.children?.[index] || {}),
    }),
  )

  return [header, ...hijos]
}

async function createPayload(api, multipart) {
  return api.post('banco-preguntas', { multipart })
}

async function expectCreated(api, payloads) {
  for (const payload of payloads) {
    const response = await createPayload(api, payload)
    expect([200, 201]).toContain(response.status())
  }
}

test.describe('API docente banco de preguntas - matriz por tipo', () => {
  test.skip(!hasBancoApiContext, 'Faltan credenciales o contexto API para pruebas integradas.')

  test.beforeEach(async ({ request }, testInfo) => {
    void request
    testInfo.setTimeout(120_000)
  })

  test.describe('escenarios válidos por tipo', () => {
    const validCases = [
      {
        name: 'FALSO_VERDADERO válido',
        build: () => [buildSimplePayload(manualPayloads.falsoVerdadero)],
      },
      {
        name: 'RESPUESTA_COMPUESTA válida',
        build: () => [buildSimplePayload(manualPayloads.respuestaCompuesta)],
      },
      {
        name: 'PREGUNTA_CON_CLAVE válida',
        build: () => [buildSimplePayload(manualPayloads.preguntaConClave)],
      },
      {
        name: 'SELECCION_SIMPLE válida',
        build: () => [buildSimplePayload(manualPayloads.seleccionSimple)],
      },
      {
        name: 'estructura PROBLEMA válida',
        build: () => buildProblemaPayloads(),
      },
      {
        name: 'estructura EMPAREJAMIENTO válida',
        build: () => buildEmparejamientoPayloads(),
      },
    ]

    for (const scenario of validCases) {
      test(scenario.name, async () => {
        const api = await createAuthenticatedDocenteApi()
        await cleanupBancoFiltrado(api)
        await expectCreated(api, scenario.build())
        await api.dispose()
      })
    }
  })

  test.describe('faltantes o errores que deben ser rechazados', () => {
    test('rechaza FALSO_VERDADERO sin enunciado', async () => {
      const api = await createAuthenticatedDocenteApi()
      await cleanupBancoFiltrado(api)
      const response = await createPayload(
        api,
        buildSimplePayload(manualPayloads.falsoVerdadero, { enunciado: '' }),
      )
      expect(response.status()).toBe(422)
      await api.dispose()
    })

    test('rechaza FALSO_VERDADERO sin respuesta correcta', async () => {
      const api = await createAuthenticatedDocenteApi()
      await cleanupBancoFiltrado(api)
      const response = await createPayload(
        api,
        buildSimplePayload(manualPayloads.falsoVerdadero, { respuesta_correcta: '' }),
      )
      expect(response.status()).toBe(422)
      await api.dispose()
    })

    test.fail('debe rechazar FALSO_VERDADERO sin dificultad', async () => {
      const api = await createAuthenticatedDocenteApi()
      await cleanupBancoFiltrado(api)
      const response = await createPayload(
        api,
        buildSimplePayload(manualPayloads.falsoVerdadero, { dificultad: '' }),
      )
      expect(response.status()).toBe(422)
      await api.dispose()
    })

    test.fail('debe rechazar SELECCION_SIMPLE con 4 opciones', async () => {
      const api = await createAuthenticatedDocenteApi()
      await cleanupBancoFiltrado(api)
      const opciones = manualPayloads.seleccionSimple.opciones.slice(0, 4)
      const response = await createPayload(
        api,
        buildSimplePayload(manualPayloads.seleccionSimple, { opciones: JSON.stringify(opciones) }),
      )
      expect(response.status()).toBe(422)
      await api.dispose()
    })

    test('rechaza SELECCION_SIMPLE sin respuesta correcta', async () => {
      const api = await createAuthenticatedDocenteApi()
      await cleanupBancoFiltrado(api)
      const response = await createPayload(
        api,
        buildSimplePayload(manualPayloads.seleccionSimple, { respuesta_correcta: '' }),
      )
      expect(response.status()).toBe(422)
      await api.dispose()
    })

    test.fail('debe rechazar PREGUNTA_CON_CLAVE con 3 incisos', async () => {
      const api = await createAuthenticatedDocenteApi()
      await cleanupBancoFiltrado(api)
      const opciones = manualPayloads.preguntaConClave.opciones.slice(0, 3)
      const response = await createPayload(
        api,
        buildSimplePayload(manualPayloads.preguntaConClave, { opciones: JSON.stringify(opciones) }),
      )
      expect(response.status()).toBe(422)
      await api.dispose()
    })

    test.fail('debe rechazar SUBPROBLEMA huérfano', async () => {
      const api = await createAuthenticatedDocenteApi()
      await cleanupBancoFiltrado(api)
      const response = await createPayload(
        api,
        baseMultipart({
          enunciado: uniqueText('Subproblema huérfano QA'),
          tipo: 'SUBPROBLEMA',
          grupo: uniqueText('Caso huérfano'),
          dificultad: '2',
          opciones: JSON.stringify(
            manualPayloads.problema.preguntasLigadas[0].opciones || [],
          ),
          respuesta_correcta: 'A',
        }),
      )
      expect(response.status()).toBe(422)
      await api.dispose()
    })

    test.fail('debe rechazar OPCION_EMPAREJAMIENTO huérfana', async () => {
      const api = await createAuthenticatedDocenteApi()
      await cleanupBancoFiltrado(api)
      const response = await createPayload(
        api,
        baseMultipart({
          enunciado: uniqueText('Opción huérfana QA'),
          tipo: 'OPCION_EMPAREJAMIENTO',
          grupo: uniqueText('Emp huérfano'),
          dificultad: '2',
          opciones: JSON.stringify([]),
          respuesta_correcta: 'A',
        }),
      )
      expect(response.status()).toBe(422)
      await api.dispose()
    })
  })
})
