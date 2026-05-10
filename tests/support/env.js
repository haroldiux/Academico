import fs from 'node:fs'
import path from 'node:path'

const truthy = (value) => ['1', 'true', 'yes'].includes(String(value || '').toLowerCase())

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }

  const contents = fs.readFileSync(filePath, 'utf8')
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')
    if (separatorIndex <= 0) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const rawValue = line.slice(separatorIndex + 1).trim()
    const value = rawValue.replace(/^['"]|['"]$/g, '')

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

const repoRoot = process.cwd()
loadDotEnvFile(path.join(repoRoot, '.env.test.local'))
loadDotEnvFile(path.join(repoRoot, '.env.test'))

export const testEnv = {
  baseUrl: process.env.E2E_BASE_URL || 'http://127.0.0.1:9000',
  apiBaseUrl: process.env.API_BASE_URL || 'http://127.0.0.1:8000/api',
  docenteUsername: process.env.E2E_DOCENTE_USERNAME || process.env.API_DOCENTE_USERNAME || '',
  docentePassword: process.env.E2E_DOCENTE_PASSWORD || process.env.API_DOCENTE_PASSWORD || '',
  docenteAsignatura: process.env.E2E_DOCENTE_ASIGNATURA || '',
  docenteGrupo: process.env.E2E_DOCENTE_GRUPO || process.env.API_DOCENTE_GRUPO || '1',
  docenteAsignaturaId: process.env.API_DOCENTE_ASIGNATURA_ID || '',
  docenteSedeId: process.env.API_DOCENTE_SEDE_ID || '',
  docenteCarreraId: process.env.API_DOCENTE_CARRERA_ID || '',
  docenteDocenteId: process.env.API_DOCENTE_DOCENTE_ID || '',
  docenteParcial: process.env.API_DOCENTE_PARCIAL || '2P',
  allowDestructive: truthy(process.env.QA_ALLOW_DESTRUCTIVE),
}

export const hasUiCredentials = Boolean(testEnv.docenteUsername && testEnv.docentePassword)
export const hasApiCredentials = Boolean(testEnv.docenteUsername && testEnv.docentePassword)
export const hasBancoApiContext = Boolean(
  hasApiCredentials &&
  testEnv.docenteAsignaturaId &&
  testEnv.docenteGrupo &&
  testEnv.docenteParcial &&
  testEnv.docenteSedeId,
)
