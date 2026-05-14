import { test, expect } from '@playwright/test'
import { createAuthenticatedDocenteApi, cleanupBancoFiltrado } from '../support/api-client.js'
import { hasBancoApiContext, testEnv } from '../support/env.js'
import { manualPayloads } from '../fixtures/data/manual-question-payloads.js'
import { annotate } from '../support/shared-collector.mjs'

const LOG = (...args) => console.log(`[TEST] [API:Tipos]`, ...args)

function ann(testInfo, tipo, scenario, check, expected) {
  annotate(testInfo, [
    { type: 'category', description: 'manual' },
    { type: 'subcategory', description: tipo },
    { type: 'scenario', description: scenario },
    { type: 'check', description: check },
    { type: 'expected', description: expected },
  ])
}

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
    enunciado: uniqueText('Caso clinico QA'),
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
    { ...plantilla, enunciado: 'Elemento ligado A', respuesta_correcta: 'A', dificultad: '1' },
    { ...plantilla, enunciado: 'Elemento ligado B', respuesta_correcta: 'B', dificultad: '2' },
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

test.describe('API docente banco de preguntas - matriz por tipo (registro manual)', () => {
  test.skip(!hasBancoApiContext, 'Faltan credenciales o contexto API para pruebas integradas.')

  test.beforeEach(async ({ request }, testInfo) => {
    void request
    testInfo.setTimeout(120_000)
  })

  // ══════════════ escenarios validos ══════════════

  test.describe('escenarios validos por tipo (preguntas completas)', () => {
    const validCases = [
      {
        tipo: 'FALSO_VERDADERO',
        check: 'Enunciado + respuesta V/F + dificultad',
        build: () => [buildSimplePayload(manualPayloads.falsoVerdadero)],
      },
      {
        tipo: 'RESPUESTA_COMPUESTA',
        check: 'Dos premisas + respuesta A/B/Ambas/Ninguna + dificultad',
        build: () => [buildSimplePayload(manualPayloads.respuestaCompuesta)],
      },
      {
        tipo: 'PREGUNTA_CON_CLAVE',
        check: 'Enunciado + 4 incisos + clave de respuesta + dificultad',
        build: () => [buildSimplePayload(manualPayloads.preguntaConClave)],
      },
      {
        tipo: 'SELECCION_SIMPLE',
        check: 'Enunciado + 5 opciones + respuesta correcta + dificultad',
        build: () => [buildSimplePayload(manualPayloads.seleccionSimple)],
      },
      {
        tipo: 'PROBLEMA',
        check: 'Enunciado general + subitem con opciones, respuesta y dificultad',
        build: () => buildProblemaPayloads(),
      },
      {
        tipo: 'EMPAREJAMIENTO',
        check: 'Enunciado general + opciones base + enunciados ligados con respuesta',
        build: () => buildEmparejamientoPayloads(),
      },
    ]

    for (const scenario of validCases) {
      test(`${scenario.tipo} valido`, async ({}, testInfo) => {
        ann(testInfo, scenario.tipo, 'valido', scenario.check, 'permitir')
        LOG(`INICIO: ${scenario.tipo} valido`)
        const api = await createAuthenticatedDocenteApi()
        await cleanupBancoFiltrado(api)
        try {
          await expectCreated(api, scenario.build())
          annotate(testInfo, [
            { type: 'obtained', description: 'ok' },
            { type: 'cause', description: 'validacion_correcta' },
            { type: 'evidence', description: 'Status 200/201 - pregunta creada exitosamente' },
          ])
          LOG(`PASS: ${scenario.tipo} valido creado`)
        } catch (e) {
          annotate(testInfo, [
            { type: 'obtained', description: 'error' },
            { type: 'cause', description: 'error_infraestructura' },
            { type: 'evidence', description: e.message?.slice(0, 150) },
          ])
          throw e
        }
        await api.dispose()
      })
    }
  })

  // ══════════════ rechazos correctos ══════════════

  test.describe('validaciones que SI rechazan correctamente', () => {
    test('rechaza FALSO_VERDADERO sin enunciado', async ({}, testInfo) => {
      ann(testInfo, 'FALSO_VERDADERO', 'invalido', 'Sin enunciado principal', 'rechazar')
      LOG('INICIO: FALSO_VERDADERO sin enunciado')
      const api = await createAuthenticatedDocenteApi()
      await cleanupBancoFiltrado(api)
      const response = await createPayload(
        api,
        buildSimplePayload(manualPayloads.falsoVerdadero, { enunciado: '' }),
      )
      const status = response.status()
      LOG(`  Status: ${status} (esperado: 422)`)
      if (status === 422) {
        annotate(testInfo, [
          { type: 'obtained', description: 'rechazado' },
          { type: 'cause', description: 'validacion_correcta' },
          { type: 'evidence', description: 'Status 422 - backend rechazo correctamente' },
        ])
      } else {
        annotate(testInfo, [
          { type: 'obtained', description: 'permitido' },
          { type: 'cause', description: 'bug_backend_activo' },
          {
            type: 'evidence',
            description: `Status ${status} - BACKEND ACEPTO pregunta sin enunciado`,
          },
        ])
      }
      expect(status).toBe(422)
      await api.dispose()
    })

    test('rechaza FALSO_VERDADERO sin respuesta correcta', async ({}, testInfo) => {
      ann(testInfo, 'FALSO_VERDADERO', 'invalido', 'Sin marcar Verdadero ni Falso', 'rechazar')
      LOG('INICIO: FALSO_VERDADERO sin respuesta')
      const api = await createAuthenticatedDocenteApi()
      await cleanupBancoFiltrado(api)
      const response = await createPayload(
        api,
        buildSimplePayload(manualPayloads.falsoVerdadero, { respuesta_correcta: '' }),
      )
      const status = response.status()
      if (status === 422) {
        annotate(testInfo, [
          { type: 'obtained', description: 'rechazado' },
          { type: 'cause', description: 'validacion_correcta' },
          { type: 'evidence', description: 'Status 422 - backend rechazo' },
        ])
      } else {
        annotate(testInfo, [
          { type: 'obtained', description: 'permitido' },
          { type: 'cause', description: 'bug_backend_activo' },
          { type: 'evidence', description: `Status ${status} - ACEPTO sin respuesta` },
        ])
      }
      expect(status).toBe(422)
      await api.dispose()
    })

    test('rechaza SELECCION_SIMPLE sin respuesta correcta', async ({}, testInfo) => {
      ann(
        testInfo,
        'SELECCION_SIMPLE',
        'invalido',
        '5 opciones llenas pero sin marcar cual es la correcta',
        'rechazar',
      )
      LOG('INICIO: SELECCION_SIMPLE sin respuesta')
      const api = await createAuthenticatedDocenteApi()
      await cleanupBancoFiltrado(api)
      const response = await createPayload(
        api,
        buildSimplePayload(manualPayloads.seleccionSimple, { respuesta_correcta: '' }),
      )
      const status = response.status()
      if (status === 422) {
        annotate(testInfo, [
          { type: 'obtained', description: 'rechazado' },
          { type: 'cause', description: 'validacion_correcta' },
        ])
      } else {
        annotate(testInfo, [
          { type: 'obtained', description: 'permitido' },
          { type: 'cause', description: 'bug_backend_activo' },
          { type: 'evidence', description: `Status ${status} - ACEPTO sin respuesta` },
        ])
      }
      expect(status).toBe(422)
      await api.dispose()
    })
  })

  // ══════════════ bugs del backend (test.fail) ══════════════

  test.describe('validaciones que el backend NO hace (BUGS)', () => {
    test.fail('BUG: FALSO_VERDADERO sin dificultad es aceptado', async ({}, testInfo) => {
      ann(
        testInfo,
        'FALSO_VERDADERO',
        'invalido',
        'Sin seleccionar nivel de dificultad (1, 2 o 3)',
        'rechazar',
      )
      LOG('INICIO: FALSO_VERDADERO sin dificultad - BUG BACKEND')
      const api = await createAuthenticatedDocenteApi()
      await cleanupBancoFiltrado(api)
      const response = await createPayload(
        api,
        buildSimplePayload(manualPayloads.falsoVerdadero, { dificultad: '' }),
      )
      const status = response.status()
      LOG(`  Status: ${status} (esperado: 422, obtenido: ${status})`)
      annotate(testInfo, [
        { type: 'obtained', description: status === 422 ? 'rechazado' : 'permitido' },
        { type: 'cause', description: status === 422 ? 'bug_corregido' : 'bug_backend_activo' },
        {
          type: 'evidence',
          description:
            status === 422
              ? 'BUG CORREGIDO - ahora rechaza'
              : `Status ${status} - BACKEND ACEPTO pregunta sin dificultad. Se requiere validar en controlador.`,
        },
      ])
      expect(status).toBe(422)
      await api.dispose()
    })

    test.fail('BUG: SELECCION_SIMPLE con 4 opciones es aceptado', async ({}, testInfo) => {
      ann(
        testInfo,
        'SELECCION_SIMPLE',
        'invalido',
        'Solo 4 opciones en vez de las 5 requeridas',
        'rechazar',
      )
      LOG('INICIO: SELECCION_SIMPLE con 4 opciones - BUG BACKEND')
      const api = await createAuthenticatedDocenteApi()
      await cleanupBancoFiltrado(api)
      const opciones = manualPayloads.seleccionSimple.opciones.slice(0, 4)
      const response = await createPayload(
        api,
        buildSimplePayload(manualPayloads.seleccionSimple, { opciones: JSON.stringify(opciones) }),
      )
      const status = response.status()
      LOG(`  Status: ${status} (esperado: 422, obtenido: ${status})`)
      annotate(testInfo, [
        { type: 'obtained', description: status === 422 ? 'rechazado' : 'permitido' },
        { type: 'cause', description: status === 422 ? 'bug_corregido' : 'bug_backend_activo' },
        {
          type: 'evidence',
          description:
            status === 422
              ? 'BUG CORREGIDO'
              : `Status ${status} - ACEPTO con solo 4 opciones. Se requiere validar count(opciones) >= 5.`,
        },
      ])
      expect(status).toBe(422)
      await api.dispose()
    })

    test.fail('BUG: PREGUNTA_CON_CLAVE con 3 incisos es aceptado', async ({}, testInfo) => {
      ann(
        testInfo,
        'PREGUNTA_CON_CLAVE',
        'invalido',
        'Solo 3 incisos en vez de los 4 requeridos',
        'rechazar',
      )
      LOG('INICIO: PREGUNTA_CON_CLAVE con 3 incisos - BUG BACKEND')
      const api = await createAuthenticatedDocenteApi()
      await cleanupBancoFiltrado(api)
      const opciones = manualPayloads.preguntaConClave.opciones.slice(0, 3)
      const response = await createPayload(
        api,
        buildSimplePayload(manualPayloads.preguntaConClave, { opciones: JSON.stringify(opciones) }),
      )
      const status = response.status()
      LOG(`  Status: ${status} (esperado: 422, obtenido: ${status})`)
      annotate(testInfo, [
        { type: 'obtained', description: status === 422 ? 'rechazado' : 'permitido' },
        { type: 'cause', description: status === 422 ? 'bug_corregido' : 'bug_backend_activo' },
        {
          type: 'evidence',
          description:
            status === 422
              ? 'BUG CORREGIDO'
              : `Status ${status} - ACEPTO con solo 3 incisos. Se requiere validar count(incisos) >= 4.`,
        },
      ])
      expect(status).toBe(422)
      await api.dispose()
    })

    test.fail('BUG: SUBPROBLEMA huerfano es aceptado', async ({}, testInfo) => {
      ann(
        testInfo,
        'SUBPROBLEMA',
        'invalido',
        'Subproblema enviado sin un PROBLEMA padre que lo agrupe',
        'rechazar',
      )
      LOG('INICIO: SUBPROBLEMA huerfano - BUG BACKEND')
      const api = await createAuthenticatedDocenteApi()
      await cleanupBancoFiltrado(api)
      const response = await createPayload(
        api,
        baseMultipart({
          enunciado: uniqueText('Subproblema huerfano QA'),
          tipo: 'SUBPROBLEMA',
          grupo: uniqueText('Caso huerfano'),
          dificultad: '2',
          opciones: JSON.stringify(manualPayloads.problema.preguntasLigadas[0].opciones || []),
          respuesta_correcta: 'A',
        }),
      )
      const status = response.status()
      LOG(`  Status: ${status} (esperado: 422, obtenido: ${status})`)
      annotate(testInfo, [
        { type: 'obtained', description: status === 422 ? 'rechazado' : 'permitido' },
        { type: 'cause', description: status === 422 ? 'bug_corregido' : 'bug_backend_activo' },
        {
          type: 'evidence',
          description:
            status === 422
              ? 'BUG CORREGIDO'
              : `Status ${status} - ACEPTO subproblema sin padre. Se requiere validar que exista PROBLEMA con mismo grupo.`,
        },
      ])
      expect(status).toBe(422)
      await api.dispose()
    })

    test.fail('BUG: OPCION_EMPAREJAMIENTO huerfana es aceptada', async ({}, testInfo) => {
      ann(
        testInfo,
        'OPCION_EMPAREJAMIENTO',
        'invalido',
        'Opcion de emparejamiento enviada sin un EMPAREJAMIENTO padre',
        'rechazar',
      )
      LOG('INICIO: OPCION_EMPAREJAMIENTO huerfana - BUG BACKEND')
      const api = await createAuthenticatedDocenteApi()
      await cleanupBancoFiltrado(api)
      const response = await createPayload(
        api,
        baseMultipart({
          enunciado: uniqueText('Opcion huerfana QA'),
          tipo: 'OPCION_EMPAREJAMIENTO',
          grupo: uniqueText('Emp huerfano'),
          dificultad: '2',
          opciones: JSON.stringify([]),
          respuesta_correcta: 'A',
        }),
      )
      const status = response.status()
      LOG(`  Status: ${status} (esperado: 422, obtenido: ${status})`)
      annotate(testInfo, [
        { type: 'obtained', description: status === 422 ? 'rechazado' : 'permitido' },
        { type: 'cause', description: status === 422 ? 'bug_corregido' : 'bug_backend_activo' },
        {
          type: 'evidence',
          description:
            status === 422
              ? 'BUG CORREGIDO'
              : `Status ${status} - ACEPTO opcion huerfana. Se requiere validar que exista EMPAREJAMIENTO con mismo grupo.`,
        },
      ])
      expect(status).toBe(422)
      await api.dispose()
    })
  })

  // ══════════════ otors endpoints ══════════════

  test('GET /banco-preguntas responde con estructura minima', async ({}, testInfo) => {
    ann(
      testInfo,
      'General',
      'valido',
      'Endpoint GET /banco-preguntas responde correctamente',
      'permitir',
    )
    LOG('INICIO: GET /banco-preguntas')
    const api = await createAuthenticatedDocenteApi()
    const response = await api.get('banco-preguntas', {
      params: {
        asignatura_id: process.env.API_DOCENTE_ASIGNATURA_ID,
        docente_id: process.env.API_DOCENTE_DOCENTE_ID || '',
      },
    })
    expect(response.ok()).toBeTruthy()
    annotate(testInfo, [
      { type: 'obtained', description: 'ok' },
      { type: 'cause', description: 'validacion_correcta' },
    ])
    await api.dispose()
  })

  test('GET /banco-preguntas/stats responde', async ({}, testInfo) => {
    ann(
      testInfo,
      'General',
      'valido',
      'Endpoint GET /banco-preguntas/stats para parcial y grupo activo',
      'permitir',
    )
    LOG('INICIO: GET /banco-preguntas/stats')
    const api = await createAuthenticatedDocenteApi()
    const response = await api.get('banco-preguntas/stats', {
      params: {
        asignatura_id: process.env.API_DOCENTE_ASIGNATURA_ID,
        grupoTeorico: process.env.API_DOCENTE_GRUPO,
        parcial: process.env.API_DOCENTE_PARCIAL || '2P',
      },
    })
    expect([200, 404]).toContain(response.status())
    annotate(testInfo, [
      { type: 'obtained', description: 'ok' },
      { type: 'cause', description: 'validacion_correcta' },
    ])
    await api.dispose()
  })
})
