import { describe, expect, it } from 'vitest'
import {
  normalizeExamQuestionType,
  buildExamQuestionSelection,
  mixExamQuestionOptions,
  sortExamQuestionsForPdf,
} from 'src/services/examPdfService.js'

describe('examPdfService', () => {
  it('normaliza aliases de tipos de pregunta', () => {
    expect(normalizeExamQuestionType('fv')).toBe('FALSO_VERDADERO')
    expect(normalizeExamQuestionType('sm')).toBe('RESPUESTA_COMPUESTA')
    expect(normalizeExamQuestionType('su')).toBe('SELECCION_SIMPLE')
    expect(normalizeExamQuestionType('pr')).toBe('PROBLEMA')
    expect(normalizeExamQuestionType('em')).toBe('EMPAREJAMIENTO')
  })

  it('selecciona la cantidad objetivo de preguntas contables', () => {
    const questions = []
    let id = 1

    for (const diff of ['1', '2', '3']) {
      const count = diff === '1' ? 10 : diff === '2' ? 20 : 10
      for (let index = 0; index < count; index += 1) {
        questions.push({
          id: id++,
          tipo: 'SELECCION_SIMPLE',
          dificultad: diff,
          opciones: [
            { id: 'A', text: 'A' },
            { id: 'B', text: 'B' },
            { id: 'C', text: 'C' },
            { id: 'D', text: 'D' },
            { id: 'E', text: 'E' },
          ],
          respuesta_correcta: 'A',
        })
      }
    }

    const selection = buildExamQuestionSelection(questions, {
      facil: 7,
      medio: 16,
      dificil: 7,
    })

    const realQuestions = selection.filter(
      (item) => !['PROBLEMA', 'EMPAREJAMIENTO'].includes(normalizeExamQuestionType(item.tipo)),
    )

    expect(realQuestions).toHaveLength(30)
  })

  it('mezcla opciones conservando una respuesta correcta válida', () => {
    const mixed = mixExamQuestionOptions([
      {
        tipo: 'SELECCION_SIMPLE',
        opciones: [
          { id: 'A', text: 'Alpha' },
          { id: 'B', text: 'Bravo' },
          { id: 'C', text: 'Correcta' },
          { id: 'D', text: 'Delta' },
          { id: 'E', text: 'Echo' },
        ],
        respuesta_correcta: 'C',
      },
    ])

    expect(mixed[0].opciones).toHaveLength(5)
    expect(['A', 'B', 'C', 'D', 'E']).toContain(mixed[0].respuesta_correcta)
  })

  it('ordena encabezados y subpreguntas de forma consistente para PDF', () => {
    const sorted = sortExamQuestionsForPdf([
      { id: 2, tipo: 'SUBPROBLEMA', grupo: 'Caso 1' },
      { id: 1, tipo: 'PROBLEMA', grupo: 'Caso 1' },
      { id: 4, tipo: 'OPCION_EMPAREJAMIENTO', grupo: 'Emp 1' },
      { id: 3, tipo: 'EMPAREJAMIENTO', grupo: 'Emp 1' },
    ], { aleatorizarSecciones: false })

    expect(sorted.map((item) => item.tipo)).toEqual([
      'SUBPROBLEMA',
      'PROBLEMA',
      'OPCION_EMPAREJAMIENTO',
      'EMPAREJAMIENTO',
    ])

    expect(sorted[0].grupo).toBe('Caso 1')
    expect(sorted[1].grupo).toBe('Caso 1')
    expect(sorted[2].grupo).toBe('Emp 1')
    expect(sorted[3].grupo).toBe('Emp 1')
  })
})
