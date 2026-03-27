import {
  f as te,
  aB as se,
  r as c,
  P as le,
  a as re,
  aj as ie,
  i as ne,
  j as P,
  k as o,
  m as t,
  l as e,
  x as m,
  D as p,
  E as f,
  s as _,
  B as r,
  a2 as G,
  A as i,
  F as $,
  C as de,
  W as ce,
  y as E,
  a4 as ue,
} from './index-CVgKKHHv.js'
import { Q } from './QSelect-B2vk19AQ.js'
import { Q as me } from './QCircularProgress-BnUwnxy_.js'
import { Q as pe, a as C } from './QTabs-C5AuWb1j.js'
import { Q as I } from './QLinearProgress-CGVvufhy.js'
import { Q as h, a as d } from './QTable-HDg5LzBZ.js'
import { Q as R } from './QChip-g_JHqrFQ.js'
import { Q as w } from './QTooltip-xFvievHl.js'
import { Q as ve, a as D } from './QTabPanels-Dv0zYOYy.js'
import { Q as ge } from './QBadge-BSFZG2oj.js'
import { Q as fe } from './QSpace-PwS5FTKD.js'
import { Q as be } from './QBar-CTLLhrJ9.js'
import { Q as _e } from './QPage-D-YrLEJA.js'
import { C as we } from './ClosePopup-srUPe2x8.js'
import { u as ye } from './sedes-xi7lRAei.js'
import { _ as xe } from './_plugin-vue_export-helper-DlAUqK2U.js'
import './QItem-C23xClkh.js'
import './QItemLabel-wP2Wn6Fb.js'
import './QMenu-C5EVwErB.js'
import './selection-Dzil4kq6.js'
import './rtl-DFPa-2ov.js'
import './format-DyQxkAtJ.js'
import './QResizeObserver-DSbEROZH.js'
import './QList-BSXQR-9A.js'
import './use-fullscreen-DP5Hoaa-.js'
import './touch-BjYP5sR0.js'
import './use-render-cache-DLxPkVnQ.js'
const Ce = { class: 'page-header q-mb-lg' },
  he = { class: 'row items-center justify-between' },
  De = { class: 'row q-gutter-sm' },
  Se = { class: 'row q-col-gutter-md items-center' },
  Ae = { class: 'col-12 col-md-3' },
  Pe = { class: 'col-12 col-md-3' },
  Qe = { class: 'col-12 col-md-3' },
  Re = { class: 'col-12 col-md-3 flex justify-end' },
  ke = { class: 'row q-col-gutter-md q-mb-lg' },
  Ve = { class: 'col-12 col-md-3' },
  ze = { class: 'row items-center no-wrap' },
  qe = { class: 'col' },
  Te = { class: 'text-h4 text-weight-bold text-primary' },
  Ge = { class: 'col-12 col-md-3' },
  $e = { class: 'row items-center no-wrap' },
  Ee = { class: 'col' },
  Ie = { class: 'text-h4 text-weight-bold text-positive' },
  Me = { class: 'col-12 col-md-3' },
  Le = { class: 'row items-center no-wrap' },
  Be = { class: 'col' },
  Fe = { class: 'text-h4 text-weight-bold text-warning' },
  Ne = { class: 'col-12 col-md-3' },
  je = { class: 'row items-center no-wrap' },
  Ue = { class: 'col' },
  Oe = { class: 'text-h4 text-weight-bold text-info' },
  Je = { class: 'row items-center no-wrap q-gutter-sm' },
  We = { class: 'text-weight-bold' },
  He = { class: 'row items-center no-wrap q-gutter-sm' },
  Ke = { class: 'text-weight-medium' },
  Xe = { class: 'text-caption text-grey' },
  Ye = { class: 'row items-center no-wrap q-gutter-sm' },
  Ze = { class: 'text-weight-medium' },
  eo = { class: 'text-caption text-grey' },
  oo = { class: 'row items-center no-wrap q-gutter-sm' },
  ao = { class: 'text-weight-bold' },
  to = { class: 'q-ml-sm' },
  so = { class: 'text-h6 q-mb-md' },
  lo = { class: 'row q-col-gutter-md q-mb-md' },
  ro = { class: 'col-12 col-md-6' },
  io = { class: 'col-12 col-md-6' },
  no = { class: 'col-12 col-md-6' },
  co = { class: 'col-12 col-md-6' },
  uo = { class: 'q-mb-md' },
  mo = { class: 'text-grey-8' },
  po = { class: 'text-grey-8' },
  vo = { key: 1, class: 'text-grey-7' },
  go = {
    __name: 'ReportesNacionalesPage',
    setup(fo) {
      const v = te(),
        S = se(),
        k = ye(),
        y = c('sedes'),
        g = c(!1),
        n = c(null),
        V = c(null),
        u = c({ sede: 'todas', periodo: '2026-1', tipoReporte: 'todos' }),
        M = le(() => [
          { label: 'Todas las Sedes', value: 'todas' },
          ...k.sedes.map((l) => ({ label: l.nombre, value: l.id })),
        ]),
        L = [
          { label: 'Gestión 2026 - I', value: '2026-1' },
          { label: 'Gestión 2025 - II', value: '2025-2' },
          { label: 'Gestión 2025 - I', value: '2025-1' },
        ],
        B = [
          { label: 'Todos los Reportes', value: 'todos' },
          { label: 'Documentación', value: 'documentacion' },
          { label: 'Asistencias', value: 'asistencias' },
          { label: 'Avance Temático', value: 'avance' },
        ],
        b = c({ progresoGeneral: 72, sedesAlDia: 5, sedesConRetraso: 4, totalDocentes: 890 }),
        F = [
          { name: 'sede', label: 'Sede', field: 'nombre', align: 'left', sortable: !0 },
          { name: 'carreras', label: 'Carreras', field: 'carreras', align: 'center' },
          { name: 'docentes', label: 'Docentes', field: 'docentes', align: 'center' },
          { name: 'progreso', label: 'Progreso', field: 'progreso', align: 'center', sortable: !0 },
          { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
          { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
        ],
        N = [
          { name: 'director', label: 'Director', field: 'nombre', align: 'left' },
          { name: 'sede', label: 'Sede', field: 'sede', align: 'left' },
          { name: 'asignaturas', label: 'Asignaturas', field: 'asignaturas', align: 'center' },
          { name: 'docentesCargo', label: 'Docentes', field: 'docentesCargo', align: 'center' },
          {
            name: 'cumplimiento',
            label: 'Cumplimiento',
            field: 'cumplimiento',
            align: 'center',
            sortable: !0,
          },
          { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
        ],
        j = [
          { name: 'director', label: 'Director Académico', field: 'nombre', align: 'left' },
          {
            name: 'carrerasSupervision',
            label: 'Carreras',
            field: 'carrerasSupervision',
            align: 'center',
          },
          { name: 'docentesTotal', label: 'Docentes', field: 'docentesTotal', align: 'center' },
          {
            name: 'cumplimientoGeneral',
            label: 'Cumplimiento',
            field: 'cumplimientoGeneral',
            align: 'center',
            sortable: !0,
          },
          { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
        ],
        U = [
          { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: !0 },
          { name: 'semana', label: 'Semana', field: 'semana', align: 'center' },
          { name: 'asignatura', label: 'Asignatura', field: 'asignatura', align: 'left' },
          { name: 'carrera', label: 'Carrera', field: 'carrera', align: 'left' },
          { name: 'docente', label: 'Docente', field: 'docente', align: 'left' },
          { name: 'semaforo', label: 'Alerta', field: 'semaforo', align: 'center', sortable: !0 },
          { name: 'acciones', label: 'Observaciones', field: 'acciones', align: 'center' },
        ],
        O = c([
          {
            id: 1,
            nombre: 'Cochabamba',
            carreras: 12,
            docentes: 180,
            progreso: 78,
            estado: 'Al día',
          },
          { id: 2, nombre: 'La Paz', carreras: 10, docentes: 150, progreso: 72, estado: 'Al día' },
          {
            id: 3,
            nombre: 'Santa Cruz',
            carreras: 11,
            docentes: 165,
            progreso: 68,
            estado: 'Retraso',
          },
          { id: 4, nombre: 'Oruro', carreras: 8, docentes: 95, progreso: 82, estado: 'Al día' },
          { id: 5, nombre: 'Sucre', carreras: 9, docentes: 110, progreso: 75, estado: 'Al día' },
          { id: 6, nombre: 'Potosí', carreras: 6, docentes: 70, progreso: 65, estado: 'Retraso' },
          { id: 7, nombre: 'Tarija', carreras: 7, docentes: 80, progreso: 70, estado: 'Al día' },
          { id: 8, nombre: 'Trinidad', carreras: 5, docentes: 55, progreso: 58, estado: 'Retraso' },
          { id: 9, nombre: 'Cobija', carreras: 4, docentes: 45, progreso: 52, estado: 'Crítico' },
        ]),
        J = c([
          {
            id: 1,
            nombre: 'Dr. Juan Carlos Mendoza',
            iniciales: 'JM',
            carrera: 'Medicina',
            sede: 'Cochabamba',
            asignaturas: 45,
            docentesCargo: 28,
            cumplimiento: 85,
          },
          {
            id: 2,
            nombre: 'Lic. María Elena Vargas',
            iniciales: 'MV',
            carrera: 'Odontología',
            sede: 'Cochabamba',
            asignaturas: 38,
            docentesCargo: 22,
            cumplimiento: 78,
          },
          {
            id: 3,
            nombre: 'Ing. Roberto Paz',
            iniciales: 'RP',
            carrera: 'Ingeniería Civil',
            sede: 'La Paz',
            asignaturas: 42,
            docentesCargo: 25,
            cumplimiento: 72,
          },
          {
            id: 4,
            nombre: 'Lic. Ana Gutiérrez',
            iniciales: 'AG',
            carrera: 'Derecho',
            sede: 'Santa Cruz',
            asignaturas: 35,
            docentesCargo: 20,
            cumplimiento: 65,
          },
          {
            id: 5,
            nombre: 'Dr. Pedro Rojas',
            iniciales: 'PR',
            carrera: 'Medicina',
            sede: 'La Paz',
            asignaturas: 45,
            docentesCargo: 30,
            cumplimiento: 82,
          },
        ]),
        W = c([
          {
            id: 1,
            nombre: 'Dr. Carlos Fernández',
            iniciales: 'CF',
            sede: 'Cochabamba',
            carrerasSupervision: 12,
            docentesTotal: 180,
            cumplimientoGeneral: 78,
          },
          {
            id: 2,
            nombre: 'Lic. Patricia Sandoval',
            iniciales: 'PS',
            sede: 'La Paz',
            carrerasSupervision: 10,
            docentesTotal: 150,
            cumplimientoGeneral: 72,
          },
          {
            id: 3,
            nombre: 'Ing. Mario Delgado',
            iniciales: 'MD',
            sede: 'Santa Cruz',
            carrerasSupervision: 11,
            docentesTotal: 165,
            cumplimientoGeneral: 68,
          },
          {
            id: 4,
            nombre: 'Lic. Rosa Mamani',
            iniciales: 'RM',
            sede: 'Oruro',
            carrerasSupervision: 8,
            docentesTotal: 95,
            cumplimientoGeneral: 82,
          },
        ]),
        z = c([]),
        A = c(!1)
      re(async () => {
        ;(await k.fetchSedes(),
          S.query.sedeId &&
            ((u.value.sede = parseInt(S.query.sedeId)),
            (V.value = S.query.sedeName || null),
            v.notify({
              type: 'info',
              message: `Mostrando reportes de: ${V.value || 'Sede seleccionada'}`,
              icon: 'apartment',
            })),
          q())
      })
      const q = async () => {
          A.value = !0
          try {
            const l = {}
            u.value.sede !== 'todas' && (l.sede_id = u.value.sede)
            const { data: s } = await ie.get('/reportes/auditorias-vicerrector', { params: l })
            z.value = s
          } catch (l) {
            ;(console.error(l),
              v.notify({ type: 'negative', message: 'Error cargando auditorías críticas' }))
          } finally {
            A.value = !1
          }
        },
        T = (l) => (l >= 80 ? 'positive' : l >= 60 ? 'warning' : 'negative'),
        H = () => {
          ;(v.notify({ type: 'info', message: 'Actualizando reportes...', icon: 'sync' }), q())
        },
        K = () => {
          v.notify({
            type: 'positive',
            message: 'Exportando reporte en PDF...',
            icon: 'picture_as_pdf',
          })
        },
        X = () => {
          v.notify({
            type: 'positive',
            message: 'Exportando reporte en Excel...',
            icon: 'table_chart',
          })
        },
        Y = (l) => {
          ;((n.value = {
            titulo: `Reporte de Sede: ${l.nombre}`,
            subtitulo: `${l.carreras} carreras, ${l.docentes} docentes`,
          }),
            (g.value = !0))
        },
        Z = (l) => {
          v.notify({ type: 'positive', message: `Descargando reporte de ${l.nombre}...` })
        },
        ee = (l) => {
          ;((n.value = { titulo: `Reporte: ${l.nombre}`, subtitulo: `${l.carrera} - ${l.sede}` }),
            (g.value = !0))
        },
        oe = (l) => {
          ;((n.value = {
            titulo: `Reporte: ${l.nombre}`,
            subtitulo: `Dirección Académica - ${l.sede}`,
            tipo: 'academico',
            data: l,
          }),
            (g.value = !0))
        },
        ae = (l) => {
          ;((n.value = {
            titulo: `Auditoría: ${l.asignatura}`,
            subtitulo: l.carrera,
            tipo: 'auditoria',
            data: l,
          }),
            (g.value = !0))
        }
      return (l, s) => (
        P(),
        ne(
          _e,
          { class: 'reportes-nacionales-page' },
          {
            default: o(() => [
              t('div', Ce, [
                t('div', he, [
                  s[6] ||
                    (s[6] = t(
                      'div',
                      null,
                      [
                        t(
                          'h4',
                          { class: 'text-h4 text-weight-bold q-mb-xs' },
                          'Reportes Nacionales',
                        ),
                        t(
                          'p',
                          { class: 'text-grey-7 q-mb-none' },
                          'Control y supervisión de reportes a nivel nacional',
                        ),
                      ],
                      -1,
                    )),
                  t('div', De, [
                    e(m, { color: 'primary', icon: 'download', label: 'Exportar PDF', onClick: K }),
                    e(m, {
                      outline: '',
                      color: 'primary',
                      icon: 'table_chart',
                      label: 'Exportar Excel',
                      onClick: X,
                    }),
                  ]),
                ]),
              ]),
              e(
                p,
                { flat: '', bordered: '', class: 'q-mb-lg' },
                {
                  default: o(() => [
                    e(f, null, {
                      default: o(() => [
                        t('div', Se, [
                          t('div', Ae, [
                            e(
                              Q,
                              {
                                modelValue: u.value.sede,
                                'onUpdate:modelValue': s[0] || (s[0] = (a) => (u.value.sede = a)),
                                options: M.value,
                                label: 'Sede',
                                outlined: '',
                                dense: '',
                                'emit-value': '',
                                'map-options': '',
                              },
                              { prepend: o(() => [e(_, { name: 'apartment' })]), _: 1 },
                              8,
                              ['modelValue', 'options'],
                            ),
                          ]),
                          t('div', Pe, [
                            e(
                              Q,
                              {
                                modelValue: u.value.periodo,
                                'onUpdate:modelValue':
                                  s[1] || (s[1] = (a) => (u.value.periodo = a)),
                                options: L,
                                label: 'Período',
                                outlined: '',
                                dense: '',
                                'emit-value': '',
                                'map-options': '',
                              },
                              null,
                              8,
                              ['modelValue'],
                            ),
                          ]),
                          t('div', Qe, [
                            e(
                              Q,
                              {
                                modelValue: u.value.tipoReporte,
                                'onUpdate:modelValue':
                                  s[2] || (s[2] = (a) => (u.value.tipoReporte = a)),
                                options: B,
                                label: 'Tipo de Reporte',
                                outlined: '',
                                dense: '',
                                'emit-value': '',
                                'map-options': '',
                              },
                              null,
                              8,
                              ['modelValue'],
                            ),
                          ]),
                          t('div', Re, [
                            e(m, {
                              color: 'primary',
                              icon: 'refresh',
                              label: 'Actualizar',
                              onClick: H,
                            }),
                          ]),
                        ]),
                      ]),
                      _: 1,
                    }),
                  ]),
                  _: 1,
                },
              ),
              t('div', ke, [
                t('div', Ve, [
                  e(
                    p,
                    { flat: '', bordered: '', class: 'metric-card' },
                    {
                      default: o(() => [
                        e(f, null, {
                          default: o(() => [
                            t('div', ze, [
                              t('div', qe, [
                                t('div', Te, r(b.value.progresoGeneral) + '%', 1),
                                s[7] ||
                                  (s[7] = t(
                                    'div',
                                    { class: 'text-caption text-grey-7' },
                                    'Progreso General',
                                    -1,
                                  )),
                              ]),
                              e(
                                me,
                                {
                                  value: b.value.progresoGeneral,
                                  size: '50px',
                                  thickness: 0.2,
                                  color: 'primary',
                                  'track-color': 'grey-3',
                                },
                                null,
                                8,
                                ['value'],
                              ),
                            ]),
                          ]),
                          _: 1,
                        }),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                t('div', Ge, [
                  e(
                    p,
                    { flat: '', bordered: '', class: 'metric-card' },
                    {
                      default: o(() => [
                        e(f, null, {
                          default: o(() => [
                            t('div', $e, [
                              t('div', Ee, [
                                t('div', Ie, r(b.value.sedesAlDia), 1),
                                s[8] ||
                                  (s[8] = t(
                                    'div',
                                    { class: 'text-caption text-grey-7' },
                                    'Sedes al Día',
                                    -1,
                                  )),
                              ]),
                              e(_, { name: 'check_circle', size: '40px', color: 'positive' }),
                            ]),
                          ]),
                          _: 1,
                        }),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                t('div', Me, [
                  e(
                    p,
                    { flat: '', bordered: '', class: 'metric-card' },
                    {
                      default: o(() => [
                        e(f, null, {
                          default: o(() => [
                            t('div', Le, [
                              t('div', Be, [
                                t('div', Fe, r(b.value.sedesConRetraso), 1),
                                s[9] ||
                                  (s[9] = t(
                                    'div',
                                    { class: 'text-caption text-grey-7' },
                                    'Sedes con Retraso',
                                    -1,
                                  )),
                              ]),
                              e(_, { name: 'warning', size: '40px', color: 'warning' }),
                            ]),
                          ]),
                          _: 1,
                        }),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                t('div', Ne, [
                  e(
                    p,
                    { flat: '', bordered: '', class: 'metric-card' },
                    {
                      default: o(() => [
                        e(f, null, {
                          default: o(() => [
                            t('div', je, [
                              t('div', Ue, [
                                t('div', Oe, r(b.value.totalDocentes), 1),
                                s[10] ||
                                  (s[10] = t(
                                    'div',
                                    { class: 'text-caption text-grey-7' },
                                    'Docentes Activos',
                                    -1,
                                  )),
                              ]),
                              e(_, { name: 'people', size: '40px', color: 'info' }),
                            ]),
                          ]),
                          _: 1,
                        }),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
              ]),
              e(
                p,
                { flat: '', bordered: '' },
                {
                  default: o(() => [
                    e(
                      pe,
                      {
                        modelValue: y.value,
                        'onUpdate:modelValue': s[3] || (s[3] = (a) => (y.value = a)),
                        class: 'text-grey',
                        'active-color': 'primary',
                        'indicator-color': 'primary',
                        align: 'left',
                      },
                      {
                        default: o(() => [
                          e(C, { name: 'sedes', label: 'Por Sede', icon: 'apartment' }),
                          e(C, {
                            name: 'directores',
                            label: 'Directores de Carrera',
                            icon: 'person',
                          }),
                          e(C, {
                            name: 'academicos',
                            label: 'Directores Académicos',
                            icon: 'school',
                          }),
                          e(C, { name: 'auditorias', label: 'Auditorías Críticas', icon: 'gavel' }),
                        ]),
                        _: 1,
                      },
                      8,
                      ['modelValue'],
                    ),
                    e(G),
                    e(
                      ve,
                      {
                        modelValue: y.value,
                        'onUpdate:modelValue': s[4] || (s[4] = (a) => (y.value = a)),
                        animated: '',
                      },
                      {
                        default: o(() => [
                          e(
                            D,
                            { name: 'sedes' },
                            {
                              default: o(() => [
                                e(
                                  h,
                                  {
                                    rows: O.value,
                                    columns: F,
                                    'row-key': 'id',
                                    flat: '',
                                    bordered: '',
                                    pagination: { rowsPerPage: 10 },
                                  },
                                  {
                                    'body-cell-progreso': o((a) => [
                                      e(
                                        d,
                                        { props: a },
                                        {
                                          default: o(() => [
                                            t('div', Je, [
                                              e(
                                                I,
                                                {
                                                  value: a.row.progreso / 100,
                                                  color: T(a.row.progreso),
                                                  rounded: '',
                                                  size: '8px',
                                                  style: { width: '100px' },
                                                },
                                                null,
                                                8,
                                                ['value', 'color'],
                                              ),
                                              t('span', We, r(a.row.progreso) + '%', 1),
                                            ]),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ['props'],
                                      ),
                                    ]),
                                    'body-cell-estado': o((a) => [
                                      e(
                                        d,
                                        { props: a },
                                        {
                                          default: o(() => [
                                            e(
                                              R,
                                              {
                                                color:
                                                  a.row.estado === 'Al día'
                                                    ? 'positive'
                                                    : a.row.estado === 'Retraso'
                                                      ? 'warning'
                                                      : 'negative',
                                                'text-color': 'white',
                                                size: 'sm',
                                              },
                                              { default: o(() => [i(r(a.row.estado), 1)]), _: 2 },
                                              1032,
                                              ['color'],
                                            ),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ['props'],
                                      ),
                                    ]),
                                    'body-cell-acciones': o((a) => [
                                      e(
                                        d,
                                        { props: a },
                                        {
                                          default: o(() => [
                                            e(
                                              m,
                                              {
                                                flat: '',
                                                round: '',
                                                dense: '',
                                                icon: 'visibility',
                                                color: 'primary',
                                                onClick: (x) => Y(a.row),
                                              },
                                              {
                                                default: o(() => [
                                                  e(w, null, {
                                                    default: o(() => [
                                                      ...(s[11] ||
                                                        (s[11] = [i('Ver Detalle', -1)])),
                                                    ]),
                                                    _: 1,
                                                  }),
                                                ]),
                                                _: 2,
                                              },
                                              1032,
                                              ['onClick'],
                                            ),
                                            e(
                                              m,
                                              {
                                                flat: '',
                                                round: '',
                                                dense: '',
                                                icon: 'download',
                                                color: 'grey',
                                                onClick: (x) => Z(a.row),
                                              },
                                              {
                                                default: o(() => [
                                                  e(w, null, {
                                                    default: o(() => [
                                                      ...(s[12] ||
                                                        (s[12] = [i('Descargar Reporte', -1)])),
                                                    ]),
                                                    _: 1,
                                                  }),
                                                ]),
                                                _: 2,
                                              },
                                              1032,
                                              ['onClick'],
                                            ),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ['props'],
                                      ),
                                    ]),
                                    _: 1,
                                  },
                                  8,
                                  ['rows'],
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          e(
                            D,
                            { name: 'directores' },
                            {
                              default: o(() => [
                                e(
                                  h,
                                  {
                                    rows: J.value,
                                    columns: N,
                                    'row-key': 'id',
                                    flat: '',
                                    bordered: '',
                                    pagination: { rowsPerPage: 10 },
                                  },
                                  {
                                    'body-cell-director': o((a) => [
                                      e(
                                        d,
                                        { props: a },
                                        {
                                          default: o(() => [
                                            t('div', He, [
                                              e(
                                                $,
                                                {
                                                  size: '32px',
                                                  color: 'primary',
                                                  'text-color': 'white',
                                                },
                                                {
                                                  default: o(() => [i(r(a.row.iniciales), 1)]),
                                                  _: 2,
                                                },
                                                1024,
                                              ),
                                              t('div', null, [
                                                t('div', Ke, r(a.row.nombre), 1),
                                                t('div', Xe, r(a.row.carrera), 1),
                                              ]),
                                            ]),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ['props'],
                                      ),
                                    ]),
                                    'body-cell-cumplimiento': o((a) => [
                                      e(
                                        d,
                                        { props: a },
                                        {
                                          default: o(() => [
                                            e(
                                              R,
                                              {
                                                color:
                                                  a.row.cumplimiento >= 80
                                                    ? 'positive'
                                                    : a.row.cumplimiento >= 60
                                                      ? 'warning'
                                                      : 'negative',
                                                'text-color': 'white',
                                                size: 'sm',
                                              },
                                              {
                                                default: o(() => [
                                                  i(r(a.row.cumplimiento) + '% ', 1),
                                                ]),
                                                _: 2,
                                              },
                                              1032,
                                              ['color'],
                                            ),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ['props'],
                                      ),
                                    ]),
                                    'body-cell-acciones': o((a) => [
                                      e(
                                        d,
                                        { props: a },
                                        {
                                          default: o(() => [
                                            e(
                                              m,
                                              {
                                                flat: '',
                                                round: '',
                                                dense: '',
                                                icon: 'visibility',
                                                color: 'primary',
                                                onClick: (x) => ee(a.row),
                                              },
                                              {
                                                default: o(() => [
                                                  e(w, null, {
                                                    default: o(() => [
                                                      ...(s[13] ||
                                                        (s[13] = [i('Ver Detalle', -1)])),
                                                    ]),
                                                    _: 1,
                                                  }),
                                                ]),
                                                _: 2,
                                              },
                                              1032,
                                              ['onClick'],
                                            ),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ['props'],
                                      ),
                                    ]),
                                    _: 1,
                                  },
                                  8,
                                  ['rows'],
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          e(
                            D,
                            { name: 'academicos' },
                            {
                              default: o(() => [
                                e(
                                  h,
                                  {
                                    rows: W.value,
                                    columns: j,
                                    'row-key': 'id',
                                    flat: '',
                                    bordered: '',
                                    pagination: { rowsPerPage: 10 },
                                  },
                                  {
                                    'body-cell-director': o((a) => [
                                      e(
                                        d,
                                        { props: a },
                                        {
                                          default: o(() => [
                                            t('div', Ye, [
                                              e(
                                                $,
                                                {
                                                  size: '32px',
                                                  color: 'secondary',
                                                  'text-color': 'white',
                                                },
                                                {
                                                  default: o(() => [i(r(a.row.iniciales), 1)]),
                                                  _: 2,
                                                },
                                                1024,
                                              ),
                                              t('div', null, [
                                                t('div', Ze, r(a.row.nombre), 1),
                                                t('div', eo, r(a.row.sede), 1),
                                              ]),
                                            ]),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ['props'],
                                      ),
                                    ]),
                                    'body-cell-carrerasSupervision': o((a) => [
                                      e(
                                        d,
                                        { props: a },
                                        {
                                          default: o(() => [
                                            e(
                                              ge,
                                              {
                                                color: 'info',
                                                label: a.row.carrerasSupervision + ' carreras',
                                              },
                                              null,
                                              8,
                                              ['label'],
                                            ),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ['props'],
                                      ),
                                    ]),
                                    'body-cell-cumplimientoGeneral': o((a) => [
                                      e(
                                        d,
                                        { props: a },
                                        {
                                          default: o(() => [
                                            t('div', oo, [
                                              e(
                                                I,
                                                {
                                                  value: a.row.cumplimientoGeneral / 100,
                                                  color: T(a.row.cumplimientoGeneral),
                                                  rounded: '',
                                                  size: '8px',
                                                  style: { width: '80px' },
                                                },
                                                null,
                                                8,
                                                ['value', 'color'],
                                              ),
                                              t('span', ao, r(a.row.cumplimientoGeneral) + '%', 1),
                                            ]),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ['props'],
                                      ),
                                    ]),
                                    'body-cell-acciones': o((a) => [
                                      e(
                                        d,
                                        { props: a },
                                        {
                                          default: o(() => [
                                            e(
                                              m,
                                              {
                                                flat: '',
                                                round: '',
                                                dense: '',
                                                icon: 'visibility',
                                                color: 'primary',
                                                onClick: (x) => oe(a.row),
                                              },
                                              {
                                                default: o(() => [
                                                  e(w, null, {
                                                    default: o(() => [
                                                      ...(s[14] ||
                                                        (s[14] = [i('Ver Detalle', -1)])),
                                                    ]),
                                                    _: 1,
                                                  }),
                                                ]),
                                                _: 2,
                                              },
                                              1032,
                                              ['onClick'],
                                            ),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ['props'],
                                      ),
                                    ]),
                                    _: 1,
                                  },
                                  8,
                                  ['rows'],
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          e(
                            D,
                            { name: 'auditorias' },
                            {
                              default: o(() => [
                                e(
                                  h,
                                  {
                                    rows: z.value,
                                    columns: U,
                                    'row-key': 'id',
                                    flat: '',
                                    bordered: '',
                                    loading: A.value,
                                    pagination: { rowsPerPage: 10 },
                                  },
                                  {
                                    'body-cell-semaforo': o((a) => [
                                      e(
                                        d,
                                        { props: a },
                                        {
                                          default: o(() => [
                                            e(
                                              R,
                                              {
                                                color: a.row.semaforo,
                                                'text-color': 'white',
                                                size: 'sm',
                                                class: 'text-weight-bold',
                                              },
                                              {
                                                default: o(() => [i(r(a.row.alertaLabel), 1)]),
                                                _: 2,
                                              },
                                              1032,
                                              ['color'],
                                            ),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ['props'],
                                      ),
                                    ]),
                                    'body-cell-acciones': o((a) => [
                                      e(
                                        d,
                                        { props: a },
                                        {
                                          default: o(() => [
                                            e(
                                              m,
                                              {
                                                flat: '',
                                                round: '',
                                                dense: '',
                                                icon: 'visibility',
                                                color: 'primary',
                                                onClick: (x) => ae(a.row),
                                              },
                                              {
                                                default: o(() => [
                                                  e(w, null, {
                                                    default: o(() => [
                                                      ...(s[15] ||
                                                        (s[15] = [i('Ver Detalle', -1)])),
                                                    ]),
                                                    _: 1,
                                                  }),
                                                ]),
                                                _: 2,
                                              },
                                              1032,
                                              ['onClick'],
                                            ),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ['props'],
                                      ),
                                    ]),
                                    _: 1,
                                  },
                                  8,
                                  ['rows', 'loading'],
                                ),
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
              e(
                de,
                {
                  modelValue: g.value,
                  'onUpdate:modelValue': s[5] || (s[5] = (a) => (g.value = a)),
                  maximized: '',
                },
                {
                  default: o(() => [
                    e(p, null, {
                      default: o(() => [
                        e(
                          be,
                          { class: 'bg-primary text-white' },
                          {
                            default: o(() => [
                              e(_, { name: 'info' }),
                              t('div', to, r(n.value?.titulo), 1),
                              e(fe),
                              ce(e(m, { dense: '', flat: '', icon: 'close' }, null, 512), [[we]]),
                            ]),
                            _: 1,
                          },
                        ),
                        e(
                          f,
                          { class: 'q-pa-lg' },
                          {
                            default: o(() => [
                              t('div', so, r(n.value?.subtitulo), 1),
                              n.value?.tipo === 'auditoria'
                                ? (P(),
                                  E(
                                    ue,
                                    { key: 0 },
                                    [
                                      t('div', lo, [
                                        t('div', ro, [
                                          s[16] || (s[16] = t('strong', null, 'Docente:', -1)),
                                          i(' ' + r(n.value.data.docente), 1),
                                        ]),
                                        t('div', io, [
                                          s[17] || (s[17] = t('strong', null, 'Auditor:', -1)),
                                          i(' ' + r(n.value.data.auditor), 1),
                                        ]),
                                        t('div', no, [
                                          s[18] || (s[18] = t('strong', null, 'Fecha:', -1)),
                                          i(' ' + r(n.value.data.fecha), 1),
                                        ]),
                                        t('div', co, [
                                          s[19] || (s[19] = t('strong', null, 'Semana:', -1)),
                                          i(' ' + r(n.value.data.semana), 1),
                                        ]),
                                      ]),
                                      e(G, { class: 'q-my-md' }),
                                      t('div', uo, [
                                        s[20] || (s[20] = t('strong', null, 'Observaciones:', -1)),
                                        t(
                                          'p',
                                          mo,
                                          r(n.value.data.observaciones || 'Sin observaciones'),
                                          1,
                                        ),
                                      ]),
                                      t('div', null, [
                                        s[21] ||
                                          (s[21] = t('strong', null, 'Acciones Correctivas:', -1)),
                                        t(
                                          'p',
                                          po,
                                          r(
                                            n.value.data.acciones_correctivas ||
                                              'Sin acciones correctivas',
                                          ),
                                          1,
                                        ),
                                      ]),
                                    ],
                                    64,
                                  ))
                                : (P(),
                                  E(
                                    'p',
                                    vo,
                                    ' Aquí se mostrará el detalle completo del reporte seleccionado. ',
                                  )),
                            ]),
                            _: 1,
                          },
                        ),
                      ]),
                      _: 1,
                    }),
                  ]),
                  _: 1,
                },
                8,
                ['modelValue'],
              ),
            ]),
            _: 1,
          },
        )
      )
    },
  },
  jo = xe(go, [['__scopeId', 'data-v-901fceb1']])
export { jo as default }
