import { test, expect } from '@playwright/test'
import { hasUiCredentials } from '../support/env.js'
import {
  openDocenteAsignatura,
  seedDocenteSession,
  selectBancoContext,
} from '../support/ui-helpers.js'

test.describe('Banco docente acciones clave', () => {
  test.skip(!hasUiCredentials, 'Faltan credenciales UI del docente.')

  test('permite abrir la validación del banco en el contexto activo', async ({
    page,
    context,
    request,
  }) => {
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)
    await selectBancoContext(page)
    await page.getByRole('button', { name: /validar banco/i }).click()
    await expect(page.getByText(/no hay preguntas para validar|validación/i)).toBeVisible()
  })

  test('permite abrir el flujo de cambio Con Cartilla / Sin Cartilla', async ({
    page,
    context,
    request,
  }) => {
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)
    await selectBancoContext(page)
    await page.getByRole('button', { name: /subir banco excel/i }).click()
    await expect(page.getByText(/subir banco de preguntas/i)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Con Cartilla', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sin Cartilla' })).toBeVisible()
  })

  test('mantiene el preview deshabilitado o advertido si no hay banco suficiente', async ({
    page,
    context,
    request,
  }) => {
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)
    await selectBancoContext(page)
    const previewButton = page.getByRole('button', { name: /previsualizar examen/i })
    await expect(previewButton).toBeVisible()
    await expect(previewButton).toBeDisabled({ timeout: 5_000 })
  })
})
