import { Q as Z, a as O } from './QBreadcrumbs-CYOF_fIt.js'
import {
  aj as h,
  aw as K,
  e as X,
  r as R,
  P as S,
  aB as ee,
  f as ae,
  a as oe,
  i as V,
  j as v,
  k as r,
  m as o,
  l as a,
  z as P,
  s as f,
  B as _,
  A as w,
  x as k,
  D as z,
  E as C,
  Q as y,
  y as E,
  a4 as G,
  a5 as L,
  a2 as te,
  au as le,
} from './index-CVgKKHHv.js'
import { Q as U } from './QChip-g_JHqrFQ.js'
import { Q as re, a as Q } from './QTabs-C5AuWb1j.js'
import { Q as j } from './QBanner-jrp6fMez.js'
import { Q as se, a as B } from './QTabPanels-Dv0zYOYy.js'
import { Q as ie, a as Y } from './QItem-C23xClkh.js'
import { Q as ne } from './QList-BSXQR-9A.js'
import { Q as de } from './QPage-D-YrLEJA.js'
import { u as ce } from './grupos-CQHYnTJ_.js'
import { E as H, a as A } from './jspdf.plugin.autotable-ZWVc0qIh.js'
import { _ as me } from './_plugin-vue_export-helper-DlAUqK2U.js'
import './QResizeObserver-DSbEROZH.js'
import './rtl-DFPa-2ov.js'
import './touch-BjYP5sR0.js'
import './selection-Dzil4kq6.js'
import './use-render-cache-DLxPkVnQ.js'
const J = {
    getPrograma(l) {
      return h.get(`/asignaturas/${l}/programa`)
    },
    updatePrograma(l, t) {
      return h.put(`/asignaturas/${l}/programa`, t)
    },
    getJustificacion(l) {
      return h.get(`/asignaturas/${l}/programa/justificacion`)
    },
    updateJustificacion(l, t) {
      return h.put(`/asignaturas/${l}/programa/justificacion`, t)
    },
    getCompetencias(l) {
      return h.get(`/asignaturas/${l}/programa/competencias`)
    },
    updateCompetencias(l, t) {
      return h.put(`/asignaturas/${l}/programa/competencias`, t)
    },
    getElementosCompetencia(l) {
      return h.get(`/asignaturas/${l}/programa/elementos-competencia`)
    },
    updateElementosCompetencia(l, t) {
      return h.put(`/asignaturas/${l}/programa/elementos-competencia`, t)
    },
    getMetodologia(l) {
      return h.get(`/asignaturas/${l}/programa/metodologia`)
    },
    updateMetodologia(l, t) {
      return h.put(`/asignaturas/${l}/programa/metodologia`, t)
    },
    getBibliografiaComplementaria(l) {
      return h.get(`/asignaturas/${l}/programa/bibliografia-complementaria`)
    },
    updateBibliografiaComplementaria(l, t) {
      return h.put(`/asignaturas/${l}/programa/bibliografia-complementaria`, t)
    },
    async saveProgramaCompleto(l, t) {
      return h.put(`/asignaturas/${l}/programa`, {
        justificacion: t.justificacion,
        proposito_general: t.proposito_general,
        competencias: t.competencias,
        elementos_competencia: t.elementos_competencia,
        metodologia_general: t.metodologia_general,
        sistema_evaluacion: t.sistema_evaluacion,
        organizacion_calendario: t.organizacion_calendario,
        bibliografia_complementaria: t.bibliografia_complementaria,
      })
    },
  },
  ue = K('programaAsignatura', () => {
    const l = X(),
      t = ce(),
      g = R(null),
      c = R(!1),
      n = R(!1),
      d = R(null),
      u = R({
        justificacion: '',
        proposito_general: '',
        competencias: { global_especifica: '', competencia_asignatura: '' },
        elementos_competencia: [],
        metodologia_general: '',
        reglamento_normativa: { clase: '', laboratorio: '' },
      }),
      I = ['DOCENTE', 'DIRECTOR_CARRERA', 'ADMIN', 'SUPER_ADMIN'],
      p = ['DIRECCION_ACADEMICA', 'VICERRECTOR_SEDE', 'VICERRECTOR_NACIONAL'],
      $ = S(() => {
        const i = l.rol
        return I.includes(i)
      }),
      b = S(() => {
        const i = l.rol
        return p.includes(i)
      }),
      D = S(() => {
        if (!g.value) return []
        const i = t.materiasExterno?.find((m) => m.id === g.value || m.codigo === g.value)
        return i?.grupos
          ? i.grupos.map((m) => ({
              dia: m.dia,
              horaInicio: m.hora_inicio,
              horaFin: m.hora_fin,
              aula: m.aula || '',
              bloque: m.bloque || '',
              grupo: m.grupo,
              tipoClase: m.tipo_clase,
              docente: m.docente,
            }))
          : []
      }),
      T = S(() => {
        if (!g.value) return null
        const i = t.materiasExterno?.find((m) => m.id === g.value || m.codigo === g.value)
        return i
          ? {
              carrera: i.carrera,
              asignatura: i.nombre,
              codigo: i.codigo,
              semestre: i.semestre,
              sede: i.sede_nombre,
              gestion: i.gestion,
            }
          : null
      })
    async function N(i) {
      ;((c.value = !0), (d.value = null), (g.value = i))
      try {
        t.materiasExterno?.length || (await t.fetchGruposExterno())
        const m = await J.getPrograma(i)
        return (
          m.data &&
            (u.value = {
              justificacion: m.data.justificacion || '',
              proposito_general: m.data.proposito_general || '',
              competencias: m.data.competencias || {
                global_especifica: '',
                competencia_asignatura: '',
              },
              elementos_competencia: m.data.elementos_competencia || [],
              reglamento_normativa: m.data.reglamento_normativa || { clase: '', laboratorio: '' },
              sistema_evaluacion: m.data.sistema_evaluacion || {
                intro: '',
                diagnostica: '',
                formativa: '',
                sumativa: '',
                ponderacion: '',
                final: '',
              },
              organizacion_calendario: m.data.organizacion_calendario || '',
              bibliografia_complementaria: m.data.bibliografia_complementaria || [],
            }),
          m.data
        )
      } catch (m) {
        ;(console.error('Error cargando programa:', m),
          (d.value = m.message || 'Error al cargar programa'))
      } finally {
        c.value = !1
      }
    }
    async function M() {
      if (!g.value) throw new Error('No hay asignatura seleccionada')
      if (!$.value) throw new Error('No tiene permisos para editar')
      ;((n.value = !0), (d.value = null))
      try {
        return (await J.saveProgramaCompleto(g.value, u.value), !0)
      } catch (i) {
        throw (
          console.error('Error guardando programa:', i),
          (d.value = i.message || 'Error al guardar programa'),
          i
        )
      } finally {
        n.value = !1
      }
    }
    function F() {
      const i = u.value.elementos_competencia.length + 1
      u.value.elementos_competencia.push({ codigo: `E.C.${i}`, descripcion: '' })
    }
    function x(i) {
      ;(u.value.elementos_competencia.splice(i, 1),
        u.value.elementos_competencia.forEach((m, W) => {
          m.codigo = `E.C.${W + 1}`
        }))
    }
    function e() {
      u.value.bibliografia_complementaria.push({
        autor: '',
        titulo: '',
        editorial: '',
        anio: '',
        edicion: '',
      })
    }
    function s(i) {
      u.value.bibliografia_complementaria.splice(i, 1)
    }
    function q() {
      ;((g.value = null),
        (u.value = {
          justificacion: '',
          proposito_general: '',
          competencias: { global_especifica: '', competencia_asignatura: '' },
          elementos_competencia: [],
          metodologia_general: '',
          sistema_evaluacion: { diagnostica: '', formativa: '', sumativa: '' },
          organizacion_calendario: '',
          bibliografia_complementaria: [],
        }),
        (d.value = null))
    }
    return {
      asignaturaId: g,
      loading: c,
      guardando: n,
      error: d,
      programa: u,
      puedeEditar: $,
      esSoloLectura: b,
      horariosMateria: D,
      datosGenerales: T,
      cargarPrograma: N,
      guardarPrograma: M,
      agregarElementoCompetencia: F,
      eliminarElementoCompetencia: x,
      agregarBibliografiaComplementaria: e,
      eliminarBibliografiaComplementaria: s,
      limpiar: q,
    }
  })
H.prototype.autoTable = function (l) {
  return A(this, l)
}
function pe(l) {
  try {
    const t = new H({ orientation: 'portrait', unit: 'mm', format: 'letter' }),
      g = t.internal.pageSize.getWidth(),
      c = 15
    let n = 15
    ;(t.setFontSize(14),
      t.setFont('helvetica', 'bold'),
      t.text('UNIVERSIDAD TECNICA PRIVADA COSMOS', g / 2, n, { align: 'center' }),
      (n += 6),
      t.setFontSize(16),
      t.text('UNITEPC', g / 2, n, { align: 'center' }),
      (n += 10),
      t.setFontSize(14),
      t.text('PROGRAMA DE ASIGNATURA', g / 2, n, { align: 'center' }),
      (n += 10))
    let d = 'Por asignar'
    l.docentes &&
      l.docentes.length > 0 &&
      (d = l.docentes.map((b) => b.nombre_completo || 'Sin nombre').join(', '))
    const u =
      typeof l.carrera == 'object' ? l.carrera.nombre || 'Sin Carrera' : l.carrera || 'Sin Carrera'
    ;(A(t, {
      startY: n,
      margin: { left: c, right: c },
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' },
      head: [['DATOS GENERALES DE LA ASIGNATURA']],
      body: [
        [`Asignatura: ${l.nombre}`],
        [`Codigo: ${l.codigo}`],
        [`Carrera: ${u}`],
        [`Semestre: ${l.semestre}`],
        [
          `Horas Teoricas: ${l.horas_teoricas} | Horas Practicas: ${l.horas_practicas} | Horas Laboratorio: ${l.horas_laboratorio || 0}`,
        ],
        [`Creditos: ${l.creditos}`],
        [`Docente: ${d}`],
      ],
    }),
      (n = t.lastAutoTable.finalY + 5),
      A(t, {
        startY: n,
        margin: { left: c, right: c },
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' },
        head: [['JUSTIFICACION']],
        body: [[l.justificacion || '']],
      }),
      (n = t.lastAutoTable.finalY + 5),
      A(t, {
        startY: n,
        margin: { left: c, right: c },
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' },
        head: [['OBJETIVO GENERAL']],
        body: [[l.objetivo_general || '']],
      }),
      (n = t.lastAutoTable.finalY + 5),
      A(t, {
        startY: n,
        margin: { left: c, right: c },
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' },
        head: [['SABERES PREVIOS']],
        body: [[l.saberes_previos || '']],
      }),
      (n = t.lastAutoTable.finalY + 5),
      t.addPage(),
      (n = 15),
      A(t, {
        startY: n,
        margin: { left: c, right: c },
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' },
        head: [['CONTENIDO MINIMO']],
        body: [[l.contenido_minimo || '']],
      }),
      (n = t.lastAutoTable.finalY + 5),
      t.setFontSize(12),
      t.setFont('helvetica', 'bold'),
      t.text('UNIDADES DE APRENDIZAJE', c, n + 5),
      (n += 10),
      (l.unidades || []).forEach((b) => {
        ;(n > 240 && (t.addPage(), (n = 15)),
          A(t, {
            startY: n,
            margin: { left: c, right: c },
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [100, 100, 200], textColor: 255, fontStyle: 'bold' },
            head: [[`UNIDAD ${b.numero}: ${b.titulo}`]],
            body: [
              [`Elemento de Competencia: ${b.elemento_competencia || ''}`],
              [`Horas: ${b.horas || ''}`],
            ],
          }),
          (n = t.lastAutoTable.finalY))
        const D = b.temas || []
        if (D.length > 0) {
          const T = D.map((N) => [`Tema ${N.numero}: ${N.titulo}`])
          ;(A(t, {
            startY: n,
            margin: { left: c + 5, right: c },
            theme: 'plain',
            styles: { fontSize: 8, cellPadding: 2 },
            body: T,
          }),
            (n = t.lastAutoTable.finalY + 3))
        }
        n += 3
      }),
      n > 200 && (t.addPage(), (n = 15)))
    const p = l.bibliografias || []
    p.length > 0 &&
      A(t, {
        startY: n,
        margin: { left: c, right: c },
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' },
        head: [['BIBLIOGRAFIA']],
        body: p.map((b) => [
          `${b.autor} (${b.anio}). ${b.titulo}. ${b.editorial}. ${b.edicion || ''}`,
        ]),
      })
    const $ = 'Programa_Asignatura_' + (l.codigo || 'ASIG').replace(/[^a-zA-Z0-9]/g, '_') + '.pdf'
    return (t.save($), t)
  } catch (t) {
    throw (console.error('Error generando Programa de Asignatura:', t), t)
  }
}
const ge = { class: 'row items-center q-mb-lg animate-in' },
  fe = { class: 'col' },
  ve = { class: 'q-ma-none text-weight-bold' },
  be = { class: 'q-ma-none q-mt-xs', style: { color: 'var(--text-secondary)' } },
  _e = { class: 'col-auto row q-gutter-sm' },
  ye = { class: 'row items-center' },
  xe = { class: 'row q-col-gutter-md' },
  he = { class: 'col-12 col-md-4' },
  Ce = { class: 'col-12 col-md-4' },
  Ee = { class: 'col-12 col-md-2' },
  qe = { class: 'col-12 col-md-2' },
  we = { class: 'row items-center' },
  Ae = { class: 'row q-col-gutter-sm' },
  Se = { key: 0, class: 'q-ml-xs' },
  Ve = { class: 'q-mb-xl' },
  Pe = { class: 'row items-center q-mb-md' },
  ze = { class: 'row items-center q-mb-md' },
  Ie = { class: 'q-mb-xl' },
  $e = { class: 'row items-center q-mb-md' },
  De = { class: 'row q-col-gutter-lg' },
  Ne = { class: 'col-12' },
  ke = { class: 'col-12' },
  Ue = { class: 'row items-center justify-between q-mb-md' },
  Re = { class: 'row items-center' },
  Te = { key: 0, class: 'text-center q-pa-lg text-grey-6' },
  Qe = { class: 'q-mb-xl' },
  je = { class: 'row items-center q-mb-md' },
  Be = { class: 'q-mb-xl' },
  Oe = { class: 'row items-center q-mb-md' },
  Me = { class: 'q-mb-md' },
  Fe = {
    class: 'q-pa-md bg-grey-1 rounded-borders border-grey-4',
    style: { 'white-space': 'pre-wrap' },
  },
  Ge = { key: 0 },
  Le = {
    class: 'q-pa-md bg-grey-1 rounded-borders border-grey-4',
    style: { 'white-space': 'pre-wrap' },
  },
  Ye = { class: 'row items-center q-mb-md' },
  Je = {
    class: 'q-pa-md bg-grey-1 rounded-borders border-grey-4',
    style: { 'white-space': 'pre-wrap' },
  },
  He = { class: 'row items-center q-mb-md' },
  We = { class: 'q-mb-md' },
  Ze = { class: 'q-pa-sm bg-grey-1 rounded-borders border-grey-4' },
  Ke = { class: 'row q-col-gutter-lg q-mb-md' },
  Xe = { class: 'col-12 col-md-4' },
  ea = { class: 'col-12 col-md-4' },
  aa = { class: 'col-12 col-md-4' },
  oa = { class: 'q-mb-md' },
  ta = {
    class: 'q-pa-md bg-grey-1 rounded-borders border-grey-4',
    style: { 'white-space': 'pre-wrap', 'font-family': 'monospace' },
  },
  la = { class: 'q-pa-sm bg-grey-1 rounded-borders border-grey-4' },
  ra = { class: 'row items-center justify-between q-mb-md' },
  sa = { class: 'row items-center' },
  ia = { key: 0, class: 'text-center q-pa-lg text-grey-6' },
  na = { key: 1, class: 'row q-col-gutter-md' },
  da = { class: 'row q-col-gutter-sm items-center' },
  ca = { class: 'col-12 col-md-3' },
  ma = { class: 'col-12 col-md-4' },
  ua = { class: 'col-12 col-md-2' },
  pa = { class: 'col-6 col-md-1' },
  ga = { class: 'col-6 col-md-1' },
  fa = { key: 0, class: 'col-auto' },
  va = {
    __name: 'ProgramaAsignaturaPage',
    setup(l) {
      const t = ee(),
        g = ae(),
        c = ue(),
        n = R('justificacion'),
        d = S(() => c.programa),
        u = S(() => c.datosGenerales || { carrera: '', asignatura: '', codigo: '', semestre: '' }),
        I = S(() => c.horariosMateria),
        p = S(() => c.esSoloLectura),
        $ = S(() => c.guardando)
      function b() {
        c.agregarElementoCompetencia()
      }
      function D(x) {
        c.eliminarElementoCompetencia(x)
      }
      function T() {
        c.agregarBibliografiaComplementaria()
      }
      function N(x) {
        c.eliminarBibliografiaComplementaria(x)
      }
      async function M() {
        try {
          ;(await c.guardarPrograma(),
            g.notify({
              type: 'positive',
              message: 'Programa guardado correctamente',
              icon: 'check_circle',
            }))
        } catch (x) {
          g.notify({ type: 'negative', message: 'Error al guardar: ' + x.message, icon: 'error' })
        }
      }
      function F() {
        try {
          ;(pe({ ...u.value, programa: d.value, horarios: I.value }),
            g.notify({
              type: 'positive',
              message: 'PDF generado correctamente',
              icon: 'picture_as_pdf',
            }))
        } catch (x) {
          g.notify({
            type: 'negative',
            message: 'Error al generar PDF: ' + x.message,
            icon: 'error',
          })
        }
      }
      return (
        oe(async () => {
          const x = t.params.id
          if (x)
            try {
              await c.cargarPrograma(x)
            } catch (e) {
              console.error('Error cargando programa:', e)
            }
        }),
        (x, e) => (
          v(),
          V(
            de,
            { class: 'q-pa-lg' },
            {
              default: r(() => [
                o('div', ge, [
                  o('div', fe, [
                    a(
                      Z,
                      { class: 'q-mb-sm' },
                      {
                        default: r(() => [
                          a(O, { icon: 'home', to: '/' }),
                          a(O, { label: 'Documentación', to: '/documentacion' }),
                          a(O, { label: u.value?.codigo || 'Asignatura' }, null, 8, ['label']),
                          a(O, { label: 'Programa de Asignatura' }),
                        ]),
                        _: 1,
                      },
                    ),
                    o('h4', ve, [
                      a(f, {
                        name: 'description',
                        size: '36px',
                        color: 'indigo',
                        class: 'q-mr-sm',
                      }),
                      e[11] ||
                        (e[11] = o(
                          'span',
                          { class: 'text-gradient' },
                          'Programa de Asignatura',
                          -1,
                        )),
                    ]),
                    o(
                      'p',
                      be,
                      _(u.value?.asignatura || 'Cargando...') + ' • ' + _(u.value?.carrera),
                      1,
                    ),
                  ]),
                  o('div', _e, [
                    p.value
                      ? (v(),
                        V(
                          U,
                          { key: 0, color: 'orange', 'text-color': 'white', icon: 'visibility' },
                          {
                            default: r(() => [...(e[12] || (e[12] = [w(' Solo Lectura ', -1)]))]),
                            _: 1,
                          },
                        ))
                      : P('', !0),
                    a(k, {
                      outline: '',
                      color: 'green',
                      icon: 'picture_as_pdf',
                      label: 'Exportar PDF',
                      'no-caps': '',
                      onClick: F,
                    }),
                    a(
                      k,
                      {
                        unelevated: '',
                        color: 'primary',
                        icon: 'save',
                        label: 'Guardar',
                        'no-caps': '',
                        loading: $.value,
                        disable: p.value,
                        onClick: M,
                      },
                      null,
                      8,
                      ['loading', 'disable'],
                    ),
                  ]),
                ]),
                a(
                  z,
                  { class: 'q-mb-lg' },
                  {
                    default: r(() => [
                      a(
                        C,
                        { class: 'bg-indigo-1' },
                        {
                          default: r(() => [
                            o('div', ye, [
                              a(f, {
                                name: 'info',
                                color: 'indigo',
                                size: '24px',
                                class: 'q-mr-sm',
                              }),
                              e[14] ||
                                (e[14] = o(
                                  'span',
                                  { class: 'text-subtitle1 text-weight-bold text-indigo-9' },
                                  '1. Datos Generales de la Asignatura',
                                  -1,
                                )),
                              a(
                                U,
                                {
                                  size: 'xs',
                                  color: 'blue-2',
                                  'text-color': 'blue-9',
                                  dense: '',
                                  class: 'q-ml-sm',
                                },
                                {
                                  default: r(() => [
                                    ...(e[13] || (e[13] = [w('API Externa', -1)])),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                          ]),
                          _: 1,
                        },
                      ),
                      a(C, null, {
                        default: r(() => [
                          o('div', xe, [
                            o('div', he, [
                              a(
                                y,
                                {
                                  modelValue: u.value.carrera,
                                  'onUpdate:modelValue':
                                    e[0] || (e[0] = (s) => (u.value.carrera = s)),
                                  label: 'Carrera',
                                  outlined: '',
                                  dense: '',
                                  readonly: '',
                                },
                                null,
                                8,
                                ['modelValue'],
                              ),
                            ]),
                            o('div', Ce, [
                              a(
                                y,
                                {
                                  modelValue: u.value.asignatura,
                                  'onUpdate:modelValue':
                                    e[1] || (e[1] = (s) => (u.value.asignatura = s)),
                                  label: 'Asignatura',
                                  outlined: '',
                                  dense: '',
                                  readonly: '',
                                },
                                null,
                                8,
                                ['modelValue'],
                              ),
                            ]),
                            o('div', Ee, [
                              a(
                                y,
                                {
                                  modelValue: u.value.codigo,
                                  'onUpdate:modelValue':
                                    e[2] || (e[2] = (s) => (u.value.codigo = s)),
                                  label: 'Código',
                                  outlined: '',
                                  dense: '',
                                  readonly: '',
                                },
                                null,
                                8,
                                ['modelValue'],
                              ),
                            ]),
                            o('div', qe, [
                              a(
                                y,
                                {
                                  modelValue: u.value.semestre,
                                  'onUpdate:modelValue':
                                    e[3] || (e[3] = (s) => (u.value.semestre = s)),
                                  label: 'Semestre',
                                  outlined: '',
                                  dense: '',
                                  readonly: '',
                                },
                                null,
                                8,
                                ['modelValue'],
                              ),
                            ]),
                          ]),
                        ]),
                        _: 1,
                      }),
                    ]),
                    _: 1,
                  },
                ),
                I.value.length
                  ? (v(),
                    V(
                      z,
                      { key: 0, class: 'q-mb-lg' },
                      {
                        default: r(() => [
                          a(
                            C,
                            { class: 'bg-teal-1' },
                            {
                              default: r(() => [
                                o('div', we, [
                                  a(f, {
                                    name: 'schedule',
                                    color: 'teal',
                                    size: '24px',
                                    class: 'q-mr-sm',
                                  }),
                                  e[16] ||
                                    (e[16] = o(
                                      'span',
                                      { class: 'text-subtitle1 text-weight-bold text-teal-9' },
                                      'Horario de Clases',
                                      -1,
                                    )),
                                  a(
                                    U,
                                    {
                                      size: 'xs',
                                      color: 'blue-2',
                                      'text-color': 'blue-9',
                                      dense: '',
                                      class: 'q-ml-sm',
                                    },
                                    {
                                      default: r(() => [
                                        ...(e[15] || (e[15] = [w('API Externa', -1)])),
                                      ]),
                                      _: 1,
                                    },
                                  ),
                                ]),
                              ]),
                              _: 1,
                            },
                          ),
                          a(C, null, {
                            default: r(() => [
                              o('div', Ae, [
                                (v(!0),
                                E(
                                  G,
                                  null,
                                  L(
                                    I.value,
                                    (s, q) => (
                                      v(),
                                      E('div', { key: q, class: 'col-auto' }, [
                                        a(
                                          U,
                                          { color: 'teal-2', 'text-color': 'teal-9' },
                                          {
                                            default: r(() => [
                                              a(f, { name: 'event', class: 'q-mr-xs' }),
                                              w(
                                                ' ' +
                                                  _(s.dia) +
                                                  ' ' +
                                                  _(s.horaInicio) +
                                                  '-' +
                                                  _(s.horaFin) +
                                                  ' ',
                                                1,
                                              ),
                                              s.aula
                                                ? (v(), E('span', Se, '(' + _(s.aula) + ')', 1))
                                                : P('', !0),
                                            ]),
                                            _: 2,
                                          },
                                          1024,
                                        ),
                                      ])
                                    ),
                                  ),
                                  128,
                                )),
                              ]),
                            ]),
                            _: 1,
                          }),
                        ]),
                        _: 1,
                      },
                    ))
                  : P('', !0),
                a(
                  z,
                  { class: 'card-main' },
                  {
                    default: r(() => [
                      a(
                        re,
                        {
                          modelValue: n.value,
                          'onUpdate:modelValue': e[4] || (e[4] = (s) => (n.value = s)),
                          dense: '',
                          class: 'text-grey',
                          'active-color': 'indigo',
                          'indicator-color': 'indigo',
                          align: 'left',
                        },
                        {
                          default: r(() => [
                            a(Q, {
                              name: 'justificacion',
                              icon: 'article',
                              label: 'Justificación',
                              'no-caps': '',
                            }),
                            a(Q, {
                              name: 'competencias',
                              icon: 'emoji_events',
                              label: 'Competencias',
                              'no-caps': '',
                            }),
                            a(Q, {
                              name: 'metodologia',
                              icon: 'psychology',
                              label: 'Metodología',
                              'no-caps': '',
                            }),
                            a(Q, {
                              name: 'evaluacion',
                              icon: 'grading',
                              label: 'Evaluación',
                              'no-caps': '',
                            }),
                            a(Q, {
                              name: 'bibliografia',
                              icon: 'menu_book',
                              label: 'Bibliografía',
                              'no-caps': '',
                            }),
                          ]),
                          _: 1,
                        },
                        8,
                        ['modelValue'],
                      ),
                      a(te),
                      a(
                        se,
                        {
                          modelValue: n.value,
                          'onUpdate:modelValue': e[10] || (e[10] = (s) => (n.value = s)),
                          animated: '',
                          class: 'bg-transparent',
                        },
                        {
                          default: r(() => [
                            a(
                              B,
                              { name: 'justificacion', class: 'q-pa-lg' },
                              {
                                default: r(() => [
                                  a(
                                    j,
                                    {
                                      class: 'bg-purple-1 text-purple-9 q-mb-md rounded-borders',
                                      dense: '',
                                    },
                                    le(
                                      {
                                        avatar: r(() => [
                                          a(f, { name: 'groups', color: 'purple' }),
                                        ]),
                                        default: r(() => [
                                          e[18] ||
                                            (e[18] = o(
                                              'span',
                                              { class: 'text-weight-medium' },
                                              'Campo Compartido (Materia)',
                                              -1,
                                            )),
                                        ]),
                                        _: 2,
                                      },
                                      [
                                        p.value
                                          ? {
                                              name: 'action',
                                              fn: r(() => [
                                                a(
                                                  U,
                                                  {
                                                    color: 'orange',
                                                    'text-color': 'white',
                                                    size: 'sm',
                                                    icon: 'visibility',
                                                  },
                                                  {
                                                    default: r(() => [
                                                      ...(e[17] ||
                                                        (e[17] = [w('Solo lectura', -1)])),
                                                    ]),
                                                    _: 1,
                                                  },
                                                ),
                                              ]),
                                              key: '0',
                                            }
                                          : void 0,
                                      ],
                                    ),
                                    1024,
                                  ),
                                  o('div', Ve, [
                                    o('div', Pe, [
                                      a(f, {
                                        name: 'article',
                                        color: 'indigo',
                                        size: '28px',
                                        class: 'q-mr-sm',
                                      }),
                                      e[19] ||
                                        (e[19] = o(
                                          'span',
                                          { class: 'text-h6 text-weight-bold' },
                                          '3. Justificación de la Asignatura',
                                          -1,
                                        )),
                                    ]),
                                    a(
                                      y,
                                      {
                                        modelValue: d.value.justificacion,
                                        'onUpdate:modelValue':
                                          e[5] || (e[5] = (s) => (d.value.justificacion = s)),
                                        outlined: '',
                                        type: 'textarea',
                                        rows: '5',
                                        readonly: p.value,
                                        placeholder:
                                          'Describe la importancia y justificación de la asignatura en el plan de estudios...',
                                        hint: 'Explica por qué esta asignatura es fundamental para la formación del estudiante',
                                      },
                                      null,
                                      8,
                                      ['modelValue', 'readonly'],
                                    ),
                                  ]),
                                  o('div', null, [
                                    o('div', ze, [
                                      a(f, {
                                        name: 'flag',
                                        color: 'green',
                                        size: '28px',
                                        class: 'q-mr-sm',
                                      }),
                                      e[20] ||
                                        (e[20] = o(
                                          'span',
                                          { class: 'text-h6 text-weight-bold' },
                                          '4. Propósito General de la Unidad de Formación',
                                          -1,
                                        )),
                                    ]),
                                    a(
                                      y,
                                      {
                                        modelValue: d.value.proposito_general,
                                        'onUpdate:modelValue':
                                          e[6] || (e[6] = (s) => (d.value.proposito_general = s)),
                                        outlined: '',
                                        type: 'textarea',
                                        rows: '5',
                                        readonly: p.value,
                                        placeholder:
                                          'Describe el propósito general que el estudiante alcanzará...',
                                        hint: 'El estudiante será capaz de...',
                                      },
                                      null,
                                      8,
                                      ['modelValue', 'readonly'],
                                    ),
                                  ]),
                                ]),
                                _: 1,
                              },
                            ),
                            a(
                              B,
                              { name: 'competencias', class: 'q-pa-lg' },
                              {
                                default: r(() => [
                                  a(
                                    j,
                                    {
                                      class: 'bg-purple-1 text-purple-9 q-mb-md rounded-borders',
                                      dense: '',
                                    },
                                    {
                                      avatar: r(() => [a(f, { name: 'groups', color: 'purple' })]),
                                      default: r(() => [
                                        e[21] ||
                                          (e[21] = o(
                                            'span',
                                            { class: 'text-weight-medium' },
                                            'Campo Compartido (Materia)',
                                            -1,
                                          )),
                                      ]),
                                      _: 1,
                                    },
                                  ),
                                  o('div', Ie, [
                                    o('div', $e, [
                                      a(f, {
                                        name: 'emoji_events',
                                        color: 'amber',
                                        size: '28px',
                                        class: 'q-mr-sm',
                                      }),
                                      e[22] ||
                                        (e[22] = o(
                                          'span',
                                          { class: 'text-h6 text-weight-bold' },
                                          '5. Competencias',
                                          -1,
                                        )),
                                    ]),
                                    o('div', De, [
                                      o('div', Ne, [
                                        a(
                                          y,
                                          {
                                            modelValue: d.value.competencias.global_especifica,
                                            'onUpdate:modelValue':
                                              e[7] ||
                                              (e[7] = (s) =>
                                                (d.value.competencias.global_especifica = s)),
                                            outlined: '',
                                            type: 'textarea',
                                            rows: '3',
                                            readonly: p.value,
                                            label: 'Competencia Global/Específica',
                                            placeholder:
                                              'Proporciona atención médica integral, basada en evidencia científica...',
                                          },
                                          null,
                                          8,
                                          ['modelValue', 'readonly'],
                                        ),
                                      ]),
                                      o('div', ke, [
                                        a(
                                          y,
                                          {
                                            modelValue: d.value.competencias.competencia_asignatura,
                                            'onUpdate:modelValue':
                                              e[8] ||
                                              (e[8] = (s) =>
                                                (d.value.competencias.competencia_asignatura = s)),
                                            outlined: '',
                                            type: 'textarea',
                                            rows: '3',
                                            readonly: p.value,
                                            label: 'Competencia de la Asignatura',
                                            placeholder:
                                              'Identifica la organización general del cuerpo humano...',
                                          },
                                          null,
                                          8,
                                          ['modelValue', 'readonly'],
                                        ),
                                      ]),
                                    ]),
                                  ]),
                                  o('div', null, [
                                    o('div', Ue, [
                                      o('div', Re, [
                                        a(f, {
                                          name: 'checklist',
                                          color: 'blue',
                                          size: '28px',
                                          class: 'q-mr-sm',
                                        }),
                                        e[23] ||
                                          (e[23] = o(
                                            'span',
                                            { class: 'text-h6 text-weight-bold' },
                                            '6. Elementos de Competencia',
                                            -1,
                                          )),
                                      ]),
                                      p.value
                                        ? P('', !0)
                                        : (v(),
                                          V(k, {
                                            key: 0,
                                            unelevated: '',
                                            color: 'blue',
                                            icon: 'add',
                                            label: 'Agregar E.C.',
                                            size: 'sm',
                                            'no-caps': '',
                                            onClick: b,
                                          })),
                                    ]),
                                    d.value.elementos_competencia.length
                                      ? (v(),
                                        V(
                                          ne,
                                          { key: 1, separator: '' },
                                          {
                                            default: r(() => [
                                              (v(!0),
                                              E(
                                                G,
                                                null,
                                                L(
                                                  d.value.elementos_competencia,
                                                  (s, q) => (
                                                    v(),
                                                    V(
                                                      ie,
                                                      { key: q, class: 'q-pa-md' },
                                                      {
                                                        default: r(() => [
                                                          a(
                                                            Y,
                                                            { avatar: '' },
                                                            {
                                                              default: r(() => [
                                                                a(
                                                                  U,
                                                                  {
                                                                    color: 'blue',
                                                                    'text-color': 'white',
                                                                    dense: '',
                                                                  },
                                                                  {
                                                                    default: r(() => [
                                                                      w(_(s.codigo), 1),
                                                                    ]),
                                                                    _: 2,
                                                                  },
                                                                  1024,
                                                                ),
                                                              ]),
                                                              _: 2,
                                                            },
                                                            1024,
                                                          ),
                                                          a(
                                                            Y,
                                                            null,
                                                            {
                                                              default: r(() => [
                                                                a(
                                                                  y,
                                                                  {
                                                                    modelValue: s.descripcion,
                                                                    'onUpdate:modelValue': (i) =>
                                                                      (s.descripcion = i),
                                                                    outlined: '',
                                                                    dense: '',
                                                                    readonly: p.value,
                                                                    placeholder:
                                                                      'Describe el elemento de competencia...',
                                                                  },
                                                                  null,
                                                                  8,
                                                                  [
                                                                    'modelValue',
                                                                    'onUpdate:modelValue',
                                                                    'readonly',
                                                                  ],
                                                                ),
                                                              ]),
                                                              _: 2,
                                                            },
                                                            1024,
                                                          ),
                                                          p.value
                                                            ? P('', !0)
                                                            : (v(),
                                                              V(
                                                                Y,
                                                                { key: 0, side: '' },
                                                                {
                                                                  default: r(() => [
                                                                    a(
                                                                      k,
                                                                      {
                                                                        flat: '',
                                                                        round: '',
                                                                        dense: '',
                                                                        icon: 'delete',
                                                                        color: 'red',
                                                                        onClick: (i) => D(q),
                                                                      },
                                                                      null,
                                                                      8,
                                                                      ['onClick'],
                                                                    ),
                                                                  ]),
                                                                  _: 2,
                                                                },
                                                                1024,
                                                              )),
                                                        ]),
                                                        _: 2,
                                                      },
                                                      1024,
                                                    )
                                                  ),
                                                ),
                                                128,
                                              )),
                                            ]),
                                            _: 1,
                                          },
                                        ))
                                      : (v(),
                                        E('div', Te, [
                                          a(f, { name: 'playlist_add', size: '48px' }),
                                          e[24] ||
                                            (e[24] = o(
                                              'p',
                                              null,
                                              'No hay elementos de competencia. Agrega el primero.',
                                              -1,
                                            )),
                                        ])),
                                  ]),
                                ]),
                                _: 1,
                              },
                            ),
                            a(
                              B,
                              { name: 'metodologia', class: 'q-pa-lg' },
                              {
                                default: r(() => [
                                  a(
                                    j,
                                    {
                                      class: 'bg-purple-1 text-purple-9 q-mb-md rounded-borders',
                                      dense: '',
                                    },
                                    {
                                      avatar: r(() => [a(f, { name: 'groups', color: 'purple' })]),
                                      default: r(() => [
                                        e[25] ||
                                          (e[25] = o(
                                            'span',
                                            { class: 'text-weight-medium' },
                                            'Campo Compartido (Materia)',
                                            -1,
                                          )),
                                      ]),
                                      _: 1,
                                    },
                                  ),
                                  o('div', Qe, [
                                    o('div', je, [
                                      a(f, {
                                        name: 'psychology',
                                        color: 'purple',
                                        size: '28px',
                                        class: 'q-mr-sm',
                                      }),
                                      e[26] ||
                                        (e[26] = o(
                                          'span',
                                          { class: 'text-h6 text-weight-bold' },
                                          '9. Metodología General de la Asignatura',
                                          -1,
                                        )),
                                    ]),
                                    a(
                                      y,
                                      {
                                        modelValue: d.value.metodologia_general,
                                        'onUpdate:modelValue':
                                          e[9] || (e[9] = (s) => (d.value.metodologia_general = s)),
                                        outlined: '',
                                        type: 'textarea',
                                        rows: '5',
                                        readonly: p.value,
                                        placeholder:
                                          'La metodología pedagógica será variada, basada en competencias...',
                                        hint: 'Describe las técnicas y métodos de enseñanza-aprendizaje',
                                      },
                                      null,
                                      8,
                                      ['modelValue', 'readonly'],
                                    ),
                                  ]),
                                  o('div', Be, [
                                    o('div', Oe, [
                                      a(f, {
                                        name: 'gavel',
                                        color: 'primary',
                                        size: '28px',
                                        class: 'q-mr-sm',
                                      }),
                                      e[27] ||
                                        (e[27] = o(
                                          'span',
                                          { class: 'text-h6 text-weight-bold' },
                                          '12. Criterios y Normativa de la Asignatura',
                                          -1,
                                        )),
                                    ]),
                                    o('div', Me, [
                                      e[28] ||
                                        (e[28] = o(
                                          'div',
                                          { class: 'text-subtitle2 text-grey-7 q-mb-xs' },
                                          'Normas Generales de Clase:',
                                          -1,
                                        )),
                                      o(
                                        'div',
                                        Fe,
                                        _(d.value.reglamento_normativa.clase || 'No definido'),
                                        1,
                                      ),
                                    ]),
                                    d.value.reglamento_normativa.laboratorio
                                      ? (v(),
                                        E('div', Ge, [
                                          e[29] ||
                                            (e[29] = o(
                                              'div',
                                              { class: 'text-subtitle2 text-grey-7 q-mb-xs' },
                                              ' Normas de Laboratorio / Práctica: ',
                                              -1,
                                            )),
                                          o(
                                            'div',
                                            Le,
                                            _(d.value.reglamento_normativa.laboratorio),
                                            1,
                                          ),
                                        ]))
                                      : P('', !0),
                                  ]),
                                  o('div', null, [
                                    o('div', Ye, [
                                      a(f, {
                                        name: 'calendar_month',
                                        color: 'teal',
                                        size: '28px',
                                        class: 'q-mr-sm',
                                      }),
                                      e[30] ||
                                        (e[30] = o(
                                          'span',
                                          { class: 'text-h6 text-weight-bold' },
                                          '13. Organización y Calendario',
                                          -1,
                                        )),
                                    ]),
                                    o(
                                      'div',
                                      Je,
                                      _(
                                        d.value.organizacion_calendario ||
                                          'Cronograma a definir por el docente',
                                      ),
                                      1,
                                    ),
                                  ]),
                                ]),
                                _: 1,
                              },
                            ),
                            a(
                              B,
                              { name: 'evaluacion', class: 'q-pa-lg' },
                              {
                                default: r(() => [
                                  a(
                                    j,
                                    {
                                      class: 'bg-purple-1 text-purple-9 q-mb-md rounded-borders',
                                      dense: '',
                                    },
                                    {
                                      avatar: r(() => [a(f, { name: 'groups', color: 'purple' })]),
                                      default: r(() => [
                                        e[31] ||
                                          (e[31] = o(
                                            'span',
                                            { class: 'text-weight-medium' },
                                            'Campo Compartido (Materia)',
                                            -1,
                                          )),
                                      ]),
                                      _: 1,
                                    },
                                  ),
                                  o('div', He, [
                                    a(f, {
                                      name: 'grading',
                                      color: 'orange',
                                      size: '28px',
                                      class: 'q-mr-sm',
                                    }),
                                    e[32] ||
                                      (e[32] = o(
                                        'span',
                                        { class: 'text-h6 text-weight-bold' },
                                        '10. Sistema de Evaluación',
                                        -1,
                                      )),
                                  ]),
                                  o('div', We, [
                                    e[33] ||
                                      (e[33] = o(
                                        'div',
                                        { class: 'text-subtitle2 text-grey-7 q-mb-xs' },
                                        'Introducción:',
                                        -1,
                                      )),
                                    o('div', Ze, _(d.value.sistema_evaluacion.intro), 1),
                                  ]),
                                  o('div', Ke, [
                                    o('div', Xe, [
                                      a(
                                        z,
                                        { flat: '', bordered: '' },
                                        {
                                          default: r(() => [
                                            a(
                                              C,
                                              { class: 'bg-blue-1' },
                                              {
                                                default: r(() => [
                                                  ...(e[34] ||
                                                    (e[34] = [
                                                      o(
                                                        'span',
                                                        {
                                                          class:
                                                            'text-subtitle1 text-weight-bold text-blue-9',
                                                        },
                                                        'Evaluación Diagnóstica',
                                                        -1,
                                                      ),
                                                    ])),
                                                ]),
                                                _: 1,
                                              },
                                            ),
                                            a(
                                              C,
                                              {
                                                class: 'q-pa-sm',
                                                style: { 'white-space': 'pre-wrap' },
                                              },
                                              {
                                                default: r(() => [
                                                  w(_(d.value.sistema_evaluacion.diagnostica), 1),
                                                ]),
                                                _: 1,
                                              },
                                            ),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                    ]),
                                    o('div', ea, [
                                      a(
                                        z,
                                        { flat: '', bordered: '' },
                                        {
                                          default: r(() => [
                                            a(
                                              C,
                                              { class: 'bg-green-1' },
                                              {
                                                default: r(() => [
                                                  ...(e[35] ||
                                                    (e[35] = [
                                                      o(
                                                        'span',
                                                        {
                                                          class:
                                                            'text-subtitle1 text-weight-bold text-green-9',
                                                        },
                                                        'Evaluación Formativa',
                                                        -1,
                                                      ),
                                                    ])),
                                                ]),
                                                _: 1,
                                              },
                                            ),
                                            a(
                                              C,
                                              {
                                                class: 'q-pa-sm',
                                                style: { 'white-space': 'pre-wrap' },
                                              },
                                              {
                                                default: r(() => [
                                                  w(_(d.value.sistema_evaluacion.formativa), 1),
                                                ]),
                                                _: 1,
                                              },
                                            ),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                    ]),
                                    o('div', aa, [
                                      a(
                                        z,
                                        { flat: '', bordered: '' },
                                        {
                                          default: r(() => [
                                            a(
                                              C,
                                              { class: 'bg-orange-1' },
                                              {
                                                default: r(() => [
                                                  ...(e[36] ||
                                                    (e[36] = [
                                                      o(
                                                        'span',
                                                        {
                                                          class:
                                                            'text-subtitle1 text-weight-bold text-orange-9',
                                                        },
                                                        'Evaluación Sumativa',
                                                        -1,
                                                      ),
                                                    ])),
                                                ]),
                                                _: 1,
                                              },
                                            ),
                                            a(
                                              C,
                                              {
                                                class: 'q-pa-sm',
                                                style: { 'white-space': 'pre-wrap' },
                                              },
                                              {
                                                default: r(() => [
                                                  w(_(d.value.sistema_evaluacion.sumativa), 1),
                                                ]),
                                                _: 1,
                                              },
                                            ),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                    ]),
                                  ]),
                                  o('div', oa, [
                                    e[37] ||
                                      (e[37] = o(
                                        'div',
                                        { class: 'text-subtitle2 text-grey-7 q-mb-xs' },
                                        'Ponderación y Parámetros:',
                                        -1,
                                      )),
                                    o('div', ta, _(d.value.sistema_evaluacion.ponderacion), 1),
                                  ]),
                                  o('div', null, [
                                    e[38] ||
                                      (e[38] = o(
                                        'div',
                                        { class: 'text-subtitle2 text-grey-7 q-mb-xs' },
                                        'Aspectos de Evaluación Final:',
                                        -1,
                                      )),
                                    o('div', la, _(d.value.sistema_evaluacion.final), 1),
                                  ]),
                                ]),
                                _: 1,
                              },
                            ),
                            a(
                              B,
                              { name: 'bibliografia', class: 'q-pa-lg' },
                              {
                                default: r(() => [
                                  a(
                                    j,
                                    {
                                      class: 'bg-purple-1 text-purple-9 q-mb-md rounded-borders',
                                      dense: '',
                                    },
                                    {
                                      avatar: r(() => [a(f, { name: 'groups', color: 'purple' })]),
                                      default: r(() => [
                                        e[39] ||
                                          (e[39] = o(
                                            'span',
                                            { class: 'text-weight-medium' },
                                            'Campo Compartido (Materia)',
                                            -1,
                                          )),
                                      ]),
                                      _: 1,
                                    },
                                  ),
                                  o('div', ra, [
                                    o('div', sa, [
                                      a(f, {
                                        name: 'menu_book',
                                        color: 'indigo',
                                        size: '28px',
                                        class: 'q-mr-sm',
                                      }),
                                      e[40] ||
                                        (e[40] = o(
                                          'span',
                                          { class: 'text-h6 text-weight-bold' },
                                          '15. Bibliografía Complementaria',
                                          -1,
                                        )),
                                    ]),
                                    p.value
                                      ? P('', !0)
                                      : (v(),
                                        V(k, {
                                          key: 0,
                                          unelevated: '',
                                          color: 'indigo',
                                          icon: 'add',
                                          label: 'Agregar Referencia',
                                          size: 'sm',
                                          'no-caps': '',
                                          onClick: T,
                                        })),
                                  ]),
                                  d.value.bibliografia_complementaria.length
                                    ? (v(),
                                      E('div', na, [
                                        (v(!0),
                                        E(
                                          G,
                                          null,
                                          L(
                                            d.value.bibliografia_complementaria,
                                            (s, q) => (
                                              v(),
                                              E('div', { key: q, class: 'col-12' }, [
                                                a(
                                                  z,
                                                  { flat: '', bordered: '' },
                                                  {
                                                    default: r(() => [
                                                      a(
                                                        C,
                                                        null,
                                                        {
                                                          default: r(() => [
                                                            o('div', da, [
                                                              o('div', ca, [
                                                                a(
                                                                  y,
                                                                  {
                                                                    modelValue: s.autor,
                                                                    'onUpdate:modelValue': (i) =>
                                                                      (s.autor = i),
                                                                    outlined: '',
                                                                    dense: '',
                                                                    label: 'Autor',
                                                                    readonly: p.value,
                                                                  },
                                                                  null,
                                                                  8,
                                                                  [
                                                                    'modelValue',
                                                                    'onUpdate:modelValue',
                                                                    'readonly',
                                                                  ],
                                                                ),
                                                              ]),
                                                              o('div', ma, [
                                                                a(
                                                                  y,
                                                                  {
                                                                    modelValue: s.titulo,
                                                                    'onUpdate:modelValue': (i) =>
                                                                      (s.titulo = i),
                                                                    outlined: '',
                                                                    dense: '',
                                                                    label: 'Título',
                                                                    readonly: p.value,
                                                                  },
                                                                  null,
                                                                  8,
                                                                  [
                                                                    'modelValue',
                                                                    'onUpdate:modelValue',
                                                                    'readonly',
                                                                  ],
                                                                ),
                                                              ]),
                                                              o('div', ua, [
                                                                a(
                                                                  y,
                                                                  {
                                                                    modelValue: s.editorial,
                                                                    'onUpdate:modelValue': (i) =>
                                                                      (s.editorial = i),
                                                                    outlined: '',
                                                                    dense: '',
                                                                    label: 'Editorial',
                                                                    readonly: p.value,
                                                                  },
                                                                  null,
                                                                  8,
                                                                  [
                                                                    'modelValue',
                                                                    'onUpdate:modelValue',
                                                                    'readonly',
                                                                  ],
                                                                ),
                                                              ]),
                                                              o('div', pa, [
                                                                a(
                                                                  y,
                                                                  {
                                                                    modelValue: s.anio,
                                                                    'onUpdate:modelValue': (i) =>
                                                                      (s.anio = i),
                                                                    outlined: '',
                                                                    dense: '',
                                                                    label: 'Año',
                                                                    readonly: p.value,
                                                                  },
                                                                  null,
                                                                  8,
                                                                  [
                                                                    'modelValue',
                                                                    'onUpdate:modelValue',
                                                                    'readonly',
                                                                  ],
                                                                ),
                                                              ]),
                                                              o('div', ga, [
                                                                a(
                                                                  y,
                                                                  {
                                                                    modelValue: s.edicion,
                                                                    'onUpdate:modelValue': (i) =>
                                                                      (s.edicion = i),
                                                                    outlined: '',
                                                                    dense: '',
                                                                    label: 'Edición',
                                                                    readonly: p.value,
                                                                  },
                                                                  null,
                                                                  8,
                                                                  [
                                                                    'modelValue',
                                                                    'onUpdate:modelValue',
                                                                    'readonly',
                                                                  ],
                                                                ),
                                                              ]),
                                                              p.value
                                                                ? P('', !0)
                                                                : (v(),
                                                                  E('div', fa, [
                                                                    a(
                                                                      k,
                                                                      {
                                                                        flat: '',
                                                                        round: '',
                                                                        dense: '',
                                                                        icon: 'delete',
                                                                        color: 'red',
                                                                        onClick: (i) => N(q),
                                                                      },
                                                                      null,
                                                                      8,
                                                                      ['onClick'],
                                                                    ),
                                                                  ])),
                                                            ]),
                                                          ]),
                                                          _: 2,
                                                        },
                                                        1024,
                                                      ),
                                                    ]),
                                                    _: 2,
                                                  },
                                                  1024,
                                                ),
                                              ])
                                            ),
                                          ),
                                          128,
                                        )),
                                      ]))
                                    : (v(),
                                      E('div', ia, [
                                        a(f, { name: 'library_books', size: '48px' }),
                                        e[41] ||
                                          (e[41] = o(
                                            'p',
                                            null,
                                            'No hay bibliografía complementaria. Agrega la primera referencia.',
                                            -1,
                                          )),
                                      ])),
                                ]),
                                _: 1,
                              },
                            ),
                          ]),
                          _: 1,
                        },
                        8,
                        ['modelValue'],
                      ),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              _: 1,
            },
          )
        )
      )
    },
  },
  Na = me(va, [['__scopeId', 'data-v-34012012']])
export { Na as default }
