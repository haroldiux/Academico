import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCarrerasStore = defineStore('carreras', () => {
  const carreras = ref([
    // Cochabamba
    { id: 1, nombre: 'Ingeniería de Sistemas', codigo: 'SIS', sede_id: 1, activo: true },
    { id: 2, nombre: 'Ingeniería Civil', codigo: 'CIV', sede_id: 1, activo: true },
    { id: 3, nombre: 'Ingeniería Comercial', codigo: 'COM', sede_id: 1, activo: true },
    { id: 4, nombre: 'Derecho', codigo: 'DER', sede_id: 1, activo: true },
    { id: 5, nombre: 'Medicina', codigo: 'MED', sede_id: 1, activo: true },
    { id: 6, nombre: 'Odontología', codigo: 'ODO', sede_id: 1, activo: true },
    { id: 7, nombre: 'Contaduría Pública', codigo: 'CNT', sede_id: 1, activo: true },
    { id: 8, nombre: 'Arquitectura', codigo: 'ARQ', sede_id: 1, activo: true },
    // La Paz
    { id: 9, nombre: 'Ingeniería de Sistemas', codigo: 'SIS', sede_id: 2, activo: true },
    { id: 10, nombre: 'Derecho', codigo: 'DER', sede_id: 2, activo: true },
    { id: 11, nombre: 'Medicina', codigo: 'MED', sede_id: 2, activo: true },
    // Santa Cruz
    { id: 12, nombre: 'Ingeniería de Sistemas', codigo: 'SIS', sede_id: 3, activo: true },
    { id: 13, nombre: 'Ingeniería Comercial', codigo: 'COM', sede_id: 3, activo: true },
    { id: 14, nombre: 'Derecho', codigo: 'DER', sede_id: 3, activo: true }
  ])

  const carrerasActivas = computed(() => carreras.value.filter(c => c.activo))
  const totalCarreras = computed(() => carreras.value.length)

  function getCarreraById(id) {
    return carreras.value.find(c => c.id === id)
  }

  function getCarrerasBySede(sedeId) {
    return carreras.value.filter(c => c.sede_id === sedeId && c.activo)
  }

  function getCarrerasByNombre(nombre) {
    return carreras.value.filter(c => 
      c.nombre.toLowerCase().includes(nombre.toLowerCase()) && c.activo
    )
  }

  return {
    carreras,
    carrerasActivas,
    totalCarreras,
    getCarreraById,
    getCarrerasBySede,
    getCarrerasByNombre
  }
})
