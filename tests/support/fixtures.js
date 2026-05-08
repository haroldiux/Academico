import path from 'node:path'

export const excelFixturesDir = path.resolve('tests/fixtures/excel')

export const excelFixtures = {
  validoMinimo: path.join(excelFixturesDir, 'banco_valido_minimo.xlsx'),
  validoCompleto: path.join(excelFixturesDir, 'banco_valido_completo.xlsx'),
  columnasFaltantes: path.join(excelFixturesDir, 'banco_con_columnas_faltantes.xlsx'),
  tipoInvalido: path.join(excelFixturesDir, 'banco_con_tipo_invalido.xlsx'),
  respuestaInvalida: path.join(excelFixturesDir, 'banco_con_respuesta_invalida.xlsx'),
  dificultadInvalida: path.join(excelFixturesDir, 'banco_con_dificultad_invalida.xlsx'),
  opcionesIncompletas: path.join(excelFixturesDir, 'banco_con_opciones_incompletas.xlsx'),
  subproblemaHuerfano: path.join(excelFixturesDir, 'banco_con_subproblema_huerfano.xlsx'),
  opcionEmparejamientoHuerfana: path.join(
    excelFixturesDir,
    'banco_con_opcion_emparejamiento_huerfana.xlsx',
  ),
  duplicados2p: path.join(excelFixturesDir, 'banco_con_duplicados_2p.xlsx'),
  mixtoValidosInvalidos: path.join(excelFixturesDir, 'banco_mixto_validos_invalidos.xlsx'),
  extensionInvalida: path.join(excelFixturesDir, 'banco_extension_invalida.txt'),
  vacio: path.join(excelFixturesDir, 'banco_vacio.xlsx'),
  bancoRealRedes2: path.join(excelFixturesDir, 'BANCO 2DO PARCIAL REDES 2.xlsx'),
}
