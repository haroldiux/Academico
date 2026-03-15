import { Network } from '@capacitor/network'
import { useSyncQueueStore } from '../stores/syncQueue'
import { api } from '../boot/axios'
import { Notify } from 'quasar'

let networkListener = null

export const initNetworkListener = async () => {
  // Listen for network changes
  networkListener = await Network.addListener('networkStatusChange', (status) => {
    console.log('Network status changed', status)
    if (status.connected) {
      processSyncQueue()
    }
  })

  // Check initial status and process if we are online on startup
  const status = await Network.getStatus()
  if (status.connected) {
    processSyncQueue()
  }
}

export const getNetworkStatus = async () => {
  return await Network.getStatus()
}

export const processSyncQueue = async () => {
  const syncStore = useSyncQueueStore()
  const queue = [...syncStore.queue]

  if (queue.length === 0) return

  Notify.create({
    message: `Sincronizando ${queue.length} registros pendientes...`,
    color: 'info',
    icon: 'cloud_upload',
  })

  let successCount = 0

  for (const item of queue) {
    try {
      // Execute the pending request using the saved api details
      // Expect item.data to have: { method, url, data (content/formData equivalent details), headers? }

      const config = {
        method: item.data.method || 'post',
        url: item.data.url,
        data: item.data.payload,
        headers: item.data.headers || {},
      }

      await api(config)

      // On success, remove from local queue
      syncStore.removeFromQueue(item.id)
      successCount++
    } catch (error) {
      console.error('Failed to sync item:', item, error)
      // Wait for next connection or retry logic later
    }
  }

  if (successCount > 0) {
    Notify.create({
      message: `${successCount} registros sincronizados exitosamente.`,
      color: 'positive',
      icon: 'check_circle',
    })
  }
}

export const stopNetworkListener = () => {
  if (networkListener) {
    networkListener.remove()
    networkListener = null
  }
}
