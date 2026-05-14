import { expect } from '@playwright/test'
import { testEnv } from './env.js'
import { getSharedToken, getSharedUser, hasSharedToken } from './shared-auth.mjs'

const LOG = (...args) => console.log(`[TEST] [UI]`, ...args)

function logStep(step) {
  LOG(`  → ${step}`)
}
function logOk(step) {
  LOG(`  ✓ ${step}`)
}
function logFail(step) {
  LOG(`  ✗ ${step}`)
}
function logWarn(step) {
  LOG(`  ⚠ ${step}`)
}

export async function loginAsDocente(page) {
  LOG('Iniciando login como docente...')
  await page.goto('/#/login')
  logStep(`Usuario: ${testEnv.docenteUsername}`)
  await page.getByLabel(/usuario|username/i).fill(testEnv.docenteUsername)
  await page.getByLabel(/contraseñ|password/i).fill(testEnv.docentePassword)
  await page.getByRole('button', { name: /iniciar sesión|ingresar|entrar/i }).click()

  try {
    await page.waitForURL((url) => !url.hash.includes('/login'), { timeout: 15_000 })
    await page.waitForTimeout(1000)
    logOk('Login exitoso (redirect detectado)')
  } catch (_) {
    logWarn('Redirect no detectado. Verificando pagina actual...')
    const currentUrl = page.url()
    if (!currentUrl.includes('/login')) {
      logOk('Ya fuera de /login. Login exitoso.')
    } else {
      logFail('Login fallo - rate limit probable. Verificar backend.')
      throw new Error('Login UI fallo - posible rate limit del backend')
    }
  }
}

function normalizeDocenteUser(user) {
  if (!user) return null
  return {
    id: user?.id || null,
    nombre: `${user?.nombre || ''} ${user?.apellido || ''}`.trim() || user?.username || 'Docente',
    email: user?.email || null,
    ci: user?.ci || testEnv.docenteUsername,
    rol: 'DOCENTE',
    sede_id: user?.docente?.sede_id || Number(testEnv.docenteSedeId || 0) || null,
    carrera_id:
      user?.director?.carrera_id ||
      user?.carrera_id ||
      Number(testEnv.docenteCarreraId || 0) ||
      null,
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
  LOG('Sembrando sesion docente en el navegador...')

  const token = getSharedToken()
  const user = getSharedUser()

  if (!token || !user) {
    logStep('Token compartido no disponible. Intentando login via API...')
    const { createAuthenticatedDocenteApi } = await import('./api-client.js')
    const api = await createAuthenticatedDocenteApi()
    await api.dispose()
    if (!hasSharedToken()) {
      logFail('No se pudo obtener token compartido.')
      expect(false).toBeTruthy()
    }
  }

  const authUser = normalizeDocenteUser(getSharedUser() || user)
  const sharedToken = getSharedToken() || token

  await context.setExtraHTTPHeaders({
    Accept: 'application/json',
    Authorization: `Bearer ${sharedToken}`,
  })

  await context.addInitScript(
    ({ token: t, authUser: u }) => {
      localStorage.setItem('auth_token', t)
      localStorage.setItem('auth_user', JSON.stringify(u))
      localStorage.setItem(
        'auth',
        JSON.stringify({
          usuarioActual: u,
          isAuthenticated: true,
          token: t,
          passwordChangeRequired: false,
        }),
      )
    },
    { token: sharedToken, authUser },
  )

  await page.goto('/#/documentacion')
  logOk('Sesion sembrada en localStorage y pagina cargada')
}

export async function openDocenteAsignatura(page) {
  const asignaturaId = testEnv.docenteAsignaturaId || '1646'
  const carreraId = testEnv.docenteCarreraId || '12'
  const sedeId = testEnv.docenteSedeId || '1'
  const docenteId = testEnv.docenteDocenteId || '134'

  LOG(`Abriendo asignatura ID=${asignaturaId}...`)
  for (let intento = 1; intento <= 3; intento++) {
    await page.goto(
      `/#/documentacion/${asignaturaId}?carrera_id=${carreraId}&sede_id=${sedeId}&docente_id=${docenteId}`,
    )
    try {
      await expect(page.locator('h4')).not.toContainText('Cargando', { timeout: 30_000 })
      break
    } catch {
      if (intento < 3) {
        logWarn(`Pagina sigue en "Cargando..." (intento ${intento}/3). Recargando en 5s...`)
        await page.waitForTimeout(5000)
      } else {
        logFail('Pagina no cargo despues de 3 intentos. Posible rate-limit del backend.')
      }
    }
  }
  await expect(page.getByText(/banco de preguntas/i)).toBeVisible({ timeout: 15_000 })
  logOk('Asignatura cargada completamente')
}

export async function selectBancoContext(page, grupo = testEnv.docenteGrupo) {
  LOG(`Seleccionando contexto del banco (parcial=2P, grupo="${grupo}")...`)
  await expect(page.locator('h4')).not.toContainText('Cargando', { timeout: 15_000 })

  logStep('Clickeando boton "2do Parcial"')
  await page.getByRole('button', { name: /2do parcial/i }).click()
  await page.waitForTimeout(600)

  // --- Estrategia 1: Inyeccion directa del estado Vue (bypass QSelect) ---
  logStep('Intentando inyeccion de grupo via Vue state...')
  const injected = await page.evaluate((targetGrupo) => {
    try {
      const appEl = document.querySelector('#q-app')
      if (!appEl?.__vue_app__) return false

      const root = appEl.__vue_app__._instance
      if (!root) return false

      const visited = new Set()
      function walk(instance, depth) {
        if (depth > 200 || !instance || visited.has(instance)) return false
        visited.add(instance)

        const ss = instance.setupState
        if (ss && typeof ss === 'object' && 'filtroBancoGrupoSeleccionado' in ss) {
          ss.filtroBancoGrupoSeleccionado = targetGrupo
          return true
        }

        const subTree = instance.subTree
        if (!subTree) return false

        if (subTree.component) {
          if (walk(subTree.component, depth + 1)) return true
        }

        const children = Array.isArray(subTree.children) ? subTree.children : []
        for (const child of children) {
          if (child?.component && walk(child.component, depth + 1)) return true
        }

        const dynChildren = Array.isArray(subTree.dynamicChildren) ? subTree.dynamicChildren : []
        for (const child of dynChildren) {
          if (child?.component && walk(child.component, depth + 1)) return true
        }

        return false
      }

      return walk(root, 0)
    } catch (e) {
      return false
    }
  }, grupo)

  if (injected) {
    logOk(`Grupo "${grupo}" inyectado exitosamente via Vue state`)
    await page.waitForTimeout(600)
    return
  }

  logWarn('Inyeccion Vue fallo, intentando interaccion directa con QSelect...')

  // --- Estrategia 2: Interaccion nativa Playwright con QSelect ---
  const groupSelect = page.locator('.q-select').first()
  await expect(groupSelect).toBeVisible({ timeout: 10_000 })
  logStep('Abriendo dropdown del QSelect...')
  await groupSelect.click()
  await page.waitForTimeout(500)

  logStep('Navegando con teclado...')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(400)

  // Verificar si el grupo quedo seleccionado
  const currentText = await groupSelect.textContent()
  if (currentText && currentText.toLowerCase().includes(grupo.toLowerCase())) {
    logOk(`Grupo "${grupo}" seleccionado via teclado`)
    return
  }

  // --- Estrategia 3: Click directo en opciones del menu ---
  logStep('Buscando opciones en el menu desplegado...')
  const expectedOption = page.locator('.q-menu .q-item').filter({ hasText: grupo })
  const fallbackOption = page.locator('.q-menu .q-item').filter({ hasText: /grupo/i }).first()

  if (await expectedOption.count()) {
    await expectedOption.first().click()
    logOk(`Grupo "${grupo}" seleccionado via click en opcion`)
  } else if (await fallbackOption.count()) {
    logWarn('Usando fallback: primer grupo disponible')
    await fallbackOption.click()
    logOk('Grupo seleccionado via fallback')
  } else {
    logFail(`No se encontro opcion de grupo "${grupo}" en el menu`)
  }

  await expect(groupSelect).toContainText(grupo, { timeout: 10_000 })
  logOk('Contexto del banco configurado')
}

export async function uploadBancoExcel(page, filePath) {
  LOG('Subiendo archivo Excel al banco...')
  await page.getByRole('button', { name: /subir banco|importar|cargar/i }).click()
  await page.setInputFiles('input[type="file"]', filePath)
  logOk('Archivo Excel cargado')
}
