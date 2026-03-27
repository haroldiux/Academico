import {
  f as j,
  r as m,
  a as L,
  aj as O,
  P as v,
  i as _,
  j as u,
  k as i,
  m as a,
  y as P,
  z as g,
  l as s,
  A as p,
  s as r,
  B as o,
  a4 as T,
  a5 as G,
  D as Q,
  E as h,
  a2 as H,
  af as E,
  x as b,
  C as R,
  W,
} from './index-CVgKKHHv.js'
import { Q as k } from './QSelect-B2vk19AQ.js'
import { Q as w } from './QChip-g_JHqrFQ.js'
import { Q as J } from './QSpace-PwS5FTKD.js'
import { Q as K } from './QTooltip-xFvievHl.js'
import { Q as X } from './QBanner-jrp6fMez.js'
import { Q as Y } from './QPage-D-YrLEJA.js'
import { C as Z } from './ClosePopup-srUPe2x8.js'
import { _ as aa } from './_plugin-vue_export-helper-DlAUqK2U.js'
import './QItem-C23xClkh.js'
import './QItemLabel-wP2Wn6Fb.js'
import './QMenu-C5EVwErB.js'
import './selection-Dzil4kq6.js'
import './rtl-DFPa-2ov.js'
import './format-DyQxkAtJ.js'
const ea = { class: 'page-header' },
  sa = { class: 'page-title' },
  la = { class: 'stats-row q-mb-lg' },
  ta = { class: 'stat-card' },
  oa = { class: 'stat-info' },
  ia = { class: 'stat-value' },
  ra = { class: 'stat-card' },
  na = { class: 'stat-info' },
  da = { class: 'stat-value' },
  ca = { class: 'stat-card' },
  ua = { class: 'stat-info' },
  pa = { class: 'stat-value' },
  ma = { class: 'filters-section q-mb-lg' },
  va = { class: 'evaluaciones-grid' },
  _a = { class: 'eval-header' },
  fa = { class: 'eval-materia' },
  ga = { class: 'eval-grupo' },
  ha = { class: 'eval-info' },
  ba = { class: 'info-item' },
  xa = { class: 'info-item' },
  ya = { class: 'info-item' },
  Ca = { class: 'eval-preguntas' },
  Pa = { key: 0, class: 'empty-state' },
  Qa = { class: 'text-h6' },
  Ea = { class: 'detalles-grid' },
  ka = { class: 'detalle-item' },
  wa = { class: 'detalle-value' },
  Va = { class: 'detalle-item' },
  za = { class: 'detalle-value' },
  qa = { class: 'detalle-item' },
  Da = { class: 'detalle-value' },
  Ba = { class: 'detalle-item' },
  Sa = { class: 'detalle-value' },
  Fa = { class: 'detalle-item' },
  Ia = { class: 'detalle-value' },
  Ma = { class: 'detalle-item' },
  Na = { class: 'detalle-value' },
  Aa = { class: 'detalle-item' },
  $a = { class: 'detalle-value' },
  Ua = {
    __name: 'MisEvaluacionesPage',
    setup(ja) {
      const x = j(),
        d = m({ materia: null, parcial: null }),
        f = m(!1),
        n = m(null),
        y = m(!1),
        c = m([])
      L(() => {
        V()
      })
      async function V() {
        y.value = !0
        try {
          const { data: l } = await O.get('/mis-evaluaciones')
          c.value = l
        } catch (l) {
          ;(console.error('Error cargando evaluaciones:', l),
            x.notify({ type: 'negative', message: 'Error al cargar las evaluaciones programadas' }))
        } finally {
          y.value = !1
        }
      }
      const z = v(() =>
          [...new Set(c.value.map((e) => e.materia))].map((e) => ({ label: e, value: e })),
        ),
        q = [
          { label: '1° Parcial', value: '1° Parcial' },
          { label: '2° Parcial', value: '2° Parcial' },
          { label: 'Final', value: 'Final' },
          { label: '2da Instancia', value: '2da Instancia' },
        ],
        C = v(() =>
          c.value.filter(
            (l) =>
              !(
                (d.value.materia && l.materia !== d.value.materia) ||
                (d.value.parcial && l.parcial !== d.value.parcial)
              ),
          ),
        ),
        D = v(() => c.value.filter((l) => l.estado === 'Programada').length),
        B = v(() => c.value.filter((l) => l.estado === 'En Curso').length),
        S = v(() => c.value.filter((l) => l.estado === 'Completada').length)
      function F(l) {
        return (
          {
            '1° Parcial': 'blue',
            '2° Parcial': 'orange',
            '1er Parcial': 'blue',
            '2do Parcial': 'orange',
            Final: 'purple',
            '2da Instancia': 'red',
          }[l] || 'grey'
        )
      }
      function I(l) {
        return l || 'Examen'
      }
      function M(l) {
        return { Programada: 'blue', 'En Curso': 'green', Completada: 'purple' }[l] || 'grey'
      }
      function N(l) {
        return (
          { Programada: 'schedule', 'En Curso': 'play_circle', Completada: 'check_circle' }[l] ||
          'info'
        )
      }
      function A(l) {
        ;((n.value = l), (f.value = !0))
      }
      function $(l) {
        x.notify({ message: `Abriendo patrón de: ${l.materia}`, icon: 'fact_check' })
      }
      return (l, e) => (
        u(),
        _(
          Y,
          { class: 'evaluaciones-docente' },
          {
            default: i(() => [
              a('div', ea, [
                a('div', null, [
                  a('h1', sa, [
                    s(r, { name: 'quiz', color: 'orange', class: 'q-mr-sm' }),
                    e[3] || (e[3] = p(' Mis Evaluaciones ', -1)),
                  ]),
                  e[4] ||
                    (e[4] = a(
                      'p',
                      { class: 'page-subtitle' },
                      'Exámenes programados de tus materias',
                      -1,
                    )),
                ]),
              ]),
              a('div', la, [
                a('div', ta, [
                  s(r, { name: 'event', size: '32px', color: 'blue' }),
                  a('div', oa, [
                    a('span', ia, o(D.value), 1),
                    e[5] || (e[5] = a('span', { class: 'stat-label' }, 'Programadas', -1)),
                  ]),
                ]),
                a('div', ra, [
                  s(r, { name: 'play_circle', size: '32px', color: 'green' }),
                  a('div', na, [
                    a('span', da, o(B.value), 1),
                    e[6] || (e[6] = a('span', { class: 'stat-label' }, 'En Curso', -1)),
                  ]),
                ]),
                a('div', ca, [
                  s(r, { name: 'check_circle', size: '32px', color: 'purple' }),
                  a('div', ua, [
                    a('span', pa, o(S.value), 1),
                    e[7] || (e[7] = a('span', { class: 'stat-label' }, 'Completadas', -1)),
                  ]),
                ]),
              ]),
              a('div', ma, [
                s(
                  k,
                  {
                    modelValue: d.value.materia,
                    'onUpdate:modelValue': e[0] || (e[0] = (t) => (d.value.materia = t)),
                    options: z.value,
                    label: 'Materia',
                    outlined: '',
                    dense: '',
                    'emit-value': '',
                    'map-options': '',
                    clearable: '',
                    style: { width: '100%', 'max-width': '200px', 'min-width': '150px' },
                  },
                  null,
                  8,
                  ['modelValue', 'options'],
                ),
                s(
                  k,
                  {
                    modelValue: d.value.parcial,
                    'onUpdate:modelValue': e[1] || (e[1] = (t) => (d.value.parcial = t)),
                    options: q,
                    label: 'Parcial',
                    outlined: '',
                    dense: '',
                    'emit-value': '',
                    'map-options': '',
                    clearable: '',
                    style: { width: '100%', 'max-width': '150px', 'min-width': '120px' },
                  },
                  null,
                  8,
                  ['modelValue'],
                ),
              ]),
              a('div', va, [
                (u(!0),
                P(
                  T,
                  null,
                  G(
                    C.value,
                    (t) => (
                      u(),
                      _(
                        Q,
                        { key: t.id, class: 'eval-card' },
                        {
                          default: i(() => [
                            s(
                              h,
                              null,
                              {
                                default: i(() => [
                                  a('div', _a, [
                                    s(
                                      w,
                                      { color: F(t.parcial), 'text-color': 'white', size: 'sm' },
                                      { default: i(() => [p(o(I(t.parcial)), 1)]), _: 2 },
                                      1032,
                                      ['color'],
                                    ),
                                    s(
                                      w,
                                      {
                                        color: M(t.estado),
                                        'text-color': 'white',
                                        size: 'sm',
                                        icon: N(t.estado),
                                      },
                                      { default: i(() => [p(o(t.estado), 1)]), _: 2 },
                                      1032,
                                      ['color', 'icon'],
                                    ),
                                  ]),
                                  a('h3', fa, o(t.materia), 1),
                                  a('p', ga, o(t.grupo), 1),
                                  a('div', ha, [
                                    a('div', ba, [
                                      s(r, { name: 'event', size: '16px', color: 'grey-6' }),
                                      a('span', null, o(t.fecha), 1),
                                    ]),
                                    a('div', xa, [
                                      s(r, { name: 'schedule', size: '16px', color: 'grey-6' }),
                                      a('span', null, o(t.hora), 1),
                                    ]),
                                    a('div', ya, [
                                      s(r, { name: 'room', size: '16px', color: 'grey-6' }),
                                      a('span', null, o(t.aula), 1),
                                    ]),
                                  ]),
                                  a('div', Ca, [
                                    s(r, { name: 'help_outline', size: '16px', color: 'primary' }),
                                    a('span', null, o(t.preguntas) + ' preguntas', 1),
                                  ]),
                                ]),
                                _: 2,
                              },
                              1024,
                            ),
                            s(H),
                            s(
                              E,
                              null,
                              {
                                default: i(() => [
                                  s(
                                    b,
                                    {
                                      flat: '',
                                      color: 'primary',
                                      icon: 'visibility',
                                      label: 'Ver Detalles',
                                      onClick: (U) => A(t),
                                    },
                                    null,
                                    8,
                                    ['onClick'],
                                  ),
                                  s(J),
                                  t.estado === 'Completada'
                                    ? (u(),
                                      _(
                                        b,
                                        {
                                          key: 0,
                                          flat: '',
                                          color: 'green',
                                          icon: 'fact_check',
                                          onClick: (U) => $(t),
                                        },
                                        {
                                          default: i(() => [
                                            s(K, null, {
                                              default: i(() => [
                                                ...(e[8] || (e[8] = [p('Ver Patrón', -1)])),
                                              ]),
                                              _: 1,
                                            }),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ['onClick'],
                                      ))
                                    : g('', !0),
                                ]),
                                _: 2,
                              },
                              1024,
                            ),
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
              C.value.length === 0
                ? (u(),
                  P('div', Pa, [
                    s(r, { name: 'event_busy', size: '80px', color: 'grey-4' }),
                    e[9] ||
                      (e[9] = a(
                        'p',
                        { class: 'text-h6 text-grey-6 q-mt-md' },
                        'No hay evaluaciones',
                        -1,
                      )),
                    e[10] ||
                      (e[10] = a(
                        'p',
                        { class: 'text-caption text-grey-5' },
                        ' No tienes exámenes programados para las materias seleccionadas ',
                        -1,
                      )),
                  ]))
                : g('', !0),
              s(
                R,
                {
                  modelValue: f.value,
                  'onUpdate:modelValue': e[2] || (e[2] = (t) => (f.value = t)),
                },
                {
                  default: i(() => [
                    s(
                      Q,
                      { style: { 'min-width': '400px' } },
                      {
                        default: i(() => [
                          s(
                            h,
                            { class: 'bg-primary text-white' },
                            {
                              default: i(() => [
                                a('div', Qa, [
                                  s(r, { name: 'quiz', class: 'q-mr-sm' }),
                                  e[11] || (e[11] = p(' Detalles del Examen ', -1)),
                                ]),
                              ]),
                              _: 1,
                            },
                          ),
                          n.value
                            ? (u(),
                              _(
                                h,
                                { key: 0 },
                                {
                                  default: i(() => [
                                    a('div', Ea, [
                                      a('div', ka, [
                                        e[12] ||
                                          (e[12] = a(
                                            'span',
                                            { class: 'detalle-label' },
                                            'Materia',
                                            -1,
                                          )),
                                        a('span', wa, o(n.value.materia), 1),
                                      ]),
                                      a('div', Va, [
                                        e[13] ||
                                          (e[13] = a(
                                            'span',
                                            { class: 'detalle-label' },
                                            'Grupo',
                                            -1,
                                          )),
                                        a('span', za, o(n.value.grupo), 1),
                                      ]),
                                      a('div', qa, [
                                        e[14] ||
                                          (e[14] = a(
                                            'span',
                                            { class: 'detalle-label' },
                                            'Fecha',
                                            -1,
                                          )),
                                        a('span', Da, o(n.value.fecha), 1),
                                      ]),
                                      a('div', Ba, [
                                        e[15] ||
                                          (e[15] = a(
                                            'span',
                                            { class: 'detalle-label' },
                                            'Hora',
                                            -1,
                                          )),
                                        a('span', Sa, o(n.value.hora), 1),
                                      ]),
                                      a('div', Fa, [
                                        e[16] ||
                                          (e[16] = a(
                                            'span',
                                            { class: 'detalle-label' },
                                            'Aula',
                                            -1,
                                          )),
                                        a('span', Ia, o(n.value.aula), 1),
                                      ]),
                                      a('div', Ma, [
                                        e[17] ||
                                          (e[17] = a(
                                            'span',
                                            { class: 'detalle-label' },
                                            'Preguntas',
                                            -1,
                                          )),
                                        a('span', Na, o(n.value.preguntas), 1),
                                      ]),
                                      a('div', Aa, [
                                        e[18] ||
                                          (e[18] = a(
                                            'span',
                                            { class: 'detalle-label' },
                                            'Duración',
                                            -1,
                                          )),
                                        a('span', $a, o(n.value.duracion) + ' minutos', 1),
                                      ]),
                                    ]),
                                    s(
                                      X,
                                      { class: 'bg-blue-1 text-blue-9 q-mt-md', rounded: '' },
                                      {
                                        default: i(() => [
                                          s(r, { name: 'info', class: 'q-mr-sm' }),
                                          e[19] ||
                                            (e[19] = p(
                                              ' Recuerda llegar 15 minutos antes para preparar el aula ',
                                              -1,
                                            )),
                                        ]),
                                        _: 1,
                                      },
                                    ),
                                  ]),
                                  _: 1,
                                },
                              ))
                            : g('', !0),
                          s(
                            E,
                            { align: 'right' },
                            {
                              default: i(() => [
                                W(s(b, { flat: '', label: 'Cerrar' }, null, 512), [[Z]]),
                              ]),
                              _: 1,
                            },
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
        )
      )
    },
  },
  le = aa(Ua, [['__scopeId', 'data-v-5ec75094']])
export { le as default }
