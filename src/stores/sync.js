import { defineStore } from 'pinia'
import planificacionSemestralService from 'src/services/planificacionSemestralService'
import { Notify } from 'quasar'

export const useSyncStore = defineStore('sync', {
    state: () => ({
        pendingFollowups: [],
        lastSyncAt: null,
        isSyncing: false
    }),

    actions: {
        addPendingFollowup(followupData) {
            // Create a unique temporary ID if not present
            const tempId = Date.now().toString()
            this.pendingFollowups.push({
                id: tempId,
                data: followupData,
                createdAt: new Date().toISOString()
            })

            Notify.create({
                type: 'info',
                message: 'Seguimiento guardado localmente (Sin conexión)',
                caption: 'Se sincronizará automáticamente al detectar internet'
            })
        },

        removePendingFollowup(id) {
            this.pendingFollowups = this.pendingFollowups.filter(f => f.id !== id)
        },

        async syncAll() {
            if (this.isSyncing || this.pendingFollowups.length === 0) return

            this.isSyncing = true

            const toSync = [...this.pendingFollowups]
            let results = { success: 0, fail: 0 }

            for (const item of toSync) {
                try {
                    // Prepare formData if needed (since it was saved as JS object)
                    // Note: Binary files (Blobs) saved in state might lose validity depending on persistence implementation
                    // We will handle this in ClasePage.vue by converting to Base64 if needed, 
                    // or just assuming simple data for now.

                    await planificacionSemestralService.updateSeguimiento(item.data)
                    this.removePendingFollowup(item.id)
                    results.success++
                } catch (error) {
                    console.error('Failed to sync item:', item.id, error)
                    results.fail++
                }
            }

            this.isSyncing = false
            this.lastSyncAt = new Date().toISOString()

            if (results.success > 0) {
                Notify.create({
                    type: 'positive',
                    message: `Sincronización exitosa: ${results.success} registro(s) subidos`,
                    timeout: 2000
                })
            }

            if (results.fail > 0) {
                Notify.create({
                    type: 'negative',
                    message: `Error al sincronizar ${results.fail} registro(s)`,
                    timeout: 4000
                })
            }
        }
    },

    persist: true
})
