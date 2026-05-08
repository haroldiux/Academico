import { expect } from '@playwright/test'
import { testEnv } from './env.js'

let cachedBrowserAuth = null

export async function loginAsDocente(page) {
  await page.goto('/#/login')
  await page.getByLabel(/usuario|username/i).fill(testEnv.docenteUsername)
  await page.getByLabel(/contraseñ|password/i).fill(testEnv.docentePassword)
  await page.getByRole('button', { name: /iniciar sesión|ingresar|entrar/i }).click()
  await page.waitForURL((url) => !url.hash.includes('/login'), { timeout: 15_000 })
  await page.waitForTimeout(1000)
}

function normalizeDocenteUser(user) {
  return {
    id: user?.id || null,
    nombre: `${user?.nombre || ''} ${user?.apellido || ''}`.trim() || user?.username || 'Docente',
    email: user?.email || null,
    ci: user?.ci || testEnv.docenteUsername,
    rol: 'DOCENTE',
    sede_id: user?.docente?.sede_id || Number(testEnv.docenteSedeId || 0) || null,
    carrera_id: user?.director?.carrera_id || user?.carrera_id || Number(testEnv.docenteCarreraId || 0) || null,
    avatar: `${(user?.nombre || 'D')[0]}${(user?.apellido || '')[0] || ''}`,
    docente: user?.docente || {
      id: Number(testEnv.docenteDocenteId || 0) || null,
      sede_id: Number(testEnv.docenteSedeId || 0) || null,
    },
    materias_asignadas: [],
    carreras: [],
    grupos: user?.docente?.grupos || [],
  }
}

export async function seedDocenteSession(page, context, request) {
  if (!cachedBrowserAuth) {
    const response = await request.post(`${testEnv.apiBaseUrl}/login`, {
      data: {
        username: testEnv.docenteUsername,
        password: testEnv.docentePassword,
      },
      headers: {
        Accept: 'application/json',
      },
    })

    expect(response.ok()).toBeTruthy()
    const payload = await response.json()
    expect(payload?.token).toBeTruthy()
    expect(payload?.user).toBeTruthy()

    cachedBrowserAuth = {
      token: payload.token,
      authUser: normalizeDocenteUser(payload.user),
    }
  }

  await context.setExtraHTTPHeaders({
    Accept: 'application/json',
    Authorization: `Bearer ${cachedBrowserAuth.token}`,
  })

  await context.addInitScript(({ token, authUser }) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(authUser))
    localStorage.setItem(
      'auth',
      JSON.stringify({
        usuarioActual: authUser,
        isAuthenticated: true,
        token,
        passwordChangeRequired: false,
      }),
    )
  }, cachedBrowserAuth)

  await page.goto('/#/documentacion')
}

export async function openDocenteAsignatura(page) {
  const asignaturaId = testEnv.docenteAsignaturaId || '1646'
  const carreraId = testEnv.docenteCarreraId || '12'
  const sedeId = testEnv.docenteSedeId || '1'
  const docenteId = testEnv.docenteDocenteId || '134'

  await page.goto(`/#/documentacion/${asignaturaId}?carrera_id=${carreraId}&sede_id=${sedeId}&docente_id=${docenteId}`)
  // Esperar a que la página termine de cargar: el título ya no debe decir "Cargando..."
  await expect(page.locator('h4')).not.toContainText('Cargando', { timeout: 15_000 })
  await expect(page.getByText(/banco de preguntas/i)).toBeVisible({ timeout: 15_000 })
}

export async function selectBancoContext(page, grupo = testEnv.docenteGrupo) {
  await expect(page.locator('h4')).not.toContainText('Cargando', { timeout: 15_000 })

  await page.getByRole('button', { name: /2do parcial/i }).click()

  const groupSelect = page.locator('.q-select').first()
  await expect(groupSelect).toBeVisible({ timeout: 10_000 })
  await groupSelect.click()

  const expectedOption = page.locator('.q-menu .q-item').filter({ hasText: grupo })
  const fallbackOption = page.locator('.q-menu .q-item').filter({ hasText: /grupo/i }).first()

  if (await expectedOption.count()) {
    await expectedOption.first().click()
  } else {
    await expect(fallbackOption).toBeVisible({ timeout: 10_000 })
    await fallbackOption.click()
  }

  await expect(groupSelect).toContainText(grupo, { timeout: 10_000 })
}

export async function uploadBancoExcel(page, filePath) {
  await page.getByRole('button', { name: /subir banco|importar|cargar/i }).click()
  await page.setInputFiles('input[type="file"]', filePath)
}
