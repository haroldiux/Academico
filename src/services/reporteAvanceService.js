import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Colores institucionales
const COLORS = {
  morado: [67, 56, 202], // #4338CA
  turquesa: [20, 184, 166], // #14B8A6
  gris: [229, 231, 235], // #E5E7EB
  negro: [0, 0, 0],
  blanco: [255, 255, 255],
}

export function generarReporteAvanceMateria(materia) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15
  let y = 20

  // --- HEADER ---
  // Título Institucional
  doc.setFontSize(18)
  doc.setTextColor(...COLORS.morado)
  doc.setFont('helvetica', 'bold')
  doc.text('UNITEPC', pageWidth / 2, y, { align: 'center' })

  y += 7
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.turquesa)
  doc.text('VICERRECTORADO ACADÉMICO - DIRECCIÓN DE CARRERA', pageWidth / 2, y, { align: 'center' })

  y += 15
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text('REPORTE DE SEGUIMIENTO Y AVANCE ACADÉMICO', pageWidth / 2, y, { align: 'center' })

  y += 15

  // --- DATOS DE LA MATERIA ---
  doc.setFillColor(...COLORS.gris)
  doc.rect(margin, y, pageWidth - margin * 2, 20, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')

  // Fila 1
  doc.text('Materia:', margin + 5, y + 6)
  doc.setFont('helvetica', 'normal')
  doc.text((materia.nombre || 'Sin Nombre').toUpperCase(), margin + 25, y + 6)

  doc.setFont('helvetica', 'bold')
  doc.text('Código:', margin + 120, y + 6)
  doc.setFont('helvetica', 'normal')
  doc.text(materia.codigo || 'S/C', margin + 140, y + 6)

  // Fila 2
  const carreraNombre = materia.carrera_nombre || 'Desconocida' // Ajustar según estructura si está disponible
  doc.setFont('helvetica', 'bold')
  doc.text('Carrera:', margin + 5, y + 14)
  doc.setFont('helvetica', 'normal')
  doc.text(carreraNombre.toUpperCase(), margin + 25, y + 14) // Nota: verificar si nombre carrera viene en objeto materia

  doc.setFont('helvetica', 'bold')
  doc.text('Fecha:', margin + 120, y + 14)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date().toLocaleDateString('es-BO'), margin + 140, y + 14)

  y += 25

  // --- TABLA DE DOCENTES ---

  const columns = [
    { header: 'DOCENTE', dataKey: 'docente' },
    { header: 'GRUPO', dataKey: 'grupo' },
    { header: 'AVANCE', dataKey: 'avance' },
    { header: 'ASIST. %', dataKey: 'asistencia' },
    { header: 'ESTADO', dataKey: 'estado' },
    { header: 'TEMAS', dataKey: 'temas' },
    { header: 'DOCS', dataKey: 'docs' },
  ]

  const data = (materia.docentes || []).map((d) => ({
    docente: d.nombre || 'Sin Nombre',
    grupo: d.grupo || '-',
    avance: `${d.avanceTemas || 0}%`,
    asistencia: `${d.asistencia || 0}%`,
    estado: d.estado || '-',
    temas: `${d.temasCompletados || 0}/${d.temasTotales || 0}`,
    docs: formatDocs(d),
  }))

  autoTable(doc, {
    startY: y,
    head: [columns.map((c) => c.header)],
    body: data.map((r) => Object.values(r)),
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.morado,
      textColor: COLORS.blanco,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 50 }, // Docente align left
      6: { cellWidth: 35, fontSize: 8 }, // Docs column bit wider/smaller font
    },
    didParseCell: (data) => {
      // Colorize Status
      if (data.section === 'body' && data.column.index === 4) {
        // Estado
        const text = data.cell.raw
        if (text === 'Al día') data.cell.styles.textColor = [21, 128, 61] // Green
        if (text === 'Atrasado') data.cell.styles.textColor = [185, 28, 28] // Red
        if (text === 'Sin documentación') data.cell.styles.textColor = [234, 88, 12] // Orange
      }
    },
  })

  // Footer / Stats
  y = doc.lastAutoTable.finalY + 10

  // Resumen básico
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('RESUMEN:', margin, y)

  doc.setFont('helvetica', 'normal')
  const totalDocentes = (materia.docentes || []).length
  const docentesAlDia = (materia.docentes || []).filter((d) => d.estado === 'Al día').length

  doc.text(`Total Docentes: ${totalDocentes}`, margin, y + 6)
  doc.text(`Docentes Al Día: ${docentesAlDia}`, margin, y + 12)
  doc.text(`Docentes con Retraso/Pendientes: ${totalDocentes - docentesAlDia}`, margin, y + 18)

  const nombreArchivo = `Reporte_Avance_${(materia.nombre || 'Materia').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
  doc.save(nombreArchivo)
}

function formatDocs(d) {
  const pac = d.pac ? 'PAC: Ok' : 'PAC: Pen.'
  const plan = d.planClase ? 'Plan: Ok' : 'Plan: Pen.'
  return `${pac}\n${plan}`
}
