const API_BASE_URL = 'http://127.0.0.1:8000/api'

async function probe() {
  const loginRes = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username: '6522053', password: '6522053' })
  })
  const loginBody = await loginRes.json()
  const token = loginBody.token
  console.log('Token:', token ? 'OK' : 'FAIL')

  const headers = { Accept: 'application/json', Authorization: `Bearer ${token}` }

  const endpoints = [
    { method: 'GET', path: 'banco-preguntas' },
    { method: 'GET', path: 'banco-preguntas/stats' },
    { method: 'POST', path: 'banco-preguntas/bulk-delete', body: {} },
    { method: 'POST', path: 'banco-preguntas/save-config', body: {} },
    { method: 'POST', path: 'banco-preguntas/import', body: {} },
    { method: 'POST', path: 'banco-preguntas/importar', body: {} },
    { method: 'POST', path: 'banco-preguntas/cargar', body: {} },
    { method: 'POST', path: 'banco-preguntas/upload', body: {} },
    { method: 'POST', path: 'banco-preguntas/eliminar-masivo', body: {} },
    { method: 'POST', path: 'banco-preguntas/configuracion', body: {} },
    { method: 'GET', path: 'banco-preguntas/estadisticas' },
  ]

  for (const ep of endpoints) {
    try {
      const url = `${API_BASE_URL}/${ep.path}`
      const opts = { method: ep.method, headers }
      if (ep.body) {
        opts.headers['Content-Type'] = 'application/json'
        opts.body = JSON.stringify(ep.body)
      }
      const res = await fetch(url, opts)
      console.log(`${ep.method} ${ep.path} => ${res.status}`)
    } catch (e) {
      console.log(`${ep.method} ${ep.path} => ERROR: ${e.message}`)
    }
  }
}

probe().catch(console.error)
