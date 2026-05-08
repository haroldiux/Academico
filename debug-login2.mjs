import { request } from '@playwright/test'

const api = await request.newContext()

const res = await api.post('http://127.0.0.1:8000/api/login', {
  data: { username: '6522053', password: '6522053' },
  headers: { Accept: 'application/json' }
})

console.log('Status:', res.status())
console.log('StatusText:', res.statusText())
const body = await res.json().catch(() => ({}))
console.log('Body:', JSON.stringify(body, null, 2))
await api.dispose()
