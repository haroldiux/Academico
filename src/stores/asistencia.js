import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAsistenciaStore = defineStore('asistencia', () => {
  // Estados de asistencia
  const ESTADOS = {
    PRESENTE: 'presente',
    AUSENTE: 'ausente',
    TARDANZA: 'tardanza',
    JUSTIFICADA: 'justificada'
  }

  // Estudiantes mock (por materia/grupo)
  const estudiantes = ref([
    { id: 1, codigo: '2024001', nombre: 'Juan', apellido: 'Pérez García', foto: null },
    { id: 2, codigo: '2024002', nombre: 'María', apellido: 'López Rodríguez', foto: null },
    { id: 3, codigo: '2024003', nombre: 'Carlos', apellido: 'Martínez Sánchez', foto: null },
    { id: 4, codigo: '2024004', nombre: 'Ana', apellido: 'González Torres', foto: null },
    { id: 5, codigo: '2024005', nombre: 'Luis', apellido: 'Hernández Díaz', foto: null },
    { id: 6, codigo: '2024006', nombre: 'Carmen', apellido: 'Ruiz Moreno', foto: null },
    { id: 7, codigo: '2024007', nombre: 'Pedro', apellido: 'Jiménez Álvarez', foto: null },
    { id: 8, codigo: '2024008', nombre: 'Laura', apellido: 'Ramírez Castro', foto: null },
    { id: 9, codigo: '2024009', nombre: 'Miguel', apellido: 'Vargas Ortiz', foto: null },
    { id: 10, codigo: '2024010', nombre: 'Sandra', apellido: 'Mendoza Ríos', foto: null },
    { id: 11, codigo: '2024011', nombre: 'Fernando', apellido: 'Aguilar Peña', foto: null },
    { id: 12, codigo: '2024012', nombre: 'Patricia', apellido: 'Flores Vega', foto: null },
    { id: 13, codigo: '2024013', nombre: 'Roberto', apellido: 'Suárez Luna', foto: null },
    { id: 14, codigo: '2024014', nombre: 'Diana', apellido: 'Medina Campos', foto: null },
    { id: 15, codigo: '2024015', nombre: 'Andrés', apellido: 'Reyes Molina', foto: null }
  ])

  // Registros de asistencia históricos
  const registrosAsistencia = ref([
    // Simular historial para el estudiante 1 (buena asistencia)
    { id: 1, estudianteId: 1, materiaId: 1, fecha: '2026-01-06', estado: 'presente' },
    { id: 2, estudianteId: 1, materiaId: 1, fecha: '2026-01-08', estado: 'presente' },
    { id: 3, estudianteId: 1, materiaId: 1, fecha: '2026-01-10', estado: 'presente' },
    // Estudiante 2 (asistencia regular)
    { id: 4, estudianteId: 2, materiaId: 1, fecha: '2026-01-06', estado: 'presente' },
    { id: 5, estudianteId: 2, materiaId: 1, fecha: '2026-01-08', estado: 'tardanza' },
    { id: 6, estudianteId: 2, materiaId: 1, fecha: '2026-01-10', estado: 'presente' },
    // Estudiante 3 (muchas faltas - en riesgo)
    { id: 7, estudianteId: 3, materiaId: 1, fecha: '2026-01-06', estado: 'ausente' },
    { id: 8, estudianteId: 3, materiaId: 1, fecha: '2026-01-08', estado: 'ausente' },
    { id: 9, estudianteId: 3, materiaId: 1, fecha: '2026-01-10', estado: 'justificada' },
    // Estudiante 4 (advertencia)
    { id: 10, estudianteId: 4, materiaId: 1, fecha: '2026-01-06', estado: 'presente' },
    { id: 11, estudianteId: 4, materiaId: 1, fecha: '2026-01-08', estado: 'ausente' },
    { id: 12, estudianteId: 4, materiaId: 1, fecha: '2026-01-10', estado: 'presente' },
    // Más registros para otros estudiantes
    { id: 13, estudianteId: 5, materiaId: 1, fecha: '2026-01-06', estado: 'presente' },
    { id: 14, estudianteId: 5, materiaId: 1, fecha: '2026-01-08', estado: 'presente' },
    { id: 15, estudianteId: 5, materiaId: 1, fecha: '2026-01-10', estado: 'tardanza' },
    { id: 16, estudianteId: 6, materiaId: 1, fecha: '2026-01-06', estado: 'presente' },
    { id: 17, estudianteId: 6, materiaId: 1, fecha: '2026-01-08', estado: 'presente' },
    { id: 18, estudianteId: 6, materiaId: 1, fecha: '2026-01-10', estado: 'presente' },
    { id: 19, estudianteId: 7, materiaId: 1, fecha: '2026-01-06', estado: 'ausente' },
    { id: 20, estudianteId: 7, materiaId: 1, fecha: '2026-01-08', estado: 'ausente' },
    { id: 21, estudianteId: 7, materiaId: 1, fecha: '2026-01-10', estado: 'ausente' }
  ])

  // Asistencia del día actual (para edición)
  const asistenciaDia = ref([])

  // Getters
  const getEstudiantesPorMateria = () => {
    // Por ahora retorna todos, en producción filtrar por materia/grupo
    return estudiantes.value
  }

  const getRegistrosPorEstudiante = (estudianteId, materiaId) => {
    return registrosAsistencia.value.filter(
      r => r.estudianteId === estudianteId && r.materiaId === materiaId
    )
  }

  const calcularEstadisticas = (estudianteId, materiaId) => {
    const registros = getRegistrosPorEstudiante(estudianteId, materiaId)
    const total = registros.length || 1
    const presentes = registros.filter(r => r.estado === 'presente').length
    const ausentes = registros.filter(r => r.estado === 'ausente').length
    const tardanzas = registros.filter(r => r.estado === 'tardanza').length
    const justificadas = registros.filter(r => r.estado === 'justificada').length
    
    const porcentajeAsistencia = Math.round(((presentes + tardanzas) / total) * 100)
    const porcentajeFaltas = Math.round((ausentes / total) * 100)
    
    // Estado de riesgo
    let estadoRiesgo = 'normal'
    if (porcentajeFaltas > 25) {
      estadoRiesgo = 'riesgo'
    } else if (porcentajeFaltas >= 15) {
      estadoRiesgo = 'advertencia'
    }
    
    return {
      total,
      presentes,
      ausentes,
      tardanzas,
      justificadas,
      porcentajeAsistencia,
      porcentajeFaltas,
      estadoRiesgo
    }
  }

  const getEstudiantesConEstadisticas = (materiaId) => {
    return estudiantes.value.map(est => ({
      ...est,
      nombreCompleto: `${est.nombre} ${est.apellido}`,
      estadisticas: calcularEstadisticas(est.id, materiaId)
    }))
  }

  const getEstudiantesEnRiesgo = (materiaId) => {
    return getEstudiantesConEstadisticas(materiaId).filter(
      e => e.estadisticas.estadoRiesgo === 'riesgo'
    )
  }

  const getEstudiantesAdvertencia = (materiaId) => {
    return getEstudiantesConEstadisticas(materiaId).filter(
      e => e.estadisticas.estadoRiesgo === 'advertencia'
    )
  }

  // Actions
  const inicializarAsistenciaDia = () => {
    const estudiantesMateria = getEstudiantesPorMateria()
    asistenciaDia.value = estudiantesMateria.map(est => ({
      estudianteId: est.id,
      codigo: est.codigo,
      nombre: est.nombre,
      apellido: est.apellido,
      estado: null,
      observacion: ''
    }))
  }

  const marcarAsistencia = (estudianteId, estado) => {
    const estudiante = asistenciaDia.value.find(e => e.estudianteId === estudianteId)
    if (estudiante) {
      estudiante.estado = estado
    }
  }

  const marcarTodosPresentes = () => {
    asistenciaDia.value.forEach(e => {
      e.estado = ESTADOS.PRESENTE
    })
  }

  const limpiarSeleccion = () => {
    asistenciaDia.value.forEach(e => {
      e.estado = null
    })
  }

  const guardarAsistencia = (materiaId, fecha) => {
    // Agregar registros al historial
    asistenciaDia.value.forEach(est => {
      if (est.estado) {
        const nuevoId = Math.max(...registrosAsistencia.value.map(r => r.id), 0) + 1
        registrosAsistencia.value.push({
          id: nuevoId,
          estudianteId: est.estudianteId,
          materiaId,
          fecha,
          estado: est.estado
        })
      }
    })
  }

  return {
    ESTADOS,
    estudiantes,
    registrosAsistencia,
    asistenciaDia,
    getEstudiantesPorMateria,
    getRegistrosPorEstudiante,
    calcularEstadisticas,
    getEstudiantesConEstadisticas,
    getEstudiantesEnRiesgo,
    getEstudiantesAdvertencia,
    inicializarAsistenciaDia,
    marcarAsistencia,
    marcarTodosPresentes,
    limpiarSeleccion,
    guardarAsistencia
  }
})
