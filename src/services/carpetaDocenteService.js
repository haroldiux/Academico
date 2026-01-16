/**
 * Servicio para generar la Carpeta Pedagógica Docente en PDF
 * Estructura: PORT, INDICE, MVP, HR, PA, PAC, CT-P, PCT/PCP
 */
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Colores institucionales UNITEPC
const COLORS = {
  morado: [67, 56, 202],      // #4338CA - Títulos principales
  turquesa: [20, 184, 166],   // #14B8A6 - Secciones secundarias
  gris: [204, 204, 204],      // #CCCCCC - Cabeceras de tabla
  negro: [0, 0, 0],
  blanco: [255, 255, 255]
}

/**
 * Genera la Carpeta Pedagógica Docente completa
 */
export function generarCarpetaDocente(asignatura, carrera, sede, opciones = {}) {
  const doc = new jsPDF('p', 'mm', 'letter')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15

  // Normalizar carrera (puede venir como objeto o string)
  const carreraNombre = typeof carrera === 'object' ? (carrera?.nombre || 'Sin Carrera') : (carrera || 'Sin Carrera')
  const carreraObj = typeof carrera === 'object' ? carrera : { nombre: carrera || 'Sin Carrera', codigo: '', area: '', mision: '', vision: '', perfil_profesional: '' }

  // Normalizar sede
  const sedeNombre = typeof sede === 'object' ? (sede?.nombre || 'Cochabamba') : (sede || 'Cochabamba')
  const sedeObj = typeof sede === 'object' ? sede : { nombre: sedeNombre }

  // Normalizar docente
  let docenteNombre = 'Por Asignar'
  if (asignatura.docentes && asignatura.docentes.length > 0) {
    docenteNombre = asignatura.docentes.map(d => d.nombre_completo || 'Sin nombre').join(', ')
  } else if (asignatura.docente) {
    docenteNombre = typeof asignatura.docente === 'object' ? asignatura.docente.nombre_completo : asignatura.docente
  }

  const docente = {
    nombre: docenteNombre,
    titulo: 'Lic.'
  }

  // Gestión actual
  const gestion = opciones.gestion || 'II/2025'
  const grupo = opciones.grupo || 'Grupo 1'

  // ==========================================
  // PORTADA (PORT)
  // ==========================================
  generarPortada(doc, { asignatura, carrera: carreraObj, carreraNombre, sede: sedeObj, sedeNombre, docente, gestion, grupo, pageWidth, pageHeight, margin })

  // ==========================================
  // ÍNDICE (INDICE)
  // ==========================================
  doc.addPage()
  generarIndice(doc, { pageWidth, margin })

  // ==========================================
  // MVP (MISIÓN, VISIÓN, PERFIL)
  // ==========================================
  doc.addPage()
  generarMVP(doc, { carrera: carreraObj, pageWidth, margin })

  // ==========================================
  // HORARIOS (HR)
  // ==========================================
  doc.addPage()
  generarHorarios(doc, { asignatura, pageWidth, margin })

  // ==========================================
  // PROGRAMA ANALÍTICO (PA)
  // ==========================================
  doc.addPage()
  generarProgramaAnalitico(doc, { asignatura, carrera: carreraObj, carreraNombre, pageWidth, margin })

  // ==========================================
  // PROGRAMA POR COMPETENCIAS (PAC)
  // ==========================================
  doc.addPage()
  generarPAC(doc, { asignatura, pageWidth, margin })

  // ==========================================
  // CRONOGRAMA TEÓRICO-PRÁCTICO (CT-P)
  // ==========================================
  doc.addPage()
  generarCronograma(doc, { asignatura, pageWidth, margin })

  // ==========================================
  // PLANES DE CLASE (PCT/PCP)
  // ==========================================
  const unidades = asignatura.unidades || []
  unidades.forEach(unidad => {
    const temas = unidad.temas || []
    temas.forEach(tema => {
      doc.addPage()
      generarPlanClase(doc, { asignatura, unidad, tema, pageWidth, margin })
    })
  })

  // Guardar PDF con nombre correcto
  const nombreArchivo = 'Carpeta_Docente_' + (asignatura.codigo || 'ASIG').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf'
  doc.save(nombreArchivo)

  return doc
}

/**
 * PORTADA - Carátula institucional
 */
function generarPortada(doc, { asignatura, carrera, carreraNombre, sedeNombre, docente, gestion, grupo, pageWidth }) {
  let y = 30

  // Área y Carrera
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(`ÁREA DE ${(carrera.area || 'CIENCIAS EXACTAS Y TECNOLOGÍA').toUpperCase()}`, pageWidth / 2, y, { align: 'center' })

  y += 8
  doc.setFontSize(12)
  doc.text(`CARRERA DE ${(carreraNombre || 'SIN CARRERA').toUpperCase()}`, pageWidth / 2, y, { align: 'center' })

  // Título Carpeta
  y += 15
  doc.setFontSize(20)
  doc.setTextColor(...COLORS.morado)
  doc.text('CARPETA PEDAGÓGICA DOCENTE', pageWidth / 2, y, { align: 'center' })

  // Sede
  y += 10
  doc.setFontSize(14)
  doc.setTextColor(...COLORS.turquesa)
  doc.text(`SEDE ${(sedeNombre || 'COCHABAMBA').toUpperCase()}`, pageWidth / 2, y, { align: 'center' })

  // Logo UNITEPC (placeholder - texto)
  y += 30
  doc.setFontSize(32)
  doc.setTextColor(...COLORS.morado)
  doc.setFont('helvetica', 'bold')
  doc.text('UNITEPC', pageWidth / 2, y, { align: 'center' })

  y += 8
  doc.setFontSize(12)
  doc.setTextColor(...COLORS.turquesa)
  doc.text('UNIVERSIDAD PRIVADA', pageWidth / 2, y, { align: 'center' })

  // Cuadro de información
  y += 30
  const boxX = pageWidth / 2 - 70
  const boxWidth = 140
  const boxHeight = 80

  doc.setDrawColor(...COLORS.turquesa)
  doc.setLineWidth(1)
  doc.rect(boxX, y, boxWidth, boxHeight)

  // Contenido del cuadro
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')

  const infoX = boxX + 5
  let infoY = y + 12
  const lineHeight = 10

  const campos = [
    ['Carrera:', carrera.nombre],
    ['Asignatura:', asignatura.nombre],
    ['Código de la asignatura:', asignatura.codigo],
    ['Nombre del Docente:', `${docente.titulo} ${docente.nombre}`],
    ['Semestre', `${asignatura.semestre}vo`],
    ['Grupo:', grupo],
    ['Gestión:', gestion]
  ]

  campos.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, infoX, infoY)
    doc.setFont('helvetica', 'normal')
    doc.text(value || '', infoX + 55, infoY)
    infoY += lineHeight
  })
}

/**
 * ÍNDICE - Tabla de contenidos
 */
function generarIndice(doc, { pageWidth, margin }) {
  let y = 25

  // Logo
  doc.setFontSize(24)
  doc.setTextColor(...COLORS.morado)
  doc.setFont('helvetica', 'bold')
  doc.text('UNITEPC', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.turquesa)
  doc.text('UNIVERSIDAD PRIVADA', pageWidth / 2, y, { align: 'center' })

  y += 15

  // Título ÍNDICE
  doc.setFillColor(...COLORS.turquesa)
  doc.rect(margin, y, pageWidth - margin * 2, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('ÍNDICE', margin + 5, y + 7)

  y += 18

  // Secciones del índice
  const secciones = [
    {
      titulo: 'VALORES INSTITUCIONALES',
      color: COLORS.morado,
      items: [
        { nombre: 'Misión de la carrera', codigo: '' },
        { nombre: 'Visión de la carrera', codigo: 'MVP' },
        { nombre: 'Perfil profesional', codigo: '' }
      ]
    },
    {
      titulo: 'ASPECTOS ORGANIZACIONALES',
      color: COLORS.turquesa,
      items: [
        { nombre: 'Horario de clases de la asignatura', codigo: 'HR' },
        { nombre: 'Rol de exámenes de la asignatura', codigo: '' }
      ]
    },
    {
      titulo: 'PLANIFICACIÓN ACADÉMICA',
      color: COLORS.morado,
      items: [
        { nombre: 'Programa analítico', codigo: 'PA' },
        { nombre: 'Programa de asignatura por competencias', codigo: 'PAC' },
        { nombre: 'Cronograma teórico-práctico', codigo: 'CT-P' },
        { nombre: 'Plan de clase Teórico-Práctico (según corresponda)', codigo: 'PCT-PCP' }
      ]
    }
  ]

  secciones.forEach(seccion => {
    // Cabecera de sección
    doc.setFillColor(...seccion.color)
    doc.rect(margin, y, pageWidth - margin * 2 - 40, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(seccion.titulo, margin + 3, y + 5.5)

    // Columna CODIGO
    doc.setFillColor(...COLORS.gris)
    doc.rect(pageWidth - margin - 40, y, 40, 8, 'F')
    doc.setTextColor(0, 0, 0)
    doc.text('CÓDIGO', pageWidth - margin - 20, y + 5.5, { align: 'center' })

    y += 12

    // Items
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    seccion.items.forEach(item => {
      doc.text(item.nombre, margin + 3, y)
      if (item.codigo) {
        doc.setFont('helvetica', 'bold')
        doc.text(item.codigo, pageWidth - margin - 20, y, { align: 'center' })
        doc.setFont('helvetica', 'normal')
      }
      y += 8
    })

    y += 5
  })
}

/**
 * MVP - Misión, Visión, Perfil Profesional
 */
function generarMVP(doc, { carrera, pageWidth, margin }) {
  let y = 25

  // Logo
  doc.setFontSize(24)
  doc.setTextColor(...COLORS.morado)
  doc.setFont('helvetica', 'bold')
  doc.text('UNITEPC', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.turquesa)
  doc.text('UNIVERSIDAD PRIVADA', pageWidth / 2, y, { align: 'center' })

  y += 20

  // MISIÓN
  doc.setFillColor(...COLORS.morado)
  doc.rect(margin + 30, y, pageWidth - margin * 2 - 60, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('MISIÓN', pageWidth / 2, y + 7, { align: 'center' })

  y += 15

  // Cuadro de misión
  const misionText = carrera.mision || 'Nuestra misión es formar profesionales de excelencia.'
  doc.setDrawColor(...COLORS.morado)
  doc.setLineWidth(0.5)

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const misionLines = doc.splitTextToSize(misionText, pageWidth - margin * 2 - 10)
  const misionBoxHeight = misionLines.length * 5 + 10
  doc.rect(margin, y, pageWidth - margin * 2, misionBoxHeight)
  doc.text(misionLines, pageWidth / 2, y + 7, { align: 'center' })

  y += misionBoxHeight + 15

  // VISIÓN
  doc.setFillColor(...COLORS.morado)
  doc.rect(margin + 30, y, pageWidth - margin * 2 - 60, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('VISIÓN', pageWidth / 2, y + 7, { align: 'center' })

  y += 15

  const visionText = carrera.vision || 'Ser referentes en formación profesional.'
  const visionLines = doc.splitTextToSize(visionText, pageWidth - margin * 2 - 10)
  const visionBoxHeight = visionLines.length * 5 + 10
  doc.setDrawColor(...COLORS.morado)
  doc.rect(margin, y, pageWidth - margin * 2, visionBoxHeight)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(visionLines, pageWidth / 2, y + 7, { align: 'center' })

  y += visionBoxHeight + 15

  // PERFIL PROFESIONAL
  doc.setFillColor(...COLORS.turquesa)
  doc.rect(margin + 20, y, pageWidth - margin * 2 - 40, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('PERFIL PROFESIONAL', pageWidth / 2, y + 7, { align: 'center' })

  y += 15

  const perfilText = carrera.perfil_profesional || 'El profesional está preparado para desempeñarse en su área.'
  const perfilLines = doc.splitTextToSize(perfilText, pageWidth - margin * 2 - 10)
  const perfilBoxHeight = perfilLines.length * 5 + 10
  doc.setDrawColor(...COLORS.turquesa)
  doc.rect(margin, y, pageWidth - margin * 2, perfilBoxHeight)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(perfilLines, pageWidth / 2, y + 7, { align: 'center' })
}

/**
 * HORARIOS - Horario de clases y fechas de exámenes
 */
function generarHorarios(doc, { asignatura, pageWidth, margin }) {
  let y = 25

  // Logo
  doc.setFontSize(24)
  doc.setTextColor(...COLORS.morado)
  doc.setFont('helvetica', 'bold')
  doc.text('UNITEPC', pageWidth / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.turquesa)
  doc.text('UNIVERSIDAD PRIVADA', pageWidth / 2, y, { align: 'center' })

  y += 20

  // HORARIO DE CLASES
  doc.setFillColor(...COLORS.morado)
  doc.rect(margin + 20, y, pageWidth - margin * 2 - 40, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('HORARIO DE CLASES', pageWidth / 2, y + 8, { align: 'center' })

  y += 20

  // Cuadro de horarios
  const horarios = asignatura.horarios || [
    { dia: 'Lunes', horaInicio: '08:00', horaFin: '10:00' },
    { dia: 'Miércoles', horaInicio: '08:00', horaFin: '10:00' }
  ]

  doc.setDrawColor(...COLORS.morado)
  doc.setLineWidth(0.5)

  const horarioData = horarios.map(h => [h.dia + ':', `${h.horaInicio} - ${h.horaFin}`])

  autoTable(doc, {
    startY: y,
    margin: { left: margin + 30, right: margin + 30 },
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 4, halign: 'center' },
    head: [['DÍAS', 'HORA']],
    headStyles: { fillColor: false, textColor: 0, fontStyle: 'bold' },
    body: horarioData,
    tableLineColor: COLORS.morado,
    tableLineWidth: 0.5
  })

  y = doc.lastAutoTable.finalY + 30

  // FECHAS DE EXÁMENES
  doc.setFillColor(...COLORS.turquesa)
  doc.rect(margin + 20, y, pageWidth - margin * 2 - 40, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('FECHAS DE EXÁMENES', pageWidth / 2, y + 8, { align: 'center' })

  y += 20

  // Datos de exámenes (mock)
  const examenes = asignatura.fechas_examenes || {
    primer_parcial: '27/03/2025',
    segundo_parcial: '22/05/2025',
    examen_final: '13/06/2025',
    segunda_instancia: '-'
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin + 30, right: margin + 30 },
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 4 },
    head: [['PARCIAL', 'FECHA']],
    headStyles: { fillColor: false, textColor: 0, fontStyle: 'bold', halign: 'center' },
    body: [
      ['Primer Parcial:', examenes.primer_parcial],
      ['Segundo Parcial:', examenes.segundo_parcial],
      ['Examen Final:', examenes.examen_final],
      ['Segunda Instancia:', examenes.segunda_instancia]
    ],
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'right' },
      1: { halign: 'right' }
    },
    tableLineColor: COLORS.turquesa,
    tableLineWidth: 0.5
  })
}

/**
 * PROGRAMA ANALÍTICO (PA)
 */
function generarProgramaAnalitico(doc, { asignatura, carrera, carreraNombre, pageWidth, margin }) {
  let y = 15

  // Cabecera institucional
  doc.setFontSize(8)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.text('UNIVERSIDAD TÉCNICA PRIVADA COSMOS', pageWidth / 2, y, { align: 'center' })
  y += 4
  doc.text('"UNITEPC"', pageWidth / 2, y, { align: 'center' })
  y += 4
  doc.text(`CARRERA: ${(carreraNombre || 'SIN CARRERA').toUpperCase()}`, pageWidth / 2, y, { align: 'center' })

  y += 10

  // Título
  doc.setFillColor(...COLORS.morado)
  doc.rect(margin, y, pageWidth - margin * 2, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.text('PROGRAMA ANALÍTICO', pageWidth / 2, y + 7, { align: 'center' })

  y += 15

  // Tabla de datos de asignatura
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    head: [['CÓDIGO', 'ASIGNATURA', 'CRÉDITOS', 'HRS/SEMESTRE', 'PROGRAMA', 'SEMESTRE', 'Nº HOJA']],
    headStyles: { fillColor: COLORS.gris, textColor: 0, fontStyle: 'bold', halign: 'center' },
    body: [[
      asignatura.codigo,
      asignatura.nombre,
      asignatura.creditos || 4,
      (asignatura.horas_teoricas || 0) + (asignatura.horas_practicas || 0),
      carrera.codigo,
      `${asignatura.semestre}º SEM`,
      '1'
    ]],
    bodyStyles: { halign: 'center' }
  })

  y = doc.lastAutoTable.finalY + 10

  // Contenido por unidades
  const unidades = asignatura.unidades || []

  doc.setFontSize(9)
  doc.setTextColor(0, 0, 0)

  unidades.forEach(unidad => {
    // Verificar espacio
    if (y > 240) {
      doc.addPage()
      y = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.text(`UNIDAD ${unidad.numero}: ${unidad.titulo.toUpperCase()}`, margin, y)
    y += 6

    const temas = unidad.temas || []
    temas.forEach(tema => {
      if (y > 250) {
        doc.addPage()
        y = 20
      }

      doc.setFont('helvetica', 'bold')
      doc.text(`TEMA ${tema.numero}: ${tema.titulo.toUpperCase()}`, margin, y)
      y += 5

      // Contenidos resumidos
      doc.setFont('helvetica', 'normal')
      const contenidos = Array.isArray(tema.contenidos) ? tema.contenidos : []
      const contenidoTexto = contenidos.map(c => typeof c === 'string' ? c : (c.titulo || '')).join('. ')
      if (contenidoTexto) {
        const lines = doc.splitTextToSize(contenidoTexto, pageWidth - margin * 2)
        doc.text(lines.slice(0, 2), margin, y)
        y += lines.slice(0, 2).length * 4 + 4
      }
    })

    y += 5
  })

  // Bibliografía
  if (y > 200) {
    doc.addPage()
    y = 20
  }

  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text('BIBLIOGRAFÍA PRINCIPAL:', margin, y)
  y += 5

  doc.setFont('helvetica', 'normal')
  const bibliografia = asignatura.bibliografia || [
    '"Ingeniería de Software". Ian Sommerville. 10ª Ed.',
    '"Patrones de Diseño". Gamma, Helm, Johnson, Vlissides.'
  ]

  bibliografia.forEach(ref => {
    if (y > 260) {
      doc.addPage()
      y = 20
    }
    doc.text(`- ${ref}`, margin, y)
    y += 5
  })
}

/**
 * PAC - Programa de Asignatura por Competencias
 */
function generarPAC(doc, { asignatura, pageWidth, margin }) {
  let y = 20

  // Título
  doc.setFillColor(...COLORS.morado)
  doc.rect(margin, y, pageWidth - margin * 2, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('PROGRAMA DE ASIGNATURA POR COMPETENCIAS', pageWidth / 2, y + 7, { align: 'center' })

  y += 18

  // Datos generales
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    body: [
      [{ content: 'Asignatura:', styles: { fontStyle: 'bold' } }, asignatura.nombre],
      [{ content: 'Código:', styles: { fontStyle: 'bold' } }, asignatura.codigo],
      [{ content: 'Competencia General:', styles: { fontStyle: 'bold' } }, asignatura.objetivo_general || 'Desarrollar competencias profesionales en el área.']
    ],
    columnStyles: { 0: { cellWidth: 45 } }
  })

  y = doc.lastAutoTable.finalY + 10

  // Tabla de competencias por unidad
  const unidades = asignatura.unidades || []

  const rows = []
  unidades.forEach(unidad => {
    rows.push([
      { content: `Unidad ${unidad.numero}: ${unidad.titulo}`, colSpan: 3, styles: { fillColor: COLORS.morado, textColor: 255, fontStyle: 'bold' } }
    ])
    rows.push([
      { content: 'Elemento de Competencia', styles: { fillColor: COLORS.gris, fontStyle: 'bold' } },
      { content: 'Saberes Esenciales', styles: { fillColor: COLORS.gris, fontStyle: 'bold' } },
      { content: 'Evidencias', styles: { fillColor: COLORS.gris, fontStyle: 'bold' } }
    ])
    rows.push([
      unidad.elemento_competencia || 'Por definir',
      unidad.saberes_esenciales || 'Conocimientos teóricos y prácticos',
      unidad.evidencias || 'Exámenes, trabajos prácticos'
    ])
  })

  if (rows.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      body: rows
    })
  }
}

/**
 * CRONOGRAMA TEÓRICO-PRÁCTICO (CT-P)
 */
function generarCronograma(doc, { asignatura, pageWidth, margin }) {
  let y = 20

  // Título
  doc.setFillColor(...COLORS.turquesa)
  doc.rect(margin, y, pageWidth - margin * 2, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('CRONOGRAMA TEÓRICO-PRÁCTICO', pageWidth / 2, y + 7, { align: 'center' })

  y += 18

  // Tabla de cronograma
  const unidades = asignatura.unidades || []
  const rows = []
  let semana = 1

  unidades.forEach(unidad => {
    const temas = unidad.temas || []
    temas.forEach(tema => {
      rows.push([
        semana,
        `Unidad ${unidad.numero}`,
        `Tema ${tema.numero}: ${tema.titulo}`,
        tema.horas_teoricas || 2,
        tema.horas_practicas || 2
      ])
      semana++
    })
  })

  if (rows.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      head: [['Semana', 'Unidad', 'Tema', 'Hrs. Teóricas', 'Hrs. Prácticas']],
      headStyles: { fillColor: COLORS.morado, textColor: 255, fontStyle: 'bold', halign: 'center' },
      body: rows,
      columnStyles: {
        0: { cellWidth: 18, halign: 'center' },
        1: { cellWidth: 25 },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' }
      }
    })
  }
}

/**
 * PLAN DE CLASE TEÓRICO (PCT/PCP)
 * Formato exacto según documento institucional UNITEPC
 */
function generarPlanClase(doc, { unidad, tema, asignatura, pageWidth, margin }) {
  let y = 15

  // ===== TÍTULO PRINCIPAL =====
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('PLAN DE CLASE TEORICO', pageWidth / 2, y, { align: 'center' })
  y += 10

  // ===== DATOS GENERALES (Header) =====
  let docenteNombre = 'Por asignar'
  if (asignatura?.docentes?.length > 0) {
    docenteNombre = asignatura.docentes.map(d => d.nombre_completo || `${d.nombre || ''} ${d.apellido || ''}`.trim()).join(', ')
  }
  const carreraNombre = typeof asignatura?.carrera === 'object' ? asignatura.carrera.nombre : (asignatura?.carrera || '')
  const fechaActual = new Date().toLocaleDateString('es-BO')

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    body: [
      [
        { content: 'Nombre del docente:', styles: { fontStyle: 'bold', fillColor: COLORS.gris } },
        docenteNombre,
        { content: 'Asignatura:', styles: { fontStyle: 'bold', fillColor: COLORS.gris } },
        asignatura?.nombre || ''
      ],
      [
        { content: 'Fecha:', styles: { fontStyle: 'bold', fillColor: COLORS.gris } },
        fechaActual,
        { content: 'Carrera:', styles: { fontStyle: 'bold', fillColor: COLORS.gris } },
        carreraNombre
      ]
    ]
  })
  y = doc.lastAutoTable.finalY

  // ===== UNIDAD =====
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    body: [
      [
        { content: 'Unidad # ' + (unidad.numero || '1') + ':', styles: { fontStyle: 'bold', fillColor: COLORS.gris, cellWidth: 40 } },
        { content: unidad.titulo || '', styles: { textColor: COLORS.morado } }
      ]
    ]
  })
  y = doc.lastAutoTable.finalY

  // ===== ELEMENTO DE COMPETENCIA =====
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    body: [
      [
        { content: 'Elemento de Competencia # ' + (unidad.numero || '1') + ':', styles: { fontStyle: 'bold', fillColor: COLORS.gris, cellWidth: 60 } },
        unidad.elemento_competencia || ''
      ]
    ]
  })
  y = doc.lastAutoTable.finalY

  // ===== TEMA =====
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    body: [
      [
        { content: 'Tema # ' + (tema.numero || '1') + ':', styles: { fontStyle: 'bold', fillColor: COLORS.gris, cellWidth: 40 } },
        { content: tema.titulo || '', styles: { textColor: COLORS.morado } }
      ]
    ]
  })
  y = doc.lastAutoTable.finalY

  // ===== RESULTADOS DE APRENDIZAJE =====
  const resultadosAprendizaje = tema.resultados_aprendizaje || tema.resultado_aprendizaje || ''
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    body: [
      [{ content: 'Resultados de Aprendizaje:', styles: { fontStyle: 'bold', fillColor: COLORS.gris } }],
      [resultadosAprendizaje]
    ]
  })
  y = doc.lastAutoTable.finalY

  // ===== LOGROS ESPERADOS =====
  const logros = tema.logros_esperados || []
  const logrosText = logros.map((l, i) => `L.E.${i + 1}. ${l.descripcion || l}`).join('\n')
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    body: [
      [{ content: 'Logros Esperados:', styles: { fontStyle: 'bold', fillColor: COLORS.gris } }],
      [logrosText || 'Por definir']
    ]
  })
  y = doc.lastAutoTable.finalY

  // ===== INDICADORES DE LOGRO =====
  const indicadores = logros.flatMap((l, idx) =>
    (l.indicadores || []).map((ind, i) => `I.D.D.${idx + 1}.${i + 1}. ${typeof ind === 'string' ? ind : ind.descripcion || ''}`)
  ).join('\n')
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    body: [
      [{ content: 'Indicadores de Logro:', styles: { fontStyle: 'bold', fillColor: COLORS.gris } }],
      [indicadores || 'El estudiante demuestra el logro cuando: [Por definir]']
    ]
  })
  y = doc.lastAutoTable.finalY

  // Verificar página
  if (y > 200) {
    doc.addPage()
    y = 15
  }

  // ===== CONTENIDOS =====
  const contenidos = tema.contenidos || {}
  const conceptual = Array.isArray(contenidos.conceptual) ? contenidos.conceptual.map(c => '• ' + c).join('\n') : ''
  const procedimental = Array.isArray(contenidos.procedimental) ? contenidos.procedimental.map(c => '✓ ' + c).join('\n') : ''
  const actitudinal = Array.isArray(contenidos.actitudinal) ? contenidos.actitudinal.map(c => '• ' + c).join('\n') : ''

  const contenidoTexto = `Contenido Conceptual:\n${conceptual || '- Por definir'}\n\nContenido Procedimental:\n${procedimental || '- Por definir'}\n\nContenido Actitudinal:\n${actitudinal || '- Por definir'}`

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    body: [
      [{ content: 'Contenidos:', styles: { fontStyle: 'bold', fillColor: COLORS.gris } }],
      [contenidoTexto]
    ]
  })
  y = doc.lastAutoTable.finalY

  // ===== BIBLIOGRAFÍA OBLIGATORIA =====
  const referencias = tema.referencias_bibliograficas || asignatura?.bibliografias || []
  const biblioText = referencias.length > 0
    ? referencias.map((b, i) => `${i + 1}. ${b.autor || ''} (${b.anio || ''}). ${b.titulo || ''}. ${b.editorial || ''}`).join('\n')
    : 'Bibliografía pendiente de asignar'

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    body: [
      [{ content: 'Bibliografía Obligatoria para las clases:', styles: { fontStyle: 'bold', fillColor: COLORS.gris } }],
      [biblioText]
    ]
  })
  y = doc.lastAutoTable.finalY

  // Verificar página
  if (y > 180) {
    doc.addPage()
    y = 15
  }

  // ===== ESTRATEGIAS DIDÁCTICAS =====
  const estrategias = tema.estrategias || {}
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    head: [
      [{ content: 'ESTRATEGIAS DIDÁCTICAS', colSpan: 3, styles: { halign: 'center', fillColor: COLORS.morado, textColor: 255, fontStyle: 'bold' } }],
      [
        { content: 'Metodológicas (De Enseñanza del Docente)', styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' } },
        { content: 'De Aprendizaje (Estudiantes)', styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' } },
        { content: 'Recursos de Enseñanza', styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' } }
      ]
    ],
    body: [
      [
        estrategias.metodologicas || '',
        estrategias.aprendizaje || '',
        Array.isArray(estrategias.recursos) ? estrategias.recursos.join('\n') : (estrategias.recursos || '')
      ]
    ]
  })
  y = doc.lastAutoTable.finalY + 5

  // ===== EVALUACIÓN DE LOS APRENDIZAJES =====
  const evalFormativa = tema.evaluacion?.formativa || {}
  const evalSumativa = tema.evaluacion?.sumativa || {}

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    head: [
      [{ content: 'EVALUACIÓN DE LOS APRENDIZAJES', colSpan: 4, styles: { halign: 'center', fillColor: COLORS.morado, textColor: 255, fontStyle: 'bold' } }],
      [
        { content: 'TIPO DE EVALUACIÓN', styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' } },
        { content: 'Actividades y Técnicas', styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' } },
        { content: 'Instrumentos', styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' } },
        { content: 'Evidencias de Evaluación', styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' } }
      ]
    ],
    body: [
      [
        { content: 'FORMATIVA', styles: { fontStyle: 'bold', halign: 'center' } },
        Array.isArray(evalFormativa.actividades) ? evalFormativa.actividades.join('\n') : (evalFormativa.actividades || ''),
        Array.isArray(evalFormativa.instrumentos) ? evalFormativa.instrumentos.join('\n') : (evalFormativa.instrumentos || ''),
        Array.isArray(evalFormativa.evidencias) ? evalFormativa.evidencias.join('\n') : (evalFormativa.evidencias || '')
      ],
      [
        { content: 'SUMATIVA', styles: { fontStyle: 'bold', halign: 'center' } },
        Array.isArray(evalSumativa.actividades) ? evalSumativa.actividades.join('\n') : (evalSumativa.actividades || ''),
        Array.isArray(evalSumativa.instrumentos) ? evalSumativa.instrumentos.join('\n') : (evalSumativa.instrumentos || ''),
        Array.isArray(evalSumativa.evidencias) ? evalSumativa.evidencias.join('\n') : (evalSumativa.evidencias || '')
      ]
    ]
  })
  y = doc.lastAutoTable.finalY + 5

  // Verificar página
  if (y > 160) {
    doc.addPage()
    y = 15
  }

  // ===== SECUENCIA DIDÁCTICA =====
  const secuencia = tema.secuencia_didactica || []
  const secuenciaDefault = [
    { momento: 'INTRODUCCIÓN', actividad: '', duracion: '' },
    { momento: 'RESULTADOS DE APRENDIZAJE/LOGROS ESPERADOS', actividad: '', duracion: '' },
    { momento: 'CONTENIDOS DE LA CLASE', actividad: '', duracion: '' },
    { momento: 'CUERPO DE CONTENIDOS', actividad: '', duracion: '' },
    { momento: 'CONCLUSIÓN O CIERRE', actividad: '', duracion: '' }
  ]
  const secuenciaData = secuencia.length > 0 ? secuencia : secuenciaDefault

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 70 }, 2: { cellWidth: 25 } },
    head: [
      [{ content: 'SECUENCIA DIDÁCTICA', colSpan: 3, styles: { halign: 'center', fillColor: COLORS.morado, textColor: 255, fontStyle: 'bold' } }],
      [
        { content: 'MOMENTOS', styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' } },
        { content: 'ACTIVIDAD', styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' } },
        { content: 'DURACIÓN', styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' } }
      ]
    ],
    body: secuenciaData.map(s => [
      { content: (s.momento || '').toUpperCase(), styles: { fontStyle: 'bold' } },
      s.actividad || '',
      s.duracion ? (typeof s.duracion === 'number' ? `${s.duracion} min` : s.duracion) : ''
    ])
  })
}

export default {
  generarCarpetaDocente
}
