/**
 * Servicio para generar la Carpeta Pedagógica Docente en PDF
 * Estructura: PORT, INDICE, MVP, HR, PA, PAC, CT-P, PCT/PCP
 */
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Colores institucionales UNITEPC
const COLORS = {
  morado: [67, 56, 202], // #4338CA - Títulos principales
  turquesa: [20, 184, 166], // #14B8A6 - Secciones secundarias
  gris: [204, 204, 204], // #CCCCCC - Cabeceras de tabla
  negro: [0, 0, 0],
  blanco: [255, 255, 255],
}

const PROGRAMA_ANALITICO_HEADER = {
  top: 8,
  bottomLineY: 33,
  contentStartY: 43,
}

let logoProgramaAnaliticoPromise = null

/**
 * Genera la Carpeta Pedagógica Docente completa
 */
export async function generarCarpetaDocente(asignatura, carrera, sede, opciones = {}) {
  const doc = new jsPDF('p', 'mm', 'letter')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15

  // Normalizar carrera (puede venir como objeto o string)
  const carreraNombre =
    typeof carrera === 'object' ? carrera?.nombre || 'Sin Carrera' : carrera || 'Sin Carrera'
  const carreraObj =
    typeof carrera === 'object'
      ? carrera
      : {
          nombre: carrera || 'Sin Carrera',
          codigo: '',
          area: '',
          mision: '',
          vision: '',
          perfil_profesional: '',
        }

  // Normalizar sede
  const sedeNombre = typeof sede === 'object' ? sede?.nombre || 'Cochabamba' : sede || 'Cochabamba'
  const sedeObj = typeof sede === 'object' ? sede : { nombre: sedeNombre }

  // Normalizar docente
  let docenteNombre = 'Por Asignar'
  if (asignatura.docente_nombre) {
    docenteNombre = asignatura.docente_nombre
  } else if (asignatura.nombre_docente) {
    docenteNombre = asignatura.nombre_docente
  } else if (asignatura.docentes && asignatura.docentes.length > 0) {
    docenteNombre = asignatura.docentes.map((d) => d.nombre_completo || 'Sin nombre').join(', ')
  } else if (asignatura.docente) {
    docenteNombre =
      typeof asignatura.docente === 'object'
        ? asignatura.docente.nombre_completo || asignatura.docente.nombre
        : asignatura.docente
  }

  const docente = {
    nombre: (docenteNombre || 'Por Asignar').toUpperCase(),
    titulo: '', // Ya viene incluido en el nombre generalmente o no es necesario
  }

  // Normalizar objeto asignatura (para soportar tanto { asignatura_obj: ... } como objeto directo)
  const asignaturaObj = asignatura.asignatura_obj || asignatura

  // Gestión actual
  const gestion = opciones.gestion || 'II/2025'
  const grupo = opciones.grupo || 'Grupo 1'

  // ==========================================
  // PORTADA (PORT)
  // ==========================================
  generarPortada(doc, {
    asignatura: asignaturaObj, // Usar objeto normalizado
    carrera: carreraObj,
    carreraNombre,
    sede: sedeObj,
    sedeNombre,
    docente,
    gestion,
    grupo,
    logo: opciones.logo,
    pageWidth,
    pageHeight,
    margin,
  })

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
  // HR (HORARIOS Y EXÁMENES)
  // ==========================================
  doc.addPage()
  generarHorariosExamenes(doc, { data: asignaturaObj, pageWidth, margin })

  // ==========================================
  // PROGRAMA ANALÍTICO (PA)
  // ==========================================
  doc.addPage()
  const logoProgramaAnalitico = await obtenerLogoProgramaAnalitico(
    opciones.logoProgramaAnalitico || null,
  )
  const totalPaginasProgramaAnalitico = contarPaginasProgramaAnalitico({
    asignatura: asignaturaObj,
    carreraNombre,
    logo: logoProgramaAnalitico,
  })
  generarProgramaAnalitico(doc, {
    asignatura: asignaturaObj,
    carrera: carreraObj,
    carreraNombre,
    pageWidth,
    totalPaginas: totalPaginasProgramaAnalitico,
    logo: logoProgramaAnalitico,
  })

  // ==========================================
  // PROGRAMA POR COMPETENCIAS (PAC)
  // ==========================================
  doc.addPage()
  generarPAC(doc, { asignatura: asignaturaObj, pageWidth, margin })

  // ==========================================
  // PLANES DE CLASE (PCT/PCP)
  // ==========================================
  const unidades = asignaturaObj.unidades || []
  unidades.forEach((unidad) => {
    const temas = unidad.temas || []
    temas.forEach((tema) => {
      doc.addPage()
      generarPlanClase(doc, { asignatura: asignaturaObj, unidad, tema, pageWidth, margin })
    })
  })

  // Guardar PDF con nombre correcto
  const nombreArchivo =
    'Carpeta_Docente_' + (asignaturaObj.codigo || 'ASIG').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf'
  doc.save(nombreArchivo)

  return doc
}

export async function generarProgramaAnaliticoPDF(asignatura, carrera, opciones = {}) {
  const doc = new jsPDF('p', 'mm', 'letter')
  const pageWidth = doc.internal.pageSize.getWidth()

  const asignaturaObj = asignatura.asignatura_obj || asignatura
  const carreraNombre =
    typeof carrera === 'object' ? carrera?.nombre || 'Sin Carrera' : carrera || 'Sin Carrera'
  const logoProgramaAnalitico = await obtenerLogoProgramaAnalitico(
    opciones.logoProgramaAnalitico || null,
  )

  const totalPaginasProgramaAnalitico = contarPaginasProgramaAnalitico({
    asignatura: asignaturaObj,
    carreraNombre,
    logo: logoProgramaAnalitico,
  })

  generarProgramaAnalitico(doc, {
    asignatura: asignaturaObj,
    carrera,
    carreraNombre,
    pageWidth,
    totalPaginas: totalPaginasProgramaAnalitico,
    logo: logoProgramaAnalitico,
  })

  const nombreArchivo =
    'Programa_Analitico_' + (asignaturaObj.codigo || 'ASIG').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf'
  doc.save(nombreArchivo)

  return doc
}

/**
 * PORTADA - Carátula institucional
 */
function generarPortada(
  doc,
  {
    asignatura,
    carrera,
    carreraNombre,
    sedeNombre,
    docente,
    gestion,
    grupo,
    logo,
    pageWidth,
    margin,
  },
) {
  let y = 30

  // Área y Carrera
  let areaLimpia = (carrera.area || 'CIENCIAS EXACTAS Y TECNOLOGÍA').toUpperCase().trim()
  areaLimpia = areaLimpia.replace(/^(ÁREA DE\s*|AREA DE\s*)+/i, '')

  doc.setFontSize(14)
  doc.setFont('times', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(`ÁREA DE ${areaLimpia}`, pageWidth / 2, y, { align: 'center' })

  y += 8
  doc.setFontSize(14)
  doc.text(`CARRERA DE ${(carreraNombre || 'SIN CARRERA').toUpperCase()}`, pageWidth / 2, y, {
    align: 'center',
  })

  // Título Carpeta
  y += 15
  doc.setFontSize(22)
  doc.setTextColor(0, 0, 0)
  doc.text('CARPETA PEDAGÓGICA DOCENTE', pageWidth / 2, y, { align: 'center' })

  // Sede
  y += 10
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text(`SEDE ${(sedeNombre || 'COCHABAMBA').toUpperCase()}`, pageWidth / 2, y, {
    align: 'center',
  })

  // Logo UNITEPC (Imagen o Texto fallback)
  y += 5
  if (logo) {
    const imgWidth = 95 // Ancho base para mantener equilibrio
    const imgHeight = 60 // Alto calculado para el ratio 2.38:1 (1125x473)
    doc.addImage(logo, 'PNG', pageWidth / 2 - imgWidth / 2, y, imgWidth, imgHeight)
    y += imgHeight + 10
  } else {
    y += 20
    doc.setFontSize(32)
    doc.setTextColor(...COLORS.morado)
    doc.setFont('times', 'bold')
    doc.text('UNITEPC', pageWidth / 2, y, { align: 'center' })

    y += 8
    doc.setFontSize(12)
    doc.setTextColor(...COLORS.turquesa)
    doc.text('UNIVERSIDAD PRIVADA', pageWidth / 2, y, { align: 'center' })
  }

  // Cuadro de información
  y += 10
  const boxX = margin + 10
  const boxWidth = pageWidth - (margin + 10) * 2
  const boxHeight = 100 // Más espacioso

  doc.setDrawColor(...COLORS.morado) // Purple border
  doc.setLineWidth(1.5) // Borde un poco más grueso
  doc.rect(boxX, y, boxWidth, boxHeight)

  // Contenido del cuadro
  doc.setFontSize(11.5)
  doc.setTextColor(0, 0, 0)
  doc.setFont('times', 'bold')

  const infoX = boxX + 10 // Reducido margen interno para dar más espacio
  let infoY = y + 15
  const lineHeight = 10
  const labelWidth = 55 // Ajustado para centrar mejor el conjunto

  const campos = [
    ['Nombre del Docente:', docente.nombre],
    ['Carrera:', carreraNombre],
    ['Asignatura:', asignatura.asignatura || 'Sin Asignatura'],
    ['Codigo de la asignatura:', asignatura.codigo_asignatura || 'N/A'],
    ['Semestre:', `${asignatura.semestre || 'N/A'}`],
    ['Grupo:', `${grupo || ''}`],
    ['Gestión:', gestion],
  ]

  campos.forEach(([label, value]) => {
    doc.setFont('times', 'bold')
    doc.text(label, infoX + labelWidth, infoY, { align: 'right' })
    doc.setFont('times', 'normal')
    doc.text(String(value || ''), infoX + labelWidth + 3, infoY)
    infoY += lineHeight
  })
}

/**
 * ÍNDICE - Tabla de contenidos (Nuevo formato institucional)
 */
function generarIndice(doc, { pageWidth, margin }) {
  let y = 30

  // Logo UNITEPC
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
  doc.setFillColor(...COLORS.morado)
  doc.rect(margin, y, pageWidth - margin * 2, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('ÍNDICE', margin + 5, y + 7)

  y += 18

  const tableWidth = pageWidth - margin * 2
  const codeColWidth = 40

  // --- VALORES INSTITUCIONALES ---
  doc.setFillColor(...COLORS.turquesa)
  doc.rect(margin, y, tableWidth - codeColWidth, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text('VALORES INSTITUCIONALES', margin + 3, y + 5.5)

  doc.setFillColor(...COLORS.turquesa)
  doc.rect(pageWidth - margin - codeColWidth, y, codeColWidth, 8, 'F')
  doc.text('CÓDIGO', pageWidth - margin - codeColWidth / 2, y + 5.5, { align: 'center' })

  y += 8
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  const valItems = ['Misión de la carrera', 'Visión de la carrera', 'Perfil profesional']
  valItems.forEach((text, i) => {
    doc.text(text, margin + 3, y + 6 + i * 6)
  })

  // Box for MVP
  doc.setFillColor(230, 243, 230) // Light green
  doc.rect(pageWidth - margin - codeColWidth + 5, y + 2, codeColWidth - 10, 14, 'F')
  doc.setFont('helvetica', 'bold')
  doc.text('MVP', pageWidth - margin - codeColWidth / 2, y + 10, { align: 'center' })

  y += 22

  // --- ASPECTOS ORGANIZACIONALES ---
  doc.setFillColor(...COLORS.morado)
  doc.rect(margin, y, tableWidth - codeColWidth, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text('ASPECTOS ORGANIZACIONALES', margin + 3, y + 5.5)

  doc.setFillColor(...COLORS.morado)
  doc.rect(pageWidth - margin - codeColWidth, y, codeColWidth, 8, 'F')
  doc.text('CÓDIGO', pageWidth - margin - codeColWidth / 2, y + 5.5, { align: 'center' })

  y += 8
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  const orgItems = ['Horario de clases de la asignatura', 'Rol de exámenes de la asignatura']
  orgItems.forEach((text, i) => {
    doc.text(text, margin + 3, y + 6 + i * 6)
  })

  // Box for HR
  doc.setFillColor(226, 232, 240) // Light gray
  doc.rect(pageWidth - margin - codeColWidth + 5, y + 2, codeColWidth - 10, 10, 'F')
  doc.setFont('helvetica', 'bold')
  doc.text('HR', pageWidth - margin - codeColWidth / 2, y + 8, { align: 'center' })

  y += 18

  // --- PLANIFICACIÓN ACADÉMICA ---
  doc.setFillColor(...COLORS.turquesa)
  doc.rect(margin, y, tableWidth - codeColWidth, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text('PLANIFICACIÓN ACADÉMICA', margin + 3, y + 5.5)

  doc.setFillColor(...COLORS.turquesa)
  doc.rect(pageWidth - margin - codeColWidth, y, codeColWidth, 8, 'F')
  doc.text('CÓDIGO', pageWidth - margin - codeColWidth / 2, y + 5.5, { align: 'center' })

  y += 8
  const planItems = [
    { n: 'Programa analítico', c: 'PA' },
    { n: 'Programa de asignatura por competencias', c: 'PAC' },
    { n: 'Plan de clase Teórico-Práctico (según corresponda)', c: 'PCT-PCP' },
  ]

  planItems.forEach((item, i) => {
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    doc.text(item.n, margin + 3, y + 6 + i * 6)
    doc.setFont('helvetica', 'bold')
    doc.text(item.c, pageWidth - margin - codeColWidth / 2, y + 6 + i * 6, { align: 'center' })
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

  const perfilText =
    carrera.perfil_profesional || 'El profesional está preparado para desempeñarse en su área.'
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
 * HORARIOS Y EXÁMENES (HR)
 */
function generarHorariosExamenes(doc, { data, pageWidth, margin }) {
  let y = 30

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
  doc.rect(margin, y, pageWidth - margin * 2, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('HORARIO DE CLASES', pageWidth / 2, y + 8, { align: 'center' })

  y += 15

  const horarioData = (data.horarios || []).map((h) => [
    h.dia,
    `${h.hora_inicio} - ${h.hora_fin}`,
    h.aula,
  ])

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 11, cellPadding: 4, halign: 'center' },
    head: [['DÍA', 'HORARIO', 'AULA']],
    headStyles: { fillColor: COLORS.gris, textColor: 0, fontStyle: 'bold' },
    body: horarioData.length > 0 ? horarioData : [['-', '-', '-']],
  })

  y = doc.lastAutoTable.finalY + 20

  // FECHAS DE EXÁMENES
  doc.setFillColor(...COLORS.turquesa)
  doc.rect(margin, y, pageWidth - margin * 2, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('ROL DE EXÁMENES', pageWidth / 2, y + 8, { align: 'center' })

  y += 15

  const examenesData = (data.examenes || []).map((e) => [e.tipo, e.fecha, e.hora, e.aula])

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 11, cellPadding: 4, halign: 'center' },
    head: [['TIPO', 'FECHA', 'HORA', 'AULA']],
    headStyles: { fillColor: COLORS.gris, textColor: 0, fontStyle: 'bold' },
    body: examenesData.length > 0 ? examenesData : [['No cargado', '-', '-', '-']],
  })
}

/**
 * PROGRAMA ANALÍTICO (PA)
 */
function generarProgramaAnalitico(
  doc,
  { asignatura, carrera, carreraNombre, pageWidth, totalPaginas = 1, logo = null },
) {
  renderProgramaAnalitico(doc, {
    asignatura,
    carrera,
    carreraNombre,
    pageWidth,
    totalPaginas,
    logo,
  })
}

function contarPaginasProgramaAnalitico({ asignatura, carreraNombre = '', logo = null }) {
  const tempDoc = new jsPDF('p', 'mm', 'letter')
  renderProgramaAnalitico(tempDoc, {
    asignatura,
    carreraNombre,
    pageWidth: tempDoc.internal.pageSize.getWidth(),
    totalPaginas: 1,
    logo,
  })
  return tempDoc.getNumberOfPages()
}

function renderProgramaAnalitico(doc, { asignatura, carreraNombre = '', pageWidth, totalPaginas, logo }) {
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = 162
  const sectionLeft = (pageWidth - contentWidth) / 2
  const tableWidth = contentWidth
  const tableLeft = sectionLeft
  const temaIndent = 6
  const temaLeft = sectionLeft + temaIndent
  const temaWidth = contentWidth - temaIndent
  const espacioDespuesTabla = 6
  const espacioDespuesTituloUnidad = 2
  const espacioDespuesTituloTema = 2
  const espacioEntreTemas = 3.2
  const espacioEntreUnidades = 2
  const lineHeightUnidad = 1
  const lineHeightTemaTitulo = 1
  const lineHeightTemaCuerpo = 1.2
  const fontSizeUnidad = 12
  const fontSizeTema = 12
  const fontSizeBibliografia = 12
  const fontSizeTabla = 9
  const tableCellPadding = 1.9

  let y = dibujarCabeceraProgramaAnalitico(doc, pageWidth, logo, carreraNombre)
  let temaGlobal = 1

  const unidades = normalizarUnidadesProgramaAnalitico(asignatura.unidades)
  const bibliografias = normalizarBibliografiasProgramaAnalitico(asignatura)
  const programa = normalizarProgramaPlanEstudios(asignatura.plan_estudios)
  const hrsSemestre =
    Number(asignatura.hrs_semestre_impresion) || calcularHrsSemestreImpresion(asignatura)
  const semestre = asignatura.semestre ? `${asignatura.semestre}°` : ''
  const tituloMateria = String(asignatura.nombre || asignatura.asignatura || '').trim().toUpperCase()

  doc.setTextColor(0, 0, 0)
  doc.setFont('times', 'bold')
  doc.setFontSize(11)
  doc.text(`PROGRAMA ANALÍTICO: ${tituloMateria || 'SIN ASIGNATURA'}`, pageWidth / 2, y, {
    align: 'center',
  })

  y += 8

  autoTable(doc, {
    startY: y,
    margin: { left: tableLeft, right: tableLeft },
    tableWidth,
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: fontSizeTabla,
      cellPadding: tableCellPadding,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      textColor: 0,
      halign: 'center',
      valign: 'middle',
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: 0,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    bodyStyles: {
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 17 },
      1: { cellWidth: 13 },
      2: { cellWidth: 42 },
      3: { cellWidth: 15 },
      4: { cellWidth: 13 },
      5: { cellWidth: 13 },
      6: { cellWidth: 19 },
      7: { cellWidth: 18 },
      8: { cellWidth: 12 },
    },
    head: [
      [
        { content: 'CÓDIGO', rowSpan: 2 },
        { content: 'SEMESTRE', rowSpan: 2 },
        { content: 'ASIGNATURA', rowSpan: 2 },
        { content: 'CRÉDITOS', rowSpan: 2 },
        { content: 'HORAS', colSpan: 2 },
        { content: 'HRS.\nSEMESTRE', rowSpan: 2 },
        { content: 'PROGRAMA', rowSpan: 2 },
        { content: 'N°\nHOJA', rowSpan: 2 },
      ],
      [{ content: 'TEÓRICAS' }, { content: 'PRÁCTICAS' }],
    ],
    body: [
      [
        asignatura.codigo || '',
        semestre,
        asignatura.nombre || '',
        String(asignatura.creditos ?? ''),
        String(asignatura.horas_teoricas ?? 0),
        String(asignatura.horas_practicas ?? 0),
        String(hrsSemestre),
        programa,
        String(totalPaginas || 1),
      ],
    ],
  })

  y = doc.lastAutoTable.finalY + espacioDespuesTabla

  unidades.forEach((unidad) => {
    if (y > pageHeight - 35) {
      doc.addPage()
      y = dibujarCabeceraProgramaAnalitico(doc, pageWidth, logo, carreraNombre)
    }

    const unidadTitulo = `UNIDAD DE APRENDIZAJE ${toRomanNumeral(unidad.numero)}: ${String(unidad.titulo || '').toUpperCase()}`
    const unidadLineas = doc.splitTextToSize(unidadTitulo, contentWidth)

    doc.setFont('times', 'bold')
    doc.setFontSize(fontSizeUnidad)
    const alturaUnidad = obtenerAlturaTexto(doc, unidadLineas, {
      maxWidth: contentWidth,
      lineHeightFactor: lineHeightUnidad,
    })
    doc.text(unidadLineas, sectionLeft, y, { lineHeightFactor: lineHeightUnidad })
    y += alturaUnidad + espacioDespuesTituloUnidad

    unidad.temas.forEach((tema) => {
      const tituloTema = `TEMA N°${temaGlobal}.- ${String(tema.titulo || '').toUpperCase()}`
      const cuerpoTema = normalizarTextoImpresionTema(tema)
      const tituloLineas = doc.splitTextToSize(tituloTema, temaWidth)
      const cuerpoLineas = doc.splitTextToSize(cuerpoTema, temaWidth)
      doc.setFont('times', 'normal')
      doc.setFontSize(fontSizeTema)
      const alturaTituloTema = obtenerAlturaTexto(doc, tituloLineas, {
        maxWidth: temaWidth,
        lineHeightFactor: lineHeightTemaTitulo,
      })
      doc.setFont('times', 'normal')
      doc.setFontSize(fontSizeTema)
      const alturaCuerpoTema = cuerpoLineas.length
        ? obtenerAlturaTexto(doc, cuerpoLineas, {
            maxWidth: temaWidth,
            lineHeightFactor: lineHeightTemaCuerpo,
          })
        : 0
      const altoTema =
        alturaTituloTema + espacioDespuesTituloTema + alturaCuerpoTema + espacioEntreTemas

      if (y + altoTema > pageHeight - 18) {
        doc.addPage()
        y = dibujarCabeceraProgramaAnalitico(doc, pageWidth, logo, carreraNombre)
      }

      doc.setFont('times', 'normal')
      doc.setFontSize(fontSizeTema)
      doc.text(tituloLineas, temaLeft, y, { lineHeightFactor: lineHeightTemaTitulo })
      y += alturaTituloTema

      if (cuerpoLineas.length > 0) {
        y += espacioDespuesTituloTema
        doc.setFont('times', 'normal')
        doc.setFontSize(fontSizeTema)
        doc.text(cuerpoLineas, temaLeft, y, {
          maxWidth: temaWidth,
          align: 'justify',
          lineHeightFactor: lineHeightTemaCuerpo,
        })
        y += alturaCuerpoTema
      }

      y += espacioEntreTemas
      temaGlobal += 1
    })

    y += espacioEntreUnidades
  })

  if (bibliografias.length > 0) {
    const bibliografiaOficial = bibliografias.filter(
      (referencia) => referencia.tipoNormalizado === 'oficial',
    )
    const bibliografiaComplementaria = bibliografias.filter(
      (referencia) => referencia.tipoNormalizado !== 'oficial',
    )
    const seccionesBibliografia = [
      { titulo: 'BIBLIOGRAFÍA OFICIAL', referencias: bibliografiaOficial },
      { titulo: 'BIBLIOGRAFÍA COMPLEMENTARIA', referencias: bibliografiaComplementaria },
    ].filter((seccion) => seccion.referencias.length > 0)

    const alturaBibliografia =
      seccionesBibliografia.reduce((total, seccion) => {
        const alturaReferencias = seccion.referencias.reduce((acumulado, referencia) => {
          const lineas = doc.splitTextToSize(referencia.texto, contentWidth)
          return acumulado + lineas.length * 3.8 + 1.5
        }, 0)

        return total + 8 + alturaReferencias + 5
      }, 0) + 4

    if (y + alturaBibliografia > pageHeight - 18) {
      doc.addPage()
      y = dibujarCabeceraProgramaAnalitico(doc, pageWidth, logo, carreraNombre)
    }

    seccionesBibliografia.forEach((seccion, indice) => {
      if (indice > 0) {
        y += 4
      }

      doc.setFont('times', 'bold')
      doc.setFontSize(fontSizeBibliografia)
      doc.text(seccion.titulo, sectionLeft, y)
      y += 8

      doc.setFont('times', 'normal')
      doc.setFontSize(fontSizeBibliografia)
      seccion.referencias.forEach((referencia) => {
        const lineas = doc.splitTextToSize(referencia.texto, contentWidth)
        if (y + lineas.length * 3.8 > pageHeight - 18) {
          doc.addPage()
          y = dibujarCabeceraProgramaAnalitico(doc, pageWidth, logo, carreraNombre)
        }
        doc.text(referencia.texto, sectionLeft, y, { maxWidth: contentWidth, align: 'justify' })
        y += lineas.length * 3.8 + 1.5
      })
    })
  }
}

function obtenerAlturaTexto(doc, lineas, opciones = {}) {
  const texto = Array.isArray(lineas) ? lineas : [lineas]

  if (!texto.length) {
    return 0
  }

  try {
    const lineHeightFactor = Number(opciones?.lineHeightFactor) || 1
    const fontSize = doc.getFontSize()
    const scaleFactor = doc.internal.scaleFactor || 1
    const baseLineHeight = fontSize / scaleFactor

    if (texto.length === 1) {
      return baseLineHeight
    }

    return baseLineHeight + baseLineHeight * lineHeightFactor * (texto.length - 1)
  } catch {
    const lineHeightFactor = Number(opciones?.lineHeightFactor) || 1
    return texto.length * 3.5 * lineHeightFactor
  }
}

function dibujarCabeceraProgramaAnalitico(doc, pageWidth, logo, carreraNombre = '') {
  const headerTop = PROGRAMA_ANALITICO_HEADER.top
  const lineY = PROGRAMA_ANALITICO_HEADER.bottomLineY
  const carreraTexto = String(carreraNombre || 'Sin Carrera').trim().toUpperCase()

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(182, 150, 226)
  doc.text('UNIVERSIDAD TÉCNICA PRIVADA COSMOS', 18, headerTop + 2)
  doc.text('“UNITEPC”', 18, headerTop + 8)
  doc.text(`CARRERA: ${carreraTexto}`, 18, headerTop + 18)

  doc.setDrawColor(245, 204, 90)
  doc.setLineWidth(0.5)
  doc.line(pageWidth - 44, headerTop - 1, pageWidth - 44, lineY - 1)

  if (logo) {
    doc.addImage(logo, 'PNG', pageWidth - 36, headerTop - 2, 20, 16)
  }

  doc.setDrawColor(98, 216, 218)
  doc.setLineWidth(0.4)
  doc.line(8, lineY, pageWidth - 8, lineY)

  doc.setTextColor(0, 0, 0)
  return PROGRAMA_ANALITICO_HEADER.contentStartY
}

async function obtenerLogoProgramaAnalitico(logoOverride = null) {
  if (logoOverride) return logoOverride

  if (!logoProgramaAnaliticoPromise) {
    logoProgramaAnaliticoPromise = convertirImagenABase64('/icons/LOGO%20UNITEPC.png')
  }

  return logoProgramaAnaliticoPromise
}

async function convertirImagenABase64(url) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()

    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('No se pudo cargar el logo institucional para el Programa Analítico:', error)
    return null
  }
}

function normalizarUnidadesProgramaAnalitico(unidades = []) {
  return [...(Array.isArray(unidades) ? unidades : [])]
    .sort((a, b) => {
      const numeroA = Number(a?.numero) || 0
      const numeroB = Number(b?.numero) || 0
      return numeroA - numeroB
    })
    .map((unidad) => ({
      ...unidad,
      temas: [...(Array.isArray(unidad?.temas) ? unidad.temas : [])].sort((a, b) => {
        const ordenA = Number(a?.orden) || 0
        const ordenB = Number(b?.orden) || 0
        return ordenA - ordenB
      }),
    }))
}

function normalizarBibliografiasProgramaAnalitico(asignatura) {
  const bibliografias = Array.isArray(asignatura?.bibliografias)
    ? asignatura.bibliografias
    : Array.isArray(asignatura?.bibliografia)
      ? asignatura.bibliografia
      : []

  return bibliografias
    .map((referencia) => {
      if (typeof referencia === 'string') {
        return { texto: referencia.trim(), tipoNormalizado: 'oficial' }
      }

      const texto =
        referencia?.texto ||
        [
          referencia?.autor,
          referencia?.titulo,
          referencia?.editorial,
          referencia?.edicion,
          referencia?.anio,
        ]
          .filter(Boolean)
          .join('. ')

      return {
        texto: String(texto || '').trim(),
        tipoNormalizado: normalizarTipoBibliografiaProgramaAnalitico(referencia),
      }
    })
    .filter((referencia) => Boolean(referencia?.texto))
}

function normalizarTipoBibliografiaProgramaAnalitico(referencia) {
  const tipoOriginal =
    referencia?.tipo ||
    referencia?.categoria ||
    referencia?.tipo_bibliografia ||
    referencia?.clasificacion ||
    ''

  const tipo = String(tipoOriginal)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

  if (!tipo) {
    return 'oficial'
  }

  if (
    tipo === 'basica' ||
    tipo === 'basic' ||
    tipo === 'principal' ||
    tipo === 'oficial' ||
    tipo.includes('basic') ||
    tipo.includes('princi') ||
    tipo.includes('ofici')
  ) {
    return 'oficial'
  }

  if (tipo === 'complementaria' || tipo === 'complementario' || tipo.includes('complement')) {
    return 'complementaria'
  }

  return tipo
}

function normalizarTextoImpresionTema(tema) {
  const contenidoLista = extraerListaContenidoTema(tema)
  const contenidoImpresion = asegurarPuntoFinal(
    formatearTextoSentenceCase(limpiarTextoProgramaAnalitico(tema?.contenido_impresion)),
  )

  return contenidoLista || contenidoImpresion || 'Contenido pendiente de registro.'
}

function extraerListaContenidoTema(tema) {
  const partes = []

  if (Array.isArray(tema?.contenido_items)) {
    tema.contenido_items.forEach((item) => {
      const valor =
        typeof item === 'string' ? item : item?.titulo || item?.descripcion || item?.texto || ''
      const limpio = asegurarPuntoFinal(formatearTextoSentenceCase(limpiarTextoProgramaAnalitico(valor)))
      if (limpio) partes.push(limpio)
    })
  }

  return partes.join(' ')
}

function limpiarTextoProgramaAnalitico(texto) {
  return String(texto || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/^[\s\-*.o•]+/gm, '')
    .replace(/\.{2,}/g, '.')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatearTextoSentenceCase(texto) {
  const limpio = limpiarTextoProgramaAnalitico(texto)
  if (!limpio) return ''

  const minusculas = limpio.toLocaleLowerCase('es')
  return minusculas.replace(/(^\s*|[.!?]\s+)([a-záéíóúñü])/gu, (match, prefijo, letra) => {
    return `${prefijo}${letra.toLocaleUpperCase('es')}`
  })
}

function asegurarPuntoFinal(texto) {
  const limpio = limpiarTextoProgramaAnalitico(texto)
  if (!limpio) return ''

  return /[.!?]$/.test(limpio) ? limpio : `${limpio}.`
}

function calcularHrsSemestreImpresion(asignatura) {
  const horasTeoricas = Number(asignatura?.horas_teoricas) || 0
  const horasPracticas = Number(asignatura?.horas_practicas) || 0
  const horasSemanales = horasTeoricas + horasPracticas

  if (horasSemanales > 0) {
    return horasSemanales * 20
  }

  const cargaHorariaTotal = Number(asignatura?.carga_horaria_total) || 0
  if (cargaHorariaTotal > 0) {
    return cargaHorariaTotal
  }

  return 0
}

function normalizarProgramaPlanEstudios(planEstudios) {
  const plan = String(planEstudios || '').trim().toUpperCase()
  return plan === 'A' ? 'A' : 'N'
}

function toRomanNumeral(value) {
  const numero = Number(value) || 0
  const romanos = [
    ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'],
    ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'],
  ]

  if (numero <= 0 || numero >= 100) {
    return String(value || '')
  }

  const decenas = romanos[1][Math.floor(numero / 10)]
  const unidades = romanos[0][numero % 10]
  return `${decenas}${unidades}`
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
      [
        { content: 'Competencia General:', styles: { fontStyle: 'bold' } },
        asignatura.objetivo_general || 'Desarrollar competencias profesionales en el área.',
      ],
    ],
    columnStyles: { 0: { cellWidth: 45 } },
  })

  y = doc.lastAutoTable.finalY + 10

  // Tabla de competencias por unidad
  const unidades = asignatura.unidades || []

  const rows = []
  unidades.forEach((unidad) => {
    rows.push([
      {
        content: `Unidad ${unidad.numero}: ${unidad.titulo}`,
        colSpan: 3,
        styles: { fillColor: COLORS.morado, textColor: 255, fontStyle: 'bold' },
      },
    ])
    rows.push([
      { content: 'Elemento de Competencia', styles: { fillColor: COLORS.gris, fontStyle: 'bold' } },
      { content: 'Saberes Esenciales', styles: { fillColor: COLORS.gris, fontStyle: 'bold' } },
      { content: 'Evidencias', styles: { fillColor: COLORS.gris, fontStyle: 'bold' } },
    ])
    rows.push([
      unidad.elemento_competencia || 'Por definir',
      unidad.saberes_esenciales || 'Conocimientos teóricos y prácticos',
      unidad.evidencias || 'Exámenes, trabajos prácticos',
    ])
  })

  if (rows.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      body: rows,
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
    docenteNombre = asignatura.docentes
      .map((d) => d.nombre_completo || `${d.nombre || ''} ${d.apellido || ''}`.trim())
      .join(', ')
  }
  const carreraNombre =
    typeof asignatura?.carrera === 'object' ? asignatura.carrera.nombre : asignatura?.carrera || ''
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
        asignatura?.nombre || '',
      ],
      [
        { content: 'Fecha:', styles: { fontStyle: 'bold', fillColor: COLORS.gris } },
        fechaActual,
        { content: 'Carrera:', styles: { fontStyle: 'bold', fillColor: COLORS.gris } },
        carreraNombre,
      ],
    ],
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
        {
          content: 'Unidad # ' + (unidad.numero || '1') + ':',
          styles: { fontStyle: 'bold', fillColor: COLORS.gris, cellWidth: 40 },
        },
        { content: unidad.titulo || '', styles: { textColor: COLORS.morado } },
      ],
    ],
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
        {
          content: 'Elemento de Competencia # ' + (unidad.numero || '1') + ':',
          styles: { fontStyle: 'bold', fillColor: COLORS.gris, cellWidth: 60 },
        },
        unidad.elemento_competencia || '',
      ],
    ],
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
        {
          content: 'Tema # ' + (tema.numero || '1') + ':',
          styles: { fontStyle: 'bold', fillColor: COLORS.gris, cellWidth: 40 },
        },
        { content: tema.titulo || '', styles: { textColor: COLORS.morado } },
      ],
    ],
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
      [
        {
          content: 'Resultados de Aprendizaje:',
          styles: { fontStyle: 'bold', fillColor: COLORS.gris },
        },
      ],
      [resultadosAprendizaje],
    ],
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
      [logrosText || 'Por definir'],
    ],
  })
  y = doc.lastAutoTable.finalY

  // ===== INDICADORES DE LOGRO =====
  const indicadores = logros
    .flatMap((l, idx) =>
      (l.indicadores || []).map(
        (ind, i) =>
          `I.D.D.${idx + 1}.${i + 1}. ${typeof ind === 'string' ? ind : ind.descripcion || ''}`,
      ),
    )
    .join('\n')
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    body: [
      [{ content: 'Indicadores de Logro:', styles: { fontStyle: 'bold', fillColor: COLORS.gris } }],
      [indicadores || 'El estudiante demuestra el logro cuando: [Por definir]'],
    ],
  })
  y = doc.lastAutoTable.finalY

  // Verificar página
  if (y > 200) {
    doc.addPage()
    y = 15
  }

  // ===== CONTENIDOS =====
  const contenidos = tema.contenidos || {}
  const conceptual = Array.isArray(contenidos.conceptual)
    ? contenidos.conceptual.map((c) => '• ' + c).join('\n')
    : ''
  const procedimental = Array.isArray(contenidos.procedimental)
    ? contenidos.procedimental.map((c) => '✓ ' + c).join('\n')
    : ''
  const actitudinal = Array.isArray(contenidos.actitudinal)
    ? contenidos.actitudinal.map((c) => '• ' + c).join('\n')
    : ''

  const contenidoTexto = `Contenido Conceptual:\n${conceptual || '- Por definir'}\n\nContenido Procedimental:\n${procedimental || '- Por definir'}\n\nContenido Actitudinal:\n${actitudinal || '- Por definir'}`

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    body: [
      [{ content: 'Contenidos:', styles: { fontStyle: 'bold', fillColor: COLORS.gris } }],
      [contenidoTexto],
    ],
  })
  y = doc.lastAutoTable.finalY

  // ===== BIBLIOGRAFÍA OBLIGATORIA =====
  const referencias = tema.referencias_bibliograficas || asignatura?.bibliografias || []
  const biblioText =
    referencias.length > 0
      ? referencias
          .map(
            (b, i) =>
              `${i + 1}. ${b.autor || ''} (${b.anio || ''}). ${b.titulo || ''}. ${b.editorial || ''}`,
          )
          .join('\n')
      : 'Bibliografía pendiente de asignar'

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    body: [
      [
        {
          content: 'Bibliografía Obligatoria para las clases:',
          styles: { fontStyle: 'bold', fillColor: COLORS.gris },
        },
      ],
      [biblioText],
    ],
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
      [
        {
          content: 'ESTRATEGIAS DIDÁCTICAS',
          colSpan: 3,
          styles: { halign: 'center', fillColor: COLORS.morado, textColor: 255, fontStyle: 'bold' },
        },
      ],
      [
        {
          content: 'Metodológicas (De Enseñanza del Docente)',
          styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' },
        },
        {
          content: 'De Aprendizaje (Estudiantes)',
          styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' },
        },
        {
          content: 'Recursos de Enseñanza',
          styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' },
        },
      ],
    ],
    body: [
      [
        estrategias.metodologicas || '',
        estrategias.aprendizaje || '',
        Array.isArray(estrategias.recursos)
          ? estrategias.recursos.join('\n')
          : estrategias.recursos || '',
      ],
    ],
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
      [
        {
          content: 'EVALUACIÓN DE LOS APRENDIZAJES',
          colSpan: 4,
          styles: { halign: 'center', fillColor: COLORS.morado, textColor: 255, fontStyle: 'bold' },
        },
      ],
      [
        {
          content: 'TIPO DE EVALUACIÓN',
          styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' },
        },
        {
          content: 'Actividades y Técnicas',
          styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' },
        },
        {
          content: 'Instrumentos',
          styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' },
        },
        {
          content: 'Evidencias de Evaluación',
          styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' },
        },
      ],
    ],
    body: [
      [
        { content: 'FORMATIVA', styles: { fontStyle: 'bold', halign: 'center' } },
        Array.isArray(evalFormativa.actividades)
          ? evalFormativa.actividades.join('\n')
          : evalFormativa.actividades || '',
        Array.isArray(evalFormativa.instrumentos)
          ? evalFormativa.instrumentos.join('\n')
          : evalFormativa.instrumentos || '',
        Array.isArray(evalFormativa.evidencias)
          ? evalFormativa.evidencias.join('\n')
          : evalFormativa.evidencias || '',
      ],
      [
        { content: 'SUMATIVA', styles: { fontStyle: 'bold', halign: 'center' } },
        Array.isArray(evalSumativa.actividades)
          ? evalSumativa.actividades.join('\n')
          : evalSumativa.actividades || '',
        Array.isArray(evalSumativa.instrumentos)
          ? evalSumativa.instrumentos.join('\n')
          : evalSumativa.instrumentos || '',
        Array.isArray(evalSumativa.evidencias)
          ? evalSumativa.evidencias.join('\n')
          : evalSumativa.evidencias || '',
      ],
    ],
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
    { momento: 'CONCLUSIÓN O CIERRE', actividad: '', duracion: '' },
  ]
  const secuenciaData = secuencia.length > 0 ? secuencia : secuenciaDefault

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 70 }, 2: { cellWidth: 25 } },
    head: [
      [
        {
          content: 'SECUENCIA DIDÁCTICA',
          colSpan: 3,
          styles: { halign: 'center', fillColor: COLORS.morado, textColor: 255, fontStyle: 'bold' },
        },
      ],
      [
        {
          content: 'MOMENTOS',
          styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' },
        },
        {
          content: 'ACTIVIDAD',
          styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' },
        },
        {
          content: 'DURACIÓN',
          styles: { fillColor: COLORS.gris, fontStyle: 'bold', halign: 'center' },
        },
      ],
    ],
    body: secuenciaData.map((s) => [
      { content: (s.momento || '').toUpperCase(), styles: { fontStyle: 'bold' } },
      s.actividad || '',
      s.duracion ? (typeof s.duracion === 'number' ? `${s.duracion} min` : s.duracion) : '',
    ]),
  })
}

export default {
  generarCarpetaDocente,
}
