import {
  f as N,
  r as u,
  P as z,
  i as F,
  j as c,
  k as t,
  m as e,
  l as a,
  y as m,
  A as k,
  s as d,
  x,
  D as o,
  E as l,
  z as v,
  B as r,
} from './index-CVgKKHHv.js'
import { Q as h } from './QSelect-B2vk19AQ.js'
import { Q as U } from './QLinearProgress-CGVvufhy.js'
import { Q as C, a as J } from './QTable-HDg5LzBZ.js'
import { Q as H } from './QBanner-jrp6fMez.js'
import { Q as $ } from './QPage-D-YrLEJA.js'
import { u as j } from './sedes-xi7lRAei.js'
import { u as K } from './carreras-B-7e1Sez.js'
import { _ as W } from './WeeklyReportTable-DRyRF2wm.js'
import { _ as Z } from './_plugin-vue_export-helper-DlAUqK2U.js'
import './QChip-g_JHqrFQ.js'
import './QItem-C23xClkh.js'
import './QItemLabel-wP2Wn6Fb.js'
import './QMenu-C5EVwErB.js'
import './selection-Dzil4kq6.js'
import './rtl-DFPa-2ov.js'
import './format-DyQxkAtJ.js'
import './QList-BSXQR-9A.js'
import './use-fullscreen-DP5Hoaa-.js'
import './QBadge-BSFZG2oj.js'
import './QTooltip-xFvievHl.js'
import './QToolbar-C3tAR4Vd.js'
import './ClosePopup-srUPe2x8.js'
import './date-Dq-KU4bN.js'
import './QBtnToggle-F0dqsGUs.js'
import './QBtnGroup-vR5Xmbr5.js'
import './QSpace-PwS5FTKD.js'
import './jspdf.plugin.autotable-ZWVc0qIh.js'
const X = { class: 'page-header' },
  Y = { class: 'header-left' },
  ee = { class: 'page-title' },
  ae = { class: 'header-actions' },
  se = { class: 'row q-col-gutter-md items-end' },
  te = { class: 'col-12 col-md-2' },
  oe = { class: 'col-12 col-md-2' },
  le = { key: 0, class: 'col-12 col-md-2' },
  re = { key: 1, class: 'col-12 col-md-2' },
  ne = { class: 'col-12 col-md-2' },
  ie = { class: 'col-auto' },
  de = { key: 0 },
  ce = { key: 0 },
  ue = { class: 'reporte-header q-mb-md' },
  me = { class: 'reporte-fecha' },
  pe = { class: 'row q-col-gutter-lg q-mb-lg' },
  ve = { class: 'col-12 col-md-3' },
  _e = { class: 'stat-value' },
  be = { class: 'col-12 col-md-3' },
  fe = { class: 'stat-value' },
  ge = { class: 'col-12 col-md-3' },
  he = { class: 'stat-value' },
  ye = { class: 'col-12 col-md-3' },
  xe = { class: 'stat-value' },
  Se = { class: 'text-caption' },
  Ce = { key: 1 },
  De = { class: 'reporte-header q-mb-md' },
  Re = { class: 'reporte-fecha' },
  ze = { class: 'row q-col-gutter-lg q-mb-lg' },
  ke = { class: 'col-12 col-md-3' },
  Ie = { class: 'stat-value' },
  Ve = { class: 'col-12 col-md-3' },
  we = { class: 'stat-value' },
  Pe = { class: 'col-12 col-md-3' },
  Ee = { class: 'stat-value' },
  Ae = { class: 'col-12 col-md-3' },
  qe = { class: 'stat-value' },
  Ge = { key: 2 },
  Qe = { class: 'reporte-header q-mb-md' },
  Oe = { class: 'reporte-fecha' },
  Te = { class: 'row q-col-gutter-lg q-mb-lg' },
  Me = { class: 'col-12 col-md-3' },
  Le = { class: 'stat-value' },
  Be = { class: 'col-12 col-md-3' },
  Ne = { class: 'stat-value' },
  Fe = { class: 'col-12 col-md-3' },
  Ue = { class: 'stat-value' },
  Je = { class: 'col-12 col-md-3' },
  He = { class: 'stat-value' },
  $e = { key: 3 },
  je = { class: 'reporte-header q-mb-md' },
  Ke = { class: 'row q-gutter-sm' },
  We = { class: 'reporte-fecha q-ml-md flex items-center' },
  Ze = { key: 1, class: 'empty-state' },
  Xe = {
    __name: 'ReportesPage',
    setup(Ye) {
      const y = N(),
        I = j(),
        V = K(),
        D = u(!1),
        _ = u(''),
        S = u(!1),
        R = u([]),
        n = u({
          tipoReporte: 'docentes',
          sede: null,
          carrera: null,
          docente: null,
          gestion: '2026-I',
        }),
        w = [
          { label: 'Por Docentes', value: 'docentes' },
          { label: 'Por Carreras', value: 'carreras' },
          { label: 'Por Sedes', value: 'sedes' },
          { label: 'Cumplimiento Semanal', value: 'cumplimiento_semanal' },
        ],
        P = [
          { label: 'Gestión 2026-I', value: '2026-I' },
          { label: 'Gestión 2025-II', value: '2025-II' },
          { label: 'Gestión 2025-I', value: '2025-I' },
        ],
        E = z(() => I.sedesActivas.map((p) => ({ label: p.nombre, value: p.id }))),
        A = z(() => V.carreras.map((p) => ({ label: p.nombre, value: p.id }))),
        q = [
          { label: 'Dr. Juan Pérez', value: 1 },
          { label: 'Dra. María García', value: 2 },
          { label: 'Ing. Carlos López', value: 3 },
          { label: 'Lic. Ana Martínez', value: 4 },
        ],
        b = u({
          total: 45,
          materias: 120,
          grupos: 85,
          horasSemanales: 640,
          detalle: [
            {
              id: 1,
              nombre: 'Dr. Juan Pérez',
              especialidad: 'Medicina',
              materias: 3,
              grupos: 4,
              horas: 16,
              progreso: 85,
            },
            {
              id: 2,
              nombre: 'Dra. María García',
              especialidad: 'Pediatría',
              materias: 2,
              grupos: 3,
              horas: 12,
              progreso: 92,
            },
            {
              id: 3,
              nombre: 'Ing. Carlos López',
              especialidad: 'Sistemas',
              materias: 4,
              grupos: 5,
              horas: 20,
              progreso: 78,
            },
            {
              id: 4,
              nombre: 'Lic. Ana Martínez',
              especialidad: 'Derecho',
              materias: 2,
              grupos: 2,
              horas: 8,
              progreso: 65,
            },
            {
              id: 5,
              nombre: 'Dr. Roberto Fernández',
              especialidad: 'Anatomía',
              materias: 3,
              grupos: 4,
              horas: 16,
              progreso: 95,
            },
          ],
        }),
        f = u({
          total: 8,
          estudiantes: 2540,
          materias: 156,
          documentacion: 72,
          detalle: [
            {
              id: 1,
              nombre: 'Medicina',
              sede: 'Cochabamba',
              estudiantes: 450,
              docentes: 28,
              materias: 45,
              documentacion: 85,
            },
            {
              id: 2,
              nombre: 'Ing. de Sistemas',
              sede: 'Cochabamba',
              estudiantes: 320,
              docentes: 15,
              materias: 38,
              documentacion: 78,
            },
            {
              id: 3,
              nombre: 'Derecho',
              sede: 'La Paz',
              estudiantes: 280,
              docentes: 12,
              materias: 32,
              documentacion: 65,
            },
            {
              id: 4,
              nombre: 'Odontología',
              sede: 'Cochabamba',
              estudiantes: 180,
              docentes: 14,
              materias: 28,
              documentacion: 72,
            },
            {
              id: 5,
              nombre: 'Enfermería',
              sede: 'El Alto',
              estudiantes: 210,
              docentes: 10,
              materias: 22,
              documentacion: 58,
            },
          ],
        }),
        g = u({
          total: 5,
          estudiantes: 3200,
          docentes: 180,
          carreras: 24,
          detalle: [
            {
              id: 1,
              nombre: 'Cochabamba',
              campus: 3,
              carreras: 8,
              estudiantes: 1450,
              docentes: 85,
              documentacion: 78,
            },
            {
              id: 2,
              nombre: 'La Paz',
              campus: 2,
              carreras: 6,
              estudiantes: 820,
              docentes: 45,
              documentacion: 65,
            },
            {
              id: 3,
              nombre: 'El Alto',
              campus: 1,
              carreras: 4,
              estudiantes: 430,
              docentes: 22,
              documentacion: 55,
            },
            {
              id: 4,
              nombre: 'Ivirgarzama',
              campus: 1,
              carreras: 3,
              estudiantes: 280,
              docentes: 15,
              documentacion: 48,
            },
            {
              id: 5,
              nombre: 'Santa Cruz',
              campus: 2,
              carreras: 3,
              estudiantes: 220,
              docentes: 13,
              documentacion: 42,
            },
          ],
        }),
        G = [
          { name: 'nombre', label: 'Docente', field: 'nombre', align: 'left', sortable: !0 },
          { name: 'especialidad', label: 'Especialidad', field: 'especialidad', align: 'left' },
          { name: 'materias', label: 'Materias', field: 'materias', align: 'center' },
          { name: 'grupos', label: 'Grupos', field: 'grupos', align: 'center' },
          { name: 'horas', label: 'Horas/Sem', field: 'horas', align: 'center' },
          { name: 'progreso', label: 'Documentación', field: 'progreso', align: 'center' },
        ],
        Q = [
          { name: 'nombre', label: 'Carrera', field: 'nombre', align: 'left', sortable: !0 },
          { name: 'sede', label: 'Sede', field: 'sede', align: 'left' },
          { name: 'estudiantes', label: 'Estudiantes', field: 'estudiantes', align: 'center' },
          { name: 'docentes', label: 'Docentes', field: 'docentes', align: 'center' },
          { name: 'materias', label: 'Materias', field: 'materias', align: 'center' },
          { name: 'documentacion', label: 'Doc. %', field: 'documentacion', align: 'center' },
        ],
        O = [
          { name: 'nombre', label: 'Sede', field: 'nombre', align: 'left', sortable: !0 },
          { name: 'campus', label: 'Campus', field: 'campus', align: 'center' },
          { name: 'carreras', label: 'Carreras', field: 'carreras', align: 'center' },
          { name: 'estudiantes', label: 'Estudiantes', field: 'estudiantes', align: 'center' },
          { name: 'docentes', label: 'Docentes', field: 'docentes', align: 'center' },
          { name: 'documentacion', label: 'Doc. %', field: 'documentacion', align: 'center' },
        ]
      function T() {
        ;((S.value = !0),
          setTimeout(() => {
            ;((R.value = [
              {
                id: 1,
                asignatura: { nombre: 'Álgebra I', codigo: 'MAT-101' },
                carrera: { nombre: 'Ingeniería de Sistemas' },
                docente: { nombre: 'KARINA PAOLA LOPEZ' },
                semana_inicio: '2026-01-26',
                alerta: 'VERDE',
                criterios: {
                  temaImpartido: !0,
                  actividadesFormativas: !0,
                  secuenciaDidactica: !0,
                  plataformaVirtual: !0,
                  evidencias: !0,
                  evaluaciones: !0,
                  integracionTransversal: !0,
                },
              },
              {
                id: 2,
                asignatura: { nombre: 'Programación I', codigo: 'SIS-121' },
                carrera: { nombre: 'Ingeniería de Sistemas' },
                docente: { nombre: 'HAROLD MARCO ANTONIO ROJAS' },
                semana_inicio: '2026-01-26',
                alerta: 'ROJO',
                criterios: {
                  temaImpartido: !1,
                  actividadesFormativas: !0,
                  secuenciaDidactica: !1,
                  plataformaVirtual: !0,
                  evidencias: !1,
                  evaluaciones: !0,
                  integracionTransversal: !1,
                },
              },
            ]),
              (S.value = !1),
              y.notify({
                type: 'positive',
                message: 'Reportes de auditoría generados (Modo Prototipo)',
              }))
          }, 1e3))
      }
      function M() {
        ;((_.value = new Date().toLocaleString('es-BO')),
          (D.value = !0),
          y.notify({
            type: 'positive',
            message: 'Reporte generado exitosamente',
            icon: 'check_circle',
          }))
      }
      function L() {
        y.notify({
          type: 'positive',
          message: 'Exportando reporte a PDF...',
          icon: 'picture_as_pdf',
        })
      }
      function B() {
        y.notify({
          type: 'positive',
          message: 'Exportando reporte a Excel...',
          icon: 'table_chart',
        })
      }
      return (p, s) => (
        c(),
        F(
          $,
          { class: 'reportes-page' },
          {
            default: t(() => [
              e('div', X, [
                e('div', Y, [
                  e('h1', ee, [
                    a(d, { name: 'assessment', color: 'indigo', class: 'q-mr-sm' }),
                    s[5] || (s[5] = k(' Reportes del Sistema ', -1)),
                  ]),
                  s[6] ||
                    (s[6] = e(
                      'p',
                      { class: 'page-subtitle' },
                      'Genera reportes por docente, carrera o sede',
                      -1,
                    )),
                ]),
                e('div', ae, [
                  a(x, {
                    outline: '',
                    color: 'green',
                    icon: 'table_chart',
                    label: 'Exportar Excel',
                    'no-caps': '',
                    onClick: B,
                  }),
                  a(x, {
                    unelevated: '',
                    color: 'red',
                    icon: 'picture_as_pdf',
                    label: 'Exportar PDF',
                    'no-caps': '',
                    onClick: L,
                  }),
                ]),
              ]),
              a(
                o,
                { class: 'filtros-card q-mb-lg' },
                {
                  default: t(() => [
                    a(l, null, {
                      default: t(() => [
                        e('div', se, [
                          e('div', te, [
                            a(
                              h,
                              {
                                modelValue: n.value.tipoReporte,
                                'onUpdate:modelValue':
                                  s[0] || (s[0] = (i) => (n.value.tipoReporte = i)),
                                options: w,
                                outlined: '',
                                dense: '',
                                label: 'Tipo de Reporte',
                                'emit-value': '',
                                'map-options': '',
                              },
                              null,
                              8,
                              ['modelValue'],
                            ),
                          ]),
                          e('div', oe, [
                            a(
                              h,
                              {
                                modelValue: n.value.sede,
                                'onUpdate:modelValue': s[1] || (s[1] = (i) => (n.value.sede = i)),
                                options: E.value,
                                outlined: '',
                                dense: '',
                                label: 'Sede',
                                'emit-value': '',
                                'map-options': '',
                                clearable: '',
                              },
                              null,
                              8,
                              ['modelValue', 'options'],
                            ),
                          ]),
                          n.value.tipoReporte !== 'sedes'
                            ? (c(),
                              m('div', le, [
                                a(
                                  h,
                                  {
                                    modelValue: n.value.carrera,
                                    'onUpdate:modelValue':
                                      s[2] || (s[2] = (i) => (n.value.carrera = i)),
                                    options: A.value,
                                    outlined: '',
                                    dense: '',
                                    label: 'Carrera',
                                    'emit-value': '',
                                    'map-options': '',
                                    clearable: '',
                                  },
                                  null,
                                  8,
                                  ['modelValue', 'options'],
                                ),
                              ]))
                            : v('', !0),
                          n.value.tipoReporte === 'docentes'
                            ? (c(),
                              m('div', re, [
                                a(
                                  h,
                                  {
                                    modelValue: n.value.docente,
                                    'onUpdate:modelValue':
                                      s[3] || (s[3] = (i) => (n.value.docente = i)),
                                    options: q,
                                    outlined: '',
                                    dense: '',
                                    label: 'Docente',
                                    'emit-value': '',
                                    'map-options': '',
                                    clearable: '',
                                  },
                                  null,
                                  8,
                                  ['modelValue'],
                                ),
                              ]))
                            : v('', !0),
                          e('div', ne, [
                            a(
                              h,
                              {
                                modelValue: n.value.gestion,
                                'onUpdate:modelValue':
                                  s[4] || (s[4] = (i) => (n.value.gestion = i)),
                                options: P,
                                outlined: '',
                                dense: '',
                                label: 'Gestión',
                                'emit-value': '',
                                'map-options': '',
                              },
                              null,
                              8,
                              ['modelValue'],
                            ),
                          ]),
                          e('div', ie, [
                            a(x, {
                              unelevated: '',
                              color: 'indigo',
                              icon: 'search',
                              label: 'Generar',
                              'no-caps': '',
                              onClick: M,
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
              D.value
                ? (c(),
                  m('div', de, [
                    n.value.tipoReporte === 'docentes'
                      ? (c(),
                        m('div', ce, [
                          e('div', ue, [
                            s[7] ||
                              (s[7] = e(
                                'h2',
                                { class: 'reporte-titulo' },
                                'Reporte de Docentes',
                                -1,
                              )),
                            e('p', me, 'Generado: ' + r(_.value), 1),
                          ]),
                          e('div', pe, [
                            e('div', ve, [
                              a(
                                o,
                                { class: 'stat-card stat-primary' },
                                {
                                  default: t(() => [
                                    a(l, null, {
                                      default: t(() => [
                                        a(d, { name: 'person', size: '32px' }),
                                        e('div', _e, r(b.value.total), 1),
                                        s[8] ||
                                          (s[8] = e(
                                            'div',
                                            { class: 'stat-label' },
                                            'Total Docentes',
                                            -1,
                                          )),
                                      ]),
                                      _: 1,
                                    }),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                            e('div', be, [
                              a(
                                o,
                                { class: 'stat-card stat-success' },
                                {
                                  default: t(() => [
                                    a(l, null, {
                                      default: t(() => [
                                        a(d, { name: 'menu_book', size: '32px' }),
                                        e('div', fe, r(b.value.materias), 1),
                                        s[9] ||
                                          (s[9] = e(
                                            'div',
                                            { class: 'stat-label' },
                                            'Materias Asignadas',
                                            -1,
                                          )),
                                      ]),
                                      _: 1,
                                    }),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                            e('div', ge, [
                              a(
                                o,
                                { class: 'stat-card stat-warning' },
                                {
                                  default: t(() => [
                                    a(l, null, {
                                      default: t(() => [
                                        a(d, { name: 'groups', size: '32px' }),
                                        e('div', he, r(b.value.grupos), 1),
                                        s[10] ||
                                          (s[10] = e(
                                            'div',
                                            { class: 'stat-label' },
                                            'Grupos Activos',
                                            -1,
                                          )),
                                      ]),
                                      _: 1,
                                    }),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                            e('div', ye, [
                              a(
                                o,
                                { class: 'stat-card stat-info' },
                                {
                                  default: t(() => [
                                    a(l, null, {
                                      default: t(() => [
                                        a(d, { name: 'schedule', size: '32px' }),
                                        e('div', xe, r(b.value.horasSemanales) + 'h', 1),
                                        s[11] ||
                                          (s[11] = e(
                                            'div',
                                            { class: 'stat-label' },
                                            'Horas Semanales',
                                            -1,
                                          )),
                                      ]),
                                      _: 1,
                                    }),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                          ]),
                          a(
                            o,
                            { class: 'data-card' },
                            {
                              default: t(() => [
                                a(l, null, {
                                  default: t(() => [
                                    a(
                                      C,
                                      {
                                        rows: b.value.detalle,
                                        columns: G,
                                        'row-key': 'id',
                                        flat: '',
                                        bordered: '',
                                      },
                                      {
                                        'body-cell-progreso': t((i) => [
                                          a(
                                            J,
                                            { props: i },
                                            {
                                              default: t(() => [
                                                a(
                                                  U,
                                                  {
                                                    value: i.value / 100,
                                                    color:
                                                      i.value >= 80
                                                        ? 'green'
                                                        : i.value >= 50
                                                          ? 'orange'
                                                          : 'red',
                                                    rounded: '',
                                                    size: '8px',
                                                  },
                                                  null,
                                                  8,
                                                  ['value', 'color'],
                                                ),
                                                e('span', Se, r(i.value) + '%', 1),
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
                                }),
                              ]),
                              _: 1,
                            },
                          ),
                        ]))
                      : v('', !0),
                    n.value.tipoReporte === 'carreras'
                      ? (c(),
                        m('div', Ce, [
                          e('div', De, [
                            s[12] ||
                              (s[12] = e(
                                'h2',
                                { class: 'reporte-titulo' },
                                'Reporte por Carreras',
                                -1,
                              )),
                            e('p', Re, 'Generado: ' + r(_.value), 1),
                          ]),
                          e('div', ze, [
                            e('div', ke, [
                              a(
                                o,
                                { class: 'stat-card stat-primary' },
                                {
                                  default: t(() => [
                                    a(l, null, {
                                      default: t(() => [
                                        a(d, { name: 'school', size: '32px' }),
                                        e('div', Ie, r(f.value.total), 1),
                                        s[13] ||
                                          (s[13] = e(
                                            'div',
                                            { class: 'stat-label' },
                                            'Total Carreras',
                                            -1,
                                          )),
                                      ]),
                                      _: 1,
                                    }),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                            e('div', Ve, [
                              a(
                                o,
                                { class: 'stat-card stat-success' },
                                {
                                  default: t(() => [
                                    a(l, null, {
                                      default: t(() => [
                                        a(d, { name: 'people', size: '32px' }),
                                        e('div', we, r(f.value.estudiantes), 1),
                                        s[14] ||
                                          (s[14] = e(
                                            'div',
                                            { class: 'stat-label' },
                                            'Estudiantes',
                                            -1,
                                          )),
                                      ]),
                                      _: 1,
                                    }),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                            e('div', Pe, [
                              a(
                                o,
                                { class: 'stat-card stat-warning' },
                                {
                                  default: t(() => [
                                    a(l, null, {
                                      default: t(() => [
                                        a(d, { name: 'menu_book', size: '32px' }),
                                        e('div', Ee, r(f.value.materias), 1),
                                        s[15] ||
                                          (s[15] = e(
                                            'div',
                                            { class: 'stat-label' },
                                            'Materias',
                                            -1,
                                          )),
                                      ]),
                                      _: 1,
                                    }),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                            e('div', Ae, [
                              a(
                                o,
                                { class: 'stat-card stat-info' },
                                {
                                  default: t(() => [
                                    a(l, null, {
                                      default: t(() => [
                                        a(d, { name: 'description', size: '32px' }),
                                        e('div', qe, r(f.value.documentacion) + '%', 1),
                                        s[16] ||
                                          (s[16] = e(
                                            'div',
                                            { class: 'stat-label' },
                                            'Documentación',
                                            -1,
                                          )),
                                      ]),
                                      _: 1,
                                    }),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                          ]),
                          a(
                            o,
                            { class: 'data-card' },
                            {
                              default: t(() => [
                                a(l, null, {
                                  default: t(() => [
                                    a(
                                      C,
                                      {
                                        rows: f.value.detalle,
                                        columns: Q,
                                        'row-key': 'id',
                                        flat: '',
                                        bordered: '',
                                      },
                                      null,
                                      8,
                                      ['rows'],
                                    ),
                                  ]),
                                  _: 1,
                                }),
                              ]),
                              _: 1,
                            },
                          ),
                        ]))
                      : v('', !0),
                    n.value.tipoReporte === 'sedes'
                      ? (c(),
                        m('div', Ge, [
                          e('div', Qe, [
                            s[17] ||
                              (s[17] = e(
                                'h2',
                                { class: 'reporte-titulo' },
                                'Reporte por Sedes',
                                -1,
                              )),
                            e('p', Oe, 'Generado: ' + r(_.value), 1),
                          ]),
                          e('div', Te, [
                            e('div', Me, [
                              a(
                                o,
                                { class: 'stat-card stat-primary' },
                                {
                                  default: t(() => [
                                    a(l, null, {
                                      default: t(() => [
                                        a(d, { name: 'location_city', size: '32px' }),
                                        e('div', Le, r(g.value.total), 1),
                                        s[18] ||
                                          (s[18] = e(
                                            'div',
                                            { class: 'stat-label' },
                                            'Total Sedes',
                                            -1,
                                          )),
                                      ]),
                                      _: 1,
                                    }),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                            e('div', Be, [
                              a(
                                o,
                                { class: 'stat-card stat-success' },
                                {
                                  default: t(() => [
                                    a(l, null, {
                                      default: t(() => [
                                        a(d, { name: 'people', size: '32px' }),
                                        e('div', Ne, r(g.value.estudiantes), 1),
                                        s[19] ||
                                          (s[19] = e(
                                            'div',
                                            { class: 'stat-label' },
                                            'Estudiantes Total',
                                            -1,
                                          )),
                                      ]),
                                      _: 1,
                                    }),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                            e('div', Fe, [
                              a(
                                o,
                                { class: 'stat-card stat-warning' },
                                {
                                  default: t(() => [
                                    a(l, null, {
                                      default: t(() => [
                                        a(d, { name: 'person', size: '32px' }),
                                        e('div', Ue, r(g.value.docentes), 1),
                                        s[20] ||
                                          (s[20] = e(
                                            'div',
                                            { class: 'stat-label' },
                                            'Docentes Total',
                                            -1,
                                          )),
                                      ]),
                                      _: 1,
                                    }),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                            e('div', Je, [
                              a(
                                o,
                                { class: 'stat-card stat-info' },
                                {
                                  default: t(() => [
                                    a(l, null, {
                                      default: t(() => [
                                        a(d, { name: 'school', size: '32px' }),
                                        e('div', He, r(g.value.carreras), 1),
                                        s[21] ||
                                          (s[21] = e(
                                            'div',
                                            { class: 'stat-label' },
                                            'Carreras Total',
                                            -1,
                                          )),
                                      ]),
                                      _: 1,
                                    }),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                          ]),
                          a(
                            o,
                            { class: 'data-card' },
                            {
                              default: t(() => [
                                a(l, null, {
                                  default: t(() => [
                                    a(
                                      C,
                                      {
                                        rows: g.value.detalle,
                                        columns: O,
                                        'row-key': 'id',
                                        flat: '',
                                        bordered: '',
                                      },
                                      null,
                                      8,
                                      ['rows'],
                                    ),
                                  ]),
                                  _: 1,
                                }),
                              ]),
                              _: 1,
                            },
                          ),
                        ]))
                      : v('', !0),
                    n.value.tipoReporte === 'cumplimiento_semanal'
                      ? (c(),
                        m('div', $e, [
                          e('div', je, [
                            s[22] ||
                              (s[22] = e(
                                'h2',
                                { class: 'reporte-titulo' },
                                'Auditoría de Cumplimiento Semanal',
                                -1,
                              )),
                            e('div', Ke, [
                              a(x, {
                                color: 'secondary',
                                icon: 'auto_awesome',
                                label: 'Generar Reportes',
                                onClick: T,
                              }),
                              e('p', We, 'Generado: ' + r(_.value), 1),
                            ]),
                          ]),
                          a(
                            H,
                            { class: 'bg-indigo-1 text-indigo-9 q-mb-md rounded-borders' },
                            {
                              avatar: t(() => [a(d, { name: 'info' })]),
                              default: t(() => [
                                s[23] ||
                                  (s[23] = k(
                                    ' Vista global de auditoría para todas las sedes y carreras. Los reportes se basan en el Control de Clase docente. ',
                                    -1,
                                  )),
                              ]),
                              _: 1,
                            },
                          ),
                          a(
                            o,
                            { class: 'data-card' },
                            {
                              default: t(() => [
                                a(l, null, {
                                  default: t(() => [
                                    a(W, { rows: R.value, loading: S.value }, null, 8, [
                                      'rows',
                                      'loading',
                                    ]),
                                  ]),
                                  _: 1,
                                }),
                              ]),
                              _: 1,
                            },
                          ),
                        ]))
                      : v('', !0),
                  ]))
                : (c(),
                  m('div', Ze, [
                    a(d, { name: 'analytics', size: '80px', color: 'grey-4' }),
                    s[24] ||
                      (s[24] = e('h3', null, 'Selecciona los filtros y genera un reporte', -1)),
                    s[25] ||
                      (s[25] = e(
                        'p',
                        null,
                        'Puedes generar reportes por docentes, carreras o sedes',
                        -1,
                      )),
                  ])),
            ]),
            _: 1,
          },
        )
      )
    },
  },
  Ia = Z(Xe, [['__scopeId', 'data-v-6315b96f']])
export { Ia as default }
