import { defineStore } from 'pinia'

export const useSyncQueueStore = defineStore('syncQueue', {
  state: () => ({
    queue: [],
  }),
  actions: {
    addToQueue(actionData) {
      this.queue.push({
        id: Date.now().toString(),
        data: actionData,
        status: 'pending',
        timestamp: new Date().toISOString(),
      })
    },
    removeFromQueue(id) {
      this.queue = this.queue.filter((item) => item.id !== id)
    },
    clearQueue() {
      this.queue = []
    },
  },
  persist: true,
})
