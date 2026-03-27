import {
  u as z,
  e as D,
  f as R,
  r as s,
  i as $,
  j as C,
  k as o,
  l as t,
  m as a,
  q as _,
  Q as n,
  s as i,
  v as O,
  x as b,
  T as M,
  y as E,
  z as N,
  A as I,
  B as U,
  C as j,
  D as F,
  E as S,
  F as H,
  R as T,
} from './index-CVgKKHHv.js'
import { Q as B } from './QForm-D4j4qENs.js'
import { Q as G } from './QBanner-jrp6fMez.js'
import { Q as J } from './QPage-D-YrLEJA.js'
import { Q as K, a as W } from './QLayout-BILssmZv.js'
import { _ as X } from './_plugin-vue_export-helper-DlAUqK2U.js'
import './QScrollObserver-CGZlLTHV.js'
import './QResizeObserver-DSbEROZH.js'
const Y = { class: 'login-card shadow-24 relative-position row overflow-hidden animate-pop-in' },
  Z = { class: 'col-md-7 col-xs-12 form-panel bg-white flex flex-center relative-position' },
  ee = { class: 'form-content full-width q-pa-xl' },
  ae = { class: 'row items-center justify-between q-mt-sm' },
  te = { key: 0, class: 'q-mt-md' },
  le = { class: 'q-mb-sm' },
  oe = { key: 0, class: 'q-pa-sm bg-red-1 text-red-9 rounded-borders text-center text-caption' },
  se = { class: 'row q-mt-md' },
  re = {
    __name: 'LoginPage',
    setup(ie) {
      const V = z(),
        y = D(),
        P = R(),
        x = s(''),
        d = s(''),
        u = s(!1),
        Q = s(!1),
        w = s(!1),
        c = s(''),
        m = s(!1),
        h = s(''),
        p = s(''),
        k = s(''),
        v = s(!1),
        g = s(!1),
        q = s(!1),
        f = s('')
      async function L() {
        ;((w.value = !0), (c.value = ''), await new Promise((e) => setTimeout(e, 800)))
        const r = await y.login(x.value, d.value)
        if (((w.value = !1), r.success))
          if (r.passwordChangeRequired) ((h.value = d.value), (m.value = !0))
          else {
            P.notify({
              type: 'positive',
              message: `Bienvenido, ${r.usuario.nombre}`,
              position: 'top',
              timeout: 2500,
            })
            const e = r.usuario.rol === T.DOCENTE ? '/documentacion' : '/'
            V.push(e)
          }
        else c.value = r.error
      }
      async function A() {
        ;((q.value = !0), (f.value = ''))
        const r = await y.changePassword(p.value)
        if (((q.value = !1), r.success)) {
          ;((m.value = !1),
            P.notify({ type: 'positive', message: '¡Contraseña actualizada!', position: 'top' }))
          const e = y.rol === T.DOCENTE ? '/documentacion' : '/'
          V.push(e)
        } else f.value = r.error
      }
      return (r, e) => (
        C(),
        $(
          W,
          { view: 'lHh Lpr fff' },
          {
            default: o(() => [
              t(K, null, {
                default: o(() => [
                  t(
                    J,
                    { class: 'fullscreen-bg flex flex-center' },
                    {
                      default: o(() => [
                        e[17] ||
                          (e[17] = a(
                            'div',
                            { class: 'absolute-full overflow-hidden' },
                            [
                              a('div', { class: 'blob blob-1' }),
                              a('div', { class: 'blob blob-2' }),
                              a('div', { class: 'blob blob-3' }),
                              a('div', { class: 'glass-overlay absolute-full' }),
                            ],
                            -1,
                          )),
                        a('div', Y, [
                          e[13] ||
                            (e[13] = a(
                              'div',
                              {
                                class:
                                  'col-md-5 col-xs-12 branding-panel relative-position flex flex-center q-pa-lg text-white',
                              },
                              [
                                a('div', { class: 'absolute-full overlay-gradient' }),
                                a(
                                  'div',
                                  {
                                    class: 'relative-position z-top text-center',
                                    style: { width: '100%' },
                                  },
                                  [
                                    a('div', { class: 'logo-circle shadow-10 q-mb-lg' }, [
                                      a('img', {
                                        src: '/unitepc-logo-clean.png',
                                        class: 'logo-img',
                                        alt: 'UNITEPC Logo',
                                      }),
                                    ]),
                                    a(
                                      'h1',
                                      { class: 'text-h4 text-weight-bolder q-my-sm tracking-wide' },
                                      'UNITEPC',
                                    ),
                                    a(
                                      'div',
                                      {
                                        class:
                                          'text-subtitle2 text-uppercase opacity-70 tracking-widest q-mb-xl',
                                      },
                                      ' Documentación Académica ',
                                    ),
                                    a('div', { class: 'gt-sm' }, [
                                      a(
                                        'p',
                                        { class: 'text-body1 text-italic opacity-90 q-mb-none' },
                                        ' "Excelencia académica y gestión integral." ',
                                      ),
                                      a('div', {
                                        class:
                                          'separator-small q-my-md q-mx-auto bg-white opacity-50',
                                      }),
                                      a(
                                        'p',
                                        { class: 'text-caption opacity-70' },
                                        ' Acceso exclusivo para docentes y administrativos. ',
                                      ),
                                    ]),
                                  ],
                                ),
                              ],
                              -1,
                            )),
                          a('div', Z, [
                            a('div', ee, [
                              e[11] ||
                                (e[11] = a(
                                  'div',
                                  { class: 'text-left q-mb-lg' },
                                  [
                                    a(
                                      'h4',
                                      { class: 'text-primary text-weight-bold q-mb-xs' },
                                      'Bienvenido',
                                    ),
                                    a(
                                      'p',
                                      { class: 'text-grey-7' },
                                      'Ingresa tus credenciales para continuar.',
                                    ),
                                  ],
                                  -1,
                                )),
                              t(
                                B,
                                { onSubmit: _(L, ['prevent']), class: 'q-gutter-y-md' },
                                {
                                  default: o(() => [
                                    t(
                                      n,
                                      {
                                        modelValue: x.value,
                                        'onUpdate:modelValue':
                                          e[0] || (e[0] = (l) => (x.value = l)),
                                        filled: '',
                                        label: 'Usuario / CI',
                                        class: 'input-premium',
                                        color: 'primary',
                                        'bg-color': 'grey-1',
                                        rules: [(l) => !!l || 'El usuario es requerido'],
                                      },
                                      {
                                        prepend: o(() => [
                                          t(i, { name: 'account_circle', color: 'primary' }),
                                        ]),
                                        _: 1,
                                      },
                                      8,
                                      ['modelValue', 'rules'],
                                    ),
                                    t(
                                      n,
                                      {
                                        modelValue: d.value,
                                        'onUpdate:modelValue':
                                          e[2] || (e[2] = (l) => (d.value = l)),
                                        filled: '',
                                        type: u.value ? 'text' : 'password',
                                        label: 'Contraseña',
                                        class: 'input-premium',
                                        color: 'primary',
                                        'bg-color': 'grey-1',
                                        rules: [(l) => !!l || 'La contraseña es requerida'],
                                      },
                                      {
                                        prepend: o(() => [
                                          t(i, { name: 'lock', color: 'primary' }),
                                        ]),
                                        append: o(() => [
                                          t(
                                            i,
                                            {
                                              name: u.value ? 'visibility_off' : 'visibility',
                                              class: 'cursor-pointer opacity-50 hover-opacity-100',
                                              onClick: e[1] || (e[1] = (l) => (u.value = !u.value)),
                                            },
                                            null,
                                            8,
                                            ['name'],
                                          ),
                                        ]),
                                        _: 1,
                                      },
                                      8,
                                      ['modelValue', 'type', 'rules'],
                                    ),
                                    a('div', ae, [
                                      t(
                                        O,
                                        {
                                          modelValue: Q.value,
                                          'onUpdate:modelValue':
                                            e[3] || (e[3] = (l) => (Q.value = l)),
                                          label: 'Recordarme',
                                          color: 'primary',
                                          dense: '',
                                          class: 'text-body2 text-grey-8',
                                        },
                                        null,
                                        8,
                                        ['modelValue'],
                                      ),
                                      e[10] ||
                                        (e[10] = a(
                                          'a',
                                          {
                                            href: '#',
                                            class:
                                              'link-forget text-primary text-weight-bold text-caption',
                                          },
                                          ' ¿Olvidaste tu contraseña? ',
                                          -1,
                                        )),
                                    ]),
                                    t(
                                      b,
                                      {
                                        type: 'submit',
                                        color: 'primary',
                                        class: 'full-width btn-hero shadow-3 q-mt-lg',
                                        label: 'INICIAR SESIÓN',
                                        loading: w.value,
                                        unelevated: '',
                                        size: 'lg',
                                      },
                                      null,
                                      8,
                                      ['loading'],
                                    ),
                                  ]),
                                  _: 1,
                                },
                              ),
                              t(
                                M,
                                { name: 'fade' },
                                {
                                  default: o(() => [
                                    c.value
                                      ? (C(),
                                        E('div', te, [
                                          t(
                                            G,
                                            {
                                              class:
                                                'bg-red-1 text-red-9 rounded-borders border-red-left',
                                              dense: '',
                                            },
                                            {
                                              avatar: o(() => [
                                                t(i, { name: 'warning', color: 'red-9' }),
                                              ]),
                                              default: o(() => [I(' ' + U(c.value), 1)]),
                                              _: 1,
                                            },
                                          ),
                                        ]))
                                      : N('', !0),
                                  ]),
                                  _: 1,
                                },
                              ),
                              e[12] ||
                                (e[12] = a(
                                  'div',
                                  { class: 'text-center q-mt-xl text-caption text-grey-4' },
                                  ' © 2026 UNITEPC • v2.1 ',
                                  -1,
                                )),
                            ]),
                          ]),
                        ]),
                        t(
                          j,
                          {
                            modelValue: m.value,
                            'onUpdate:modelValue': e[9] || (e[9] = (l) => (m.value = l)),
                            persistent: '',
                            'backdrop-filter': 'blur(4px)',
                          },
                          {
                            default: o(() => [
                              t(
                                F,
                                {
                                  class: 'bg-white shadow-24 rounded-borders',
                                  style: { width: '100%', 'max-width': '450px' },
                                },
                                {
                                  default: o(() => [
                                    t(
                                      S,
                                      { class: 'bg-primary text-white q-py-lg text-center' },
                                      {
                                        default: o(() => [
                                          a('div', le, [
                                            t(H, {
                                              color: 'white',
                                              'text-color': 'primary',
                                              icon: 'lock_reset',
                                              size: '50px',
                                              class: 'shadow-2',
                                            }),
                                          ]),
                                          e[14] ||
                                            (e[14] = a(
                                              'div',
                                              { class: 'text-h6 text-weight-bold' },
                                              'Actualización de Seguridad',
                                              -1,
                                            )),
                                          e[15] ||
                                            (e[15] = a(
                                              'div',
                                              { class: 'text-caption opacity-90' },
                                              ' Tu contraseña ha expirado o es el primer acceso ',
                                              -1,
                                            )),
                                        ]),
                                        _: 1,
                                      },
                                    ),
                                    t(
                                      S,
                                      { class: 'q-px-lg q-pt-lg q-pb-md' },
                                      {
                                        default: o(() => [
                                          e[16] ||
                                            (e[16] = a(
                                              'p',
                                              { class: 'text-grey-8 text-center q-mb-md' },
                                              ' Por favor, establece una nueva contraseña segura para tu cuenta. ',
                                              -1,
                                            )),
                                          t(
                                            B,
                                            { onSubmit: _(A, ['prevent']), class: 'q-gutter-y-md' },
                                            {
                                              default: o(() => [
                                                t(
                                                  n,
                                                  {
                                                    outlined: '',
                                                    modelValue: h.value,
                                                    'onUpdate:modelValue':
                                                      e[4] || (e[4] = (l) => (h.value = l)),
                                                    label: 'Usuario / CI',
                                                    readonly: '',
                                                    'bg-color': 'grey-1',
                                                    dense: '',
                                                  },
                                                  {
                                                    prepend: o(() => [
                                                      t(i, { name: 'person', color: 'grey-6' }),
                                                    ]),
                                                    _: 1,
                                                  },
                                                  8,
                                                  ['modelValue'],
                                                ),
                                                t(
                                                  n,
                                                  {
                                                    outlined: '',
                                                    modelValue: p.value,
                                                    'onUpdate:modelValue':
                                                      e[6] || (e[6] = (l) => (p.value = l)),
                                                    type: v.value ? 'text' : 'password',
                                                    label: 'Nueva Contraseña',
                                                    rules: [
                                                      (l) => l.length >= 6 || 'Mínimo 6 caracteres',
                                                    ],
                                                    'bg-color': 'white',
                                                  },
                                                  {
                                                    prepend: o(() => [
                                                      t(i, { name: 'vpn_key', color: 'primary' }),
                                                    ]),
                                                    append: o(() => [
                                                      t(
                                                        b,
                                                        {
                                                          flat: '',
                                                          round: '',
                                                          dense: '',
                                                          icon: v.value
                                                            ? 'visibility_off'
                                                            : 'visibility',
                                                          onClick:
                                                            e[5] ||
                                                            (e[5] = (l) => (v.value = !v.value)),
                                                          color: 'grey-7',
                                                        },
                                                        null,
                                                        8,
                                                        ['icon'],
                                                      ),
                                                    ]),
                                                    _: 1,
                                                  },
                                                  8,
                                                  ['modelValue', 'type', 'rules'],
                                                ),
                                                t(
                                                  n,
                                                  {
                                                    outlined: '',
                                                    modelValue: k.value,
                                                    'onUpdate:modelValue':
                                                      e[8] || (e[8] = (l) => (k.value = l)),
                                                    type: g.value ? 'text' : 'password',
                                                    label: 'Confirmar Contraseña',
                                                    rules: [(l) => l === p.value || 'No coinciden'],
                                                    'bg-color': 'white',
                                                  },
                                                  {
                                                    prepend: o(() => [
                                                      t(i, {
                                                        name: 'check_circle',
                                                        color: 'primary',
                                                      }),
                                                    ]),
                                                    append: o(() => [
                                                      t(
                                                        b,
                                                        {
                                                          flat: '',
                                                          round: '',
                                                          dense: '',
                                                          icon: g.value
                                                            ? 'visibility_off'
                                                            : 'visibility',
                                                          onClick:
                                                            e[7] ||
                                                            (e[7] = (l) => (g.value = !g.value)),
                                                          color: 'grey-7',
                                                        },
                                                        null,
                                                        8,
                                                        ['icon'],
                                                      ),
                                                    ]),
                                                    _: 1,
                                                  },
                                                  8,
                                                  ['modelValue', 'type', 'rules'],
                                                ),
                                                f.value
                                                  ? (C(),
                                                    E('div', oe, [
                                                      t(i, { name: 'warning', class: 'q-mr-xs' }),
                                                      I(' ' + U(f.value), 1),
                                                    ]))
                                                  : N('', !0),
                                                a('div', se, [
                                                  t(
                                                    b,
                                                    {
                                                      type: 'submit',
                                                      color: 'primary',
                                                      label: 'Confirmar Cambio',
                                                      class:
                                                        'full-width q-py-sm text-weight-bold shadow-2 btn-rounded',
                                                      loading: q.value,
                                                      unelevated: '',
                                                      'no-caps': '',
                                                    },
                                                    null,
                                                    8,
                                                    ['loading'],
                                                  ),
                                                ]),
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
              }),
            ]),
            _: 1,
          },
        )
      )
    },
  },
  fe = X(re, [['__scopeId', 'data-v-d5aa7aa8']])
export { fe as default }
