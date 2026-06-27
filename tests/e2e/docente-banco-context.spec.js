import { test, expect } from '@playwright/test'
import { hasUiCredentials } from '../support/env.js'
import {
  openDocenteAsignatura,
  seedDocenteSession,
  selectBancoContext,
} from '../support/ui-helpers.js'

const LOG = (...args) => console.log(`[TEST] [E2E:Context]`, ...args)

test.describe('Banco docente contexto y habilitación', () => {
  test.skip(!hasUiCredentials, 'Faltan credenciales UI del docente.')

  test('@smoke abre una asignatura y muestra el banco real', async ({ page, context, request }) => {
    LOG('INICIO: Abrir asignatura y mostrar banco')
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)
    await expect(page.getByText(/banco de preguntas/i)).toBeVisible()
    LOG('  ✓ "Banco de Preguntas" visible')
    await expect(page.getByRole('button', { name: /2do parcial/i })).toBeVisible()
    LOG('  ✓ Boton "2do Parcial" visible')
    LOG('PASS: Asignatura abierta con banco visible')
  })

  test('requiere parcial y grupo para habilitar la gestión del banco', async ({
    page,
    context,
    request,
  }) => {
    LOG('INICIO: Verificar requisito de parcial y grupo')
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)

    await expect(page.getByText(/selecciona el parcial que gobernará este banco/i)).toBeVisible()
    LOG('  ✓ Mensaje de seleccion de parcial visible')
    await selectBancoContext(page)
    await expect(
      page.locator('.q-tab__label').filter({ hasText: /banco de preguntas/i }),
    ).toBeVisible()
    LOG('  ✓ Tab "Banco de Preguntas" visible en panel activo')
    LOG('PASS: Parcial y grupo requeridos para habilitar gestion')
  })
})
