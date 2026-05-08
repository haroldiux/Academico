import { test, expect } from '@playwright/test'
import { hasUiCredentials } from '../support/env.js'
import { openDocenteAsignatura, seedDocenteSession, selectBancoContext } from '../support/ui-helpers.js'

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

  test('bloquea FALSO_VERDADERO sin enunciado', async ({ page, context, request }) => {
    await openManualDialog(page, context, request)
    await selectQuestionType(page, 'Verdadero o Falso Simple')
    await saveManualQuestion(page)
    await expect(page.getByText('Debes registrar el enunciado principal.')).toBeVisible()
  })

  test('bloquea RESPUESTA_COMPUESTA con premisas incompletas', async ({ page, context, request }) => {
    await openManualDialog(page, context, request)
    await selectQuestionType(page, 'Respuesta A/B/Ambas/Ninguna')
    await page.getByLabel('Premisa 1').fill('La primera premisa está completa')
    await saveManualQuestion(page)
    await expect(
      page.getByText('Debes completar las dos premisas de la respuesta A/B/Ambas/Ninguna.'),
    ).toBeVisible()
  })

  test('bloquea PREGUNTA_CON_CLAVE con incisos faltantes', async ({ page, context, request }) => {
    await openManualDialog(page, context, request)
    await selectQuestionType(page, 'Verdadero o Falso Complejas')
    await page.getByLabel('Enunciado de la pregunta').fill('Analice las siguientes afirmaciones')
    await page.getByLabel('Inciso 1').fill('Inciso A')
    await page.getByLabel('Inciso 2').fill('Inciso B')
    await page.getByLabel('Inciso 3').fill('Inciso C')
    await saveManualQuestion(page)
    await expect(
      page.getByText('Debes completar los 4 incisos de verdadero o falso complejas.'),
    ).toBeVisible()
  })

  test('bloquea SELECCION_SIMPLE con opciones faltantes', async ({ page, context, request }) => {
    await openManualDialog(page, context, request)
    await selectQuestionType(page, 'Selección de la mejor respuesta')
    await page.getByLabel('Enunciado de la pregunta').fill('Pregunta de mejor respuesta')
    const optionInputs = page.locator('.q-dialog .q-input input')
    await optionInputs.nth(3).fill('Opción A')
    await optionInputs.nth(4).fill('Opción B')
    await optionInputs.nth(5).fill('Opción C')
    await optionInputs.nth(6).fill('Opción D')
    await saveManualQuestion(page)
    await expect(
      page.getByText('Debes completar las 5 opciones de la selección de la mejor respuesta.'),
    ).toBeVisible()
  })

  test('bloquea EMPAREJAMIENTO con opciones ligadas incompletas', async ({ page, context, request }) => {
    await openManualDialog(page, context, request)
    await selectQuestionType(page, 'Emparejamiento Ampliado')
    await page.getByLabel('Enunciado general del emparejamiento ampliado').fill(
      'Relacione cada concepto con su definición.',
    )
    await page.getByLabel('Opción A').fill('Concepto A')
    await page.getByLabel('Opción B').fill('Concepto B')
    await saveManualQuestion(page)
    await expect(
      page.getByText(
        'Debes completar cada opción de emparejamiento con enunciado, dificultad y una respuesta válida según las claves activas.',
      ),
    ).toBeVisible()
  })

  test('bloquea PROBLEMA con subítem incompleto', async ({ page, context, request }) => {
    await openManualDialog(page, context, request)
    await selectQuestionType(page, 'Ítems agrupados por caso clínico o problema')
    await page.getByLabel('Enunciado general del caso clínico o problema').fill(
      'Caso clínico de validación QA.',
    )
    await page.getByLabel('Enunciado del subproblema').fill('¿Cuál es la conducta correcta?')
    const optionInputs = page.locator(
      '.q-dialog input.q-field__native:not([readonly]):not([type="file"])',
    )
    await optionInputs.nth(0).fill('Alternativa A')
    await optionInputs.nth(1).fill('Alternativa B')
    await optionInputs.nth(2).fill('Alternativa C')
    await optionInputs.nth(3).fill('Alternativa D')
    await saveManualQuestion(page)
    await expect(
      page.getByText('Debes completar todos los subítems con opciones, dificultad y respuesta.'),
    ).toBeVisible()
  })
})
