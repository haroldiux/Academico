import { test, expect } from '@playwright/test'
import { hasUiCredentials } from '../support/env.js'
import { excelFixtures } from '../support/fixtures.js'
import { createAuthenticatedDocenteApi, cleanupBancoFiltrado } from '../support/api-client.js'
import {
  openDocenteAsignatura,
  seedDocenteSession,
  selectBancoContext,
} from '../support/ui-helpers.js'

test.describe('Banco docente importación Excel', () => {
  test.skip(!hasUiCredentials, 'Faltan credenciales UI del docente.')

  test.beforeEach(async () => {
    const api = await createAuthenticatedDocenteApi()
    await cleanupBancoFiltrado(api)
    await api.dispose()
  })

  test('sube un Excel válido y muestra feedback de carga', async ({ page, context, request }) => {
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)
    await selectBancoContext(page)
    await page.getByRole('button', { name: /subir banco excel/i }).click()
    await page.locator('input[type="file"]').setInputFiles(excelFixtures.validoMinimo)
    await expect(
      page.getByText(/archivo válido|distribución válida|importar\s+\d+\s+pregunta/i),
    ).toBeVisible({
      timeout: 15_000,
    })
    await page.getByRole('button', { name: /importar\s+\d+\s+pregunta/i }).click()
    await expect(page.getByText(/banco actualizado correctamente|correctamente/i)).toBeVisible({
      timeout: 20_000,
    })
  })

  test('sube un Excel con errores y mantiene la UI consistente', async ({
    page,
    context,
    request,
  }) => {
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)
    await selectBancoContext(page)
    await page.getByRole('button', { name: /subir banco excel/i }).click()
    await page.locator('input[type="file"]').setInputFiles(excelFixtures.tipoInvalido)
    await expect(page.getByText('Pregunta con tipo inválido').first()).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByText(/subir banco de preguntas/i)).toBeVisible()
  })
})
