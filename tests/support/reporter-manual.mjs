import fs from 'node:fs'
import path from 'node:path'
import { getManualEntries, getManualStats, reset, recordResult } from './shared-collector.mjs'

function icon(s) {
  if (s === 'passed') return '✅'
  if (s === 'failed') return '❌'
  if (s === 'skipped') return '⏭️'
  return '❓'
}

function resultLabel(obtained, expected) {
  if (!obtained) return 'SIN DATOS'
  if (obtained === 'ok') return 'CORRECTO'
  if (obtained === 'permitido' && (expected === 'bloquear' || expected === 'rechazar')) return 'DEJO PASAR (BUG)'
  if (obtained === 'permitido') return 'PERMITIO OK'
  if (obtained === 'bloqueado') return 'BLOQUEO CORRECTAMENTE'
  if (obtained === 'rechazado') return 'RECHAZO CORRECTAMENTE'
  if (obtained === 'error') return 'ERROR TECNICO'
  if (obtained === 'no_verificado') return 'NO VERIFICADO'
  return obtained.toUpperCase()
}

function causeLabel(cause) {
  const map = {
    validacion_correcta: 'VALIDACION CORRECTA: El sistema valida este campo apropiadamente.',
    bug_backend_activo: 'BUG BACKEND ACTIVO: El backend acepta preguntas que no cumplen requisitos minimos.',
    bug_backend: 'BUG BACKEND ACTIVO: La API no rechaza datos invalidos.',
    bug_frontend: 'BUG FRONTEND ACTIVO: La UI permite guardar sin validar este requisito.',
    bug_corregido: 'BUG CORREGIDO: Anteriormente fallaba, ahora funciona.',
    error_infraestructura: 'ERROR DE INFRAESTRUCTURA: Rate limit, timeout o backend no disponible.',
    selector_incorrecto: 'ERROR DE SUITE: El test no pudo interactuar correctamente con la UI.',
    no_ejecutado: 'NO EJECUTADO: Requiere verificacion manual contra la UI real.',
  }
  return map[cause] || cause || 'SIN ANALISIS'
}

const TIPO_LABELS = {
  FALSO_VERDADERO: 'Verdadero o Falso Simple',
  RESPUESTA_COMPUESTA: 'Respuesta A/B/Ambas/Ninguna',
  PREGUNTA_CON_CLAVE: 'Verdadero o Falso Complejas',
  SELECCION_SIMPLE: 'Seleccion de la mejor respuesta',
  EMPAREJAMIENTO: 'Emparejamiento Ampliado',
  PROBLEMA: 'Items agrupados por caso clinico o problema',
}

class ManualReportReporter {
  constructor(options = {}) {
    this.outputFile = options.outputFile || path.resolve(process.cwd(), '..', 'REPORTE_REGISTRO_MANUAL.md')
  }

  onTestEnd(test, result) {
    const ann = test.annotations || []
    const category = ann.find(a => a.type === 'category')?.description || ''
    if (category !== 'manual') return
    const entry = recordResult(test, result)
    const tipoLabel = TIPO_LABELS[entry.subcategory] || entry.subcategory || 'General'
    console.log(`  ${icon(result.status)} [MANUAL] [${tipoLabel}] ${result.status === 'passed' ? 'OK' : result.status === 'skipped' ? 'SKIP' : 'FAIL'}: ${entry.title} (${(result.duration / 1000).toFixed(1)}s)`)
  }

  onEnd() {
    const entries = getManualEntries()
    const stats = getManualStats()

    if (entries.length === 0) {
      console.log('\n  ⚠ No hay resultados de registro manual para reportar.')
      return
    }

    const lines = []
    const now = new Date().toISOString()

    lines.push('# REPORTE DE REGISTRO MANUAL DE PREGUNTAS (UI)')
    lines.push('')
    lines.push(`> **Fecha**: ${now.split('T')[0]}  |  **Hora**: ${now.split('T')[1]?.split('.')[0] || '--'}`)
    lines.push('')
    lines.push('---')
    lines.push('')
    lines.push('## RESUMEN EJECUTIVO')
    lines.push('')
    lines.push('| Metrica | Valor |')
    lines.push('|---------|-------|')
    lines.push(`| Total escenarios | ${stats.total} |`)
    lines.push(`| Pasaron | ${stats.passed} ✅ |`)
    lines.push(`| Fallaron | ${stats.failed} ❌ |`)
    lines.push(`| No verificados | ${stats.skipped} ⏭️ |`)
    lines.push(`| Bugs encontrados | ${stats.bugs} ⚠ |`)
    lines.push('')

    lines.push('---')
    lines.push('')
    lines.push('## RESUMEN POR TIPO DE PREGUNTA')
    lines.push('')

    const byTipo = {}
    for (const e of entries) {
      const tipo = e.subcategory || 'General'
      if (!byTipo[tipo]) byTipo[tipo] = { total: 0, passed: 0, failed: 0, skipped: 0, bugs: 0 }
      byTipo[tipo].total++
      if (e.status === 'passed') byTipo[tipo].passed++
      else if (e.status === 'failed') byTipo[tipo].failed++
      else if (e.status === 'skipped') byTipo[tipo].skipped++
      if (e.cause?.includes('bug_')) byTipo[tipo].bugs++
    }

    lines.push('| Tipo de Pregunta | Escenarios | Pasaron | Fallaron | Bugs |')
    lines.push('|------------------|------------|---------|----------|------|')
    for (const [tipo, s] of Object.entries(byTipo)) {
      const label = TIPO_LABELS[tipo] || tipo
      lines.push(`| ${label} | ${s.total} | ${s.passed} ✅ | ${s.failed} ❌ | ${s.bugs} ⚠ |`)
    }
    lines.push('')

    lines.push('---')
    lines.push('')

    for (const [tipo, tipoLabel] of Object.entries(TIPO_LABELS)) {
      const tipoEntries = entries.filter(e => e.subcategory === tipo)
      if (tipoEntries.length === 0) continue

      lines.push(`## ${tipoLabel} (${tipo})`)
      lines.push('')

      const validos = tipoEntries.filter(e => e.scenario === 'valido')
      const invalidos = tipoEntries.filter(e => e.scenario === 'invalido')

      if (validos.length > 0) {
        lines.push('### Escenario Valido (pregunta completa)')
        lines.push('')
        lines.push('| # | Verificacion | Esperado | Obtenido | Resultado |')
        lines.push('|---|--------------|----------|----------|-----------|')
        validos.forEach((e, i) => {
          const ico = icon(e.status)
          lines.push(`| ${i + 1} | ${e.check || e.title} | ${e.expected} | ${e.obtained} | ${ico} ${resultLabel(e.obtained, e.expected)} |`)
        })
        lines.push('')
      }

      if (invalidos.length > 0) {
        lines.push('### Escenarios Invalidos (forzando errores)')
        lines.push('')
        lines.push('| # | Que falta/sobra | Esperado | Obtenido | Resultado | Analisis |')
        lines.push('|---|-----------------|----------|----------|-----------|----------|')
        invalidos.forEach((e, i) => {
          const ico = icon(e.status)
          const res = resultLabel(e.obtained, e.expected)
          lines.push(`| ${i + 1} | ${e.check || e.title} | ${e.expected === 'bloquear' ? '❌ BLOQUEAR' : '✅ PERMITIR'} | ${e.obtained} | ${ico} ${res} | ${causeLabel(e.cause)} |`)
        })
        lines.push('')
      }

      lines.push(`**Subtotal ${tipoLabel}**: ${tipoEntries.filter(e => e.status === 'passed').length}✅ ${tipoEntries.filter(e => e.status === 'failed').length}❌ ${tipoEntries.filter(e => e.status === 'skipped').length}⏭️`)
      lines.push('')
    }

    lines.push('---')
    lines.push('')
    lines.push('## DETALLE COMPLETO POR ESCENARIO')
    lines.push('')

    const groupedByTipo = {}
    for (const e of entries) {
      const tipo = e.subcategory || 'General'
      if (!groupedByTipo[tipo]) groupedByTipo[tipo] = []
      groupedByTipo[tipo].push(e)
    }

    for (const [tipo, group] of Object.entries(groupedByTipo)) {
      const label = TIPO_LABELS[tipo] || tipo
      lines.push(`### ${label}`)
      lines.push('')

      group.forEach((e, i) => {
        lines.push(`#### ${i + 1}. ${e.title}`)
        lines.push('')
        lines.push('| Campo | Valor |')
        lines.push('|-------|-------|')
        lines.push(`| Estado | ${icon(e.status)} ${e.status.toUpperCase()} |`)
        lines.push(`| Escenario | ${e.scenario} |`)
        lines.push(`| Que se valida | ${e.check} |`)
        lines.push(`| Esperado | ${e.expected} |`)
        lines.push(`| Obtenido | ${e.obtained} |`)
        lines.push(`| Resultado | ${resultLabel(e.obtained, e.expected)} |`)
        lines.push(`| Analisis | ${causeLabel(e.cause)} |`)
        if (e.evidence) lines.push(`| Evidencia | ${e.evidence} |`)
        if (e.error) lines.push(`| Error | ${e.error.slice(0, 200)} |`)
        lines.push(`| Duracion | ${(e.durationMs / 1000).toFixed(1)}s |`)
        lines.push('')
      })
    }

    lines.push('---')
    lines.push('')
    lines.push('## BUGS ENCONTRADOS')
    lines.push('')

    const bugs = entries.filter(e => e.cause?.includes('bug_'))
    if (bugs.length === 0) {
      lines.push('> No se encontraron bugs en el registro manual. Todas las validaciones funcionan correctamente.')
    } else {
      lines.push('| # | Tipo | Validacion | Estado | Detalle |')
      lines.push('|---|------|------------|--------|---------|')
      bugs.forEach((b, i) => {
        const label = TIPO_LABELS[b.subcategory] || b.subcategory || 'General'
        const state = b.cause === 'bug_corregido' ? 'CORREGIDO' : '⚠ ACTIVO'
        lines.push(`| ${i + 1} | ${label} | ${b.check || b.title} | ${state} | ${causeLabel(b.cause)} |`)
      })
    }
    lines.push('')

    lines.push('---')
    lines.push('')
    lines.push('## VALIDACIONES CORRECTAS (lo que SI funciona)')
    lines.push('')

    const correct = entries.filter(e => e.cause === 'validacion_correcta')
    if (correct.length === 0) {
      lines.push('> Sin validaciones correctas registradas.')
    } else {
      lines.push('| # | Tipo | Validacion | Verificado por |')
      lines.push('|---|------|------------|----------------|')
      correct.forEach((c, i) => {
        const label = TIPO_LABELS[c.subcategory] || c.subcategory || 'General'
        const via = c.file?.includes('e2e') ? 'UI (E2E)' : 'API'
        lines.push(`| ${i + 1} | ${label} | ${c.check || c.title} | ${via} |`)
      })
    }
    lines.push('')

    lines.push('---')
    lines.push('')
    lines.push('## VALIDACIONES NO VERIFICADAS (pendientes)')
    lines.push('')

    const pending = entries.filter(e => e.status === 'skipped' || e.obtained === 'no_verificado')
    if (pending.length === 0) {
      lines.push('> Todas las validaciones planificadas fueron ejecutadas.')
    } else {
      lines.push('| # | Tipo | Validacion | Motivo |')
      lines.push('|---|------|------------|--------|')
      pending.forEach((p, i) => {
        const label = TIPO_LABELS[p.subcategory] || p.subcategory || 'General'
        lines.push(`| ${i + 1} | ${label} | ${p.check || p.title} | ${causeLabel(p.cause)} |`)
      })
    }
    lines.push('')

    lines.push('---')
    lines.push(`*Reporte generado automaticamente el ${now.split('T')[0]} a las ${now.split('T')[1]?.split('.')[0] || '--'}*`)

    const output = lines.join('\n')
    const dir = path.dirname(this.outputFile)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(this.outputFile, output, 'utf8')
    console.log(`\n  📊 Reporte Manual: ${this.outputFile}`)
  }
}

export default ManualReportReporter
