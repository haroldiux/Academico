import { test, expect } from '@playwright/test'
import { hasUiCredentials, testEnv } from '../support/env.js'
import { loginAsDocente } from '../support/ui-helpers.js'

const LOG = (...args) => console.log(`[TEST] [E2E:Auth]`, ...args)

test.describe('Flujo docente autenticación', () => {
  test.skip(!hasUiCredentials, 'Faltan credenciales UI del docente.')

  test('@smoke login docente exitoso y acceso a Documentación Académica', async ({ page }) => {
    LOG('INICIO: Login docente exitoso')
    await loginAsDocente(page)
    await expect(page.getByRole('main').getByText(/mis asignaturas/i)).toBeVisible()
    LOG('  ✓ "Mis Asignaturas" visible')
    await expect(page.getByText(/documentación académica/i)).toBeVisible()
    LOG('  ✓ "Documentación Académica" visible')
    LOG('PASS: Login docente exitoso y acceso a Documentacion Academica')
  })

  test('rechaza credenciales inválidas', async ({ page }) => {
    LOG('INICIO: Rechazo de credenciales invalidas')
    await page.goto('/#/login')
    const badUser = `${testEnv.docenteUsername}-bad`
    LOG(`  Usuario invalido: ${badUser}`)
    await page.getByLabel(/usuario|username/i).fill(badUser)
    await page.getByLabel(/contraseñ|password/i).fill('credencial-invalida')
    await page.getByRole('button', { name: /iniciar sesión|ingresar|entrar/i }).click()
    await expect(page).toHaveURL(/#\/login/)
    LOG('  ✓ URL permanece en /login')
    await expect(page.getByRole('heading', { name: /bienvenido/i })).toBeVisible()
    LOG('  ✓ Pantalla de login sigue visible')
    LOG('PASS: Rechazo de credenciales invalidas correcto')
  })
})
