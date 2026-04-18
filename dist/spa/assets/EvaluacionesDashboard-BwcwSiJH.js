import {
  r as m,
  i as p,
  j as c,
  k as t,
  m as a,
  l as s,
  A as n,
  s as i,
  B as l,
  D as f,
  E as r,
  y as h,
  a4 as x,
  a5 as b,
  F as P,
  af as C,
  x as E,
} from './index-BlBvOMGE.js'
import { Q, a as d } from './QItem-Ct2yf9BL.js'
import { Q as _ } from './QItemLabel-DpaCr0ua.js'
import { Q as w } from './QChip-DKBiE8wd.js'
import { Q as q } from './QList-Bxl9uK2v.js'
import { Q as I } from './QBadge-DiAnUcd0.js'
import { Q as B } from './QPage-CXkddPvY.js'
import { _ as z } from './_plugin-vue_export-helper-DlAUqK2U.js'
const k = { class: 'page-header' },
  D = { class: 'page-title' },
  N = { class: 'stats-grid q-mb-xl' },
  M = { class: 'stat-card stat-card--orange' },
  F = { class: 'stat-icon' },
  R = { class: 'stat-info' },
  V = { class: 'stat-value' },
  L = { class: 'stat-card stat-card--blue' },
  S = { class: 'stat-icon' },
  G = { class: 'stat-info' },
  j = { class: 'stat-value' },
  O = { class: 'stat-card stat-card--green' },
  T = { class: 'stat-icon' },
  H = { class: 'stat-info' },
  J = { class: 'stat-value' },
  K = { class: 'stat-card stat-card--purple' },
  U = { class: 'stat-icon' },
  W = { class: 'stat-info' },
  X = { class: 'stat-value' },
  Y = { class: 'row q-col-gutter-lg' },
  Z = { class: 'col-12 col-md-7' },
  $ = { class: 'section-title' },
  ss = { class: 'text-right' },
  as = { class: 'text-caption text-weight-bold' },
  ts = { class: 'text-caption text-grey-6' },
  es = { class: 'col-12 col-md-5' },
  os = { class: 'section-title' },
  ls = { class: 'section-title' },
  ns = {
    __name: 'EvaluacionesDashboard',
    setup(is) {
      const u = m({ pendientes: 12, enProceso: 3, entregados: 8, calificados: 5 }),
        y = m([
          {
            id: 1,
            materia: 'Anatomía I',
            carrera: 'MEDICINA',
            grupo: 'A',
            fecha: '14/03/2026',
            hora: '08:00',
            estado: 'Pendiente',
          },
          {
            id: 2,
            materia: 'Bioquímica',
            carrera: 'ENFERMERÍA',
            grupo: 'B',
            fecha: '15/03/2026',
            hora: '10:00',
            estado: 'Pendiente',
          },
          {
            id: 3,
            materia: 'Fisiología',
            carrera: 'MEDICINA',
            grupo: 'A',
            fecha: '16/03/2026',
            hora: '14:00',
            estado: 'En Proceso',
          },
        ]),
        A = m([
          { id: 1, nombre: 'Medicina', examenes: 5 },
          { id: 2, nombre: 'Enfermería', examenes: 3 },
          { id: 3, nombre: 'Odontología', examenes: 4 },
        ])
      function g(v) {
        return (
          { Pendiente: 'orange', 'En Proceso': 'blue', Entregado: 'green', Calificado: 'purple' }[
            v
          ] || 'grey'
        )
      }
      return (v, e) => (
        c(),
        p(
          B,
          { class: 'evaluaciones-dashboard' },
          {
            default: t(() => [
              a('div', k, [
                a('div', null, [
                  a('h1', D, [
                    s(i, { name: 'quiz', color: 'orange', class: 'q-mr-sm' }),
                    e[0] || (e[0] = n(' Panel de Evaluaciones ', -1)),
                  ]),
                  e[1] ||
                    (e[1] = a(
                      'p',
                      { class: 'page-subtitle' },
                      'Gestión y control de exámenes del campus',
                      -1,
                    )),
                ]),
              ]),
              a('div', N, [
                a('div', M, [
                  a('div', F, [s(i, { name: 'pending_actions', size: '32px' })]),
                  a('div', R, [
                    a('span', V, l(u.value.pendientes), 1),
                    e[2] || (e[2] = a('span', { class: 'stat-label' }, 'Pendientes', -1)),
                  ]),
                ]),
                a('div', L, [
                  a('div', S, [s(i, { name: 'hourglass_top', size: '32px' })]),
                  a('div', G, [
                    a('span', j, l(u.value.enProceso), 1),
                    e[3] || (e[3] = a('span', { class: 'stat-label' }, 'En Proceso', -1)),
                  ]),
                ]),
                a('div', O, [
                  a('div', T, [s(i, { name: 'assignment_turned_in', size: '32px' })]),
                  a('div', H, [
                    a('span', J, l(u.value.entregados), 1),
                    e[4] || (e[4] = a('span', { class: 'stat-label' }, 'Entregados', -1)),
                  ]),
                ]),
                a('div', K, [
                  a('div', U, [s(i, { name: 'grade', size: '32px' })]),
                  a('div', W, [
                    a('span', X, l(u.value.calificados), 1),
                    e[5] || (e[5] = a('span', { class: 'stat-label' }, 'Calificados', -1)),
                  ]),
                ]),
              ]),
              a('div', Y, [
                a('div', Z, [
                  s(
                    f,
                    { class: 'info-card' },
                    {
                      default: t(() => [
                        s(r, null, {
                          default: t(() => [
                            a('div', $, [
                              s(i, { name: 'upcoming', color: 'orange', class: 'q-mr-sm' }),
                              e[6] || (e[6] = n(' Próximos Exámenes (48h) ', -1)),
                            ]),
                          ]),
                          _: 1,
                        }),
                        s(
                          r,
                          { class: 'q-pt-none' },
                          {
                            default: t(() => [
                              s(
                                q,
                                { separator: '' },
                                {
                                  default: t(() => [
                                    (c(!0),
                                    h(
                                      x,
                                      null,
                                      b(
                                        y.value,
                                        (o) => (
                                          c(),
                                          p(
                                            Q,
                                            { key: o.id, class: 'exam-item' },
                                            {
                                              default: t(() => [
                                                s(
                                                  d,
                                                  { avatar: '' },
                                                  {
                                                    default: t(() => [
                                                      s(
                                                        P,
                                                        {
                                                          color: g(o.estado),
                                                          'text-color': 'white',
                                                          size: '40px',
                                                          icon: 'quiz',
                                                        },
                                                        null,
                                                        8,
                                                        ['color'],
                                                      ),
                                                    ]),
                                                    _: 2,
                                                  },
                                                  1024,
                                                ),
                                                s(
                                                  d,
                                                  null,
                                                  {
                                                    default: t(() => [
                                                      s(
                                                        _,
                                                        { class: 'text-weight-medium' },
                                                        {
                                                          default: t(() => [n(l(o.materia), 1)]),
                                                          _: 2,
                                                        },
                                                        1024,
                                                      ),
                                                      s(
                                                        _,
                                                        { caption: '' },
                                                        {
                                                          default: t(() => [
                                                            n(
                                                              l(o.carrera) +
                                                                ' • Grupo ' +
                                                                l(o.grupo),
                                                              1,
                                                            ),
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
                                                s(
                                                  d,
                                                  { side: '' },
                                                  {
                                                    default: t(() => [
                                                      a('div', ss, [
                                                        a('div', as, l(o.fecha), 1),
                                                        a('div', ts, l(o.hora), 1),
                                                        s(
                                                          w,
                                                          {
                                                            color: g(o.estado),
                                                            'text-color': 'white',
                                                            size: 'xs',
                                                            dense: '',
                                                          },
                                                          {
                                                            default: t(() => [n(l(o.estado), 1)]),
                                                            _: 2,
                                                          },
                                                          1032,
                                                          ['color'],
                                                        ),
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
                                          )
                                        ),
                                      ),
                                      128,
                                    )),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                            _: 1,
                          },
                        ),
                        s(C, null, {
                          default: t(() => [
                            s(E, {
                              flat: '',
                              color: 'primary',
                              label: 'Ver todos los exámenes',
                              'icon-right': 'arrow_forward',
                              to: '/evaluaciones/rol-examenes',
                              'no-caps': '',
                            }),
                          ]),
                          _: 1,
                        }),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                a('div', es, [
                  s(
                    f,
                    { class: 'info-card' },
                    {
                      default: t(() => [
                        s(r, null, {
                          default: t(() => [
                            a('div', os, [
                              s(i, { name: 'school', color: 'primary', class: 'q-mr-sm' }),
                              e[7] || (e[7] = n(' Mis Carreras Asignadas ', -1)),
                            ]),
                          ]),
                          _: 1,
                        }),
                        s(
                          r,
                          { class: 'q-pt-none' },
                          {
                            default: t(() => [
                              s(q, null, {
                                default: t(() => [
                                  (c(!0),
                                  h(
                                    x,
                                    null,
                                    b(
                                      A.value,
                                      (o) => (
                                        c(),
                                        p(
                                          Q,
                                          { key: o.id },
                                          {
                                            default: t(() => [
                                              s(
                                                d,
                                                { avatar: '' },
                                                {
                                                  default: t(() => [
                                                    s(i, { name: 'school', color: 'primary' }),
                                                  ]),
                                                  _: 1,
                                                },
                                              ),
                                              s(
                                                d,
                                                null,
                                                {
                                                  default: t(() => [
                                                    s(
                                                      _,
                                                      null,
                                                      {
                                                        default: t(() => [n(l(o.nombre), 1)]),
                                                        _: 2,
                                                      },
                                                      1024,
                                                    ),
                                                    s(
                                                      _,
                                                      { caption: '' },
                                                      {
                                                        default: t(() => [
                                                          n(
                                                            l(o.examenes) + ' exámenes programados',
                                                            1,
                                                          ),
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
                                              s(
                                                d,
                                                { side: '' },
                                                {
                                                  default: t(() => [
                                                    s(
                                                      I,
                                                      {
                                                        color: o.examenes > 0 ? 'orange' : 'grey-4',
                                                        'text-color':
                                                          o.examenes > 0 ? 'white' : 'grey-7',
                                                      },
                                                      {
                                                        default: t(() => [n(l(o.examenes), 1)]),
                                                        _: 2,
                                                      },
                                                      1032,
                                                      ['color', 'text-color'],
                                                    ),
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
                                _: 1,
                              }),
                            ]),
                            _: 1,
                          },
                        ),
                      ]),
                      _: 1,
                    },
                  ),
                  s(
                    f,
                    { class: 'info-card q-mt-md' },
                    {
                      default: t(() => [
                        s(r, null, {
                          default: t(() => [
                            a('div', ls, [
                              s(i, { name: 'info', color: 'blue', class: 'q-mr-sm' }),
                              e[8] || (e[8] = n(' Accesos Rápidos ', -1)),
                            ]),
                          ]),
                          _: 1,
                        }),
                        s(
                          r,
                          { class: 'q-pt-none q-gutter-sm' },
                          {
                            default: t(() => [
                              s(E, {
                                unelevated: '',
                                color: 'primary',
                                icon: 'list_alt',
                                label: 'Rol de Exámenes',
                                to: '/evaluaciones/rol-examenes',
                                'no-caps': '',
                                class: 'full-width',
                              }),
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
            ]),
            _: 1,
          },
        )
      )
    },
  },
  gs = z(ns, [['__scopeId', 'data-v-416b85fa']])
export { gs as default }
