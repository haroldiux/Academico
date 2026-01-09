import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSedesStore = defineStore('sedes', () => {
  const sedes = ref([
    { id: 1, nombre: 'Cochabamba', codigo: 'CBB', activo: true },
    { id: 2, nombre: 'La Paz', codigo: 'LPZ', activo: true },
    { id: 3, nombre: 'Santa Cruz', codigo: 'SCZ', activo: true },
    { id: 4, nombre: 'Oruro', codigo: 'ORU', activo: true },
    { id: 5, nombre: 'Sucre', codigo: 'SUC', activo: true },
    { id: 6, nombre: 'Potosí', codigo: 'PTS', activo: true },
    { id: 7, nombre: 'Tarija', codigo: 'TJA', activo: true },
    { id: 8, nombre: 'Trinidad', codigo: 'TDD', activo: true },
    { id: 9, nombre: 'Cobija', codigo: 'CIJ', activo: true }
  ])

  const sedesActivas = computed(() => sedes.value.filter(s => s.activo))
  const totalSedes = computed(() => sedes.value.length)

  function getSedeById(id) {
    return sedes.value.find(s => s.id === id)
  }

  function getSedeByNombre(nombre) {
    return sedes.value.find(s => s.nombre.toLowerCase() === nombre.toLowerCase())
  }

  return {
    sedes,
    sedesActivas,
    totalSedes,
    getSedeById,
    getSedeByNombre
  }
})
