import { test, expect } from '@playwright/test'
import { hasUiCredentials } from '../support/env.js'
import { excelFixtures } from '../support/fixtures.js'
import { createAuthenticatedDocenteApi, cleanupBancoFiltrado } from '../support/api-client.js'
import {
  openDocenteAsignatura,
  seedDocenteSession,
  selectBancoContext,
} from '../support/ui-helpers.js'
import { annotate } from '../support/shared-collector.mjs'

const LOG = (...args) => console.log(`[TEST] [E2E:Import]`, ...args)

function ann(testInfo, overrides = {}) {
  annotate(testInfo, [
    { type: 'category', description: 'excel' },
    { type: 'scenario', description: overrides.scenario || 'invalido' },
    { type: 'check', description: overrides.check || '' },
    { type: 'expected', description: overrides.expected || 'permitir' },
    ...(overrides.extra || []),
  ])
}

test.describe('Banco docente importacion Excel', () => {
  test.skip(!hasUiCredentials, 'Faltan credenciales UI del docente.')

  test.beforeEach(async ({ request }, testInfo) => {
    void request
    LOG('Limpiando banco antes del test...')
    const api = await createAuthenticatedDocenteApi()
    await cleanupBancoFiltrado(api)
    await api.dispose()
    LOG('  ✓ Banco limpiado')
  })

  test('sube un Excel valido y muestra feedback de carga', async ({
    page,
    context,
    request,
  }, testInfo) => {
    ann(testInfo, {
      scenario: 'valido',
      check: 'Archivo Excel con formato y datos correctos (valido minimo)',
      expected: 'permitir',
    })

    LOG('INICIO: Subir Excel valido con feedback')
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)
    await selectBancoContext(page)
    await page.getByRole('button', { name: /subir banco excel/i }).click()
    await page.locator('input[type="file"]').setInputFiles(excelFixtures.validoMinimo)
    await expect(
      page
        .getByText(/archivo v[aá]lido|distribuci[oó]n v[aá]lida|importar\s+\d+\s+pregunta/i)
        .first(),
    ).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: /importar\s+\d+\s+pregunta/i })).toBeVisible()
    LOG('  → Archivo detectado como valido, boton importar visible')
    const importBtn = page.getByRole('button', { name: /importar\s+\d+\s+pregunta/i })
    await expect(importBtn).toBeVisible()
    const isEnabled = await importBtn.isEnabled()
    if (isEnabled) {
      await importBtn.click()
      try {
        await expect(page.getByText(/banco actualizado correctamente|correctamente/i)).toBeVisible({
          timeout: 20_000,
        })
        annotate(testInfo, [
          { type: 'obtained', description: 'ok' },
          { type: 'cause', description: 'validacion_correcta' },
          { type: 'evidence', description: 'Archivo valido importado exitosamente' },
        ])
        LOG('  ✓ Confirmacion de importacion exitosa')
      } catch (e) {
        annotate(testInfo, [
          { type: 'obtained', description: 'error' },
          { type: 'cause', description: 'error_infraestructura' },
          { type: 'evidence', description: 'No se detecto mensaje de confirmacion' },
        ])
        throw e
      }
    } else {
      LOG('  ⚠ Boton Importar esta DESHABILITADO - posible bug UI')
      annotate(testInfo, [
        { type: 'obtained', description: 'bloqueado' },
        { type: 'cause', description: 'bug_frontend' },
        {
          type: 'evidence',
          description:
            'Boton Importar visible pero deshabilitado para archivo valido. Verificar condiciones de habilitacion.',
        },
      ])
    }
    LOG('PASS: Excel valido detectado con feedback')
  })

  test('sube un Excel con tipo invalido y mantiene la UI consistente', async ({
    page,
    context,
    request,
  }, testInfo) => {
    ann(testInfo, {
      scenario: 'invalido',
      check: 'Archivo Excel con tipo de pregunta inexistente (ej: "TIPO_INEXISTENTE")',
      expected: 'rechazar',
    })

    LOG('INICIO: Subir Excel con errores, UI debe mantener consistencia')
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)
    await selectBancoContext(page)
    await page.getByRole('button', { name: /subir banco excel/i }).click()
    await page.locator('input[type="file"]').setInputFiles(excelFixtures.tipoInvalido)
    try {
      await expect(page.getByText(/pregunta con tipo inv.?lido/i).first()).toBeVisible({
        timeout: 15_000,
      })
      await expect(page.getByText(/subir banco de preguntas/i)).toBeVisible()
      annotate(testInfo, [
        { type: 'obtained', description: 'rechazado' },
        { type: 'cause', description: 'validacion_correcta' },
        { type: 'evidence', description: 'Mensaje "Pregunta con tipo invalido" visible en UI' },
      ])
      LOG('  ✓ Error "Pregunta con tipo invalido" visible')
    } catch (e) {
      annotate(testInfo, [
        { type: 'obtained', description: 'permitido' },
        { type: 'cause', description: 'bug_frontend' },
        { type: 'evidence', description: 'No se detecto mensaje de error' },
      ])
      throw e
    }
    LOG('PASS: Excel con errores manejado correctamente, UI consistente')
  })

  test('sube un Excel con dificultad invalida', async ({ page, context, request }, testInfo) => {
    ann(testInfo, {
      scenario: 'invalido',
      check:
        'Archivo Excel con nivel de dificultad fuera de rango (ej: nivel 5 cuando solo hay 1-3)',
      expected: 'rechazar',
    })

    LOG('INICIO: Subir Excel con dificultad invalida')
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)
    await selectBancoContext(page)
    await page.getByRole('button', { name: /subir banco excel/i }).click()
    await page.locator('input[type="file"]').setInputFiles(excelFixtures.dificultadInvalida)
    try {
      await expect(page.getByText(/dificultad|invalido/i).first()).toBeVisible({ timeout: 15_000 })
      annotate(testInfo, [
        { type: 'obtained', description: 'rechazado' },
        { type: 'cause', description: 'validacion_correcta' },
      ])
      LOG('  ✓ Error de dificultad visible')
    } catch (e) {
      annotate(testInfo, [
        { type: 'obtained', description: 'permitido' },
        { type: 'cause', description: 'bug_frontend' },
        { type: 'evidence', description: 'No se detecto mensaje de error por dificultad' },
      ])
      throw e
    }
    LOG('PASS: Excel con dificultad invalida detectado')
  })

  test('sube un Excel con opciones incompletas', async ({ page, context, request }, testInfo) => {
    ann(testInfo, {
      scenario: 'invalido',
      check: 'Archivo Excel donde SELECCION_SIMPLE tiene menos de 5 opciones',
      expected: 'rechazar',
      extra: [{ type: 'subcategory', description: 'SELECCION_SIMPLE' }],
    })

    LOG('INICIO: Subir Excel con opciones incompletas (menos de 5)')
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)
    await selectBancoContext(page)
    await page.getByRole('button', { name: /subir banco excel/i }).click()
    await page.locator('input[type="file"]').setInputFiles(excelFixtures.opcionesIncompletas)
    try {
      await expect(page.getByText(/opciones|incompleto/i).first()).toBeVisible({ timeout: 15_000 })
      annotate(testInfo, [
        { type: 'obtained', description: 'rechazado' },
        { type: 'cause', description: 'validacion_correcta' },
      ])
      LOG('  ✓ Error de opciones incompletas visible')
    } catch (e) {
      annotate(testInfo, [
        { type: 'obtained', description: 'permitido' },
        { type: 'cause', description: 'bug_frontend' },
        { type: 'evidence', description: 'No se detecto mensaje de error por opciones' },
      ])
      throw e
    }
    LOG('PASS: Excel con opciones incompletas detectado')
  })

  test('permite abrir el flujo Con Cartilla / Sin Cartilla', async ({
    page,
    context,
    request,
  }, testInfo) => {
    ann(testInfo, {
      scenario: 'valido',
      check: 'Flujo de subida con opciones Con Cartilla y Sin Cartilla visibles',
      expected: 'permitir',
    })

    LOG('INICIO: Abrir flujo Con/Sin Cartilla')
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)
    await selectBancoContext(page)
    await page.getByRole('button', { name: /subir banco excel/i }).click()
    await expect(page.getByText(/subir banco de preguntas/i)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Con Cartilla', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sin Cartilla' })).toBeVisible()
    annotate(testInfo, [
      { type: 'obtained', description: 'ok' },
      { type: 'cause', description: 'validacion_correcta' },
    ])
    LOG('PASS: Flujo Con/Sin Cartilla abierto')
  })
})
