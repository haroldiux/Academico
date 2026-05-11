import fs from 'node:fs'
import path from 'node:path'
import { getExcelEntries, getExcelStats, reset, recordResult } from './shared-collector.mjs'

function icon(status) {
  if (status === 'passed') return '✅'
  if (status === 'failed') return '❌'
  if (status === 'skipped') return '⏭️'
  return '❓'
}

function resultLabel(obtained, expected) {
  if (!obtained) return 'SIN DATOS'
  if (obtained === 'ok') return 'CORRECTO'
  if (obtained === 'permitido' && expected === 'bloquear') return 'PERMITIO (BUG!)'
  if (obtained === 'permitido' && expected === 'rechazar') return 'PERMITIO (BUG!)'
  if (obtained === 'bloqueado') return 'BLOQUEADO OK'
  if (obtained === 'rechazado') return 'RECHAZADO OK'
  if (obtained === 'error') return 'ERROR TECNICO'
  if (obtained === 'no_verificado') return 'NO VERIFICADO'
  return obtained.toUpperCase()
}

function causeLabel(cause) {
  const map = {
    validacion_correcta: 'VALIDACION CORRECTA: El sistema funciona como debe.',
    bug_backend_activo: 'BUG BACKEND ACTIVO: El backend acepta datos que deberia rechazar.',
    bug_backend: 'BUG BACKEND ACTIVO: El backend no valida correctamente.',
    bug_frontend: 'BUG FRONTEND: La UI no bloquea correctamente.',
    bug_corregido: 'BUG CORREGIDO: El bug anterior ya fue solucionado.',
    error_infraestructura: 'ERROR INFRAESTRUCTURA: Rate limit, timeout o backend caido.',
    selector_incorrecto: 'ERROR DE TEST: El selector/label no coincide con la UI real.',
    no_ejecutado: 'NO EJECUTADO: El test fue saltado (skip/fixme).',
  }
  return map[cause] || cause || 'SIN ANALISIS'
}

class ExcelReportReporter {
  constructor(options = {}) {
    this.outputFile = options.outputFile || path.resolve(process.cwd(), '..', 'REPORTE_IMPORTACION_EXCEL.md')
  }

  onBegin() {
    reset()
  }

  onTestEnd(test, result) {
    const ann = test.annotations || []
    const category = ann.find(a => a.type === 'category')?.description || ''
    if (category !== 'excel') return
    const entry = recordResult(test, result)
    console.log(`  ${icon(result.status)} [EXCEL] ${entry.subcategory ? `[${entry.subcategory}] ` : ''}${result.status === 'passed' ? 'OK' : 'FAIL'}: ${entry.title} (${(result.duration / 1000).toFixed(1)}s)`)
  }

  onEnd() {
    const entries = getExcelEntries()
    const stats = getExcelStats()

    if (entries.length === 0) {
      console.log('\n  ⚠ No hay resultados de importacion Excel para reportar.')
      return
    }

    const lines = []
    const now = new Date().toISOString()

    lines.push('# REPORTE DE IMPORTACION DE BANCO POR EXCEL')
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

    const grouped = {}
    for (const e of entries) {
      const key = e.scenario || 'general'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(e)
    }

    const scenarioOrder = ['valido', 'invalido', 'general']
    for (const scenario of scenarioOrder) {
      const group = grouped[scenario]
      if (!group || group.length === 0) continue

      const title = scenario === 'valido' ? 'ESCENARIOS DE ARCHIVOS VALIDOS' :
                    scenario === 'invalido' ? 'ESCENARIOS DE ARCHIVOS INVALIDOS' :
                    'OTROS ESCENARIOS'

      lines.push(`## ${title}`)
      lines.push('')
      lines.push('| # | Escenario | Esperado | Obtenido | Resultado | Analisis |')
      lines.push('|---|-----------|----------|----------|-----------|----------|')

      group.forEach((e, i) => {
        const ico = icon(e.status)
        const lab = resultLabel(e.obtained, e.expected)
        const expectedLabel = { bloquear: 'BLOQUEAR', permitir: 'PERMITIR', rechazar: 'RECHAZAR' }[e.expected] || e.expected
        const obtainedLabel = {
          ok: 'Funciono correctamente',
          permitido: 'PERMITIO (dejo pasar)',
          bloqueado: 'BLOQUEO correctamente',
          rechazado: 'RECHAZO correctamente',
          error: 'ERROR',
          no_verificado: 'No verificado',
        }[e.obtained] || e.obtained

        lines.push(`| ${i + 1} | ${e.check || e.title} | ${ico} ${expectedLabel} | ${ico} ${obtainedLabel} | ${lab} | ${causeLabel(e.cause)} |`)
      })

      lines.push('')
      lines.push(`**Subtotal**: ${group.filter(e => e.status === 'passed').length}✅ ${group.filter(e => e.status === 'failed').length}❌ ${group.filter(e => e.status === 'skipped').length}⏭️`)
      lines.push('')
    }

    lines.push('---')
    lines.push('')
    lines.push('## DETALLE POR ESCENARIO')
    lines.push('')

    entries.forEach((e, i) => {
      lines.push(`### ${i + 1}. ${e.title}`)
      lines.push('')
      lines.push('| Campo | Valor |')
      lines.push('|-------|-------|')
      lines.push(`| Estado | ${icon(e.status)} ${e.status} |`)
      lines.push(`| Tipo | ${e.subcategory || 'General'} |`)
      lines.push(`| Escenario | ${e.scenario} |`)
      lines.push(`| Que se validaba | ${e.check} |`)
      lines.push(`| Comportamiento esperado | ${e.expected} |`)
      lines.push(`| Comportamiento obtenido | ${e.obtained} |`)
      lines.push(`| Resultado | ${resultLabel(e.obtained, e.expected)} |`)
      lines.push(`| Causa | ${causeLabel(e.cause)} |`)
      if (e.evidence) lines.push(`| Evidencia | ${e.evidence} |`)
      if (e.error) lines.push(`| Error tecnico | ${e.error} |`)
      lines.push(`| Duracion | ${(e.durationMs / 1000).toFixed(1)}s |`)
      lines.push('')
    })

    lines.push('---')
    lines.push('')
    lines.push('## BUGS ENCONTRADOS')
    lines.push('')

    const bugs = entries.filter(e => e.cause?.includes('bug_'))
    if (bugs.length === 0) {
      lines.push('> No se encontraron bugs en la importacion por Excel. Todas las validaciones funcionan correctamente.')
    } else {
      lines.push('| # | Bug | Estado | Impacto |')
      lines.push('|---|-----|--------|---------|')
      bugs.forEach((b, i) => {
        const state = b.cause === 'bug_corregido' ? 'CORREGIDO' : 'ACTIVO'
        lines.push(`| ${i + 1} | ${b.check || b.title} | ⚠ ${state} | ${causeLabel(b.cause)} |`)
      })
    }
    lines.push('')

    lines.push('---')
    lines.push('')
    lines.push('## VALIDACIONES CORRECTAS')
    lines.push('')

    const correct = entries.filter(e => e.cause === 'validacion_correcta')
    if (correct.length === 0) {
      lines.push('> Sin validaciones correctas registradas.')
    } else {
      lines.push('| # | Validacion | Tipo |')
      lines.push('|---|------------|------|')
      correct.forEach((c, i) => {
        lines.push(`| ${i + 1} | ${c.check || c.title} | ${c.subcategory || 'General'} |`)
      })
    }
    lines.push('')

    lines.push('---')
    lines.push(`*Reporte generado automaticamente el ${now.split('T')[0]} a las ${now.split('T')[1]?.split('.')[0] || '--'}*`)

    const output = lines.join('\n')
    const dir = path.dirname(this.outputFile)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(this.outputFile, output, 'utf8')
    console.log(`\n  📊 Reporte Excel: ${this.outputFile}`)
  }
}

export default ExcelReportReporter
