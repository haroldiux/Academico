import { vi } from 'vitest'

vi.mock('boot/axios', () => ({
  api: {
    defaults: {
      baseURL: 'http://127.0.0.1:8000/api',
    },
  },
}))
