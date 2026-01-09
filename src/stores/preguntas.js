import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Tipos de pregunta
export const TIPOS_PREGUNTA = {
  SELECCION_MULTIPLE: 'SELECCION_MULTIPLE',
  SELECCION_UNICA: 'SELECCION_UNICA',
  FALSO_VERDADERO: 'FALSO_VERDADERO'
}

export const NIVELES_DIFICULTAD = {
  FACIL: { value: 'FACIL', label: 'Fácil', color: 'green' },
  MEDIO: { value: 'MEDIO', label: 'Medio', color: 'orange' },
  DIFICIL: { value: 'DIFICIL', label: 'Difícil', color: 'red' }
}

export const usePreguntasStore = defineStore('preguntas', () => {
  // Estado
  const preguntas = ref([
    // Preguntas de ejemplo
    {
      id: 1,
      logro_id: 1,
      asignatura_id: 1,
      tema_id: 1,
      docente_id: 7,
      grupos: ['A', 'B'],
      enunciado: '¿Cuál es el objetivo principal de la Ingeniería de Software?',
      tipo: TIPOS_PREGUNTA.SELECCION_UNICA,
      opciones: {
        A: 'Desarrollar software sin errores',
        B: 'Aplicar principios de ingeniería al desarrollo de software',
        C: 'Programar en múltiples lenguajes',
        D: 'Diseñar interfaces gráficas',
        E: null
      },
      respuesta_correcta: ['B'],
      nivel_dificultad: 'FACIL',
      peso: 10,
      activa: true,
      fecha_creacion: '2026-01-05'
    },
    {
      id: 2,
      logro_id: 1,
      asignatura_id: 1,
      tema_id: 1,
      docente_id: 7,
      grupos: ['A', 'B'],
      enunciado: 'Seleccione los principios fundamentales que caracterizan a la Ingeniería de Software:',
      tipo: TIPOS_PREGUNTA.SELECCION_MULTIPLE,
      opciones: {
        A: 'Abstracción y modularidad',
        B: 'Reutilización de código',
        C: 'Documentación exhaustiva',
        D: 'Pruebas y validación',
        E: 'Uso exclusivo de un lenguaje'
      },
      respuesta_correcta: ['A', 'B', 'C', 'D'],
      nivel_dificultad: 'MEDIO',
      peso: 15,
      activa: true,
      fecha_creacion: '2026-01-05'
    },
    {
      id: 3,
      logro_id: 1,
      asignatura_id: 1,
      tema_id: 1,
      docente_id: 7,
      grupos: ['A', 'B'],
      enunciado: 'La Ingeniería de Software solo se aplica a proyectos grandes y complejos.',
      tipo: TIPOS_PREGUNTA.FALSO_VERDADERO,
      opciones: {
        A: 'Verdadero',
        B: 'Falso',
        C: null,
        D: null,
        E: null
      },
      respuesta_correcta: ['B'],
      nivel_dificultad: 'FACIL',
      peso: 5,
      activa: true,
      fecha_creacion: '2026-01-05'
    }
  ])

  // Computed
  const totalPreguntas = computed(() => preguntas.value.length)
  const preguntasActivas = computed(() => preguntas.value.filter(p => p.activa))

  // Obtener preguntas por logro
  function getPreguntasByLogro(logroId) {
    return preguntas.value.filter(p => p.logro_id === logroId)
  }

  // Obtener preguntas por docente
  function getPreguntasByDocente(docenteId) {
    return preguntas.value.filter(p => p.docente_id === docenteId)
  }

  // Obtener preguntas por asignatura
  function getPreguntasByAsignatura(asignaturaId) {
    return preguntas.value.filter(p => p.asignatura_id === asignaturaId)
  }

  // Obtener preguntas por tema
  function getPreguntasByTema(temaId) {
    return preguntas.value.filter(p => p.tema_id === temaId)
  }

  // Estadísticas por logro
  function getEstadisticasByLogro(logroId) {
    const preguntasLogro = getPreguntasByLogro(logroId)
    return {
      total: preguntasLogro.length,
      porTipo: {
        seleccionMultiple: preguntasLogro.filter(p => p.tipo === TIPOS_PREGUNTA.SELECCION_MULTIPLE).length,
        seleccionUnica: preguntasLogro.filter(p => p.tipo === TIPOS_PREGUNTA.SELECCION_UNICA).length,
        falsoVerdadero: preguntasLogro.filter(p => p.tipo === TIPOS_PREGUNTA.FALSO_VERDADERO).length
      },
      porDificultad: {
        facil: preguntasLogro.filter(p => p.nivel_dificultad === 'FACIL').length,
        medio: preguntasLogro.filter(p => p.nivel_dificultad === 'MEDIO').length,
        dificil: preguntasLogro.filter(p => p.nivel_dificultad === 'DIFICIL').length
      }
    }
  }

  // Agregar pregunta
  function addPregunta(pregunta) {
    const newId = Math.max(...preguntas.value.map(p => p.id), 0) + 1
    preguntas.value.push({
      ...pregunta,
      id: newId,
      fecha_creacion: new Date().toISOString().split('T')[0],
      activa: true
    })
    return newId
  }

  // Agregar múltiples preguntas (para importación Excel)
  function addPreguntasBatch(preguntasArray, logroId, asignaturaId, temaId, docenteId, grupos) {
    const startId = Math.max(...preguntas.value.map(p => p.id), 0) + 1
    const nuevasPreguntas = preguntasArray.map((p, index) => ({
      ...p,
      id: startId + index,
      logro_id: logroId,
      asignatura_id: asignaturaId,
      tema_id: temaId,
      docente_id: docenteId,
      grupos: grupos,
      fecha_creacion: new Date().toISOString().split('T')[0],
      activa: true
    }))
    preguntas.value.push(...nuevasPreguntas)
    return nuevasPreguntas.length
  }

  // Actualizar pregunta
  function updatePregunta(id, data) {
    const index = preguntas.value.findIndex(p => p.id === id)
    if (index !== -1) {
      preguntas.value[index] = { ...preguntas.value[index], ...data }
      return true
    }
    return false
  }

  // Eliminar pregunta
  function deletePregunta(id) {
    const index = preguntas.value.findIndex(p => p.id === id)
    if (index !== -1) {
      preguntas.value.splice(index, 1)
      return true
    }
    return false
  }

  // Desactivar pregunta
  function togglePregunta(id) {
    const pregunta = preguntas.value.find(p => p.id === id)
    if (pregunta) {
      pregunta.activa = !pregunta.activa
      return true
    }
    return false
  }

  // Validar pregunta desde Excel
  function validarPreguntaExcel(row) {
    const errores = []
    
    if (!row.enunciado || row.enunciado.trim() === '') {
      errores.push('Enunciado requerido')
    }
    
    if (!row.tipo || !Object.values(TIPOS_PREGUNTA).includes(row.tipo)) {
      errores.push('Tipo de pregunta inválido')
    }
    
    if (!row.respuesta_correcta || row.respuesta_correcta.length === 0) {
      errores.push('Respuesta correcta requerida')
    }
    
    if (row.tipo === TIPOS_PREGUNTA.SELECCION_UNICA && row.respuesta_correcta.length > 1) {
      errores.push('Selección única solo permite una respuesta')
    }
    
    if (!row.nivel_dificultad || !['FACIL', 'MEDIO', 'DIFICIL'].includes(row.nivel_dificultad)) {
      errores.push('Nivel de dificultad inválido')
    }

    if (!row.peso || row.peso <= 0) {
      errores.push('Peso debe ser mayor a 0')
    }

    return {
      valido: errores.length === 0,
      errores
    }
  }

  return {
    // Estado
    preguntas,
    
    // Computed
    totalPreguntas,
    preguntasActivas,
    
    // Getters
    getPreguntasByLogro,
    getPreguntasByDocente,
    getPreguntasByAsignatura,
    getPreguntasByTema,
    getEstadisticasByLogro,
    
    // Mutations
    addPregunta,
    addPreguntasBatch,
    updatePregunta,
    deletePregunta,
    togglePregunta,
    validarPreguntaExcel,
    
    // Constantes
    TIPOS_PREGUNTA,
    NIVELES_DIFICULTAD
  }
})
