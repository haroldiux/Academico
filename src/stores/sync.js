import { defineStore } from 'pinia'
import planificacionSemestralService from 'src/services/planificacionSemestralService'
import { Notify } from 'quasar'
import { Filesystem, Directory } from '@capacitor/filesystem'

export const useSyncStore = defineStore('sync', {
  state: () => ({
    pendingFollowups: [],
    lastSyncAt: null,
    isSyncing: false,
  }),

  actions: {
    addPendingFollowup(followupData) {
      // Create a unique temporary ID if not present
      const tempId = Date.now().toString()
      this.pendingFollowups.push({
        id: tempId,
        data: followupData,
        createdAt: new Date().toISOString(),
      })

      Notify.create({
        type: 'info',
        message: 'Seguimiento guardado localmente (Sin conexión)',
        caption: 'Se sincronizará automáticamente al detectar internet',
      })
    },

    removePendingFollowup(id) {
      this.pendingFollowups = this.pendingFollowups.filter((f) => f.id !== id)
    },

    async syncAll() {
      if (this.isSyncing || this.pendingFollowups.length === 0) return

      this.isSyncing = true

      const toSync = [...this.pendingFollowups]
      let results = { success: 0, fail: 0 }

      for (const item of toSync) {
        try {
          // Prepare formData for the followup data
          const formData = new FormData()
          const isCumplido =
            item.data.estado_cumplimiento === 'TOTAL' || item.data.estado_cumplimiento === 'PARCIAL'
          formData.append('tema_cumplido', isCumplido ? 'true' : 'false')
          formData.append('observaciones', item.data.observaciones || '')

          formData.append('cronograma_id', item.data.cronograma_id || '')
          formData.append('grupo_id', item.data.grupo_id || '')
          formData.append('asignatura_id', item.data.asignatura_id || '')
          formData.append('numero_sesion', item.data.numero_sesion || '')
          formData.append('fecha', item.data.fecha || '')
          formData.append('estado_cumplimiento', item.data.estado_cumplimiento || 'NO')

          formData.append('pedagogico', JSON.stringify(item.data.pedagogico || {}))
          formData.append(
            'integracion_transversal',
            JSON.stringify(item.data.integracion_transversal || {}),
          )

          const existingEvidencias = {} // Optional, handled logically
          formData.append('evidencias', JSON.stringify(existingEvidencias))

          const getFileBlob = async (fileObj) => {
            if (fileObj && fileObj.path) {
              try {
                const result = await Filesystem.readFile({
                  path: fileObj.path,
                  directory: Directory.Data,
                })
                const res = await fetch(`data:${fileObj.type};base64,${result.data}`)
                return await res.blob()
              } catch (e) {
                console.error('Error reading offline file', e)
              }
            }
            return null
          }

          if (item.data.evidencias_offline) {
            const evtApr = await getFileBlob(item.data.evidencias_offline.aprendizaje_activo)
            if (evtApr)
              formData.append(
                'evidencia_aprendizaje',
                evtApr,
                item.data.evidencias_offline.aprendizaje_activo.name,
              )

            const evtEval = await getFileBlob(item.data.evidencias_offline.evaluacion_formativa)
            if (evtEval)
              formData.append(
                'evidencia_evaluacion',
                evtEval,
                item.data.evidencias_offline.evaluacion_formativa.name,
              )

            const evtSec = await getFileBlob(item.data.evidencias_offline.secuencia_didactica)
            if (evtSec)
              formData.append(
                'evidencia_secuencia',
                evtSec,
                item.data.evidencias_offline.secuencia_didactica.name,
              )
          }

          if (item.data.integracion_transversal) {
            const evtInv = await getFileBlob(
              item.data.integracion_transversal.investigacion?.evidencia,
            )
            if (evtInv)
              formData.append(
                'evidencia_investigacion',
                evtInv,
                item.data.integracion_transversal.investigacion.evidencia.name,
              )

            const evtInt = await getFileBlob(
              item.data.integracion_transversal.interaccion?.evidencia,
            )
            if (evtInt)
              formData.append(
                'evidencia_interaccion',
                evtInt,
                item.data.integracion_transversal.interaccion.evidencia.name,
              )

            const evtIntern = await getFileBlob(
              item.data.integracion_transversal.internalizacion?.evidencia,
            )
            if (evtIntern)
              formData.append(
                'evidencia_internalizacion',
                evtIntern,
                item.data.integracion_transversal.internalizacion.evidencia.name,
              )
          }

          await planificacionSemestralService.saveSeguimiento(formData)

          // Cleanup files
          const deleteFile = async (fileObj) => {
            if (fileObj && fileObj.path) {
              try {
                await Filesystem.deleteFile({ path: fileObj.path, directory: Directory.Data })
              } catch {
                /* ignore */
              }
            }
          }
          if (item.data.evidencias_offline) {
            await deleteFile(item.data.evidencias_offline.aprendizaje_activo)
            await deleteFile(item.data.evidencias_offline.evaluacion_formativa)
            await deleteFile(item.data.evidencias_offline.secuencia_didactica)
          }
          if (item.data.integracion_transversal) {
            await deleteFile(item.data.integracion_transversal.investigacion?.evidencia)
            await deleteFile(item.data.integracion_transversal.interaccion?.evidencia)
            await deleteFile(item.data.integracion_transversal.internalizacion?.evidencia)
          }

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
          timeout: 2000,
        })
      }

      if (results.fail > 0) {
        Notify.create({
          type: 'negative',
          message: `Error al sincronizar ${results.fail} registro(s)`,
          timeout: 4000,
        })
      }
    },
  },

  persist: true,
})
