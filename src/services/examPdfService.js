import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { api } from 'boot/axios'

export const EXAM_PDF_DEFAULT_CONFIG = {
  formatoHoja: 'Oficio (8.5" x 13")',
  fontFamily: 'helvetica',
  fontSize: 11,
  lineSpacing: 0.85,
  aleatorizarSecciones: true,
}

export const shuffle = (array) => {
  let currentIndex = array.length
  let randomIndex

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }

  return array
}

export const normalizeExamQuestionType = (tipo) => {
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
  cleanQuestionText(text).replace(/^([IVX]+|\d+|[A-Z])[.):]\s*/i, '')

export const buildExamQuestionSelection = (questions, config = {}) => {
  const metaFacil = parseInt(config.facil, 10) || 7
  const metaMedio = parseInt(config.medio, 10) || 16
  const metaDificil = parseInt(config.dificil, 10) || 7

  const getPoolByDifficulty = (nivel) =>
    questions.filter((question) => {
      const dificultad = String(
        question.nivel_dificultad || question.dificultad || '1',
      ).toUpperCase()

      if (nivel === '1') return ['1', 'FACIL'].includes(dificultad)
      if (nivel === '2') return ['2', 'MEDIO', 'MEDIA'].includes(dificultad)
      if (nivel === '3') return ['3', 'DIFICIL'].includes(dificultad)

      return false
    })

  const poolFacil = getPoolByDifficulty('1')
  const poolMedio = getPoolByDifficulty('2')
  const poolDificil = getPoolByDifficulty('3')
  const usedIds = new Set()

  const selectFromPool = (pool, meta) => {
    if (meta <= 0) return []

    const availablePool = pool.filter((question) => !usedIds.has(question.id))
    const headers = availablePool.filter((question) =>
      ['PROBLEMA', 'EMPAREJAMIENTO'].includes(normalizeExamQuestionType(question.tipo)),
    )
    const subquestions = questions.filter((question) =>
      ['SUBPROBLEMA', 'OPCION_EMPAREJAMIENTO'].includes(normalizeExamQuestionType(question.tipo)),
    )

    const macroGroups = headers
      .map((header) => ({
        header,
        children: subquestions.filter(
          (subquestion) =>
            subquestion.grupo?.trim() === header.grupo?.trim() &&
            header.grupo &&
            !usedIds.has(subquestion.id),
        ),
      }))
      .filter((macro) => macro.children.length > 0)

    const individualQuestions = availablePool
      .filter(
        (question) =>
          [
            'SELECCION_SIMPLE',
            'PREGUNTA_CON_CLAVE',
            'RESPUESTA_COMPUESTA',
            'FALSO_VERDADERO',
            'PROBLEMA',
            'EMPAREJAMIENTO',
          ].includes(normalizeExamQuestionType(question.tipo)) &&
          !['SUBPROBLEMA', 'OPCION_EMPAREJAMIENTO'].includes(
            normalizeExamQuestionType(question.tipo),
          ),
      )
      .filter((question) => !headers.some((header) => header.id === question.id))

    let bestMacros = []
    let bestSum = -1

    for (let index = 0; index < 100; index += 1) {
      let sum = 0
      const selection = []
      const shuffledMacros = shuffle([...macroGroups])

      for (const macro of shuffledMacros) {
        if (sum + macro.children.length <= meta) {
          selection.push(macro)
          sum += macro.children.length
        }

        if (sum === meta) break
      }

      if (sum === meta || meta - sum <= individualQuestions.length) {
        bestMacros = selection
        bestSum = sum
        break
      }

      if (sum > bestSum) {
        bestMacros = selection
        bestSum = sum
      }
    }

    const selectedQuestions = []
    let counted = 0

    for (const macro of bestMacros) {
      usedIds.add(macro.header.id)
      const headerClone = JSON.parse(JSON.stringify(macro.header))
      selectedQuestions.push(headerClone)

      const children = JSON.parse(JSON.stringify(shuffle([...macro.children])))
      children.forEach((child) => {
        usedIds.add(child.id)
        child._parentTipo = normalizeExamQuestionType(headerClone.tipo)
      })

      selectedQuestions.push(...children)
      counted += children.length
    }

    const remaining = meta - counted

    if (remaining > 0) {
      const extras = shuffle([...individualQuestions]).slice(0, remaining)
      extras.forEach((extra) => usedIds.add(extra.id))
      selectedQuestions.push(...JSON.parse(JSON.stringify(extras)))
    }

    return selectedQuestions
  }

  const selectedEasy = selectFromPool(poolFacil, metaFacil)
  const selectedMedium = selectFromPool(poolMedio, metaMedio)
  const selectedHard = selectFromPool(poolDificil, metaDificil)
  const selection = [...selectedEasy, ...selectedMedium, ...selectedHard]

  const countRealQuestions = (items) =>
    items.filter(
      (question) =>
        !['PR', 'EM', 'PROBLEMA', 'EMPAREJAMIENTO'].includes(
          String(question.tipo || '').toUpperCase(),
        ),
    ).length

  const totalTarget = metaFacil + metaMedio + metaDificil
  const currentCount = countRealQuestions(selection)
  const missing = totalTarget - currentCount

  if (missing > 0) {
    const extraSelection = selectFromPool(questions, missing)
    selection.push(...extraSelection)
  }

  return selection
}

export const mixExamQuestionOptions = (questions = []) =>
  questions.map((question) => {
    const tipoNormalizado = normalizeExamQuestionType(question.tipo)

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

export const sortExamQuestionsForPdf = (questions = [], config = {}) => {
  const baseOrder = [
    'PROBLEMA',
    'EMPAREJAMIENTO',
    'OPCION_EMPAREJAMIENTO',
    'SUBPROBLEMA',
    'SELECCION_SIMPLE',
    'PREGUNTA_CON_CLAVE',
    'RESPUESTA_COMPUESTA',
    'FALSO_VERDADERO',
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

  return questions.sort((a, b) => {
    if (a.grupo && b.grupo && a.grupo === b.grupo) return 0

    const typeA = a._parentTipo || normalizeExamQuestionType(a.tipo)
    const typeB = b._parentTipo || normalizeExamQuestionType(b.tipo)

    return localOrder.indexOf(typeA) - localOrder.indexOf(typeB)
  })
}

export const createExamPdfDocument = (config = {}) => {
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

async function compressImage(blob, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    image.onload = () => {
      let width = image.width
      let height = image.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height
      context.drawImage(image, 0, 0, width, height)
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }

    image.onerror = reject
    image.src = URL.createObjectURL(blob)
  })
}

async function fetchImageAsBase64(url) {
  try {
    const response = await api.get(url, { responseType: 'blob' })
    let blob = response.data

    if (blob.type.startsWith('image/')) {
      blob = await compressImage(blob)
    }

    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error convirtiendo imagen a Base64 con API:', error)
    return null
  }
}

function cleanQuestionText(text) {
  return String(text || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/Æ’/g, 'f')
    .replace(/â€¦/g, '...')
    .replace(/[^\x20-\x7E\xA0-\xFF\s]/g, ' ')
    .replace(/[\u00A0\u1680\u180e\u2000-\u200b\u202f\u205f\u3000\ufeff]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const EXAM_SECTION_COPY = {
  FALSO_VERDADERO: {
    title: 'VERDADERO O FALSO SIMPLE',
    lines: ['Instrucciones: Marque A si el enunciado es verdadero o B si el enunciado es falso.'],
  },
  SELECCION_SIMPLE: {
    title: 'SELECCION DE LA MEJOR RESPUESTA',
    lines: [
      'Instrucciones: Las siguientes preguntas estan compuestas por un caso clinico, una pregunta y cinco opciones de respuesta. Seleccione la mejor respuesta.',
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

const buildDisplayLines = (doc, text, maxWidth) =>
  doc.splitTextToSize(cleanQuestionText(text), maxWidth)

const wrapMultipleLines = (doc, lines, maxWidth) =>
  lines.flatMap((line) => doc.splitTextToSize(cleanQuestionText(line), maxWidth))

const getRealQuestionNumber = (questions, index) =>
  index +
  1 -
  questions
    .slice(0, index)
    .filter((item) => ['PROBLEMA', 'EMPAREJAMIENTO'].includes(normalizeExamQuestionType(item.tipo)))
    .length

export const generateExamPdf = async (pdfDoc, exam, config = {}, letra = 'A', questions = []) => {
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

  const logoUrl = `${api.defaults.baseURL}/banco-preguntas/logo-unitepc`
  let logoBase64 = null

  try {
    logoBase64 = await fetchImageAsBase64(logoUrl)
  } catch (error) {
    console.warn('No se pudo cargar el logo oficial:', error)
  }

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
          content: 'UNIVERSIDAD TECNICA PRIVADA COSMOS\nGESTION I-2026',
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
          content: 'NOMBRE ESTUDIANTE:',
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
    const currentType = normalizeExamQuestionType(question.tipo)
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
      const linkedQuestions = []
      let cursor = index + 1

      while (
        cursor < questions.length &&
        ['OPCION_EMPAREJAMIENTO', 'SUBPROBLEMA'].includes(
          normalizeExamQuestionType(questions[cursor].tipo),
        ) &&
        questions[cursor].grupo === question.grupo
      ) {
        linkedQuestions.push(questions[cursor])
        cursor += 1
      }

      let estimatedHeight = statementLines.length * lineHeight + 4
      estimatedHeight += keyLines.length * (lineHeight + 0.5) + 4

      for (const linked of linkedQuestions) {
        const subText = `${cleanQuestionText(linked.enunciado)} (      )`
        const subLines = doc.splitTextToSize(subText, contentWidth - 20)
        estimatedHeight += subLines.length * lineHeight + 4
      }

      estimatedHeight += 5

      const maxPageHeight = doc.internal.pageSize.getHeight() - 25
      if (currentY + estimatedHeight > maxPageHeight && estimatedHeight < maxPageHeight - margin) {
        doc.addPage()
        currentY = margin
        doc.setFontSize(baseSize)
        doc.setFont(baseFont, 'bold')
      }

      doc.text(statementLines, margin + 8, currentY)
      currentY += statementLines.length * lineHeight + 4
      doc.setFont(baseFont, 'normal')
      doc.setFontSize(baseSize - 2)

      for (const option of keyLines) {
        if (currentY > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage()
          currentY = margin
          doc.setFont(baseFont)
        }

        doc.text(option, margin + 15, currentY)
        currentY += lineHeight + 0.5
      }

      currentY += 4
      doc.setFontSize(baseSize)

      for (let childIndex = 0; childIndex < linkedQuestions.length; childIndex += 1) {
        const linked = linkedQuestions[childIndex]
        const realNumber = baseNumber + childIndex

        if (currentY > doc.internal.pageSize.getHeight() - 25) {
          doc.addPage()
          currentY = margin
          doc.setFont(baseFont)
        }

        doc.setFont(baseFont, 'bold')
        doc.text(`${realNumber}. `, margin + 10, currentY)
        doc.setFont(baseFont, 'normal')

        const subText = `${cleanQuestionText(linked.enunciado)} (      )`
        const subLines = doc.splitTextToSize(subText, contentWidth - 20)
        doc.text(subLines, margin + 18, currentY)
        currentY += subLines.length * lineHeight + 4
      }

      currentY += 5
      index = cursor - 1
      continue
    }

    const structuredLines = extractStructuredLines(question.enunciado)
    let statement = structuredLines[0] || cleanQuestionText(question.enunciado)
    const detailLines = structuredLines.slice(1)

    if (statement.toUpperCase().startsWith('EMPAREJAMIENTO:')) {
      statement = statement.substring(16).trim()
    }

    if (statement.toUpperCase().startsWith('PROBLEMA:')) {
      statement = statement.substring(9).trim()
    }

    const statementLines = doc.splitTextToSize(statement, contentWidth - 12)
    const options = Array.isArray(question.opciones) ? question.opciones : []
    const isHeader = currentType === 'PROBLEMA'
    const renderOptions = ['SELECCION_SIMPLE', 'SUBPROBLEMA'].includes(currentType)
    const prefixedBlankTypes = ['FALSO_VERDADERO', 'PREGUNTA_CON_CLAVE', 'RESPUESTA_COMPUESTA']
    const statementX = prefixedBlankTypes.includes(currentType) ? margin + 18 : margin + 8
    const hasStatement = statementLines.some((line) => String(line || '').trim().length > 0)
    let estimatedHeight = statementLines.length * lineHeight

    if (currentType === 'SUBPROBLEMA') estimatedHeight += 4
    estimatedHeight += isHeader ? 0.5 : 2
    if (question.imagen) estimatedHeight += 47

    if (currentType === 'PREGUNTA_CON_CLAVE') {
      detailLines.forEach((line, detailIndex) => {
        const claveLines = doc.splitTextToSize(
          `${detailIndex + 1}. ${stripNumericPrefix(line)}`,
          contentWidth - 22,
        )
        estimatedHeight += claveLines.length * lineHeight + 1
      })
    } else if (currentType === 'RESPUESTA_COMPUESTA') {
      const romanLabels = ['I', 'II']
      detailLines.forEach((line, detailIndex) => {
        const premiseLines = doc.splitTextToSize(
          `${romanLabels[detailIndex] || romanLabels[romanLabels.length - 1]}. ${stripNumericPrefix(line)}`,
          contentWidth - 22,
        )
        estimatedHeight += premiseLines.length * lineHeight + 1
      })
    } else if (renderOptions) {
      for (const option of options) {
        const optionLines = doc.splitTextToSize(
          `${option.id || ''}) ${cleanQuestionText(option.text)}`,
          contentWidth - 22,
        )
        estimatedHeight += optionLines.length * lineHeight + 1
      }
    }

    estimatedHeight += isHeader ? 0 : 5

    const maxPageHeight = doc.internal.pageSize.getHeight() - 25
    if (currentY + estimatedHeight > maxPageHeight && estimatedHeight < maxPageHeight - margin) {
      doc.addPage()
      currentY = margin
    }

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
    if (hasStatement) {
      doc.text(statementLines, statementX, currentY)
      currentY += statementLines.length * lineHeight
    }

    if (currentType === 'PREGUNTA_CON_CLAVE') {
      currentY += 2
      doc.setFontSize(baseSize - 1)
      detailLines.forEach((line, detailIndex) => {
        const claveLines = doc.splitTextToSize(
          `${detailIndex + 1}. ${stripNumericPrefix(line)}`,
          contentWidth - 18,
        )
        doc.text(claveLines, margin + 12, currentY)
        currentY += claveLines.length * lineHeight + 1
      })
      doc.setFontSize(baseSize)
    }

    if (currentType === 'RESPUESTA_COMPUESTA') {
      currentY += 2
      doc.setFontSize(baseSize - 1)
      const romanLabels = ['I', 'II']
      detailLines.forEach((line, detailIndex) => {
        const premiseLines = doc.splitTextToSize(
          `${romanLabels[detailIndex] || romanLabels[romanLabels.length - 1]}. ${stripNumericPrefix(line)}`,
          contentWidth - 18,
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

    if (question.imagen) {
      try {
        const imageUrl = `${api.defaults.baseURL}/banco-preguntas/image/${question.imagen}`
        const imageData = await fetchImageAsBase64(imageUrl)

        if (imageData) {
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
            'JPEG',
            (pageWidth - imageWidth) / 2,
            currentY,
            imageWidth,
            imageHeight,
          )
          currentY += imageHeight + 2
        } else {
          doc.setDrawColor(255, 0, 0)
          doc.rect((pageWidth - 20) / 2, currentY, 20, 10)
          doc.text('ERR_IMG', (pageWidth - 20) / 2 + 2, currentY + 7)
          currentY += 15
        }
      } catch (error) {
        console.error('Error cargando imagen en PDF:', error)
        doc.text('CATCH_IMG_ERR', margin, currentY)
        currentY += 10
      }
    }

    if (renderOptions && options.length > 0) {
      doc.setFontSize(baseSize - 1)
      doc.setFont(baseFont, 'normal')

      for (const option of options) {
        const optionLines = doc.splitTextToSize(
          `${option.id || ''}) ${cleanQuestionText(option.text)}`,
          contentWidth - 22,
        )

        if (currentY + optionLines.length * lineHeight > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage()
          currentY = margin
          doc.setFont(baseFont)
        }

        doc.text(optionLines, margin + 12, currentY)
        currentY += optionLines.length * lineHeight + 1
      }
    }

    currentY += isHeader ? 2 : 5
  }

  const cleanSede = String(exam.sede || '').replace(/\s/g, '')
  const cleanParcial = String(exam.parcial || '').replace(/\s/g, '')
  const rawFilename = `${exam.codigo || 'EXAM'}_${cleanSede}_G${exam.grupo || ''}_${cleanParcial}_Var${letra}.pdf`
  const blob = doc.output('blob')

  return { blob, filename: rawFilename, doc }
}
