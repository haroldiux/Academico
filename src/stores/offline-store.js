import { defineStore } from 'pinia'
// import { api } from 'boot/axios'
import { Notify } from 'quasar'

export const useOfflineStore = defineStore('offline', {
    state: () => ({
        isOffline: !navigator.onLine,
        isMobileSimulated: localStorage.getItem('mobile_sim') === 'true',
        actionsQueue: JSON.parse(localStorage.getItem('offline_actions') || '[]')
    }),

    actions: {
        toggleSimulation() {
            this.isMobileSimulated = !this.isMobileSimulated
            localStorage.setItem('mobile_sim', this.isMobileSimulated)
            // Recargar para aplicar cambios en router y layout
            window.location.reload()
        },
        initListeners() {
            window.addEventListener('online', () => {
                this.isOffline = false
                this.processQueue()
            })
            window.addEventListener('offline', () => {
                this.isOffline = true
                Notify.create({
                    message: 'Sin conexión. Los cambios se guardarán localmente.',
                    color: 'warning',
                    icon: 'wifi_off'
                })
            })
        },

        addToQueue(action) {
            // action esperado: { type: 'control_clase', payload: {...}, timestamp: Date.now() }
            this.actionsQueue.push(action)
            this.saveToStorage()
            Notify.create({
                message: 'Guardado localmente (Pendiente de sincronización)',
                color: 'orange',
                icon: 'save'
            })
        },

        saveToStorage() {
            localStorage.setItem('offline_actions', JSON.stringify(this.actionsQueue))
        },

        async processQueue() {
            if (this.actionsQueue.length === 0) return

            Notify.create({
                message: 'Conexión restaurada. Sincronizando datos...',
                color: 'info',
                icon: 'sync',
                group: 'sync-group' // Para no acumular notificaciones
            })

            const queueCopy = [...this.actionsQueue]
            const failedActions = []

            // Procesamos secuencialmente
            for (const action of queueCopy) {
                try {
                    if (action.type === 'control_clase') {
                        // Aquí iría la llamada real a la API
                        // await api.post('/clases/asistencia', action.payload)
                        console.log('Sincronizando:', action)

                        // Simulación de éxito
                        // await new Promise(r => setTimeout(r, 500)) 
                    }
                } catch (error) {
                    console.error('Error sincronizando acción', action, error)
                    failedActions.push(action)
                }
            }

            // Actualizamos la cola con los que fallaron
            this.actionsQueue = failedActions
            this.saveToStorage()

            if (this.actionsQueue.length === 0) {
                Notify.create({
                    message: 'Sincronización completada exitosamente',
                    color: 'positive',
                    icon: 'cloud_done'
                })
            } else {
                Notify.create({
                    message: 'Algunos datos no pudieron sincronizarse. Se intentará luego.',
                    color: 'negative',
                    icon: 'warning'
                })
            }
        }
    }
})
