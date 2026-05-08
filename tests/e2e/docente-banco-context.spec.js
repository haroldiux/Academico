import { test, expect } from '@playwright/test'
import { hasUiCredentials } from '../support/env.js'
import { openDocenteAsignatura, seedDocenteSession, selectBancoContext } from '../support/ui-helpers.js'

test.describe('Banco docente contexto y habilitación', () => {
  test.skip(!hasUiCredentials, 'Faltan credenciales UI del docente.')

  test('@smoke abre una asignatura y muestra el banco real', async ({ page, context, request }) => {
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)
    await expect(page.getByText(/banco de preguntas/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /2do parcial/i })).toBeVisible()
  })

  test('requiere parcial y grupo para habilitar la gestión del banco', async ({ page, context, request }) => {
    await seedDocenteSession(page, context, request)
    await openDocenteAsignatura(page)

    await expect(page.getByText(/selecciona el parcial que gobernará este banco/i)).toBeVisible()
    await selectBancoContext(page)
    // Verificar que el tab "Banco de Preguntas" sigue visible en el panel activo
    await expect(page.locator('.q-tab__label').filter({ hasText: /banco de preguntas/i })).toBeVisible()
  })
})
