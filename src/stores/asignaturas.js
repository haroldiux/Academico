import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAsignaturasStore = defineStore('asignaturas', () => {
  // Opciones predefinidas de evaluación
  const opcionesEvaluacionFormativa = [
    'Participación en clase',
    'Preguntas dirigidas',
    'Cuestionario rápido (Quiz)',
    'Debate grupal',
    'Retroalimentación inmediata',
    'Observación del desempeño',
    'Autoevaluación',
    'Coevaluación entre pares',
    'Portafolio de evidencias',
    'Diario de aprendizaje',
    'Mapas conceptuales',
    'Resolución de problemas en clase',
    'Discusión guiada',
    'Lluvia de ideas',
    'Trabajo en equipo supervisado'
  ]

  const opcionesEvaluacionSumativa = [
    'Examen escrito',
    'Examen oral',
    'Examen práctico',
    'Prueba objetiva (opción múltiple)',
    'Prueba de desarrollo',
    'Trabajo de investigación',
    'Proyecto final',
    'Exposición/Presentación',
    'Informe técnico',
    'Estudio de caso',
    'Ensayo académico',
    'Práctica de laboratorio',
    'Defensa de proyecto',
    'Rúbrica de desempeño',
    'Examen tipo test'
  ]

  const opcionesInstrumentosFormativa = [
    'Lista de cotejo',
    'Rúbrica de participación',
    'Escala de valoración',
    'Registro anecdótico',
    'Quiz en línea',
    'Formulario de autoevaluación',
    'Ficha de observación'
  ]

  const opcionesInstrumentosSumativa = [
    'Prueba objetiva',
    'Rúbrica analítica',
    'Rúbrica holística',
    'Lista de verificación',
    'Escala de calificación',
    'Matriz de evaluación',
    'Portafolio de evidencias'
  ]

  const opcionesEvidenciasFormativa = [
    'Registro de participación',
    'Respuestas del quiz',
    'Mapa conceptual elaborado',
    'Notas de observación',
    'Autoevaluación completada',
    'Retroalimentación documentada'
  ]

  const opcionesEvidenciasSumativa = [
    'Examen resuelto',
    'Documento de investigación',
    'Proyecto entregado',
    'Video de presentación',
    'Informe escrito',
    'Caso clínico resuelto',
    'Práctica documentada'
  ]

  // Estado - Asignaturas disponibles
  const asignaturas = ref([
    {
      id: 1,
      codigo: 'SIS-301',
      nombre: 'Ingeniería de Software I',
      sigla: 'IS-I',
      horas_teoricas: 40,
      horas_practicas: 20,
      horas_laboratorio: 20,
      creditos: 4,
      semestre: 5,
      carrera: 'Ingeniería de Sistemas',
      docente: 'Carlos Mendoza Quispe',
      descripcion: 'Introducción a los principios y prácticas de la ingeniería de software.',
      objetivo_general: 'Desarrollar competencias en el análisis, diseño y desarrollo de sistemas de software.',
      justificacion: 'La ingeniería de software es fundamental para la formación del ingeniero de sistemas.',
      saberes_previos: 'Programación I, Programación II, Estructuras de Datos',
      contenido_minimo: 'Ciclo de vida del software, metodologías ágiles, UML, patrones de diseño.',
      metodologia_ensenanza: 'Clases magistrales, trabajos prácticos, proyectos.',
      criterios_evaluacion: 'Exámenes parciales, proyecto final, participación.',
      periodoId: 1,
      carreraId: 1,
      docenteId: 1,
      estado: 'activo',
      fechaCreacion: '2024-01-15',
      
      // Horarios de clases (vinculados con planificación)
      horarios: [
        { dia: 'Lunes', horaInicio: '07:00', horaFin: '09:00', aula: 'Aula 301' },
        { dia: 'Miércoles', horaInicio: '07:00', horaFin: '09:00', aula: 'Lab. 201' }
      ],
      
      // Grupos asignados
      grupos: [
        { id: 1, nombre: 'Grupo 1', turno: 'Mañana', cupo: 40 },
        { id: 2, nombre: 'Grupo 2', turno: 'Noche', cupo: 35 }
      ],
      
      // Bibliografía
      bibliografias: [
        {
          id: 1,
          titulo: 'Ingeniería del Software: Un Enfoque Práctico',
          autor: 'Roger S. Pressman',
          editorial: 'McGraw-Hill',
          edicion: '8va Edición',
          anio: 2015,
          isbn: '978-607-15-1314-8',
          tipo: 'principal',
          paginas: '',
          url: null
        },
        {
          id: 2,
          titulo: 'Software Engineering',
          autor: 'Ian Sommerville',
          editorial: 'Pearson',
          edicion: '10th Edition',
          anio: 2016,
          isbn: '978-0133943030',
          tipo: 'complementario',
          paginas: '',
          url: null
        }
      ],

      // Unidades
      unidades: [
        {
          id: 1,
          numero: 1,
          titulo: 'Fundamentos de la Ingeniería de Software',
          descripcion: 'Conceptos básicos y evolución de la ingeniería de software.',
          horas: 12,
          elemento_competencia: 'Analiza e interpreta los fundamentos de la ingeniería de software para comprender su importancia en el desarrollo de sistemas.',
          
          temas: [
            {
              id: 1,
              numero: 1,
              titulo: 'Introducción a la Ingeniería de Software',
              descripcion: 'Definición, historia y evolución.',
              horas: 4,
              
              // Resultado de Aprendizaje
              resultado_aprendizaje: 'Comprende y analiza los conceptos fundamentales de la ingeniería de software, identificando su evolución histórica y su importancia en el desarrollo de sistemas.',
              
              // Logros Esperados con Indicadores anidados
              logros_esperados: [
                {
                  id: 1,
                  codigo: 'LE.1',
                  descripcion: 'Define correctamente el concepto de ingeniería de software como disciplina.',
                  parcial: 1, // 1 = 1er Parcial, 2 = 2do Parcial
                  indicadores: [
                    { id: 1, codigo: 'IND.1.1', descripcion: 'Explica con precisión el concepto de ingeniería de software.' },
                    { id: 2, codigo: 'IND.1.2', descripcion: 'Identifica los objetivos principales de la disciplina.' }
                  ]
                },
                {
                  id: 2,
                  codigo: 'LE.2',
                  descripcion: 'Identifica las etapas históricas del desarrollo de software.',
                  parcial: 1,
                  indicadores: [
                    { id: 3, codigo: 'IND.2.1', descripcion: 'Describe las crisis del software y sus causas.' },
                    { id: 4, codigo: 'IND.2.2', descripcion: 'Relaciona los eventos históricos con la evolución de metodologías.' }
                  ]
                },
                {
                  id: 3,
                  codigo: 'LE.3',
                  descripcion: 'Relaciona la crisis del software con la necesidad de metodologías formales.',
                  parcial: 2,
                  indicadores: [
                    { id: 5, codigo: 'IND.3.1', descripcion: 'Argumenta la importancia de las metodologías en proyectos reales.' }
                  ]
                }
              ],
              
              // Contenidos
              contenidos: {
                conceptual: [
                  'Definición de Ingeniería de Software',
                  'Historia y evolución',
                  'Crisis del software',
                  'Importancia de las metodologías'
                ],
                procedimental: [
                  'Análisis de casos de estudio',
                  'Investigación de proyectos fallidos',
                  'Comparación de enfoques'
                ],
                actitudinal: [
                  'Demuestra interés por la historia de la disciplina',
                  'Valora la importancia de los procesos formales',
                  'Mantiene actitud crítica ante los problemas del software'
                ]
              },
              
              // Estrategias Didácticas
              estrategias: {
                metodologicas: 'Clase magistral con presentación multimedia. Análisis de casos de estudio de proyectos reales. Discusión guiada sobre la evolución del software.',
                aprendizaje: 'Lectura previa del material. Participación activa en discusiones. Elaboración de línea de tiempo histórica. Investigación de casos.',
                recursos: [
                  'Presentaciones multimedia',
                  'Videos documentales',
                  'Artículos de investigación',
                  'Casos de estudio'
                ]
              },
              
              // Evaluación con selección múltiple
              evaluacion: {
                formativa: {
                  actividades: ['Participación en clase', 'Cuestionario rápido (Quiz)'],
                  instrumentos: ['Rúbrica de participación', 'Quiz en línea'],
                  evidencias: ['Registro de participación', 'Respuestas del quiz']
                },
                sumativa: {
                  actividades: ['Examen escrito', 'Trabajo de investigación'],
                  instrumentos: ['Prueba objetiva', 'Rúbrica analítica'],
                  evidencias: ['Examen resuelto', 'Documento de investigación']
                }
              },
              
              // Secuencia Didáctica
              secuencia_didactica: [
                {
                  id: 1,
                  momento: 'INTRODUCCIÓN',
                  actividad: 'Pregunta activadora: ¿Por qué fracasan los proyectos de software?\nPresentación de estadísticas de proyectos fallidos.\nIntroducción al tema y objetivos de la sesión.',
                  duracion: 10
                },
                {
                  id: 2,
                  momento: 'DESARROLLO',
                  actividad: 'Exposición de conceptos fundamentales.\nAnálisis de la evolución histórica.\nDiscusión de la crisis del software.\nPresentación de metodologías como solución.',
                  duracion: 25
                },
                {
                  id: 3,
                  momento: 'CIERRE',
                  actividad: 'Síntesis de conceptos clave.\nResolución de dudas.\nAsignación de lectura para próxima clase.\nQuiz de verificación de comprensión.',
                  duracion: 10
                }
              ]
            },
            {
              id: 2,
              numero: 2,
              titulo: 'Modelos de Proceso de Software',
              descripcion: 'Ciclos de vida y metodologías de desarrollo.',
              horas: 4,
              resultado_aprendizaje: 'Conoce y compara los diferentes modelos de proceso de software.',
              logros_esperados: [
                {
                  id: 4,
                  codigo: 'LE.1',
                  descripcion: 'Describe las características del modelo cascada.',
                  indicadores: []
                }
              ],
              contenidos: { conceptual: ['Modelo cascada', 'Modelo iterativo'], procedimental: [], actitudinal: [] },
              estrategias: { metodologicas: '', aprendizaje: '', recursos: [] },
              evaluacion: {
                formativa: { actividades: [], instrumentos: [], evidencias: [] },
                sumativa: { actividades: [], instrumentos: [], evidencias: [] }
              },
              secuencia_didactica: []
            },
            {
              id: 3,
              numero: 3,
              titulo: 'Metodologías Ágiles',
              descripcion: 'Scrum, XP, Kanban y otras metodologías ágiles.',
              horas: 4,
              resultado_aprendizaje: '',
              logros_esperados: [],
              contenidos: { conceptual: [], procedimental: [], actitudinal: [] },
              estrategias: { metodologicas: '', aprendizaje: '', recursos: [] },
              evaluacion: {
                formativa: { actividades: [], instrumentos: [], evidencias: [] },
                sumativa: { actividades: [], instrumentos: [], evidencias: [] }
              },
              secuencia_didactica: []
            }
          ]
        },
        {
          id: 2,
          numero: 2,
          titulo: 'Análisis y Especificación de Requisitos',
          descripcion: 'Técnicas para la captura y documentación de requisitos.',
          horas: 16,
          elemento_competencia: '',
          temas: [
            {
              id: 4,
              numero: 1,
              titulo: 'Ingeniería de Requisitos',
              descripcion: 'Elicitación, análisis y especificación.',
              horas: 6,
              resultado_aprendizaje: '',
              logros_esperados: [],
              contenidos: { conceptual: [], procedimental: [], actitudinal: [] },
              estrategias: { metodologicas: '', aprendizaje: '', recursos: [] },
              evaluacion: {
                formativa: { actividades: [], instrumentos: [], evidencias: [] },
                sumativa: { actividades: [], instrumentos: [], evidencias: [] }
              },
              secuencia_didactica: []
            }
          ]
        },
        {
          id: 3,
          numero: 3,
          titulo: 'Diseño de Software',
          descripcion: 'Principios y patrones de diseño.',
          horas: 20,
          elemento_competencia: '',
          temas: []
        }
      ]
    }
  ])

  const asignaturaActual = ref(null)
  const temaActual = ref(null)
  const loading = ref(false)

  // Getters
  const totalAsignaturas = computed(() => asignaturas.value.length)
  
  const getAsignaturaById = (id) => {
    return asignaturas.value.find(a => a.id === id)
  }

  // Calcular progreso por sección - CONTEO POR CAMPO INDIVIDUAL
  const calcularProgresoResultados = (tema) => {
    let totalCampos = 0
    let camposLlenos = 0

    // 1. Resultado de aprendizaje (1 campo)
    totalCampos++
    if (tema.resultado_aprendizaje?.trim()) camposLlenos++

    // 2. Cada logro esperado cuenta como 1 campo
    const logros = tema.logros_esperados || []
    logros.forEach(logro => {
      totalCampos++ // El logro en sí
      if (logro.descripcion?.trim()) camposLlenos++
      
      // 3. Cada indicador dentro del logro cuenta como 1 campo
      const indicadores = logro.indicadores || []
      indicadores.forEach(ind => {
        totalCampos++
        if (ind.descripcion?.trim()) camposLlenos++
      })
    })

    // Mínimo 3 campos esperados para tener un 100% significativo
    if (totalCampos < 3) totalCampos = 3

    return Math.min(100, Math.round((camposLlenos / totalCampos) * 100))
  }

  const calcularProgresoContenidos = (tema) => {
    let totalCampos = 0
    let camposLlenos = 0

    // Cada ítem de contenido cuenta como 1 campo
    const conceptual = tema.contenidos?.conceptual || []
    const procedimental = tema.contenidos?.procedimental || []
    const actitudinal = tema.contenidos?.actitudinal || []

    conceptual.forEach(item => {
      totalCampos++
      if (item?.trim()) camposLlenos++
    })

    procedimental.forEach(item => {
      totalCampos++
      if (item?.trim()) camposLlenos++
    })

    actitudinal.forEach(item => {
      totalCampos++
      if (item?.trim()) camposLlenos++
    })

    // Mínimo 3 campos esperados (1 de cada tipo)
    if (totalCampos < 3) totalCampos = 3

    return Math.min(100, Math.round((camposLlenos / totalCampos) * 100))
  }

  const calcularProgresoEstrategias = (tema) => {
    let totalCampos = 0
    let camposLlenos = 0

    // 1. Estrategias metodológicas (1 campo)
    totalCampos++
    if (tema.estrategias?.metodologicas?.trim()) camposLlenos++

    // 2. Estrategias de aprendizaje (1 campo)
    totalCampos++
    if (tema.estrategias?.aprendizaje?.trim()) camposLlenos++

    // 3. Cada recurso cuenta como 1 campo
    const recursos = tema.estrategias?.recursos || []
    recursos.forEach(rec => {
      totalCampos++
      if (rec?.trim()) camposLlenos++
    })

    // Mínimo 3 campos esperados
    if (totalCampos < 3) totalCampos = 3

    return Math.min(100, Math.round((camposLlenos / totalCampos) * 100))
  }

  const calcularProgresoEvaluacion = (tema) => {
    let totalCampos = 0
    let camposLlenos = 0

    // Evaluación Formativa - 3 campos (actividades, instrumentos, evidencias)
    totalCampos++
    if (tema.evaluacion?.formativa?.actividades?.length > 0) camposLlenos++
    totalCampos++
    if (tema.evaluacion?.formativa?.instrumentos?.length > 0) camposLlenos++
    totalCampos++
    if (tema.evaluacion?.formativa?.evidencias?.length > 0) camposLlenos++

    // Evaluación Sumativa - 3 campos (actividades, instrumentos, evidencias)
    totalCampos++
    if (tema.evaluacion?.sumativa?.actividades?.length > 0) camposLlenos++
    totalCampos++
    if (tema.evaluacion?.sumativa?.instrumentos?.length > 0) camposLlenos++
    totalCampos++
    if (tema.evaluacion?.sumativa?.evidencias?.length > 0) camposLlenos++

    return Math.round((camposLlenos / totalCampos) * 100)
  }

  const calcularProgresoSecuencia = (tema) => {
    let totalCampos = 0
    let camposLlenos = 0

    // Cada momento de la secuencia cuenta como 1 campo
    const secuencia = tema.secuencia_didactica || []
    secuencia.forEach(momento => {
      totalCampos++ // El momento en sí
      if (momento.actividad?.trim()) camposLlenos++
    })

    // Mínimo 3 momentos esperados (Introducción, Desarrollo, Cierre)
    if (totalCampos < 3) totalCampos = 3

    return Math.min(100, Math.round((camposLlenos / totalCampos) * 100))
  }

  const calcularProgresoTema = (tema) => {
    // Conteo total de TODOS los campos del tema
    let totalCampos = 0
    let camposLlenos = 0

    // === RESULTADOS ===
    // Resultado de aprendizaje
    totalCampos++
    if (tema.resultado_aprendizaje?.trim()) camposLlenos++

    // Logros e indicadores
    const logros = tema.logros_esperados || []
    logros.forEach(logro => {
      totalCampos++
      if (logro.descripcion?.trim()) camposLlenos++
      const indicadores = logro.indicadores || []
      indicadores.forEach(ind => {
        totalCampos++
        if (ind.descripcion?.trim()) camposLlenos++
      })
    })

    // === CONTENIDOS ===
    const conceptual = tema.contenidos?.conceptual || []
    const procedimental = tema.contenidos?.procedimental || []
    const actitudinal = tema.contenidos?.actitudinal || []
    
    conceptual.forEach(item => { totalCampos++; if (item?.trim()) camposLlenos++ })
    procedimental.forEach(item => { totalCampos++; if (item?.trim()) camposLlenos++ })
    actitudinal.forEach(item => { totalCampos++; if (item?.trim()) camposLlenos++ })

    // === ESTRATEGIAS ===
    totalCampos++
    if (tema.estrategias?.metodologicas?.trim()) camposLlenos++
    totalCampos++
    if (tema.estrategias?.aprendizaje?.trim()) camposLlenos++
    
    const recursos = tema.estrategias?.recursos || []
    recursos.forEach(rec => { totalCampos++; if (rec?.trim()) camposLlenos++ })

    // === EVALUACIÓN ===
    totalCampos++; if (tema.evaluacion?.formativa?.actividades?.length > 0) camposLlenos++
    totalCampos++; if (tema.evaluacion?.formativa?.instrumentos?.length > 0) camposLlenos++
    totalCampos++; if (tema.evaluacion?.formativa?.evidencias?.length > 0) camposLlenos++
    totalCampos++; if (tema.evaluacion?.sumativa?.actividades?.length > 0) camposLlenos++
    totalCampos++; if (tema.evaluacion?.sumativa?.instrumentos?.length > 0) camposLlenos++
    totalCampos++; if (tema.evaluacion?.sumativa?.evidencias?.length > 0) camposLlenos++

    // === SECUENCIA ===
    const secuencia = tema.secuencia_didactica || []
    secuencia.forEach(momento => { totalCampos++; if (momento.actividad?.trim()) camposLlenos++ })

    // Mínimo de campos esperados para un tema completo
    const minimoEsperado = 15 // Ajustable según requisitos
    if (totalCampos < minimoEsperado) totalCampos = minimoEsperado

    return Math.min(100, Math.round((camposLlenos / totalCampos) * 100))
  }

  // Actions
  function setAsignaturaActual(id) {
    asignaturaActual.value = getAsignaturaById(id)
  }

  function setTemaActual(tema) {
    temaActual.value = tema
  }

  function updateAsignatura(id, datos) {
    const index = asignaturas.value.findIndex(a => a.id === id)
    if (index !== -1) {
      asignaturas.value[index] = { ...asignaturas.value[index], ...datos }
      if (asignaturaActual.value?.id === id) {
        asignaturaActual.value = asignaturas.value[index]
      }
    }
  }

  // Bibliografía
  function addBibliografia(asignaturaId, bibliografia) {
    const asignatura = getAsignaturaById(asignaturaId)
    if (asignatura) {
      const newId = Math.max(0, ...asignatura.bibliografias.map(b => b.id)) + 1
      asignatura.bibliografias.push({ ...bibliografia, id: newId })
    }
  }

  function updateBibliografia(asignaturaId, biblioId, datos) {
    const asignatura = getAsignaturaById(asignaturaId)
    if (asignatura) {
      const index = asignatura.bibliografias.findIndex(b => b.id === biblioId)
      if (index !== -1) {
        asignatura.bibliografias[index] = { ...asignatura.bibliografias[index], ...datos }
      }
    }
  }

  function deleteBibliografia(asignaturaId, biblioId) {
    const asignatura = getAsignaturaById(asignaturaId)
    if (asignatura) {
      asignatura.bibliografias = asignatura.bibliografias.filter(b => b.id !== biblioId)
    }
  }

  // Elemento de Competencia
  function updateElementoCompetencia(asignaturaId, unidadId, texto) {
    const asignatura = getAsignaturaById(asignaturaId)
    if (asignatura) {
      const unidad = asignatura.unidades.find(u => u.id === unidadId)
      if (unidad) {
        unidad.elemento_competencia = texto
      }
    }
  }

  // Actualizar tema completo
  function updateTema(asignaturaId, unidadId, temaId, datos) {
    const asignatura = getAsignaturaById(asignaturaId)
    if (asignatura) {
      const unidad = asignatura.unidades.find(u => u.id === unidadId)
      if (unidad) {
        const index = unidad.temas.findIndex(t => t.id === temaId)
        if (index !== -1) {
          unidad.temas[index] = { ...unidad.temas[index], ...datos }
          if (temaActual.value?.id === temaId) {
            temaActual.value = unidad.temas[index]
          }
        }
      }
    }
  }

  // Logros Esperados
  function addLogroEsperado(asignaturaId, unidadId, temaId, logro) {
    const asignatura = getAsignaturaById(asignaturaId)
    if (asignatura) {
      const unidad = asignatura.unidades.find(u => u.id === unidadId)
      if (unidad) {
        const tema = unidad.temas.find(t => t.id === temaId)
        if (tema) {
          const newId = Date.now()
          const numero = (tema.logros_esperados?.length || 0) + 1
          if (!tema.logros_esperados) tema.logros_esperados = []
          tema.logros_esperados.push({ 
            id: newId, 
            codigo: `LE.${numero}`,
            descripcion: logro.descripcion,
            parcial: logro.parcial || 1, // 1 = 1er Parcial, 2 = 2do Parcial
            indicadores: []
          })
        }
      }
    }
  }

  function deleteLogroEsperado(asignaturaId, unidadId, temaId, logroId) {
    const asignatura = getAsignaturaById(asignaturaId)
    if (asignatura) {
      const unidad = asignatura.unidades.find(u => u.id === unidadId)
      if (unidad) {
        const tema = unidad.temas.find(t => t.id === temaId)
        if (tema) {
          tema.logros_esperados = tema.logros_esperados.filter(l => l.id !== logroId)
          tema.logros_esperados.forEach((l, idx) => { l.codigo = `LE.${idx + 1}` })
        }
      }
    }
  }

  // Indicadores de Logro (anidados en logro)
  function addIndicadorLogro(asignaturaId, unidadId, temaId, logroId, indicador) {
    const asignatura = getAsignaturaById(asignaturaId)
    if (asignatura) {
      const unidad = asignatura.unidades.find(u => u.id === unidadId)
      if (unidad) {
        const tema = unidad.temas.find(t => t.id === temaId)
        if (tema) {
          const logro = tema.logros_esperados.find(l => l.id === logroId)
          if (logro) {
            const newId = Date.now()
            if (!logro.indicadores) logro.indicadores = []
            const logroNum = logro.codigo.replace('LE.', '')
            const indNum = logro.indicadores.length + 1
            logro.indicadores.push({ 
              id: newId, 
              codigo: `IND.${logroNum}.${indNum}`,
              descripcion: indicador.descripcion 
            })
          }
        }
      }
    }
  }

  function deleteIndicadorLogro(asignaturaId, unidadId, temaId, logroId, indicadorId) {
    const asignatura = getAsignaturaById(asignaturaId)
    if (asignatura) {
      const unidad = asignatura.unidades.find(u => u.id === unidadId)
      if (unidad) {
        const tema = unidad.temas.find(t => t.id === temaId)
        if (tema) {
          const logro = tema.logros_esperados.find(l => l.id === logroId)
          if (logro) {
            logro.indicadores = logro.indicadores.filter(i => i.id !== indicadorId)
            const logroNum = logro.codigo.replace('LE.', '')
            logro.indicadores.forEach((i, idx) => { i.codigo = `IND.${logroNum}.${idx + 1}` })
          }
        }
      }
    }
  }

  // Secuencia Didáctica
  function addSecuencia(asignaturaId, unidadId, temaId, secuencia) {
    const asignatura = getAsignaturaById(asignaturaId)
    if (asignatura) {
      const unidad = asignatura.unidades.find(u => u.id === unidadId)
      if (unidad) {
        const tema = unidad.temas.find(t => t.id === temaId)
        if (tema) {
          if (!tema.secuencia_didactica) tema.secuencia_didactica = []
          tema.secuencia_didactica.push({ id: Date.now(), ...secuencia })
        }
      }
    }
  }

  function deleteSecuencia(asignaturaId, unidadId, temaId, secuenciaId) {
    const asignatura = getAsignaturaById(asignaturaId)
    if (asignatura) {
      const unidad = asignatura.unidades.find(u => u.id === unidadId)
      if (unidad) {
        const tema = unidad.temas.find(t => t.id === temaId)
        if (tema) {
          tema.secuencia_didactica = tema.secuencia_didactica.filter(s => s.id !== secuenciaId)
        }
      }
    }
  }

  return {
    asignaturas,
    asignaturaActual,
    temaActual,
    loading,
    totalAsignaturas,
    opcionesEvaluacionFormativa,
    opcionesEvaluacionSumativa,
    opcionesInstrumentosFormativa,
    opcionesInstrumentosSumativa,
    opcionesEvidenciasFormativa,
    opcionesEvidenciasSumativa,
    getAsignaturaById,
    calcularProgresoResultados,
    calcularProgresoContenidos,
    calcularProgresoEstrategias,
    calcularProgresoEvaluacion,
    calcularProgresoSecuencia,
    calcularProgresoTema,
    setAsignaturaActual,
    setTemaActual,
    updateAsignatura,
    addBibliografia,
    updateBibliografia,
    deleteBibliografia,
    updateElementoCompetencia,
    updateTema,
    addLogroEsperado,
    deleteLogroEsperado,
    addIndicadorLogro,
    deleteIndicadorLogro,
    addSecuencia,
    deleteSecuencia
  }
})
