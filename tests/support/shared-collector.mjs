const collector = {
  excel: [],
  manual: [],
  stats: { excel: { total: 0, passed: 0, failed: 0, skipped: 0, bugs: 0 }, manual: { total: 0, passed: 0, failed: 0, skipped: 0, bugs: 0 } },
}

export function annotate(testInfo, annotations) {
  const ann = testInfo.annotations || []
  for (const a of annotations) {
    ann.push(a)
  }
}

export function recordResult(testInfo, result) {
  const ann = testInfo.annotations || []
  const getAnn = (type) => ann.find(a => a.type === type)?.description || ''

  const entry = {
    title: testInfo.title,
    file: testInfo.location?.file?.replace(/\\/g, '/') || '',
    status: result.status,
    durationMs: Math.round(result.duration),
    category: getAnn('category') || 'sin-categoria',
    subcategory: getAnn('subcategory') || '',
    scenario: getAnn('scenario') || '',
    check: getAnn('check') || '',
    expected: getAnn('expected') || '',
    obtained: getAnn('obtained') || resolveObtained(result, testInfo),
    cause: getAnn('cause') || resolveCause(result, testInfo),
    evidence: getAnn('evidence') || '',
    error: result.errors?.[0]?.message?.split('\n')[0]?.slice(0, 250) || null,
  }

  if (entry.category === 'excel') {
    collector.excel.push(entry)
    collector.stats.excel.total++
    if (entry.status === 'passed') collector.stats.excel.passed++
    else if (entry.status === 'failed') collector.stats.excel.failed++
    else if (entry.status === 'skipped') collector.stats.excel.skipped++
    if (entry.cause?.includes('bug_')) collector.stats.excel.bugs++
  } else if (entry.category === 'manual') {
    collector.manual.push(entry)
    collector.stats.manual.total++
    if (entry.status === 'passed') collector.stats.manual.passed++
    else if (entry.status === 'failed') collector.stats.manual.failed++
    else if (entry.status === 'skipped') collector.stats.manual.skipped++
    if (entry.cause?.includes('bug_')) collector.stats.manual.bugs++
  }

  return entry
}

function resolveObtained(result, testInfo) {
  const ann = testInfo.annotations || []
  const preset = ann.find(a => a.type === 'obtained')?.description
  if (preset) return preset

  if (result.status === 'passed') return 'ok'
  if (result.status === 'failed') {
    if (testInfo.expectedStatus === 'failed') return 'permitido'
    return 'error'
  }
  if (result.status === 'skipped') return 'no_verificado'
  return result.status
}

function resolveCause(result, testInfo) {
  const ann = testInfo.annotations || []
  const preset = ann.find(a => a.type === 'cause')?.description
  if (preset) return preset

  if (result.status === 'passed') {
    return testInfo.expectedStatus === 'failed' ? 'bug_corregido' : 'validacion_correcta'
  }
  if (result.status === 'failed') {
    if (testInfo.expectedStatus === 'failed') return 'bug_backend_activo'
    return 'error_infraestructura'
  }
  if (result.status === 'skipped') return 'no_ejecutado'
  return result.status
}

export function getExcelEntries() { return collector.excel }
export function getManualEntries() { return collector.manual }
export function getExcelStats() { return collector.stats.excel }
export function getManualStats() { return collector.stats.manual }
export function reset() { collector.excel = []; collector.manual = []; collector.stats = { excel: { total: 0, passed: 0, failed: 0, skipped: 0, bugs: 0 }, manual: { total: 0, passed: 0, failed: 0, skipped: 0, bugs: 0 } } }
