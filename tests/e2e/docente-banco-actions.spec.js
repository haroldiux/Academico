import { test, expect } from '@playwright/test'
import { hasUiCredentials } from '../support/env.js'
import {
  openDocenteAsignatura,
  seedDocenteSession,
  selectBancoContext,
} from '../support/ui-helpers.js'

const LOG = (...args) => console.log(`[TEST] [E2E:Actions]`, ...args)

test.describe('Banco docente acciones clave', () => {
  test.skip(!hasUiCredentials, 'Faltan credenciales UI del docente.')

  test('permite abrir la validación del banco en el contexto activo', async ({
    page,
    context,
    request,
  }) => {
    LOG('INICIO: Abrir validacion del banco')
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)
    await selectBancoContext(page)
    await page.getByRole('button', { name: /validar banco/i }).click()
    LOG('  → Boton "Validar Banco" clickeado')
    await expect(page.getByText(/no hay preguntas para validar|validación/i)).toBeVisible()
    LOG('  ✓ Panel de validacion visible')
    LOG('PASS: Validacion del banco abierta correctamente')
  })

  test('permite abrir el flujo de cambio Con Cartilla / Sin Cartilla', async ({
    page,
    context,
    request,
  }) => {
    LOG('INICIO: Abrir flujo Con/Sin Cartilla')
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)
    await selectBancoContext(page)
    await page.getByRole('button', { name: /subir banco excel/i }).click()
    LOG('  → Boton "Subir Banco Excel" clickeado')
    await expect(page.getByText(/subir banco de preguntas/i)).toBeVisible()
    LOG('  ✓ Dialogo de subida visible')
    await expect(page.getByRole('button', { name: 'Con Cartilla', exact: true })).toBeVisible()
    LOG('  ✓ Boton "Con Cartilla" visible')
    await expect(page.getByRole('button', { name: 'Sin Cartilla' })).toBeVisible()
    LOG('  ✓ Boton "Sin Cartilla" visible')
    LOG('PASS: Flujo Con/Sin Cartilla abierto')
  })

  test('mantiene el preview deshabilitado o advertido si no hay banco suficiente', async ({
    page,
    context,
    request,
  }) => {
    LOG('INICIO: Verificar preview deshabilitado sin banco suficiente')
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)
    await selectBancoContext(page)
    const previewButton = page.getByRole('button', { name: /previsualizar examen/i })
    await expect(previewButton).toBeVisible()
    LOG('  ✓ Boton "Previsualizar Examen" visible')
    await expect(previewButton).toBeDisabled({ timeout: 5_000 })
    LOG('  ✓ Boton deshabilitado (sin banco suficiente)')
    LOG('PASS: Preview correctamente deshabilitado')
  })
})
