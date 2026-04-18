const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/AdminDashboard-DSiZ3hK3.js',
      'assets/index-BlBvOMGE.js',
      'assets/index-BLlNTyMo.css',
      'assets/QChip-DKBiE8wd.js',
      'assets/QBadge-DiAnUcd0.js',
      'assets/QBtnToggle-CKPeH_SB.js',
      'assets/QBtnGroup-DpqpKo7X.js',
      'assets/QCircularProgress-DLZqXpF5.js',
      'assets/format-DyQxkAtJ.js',
      'assets/QPage-CXkddPvY.js',
      'assets/usePermisos-BwWTsntt.js',
      'assets/sedes-BvGrNuyB.js',
      'assets/carreras-3ndxH09a.js',
      'assets/asignaturas-HFseKX2g.js',
      'assets/dashboardService-CS8GYhGi.js',
      'assets/_plugin-vue_export-helper-DlAUqK2U.js',
      'assets/AdminDashboard-C4n3uPoX.css',
      'assets/VicerrectorNacionalDashboard-DVzg2EtH.js',
      'assets/QLinearProgress-DDgwSD3L.js',
      'assets/VicerrectorNacionalDashboard-BX4GplPG.css',
      'assets/VicerrectorSedeDashboard-9LfQGeqs.js',
      'assets/VicerrectorSedeDashboard-CqMQKf0J.css',
      'assets/DireccionAcademicaDashboard-ZTlmmeWc.js',
      'assets/QInnerLoading-CN-KDKaz.js',
      'assets/DireccionAcademicaDashboard-B17HxuFI.css',
      'assets/DirectorCarreraDashboard-CnD3ojKy.js',
      'assets/DirectorCarreraDashboard-Cbve4PS_.css',
      'assets/DocenteDashboard-hvLd1OpE.js',
      'assets/DocenteDashboard-BbscXg7D.css',
      'assets/EvaluacionesDashboard-BwcwSiJH.js',
      'assets/QItem-Ct2yf9BL.js',
      'assets/QItemLabel-DpaCr0ua.js',
      'assets/QList-Bxl9uK2v.js',
      'assets/EvaluacionesDashboard-BqZvzDzU.css',
    ]),
) => i.map((i) => d[i])
import {
  e as i,
  P as c,
  ac as e,
  i as s,
  j as a,
  k as n,
  y as m,
  ad as p,
  l as u,
  ae as o,
} from './index-BlBvOMGE.js'
import { Q as D } from './QSpinnerDots-jYVWnf2K.js'
import { Q as h } from './QPage-CXkddPvY.js'
import { _ as l } from './_plugin-vue_export-helper-DlAUqK2U.js'
const E = { key: 1, class: 'flex flex-center full-height' },
  b = {
    __name: 'IndexPage',
    setup(v) {
      const d = i(),
        r = {
          SuperAdminDashboard: e(() =>
            o(
              () => import('./AdminDashboard-DSiZ3hK3.js'),
              __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
            ),
          ),
          AdminDashboard: e(() =>
            o(
              () => import('./AdminDashboard-DSiZ3hK3.js'),
              __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
            ),
          ),
          VicerrectorNacionalDashboard: e(() =>
            o(
              () => import('./VicerrectorNacionalDashboard-DVzg2EtH.js'),
              __vite__mapDeps([17, 1, 2, 3, 4, 18, 9, 10, 11, 12, 13, 15, 19]),
            ),
          ),
          VicerrectorSedeDashboard: e(() =>
            o(
              () => import('./VicerrectorSedeDashboard-9LfQGeqs.js'),
              __vite__mapDeps([20, 1, 2, 3, 4, 7, 8, 18, 9, 10, 11, 12, 13, 15, 21]),
            ),
          ),
          DireccionAcademicaDashboard: e(() =>
            o(
              () => import('./DireccionAcademicaDashboard-ZTlmmeWc.js'),
              __vite__mapDeps([22, 1, 2, 3, 4, 18, 23, 9, 11, 15, 24]),
            ),
          ),
          DirectorCarreraDashboard: e(() =>
            o(
              () => import('./DirectorCarreraDashboard-CnD3ojKy.js'),
              __vite__mapDeps([25, 3, 1, 2, 4, 18, 7, 8, 9, 10, 11, 12, 13, 14, 15, 26]),
            ),
          ),
          DocenteDashboard: e(() =>
            o(
              () => import('./DocenteDashboard-hvLd1OpE.js'),
              __vite__mapDeps([27, 1, 2, 3, 4, 7, 8, 9, 11, 13, 15, 28]),
            ),
          ),
          EvaluacionesDashboard: e(() =>
            o(
              () => import('./EvaluacionesDashboard-BwcwSiJH.js'),
              __vite__mapDeps([29, 1, 2, 30, 31, 3, 32, 4, 9, 15, 33]),
            ),
          ),
        },
        t = c(() => {
          const _ = d.dashboard
          return r[_] || r.DocenteDashboard
        })
      return (_, f) => (
        a(),
        s(
          h,
          { class: 'dashboard-wrapper' },
          {
            default: n(() => [
              t.value
                ? (a(), s(p(t.value), { key: 0 }))
                : (a(), m('div', E, [u(D, { size: '40px', color: 'primary' })])),
            ]),
            _: 1,
          },
        )
      )
    },
  },
  x = l(b, [['__scopeId', 'data-v-724f34b6']])
export { x as default }
