import { request } from '@playwright/test'

const api = await request.newContext({
  baseURL: 'http://127.0.0.1:8000/api'
})

const res = await api.post('/login', {
  data: { username: '6522053', password: '6522053' }
})

console.log('Status:', res.status())
console.log('StatusText:', res.statusText())
const body = await res.json().catch(() => ({}))
console.log('Body:', JSON.stringify(body, null, 2))
await api.dispose()
