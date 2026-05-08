const API_BASE_URL = 'http://127.0.0.1:8000/api'

async function discover() {
  // 1. Login
  const loginRes = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username: '6522053', password: '6522053' })
  })
  console.log('Login status:', loginRes.status)
  const loginBody = await loginRes.json().catch(() => ({}))
  console.log('Login body:', JSON.stringify(loginBody, null, 2))

  const token = loginBody?.token || loginBody?.access_token || loginBody?.data?.token
  if (!token) {
    console.error('No token found')
    return
  }

  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  // 2. Intentar listar asignaturas del docente
  const endpointsToTry = [
    '/asignaturas',
    '/docente/asignaturas',
    '/asignatura',
    '/materias',
    '/docente/materias',
    '/user',
    '/me',
    '/profile',
    '/docente/perfil',
    '/banco-preguntas',
  ]

  for (const endpoint of endpointsToTry) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, { headers })
      if (res.status === 200) {
        const body = await res.json()
        console.log(`\n--- ${endpoint} ---`)
        console.log(JSON.stringify(body, null, 2).substring(0, 4000))
      } else {
        console.log(`${endpoint}: ${res.status}`)
      }
    } catch (e) {
      console.log(`${endpoint} error:`, e.message)
    }
  }
}

discover().catch(console.error)
