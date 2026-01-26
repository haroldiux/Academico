import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import asignaturaService from 'src/services/asignaturaService'

export const useAsignaturasStore = defineStore('asignaturas', () => {
  const asignaturas = ref([])
  const loading = ref(false)
  const error = ref(null)

  const asignaturaActual = ref(null)

  // Getters
  const totalAsignaturas = computed(() => asignaturas.value.length)

  // Actions
  async function fetchAsignaturas(sedeId = null, carreraId = null, semestre = null, search = '') {
    loading.value = true
    error.value = null
    try {
      // Nuevos parámetros: sede_id, carrera_id, semestre
      const params = {}
      if (sedeId) params.sede_id = sedeId
      if (carreraId) params.carrera_id = carreraId
      if (semestre) params.semestre = semestre
      if (search) params.search = search
      const response = await asignaturaService.getAsignaturas(params)
      asignaturas.value = response.data
    } catch (err) {
      console.error('Error fetching asignaturas:', err)
      error.value = err
      asignaturas.value = []
    } finally {
      loading.value = false
    }
  }

  async function setAsignaturaActual(id) {
    loading.value = true
    error.value = null
    asignaturaActual.value = null
    try {
        const response = await asignaturaService.getAsignatura(id)
        asignaturaActual.value = response.data
    } catch (err) {
        console.error('Error getting asignatura:', err)
        error.value = err
    } finally {
        loading.value = false
    }
  }

  async function createAsignatura(data) {
    loading.value = true
    try {
      const response = await asignaturaService.createAsignatura(data)
      // Recargar lista u optimísticamente agregar
      asignaturas.value.push(response.data)
      return response.data
    } catch (err) {
      console.error('Error creating asignatura:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAsignatura(id, data) {
    loading.value = true
    try {
      const response = await asignaturaService.updateAsignatura(id, data)
      // Actualizar en lista local
      const index = asignaturas.value.findIndex(a => a.id === id)
      if (index !== -1) {
        asignaturas.value[index] = { ...asignaturas.value[index], ...response.data }
      }
      return response.data
    } catch (err) {
      console.error('Error updating asignatura:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAsignatura(id) {
    loading.value = true
    try {
        await asignaturaService.deleteAsignatura(id)
        asignaturas.value = asignaturas.value.filter(a => a.id !== id)
    } catch (err) {
        console.error('Error deleting asignatura:', err)
        throw err
    } finally {
        loading.value = false
    }
  }

  async function assignDocentes(id, docenteIds) {
    loading.value = true
    try {
        const response = await asignaturaService.assignDocentes(id, docenteIds)
        // Actualizar lista local si es necesario (ej: propiedad docentes)
        const index = asignaturas.value.findIndex(a => a.id === id)
        if (index !== -1) {
           // Asumimos que el backend retorna los datos actualizados de docentes o forzamos recarga
           asignaturas.value[index].docentes = response.data.docentes.map(d => d.nombre_completo)
        }
        return response.data
    } catch (err) {
        console.error('Error assigning docentes:', err)
        throw err
    } finally {
        loading.value = false
    }
  }

  async function importarWord(id, file, options = {}) {
    loading.value = true
    try {
      const response = await asignaturaService.importWord(id, file, options)
      // Actualizar asignatura actual con los nuevos datos
      // Podríamos hacer un merge manual, pero lo más seguro es recargar o usar la data retornada si es completa.
      // El backend retorna { message: '...', data: { justificacion, ... } }
      // Combinamos con lo actual
      if (asignaturaActual.value && asignaturaActual.value.id === id) {
          // Actualización parcial reactiva
          Object.assign(asignaturaActual.value, response.data.data)
          // Recargar bibliografias si vinieron nuevas (el backend las guardó en BD, pero aquí no las tenemos en response.data.data como objetos completos con ID)
          // Mejor recargar la asignatura completa para traer bibliografías con IDs generados.
          await setAsignaturaActual(id)
      }
      return response.data
    } catch (err) {
      console.error('Error importing word:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function updateElementoCompetencia(asigId, unidadId, data) { console.log('updateElemento', asigId, unidadId, data) }

  // --- ACTIONS UNIDADES & TEMAS ---

  async function createUnidad(asignaturaId, data) {
    loading.value = true
    try {
        const payload = { ...data, asignatura_id: asignaturaId }
        const response = await asignaturaService.createUnidad(asignaturaId, payload)

        // Update local state
        if (asignaturaActual.value && asignaturaActual.value.id === asignaturaId) {
            if (!asignaturaActual.value.unidades) asignaturaActual.value.unidades = []
            asignaturaActual.value.unidades.push(response.data)
        }
        return response.data
    } catch (err) {
        console.error('Error creating unit:', err)
        throw err
    } finally {
        loading.value = false
    }
  }

  async function updateUnidad(id, data) {
    loading.value = true
    try {
        const response = await asignaturaService.updateUnidad(id, data)
        // Find and update local
        if (asignaturaActual.value && asignaturaActual.value.unidades) {
            const idx = asignaturaActual.value.unidades.findIndex(u => u.id === id)
            if (idx !== -1) {
                // Merge data
                Object.assign(asignaturaActual.value.unidades[idx], response.data)
            }
        }
        return response.data
    } catch (err) {
        console.error('Error updating unit:', err)
        throw err
    } finally {
        loading.value = false
    }
  }

  async function deleteUnidad(id) {
    loading.value = true
    try {
        await asignaturaService.deleteUnidad(id)
        if (asignaturaActual.value && asignaturaActual.value.unidades) {
            asignaturaActual.value.unidades = asignaturaActual.value.unidades.filter(u => u.id !== id)
        }
    } catch (err) {
        console.error('Error deleting unit:', err)
        throw err
    } finally {
        loading.value = false
    }
  }

  async function createTema(unidadId, data) {
    loading.value = true
    try {
        const response = await asignaturaService.createTema(unidadId, data)
        // Agregar a la unidad correspondiente
        if (asignaturaActual.value && asignaturaActual.value.unidades) {
            const unidad = asignaturaActual.value.unidades.find(u => u.id === unidadId)
            if (unidad) {
                if (!unidad.temas) unidad.temas = []
                unidad.temas.push(response.data)
            }
        }
        return response.data
    } catch (err) {
        console.error('Error creating theme:', err)
        throw err
    } finally {
        loading.value = false
    }
  }

  async function updateTema(id, data) {
      // Nota: el endpoint updateTema es genérico, sirve para título tb.
      loading.value = true
      try {
          const response = await asignaturaService.updateTema(id, data)
          // Update local
           if (asignaturaActual.value && asignaturaActual.value.unidades) {
               for (const u of asignaturaActual.value.unidades) {
                   if (u.temas) {
                       const tIdx = u.temas.findIndex(t => t.id === id)
                       if (tIdx !== -1) {
                           Object.assign(u.temas[tIdx], response.data)
                           break
                       }
                   }
               }
           }
          return response.data
      } catch (err) {
          console.error('Error updating theme:', err)
          throw err
      } finally {
          loading.value = false
      }
  }

  async function deleteTema(id) {
      loading.value = true
      try {
          await asignaturaService.deleteTema(id)
          // Delete locally and re-sort?
          // Backend reorders, so we might need to refresh or manually reindex local array.
          // Simple approach: Remove locally, manual reindex for display if not refreshing.
          if (asignaturaActual.value && asignaturaActual.value.unidades) {
               for (const u of asignaturaActual.value.unidades) {
                   if (u.temas) {
                       const prevLen = u.temas.length
                       u.temas = u.temas.filter(t => t.id !== id)
                       if (u.temas.length < prevLen) {
                           // Re-assign index locally to match backend logic
                           u.temas.forEach((t, i) => t.orden = i + 1)
                           break
                       }
                   }
               }
           }
      } catch (err) {
          console.error('Error updating theme:', err)
          throw err
      } finally {
          loading.value = false
      }
  }

  async function moveTema(unidadId, temaId, direction) {
      // Optimistic update or wait for reload?
      // Wait for reload is safer for order consistency
      loading.value = true
      try {
          await asignaturaService.moveTema(temaId, direction)

          // Local update: Find unit, find theme index, swap
           if (asignaturaActual.value && asignaturaActual.value.unidades) {
               const unidad = asignaturaActual.value.unidades.find(u => u.id === unidadId)
               if (unidad && unidad.temas) {
                   const index = unidad.temas.findIndex(t => t.id === temaId)
                   if (index !== -1) {
                       const neighborIndex = direction === 'up' ? index - 1 : index + 1
                       if (neighborIndex >= 0 && neighborIndex < unidad.temas.length) {
                           // Swap local array
                           const temp = unidad.temas[index]
                           unidad.temas[index] = unidad.temas[neighborIndex]
                           unidad.temas[neighborIndex] = temp

                           // Swap keys for consistency? No, just swap positions.
                           // But if we use 'orden' property for sorting, we should swap that too.
                           const tempOrder = unidad.temas[index].orden
                           unidad.temas[index].orden = unidad.temas[neighborIndex].orden
                           unidad.temas[neighborIndex].orden = tempOrder
                       }
                   }
               }
           }
      } catch (err) {
          console.error('Error moving theme:', err)
          throw err
      } finally {
          loading.value = false
      }
  }

  async function cambiarEstado(id, estado) {
      if (!id) return
      loading.value = true
      try {
          const response = await asignaturaService.cambiarEstado(id, estado)
          if (asignaturaActual.value && asignaturaActual.value.id === id) {
              asignaturaActual.value.estado = response.data.estado
          }
           // Update list if present
           const index = asignaturas.value.findIndex(a => a.id === id)
           if (index !== -1) {
               asignaturas.value[index].estado = response.data.estado
           }
      } catch (err) {
          console.error('Error changing state:', err)
          throw err
      } finally {
          loading.value = false
      }
  }

  async function addBibliografia(asigId, data) {
    loading.value = true
    try {
      const payload = { ...data, asignatura_id: asigId }
      const response = await asignaturaService.addBibliografia(payload)
      if (asignaturaActual.value && asignaturaActual.value.id === asigId) {
        if (!asignaturaActual.value.bibliografias) asignaturaActual.value.bibliografias = []
        asignaturaActual.value.bibliografias.push(response.data)
      }
      return response.data
    } catch (err) {
      console.error('Error adding biblio:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateBibliografia(asigId, biblioId, data) {
    loading.value = true
    try {
      const response = await asignaturaService.updateBibliografia(biblioId, data)
      if (asignaturaActual.value && asignaturaActual.value.id === asigId) {
        const index = asignaturaActual.value.bibliografias.findIndex(b => b.id === biblioId)
        if (index !== -1) {
          asignaturaActual.value.bibliografias[index] = response.data
        }
      }
      return response.data
    } catch (err) {
      console.error('Error updating biblio:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteBibliografia(asigId, biblioId) {
    loading.value = true
    try {
      await asignaturaService.deleteBibliografia(biblioId)
      if (asignaturaActual.value && asignaturaActual.value.id === asigId) {
        asignaturaActual.value.bibliografias = asignaturaActual.value.bibliografias.filter(b => b.id !== biblioId)
      }
    } catch (err) {
      console.error('Error deleting biblio:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  function calcularProgresoTema(tema) {
    if (!tema) return 0

    // Helpers para acceder a propiedades anidadas o planas (Legacy support)
    const getDeep = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj)
    }
    const getAny = (obj, paths) => {
        for (const path of paths) {
            const val = getDeep(obj, path)
            if (val !== undefined && val !== null) return val
        }
        return undefined
    }

    // 1. Resultados
    let pResultados = 0
    let totalCamposRes = 3
    let camposLlenosRes = 0
    if (tema.resultado_aprendizaje?.trim()) camposLlenosRes++

    // Logros: verificar si existe y manejar array
    const logros = tema.logros_esperados || tema.logros || []
    if (logros.length > 0 && logros.some(l => l.descripcion?.trim())) camposLlenosRes++
    const tieneIndicador = logros.some(l => l.indicadores?.some(i => i.descripcion?.trim()))
    if (tieneIndicador) camposLlenosRes++

    if (logros.length > 1) {
        logros.slice(1).forEach(logro => {
            totalCamposRes++
            if (logro.descripcion?.trim()) camposLlenosRes++
        })
    }
    logros.forEach(logro => {
        const indicadores = logro.indicadores || []
        if (indicadores.length > 1) {
            indicadores.slice(1).forEach(ind => {
                totalCamposRes++
                if (ind.descripcion?.trim()) camposLlenosRes++
            })
        }
    })
    pResultados = Math.round((camposLlenosRes / totalCamposRes) * 100)

    // 2. Contenidos
    let pContenidos = 0
    // Buscar en: contenidos.conceptual, o contenido_conceptual (plano)
    const conceptual = getAny(tema, ['contenidos.conceptual', 'contenido_conceptual']) || []
    const procedimental = getAny(tema, ['contenidos.procedimental', 'contenido_procedimental']) || []
    const actitudinal = getAny(tema, ['contenidos.actitudinal', 'contenido_actitudinal']) || []

    let totalCamposCont = 3
    let camposLlenosCont = 0
    if (conceptual.length > 0 && conceptual.some(item => item?.trim())) camposLlenosCont++
    if (conceptual.length > 1) conceptual.slice(1).forEach(item => { totalCamposCont++; if (item?.trim()) camposLlenosCont++ })
    if (procedimental.length > 0 && procedimental.some(item => item?.trim())) camposLlenosCont++
    if (procedimental.length > 1) procedimental.slice(1).forEach(item => { totalCamposCont++; if (item?.trim()) camposLlenosCont++ })
    if (actitudinal.length > 0 && actitudinal.some(item => item?.trim())) camposLlenosCont++
    if (actitudinal.length > 1) actitudinal.slice(1).forEach(item => { totalCamposCont++; if (item?.trim()) camposLlenosCont++ })
    pContenidos = Math.round((camposLlenosCont / totalCamposCont) * 100)

    // 3. Estrategias
    let pEstrategias = 0
    // Buscar en: planificacion_personal.estrategias_metodologicas, estrategias.metodologicas, estrategias_metodologicas
    const metodologicas = getAny(tema, ['planificacion_personal.estrategias_metodologicas', 'estrategias.metodologicas', 'estrategias_metodologicas']) || ''
    const aprendizaje = getAny(tema, ['planificacion_personal.estrategias_aprendizaje', 'estrategias.aprendizaje', 'estrategias_aprendizaje']) || ''
    const recursosEst = getAny(tema, ['planificacion_personal.estrategias_recursos', 'estrategias.recursos', 'estrategias_recursos']) || []

    let totalCamposEst = 3
    let camposLlenosEst = 0
    if (metodologicas?.trim()) camposLlenosEst++
    if (aprendizaje?.trim()) camposLlenosEst++
    if (recursosEst.length > 0 && recursosEst.some(r => r?.trim())) camposLlenosEst++
    if (recursosEst.length > 1) recursosEst.slice(1).forEach(rec => { totalCamposEst++; if (rec?.trim()) camposLlenosEst++ })
    pEstrategias = Math.round((camposLlenosEst / totalCamposEst) * 100)

    // 4. Evaluación
    let pEvaluacion = 0
    // Buscar en: planificacion_personal.evaluacion_formativa.actividades, evaluacion.formativa.actividades, evaluacion_formativa.actividades
    const fActividades = getAny(tema, ['planificacion_personal.evaluacion_formativa.actividades', 'evaluacion.formativa.actividades', 'evaluacion_formativa.actividades']) || []
    const fInstrumentos = getAny(tema, ['planificacion_personal.evaluacion_formativa.instrumentos', 'evaluacion.formativa.instrumentos', 'evaluacion_formativa.instrumentos']) || []
    const fEvidencias = getAny(tema, ['planificacion_personal.evaluacion_formativa.evidencias', 'evaluacion.formativa.evidencias', 'evaluacion_formativa.evidencias']) || []
    const sActividades = getAny(tema, ['planificacion_personal.evaluacion_sumativa.actividades', 'evaluacion.sumativa.actividades', 'evaluacion_sumativa.actividades']) || []
    const sInstrumentos = getAny(tema, ['planificacion_personal.evaluacion_sumativa.instrumentos', 'evaluacion.sumativa.instrumentos', 'evaluacion_sumativa.instrumentos']) || []
    const sEvidencias = getAny(tema, ['planificacion_personal.evaluacion_sumativa.evidencias', 'evaluacion.sumativa.evidencias', 'evaluacion_sumativa.evidencias']) || []

    let totalCamposEval = 6
    let camposLlenosEval = 0
    if (fActividades.length > 0) camposLlenosEval++
    if (fInstrumentos.length > 0) camposLlenosEval++
    if (fEvidencias.length > 0) camposLlenosEval++
    if (sActividades.length > 0) camposLlenosEval++
    if (sInstrumentos.length > 0) camposLlenosEval++
    if (sEvidencias.length > 0) camposLlenosEval++
    pEvaluacion = Math.round((camposLlenosEval / totalCamposEval) * 100)

    // 5. Secuencia
    let pSecuencia = 0
    const secuencia = getAny(tema, ['planificacion_personal.secuencia_didactica', 'secuencia_didactica']) || []
    let totalCamposSec = 3
    let camposLlenosSec = 0
    secuencia.forEach(momento => { if (momento.actividad?.trim()) camposLlenosSec++ })
    if (secuencia.length > 3) totalCamposSec = secuencia.length
    pSecuencia = Math.min(100, Math.round((camposLlenosSec / totalCamposSec) * 100))

    return Math.round((pResultados + pContenidos + pEstrategias + pEvaluacion + pSecuencia) / 5)
  }

  // Getter para buscar asignatura por ID (usa asignaturaActual o busca en lista)
  async function getAsignaturaById(id) {
    // Primero revisar si ya la tenemos cargada
    if (asignaturaActual.value && asignaturaActual.value.id == id) {
      return asignaturaActual.value
    }
    // Buscar en lista local
    const found = asignaturas.value.find(a => a.id == id)
    if (found) {
      return found
    }
    await setAsignaturaActual(id)
    return asignaturaActual.value
  }

  // Opciones Estáticas para Listas Desplegables
  const opcionesEvaluacionFormativa = [
    'Participación en clase', 'Preguntas dirigidas', 'Cuestionario rápido (Quiz)', 'Debate grupal',
    'Retroalimentación inmediata', 'Observación del desempeño', 'Autoevaluación', 'Coevaluación entre pares',
    'Portafolio de evidencias', 'Diario de aprendizaje', 'Mapas conceptuales', 'Resolución de problemas en clase',
    'Discusión guiada', 'Lluvia de ideas', 'Trabajo en equipo supervisado'
  ]

  const opcionesInstrumentosFormativa = [
    'Lista de cotejo', 'Rúbrica de participación', 'Escala de valoración', 'Registro anecdótico',
    'Quiz en línea', 'Formulario de autoevaluación', 'Ficha de observación'
  ]

  const opcionesEvidenciasFormativa = [
    'Registro de participación', 'Respuestas del quiz', 'Mapa conceptual elaborado', 'Notas de observación',
    'Autoevaluación completada', 'Retroalimentación documentada'
  ]

  const opcionesEvaluacionSumativa = [
    'Examen escrito', 'Examen oral', 'Trabajo de investigación', 'Ensayo académico', 'Proyecto final',
    'Presentación oral', 'Estudio de caso', 'Resolución de problemas complejos', 'Informe de laboratorio',
    'Diseño de prototipo', 'Defensa de proyecto'
  ]

  const opcionesInstrumentosSumativa = [
    'Prueba objetiva', 'Rúbrica analítica', 'Rúbrica holística', 'Lista de verificación de proyecto',
    'Escala de estimación', 'Guía de evaluación oral'
  ]

  const opcionesEvidenciasSumativa = [
    'Examen resuelto', 'Documento de investigación', 'Ensayo entregado', 'Prototipo funcional',
    'Informe final', 'Grabación de presentación', 'Acta de defensa'
  ]

  return {
    asignaturas,
    asignaturaActual,
    loading,
    error,
    totalAsignaturas,
    fetchAsignaturas,
    setAsignaturaActual,
    getAsignaturaById,
    createAsignatura,
    updateAsignatura,
    deleteAsignatura,
    assignDocentes,
    updateElementoCompetencia,
    addBibliografia,
    updateBibliografia,
    deleteBibliografia,
    calcularProgresoTema,
    importarWord,
    createUnidad,
    updateUnidad,
    deleteUnidad,
    createTema,
    updateTema,
    deleteTema,
    moveTema,
    cambiarEstado,
    // Exports de opciones
    opcionesEvaluacionFormativa,
    opcionesInstrumentosFormativa,
    opcionesEvidenciasFormativa,
    opcionesEvaluacionSumativa,
    opcionesInstrumentosSumativa,
    opcionesEvidenciasSumativa
  }
})
