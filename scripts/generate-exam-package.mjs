import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const [payloadPath] = process.argv.slice(2)

if (!payloadPath) {
  throw new Error('Missing payload path')
}

const payload = JSON.parse(await fs.readFile(payloadPath, 'utf8'))

const EXAM_PDF_DEFAULT_CONFIG = {
  formatoHoja: 'Oficio (8.5" x 13")',
  fontFamily: 'helvetica',
  fontSize: 11,
  lineSpacing: 0.85,
  aleatorizarSecciones: true,
}

const shuffle = (array) => {
  let currentIndex = array.length

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }

  return array
}

const normalizeQuestionType = (tipo) => {
  const value = String(tipo || '')
    .toUpperCase()
    .trim()

  if (['PR', 'PROBLEMA'].includes(value)) return 'PROBLEMA'
  if (['EM', 'EMPAREJAMIENTO'].includes(value)) return 'EMPAREJAMIENTO'
  if (['SP', 'SUBPREGUNTA', 'SUBPROBLEMA'].includes(value)) return 'SUBPROBLEMA'
  if (['OPCION_EMPAREJAMIENTO'].includes(value)) return 'OPCION_EMPAREJAMIENTO'
  if (['SU', 'SS', 'SELECCION_UNICA', 'SELECCION_SIMPLE'].includes(value)) return 'SELECCION_SIMPLE'
  if (['PREGUNTA_CON_CLAVE'].includes(value)) return 'PREGUNTA_CON_CLAVE'
  if (['SM', 'SELECCION_MULTIPLE', 'RESPUESTA_COMPUESTA'].includes(value))
    return 'RESPUESTA_COMPUESTA'
  if (['FV', 'FALSO_VERDADERO', 'FALSO O VERDADERO', 'VERDADERO O FALSO'].includes(value))
    return 'FALSO_VERDADERO'

  return value
}

const cleanQuestionText = (text) =>
  String(text || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/[^\x20-\x7E\xA0-\xFF\s]/g, ' ')
    .replace(/[\u00A0\u1680\u180e\u2000-\u200b\u202f\u205f\u3000\ufeff]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const decodeHtmlEntities = (text) =>
  String(text || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/&ndash;/gi, '-')
    .replace(/&mdash;/gi, '-')

const extractStructuredLines = (text) =>
  decodeHtmlEntities(text)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .split('\n')
    .map((line) => cleanQuestionText(line))
    .filter(Boolean)

const stripNumericPrefix = (text) =>
  cleanQuestionText(text).replace(/^([IVX]+|\d+|[A-Z])[.):]\s+/i, '')

const buildExamQuestionSelection = (questions, config = {}) => {
  const metaFacil = parseInt(config.facil, 10) || 7
  const metaMedio = parseInt(config.medio, 10) || 16
  const metaDificil = parseInt(config.dificil, 10) || 7

  const difficultyKey = (question) => {
    const dificultad = String(question.nivel_dificultad || question.dificultad || '1').toUpperCase()
    if (['1', 'FACIL'].includes(dificultad)) return 'facil'
    if (['2', 'MEDIO', 'MEDIA'].includes(dificultad)) return 'medio'
    if (['3', 'DIFICIL'].includes(dificultad)) return 'dificil'
    return null
  }

  const headersByGroup = new Map()
  questions.forEach((question) => {
    const type = normalizeQuestionType(question.tipo)
    if (!['PROBLEMA', 'EMPAREJAMIENTO'].includes(type)) return
    const group = String(question.grupo || '').trim()
    if (!group) return
    headersByGroup.set(`${type}:${group}`, question)
  })

  const evaluableQuestions = questions
    .map((question, index) => ({
      question,
      index,
      difficulty: difficultyKey(question),
      type: normalizeQuestionType(question.tipo),
    }))
    .filter((item) => item.difficulty && !['PROBLEMA', 'EMPAREJAMIENTO'].includes(item.type))

  const trySelection = () => {
    const remaining = {
      facil: metaFacil,
      medio: metaMedio,
      dificil: metaDificil,
    }
    const selected = []
    const ordered = shuffle([...evaluableQuestions]).sort((a, b) => {
      const scarcityA = evaluableQuestions.filter((item) => item.difficulty === a.difficulty).length
      const scarcityB = evaluableQuestions.filter((item) => item.difficulty === b.difficulty).length
      return scarcityA - scarcityB
    })

    for (const item of ordered) {
      if (remaining[item.difficulty] <= 0) continue
      selected.push(item)
      remaining[item.difficulty] -= 1
    }

    return Object.values(remaining).every((total) => total === 0) ? selected : null
  }

  let selected = null
  for (let attempt = 0; attempt < 500 && !selected; attempt += 1) {
    selected = trySelection()
  }

  if (!selected) {
    return null
  }

  const groupedSelections = new Map()
  const individualSelections = []

  selected.forEach((item) => {
    const group = String(item.question.grupo || '').trim()
    if (['SUBPROBLEMA', 'OPCION_EMPAREJAMIENTO'].includes(item.type) && group) {
      const parentType = item.type === 'OPCION_EMPAREJAMIENTO' ? 'EMPAREJAMIENTO' : 'PROBLEMA'
      const key = `${parentType}:${group}`
      if (!groupedSelections.has(key)) {
        groupedSelections.set(key, {
          header: headersByGroup.get(key),
          index: item.index,
          children: [],
        })
      }

      const block = groupedSelections.get(key)
      block.index = Math.min(block.index, item.index)
      block.children.push({ ...item.question, _parentTipo: parentType, _originalIndex: item.index })
    } else {
      individualSelections.push({ index: item.index, items: [item.question] })
    }
  })

  return [
    ...individualSelections,
    ...Array.from(groupedSelections.values()).map((block) => ({
      index: block.index,
      items: [
        block.header,
        ...block.children.sort((a, b) => a._originalIndex - b._originalIndex),
      ].filter(Boolean),
    })),
  ]
    .sort((a, b) => a.index - b.index)
    .flatMap((block) => block.items)
}

const mixExamQuestionOptions = (questions = []) =>
  questions.map((question) => {
    const tipoNormalizado = normalizeQuestionType(question.tipo)

    if (tipoNormalizado === 'FALSO_VERDADERO') {
      const rawAnswer = Array.isArray(question.respuesta_correcta)
        ? question.respuesta_correcta[0]
        : question.respuesta_correcta
      const answer = String(rawAnswer || '').toUpperCase()
      const isTrue = answer === 'VERDADERO' || answer === 'V' || answer === 'TRUE' || answer === 'A'

      question.opciones = [
        { id: 'A', text: 'Verdadero' },
        { id: 'B', text: 'Falso' },
      ]
      question.respuesta_correcta = isTrue ? 'A' : 'B'
      return question
    }

    if (['RESPUESTA_COMPUESTA', 'PREGUNTA_CON_CLAVE'].includes(tipoNormalizado)) {
      question.respuesta_correcta = Array.isArray(question.respuesta_correcta)
        ? String(question.respuesta_correcta[0] || '').toUpperCase()
        : String(question.respuesta_correcta || '').toUpperCase()
      return question
    }

    if (tipoNormalizado === 'OPCION_EMPAREJAMIENTO') {
      question.respuesta_correcta = Array.isArray(question.respuesta_correcta)
        ? String(question.respuesta_correcta[0] || '').toUpperCase()
        : String(question.respuesta_correcta || '').toUpperCase()
      return question
    }

    if (!question.opciones || question.opciones.length === 0) {
      return question
    }

    const originalCorrectAnswers = Array.isArray(question.respuesta_correcta)
      ? question.respuesta_correcta
      : [question.respuesta_correcta]
    const correctTexts = question.opciones
      .filter((option) => originalCorrectAnswers.includes(option.id))
      .map((option) => option.text)

    const shuffledOptions = shuffle([...question.opciones])
    const labels = 'ABCDEFGHIJ'.split('')
    const newCorrectAnswers = []

    question.opciones = shuffledOptions.map((option, index) => {
      const newId = labels[index] || String(index + 1)

      if (correctTexts.includes(option.text)) {
        newCorrectAnswers.push(newId)
      }

      return { ...option, id: newId }
    })

    question.respuesta_correcta = Array.isArray(question.respuesta_correcta)
      ? newCorrectAnswers
      : newCorrectAnswers[0] || question.respuesta_correcta

    return question
  })

const sortExamQuestionsForPdf = (questions = [], config = {}) => {
  const baseOrder = [
    'SELECCION_SIMPLE',
    'PREGUNTA_CON_CLAVE',
    'RESPUESTA_COMPUESTA',
    'FALSO_VERDADERO',
    'PROBLEMA',
    'SUBPROBLEMA',
    'EMPAREJAMIENTO',
    'OPCION_EMPAREJAMIENTO',
  ]

  let localOrder = [...baseOrder]

  if (config.aleatorizarSecciones) {
    const mainSections = [
      'PROBLEMA',
      'EMPAREJAMIENTO',
      'SELECCION_SIMPLE',
      'PREGUNTA_CON_CLAVE',
      'RESPUESTA_COMPUESTA',
      'FALSO_VERDADERO',
    ]
    const shuffledSections = shuffle([...mainSections])
    localOrder = []

    shuffledSections.forEach((section) => {
      localOrder.push(section)
      if (section === 'PROBLEMA' || section === 'EMPAREJAMIENTO') {
        localOrder.push(section === 'EMPAREJAMIENTO' ? 'OPCION_EMPAREJAMIENTO' : 'SUBPROBLEMA')
      }
    })
  }

  const buildQuestionBlocks = (items) => {
    const used = new Set()
    const childTypesByParent = {
      PROBLEMA: ['SUBPROBLEMA'],
      EMPAREJAMIENTO: ['OPCION_EMPAREJAMIENTO'],
    }

    return items.reduce((blocks, question, index) => {
      const uniqueKey = question.id ?? `${index}-${question.tipo}-${question.grupo || ''}`
      if (used.has(uniqueKey)) return blocks

      const type = normalizeQuestionType(question.tipo)
      const childTypes = childTypesByParent[type]
      const group = String(question.grupo || '').trim()

      if (childTypes && group) {
        const children = items.filter((candidate, candidateIndex) => {
          const candidateKey =
            candidate.id ?? `${candidateIndex}-${candidate.tipo}-${candidate.grupo || ''}`
          return (
            candidateKey !== uniqueKey &&
            !used.has(candidateKey) &&
            String(candidate.grupo || '').trim() === group &&
            childTypes.includes(normalizeQuestionType(candidate.tipo))
          )
        })

        used.add(uniqueKey)
        children.forEach((child) =>
          used.add(child.id ?? `${items.indexOf(child)}-${child.tipo}-${child.grupo || ''}`),
        )

        blocks.push({
          type,
          index,
          items: [question, ...children],
        })
        return blocks
      }

      used.add(uniqueKey)
      blocks.push({
        type: question._parentTipo || type,
        index,
        items: [question],
      })
      return blocks
    }, [])
  }

  return buildQuestionBlocks(questions)
    .sort((a, b) => {
      const orderA = localOrder.indexOf(a.type)
      const orderB = localOrder.indexOf(b.type)
      const safeOrderA = orderA === -1 ? localOrder.length : orderA
      const safeOrderB = orderB === -1 ? localOrder.length : orderB

      if (safeOrderA !== safeOrderB) return safeOrderA - safeOrderB
      return a.index - b.index
    })
    .flatMap((block) => block.items)
}

const createExamPdfDocument = (config = {}) => {
  const formatMap = {
    Carta: 'letter',
    Oficio: 'legal',
    'Oficio (8.5" x 13")': [215.9, 330.2],
  }
  const paperFormat =
    formatMap[config.formatoHoja] || formatMap[EXAM_PDF_DEFAULT_CONFIG.formatoHoja]

  return new jsPDF({
    compression: true,
    putOnlyUsedFonts: true,
    precision: 3,
    orientation: 'p',
    unit: 'mm',
    format: paperFormat,
  })
}

const buildDisplayLines = (doc, text, maxWidth) =>
  doc.splitTextToSize(cleanQuestionText(text), maxWidth)

const wrapMultipleLines = (doc, lines, maxWidth) =>
  lines.flatMap((line) => doc.splitTextToSize(cleanQuestionText(line), maxWidth))

const getRealQuestionNumber = (questions, index) =>
  index +
  1 -
  questions
    .slice(0, index)
    .filter((item) => ['PROBLEMA', 'EMPAREJAMIENTO'].includes(normalizeQuestionType(item.tipo)))
    .length

const EXAM_SECTION_COPY = {
  FALSO_VERDADERO: {
    title: 'VERDADERO O FALSO SIMPLE',
    lines: ['Instrucciones: Marque A si el enunciado es verdadero o B si el enunciado es falso.'],
  },
  SELECCION_SIMPLE: {
    title: 'SELECCION DE LA MEJOR RESPUESTA',
    lines: [
      'Instrucciones: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.',
    ],
  },
  PREGUNTA_CON_CLAVE: {
    title: 'VERDADERO O FALSO COMPLEJAS',
    lines: [
      'Instrucciones: Seleccione la opcion correcta de acuerdo con la siguiente clave:',
      'A: 1, 2 y 3 son verdaderas.',
      'B: 1 y 3 son verdaderas.',
      'C: 2 y 4 son verdaderas.',
      'D: Solo 4 es verdadera.',
      'E: Todas son verdaderas.',
    ],
  },
  RESPUESTA_COMPUESTA: {
    title: 'RESPUESTA A/B/AMBAS/NINGUNA',
    lines: [
      'Instrucciones: Las siguientes preguntas estan compuestas por dos premisas. Responda con:',
      'A: si solo la primera premisa es verdadera.',
      'B: si solo la segunda premisa es verdadera.',
      'C: si ambas premisas son verdaderas.',
      'D: si ninguna premisa es verdadera.',
    ],
  },
  PROBLEMA: {
    title: 'ITEMS AGRUPADOS POR CASO CLINICO O PROBLEMA',
    lines: [
      'Instrucciones: El siguiente caso clinico o problema tendra varias preguntas. Seleccione la respuesta correcta en cada una.',
    ],
  },
  EMPAREJAMIENTO: {
    title: 'EMPAREJAMIENTO AMPLIADO',
    lines: [
      'Instrucciones: De la lista de opciones, seleccione la respuesta correcta para cada enunciado.',
    ],
  },
}

const fileToDataUrl = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath)
    const extension = path.extname(filePath).toLowerCase()
    const mimeType = extension === '.png' ? 'image/png' : 'image/jpeg'
    return `data:${mimeType};base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

const imageFormatFromPath = (filePath) =>
  path.extname(filePath).toLowerCase() === '.png' ? 'PNG' : 'JPEG'

const generateExamPdf = async (pdfDoc, exam, config = {}, letra = 'A', questions = []) => {
  const mergedConfig = {
    ...EXAM_PDF_DEFAULT_CONFIG,
    ...config,
  }
  const doc = pdfDoc || createExamPdfDocument(mergedConfig)
  const baseFont = mergedConfig.fontFamily || EXAM_PDF_DEFAULT_CONFIG.fontFamily
  const baseSize = mergedConfig.fontSize || EXAM_PDF_DEFAULT_CONFIG.fontSize
  const spacingMult = mergedConfig.lineSpacing || EXAM_PDF_DEFAULT_CONFIG.lineSpacing
  const lineHeight = baseSize * 0.42 * spacingMult
  const sectionFontSize = Math.max(9, baseSize - 1)
  const metaFontSize = Math.max(8, baseSize - 2)
  const margin = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - margin * 2

  doc.setFont(baseFont)
  doc.setLineHeightFactor(1.1905 * spacingMult)

  const formatFecha = (fecha) => {
    if (!fecha) return '-'
    const dateValue = new Date(fecha)
    return dateValue.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const logoBase64 = await fileToDataUrl(payload.logoPath)

  autoTable(doc, {
    startY: margin,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 11,
      font: baseFont,
      textColor: [0, 0, 0],
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
    },
    body: [
      [
        {
          content: logoBase64 ? '' : 'LOGO\nUNITEPC',
          rowSpan: 2,
          styles: {
            halign: 'center',
            valign: 'middle',
            fontSize: 8,
            cellWidth: 35,
            minCellHeight: 20,
          },
        },
        {
          content: `UNIVERSIDAD TECNICA PRIVADA COSMOS\nGESTION ${String(exam.gestion || '').toUpperCase()}`,
          styles: { halign: 'center', fontSize: 13, fontStyle: 'bold' },
        },
        { content: '', rowSpan: 2, styles: { cellWidth: 35 } },
      ],
      [
        {
          content: `EVALUACION TEORICA ${String(exam.parcial || '').toUpperCase()}`,
          styles: { halign: 'center', fontStyle: 'bold' },
        },
      ],
    ],
    didDrawCell: (data) => {
      if (
        data.section === 'body' &&
        data.column.index === 0 &&
        data.row.index === 0 &&
        logoBase64
      ) {
        const padding = 2
        doc.addImage(
          logoBase64,
          'PNG',
          data.cell.x + padding,
          data.cell.y + padding,
          data.cell.width - padding * 2,
          data.cell.height - padding * 2,
        )
      }
    },
  })

  doc.setLineWidth(0.4)
  doc.setDrawColor(0, 0, 0)
  doc.rect(margin, margin, contentWidth, doc.lastAutoTable.finalY - margin)

  const startYTable = doc.lastAutoTable.finalY + 2
  autoTable(doc, {
    startY: startYTable,
    margin: { left: margin, right: margin },
    tableWidth: pageWidth - margin * 2,
    theme: 'grid',
    styles: {
      fontSize: metaFontSize,
      cellPadding: 2.5,
      lineWidth: 0.15,
      lineColor: [0, 0, 0],
      font: baseFont,
    },
    body: [
      [
        {
          content: 'NOMBRE:',
          styles: {
            fontStyle: 'bold',
            minCellHeight: 10,
            cellWidth: (pageWidth - margin * 2) * 0.65,
          },
        },
        {
          content: 'CODIGO:',
          styles: { fontStyle: 'bold', cellWidth: (pageWidth - margin * 2) * 0.35 },
        },
      ],
      [
        { content: `CARRERA: ${String(exam.carrera || '')}`, styles: { fontStyle: 'bold' } },
        { content: `GRUPO: ${String(exam.grupo || '')}`, styles: { fontStyle: 'bold' } },
      ],
      [
        { content: `DOCENTE: ${String(exam.docente || '')}`, styles: { fontStyle: 'bold' } },
        {
          content: `TIPO DE EXAMEN: ${String(exam.parcial || '')} - VAR ${letra}`,
          styles: { fontStyle: 'bold' },
        },
      ],
      [
        { content: `MATERIA: ${String(exam.materia || '')}`, styles: { fontStyle: 'bold' } },
        { content: `FECHA: ${formatFecha(exam.fecha_examen)}`, styles: { fontStyle: 'bold' } },
      ],
      [
        { content: `SEMESTRE: ${String(exam.semestre || '')}`, styles: { fontStyle: 'bold' } },
        { content: `HORA: ${String(exam.hora || '')}`, styles: { fontStyle: 'bold' } },
      ],
      [
        {
          content:
            'IMPORTANTE: Completar obligatoriamente NOMBRE, CODIGO y marcar el TIPO/VARIANTE en la cartilla.',
          colSpan: 2,
          styles: {
            fontStyle: 'bold',
            halign: 'center',
            fontSize: Math.max(7, metaFontSize - 1),
            textColor: [180, 40, 40],
            fillColor: [255, 245, 245],
          },
        },
      ],
    ],
  })

  const tableHeight = doc.lastAutoTable.finalY - startYTable
  doc.setLineWidth(0.4)
  doc.rect(margin, startYTable, contentWidth, tableHeight)

  let currentY = doc.lastAutoTable.finalY + 10
  let previousType = null
  let problemCount = 0

  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index]
    const currentType = normalizeQuestionType(question.tipo)
    const mainTypes = [
      'SELECCION_SIMPLE',
      'PREGUNTA_CON_CLAVE',
      'RESPUESTA_COMPUESTA',
      'FALSO_VERDADERO',
      'PROBLEMA',
      'EMPAREJAMIENTO',
    ]

    if (currentType !== previousType && mainTypes.includes(currentType)) {
      const sectionCopy = EXAM_SECTION_COPY[currentType] || {
        title: currentType.replaceAll('_', ' '),
        lines: [],
      }
      const titleLines = buildDisplayLines(doc, sectionCopy.title, contentWidth - 4)
      const instructionLines = wrapMultipleLines(doc, sectionCopy.lines || [], contentWidth - 4)
      const rectHeight = titleLines.length * 4.5 + instructionLines.length * 4.5 + 8

      if (currentY + rectHeight > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage()
        currentY = margin
      }

      doc.setDrawColor(40, 40, 40)
      doc.setLineWidth(0.8)
      doc.line(margin, currentY, margin + contentWidth, currentY)
      doc.setFontSize(sectionFontSize)
      doc.setFont(baseFont, 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(titleLines, margin, currentY + 5)
      if (instructionLines.length > 0) {
        doc.setFont(baseFont, 'normal')
        doc.setFontSize(baseSize - 1)
        doc.text(instructionLines, margin, currentY + 5 + titleLines.length * 4.5 + 2)
      }
      doc.setLineWidth(0.2)
      doc.line(margin, currentY + rectHeight, margin + contentWidth, currentY + rectHeight)
      currentY += rectHeight + (currentType === 'PROBLEMA' ? 8 : 10)
      previousType = currentType
    }

    if (currentY > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage()
      doc.setFont(baseFont)
      currentY = margin
    }

    const baseNumber = getRealQuestionNumber(questions, index)

    if (currentType === 'EMPAREJAMIENTO') {
      doc.setFontSize(baseSize)
      doc.setFont(baseFont, 'bold')
      const rawLines = extractStructuredLines(question.enunciado)
      const statementBase = rawLines[0]?.toUpperCase().startsWith('EMPAREJAMIENTO:')
        ? rawLines[0].substring(16).trim()
        : rawLines[0] || ''
      const statementLines = buildDisplayLines(doc, statementBase, contentWidth - 10)
      const keyLines = rawLines.slice(1)
      const matchingOptions = Array.isArray(question.opciones) ? question.opciones : []
      const optionLines = matchingOptions.length
        ? matchingOptions.map((option, optionIndex) => {
            const optionId = option.id || String.fromCharCode(65 + optionIndex)
            return `${optionId}) ${cleanQuestionText(option.text)}`
          })
        : keyLines
      const linkedQuestions = []
      let cursor = index + 1

      while (
        cursor < questions.length &&
        normalizeQuestionType(questions[cursor].tipo) === 'OPCION_EMPAREJAMIENTO' &&
        questions[cursor].grupo === question.grupo
      ) {
        linkedQuestions.push(questions[cursor])
        cursor += 1
      }

      doc.text(statementLines, margin + 8, currentY)
      currentY += statementLines.length * lineHeight + 4
      doc.setFont(baseFont, 'normal')
      doc.setFontSize(baseSize - 2)

      for (const option of optionLines) {
        if (currentY > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage()
          currentY = margin
        }

        doc.text(option, margin + 15, currentY)
        currentY += lineHeight + 0.5
      }

      currentY += 4
      doc.setFontSize(baseSize)

      for (let childIndex = 0; childIndex < linkedQuestions.length; childIndex += 1) {
        const linked = linkedQuestions[childIndex]
        const realNumber = baseNumber + childIndex
        const subText = `${cleanQuestionText(linked.enunciado)} (      )`
        const subLines = doc.splitTextToSize(subText, contentWidth - 20)

        if (currentY + subLines.length * lineHeight > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage()
          currentY = margin
        }

        doc.setFont(baseFont, 'bold')
        doc.text(`${realNumber}. `, margin + 10, currentY)
        doc.setFont(baseFont, 'normal')
        doc.text(subLines, margin + 18, currentY)
        currentY += subLines.length * lineHeight + 4
      }

      currentY += 5
      index = cursor - 1
      continue
    }

    const structuredLines = extractStructuredLines(question.enunciado)
    let statement = structuredLines[0] || cleanQuestionText(question.enunciado)
    let detailLines = structuredLines.slice(1)

    if (statement.toUpperCase().startsWith('EMPAREJAMIENTO:')) {
      statement = statement.substring(16).trim()
    }

    if (statement.toUpperCase().startsWith('PROBLEMA:')) {
      statement = statement.substring(9).trim()
    }

    let premiseDetailStartIndex = 0
    if (currentType === 'RESPUESTA_COMPUESTA') {
      const premiseLines =
        structuredLines.length > 0 ? structuredLines : [statement].filter(Boolean)
      if (premiseLines.length > 1 || /^[IVX]+[.):]\s*/i.test(premiseLines[0] || '')) {
        statement = `I. ${stripNumericPrefix(premiseLines[0])}`
        detailLines = premiseLines.slice(1)
        premiseDetailStartIndex = 1
      }
    }

    const options = Array.isArray(question.opciones) ? question.opciones : []
    if (currentType === 'PREGUNTA_CON_CLAVE' && options.length > 0) {
      const orderedKeyOptions = options
        .map((option) => {
          if (typeof option === 'string') return cleanQuestionText(option)
          return cleanQuestionText(option?.text || option?.label || option?.enunciado || '')
        })
        .filter(Boolean)

      if (orderedKeyOptions.length > 0) {
        detailLines = orderedKeyOptions
      }
    }

    const isHeader = currentType === 'PROBLEMA'
    const renderOptions = ['SELECCION_SIMPLE', 'SUBPROBLEMA'].includes(currentType)
    const prefixedBlankTypes = ['FALSO_VERDADERO', 'PREGUNTA_CON_CLAVE', 'RESPUESTA_COMPUESTA']
    const statementX = prefixedBlankTypes.includes(currentType) ? margin + 18 : margin + 8
    const statementMaxWidth = margin + contentWidth - statementX
    const detailMaxWidth = margin + contentWidth - (margin + 12)
    const optionMaxWidth = margin + contentWidth - (margin + 12)
    const statementLines = doc.splitTextToSize(statement, statementMaxWidth)

    doc.setFontSize(baseSize)
    doc.setFont(baseFont, 'bold')

    if (!isHeader) {
      const realNumber = getRealQuestionNumber(questions, index)
      const prefix = prefixedBlankTypes.includes(currentType)
        ? `${realNumber}. ____ `
        : `${realNumber}. `
      doc.text(prefix, margin, currentY)
    } else {
      problemCount += 1
      doc.setFontSize(baseSize + 1)
      doc.setFont(baseFont, 'bold')
      doc.text(`CASO N ${problemCount}:`, margin, currentY)
      currentY += 6
      doc.setFontSize(baseSize)
    }

    doc.setFont(baseFont, 'normal')
    doc.text(statementLines, statementX, currentY)
    currentY += statementLines.length * lineHeight + 2

    if (currentType === 'PREGUNTA_CON_CLAVE') {
      doc.setFontSize(baseSize - 1)
      detailLines.forEach((line, detailIndex) => {
        const claveLines = doc.splitTextToSize(
          `${detailIndex + 1}. ${stripNumericPrefix(line)}`,
          detailMaxWidth,
        )
        doc.text(claveLines, margin + 12, currentY)
        currentY += claveLines.length * lineHeight + 1
      })
      doc.setFontSize(baseSize)
    }

    if (currentType === 'RESPUESTA_COMPUESTA') {
      doc.setFontSize(baseSize - 1)
      const romanLabels = ['I', 'II']
      detailLines.forEach((line, detailIndex) => {
        const label = romanLabels[detailIndex + premiseDetailStartIndex] || romanLabels.at(-1)
        const premiseLines = doc.splitTextToSize(
          `${label}. ${stripNumericPrefix(line)}`,
          detailMaxWidth,
        )
        doc.text(premiseLines, margin + 12, currentY)
        currentY += premiseLines.length * lineHeight + 1
      })
      doc.setFontSize(baseSize)
    }

    if (currentType === 'SUBPROBLEMA') {
      doc.setFontSize(metaFontSize)
      doc.setFont(baseFont, 'italic')
      doc.text('(Seleccione un solo inciso)', margin + 8, currentY + 2.5)
      currentY += 4
      doc.setFont(baseFont, 'normal')
    }

    currentY += 2

    if (question.imagePath) {
      const imageData = await fileToDataUrl(question.imagePath)
      if (imageData) {
        const imageFormat = imageFormatFromPath(question.imagePath)
        const imageProps = doc.getImageProperties(imageData)
        let imageHeight = 45
        let imageWidth = (imageProps.width * imageHeight) / imageProps.height

        if (imageWidth > contentWidth - 10) {
          imageWidth = contentWidth - 10
          imageHeight = (imageProps.height * imageWidth) / imageProps.width
        }

        if (currentY + imageHeight > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage()
          currentY = margin
        }

        doc.addImage(
          imageData,
          imageFormat,
          (pageWidth - imageWidth) / 2,
          currentY,
          imageWidth,
          imageHeight,
        )
        currentY += imageHeight + 2
      }
    }

    if (renderOptions && options.length > 0) {
      doc.setFontSize(baseSize - 1)
      for (const option of options) {
        const optionLines = doc.splitTextToSize(
          `${option.id || ''}) ${cleanQuestionText(option.text)}`,
          optionMaxWidth,
        )

        if (currentY + optionLines.length * lineHeight > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage()
          currentY = margin
        }

        doc.text(optionLines, margin + 12, currentY)
        currentY += optionLines.length * lineHeight + 1
      }
    }

    currentY += isHeader ? 2 : 5
  }

  return doc
}

const generatePatronPdf = async (pdfDoc, letra, preguntas = [], examenInput = null) => {
  const doc = pdfDoc || new jsPDF({ compression: true, putOnlyUsedFonts: true, precision: 3 })
  const examen = examenInput || {}
  const margin = 15
  const pageWidth = doc.internal.pageSize.getWidth()
  const purple = [121, 40, 169]

  const logoBase64 = await fileToDataUrl(payload.logoPath)

  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', margin, margin, 25, 20)
  }

  doc.setTextColor(...purple)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('UNIVERSIDAD TECNICA PRIVADA COSMOS', pageWidth / 2, margin + 8, { align: 'center' })

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text(`Carrera: ${examen.carrera || ''}`, pageWidth / 2, margin + 14, { align: 'center' })
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.text('"TU ESTAS AQUI PORQUE FORMAS PARTE DE NUESTRA HISTORIA"', pageWidth / 2, margin + 19, {
    align: 'center',
  })

  doc.setDrawColor(...purple)
  doc.setLineWidth(0.8)
  doc.line(margin, margin + 22, pageWidth - margin, margin + 22)

  let currentY = margin + 30
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('PATRON', margin + 35, currentY + 5)

  const drawVariantBubbles = (x, y, activeLetra) => {
    const letters = ['A', 'B', 'C', 'D', 'E']
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('TIPO DE EXAMEN', x + 15, y - 5, { align: 'center' })

    letters.forEach((l, idx) => {
      const bx = x + idx * 7
      const isSelected = l === activeLetra
      doc.setLineWidth(0.2)
      doc.setDrawColor(0, 0, 0)

      if (isSelected) {
        doc.setFillColor(0, 0, 0)
        doc.circle(bx, y, 2.5, 'FD')
        doc.setTextColor(255, 255, 255)
      } else {
        doc.circle(bx, y, 2.5, 'S')
        doc.setTextColor(0, 0, 0)
      }

      doc.text(l, bx, y + 0.8, { align: 'center', baseline: 'middle' })
    })

    doc.setTextColor(0, 0, 0)
  }

  drawVariantBubbles(pageWidth - margin - 35, currentY + 5, letra)

  doc.setLineWidth(0.2)
  doc.setDrawColor(180, 180, 180)
  doc.rect(pageWidth - margin - 50, currentY + 15, 50, 20)
  doc.setFontSize(7)
  doc.text('FIRMA DOCENTE Y SELLO', pageWidth - margin - 25, currentY + 32, { align: 'center' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  const fields = [
    { k: 'Materia:', v: examen.materia },
    { k: 'Docente:', v: examen.docente },
    { k: 'Examen:', v: examen.parcial },
    { k: 'Grupo:', v: `Grupo ${examen.grupo || ''}` },
  ]

  fields.forEach((field, idx) => {
    const fy = currentY + 15 + idx * 6
    doc.text(String(field.k || ''), margin, fy)
    doc.setFont('helvetica', 'normal')
    doc.text(String(field.v ?? ''), margin + 20, fy)
    doc.setFont('helvetica', 'bold')
  })

  doc.text('FECHA:', pageWidth - margin - 45, currentY + 21)
  doc.setFont('helvetica', 'normal')
  const fechaStr = examen.fecha_examen
    ? new Date(examen.fecha_examen).toISOString().split('T')[0]
    : '-'
  doc.text(String(fechaStr), pageWidth - margin - 30, currentY + 21)

  doc.setLineWidth(0.2)
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, currentY + 42, pageWidth - margin, currentY + 42)

  currentY += 55
  const colWidth = (pageWidth - 2 * margin) / 4
  const startYGrid = currentY

  const drawOmrLine = (qNum, answer, x, y) => {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(`${qNum}`, x, y + 1, { baseline: 'middle' })
    ;['A', 'B', 'C', 'D', 'E'].forEach((opt, idx) => {
      const bx = x + 8 + idx * 7
      const isCorrect = answer && answer.toUpperCase().includes(opt)

      doc.setLineWidth(0.1)
      doc.setDrawColor(100, 100, 100)
      if (isCorrect) {
        doc.setFillColor(50, 50, 50)
        doc.circle(bx, y, 2.2, 'FD')
        doc.setTextColor(255, 255, 255)
      } else {
        doc.circle(bx, y, 2.2, 'S')
        doc.setTextColor(100, 100, 100)
      }
      doc.setFontSize(6)
      doc.text(opt, bx, y + 0.8, { align: 'center', baseline: 'middle' })
    })
    doc.setTextColor(0, 0, 0)
  }

  const preguntasReales = preguntas.filter(
    (p) => !['PROBLEMA', 'EMPAREJAMIENTO'].includes(normalizeQuestionType(p.tipo)),
  )

  for (let i = 0; i < 100; i += 1) {
    const question = preguntasReales[i] || null
    const colIndex = Math.floor(i / 25)
    const rowIndex = i % 25
    const x = margin + colIndex * colWidth
    const y = startYGrid + rowIndex * 7

    let answer = ''
    if (question) {
      let rawAnswer = question.respuesta_correcta
      if (Array.isArray(rawAnswer)) rawAnswer = rawAnswer.join('')
      answer = String(rawAnswer || '')
        .toUpperCase()
        .replace(/["']/g, '')
      const tipo = String(question.tipo || '').toUpperCase()
      if (['FALSO_VERDADERO', 'FALSO O VERDADERO', 'FV'].includes(tipo)) {
        if (['VERDADERO', 'V', 'TRUE', 'A'].includes(answer)) answer = 'A'
        else if (['FALSO', 'F', 'FALSE', 'B'].includes(answer)) answer = 'B'
      }
    }

    drawOmrLine(i + 1, answer, x, y)
    doc.setDrawColor(230, 230, 230)
    doc.setLineWidth(0.1)
    doc.line(x, y + 3.5, x + colWidth - 5, y + 3.5)
  }

  return doc
}

const generatePatronXlsxConsolidado = (resultadosVariantes, codigoAsignatura = '') => {
  const codigo = String(codigoAsignatura || 'EXAM').trim()
  const headerRow = ['Codigo', 'Variante', 'ID_Pregunta']
  for (let i = 1; i <= 100; i += 1) headerRow.push(`P${i}`)

  const dataRows = []

  for (const result of resultadosVariantes) {
    const preguntasReales = result.sorted.filter(
      (p) => !['PROBLEMA', 'EMPAREJAMIENTO'].includes(normalizeQuestionType(p.tipo)),
    )
    const dataRow = [codigo, result.letra, 'Respuesta']

    for (let i = 0; i < 100; i += 1) {
      const question = preguntasReales[i] || null
      let answer = ''
      if (question) {
        let rawAnswer = question.respuesta_correcta
        if (Array.isArray(rawAnswer)) {
          if (rawAnswer.length > 1) answer = `(${rawAnswer.join(',')})`
          else if (rawAnswer.length === 1) answer = String(rawAnswer[0] || '').toUpperCase()
        } else {
          answer = String(rawAnswer || '')
            .toUpperCase()
            .replace(/["']/g, '')
          if (answer.includes(',') || answer.includes(';')) {
            answer = `(${answer.replace(/;/g, ',')})`
          }
        }
      }
      dataRow.push(answer)
    }

    dataRows.push(dataRow)
  }

  const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Patrones')
  return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })
}

const buildUniqueSuffix = () => {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

const buildAlternativePath = (targetPath) => {
  const parsed = path.parse(targetPath)
  return path.join(parsed.dir, `${parsed.name}_${buildUniqueSuffix()}${parsed.ext}`)
}

const writeBuffer = async (targetPath, buffer) => {
  await fs.mkdir(path.dirname(targetPath), { recursive: true })

  try {
    await fs.writeFile(targetPath, buffer)
    return targetPath
  } catch (error) {
    if (!['EPERM', 'EBUSY', 'EACCES'].includes(error?.code)) {
      throw error
    }

    const alternativePath = buildAlternativePath(targetPath)
    await fs.writeFile(alternativePath, buffer)
    return alternativePath
  }
}

const writePdf = async (doc, targetPath) => {
  const arrayBuffer = doc.output('arraybuffer')
  return writeBuffer(targetPath, Buffer.from(arrayBuffer))
}

const exam = payload.exam
const config = payload.config
const variants = ['A', 'B', 'C', 'D', 'E'].slice(0, Number(config.cantVariantes || 1))
const mergedExamenesDoc = createExamPdfDocument(config)
const mergedPatronesDoc = new jsPDF({ compression: true, putOnlyUsedFonts: true, precision: 3 })
const resultadosVariantes = []

for (let i = 0; i < variants.length; i += 1) {
  const letra = variants[i]
  const selection = buildExamQuestionSelection(payload.questions, config)

  if (!selection) {
    throw new Error('No se pudo armar una variante que cumpla la distribucion por dificultad.')
  }

  const sorted = sortExamQuestionsForPdf(
    mixExamQuestionOptions(JSON.parse(JSON.stringify(selection))),
    config,
  )

  if (i > 0) {
    const numPages = mergedExamenesDoc.internal.getNumberOfPages()
    if (numPages % 2 !== 0) {
      mergedExamenesDoc.addPage()
      mergedExamenesDoc.setFontSize(10)
      mergedExamenesDoc.setTextColor(150)
      mergedExamenesDoc.text('PAGINA EN BLANCO', 105, 150, { align: 'center' })
    }
    mergedExamenesDoc.addPage()
    mergedPatronesDoc.addPage()
  }

  await generateExamPdf(mergedExamenesDoc, exam, config, letra, sorted)
  await generatePatronPdf(mergedPatronesDoc, letra, sorted, exam)
  resultadosVariantes.push({ letra, sorted })
}

const varsJoined = resultadosVariantes.map((result) => result.letra).join('')
const normalizedCode = String(exam.codigo || 'EXAM').replace(/\s/g, '')
const normalizedSede = String(exam.sede || '').replace(/\s/g, '')
const normalizedGroup = String(exam.grupo || '1').replace(/\s/g, '')
const normalizedParcial = String(exam.parcial || '').replace(/\s/g, '')
const baseName = `${normalizedCode}_${normalizedSede}_G${normalizedGroup}_${normalizedParcial}_Var${varsJoined}`

const examFilename = `${baseName}_Examen.pdf`
const patronPdfFilename = `${baseName}_Patron.pdf`
const patronXlsxFilename = `${baseName}_Remark.xlsx`

const examOutputPath = await writePdf(
  mergedExamenesDoc,
  path.join(payload.output.examenesDir, examFilename),
)
const patronPdfOutputPath = await writePdf(
  mergedPatronesDoc,
  path.join(payload.output.patronesDir, patronPdfFilename),
)
const patronXlsxOutputPath = await writeBuffer(
  path.join(payload.output.patronesDir, patronXlsxFilename),
  generatePatronXlsxConsolidado(resultadosVariantes, exam.codigo),
)

const finalExamFilename = path.basename(examOutputPath)
const finalPatronPdfFilename = path.basename(patronPdfOutputPath)
const finalPatronXlsxFilename = path.basename(patronXlsxOutputPath)

const variantEntries = resultsVariantsToEntries(resultadosVariantes, finalExamFilename)
const patronEntries = resultsVariantsToPatternEntries(
  resultadosVariantes,
  finalPatronPdfFilename,
  finalPatronXlsxFilename,
)

process.stdout.write(
  JSON.stringify({
    examFilename: finalExamFilename,
    patronPdfFilename: finalPatronPdfFilename,
    patronXlsxFilename: finalPatronXlsxFilename,
    variantes: variantEntries,
    patrones: patronEntries,
    audit: resultsVariantsToAuditEntries(resultadosVariantes),
  }),
)

function resultsVariantsToEntries(resultados, filename) {
  return resultados.map((result) => ({
    letra: result.letra,
    archivo: filename,
  }))
}

function resultsVariantsToPatternEntries(resultados, pdfFilename, xlsxFilename) {
  return resultados.map((result) => ({
    letra: result.letra,
    pdf: pdfFilename,
    xlsx: xlsxFilename,
  }))
}

function resultsVariantsToAuditEntries(resultados) {
  return resultados.map((result) => ({
    letra: result.letra,
    preguntas: result.sorted.map((question, index) => ({
      idx: question.idx || question.id || index + 1,
      id: question.id,
      enunciado: question.enunciado,
      tipo: question.tipo,
      respuesta_correcta: question.respuesta_correcta,
      opciones: question.opciones,
      dificultad: question.dificultad,
      grupo: question.grupo,
    })),
  }))
}
