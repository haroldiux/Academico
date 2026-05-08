import { test, expect } from '@playwright/test'
import { hasUiCredentials, testEnv } from '../support/env.js'
import { loginAsDocente } from '../support/ui-helpers.js'

test.describe('Flujo docente autenticación', () => {
  test.skip(!hasUiCredentials, 'Faltan credenciales UI del docente.')

  test('@smoke login docente exitoso y acceso a Documentación Académica', async ({ page }) => {
    await loginAsDocente(page)
    await expect(page.getByRole('main').getByText(/mis asignaturas/i)).toBeVisible()
    await expect(page.getByText(/documentación académica/i)).toBeVisible()
  })

  test('rechaza credenciales inválidas', async ({ page }) => {
    await page.goto('/#/login')
    await page.getByLabel(/usuario|username/i).fill(`${testEnv.docenteUsername}-bad`)
    await page.getByLabel(/contraseñ|password/i).fill('credencial-invalida')
    await page.getByRole('button', { name: /iniciar sesión|ingresar|entrar/i }).click()
    await expect(page).toHaveURL(/#\/login/)
    await expect(page.getByRole('heading', { name: /bienvenido/i })).toBeVisible()
  })
})
