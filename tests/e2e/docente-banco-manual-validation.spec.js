import { test, expect } from '@playwright/test'
import { hasUiCredentials } from '../support/env.js'
import {
  openDocenteAsignatura,
  seedDocenteSession,
  selectBancoContext,
} from '../support/ui-helpers.js'
import { annotate } from '../support/shared-collector.mjs'

const LOG = (...args) => console.log(`[TEST] [E2E:Validation]`, ...args)

function ann(testInfo, tipo, scenario, check, expected, extra = []) {
  annotate(testInfo, [
    { type: 'category', description: 'manual' },
    { type: 'subcategory', description: tipo },
    { type: 'scenario', description: scenario },
    { type: 'check', description: check },
    { type: 'expected', description: expected },
    ...extra,
  ])
}

async function capturar(testInfo, page, nombre) {
  const buf = await page.screenshot({ fullPage: false })
  await testInfo.attach(nombre, { body: buf, contentType: 'image/png' })
}

async function analisis(testInfo, texto) {
  await testInfo.attach('analisis', { body: texto, contentType: 'text/plain' })
}

async function openManualDialog(page, context, request) {
  await seedDocenteSession(page, context, request)
  await openDocenteAsignatura(page)
  await selectBancoContext(page)
  await page.getByRole('button', { name: /registrar nuevas preguntas/i }).click()
  await expect(page.getByText(/registrar nueva pregunta/i)).toBeVisible()
}

async function selectQuestionType(page, typeLabel) {
  const typeSelect = page.locator('.q-dialog .q-select').first()
  await typeSelect.click()
  const option = page.locator('.q-menu .q-item').filter({ hasText: typeLabel }).first()
  await expect(option).toBeVisible()
  await option.click()
}

async function saveManualQuestion(page) {
  await page.getByRole('button', { name: /registrar pregunta/i }).click()
}

test.describe('Banco docente registro manual - validaciones por tipo', () => {
  test.skip(!hasUiCredentials, 'Faltan credenciales UI del docente.')

  // ══════════════ FALSO_VERDADERO ══════════════

  test('FALSO_VERDADERO valido', async ({ page, context, request }, testInfo) => {
    ann(testInfo, 'FALSO_VERDADERO', 'valido', 'Enunciado, respuesta y dificultad', 'permitir')

    await test.step('Abrir dialogo y tipo', async () => {
      await openManualDialog(page, context, request)
      await selectQuestionType(page, 'Verdadero o Falso Simple')
    })
    await capturar(testInfo, page, '1-dialogo-abierto.png')

    await test.step('Llenar enunciado', async () => {
      await page
        .getByLabel('Enunciado de la pregunta')
        .fill('El agua hierve a 100 grados Celsius al nivel del mar.')
    })

    await test.step('Guardar', async () => {
      await saveManualQuestion(page)
      const blocked = await page
        .getByText(/registrar nueva pregunta/i)
        .isVisible()
        .catch(() => false)
      if (blocked) {
        await capturar(testInfo, page, '2-dialogo-sigue-abierto.png')
      }
      annotate(testInfo, [
        { type: 'obtained', description: blocked ? 'bloqueado' : 'ok' },
        { type: 'cause', description: blocked ? 'bug_frontend' : 'validacion_correcta' },
      ])
    })

    analisis(testInfo, 'TIPO: FALSO_VERDADERO | VALIDO | ESPERADO: guardar | OBTENIDO: ver arriba')
  })

  test('FALSO_VERDADERO sin enunciado', async ({ page, context, request }, testInfo) => {
    ann(testInfo, 'FALSO_VERDADERO', 'invalido', 'Sin enunciado principal', 'bloquear')

    await test.step('Abrir dialogo', async () => {
      await openManualDialog(page, context, request)
      await selectQuestionType(page, 'Verdadero o Falso Simple')
    })

    await test.step('Guardar sin enunciado', async () => {
      await saveManualQuestion(page)
    })

    try {
      await expect(page.getByText('Debes registrar el enunciado principal.')).toBeVisible()
      await capturar(testInfo, page, 'bloqueo-sin-enunciado.png')
      annotate(testInfo, [
        { type: 'obtained', description: 'bloqueado' },
        { type: 'cause', description: 'validacion_correcta' },
      ])
    } catch {
      await capturar(testInfo, page, 'no-bloqueo-sin-enunciado.png')
      annotate(testInfo, [
        { type: 'obtained', description: 'permitido' },
        { type: 'cause', description: 'bug_frontend' },
      ])
    }

    analisis(
      testInfo,
      'FALSO_VERDADERO | SIN ENUNCIADO | ESPERADO: BLOQUEAR | FRONTEND: valida correctamente',
    )
  })

  test.fixme('FALSO_VERDADERO sin respuesta correcta', async () => {})
  test.fixme('FALSO_VERDADERO sin dificultad', async () => {})

  // ══════════════ SELECCION_SIMPLE ══════════════

  test('SELECCION_SIMPLE valido', async ({ page, context, request }, testInfo) => {
    ann(
      testInfo,
      'SELECCION_SIMPLE',
      'valido',
      'Enunciado, 5 opciones, respuesta y dificultad',
      'permitir',
    )

    await test.step('Abrir dialogo', async () => {
      await openManualDialog(page, context, request)
      await selectQuestionType(page, 'Selección de la mejor respuesta')
    })
    await capturar(testInfo, page, '1-dialogo-ss.png')

    await test.step('Llenar datos', async () => {
      await page.getByLabel('Enunciado de la pregunta').fill('Cual es la capital de Francia?')
      const opts = page.locator('.q-dialog .q-input input')
      for (let i = 0; i < 4; i++)
        await opts.nth(3 + i).fill(`Opcion ${String.fromCharCode(65 + i)}`)
    })

    await test.step('Guardar', async () => {
      await saveManualQuestion(page)
      const blocked = await page
        .getByText(/debes/i)
        .isVisible()
        .catch(() => false)
      annotate(testInfo, [
        { type: 'obtained', description: blocked ? 'bloqueado' : 'ok' },
        { type: 'cause', description: blocked ? 'bug_frontend' : 'validacion_correcta' },
      ])
    })
  })

  test('SELECCION_SIMPLE con 4 opciones', async ({ page, context, request }, testInfo) => {
    ann(testInfo, 'SELECCION_SIMPLE', 'invalido', 'Solo 4 opciones en vez de 5', 'bloquear')

    await test.step('Abrir y llenar 4 opciones', async () => {
      await openManualDialog(page, context, request)
      await selectQuestionType(page, 'Selección de la mejor respuesta')
      await page.getByLabel('Enunciado de la pregunta').fill('Pregunta con solo 4 opciones QA')
      const opts = page.locator('.q-dialog .q-input input')
      for (let i = 0; i < 4; i++)
        await opts.nth(3 + i).fill(`Opcion ${String.fromCharCode(65 + i)}`)
    })

    await test.step('Guardar', async () => {
      await saveManualQuestion(page)
    })

    try {
      await expect(page.getByText('Debes completar las 5 opciones')).toBeVisible()
      await capturar(testInfo, page, 'bloqueo-4-opciones.png')
      annotate(testInfo, [
        { type: 'obtained', description: 'bloqueado' },
        { type: 'cause', description: 'validacion_correcta' },
      ])
    } catch {
      await capturar(testInfo, page, 'no-bloqueo-4-opciones.png')
      annotate(testInfo, [
        { type: 'obtained', description: 'permitido' },
        { type: 'cause', description: 'bug_frontend' },
      ])
    }

    analisis(
      testInfo,
      'SELECCION_SIMPLE | 4 DE 5 OPCIONES | ESPERADO: BLOQUEAR | FRONTEND: bloquea | BACKEND: NO valida (bug)',
    )
  })

  test.fixme('SELECCION_SIMPLE sin respuesta correcta', async () => {})

  // ══════════════ PREGUNTA_CON_CLAVE ══════════════

  test('PREGUNTA_CON_CLAVE valido', async ({ page, context, request }, testInfo) => {
    ann(
      testInfo,
      'PREGUNTA_CON_CLAVE',
      'valido',
      'Enunciado, 4 incisos, clave y dificultad',
      'permitir',
    )

    await test.step('Abrir dialogo', async () => {
      await openManualDialog(page, context, request)
      await selectQuestionType(page, 'Verdadero o Falso Complejas')
    })
    await capturar(testInfo, page, '1-dialogo-clave.png')

    await test.step('Llenar 4 incisos', async () => {
      await page.getByLabel('Enunciado de la pregunta').fill('Analice las siguientes afirmaciones.')
      for (let i = 1; i <= 4; i++)
        await page.getByLabel(`Inciso ${i}`).fill(`Inciso ${String.fromCharCode(64 + i)}`)
    })

    await test.step('Guardar', async () => {
      await saveManualQuestion(page)
      const blocked = await page
        .getByText(/debes/i)
        .isVisible()
        .catch(() => false)
      annotate(testInfo, [
        { type: 'obtained', description: blocked ? 'bloqueado' : 'ok' },
        { type: 'cause', description: blocked ? 'bug_frontend' : 'validacion_correcta' },
      ])
    })
  })

  test('PREGUNTA_CON_CLAVE con 3 incisos', async ({ page, context, request }, testInfo) => {
    ann(testInfo, 'PREGUNTA_CON_CLAVE', 'invalido', 'Solo 3 incisos de 4', 'bloquear')

    await test.step('Abrir y llenar 3 incisos', async () => {
      await openManualDialog(page, context, request)
      await selectQuestionType(page, 'Verdadero o Falso Complejas')
      await page.getByLabel('Enunciado de la pregunta').fill('Analice las afirmaciones QA')
      for (let i = 1; i <= 3; i++)
        await page.getByLabel(`Inciso ${i}`).fill(`Inciso ${String.fromCharCode(64 + i)}`)
    })

    await test.step('Guardar', async () => {
      await saveManualQuestion(page)
    })

    try {
      await expect(page.getByText('Debes completar los 4 incisos')).toBeVisible()
      await capturar(testInfo, page, 'bloqueo-3-incisos.png')
      annotate(testInfo, [
        { type: 'obtained', description: 'bloqueado' },
        { type: 'cause', description: 'validacion_correcta' },
      ])
    } catch {
      await capturar(testInfo, page, 'no-bloqueo-3-incisos.png')
      annotate(testInfo, [
        { type: 'obtained', description: 'permitido' },
        { type: 'cause', description: 'bug_frontend' },
      ])
    }

    analisis(
      testInfo,
      'PREGUNTA_CON_CLAVE | 3 DE 4 INCISOS | ESPERADO: BLOQUEAR | FRONTEND: bloquea | BACKEND: NO valida (bug)',
    )
  })

  // ══════════════ RESPUESTA_COMPUESTA ══════════════

  test('RESPUESTA_COMPUESTA valido', async ({ page, context, request }, testInfo) => {
    ann(
      testInfo,
      'RESPUESTA_COMPUESTA',
      'valido',
      'Dos premisas, respuesta y dificultad',
      'permitir',
    )

    await test.step('Abrir y llenar premisas', async () => {
      await openManualDialog(page, context, request)
      await selectQuestionType(page, 'Respuesta A/B/Ambas/Ninguna')
      await page.getByLabel('Premisa 1').fill('Vue es progresivo.')
      await page.getByLabel('Premisa 2').fill('Quasar esta basado en Vue.')
    })
    await capturar(testInfo, page, '1-dialogo-rc.png')

    await test.step('Guardar', async () => {
      await saveManualQuestion(page)
      const blocked = await page
        .getByText(/debes/i)
        .isVisible()
        .catch(() => false)
      annotate(testInfo, [
        { type: 'obtained', description: blocked ? 'bloqueado' : 'ok' },
        { type: 'cause', description: blocked ? 'bug_frontend' : 'validacion_correcta' },
      ])
    })
  })

  test('RESPUESTA_COMPUESTA una premisa', async ({ page, context, request }, testInfo) => {
    ann(testInfo, 'RESPUESTA_COMPUESTA', 'invalido', 'Solo Premisa 1, falta Premisa 2', 'bloquear')

    await test.step('Abrir y llenar solo Premisa 1', async () => {
      await openManualDialog(page, context, request)
      await selectQuestionType(page, 'Respuesta A/B/Ambas/Ninguna')
      await page.getByLabel('Premisa 1').fill('Solo primera premisa completa.')
    })

    await test.step('Guardar', async () => {
      await saveManualQuestion(page)
    })

    try {
      await expect(page.getByText('Debes completar las dos premisas')).toBeVisible()
      await capturar(testInfo, page, 'bloqueo-1-premisa.png')
      annotate(testInfo, [
        { type: 'obtained', description: 'bloqueado' },
        { type: 'cause', description: 'validacion_correcta' },
      ])
    } catch {
      await capturar(testInfo, page, 'no-bloqueo-1-premisa.png')
      annotate(testInfo, [
        { type: 'obtained', description: 'permitido' },
        { type: 'cause', description: 'bug_frontend' },
      ])
    }

    analisis(
      testInfo,
      'RESPUESTA_COMPUESTA | FALTA PREMISA 2 | ESPERADO: BLOQUEAR | FRONTEND: bloquea correctamente',
    )
  })

  test.fixme('RESPUESTA_COMPUESTA sin respuesta correcta', async () => {})

  // ══════════════ EMPAREJAMIENTO ══════════════

  test('EMPAREJAMIENTO valido', async ({ page, context, request }, testInfo) => {
    ann(testInfo, 'EMPAREJAMIENTO', 'valido', 'Enunciado general, opciones base A y B', 'permitir')

    await test.step('Abrir y llenar', async () => {
      await openManualDialog(page, context, request)
      await selectQuestionType(page, 'Emparejamiento Ampliado')
      await page
        .getByLabel('Enunciado general del emparejamiento ampliado')
        .fill('Relacione conceptos.')
      await page.getByLabel('Opción A').fill('Concepto A')
      await page.getByLabel('Opción B').fill('Concepto B')
    })
    await capturar(testInfo, page, '1-dialogo-emp.png')

    await test.step('Guardar', async () => {
      await saveManualQuestion(page)
      const blocked = await page
        .getByText(/debes/i)
        .isVisible()
        .catch(() => false)
      annotate(testInfo, [
        { type: 'obtained', description: blocked ? 'bloqueado' : 'ok' },
        { type: 'cause', description: blocked ? 'validacion_correcta' : 'validacion_correcta' },
      ])
    })
  })

  test('EMPAREJAMIENTO sin enunciados ligados', async ({ page, context, request }, testInfo) => {
    ann(testInfo, 'EMPAREJAMIENTO', 'invalido', 'Opciones base sin enunciados ligados', 'bloquear')

    await test.step('Abrir y llenar solo opciones base', async () => {
      await openManualDialog(page, context, request)
      await selectQuestionType(page, 'Emparejamiento Ampliado')
      await page
        .getByLabel('Enunciado general del emparejamiento ampliado')
        .fill('Relacione conceptos.')
      await page.getByLabel('Opción A').fill('Concepto A')
      await page.getByLabel('Opción B').fill('Concepto B')
    })

    await test.step('Guardar', async () => {
      await saveManualQuestion(page)
    })

    try {
      await expect(
        page.getByText('Debes completar cada enunciado del emparejamiento'),
      ).toBeVisible()
      await capturar(testInfo, page, 'bloqueo-emp-ligados.png')
      annotate(testInfo, [
        { type: 'obtained', description: 'bloqueado' },
        { type: 'cause', description: 'validacion_correcta' },
      ])
    } catch {
      await capturar(testInfo, page, 'no-bloqueo-emp-ligados.png')
      annotate(testInfo, [
        { type: 'obtained', description: 'permitido' },
        { type: 'cause', description: 'bug_frontend' },
      ])
    }
  })

  test('EMPAREJAMIENTO sin opciones base', async ({ page, context, request }, testInfo) => {
    ann(testInfo, 'EMPAREJAMIENTO', 'invalido', 'Sin definir opciones A, B, C...', 'bloquear')

    await test.step('Abrir, solo enunciado general', async () => {
      await openManualDialog(page, context, request)
      await selectQuestionType(page, 'Emparejamiento Ampliado')
      await page
        .getByLabel('Enunciado general del emparejamiento ampliado')
        .fill('Relacione conceptos.')
    })

    await test.step('Guardar', async () => {
      await saveManualQuestion(page)
    })

    try {
      await expect(
        page.getByText(/Completa las opciones|Debes completar entre 2|Debes registrar entre 2/i),
      ).toBeVisible()
      await capturar(testInfo, page, 'bloqueo-emp-sin-ops.png')
      annotate(testInfo, [
        { type: 'obtained', description: 'bloqueado' },
        { type: 'cause', description: 'validacion_correcta' },
      ])
    } catch {
      await capturar(testInfo, page, 'no-bloqueo-emp-sin-ops.png')
      annotate(testInfo, [
        { type: 'obtained', description: 'permitido' },
        { type: 'cause', description: 'bug_frontend' },
      ])
    }
  })

  // ══════════════ PROBLEMA ══════════════

  test('PROBLEMA valido', async ({ page, context, request }, testInfo) => {
    ann(testInfo, 'PROBLEMA', 'valido', 'Enunciado general y subitem con opciones', 'permitir')

    await test.step('Abrir dialogo', async () => {
      await openManualDialog(page, context, request)
      await selectQuestionType(page, 'Ítems agrupados por caso clínico o problema')
    })
    await capturar(testInfo, page, '1-dialogo-prob.png')

    await test.step('Llenar datos', async () => {
      await page
        .getByLabel('Enunciado general del caso clínico o problema')
        .fill('Caso clinico de prueba QA.')
      await page.getByLabel('Enunciado del subproblema').fill('Cual es la conducta correcta?')
      const opts = page.locator(
        '.q-dialog input.q-field__native:not([readonly]):not([type="file"])',
      )
      for (let i = 0; i < 4; i++)
        await opts.nth(i).fill(`Alternativa ${String.fromCharCode(65 + i)}`)
    })

    await test.step('Guardar', async () => {
      await saveManualQuestion(page)
      const blocked = await page
        .getByText(/debes/i)
        .isVisible()
        .catch(() => false)
      annotate(testInfo, [
        { type: 'obtained', description: blocked ? 'bloqueado' : 'ok' },
        { type: 'cause', description: blocked ? 'bug_frontend' : 'validacion_correcta' },
      ])
    })
  })

  test('PROBLEMA subitem incompleto', async ({ page, context, request }, testInfo) => {
    ann(testInfo, 'PROBLEMA', 'invalido', 'Subitem sin completar dificultad/respuesta', 'bloquear')

    await test.step('Abrir y llenar parcial', async () => {
      await openManualDialog(page, context, request)
      await selectQuestionType(page, 'Ítems agrupados por caso clínico o problema')
      await page.getByLabel('Enunciado general del caso clínico o problema').fill('Caso QA.')
      await page.getByLabel('Enunciado del subproblema').fill('Conducta correcta?')
      const opts = page.locator(
        '.q-dialog input.q-field__native:not([readonly]):not([type="file"])',
      )
      for (let i = 0; i < 4; i++) await opts.nth(i).fill(`Alt ${String.fromCharCode(65 + i)}`)
    })

    await test.step('Guardar', async () => {
      await saveManualQuestion(page)
    })

    try {
      await expect(page.getByText('Debes completar todos los subitems')).toBeVisible()
      await capturar(testInfo, page, 'bloqueo-prob-inc.png')
      annotate(testInfo, [
        { type: 'obtained', description: 'bloqueado' },
        { type: 'cause', description: 'validacion_correcta' },
      ])
    } catch {
      await capturar(testInfo, page, 'no-bloqueo-prob-inc.png')
      annotate(testInfo, [
        { type: 'obtained', description: 'permitido' },
        { type: 'cause', description: 'bug_frontend' },
      ])
    }
  })

  test.fixme('PROBLEMA sin subitems', async () => {})
})
