// Script para generar la plantilla Excel de preguntas
import * as XLSX from 'xlsx'
import { writeFileSync } from 'fs'

// Plantilla vacía - solo encabezados
const plantilla = [
  {
    ENUNCIADO: '',
    TIPO: '',
    A: '',
    B: '',
    C: '',
    D: '',
    E: '',
    DIFICULTAD: '',
    PESO: '',
    RESPUESTA: ''
  }
]

// Crear libro de trabajo
const ws = XLSX.utils.json_to_sheet(plantilla)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'Preguntas')

// Ajustar anchos de columna
ws['!cols'] = [
  { wch: 60 },  // ENUNCIADO
  { wch: 20 },  // TIPO
  { wch: 30 },  // A
  { wch: 30 },  // B
  { wch: 30 },  // C
  { wch: 30 },  // D
  { wch: 30 },  // E
  { wch: 12 },  // DIFICULTAD
  { wch: 8 },   // PESO
  { wch: 12 }   // RESPUESTA
]

// Escribir a buffer y luego a archivo
const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
writeFileSync('public/templates/plantilla_preguntas.xlsx', buffer)

console.log('✅ Plantilla Excel creada correctamente!')
console.log('📁 Ubicación: public/templates/plantilla_preguntas.xlsx')
console.log('📊 Filas de ejemplo:', plantilla.length)
