import fs from 'node:fs/promises'
import path from 'node:path'
import ExcelJS from 'exceljs'

const fixturesDir = path.resolve('tests/fixtures/excel')
const headers = [
  'tipo',
  'grupo',
  'enunciado',
  'opcion_a',
  'opcion_b',
  'opcion_c',
  'opcion_d',
  'opcion_e',
  'respuesta_correcta',
  'dificultad',
  'parcial',
]

function buildWorkbook(rows, options = {}) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(options.sheetName || 'Banco')
  sheet.addRow(headers)
  rows.forEach((row) => sheet.addRow(row))
  return workbook
}

async function writeWorkbook(filename, rows, options = {}) {
  const workbook = buildWorkbook(rows, options)
  await workbook.xlsx.writeFile(path.join(fixturesDir, filename))
}

await fs.mkdir(fixturesDir, { recursive: true })

await writeWorkbook('banco_valido_minimo.xlsx', [
  ['FALSO_VERDADERO', '', 'El compilador transforma código fuente.', 'Verdadero', 'Falso', '', '', '', 'A', '1', '2P'],
  ['SELECCION_SIMPLE', '', '¿Qué estructura almacena pares clave valor?', 'Pila', 'Cola', 'Mapa', 'Lista', 'Árbol', 'C', '2', '2P'],
  ['PREGUNTA_CON_CLAVE', '', 'Analice las afirmaciones.', '1. Usa heap.', '2. Usa stack.', '3. Es mutable.', '4. Es inmutable.', '', 'B', '2', '2P'],
  ['RESPUESTA_COMPUESTA', '', 'I. Vue usa reactividad.\nII. Quasar corre sobre Vue.', 'Solo I', 'Solo II', 'Ambas', 'Ninguna', '', 'C', '1', '2P'],
  ['PROBLEMA', 'Caso 1', 'Caso clínico o problema base.', '', '', '', '', '', '', '', '2P'],
  ['SUBPROBLEMA', 'Caso 1', '¿Cuál es la primera acción?', 'Aislar bug', 'Ignorar bug', 'Eliminar logs', 'Cerrar app', 'Reiniciar PC', 'A', '2', '2P'],
  ['EMPAREJAMIENTO', 'Emp 1', 'EMPAREJAMIENTO: Relacione cada concepto.\nA. API\nB. UI', 'API', 'UI', '', '', '', '', '', '2P'],
  ['OPCION_EMPAREJAMIENTO', 'Emp 1', 'Interfaz visible para usuario.', '', '', '', '', '', 'B', '2', '2P'],
])

await writeWorkbook('banco_valido_completo.xlsx', [
  ['FALSO_VERDADERO', '', 'Node puede ejecutar JavaScript del lado del servidor.', 'Verdadero', 'Falso', '', '', '', 'A', '1', '2P'],
  ['RESPUESTA_COMPUESTA', '', 'I. HTTP es sin estado.\nII. TCP es un protocolo.', 'Solo I', 'Solo II', 'Ambas', 'Ninguna', '', 'C', '1', '2P'],
  ['PREGUNTA_CON_CLAVE', '', 'Seleccione la clave correcta.', '1. Opción 1', '2. Opción 2', '3. Opción 3', '4. Opción 4', '', 'E', '2', '2P'],
  ['SELECCION_SIMPLE', '', '¿Qué comando instala dependencias?', 'npm start', 'npm install', 'npm lint', 'npm stop', 'npm open', 'B', '2', '2P'],
  ['SELECCION_SIMPLE', '', '¿Qué framework usa este repo?', 'React', 'Angular', 'Vue', 'Svelte', 'Solid', 'C', '3', '2P'],
  ['PROBLEMA', 'Caso 2', 'Paciente con fallo sistémico.', '', '', '', '', '', '', '', '2P'],
  ['SUBPROBLEMA', 'Caso 2', '¿Qué examen solicitaría?', 'Laboratorio', 'Ninguno', 'Alta', 'Reposo', 'Derivación', 'A', '1', '2P'],
  ['SUBPROBLEMA', 'Caso 2', '¿Qué prioridad tiene?', 'Baja', 'Media', 'Alta', 'No aplica', 'Nula', 'C', '3', '2P'],
  ['EMPAREJAMIENTO', 'Emp 2', 'EMPAREJAMIENTO: Relacione términos.\nA. Backend\nB. Frontend\nC. Base de datos', 'Backend', 'Frontend', 'Base de datos', '', '', '', '', '2P'],
  ['OPCION_EMPAREJAMIENTO', 'Emp 2', 'Capa que renderiza la interfaz.', '', '', '', '', '', 'B', '2', '2P'],
  ['OPCION_EMPAREJAMIENTO', 'Emp 2', 'Capa que persiste información.', '', '', '', '', '', 'C', '2', '2P'],
])

await writeWorkbook('banco_con_columnas_faltantes.xlsx', [
  ['SELECCION_SIMPLE', '', 'Pregunta sin columnas completas', 'A', 'B', 'C', 'D', 'E', 'A', '1'],
], { sheetName: 'BancoIncompleto' })

await writeWorkbook('banco_con_tipo_invalido.xlsx', [
  ['TIPO_RARO', '', 'Pregunta con tipo inválido', 'A', 'B', 'C', 'D', 'E', 'A', '1', '2P'],
])

await writeWorkbook('banco_con_respuesta_invalida.xlsx', [
  ['SELECCION_SIMPLE', '', 'Pregunta con respuesta inválida', 'A', 'B', 'C', 'D', 'E', 'Z', '2', '2P'],
])

await writeWorkbook('banco_con_dificultad_invalida.xlsx', [
  ['SELECCION_SIMPLE', '', 'Pregunta con dificultad inválida', 'A', 'B', 'C', 'D', 'E', 'A', '9', '2P'],
])

await writeWorkbook('banco_con_opciones_incompletas.xlsx', [
  ['SELECCION_SIMPLE', '', 'Pregunta con opciones faltantes', 'A', 'B', '', '', '', 'A', '1', '2P'],
])

await writeWorkbook('banco_con_subproblema_huerfano.xlsx', [
  ['SUBPROBLEMA', 'Caso Huérfano', 'Subítem sin problema padre', 'A', 'B', 'C', 'D', 'E', 'A', '1', '2P'],
])

await writeWorkbook('banco_con_opcion_emparejamiento_huerfana.xlsx', [
  ['OPCION_EMPAREJAMIENTO', 'Emp Huérfano', 'Opción sin emparejamiento padre', '', '', '', '', '', 'A', '2', '2P'],
])

await writeWorkbook('banco_con_duplicados_2p.xlsx', [
  ['SELECCION_SIMPLE', '', 'Pregunta duplicada 2P', 'A1', 'B1', 'C1', 'D1', 'E1', 'A', '1', '2P'],
  ['SELECCION_SIMPLE', '', 'Pregunta duplicada 2P', 'A2', 'B2', 'C2', 'D2', 'E2', 'B', '2', '2P'],
])

await writeWorkbook('banco_mixto_validos_invalidos.xlsx', [
  ['SELECCION_SIMPLE', '', 'Válida 1', 'A', 'B', 'C', 'D', 'E', 'A', '1', '2P'],
  ['TIPO_RARO', '', 'Inválida por tipo', 'A', 'B', 'C', 'D', 'E', 'A', '2', '2P'],
  ['SUBPROBLEMA', 'Caso sin padre', 'Inválida por huérfana', 'A', 'B', 'C', 'D', 'E', 'A', '2', '2P'],
  ['FALSO_VERDADERO', '', 'Válida 2', 'Verdadero', 'Falso', '', '', '', 'B', '1', '2P'],
])

await writeWorkbook('banco_vacio.xlsx', [])
await fs.writeFile(path.join(fixturesDir, 'banco_extension_invalida.txt'), 'archivo invalido')

console.log(`Fixtures Excel generados en ${fixturesDir}`)
