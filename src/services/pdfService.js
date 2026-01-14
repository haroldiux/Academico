/**
 * Servicio para generación de PDFs UNITEPC
 * Formatos: Plan de Clase Teórico, Programa de Asignatura
 */
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Aplicar el plugin al prototipo de jsPDF
jsPDF.prototype.autoTable = function(options) {
  return autoTable(this, options)
}

/**
 * Genera el PDF del Plan de Clase Teórico
 * @param {Object} asignatura - Datos de la asignatura
 * @param {Object} options - Opciones adicionales
 */
export function generarPlanDeClase(asignatura, options = {}) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15
    let y = 15

    // ============= TÍTULO PRINCIPAL =============
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('PLAN DE CLASE TEORICO', pageWidth / 2, y, { align: 'center' })
    y += 10

    // ============= HEADER: DOCENTE, ASIGNATURA, FECHA, CARRERA =============
    // ============= HEADER: DOCENTE, ASIGNATURA, FECHA, CARRERA =============
    // Manejo de docentes (puede ser array o no existir)
    // Manejo de docentes (puede ser array o no existir)
    let docenteNombre = 'Por asignar'
    if (asignatura.docentes && asignatura.docentes.length > 0) {
      docenteNombre = asignatura.docentes.map(d => d.nombre_completo || `${d.nombre || ''} ${d.apellido || ''}`.trim() || 'Sin nombre').join(', ')
    } else if (asignatura.docente) { // Fallback por si acaso
      docenteNombre = typeof asignatura.docente === 'object' ? (asignatura.docente.nombre_completo || 'Sin nombre') : asignatura.docente
    }

    const nombreAsignatura = asignatura.nombre || 'Asignatura'
    const fecha = options.fecha || new Date().toLocaleDateString('es-BO')

    // Manejo de carrera (puede ser objeto o string)
    const carreraNombre = typeof asignatura.carrera === 'object' ? (asignatura.carrera.nombre || 'Sin Carrera') : (asignatura.carrera || 'Sin Carrera')

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 85 },
        1: { cellWidth: 85 }
      },
      body: [
        [
          { content: `Docente: ${docenteNombre}`, styles: { fillColor: [204, 204, 204], fontStyle: 'bold' } },
          { content: `Asignatura: ${nombreAsignatura}`, styles: { fillColor: [204, 204, 204], fontStyle: 'bold' } }
        ],
        [
          { content: `Fecha: ${fecha}`, styles: { fillColor: [204, 204, 204], fontStyle: 'bold' } },
          { content: `Carrera: ${carreraNombre}`, styles: { fillColor: [204, 204, 204], fontStyle: 'bold' } }
        ]
      ]
    })
    y = doc.lastAutoTable.finalY + 5

    // ============= ITERAR POR CADA UNIDAD Y TEMA =============
    const unidades = asignatura.unidades || []

    unidades.forEach((unidad) => {
      const temas = unidad.temas || []

      temas.forEach((tema) => {
        // Verificar si necesitamos nueva página
        if (y > 230) {
          doc.addPage()
          y = 15
        }

        // --- UNIDAD ---
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          body: [
            [{ content: `Unidad # ${unidad.numero}: ${unidad.titulo}`, styles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' } }]
          ]
        })
        y = doc.lastAutoTable.finalY

        // --- ELEMENTO DE COMPETENCIA ---
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          body: [
            [{ content: `Elemento de Competencia # ${unidad.numero}: ${unidad.elemento_competencia || ''}`, styles: { fillColor: [204, 204, 204], fontStyle: 'bold' } }]
          ]
        })
        y = doc.lastAutoTable.finalY

        // --- TEMA (fondo negro) ---
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          body: [
            [{ content: `Tema # ${tema.numero}: ${tema.titulo}`, styles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' } }]
          ]
        })
        y = doc.lastAutoTable.finalY

        // --- RESULTADOS DE APRENDIZAJE ---
        const resultadosAprendizaje = tema.resultados_aprendizaje || tema.objetivo || ''
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          body: [
            [{ content: `Resultados de Aprendizaje:\n${resultadosAprendizaje}`, styles: { fillColor: [255, 255, 255] } }]
          ]
        })
        y = doc.lastAutoTable.finalY

        // --- LOGROS ESPERADOS ---
        const logros = tema.logros_esperados || []
        const logrosText = logros.map(l => `• ${l.descripcion || l}`).join('\n') || ''
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          body: [
            [{ content: `Logros Esperados:\n${logrosText}`, styles: { fillColor: [255, 255, 255] } }]
          ]
        })
        y = doc.lastAutoTable.finalY

        // --- INDICADORES DE LOGRO ---
        const indicadores = logros.flatMap(l => l.indicadores || []).map(i => `• ${i}`).join('\n') || ''
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          body: [
            [{ content: `Indicadores de Logro:\n${indicadores}`, styles: { fillColor: [255, 255, 255] } }]
          ]
        })
        y = doc.lastAutoTable.finalY

        // Verificar página
        if (y > 200) {
          doc.addPage()
          y = 15
        }

        // --- CONTENIDOS ---
        const conceptual = tema.contenidos?.conceptual?.map(c => `• ${c}`).join('\n') || ''
        const actitudinal = tema.contenidos?.actitudinal?.map(c => `• ${c}`).join('\n') || ''
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 135 } },
          body: [
            [
              { content: 'Contenidos:', styles: { fillColor: [255, 255, 255], fontStyle: 'bold' } },
              { content: `Saber Conceptual:\n${conceptual}`, styles: { fillColor: [255, 255, 255] } }
            ],
            [
              { content: '', styles: { fillColor: [255, 255, 255] } },
              { content: `Saber Actitudinal:\n${actitudinal}`, styles: { fillColor: [255, 255, 255] } }
            ]
          ]
        })
        y = doc.lastAutoTable.finalY

        // --- ESTRATEGIAS DIDÁCTICAS ---
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3, halign: 'center' },
          head: [
            [{ content: 'ESTRATEGIAS DIDACTICAS', colSpan: 3, styles: { halign: 'center', fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' } }],
            [
              { content: 'Metodologicas', styles: { fillColor: [204, 204, 204], textColor: 0, fontStyle: 'bold', halign: 'center' } },
              { content: 'De Aprendizaje', styles: { fillColor: [204, 204, 204], textColor: 0, fontStyle: 'bold', halign: 'center' } },
              { content: 'Recursos de Enseñanza', styles: { fillColor: [204, 204, 204], textColor: 0, fontStyle: 'bold', halign: 'center' } }
            ]
          ],
          body: [
            [
              tema.estrategias?.metodologicas || '',
              tema.estrategias?.aprendizaje || '',
              (tema.estrategias?.recursos || []).join(', ')
            ]
          ]
        })
        y = doc.lastAutoTable.finalY

        // Verificar página
        if (y > 180) {
          doc.addPage()
          y = 15
        }

        // --- EVALUACIÓN DE LOS APRENDIZAJES ---
        const evalFormativa = tema.evaluacion?.formativa || {}
        const evalSumativa = tema.evaluacion?.sumativa || {}

        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          head: [
            [{ content: 'EVALUACION DE LOS APRENDIZAJES', colSpan: 4, styles: { halign: 'center', fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' } }],
            [
              { content: 'TIPO DE EVALUACION', styles: { fillColor: [204, 204, 204], textColor: 0, fontStyle: 'bold', halign: 'center' } },
              { content: 'Actividades y Tecnicas', styles: { fillColor: [204, 204, 204], textColor: 0, fontStyle: 'bold', halign: 'center' } },
              { content: 'Instrumentos', styles: { fillColor: [204, 204, 204], textColor: 0, fontStyle: 'bold', halign: 'center' } },
              { content: 'Evidencias de Evaluación', styles: { fillColor: [204, 204, 204], textColor: 0, fontStyle: 'bold', halign: 'center' } }
            ]
          ],
          body: [
            [
              { content: 'FORMATIVA', styles: { fontStyle: 'bold', halign: 'center', fillColor: [240, 240, 240] } },
              (evalFormativa.actividades || []).join('\n'),
              (evalFormativa.instrumentos || []).join('\n'),
              (evalFormativa.evidencias || []).join('\n')
            ],
            [
              { content: 'SUMATIVA', styles: { fontStyle: 'bold', halign: 'center', fillColor: [240, 240, 240] } },
              (evalSumativa.actividades || []).join('\n'),
              (evalSumativa.instrumentos || []).join('\n'),
              (evalSumativa.evidencias || []).join('\n')
            ]
          ]
        })
        y = doc.lastAutoTable.finalY

        // Verificar página
        if (y > 180) {
          doc.addPage()
          y = 15
        }

        // --- SECUENCIA DIDÁCTICA ---
        // Convertir el array de secuencia a filas de tabla
        const secuenciaArray = tema.secuencia_didactica || []

        // Mapear los momentos del array a filas
        const momentosDefault = ['INTRODUCCION', 'RESULTADOS DE APRENDIZAJE / LOGROS ESPERADOS', 'CONTENIDOS DE LA CLASE', 'CUERPO DE CONTENIDOS', 'CONCLUSION O CIERRE']

        // Crear filas dinámicamente desde el array de secuencia
        const filasSecuencia = secuenciaArray.length > 0
          ? secuenciaArray.map(s => [
              { content: (s.momento || '').toUpperCase(), styles: { fontStyle: 'bold' } },
              s.actividad || '',
              s.duracion ? `${s.duracion} min` : ''
            ])
          : momentosDefault.map(momento => [
              { content: momento, styles: { fontStyle: 'bold' } },
              '',
              ''
            ])

        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 100 }, 2: { cellWidth: 25 } },
          head: [
            [{ content: 'SECUENCIA DIDACTICA', colSpan: 3, styles: { halign: 'center', fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' } }],
            [
              { content: 'MOMENTOS', styles: { fillColor: [204, 204, 204], textColor: 0, fontStyle: 'bold', halign: 'center' } },
              { content: 'ACTIVIDAD', styles: { fillColor: [204, 204, 204], textColor: 0, fontStyle: 'bold', halign: 'center' } },
              { content: 'DURACIÓN', styles: { fillColor: [204, 204, 204], textColor: 0, fontStyle: 'bold', halign: 'center' } }
            ]
          ],
          body: filasSecuencia
        })
        y = doc.lastAutoTable.finalY + 10
      })
    })

    // Guardar PDF con nombre descriptivo
    const nombreArchivo = 'Plan_de_Clase_' + (asignatura.codigo || 'ASIG').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf'
    doc.save(nombreArchivo)

    return doc
  } catch (error) {
    console.error('Error generando Plan de Clase:', error)
    throw error
  }
}

/**
 * Genera el PDF del Programa de Asignatura
 * @param {Object} asignatura - Datos de la asignatura
 */
export function generarProgramaAsignatura(asignatura) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15
    let y = 15

    // ============= HEADER INSTITUCIONAL =============
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('UNIVERSIDAD TECNICA PRIVADA COSMOS', pageWidth / 2, y, { align: 'center' })
    y += 6
    doc.setFontSize(16)
    doc.text('UNITEPC', pageWidth / 2, y, { align: 'center' })
    y += 10

    doc.setFontSize(14)
    doc.text('PROGRAMA DE ASIGNATURA', pageWidth / 2, y, { align: 'center' })
    y += 10

    // ============= DATOS GENERALES =============
    // Recalcular nombres para este PDF también
    let docenteNombre = 'Por asignar'
    if (asignatura.docentes && asignatura.docentes.length > 0) {
      docenteNombre = asignatura.docentes.map(d => d.nombre_completo || 'Sin nombre').join(', ')
    }

    const carreraNombre = typeof asignatura.carrera === 'object' ? (asignatura.carrera.nombre || 'Sin Carrera') : (asignatura.carrera || 'Sin Carrera')

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' },
      head: [['DATOS GENERALES DE LA ASIGNATURA']],
      body: [
        [`Asignatura: ${asignatura.nombre}`],
        [`Codigo: ${asignatura.codigo}`],
        [`Carrera: ${carreraNombre}`],
        [`Semestre: ${asignatura.semestre}`],
        [`Horas Teoricas: ${asignatura.horas_teoricas} | Horas Practicas: ${asignatura.horas_practicas} | Horas Laboratorio: ${asignatura.horas_laboratorio || 0}`],
        [`Creditos: ${asignatura.creditos}`],
        [`Docente: ${docenteNombre}`]
      ]
    })
    y = doc.lastAutoTable.finalY + 5

    // ============= JUSTIFICACIÓN =============
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' },
      head: [['JUSTIFICACION']],
      body: [[asignatura.justificacion || '']]
    })
    y = doc.lastAutoTable.finalY + 5

    // ============= OBJETIVO GENERAL =============
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' },
      head: [['OBJETIVO GENERAL']],
      body: [[asignatura.objetivo_general || '']]
    })
    y = doc.lastAutoTable.finalY + 5

    // ============= SABERES PREVIOS =============
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' },
      head: [['SABERES PREVIOS']],
      body: [[asignatura.saberes_previos || '']]
    })
    y = doc.lastAutoTable.finalY + 5

    // Nueva página para contenidos
    doc.addPage()
    y = 15

    // ============= CONTENIDO MÍNIMO =============
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' },
      head: [['CONTENIDO MINIMO']],
      body: [[asignatura.contenido_minimo || '']]
    })
    y = doc.lastAutoTable.finalY + 5

    // ============= UNIDADES DE APRENDIZAJE =============
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('UNIDADES DE APRENDIZAJE', margin, y + 5)
    y += 10

    const unidades = asignatura.unidades || []
    unidades.forEach((unidad) => {
      if (y > 240) {
        doc.addPage()
        y = 15
      }

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [100, 100, 200], textColor: 255, fontStyle: 'bold' },
        head: [[`UNIDAD ${unidad.numero}: ${unidad.titulo}`]],
        body: [
          [`Elemento de Competencia: ${unidad.elemento_competencia || ''}`],
          [`Horas: ${unidad.horas || ''}`]
        ]
      })
      y = doc.lastAutoTable.finalY

      // Temas de la unidad
      const temas = unidad.temas || []
      if (temas.length > 0) {
        const temasBody = temas.map(t => [`Tema ${t.numero}: ${t.titulo}`])
        autoTable(doc, {
          startY: y,
          margin: { left: margin + 5, right: margin },
          theme: 'plain',
          styles: { fontSize: 8, cellPadding: 2 },
          body: temasBody
        })
        y = doc.lastAutoTable.finalY + 3
      }
      y += 3
    })

    // ============= BIBLIOGRAFÍA =============
    if (y > 200) {
      doc.addPage()
      y = 15
    }

    const biblios = asignatura.bibliografias || []
    if (biblios.length > 0) {
      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' },
        head: [['BIBLIOGRAFIA']],
        body: biblios.map(b => [`${b.autor} (${b.anio}). ${b.titulo}. ${b.editorial}. ${b.edicion || ''}`])
      })
    }

    // Guardar PDF con nombre descriptivo
    const nombreArchivo = 'Programa_Asignatura_' + (asignatura.codigo || 'ASIG').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf'
    doc.save(nombreArchivo)

    return doc
  } catch (error) {
    console.error('Error generando Programa de Asignatura:', error)
    throw error
  }
}

export default {
  generarPlanDeClase,
  generarProgramaAsignatura
}
