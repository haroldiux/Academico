import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSedesStore = defineStore('sedes', () => {
  // Sedes principales
  const sedes = ref([
    { id: 1, nombre: 'Cochabamba', codigo: 'CBB', ciudad: 'Cochabamba', direccion: 'Av. América #123', telefono: '4-4256789', activo: true },
    { id: 2, nombre: 'La Paz', codigo: 'LPZ', ciudad: 'La Paz', direccion: 'Av. 16 de Julio #456', telefono: '2-2345678', activo: true },
    { id: 3, nombre: 'Santa Cruz', codigo: 'SCZ', ciudad: 'Santa Cruz', direccion: 'Av. Cristóbal de Mendoza #789', telefono: '3-3456789', activo: true },
    { id: 4, nombre: 'Ivirgarzama', codigo: 'IVG', ciudad: 'Ivirgarzama', direccion: 'Av. Principal s/n', telefono: '4-4112233', activo: true },
    { id: 5, nombre: 'El Alto', codigo: 'EAL', ciudad: 'El Alto', direccion: 'Av. 6 de Marzo #100', telefono: '2-2887766', activo: true },
    { id: 6, nombre: 'Oruro', codigo: 'ORU', ciudad: 'Oruro', direccion: 'Calle Bolívar #50', telefono: '2-5252525', activo: true },
    { id: 7, nombre: 'Sucre', codigo: 'SUC', ciudad: 'Sucre', direccion: 'Calle Junín #200', telefono: '4-6464646', activo: true },
    { id: 8, nombre: 'Potosí', codigo: 'PTS', ciudad: 'Potosí', direccion: 'Calle Bolívar #80', telefono: '2-6226622', activo: true },
    { id: 9, nombre: 'Tarija', codigo: 'TJA', ciudad: 'Tarija', direccion: 'Av. Las Américas #300', telefono: '4-6646646', activo: true },
    { id: 10, nombre: 'Trinidad', codigo: 'TDD', ciudad: 'Trinidad', direccion: 'Av. 18 de Noviembre #150', telefono: '3-4624624', activo: true },
    { id: 11, nombre: 'Cobija', codigo: 'CIJ', ciudad: 'Cobija', direccion: 'Av. 9 de Febrero #75', telefono: '3-8428428', activo: true }
  ])

  // Campus por sede - una sede puede tener múltiples campus
  const campus = ref([
    // Cochabamba - 3 campus
    { id: 1, sede_id: 1, nombre: 'Campus Colonial', codigo: 'COL', direccion: 'Calle España #245', activo: true },
    { id: 2, sede_id: 1, nombre: 'Campus Juan Pablo II', codigo: 'JP2', direccion: 'Av. Blanco Galindo Km 5', activo: true },
    { id: 3, sede_id: 1, nombre: 'Campus Florida', codigo: 'FLO', direccion: 'Av. Panamericana #1200', activo: true },
    // La Paz - 2 campus
    { id: 4, sede_id: 2, nombre: 'Campus Central', codigo: 'CEN', direccion: 'Av. 6 de Agosto #2500', activo: true },
    { id: 5, sede_id: 2, nombre: 'Campus Miraflores', codigo: 'MIR', direccion: 'Calle Landaeta #450', activo: true },
    // Santa Cruz - 2 campus
    { id: 6, sede_id: 3, nombre: 'Campus Equipetrol', codigo: 'EQP', direccion: 'Av. San Martín #500', activo: true },
    { id: 7, sede_id: 3, nombre: 'Campus Plan 3000', codigo: 'P3K', direccion: 'Av. Virgen de Cotoca #100', activo: true },
    // Ivirgarzama - 1 campus
    { id: 8, sede_id: 4, nombre: 'Campus Principal', codigo: 'PRI', direccion: 'Av. Principal s/n', activo: true },
    // El Alto - 1 campus
    { id: 9, sede_id: 5, nombre: 'Campus Ciudad Satélite', codigo: 'SAT', direccion: 'Av. 6 de Marzo #1500', activo: true },
    // Oruro - 1 campus
    { id: 10, sede_id: 6, nombre: 'Campus Central', codigo: 'CEN', direccion: 'Calle Bolívar #50', activo: true },
    // Sucre - 1 campus
    { id: 11, sede_id: 7, nombre: 'Campus Central', codigo: 'CEN', direccion: 'Calle Junín #200', activo: true }
  ])

  const sedesActivas = computed(() => sedes.value.filter(s => s.activo))
  const totalSedes = computed(() => sedes.value.length)
  const campusActivos = computed(() => campus.value.filter(c => c.activo))

  function getSedeById(id) {
    return sedes.value.find(s => s.id === id)
  }

  function getSedeByNombre(nombre) {
    return sedes.value.find(s => s.nombre.toLowerCase() === nombre.toLowerCase())
  }

  function getCampusBySede(sedeId) {
    return campus.value.filter(c => c.sede_id === sedeId && c.activo)
  }

  function getCampusById(id) {
    return campus.value.find(c => c.id === id)
  }

  return {
    sedes,
    campus,
    sedesActivas,
    campusActivos,
    totalSedes,
    getSedeById,
    getSedeByNombre,
    getCampusBySede,
    getCampusById
  }
})

