import {
  aj as I,
  av as oa,
  r as x,
  P,
  a as ta,
  aw as g,
  i as L,
  j as n,
  k as t,
  m as s,
  l as o,
  y as b,
  s as q,
  x as m,
  D as Q,
  E as k,
  Q as V,
  B as c,
  A as f,
  a4 as pe,
  a5 as ve,
  a0 as Se,
  q as ge,
  T as sa,
  z as R,
  F as ia,
  C as W,
  a2 as we,
  af as le,
  W as K,
  aq as ke,
  ar as Oe,
  a1 as ra,
} from './index-BlBvOMGE.js'
import { Q as O } from './QSelect-BVdhM4WH.js'
import { Q as na } from './QSpinnerDots-jYVWnf2K.js'
import { Q as $ } from './QChip-DKBiE8wd.js'
import { Q as be } from './QSpace-e5fjk4Ja.js'
import { Q as G } from './QTooltip-DdlYA8z_.js'
import { Q as ua } from './QBadge-DiAnUcd0.js'
import { Q as de } from './QItemLabel-DpaCr0ua.js'
import { Q as oe, a as te } from './QItem-Ct2yf9BL.js'
import { Q as da } from './QList-Bxl9uK2v.js'
import { Q as ca, a as ma } from './QTable-DIr0Ti-m.js'
import { Q as pa } from './QPage-CXkddPvY.js'
import { C as X } from './ClosePopup-ntdN2KQk.js'
import { u as va } from './sedes-BvGrNuyB.js'
import { u as ga } from './carreras-3ndxH09a.js'
import { u as ba, a as _a } from './horarios-D0yd3wXB.js'
import { u as fa } from './asignaturas-HFseKX2g.js'
import { _ as ya } from './_plugin-vue_export-helper-DlAUqK2U.js'
import './QMenu-BQiozE0c.js'
import './selection-Cwf20igx.js'
import './rtl-DFPa-2ov.js'
import './format-DyQxkAtJ.js'
import './QLinearProgress-DDgwSD3L.js'
import './use-fullscreen-DBkJWwsi.js'
const _e = {
    getBloques(C = {}) {
      return I.get('/bloques', { params: C })
    },
    createBloque(C) {
      return I.post('/bloques', C)
    },
    updateBloque(C, E) {
      return I.put(`/bloques/${C}`, E)
    },
    deleteBloque(C) {
      return I.delete(`/bloques/${C}`)
    },
  },
  ha = oa('bloques', () => {
    const C = x([]),
      E = x(!1)
    async function ce(p = {}) {
      E.value = !0
      try {
        const r = await _e.getBloques(p)
        C.value = r.data
      } catch (r) {
        console.error('Error fetching bloques:', r)
      } finally {
        E.value = !1
      }
    }
    async function M(p) {
      E.value = !0
      try {
        const r = await _e.createBloque(p)
        return (C.value.push(r.data), r.data)
      } catch (r) {
        throw (console.error('Error creating bloque:', r), r)
      } finally {
        E.value = !1
      }
    }
    async function B(p, r) {
      E.value = !0
      try {
        const A = await _e.updateBloque(p, r),
          j = C.value.findIndex((Z) => Z.id === p)
        return (j !== -1 && (C.value[j] = A.data), A.data)
      } catch (A) {
        throw (console.error('Error updating bloque:', A), A)
      } finally {
        E.value = !1
      }
    }
    async function se(p) {
      E.value = !0
      try {
        ;(await _e.deleteBloque(p), (C.value = C.value.filter((r) => r.id !== p)))
      } catch (r) {
        throw (console.error('Error deleting bloque:', r), r)
      } finally {
        E.value = !1
      }
    }
    function Y(p) {
      return C.value.filter((r) => r.sede_id == p)
    }
    return {
      bloques: C,
      loading: E,
      fetchBloques: ce,
      createBloque: M,
      updateBloque: B,
      deleteBloque: se,
      getBloquesBySede: Y,
    }
  }),
  xa = { class: 'row items-center q-mb-md' },
  wa = { class: 'col' },
  Va = { class: 'row items-center no-wrap q-gutter-sm' },
  qa = { class: 'col-auto row q-gutter-xs' },
  Ca = { class: 'row q-col-gutter-sm items-end' },
  Aa = { class: 'col-12 col-sm-3' },
  Ea = { class: 'col-12 col-sm-3' },
  Na = { class: 'col-12 col-sm-3' },
  Sa = { class: 'col-12 col-sm-3' },
  ka = { key: 0, class: 'column items-center q-py-xl' },
  Oa = { key: 1, class: 'column items-center q-py-xl' },
  Ia = { class: 'q-mt-sm text-grey-6 text-body2' },
  za = { key: 2 },
  Ua = { class: 'row items-center q-mb-sm q-gutter-sm' },
  Ba = ['onClick'],
  Ta = { class: 'text-caption text-grey-7 q-mr-sm', style: { 'min-width': '70px' } },
  Pa = { class: 'text-weight-medium col ellipsis' },
  La = { key: 0, class: 'asig-body' },
  Ma = { key: 0, class: 'text-grey-5 text-caption q-pa-sm q-ml-lg' },
  Ra = { key: 1 },
  $a = { style: { width: '32px' }, class: 'row justify-center' },
  Da = { key: 0, class: 'col-2' },
  Qa = { class: 'row items-center no-wrap q-gutter-xs' },
  Ga = { key: 1, class: 'col-2' },
  ja = { key: 2, class: 'col-3' },
  Ha = { key: 0, class: 'row items-center no-wrap q-gutter-xs' },
  Fa = ['title'],
  Ja = { key: 1, class: 'text-caption text-grey-4 text-italic' },
  Wa = { key: 3, class: 'col-3' },
  Ka = { class: 'col-1 text-center' },
  Xa = { key: 1, class: 'text-grey-4 text-caption' },
  Ya = { class: 'col-2 text-center' },
  Za = { key: 0, class: 'text-caption text-weight-medium' },
  el = { key: 1, class: 'text-grey-4 text-caption' },
  al = { class: 'col-2' },
  ll = { key: 0, class: 'row items-center no-wrap q-gutter-xs' },
  ol = { class: 'text-caption' },
  tl = { key: 1, class: 'text-grey-4 text-caption' },
  sl = { key: 4, class: 'col-1 text-center' },
  il = { key: 5, class: 'col-1' },
  rl = { class: 'row q-ml-lg q-mt-xs q-mb-xs' },
  nl = { class: 'text-subtitle1 text-weight-bold' },
  ul = { class: 'row q-col-gutter-md' },
  dl = { class: 'col-12 col-md-3' },
  cl = { class: 'col-12 col-md-6' },
  ml = { class: 'col-12 col-md-3' },
  pl = { class: 'col-12 col-md-4' },
  vl = { class: 'col-12 col-md-4' },
  gl = { class: 'col-12 col-md-4' },
  bl = { class: 'col-4 col-md-2' },
  _l = { class: 'col-4 col-md-2' },
  fl = { class: 'col-4 col-md-2' },
  yl = { class: 'col-4 col-md-2' },
  hl = { class: 'col-4 col-md-2' },
  xl = { class: 'col-4 col-md-2' },
  wl = { class: 'text-subtitle1 text-weight-bold' },
  Vl = { class: 'q-ml-sm text-caption opacity-80' },
  ql = { class: 'row q-col-gutter-md' },
  Cl = { class: 'col-12 col-md-3' },
  Al = { class: 'col-12 col-md-3' },
  El = { class: 'col-12 col-md-3' },
  Nl = { class: 'col-12 col-md-3' },
  Sl = { class: 'col-12' },
  kl = { class: 'col-12 col-md-4' },
  Ol = { class: 'col-12 col-md-4' },
  Il = { class: 'col-12 col-md-4' },
  zl = { class: 'text-subtitle1 text-weight-bold' },
  Ul = { class: 'q-ml-sm text-caption opacity-80' },
  Bl = { class: 'row q-col-gutter-md' },
  Tl = { class: 'col-12 col-md-4' },
  Pl = { class: 'col-12 col-md-4' },
  Ll = { class: 'col-12 col-md-4' },
  Ml = { class: 'col-12' },
  Rl = { class: 'col-12 col-md-6' },
  $l = { class: 'row q-col-gutter-md' },
  Dl = { class: 'col-12 col-md-5' },
  Ql = { class: 'row items-center q-mb-sm' },
  Gl = { class: 'row no-wrap q-gutter-xs' },
  jl = { class: 'col-12 col-md-7' },
  Hl = { class: 'row items-center q-mb-sm' },
  Fl = { class: 'text-weight-bold text-subtitle2' },
  Jl = { key: 0, class: 'text-grey-5 text-caption text-center q-py-lg' },
  Wl = { class: 'row no-wrap q-gutter-xs' },
  Kl = { class: 'text-subtitle1 text-weight-bold' },
  Xl = { class: 'q-gutter-md' },
  Yl = { class: 'text-subtitle1 text-weight-bold' },
  Zl = { key: 0, class: 'q-ml-sm text-caption opacity-80' },
  eo = { class: 'q-gutter-md' },
  ao = { class: 'row q-col-gutter-sm' },
  lo = { class: 'col-6' },
  oo = { class: 'col-6' },
  to = { class: 'row items-center' },
  so = {
    __name: 'GestionAcademicaPage',
    setup(C) {
      const E = va(),
        ce = ga(),
        M = ba(),
        B = ha(),
        se = fa()
      _a()
      const Y = x(!1),
        p = x(!1),
        r = x(null),
        A = x(null),
        j = x(null),
        Z = x(''),
        H = x(new Set()),
        ie = x(!1),
        z = x([]),
        Ve = x([]),
        qe = P(() => E.sedes.map((l) => ({ label: l.nombre, value: l.id }))),
        Ie = P(() =>
          r.value
            ? ce.carreras
                .filter(
                  (l) =>
                    l.sede_id == r.value || (l.sedes_ids && l.sedes_ids.includes(Number(r.value))),
                )
                .map((l) => ({ label: l.nombre, value: l.id }))
            : [],
        ),
        ee = P(() => {
          let l = z.value
          if ((j.value && (l = l.filter((e) => e.plan_estudios === j.value)), Z.value)) {
            const e = Z.value.toLowerCase()
            l = l.filter((a) =>
              (a.nombre || '').toLowerCase().includes(e) ||
              (a.codigo || '').toLowerCase().includes(e)
                ? !0
                : a.grupos?.some(
                    (i) =>
                      (i.docente_nombre || '').toLowerCase().includes(e) ||
                      (i.nombre || '').toLowerCase().includes(e),
                  ),
            )
          }
          return l
        }),
        ze = P(() => ee.value.reduce((l, e) => l + (e.grupos?.length || 0), 0)),
        Ue = P(() =>
          ee.value.reduce(
            (l, e) => l + (e.grupos?.reduce((a, i) => a + (i.horarios?.length || 0), 0) || 0),
            0,
          ),
        )
      function Be(l) {
        const e = new Set(H.value)
        ;(e.has(l) ? e.delete(l) : e.add(l), (H.value = e))
      }
      function Te() {
        ;((ie.value = !ie.value),
          ie.value ? (H.value = new Set(ee.value.map((l) => l.id))) : (H.value = new Set()))
      }
      function Ce(l) {
        return !l.horarios || l.horarios.length === 0
          ? [{ horario: null }]
          : l.horarios.map((e) => ({ horario: e }))
      }
      function me(l) {
        return l === 'TEORICO'
          ? { bg: 'blue-2', text: 'blue-9', border: 'blue' }
          : l === 'PRACTICO'
            ? { bg: 'green-2', text: 'green-9', border: 'green' }
            : l === 'LABORATORIO'
              ? { bg: 'orange-2', text: 'orange-9', border: 'orange' }
              : { bg: 'grey-2', text: 'grey-7', border: 'grey' }
      }
      function Pe(l) {
        return { TEORICO: 'Teórico', PRACTICO: 'Práctico', LABORATORIO: 'Lab.' }[l] || l
      }
      function Le(l) {
        return (
          {
            LUNES: 'Lun',
            MARTES: 'Mar',
            MIERCOLES: 'Mié',
            JUEVES: 'Jue',
            VIERNES: 'Vie',
            SABADO: 'Sáb',
            DOMINGO: 'Dom',
          }[l] || l
        )
      }
      function Me(l) {
        return (
          {
            LUNES: 'blue-2',
            MARTES: 'green-2',
            MIERCOLES: 'amber-2',
            JUEVES: 'orange-2',
            VIERNES: 'red-2',
            SABADO: 'purple-2',
            DOMINGO: 'grey-3',
          }[l] || 'grey-2'
        )
      }
      function Re(l) {
        return (
          {
            LUNES: 'blue-9',
            MARTES: 'green-9',
            MIERCOLES: 'amber-10',
            JUEVES: 'orange-9',
            VIERNES: 'red-9',
            SABADO: 'purple-9',
            DOMINGO: 'grey-8',
          }[l] || 'grey-9'
        )
      }
      ta(async () => {
        ;(
          await Promise.allSettled([
            E.fetchSedes(),
            ce.fetchCarreras(),
            M.fetchAulas(),
            B.fetchBloques(),
          ])
        ).forEach((a, i) => {
          a.status === 'rejected' &&
            console.warn(
              `[GestionAcademica] Error cargando ${['sedes', 'carreras', 'aulas', 'bloques'][i]}:`,
              a.reason,
            )
        })
        const e = E.sedes.find((a) => a.nombre?.toLowerCase().includes('cochabamba'))
        e ? ((r.value = e.id), await fe(e.id), await F()) : await fe()
      })
      function $e() {
        ;((A.value = null), (z.value = []), r.value && F())
      }
      async function F() {
        if (!(!r.value && !A.value)) {
          Y.value = !0
          try {
            const l = { per_page: 500 }
            ;(r.value && (l.sede_id = r.value), A.value && (l.carrera_id = A.value))
            const a = (await I.get('/grupos-flat', { params: l })).data.data || [],
              i = {}
            ;(r.value && (i.sede_id = r.value), A.value && (i.carrera_id = A.value))
            const u = await I.get('/horarios', { params: i }),
              y = {}
            u.data.forEach((h) => {
              ;(y[h.grupo_id] || (y[h.grupo_id] = []), y[h.grupo_id].push(h))
            })
            const S = a.map((h) => ({ ...h, horarios: y[h.id] || [] })),
              ae = {}
            ;(S.filter((h) => h.asignatura_id && h.asignatura_nombre).forEach((h) => {
              ;(ae[h.asignatura_id] ||
                (ae[h.asignatura_id] = {
                  id: h.asignatura_id,
                  nombre: h.asignatura_nombre,
                  codigo: h.asignatura_codigo,
                  plan_estudios: h.asignatura_plan || null,
                  grupos: [],
                }),
                ae[h.asignatura_id].grupos.push(h))
            }),
              (z.value = Object.values(ae)
                .filter((h) => h.nombre)
                .sort((h, la) => (h.nombre || '').localeCompare(la.nombre || ''))))
          } catch (l) {
            g.create({ type: 'negative', message: 'Error cargando datos: ' + l.message })
          } finally {
            Y.value = !1
          }
        }
      }
      async function De() {
        ;(await Promise.all([M.fetchAulas(), B.fetchBloques()]), await F())
      }
      async function fe(l = null) {
        try {
          const e = l ? { sede_id: l } : {},
            a = await I.get('/docentes-simple', { params: e }),
            i = Array.isArray(a.data) ? a.data : []
          return ((Ve.value = i), (ne.value = i), i)
        } catch (e) {
          return (
            console.warn('[GestionAcademica] No se pudo cargar docentes-simple:', e.message),
            []
          )
        }
      }
      const re = P(() => Ve.value),
        ne = x([])
      function Qe(l, e) {
        e(() => {
          ne.value = l
            ? re.value.filter((a) => a.nombre_completo.toLowerCase().includes(l.toLowerCase()))
            : re.value
        })
      }
      const ye = P(() =>
          M.aulas.map((l) => ({
            id: l.id,
            label: l.nombre,
            detalle: l.bloque
              ? `${l.bloque.nombre} · ${l.bloque.sede?.nombre || ''}${l.capacidad ? ' · Cap.' + l.capacidad : ''}`
              : '',
            sede_id: l.bloque?.sede_id || l.bloque?.sede?.id,
            bloque_nombre: l.bloque?.nombre || '',
          })),
        ),
        he = x([])
      function Ge(l, e) {
        const a = w.value._sedeId || r.value,
          i = a ? ye.value.filter((u) => u.sede_id == a) : ye.value
        e(() => {
          he.value = l
            ? i.filter((u) => (u.label + u.detalle).toLowerCase().includes(l.toLowerCase()))
            : i
        })
      }
      const je = P(() =>
          B.bloques.map((l) => ({
            label: `${l.nombre} (${l.sede?.nombre || 'Sede ' + l.sede_id})`,
            value: l.id,
          })),
        ),
        Ae = P(() => (r.value ? B.bloques.filter((l) => l.sede_id == r.value) : B.bloques)),
        v = x({
          asignatura: !1,
          grupo: !1,
          horario: !1,
          aulas: !1,
          bloque: !1,
          aula: !1,
          eliminar: !1,
        }),
        d = x({}),
        _ = x({}),
        w = x({}),
        D = x({}),
        U = x({}),
        xe = x(''),
        T = x(null),
        He = P(() => {
          if (!T.value) return ''
          const l = xe.value
          return l === 'asignatura'
            ? `¿Eliminar la asignatura "${T.value.nombre}"? Se eliminarán también sus grupos y horarios.`
            : l === 'grupo'
              ? `¿Eliminar el grupo "${T.value.nombre}" (${T.value.asignatura_nombre || ''})? Se eliminarán también sus horarios.`
              : l === 'horario'
                ? `¿Eliminar el horario del ${T.value.dia} ${T.value.hora_inicio}–${T.value.hora_fin}?`
                : l === 'aula'
                  ? `¿Eliminar el aula "${T.value.nombre}"?`
                  : l === 'bloque'
                    ? `¿Eliminar el bloque "${T.value.nombre}"? Solo se puede si no tiene aulas.`
                    : ''
        })
      async function J(l, e, a = {}) {
        l === 'asignatura'
          ? ((d.value = e
              ? {
                  id: e.id,
                  codigo: e.codigo,
                  nombre: e.nombre,
                  sigla: e.sigla || '',
                  plan_estudios: e.plan_estudios || null,
                  estado: e.estado || 'EN_PROCESO',
                  modalidad: e.modalidad || null,
                  creditos: e.creditos ?? 0,
                  horas_teoricas: e.horas_teoricas ?? 0,
                  horas_practicas: e.horas_practicas ?? 0,
                  horas_laboratorio: e.horas_laboratorio ?? 0,
                  sesiones_semanales: e.sesiones_semanales ?? 0,
                  carga_horaria_total: e.carga_horaria_total ?? 0,
                }
              : {
                  codigo: '',
                  nombre: '',
                  sigla: '',
                  plan_estudios: null,
                  estado: 'EN_PROCESO',
                  modalidad: null,
                  creditos: 0,
                  horas_teoricas: 0,
                  horas_practicas: 0,
                  horas_laboratorio: 0,
                  sesiones_semanales: 0,
                  carga_horaria_total: 0,
                }),
            (v.value.asignatura = !0))
          : l === 'grupo'
            ? ((ne.value = re.value),
              ne.value.length === 0 && (await fe(r.value || null)),
              (_.value = e
                ? {
                    id: e.id,
                    nombre: e.nombre,
                    tipo: e.tipo || 'TEORICO',
                    turno: e.turno || null,
                    estado: e.estado || 'ACTIVO',
                    docente_id: e.docente_id ? Number(e.docente_id) : null,
                    plan_estudios: e.plan_estudios || null,
                    gestion: e.gestion || '1-2026',
                    id_horario_api: e.id_horario_api ? Number(e.id_horario_api) : null,
                    asignatura_id: e.asignatura_id || a.asignaturaId,
                    carrera_id: e.carrera_id || A.value || null,
                    sede_id: e.sede_id || r.value || null,
                    _asignaturaNombre: a.asignaturaNombre || e.asignatura_nombre || '',
                  }
                : {
                    nombre: '',
                    tipo: 'TEORICO',
                    turno: null,
                    estado: 'ACTIVO',
                    docente_id: null,
                    plan_estudios: null,
                    gestion: '1-2026',
                    id_horario_api: null,
                    asignatura_id: a.asignaturaId,
                    carrera_id: A.value || null,
                    sede_id: r.value || null,
                    _asignaturaNombre: a.asignaturaNombre || '',
                  }),
              (v.value.grupo = !0))
            : l === 'horario' &&
              ((he.value = ye.value.filter((i) => !r.value || i.sede_id == r.value)),
              (w.value = e
                ? {
                    id: e.id,
                    dia: e.dia,
                    hora_inicio: e.hora_inicio?.substring(0, 5) || '',
                    hora_fin: e.hora_fin?.substring(0, 5) || '',
                    aula_id: e.aula_id ? Number(e.aula_id) : null,
                    id_horario_api: e.id_horario_api ? Number(e.id_horario_api) : null,
                    grupo_id: e.grupo_id || a.grupoId,
                    _grupoNombre: a.grupoNombre || '',
                    _asignaturaNombre: a.asignaturaNombre || '',
                    _sedeId: r.value,
                  }
                : {
                    dia: '',
                    hora_inicio: '',
                    hora_fin: '',
                    aula_id: null,
                    id_horario_api: null,
                    grupo_id: a.grupoId,
                    _grupoNombre: a.grupoNombre || '',
                    _asignaturaNombre: a.asignaturaNombre || '',
                    _sedeId: r.value,
                  }),
              (v.value.horario = !0))
      }
      function Fe() {
        ;((N.value = Ae.value[0] || null), (v.value.aulas = !0))
      }
      async function Je() {
        const l = d.value
        if (!l.codigo?.trim() || !l.nombre?.trim()) {
          g.create({ type: 'warning', message: 'Código y nombre son obligatorios' })
          return
        }
        p.value = !0
        try {
          const e = {
            codigo: l.codigo.trim(),
            nombre: l.nombre.trim(),
            sigla: l.sigla?.trim() || null,
            plan_estudios: l.plan_estudios || null,
            estado: l.estado || 'EN_PROCESO',
            modalidad: l.modalidad || null,
            creditos: l.creditos ?? 0,
            horas_teoricas: l.horas_teoricas ?? 0,
            horas_practicas: l.horas_practicas ?? 0,
            horas_laboratorio: l.horas_laboratorio ?? 0,
            sesiones_semanales: l.sesiones_semanales ?? 0,
            carga_horaria_total: l.carga_horaria_total ?? 0,
            modificado_localmente: !0,
          }
          if (l.id) {
            if ((await se.updateAsignatura(l.id, e), e.plan_estudios !== null)) {
              ;(g.create({
                type: 'positive',
                message:
                  'Asignatura actualizada. Si había duplicados del mismo código, se fusionaron automáticamente.',
                timeout: 4e3,
              }),
                (v.value.asignatura = !1),
                await F())
              return
            }
            const a = z.value.find((i) => i.id === l.id)
            ;(a && ((a.nombre = e.nombre), (a.plan_estudios = e.plan_estudios)),
              g.create({ type: 'positive', message: 'Asignatura actualizada' }))
          } else
            (await se.createAsignatura(e),
              g.create({ type: 'positive', message: 'Asignatura creada' }),
              await F())
          v.value.asignatura = !1
        } catch (e) {
          const a =
            e.response?.data?.message ||
            Object.values(e.response?.data?.errors || {})
              .flat()
              .join(' | ') ||
            e.message
          g.create({ type: 'negative', message: 'Error: ' + a })
        } finally {
          p.value = !1
        }
      }
      async function We() {
        const l = _.value
        if (!l.nombre?.trim() || !l.tipo || !l.gestion?.trim()) {
          g.create({ type: 'warning', message: 'Nombre, tipo y gestión son obligatorios' })
          return
        }
        p.value = !0
        try {
          const e = {
            nombre: l.nombre.trim(),
            asignatura_id: l.asignatura_id,
            carrera_id: l.carrera_id || A.value || null,
            sede_id: l.sede_id || r.value || null,
            tipo: l.tipo,
            turno: l.turno || null,
            estado: l.estado || 'ACTIVO',
            docente_id: l.docente_id || null,
            plan_estudios: l.plan_estudios || null,
            gestion: l.gestion.trim(),
            id_horario_api: l.id_horario_api || null,
            modificado_localmente: !0,
          }
          if (l.id) {
            await I.put(`/grupos/${l.id}`, e)
            const a = z.value.find((i) => i.grupos?.some((u) => u.id === l.id))
            if (a) {
              const i = a.grupos.find((u) => u.id === l.id)
              i &&
                Object.assign(i, {
                  ...e,
                  docente_nombre: e.docente_id
                    ? re.value.find((u) => u.id === e.docente_id)?.nombre_completo ||
                      i.docente_nombre
                    : null,
                })
            }
            g.create({ type: 'positive', message: 'Grupo actualizado' })
          } else {
            const a = await I.post('/grupos', e),
              i = z.value.find((u) => u.id === l.asignatura_id)
            ;(i
              ? i.grupos.push({
                  ...a.data,
                  asignatura_nombre: i.nombre,
                  asignatura_codigo: i.codigo,
                  docente_nombre:
                    (e.docente_id &&
                      re.value.find((u) => u.id === e.docente_id)?.nombre_completo) ||
                    null,
                  horarios: [],
                })
              : await F(),
              g.create({ type: 'positive', message: 'Grupo creado' }))
          }
          v.value.grupo = !1
        } catch (e) {
          const a =
            e.response?.data?.message ||
            Object.values(e.response?.data?.errors || {})
              .flat()
              .join(' | ') ||
            e.message
          g.create({ type: 'negative', message: 'Error: ' + a })
        } finally {
          p.value = !1
        }
      }
      async function Ke() {
        const l = w.value
        if (!l.dia || !l.hora_inicio || !l.hora_fin) {
          g.create({ type: 'warning', message: 'Día y horas son obligatorios' })
          return
        }
        p.value = !0
        try {
          const e = {
              grupo_id: l.grupo_id,
              dia: l.dia,
              hora_inicio: l.hora_inicio,
              hora_fin: l.hora_fin,
              aula_id: l.aula_id || null,
              id_horario_api: l.id_horario_api || null,
              modificado_localmente: !0,
            },
            a = l.aula_id ? M.getAulaById(l.aula_id) : null
          if (l.id) {
            const i = await I.put(`/horarios/${l.id}`, e)
            for (const u of z.value) {
              const y = u.grupos?.find((S) => S.id === l.grupo_id)
              if (y) {
                const S = y.horarios.findIndex((ae) => ae.id === l.id)
                S !== -1 &&
                  (y.horarios[S] = { ...y.horarios[S], ...i.data, aula: a || y.horarios[S].aula })
                break
              }
            }
            g.create({ type: 'positive', message: 'Horario actualizado' })
          } else {
            const i = await I.post('/horarios', e)
            for (const u of z.value) {
              const y = u.grupos?.find((S) => S.id === l.grupo_id)
              if (y) {
                y.horarios.push({ ...i.data, aula: a || null })
                break
              }
            }
            g.create({ type: 'positive', message: 'Horario creado' })
          }
          v.value.horario = !1
        } catch (e) {
          const a =
            e.response?.data?.message ||
            Object.values(e.response?.data?.errors || {})
              .flat()
              .join(' | ') ||
            e.message
          g.create({ type: 'negative', message: 'Error: ' + a })
        } finally {
          p.value = !1
        }
      }
      const N = x(null),
        Xe = P(() => (N.value ? M.aulas.filter((l) => l.bloque_id === N.value.id) : [])),
        Ye = [
          { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: !0 },
          { name: 'capacidad', label: 'Cap.', field: 'capacidad', align: 'center' },
          { name: 'pupitres', label: 'Pupitres', field: 'pupitres', align: 'center' },
          { name: 'actions', label: 'Acciones', align: 'center' },
        ]
      function Ee(l) {
        ;((D.value = l
          ? { id: l.id, nombre: l.nombre, sede_id: l.sede_id }
          : { nombre: '', sede_id: r.value || null }),
          (v.value.bloque = !0))
      }
      function Ne(l) {
        ;((U.value = l
          ? {
              id: l.id,
              nombre: l.nombre,
              bloque_id: l.bloque_id,
              capacidad: l.capacidad,
              pupitres: l.pupitres,
            }
          : { nombre: '', bloque_id: N.value?.id || null, capacidad: null, pupitres: null }),
          (v.value.aula = !0))
      }
      async function Ze() {
        const l = D.value
        if (!l.nombre?.trim() || !l.sede_id) {
          g.create({ type: 'warning', message: 'Nombre y sede son obligatorios' })
          return
        }
        p.value = !0
        try {
          const e = { nombre: l.nombre.trim(), sede_id: l.sede_id }
          if (l.id)
            (await B.updateBloque(l.id, e),
              g.create({ type: 'positive', message: 'Bloque actualizado' }))
          else {
            const a = await B.createBloque(e)
            ;((N.value = a), g.create({ type: 'positive', message: 'Bloque creado' }))
          }
          v.value.bloque = !1
        } catch (e) {
          g.create({
            type: 'negative',
            message: 'Error: ' + (e.response?.data?.message || e.message),
          })
        } finally {
          p.value = !1
        }
      }
      async function ea() {
        const l = U.value
        if (!l.nombre?.trim() || !l.bloque_id) {
          g.create({ type: 'warning', message: 'Nombre y bloque son obligatorios' })
          return
        }
        p.value = !0
        try {
          const e = {
            nombre: l.nombre.trim(),
            bloque_id: l.bloque_id,
            capacidad: l.capacidad || null,
            pupitres: l.pupitres || null,
          }
          ;(l.id
            ? (await M.updateAula(l.id, e),
              g.create({ type: 'positive', message: 'Aula actualizada' }))
            : (await M.createAula(e), g.create({ type: 'positive', message: 'Aula creada' })),
            (v.value.aula = !1))
        } catch (e) {
          g.create({
            type: 'negative',
            message: 'Error: ' + (e.response?.data?.message || e.message),
          })
        } finally {
          p.value = !1
        }
      }
      function ue(l, e) {
        ;((xe.value = l), (T.value = e), (v.value.eliminar = !0))
      }
      async function aa() {
        p.value = !0
        try {
          const l = xe.value,
            e = T.value
          if (l === 'asignatura')
            (await se.deleteAsignatura(e.id),
              (z.value = z.value.filter((a) => a.id !== e.id)),
              g.create({ type: 'positive', message: 'Asignatura eliminada' }))
          else if (l === 'grupo') {
            await I.delete(`/grupos/${e.id}`)
            for (const a of z.value) a.grupos && (a.grupos = a.grupos.filter((i) => i.id !== e.id))
            g.create({ type: 'positive', message: 'Grupo eliminado' })
          } else if (l === 'horario') {
            await I.delete(`/horarios/${e.id}`)
            for (const a of z.value)
              for (const i of a.grupos || [])
                i.horarios = (i.horarios || []).filter((u) => u.id !== e.id)
            g.create({ type: 'positive', message: 'Horario eliminado' })
          } else
            l === 'aula'
              ? (await M.deleteAula(e.id),
                g.create({ type: 'positive', message: 'Aula eliminada' }))
              : l === 'bloque' &&
                (await B.deleteBloque(e.id),
                N.value?.id === e.id && (N.value = null),
                g.create({ type: 'positive', message: 'Bloque eliminado' }))
          v.value.eliminar = !1
        } catch (l) {
          g.create({
            type: 'negative',
            message: 'Error: ' + (l.response?.data?.message || l.message),
          })
        } finally {
          p.value = !1
        }
      }
      return (l, e) => (
        n(),
        L(
          pa,
          { class: 'q-pa-md gestion-page' },
          {
            default: t(() => [
              s('div', xa, [
                s('div', wa, [
                  s('div', Va, [
                    o(q, { name: 'grid_view', size: '28px', color: 'primary' }),
                    e[47] ||
                      (e[47] = s(
                        'div',
                        null,
                        [
                          s(
                            'div',
                            { class: 'text-h6 text-weight-bold', style: { 'line-height': '1.2' } },
                            'Gestión Académica',
                          ),
                          s(
                            'div',
                            { class: 'text-caption text-grey-6' },
                            'Edición local completa · sin sincronización',
                          ),
                        ],
                        -1,
                      )),
                  ]),
                ]),
                s('div', qa, [
                  o(m, {
                    flat: '',
                    dense: '',
                    icon: 'meeting_room',
                    label: 'Aulas',
                    color: 'grey-7',
                    size: 'sm',
                    onClick: Fe,
                  }),
                  o(
                    m,
                    {
                      flat: '',
                      dense: '',
                      icon: 'refresh',
                      color: 'grey-7',
                      size: 'sm',
                      loading: Y.value,
                      onClick: De,
                    },
                    null,
                    8,
                    ['loading'],
                  ),
                  o(m, {
                    color: 'primary',
                    icon: 'add',
                    label: 'Nueva asignatura',
                    size: 'sm',
                    onClick: e[0] || (e[0] = (a) => J('asignatura', null)),
                  }),
                ]),
              ]),
              o(
                Q,
                { flat: '', bordered: '', class: 'q-mb-md filtros-card' },
                {
                  default: t(() => [
                    o(
                      k,
                      { class: 'q-py-sm' },
                      {
                        default: t(() => [
                          s('div', Ca, [
                            s('div', Aa, [
                              o(
                                O,
                                {
                                  modelValue: r.value,
                                  'onUpdate:modelValue': [
                                    e[1] || (e[1] = (a) => (r.value = a)),
                                    $e,
                                  ],
                                  options: qe.value,
                                  label: 'Sede',
                                  outlined: '',
                                  dense: '',
                                  clearable: '',
                                  'emit-value': '',
                                  'map-options': '',
                                },
                                {
                                  prepend: t(() => [
                                    o(q, { name: 'location_city', size: '18px', color: 'grey-6' }),
                                  ]),
                                  _: 1,
                                },
                                8,
                                ['modelValue', 'options'],
                              ),
                            ]),
                            s('div', Ea, [
                              o(
                                O,
                                {
                                  modelValue: A.value,
                                  'onUpdate:modelValue': [e[2] || (e[2] = (a) => (A.value = a)), F],
                                  options: Ie.value,
                                  label: 'Carrera',
                                  outlined: '',
                                  dense: '',
                                  clearable: '',
                                  'emit-value': '',
                                  'map-options': '',
                                  disable: !r.value,
                                },
                                {
                                  prepend: t(() => [
                                    o(q, { name: 'school', size: '18px', color: 'grey-6' }),
                                  ]),
                                  _: 1,
                                },
                                8,
                                ['modelValue', 'options', 'disable'],
                              ),
                            ]),
                            s('div', Na, [
                              o(
                                O,
                                {
                                  modelValue: j.value,
                                  'onUpdate:modelValue': e[3] || (e[3] = (a) => (j.value = a)),
                                  options: [
                                    { label: 'Malla Nueva (N)', value: 'N' },
                                    { label: 'Malla Antigua (A)', value: 'A' },
                                  ],
                                  label: 'Plan de Malla',
                                  outlined: '',
                                  dense: '',
                                  clearable: '',
                                  'emit-value': '',
                                  'map-options': '',
                                },
                                {
                                  prepend: t(() => [
                                    o(q, { name: 'account_tree', size: '18px', color: 'grey-6' }),
                                  ]),
                                  _: 1,
                                },
                                8,
                                ['modelValue'],
                              ),
                            ]),
                            s('div', Sa, [
                              o(
                                V,
                                {
                                  modelValue: Z.value,
                                  'onUpdate:modelValue': e[4] || (e[4] = (a) => (Z.value = a)),
                                  outlined: '',
                                  dense: '',
                                  clearable: '',
                                  placeholder: 'Buscar materia, docente...',
                                },
                                {
                                  prepend: t(() => [
                                    o(q, { name: 'search', size: '18px', color: 'grey-6' }),
                                  ]),
                                  _: 1,
                                },
                                8,
                                ['modelValue'],
                              ),
                            ]),
                          ]),
                        ]),
                        _: 1,
                      },
                    ),
                  ]),
                  _: 1,
                },
              ),
              Y.value
                ? (n(),
                  b('div', ka, [
                    o(na, { color: 'primary', size: '40px' }),
                    e[48] ||
                      (e[48] = s('div', { class: 'q-mt-sm text-grey-6' }, 'Cargando datos...', -1)),
                  ]))
                : ee.value.length === 0
                  ? (n(),
                    b('div', Oa, [
                      o(q, { name: 'school', size: '56px', color: 'grey-4' }),
                      s(
                        'div',
                        Ia,
                        c(
                          r.value
                            ? 'No se encontraron asignaturas con los filtros actuales'
                            : 'Selecciona una sede para comenzar',
                        ),
                        1,
                      ),
                    ]))
                  : (n(),
                    b('div', za, [
                      s('div', Ua, [
                        o(
                          $,
                          { size: 'sm', color: 'primary', 'text-color': 'white', dense: '' },
                          { default: t(() => [f(c(ee.value.length) + ' asignaturas ', 1)]), _: 1 },
                        ),
                        o(
                          $,
                          { size: 'sm', color: 'teal', 'text-color': 'white', dense: '' },
                          { default: t(() => [f(c(ze.value) + ' grupos ', 1)]), _: 1 },
                        ),
                        o(
                          $,
                          { size: 'sm', color: 'orange-7', 'text-color': 'white', dense: '' },
                          { default: t(() => [f(c(Ue.value) + ' horarios ', 1)]), _: 1 },
                        ),
                        o(be),
                        o(
                          m,
                          {
                            flat: '',
                            dense: '',
                            size: 'xs',
                            label: ie.value ? 'Colapsar todo' : 'Expandir todo',
                            icon: ie.value ? 'unfold_less' : 'unfold_more',
                            color: 'grey-6',
                            onClick: Te,
                          },
                          null,
                          8,
                          ['label', 'icon'],
                        ),
                      ]),
                      (n(!0),
                      b(
                        pe,
                        null,
                        ve(
                          ee.value,
                          (a) => (
                            n(),
                            b('div', { key: a.id, class: 'asig-card q-mb-sm' }, [
                              s(
                                'div',
                                {
                                  class: Se([
                                    'asig-header row items-center no-wrap',
                                    H.value.has(a.id) ? 'asig-header--open' : '',
                                  ]),
                                  onClick: (i) => Be(a.id),
                                },
                                [
                                  o(
                                    q,
                                    {
                                      name: H.value.has(a.id) ? 'expand_more' : 'chevron_right',
                                      size: '20px',
                                      color: 'grey-6',
                                      class: 'q-mr-xs',
                                    },
                                    null,
                                    8,
                                    ['name'],
                                  ),
                                  o(
                                    $,
                                    {
                                      dense: '',
                                      size: 'xs',
                                      class: 'q-mr-sm',
                                      color:
                                        a.plan_estudios === 'A'
                                          ? 'blue-3'
                                          : a.plan_estudios === 'N'
                                            ? 'orange-3'
                                            : 'grey-3',
                                      'text-color':
                                        a.plan_estudios === 'A'
                                          ? 'blue-9'
                                          : a.plan_estudios === 'N'
                                            ? 'orange-9'
                                            : 'grey-7',
                                    },
                                    {
                                      default: t(() => [
                                        f(
                                          c(
                                            a.plan_estudios === 'A'
                                              ? 'Antigua'
                                              : a.plan_estudios === 'N'
                                                ? 'Nueva'
                                                : 'Sin malla',
                                          ),
                                          1,
                                        ),
                                      ]),
                                      _: 2,
                                    },
                                    1032,
                                    ['color', 'text-color'],
                                  ),
                                  s('code', Ta, c(a.codigo), 1),
                                  s('span', Pa, c(a.nombre), 1),
                                  s(
                                    'div',
                                    {
                                      class: 'row items-center no-wrap q-gutter-xs q-ml-sm',
                                      onClick: e[5] || (e[5] = ge(() => {}, ['stop'])),
                                    },
                                    [
                                      o(
                                        $,
                                        {
                                          dense: '',
                                          size: 'xs',
                                          color: 'grey-2',
                                          'text-color': 'grey-7',
                                        },
                                        {
                                          default: t(() => [
                                            f(c(a.grupos?.length || 0) + ' grupos ', 1),
                                          ]),
                                          _: 2,
                                        },
                                        1024,
                                      ),
                                      o(
                                        m,
                                        {
                                          flat: '',
                                          dense: '',
                                          round: '',
                                          icon: 'edit',
                                          size: 'xs',
                                          color: 'primary',
                                          onClick: (i) => J('asignatura', a),
                                        },
                                        {
                                          default: t(() => [
                                            o(G, null, {
                                              default: t(() => [
                                                ...(e[49] ||
                                                  (e[49] = [f('Editar asignatura', -1)])),
                                              ]),
                                              _: 1,
                                            }),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ['onClick'],
                                      ),
                                      o(
                                        m,
                                        {
                                          flat: '',
                                          dense: '',
                                          round: '',
                                          icon: 'add_circle',
                                          size: 'xs',
                                          color: 'teal',
                                          onClick: (i) =>
                                            J('grupo', null, {
                                              asignaturaId: a.id,
                                              asignaturaNombre: a.nombre,
                                            }),
                                        },
                                        {
                                          default: t(() => [
                                            o(G, null, {
                                              default: t(() => [
                                                ...(e[50] || (e[50] = [f('Agregar grupo', -1)])),
                                              ]),
                                              _: 1,
                                            }),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ['onClick'],
                                      ),
                                      o(
                                        m,
                                        {
                                          flat: '',
                                          dense: '',
                                          round: '',
                                          icon: 'delete',
                                          size: 'xs',
                                          color: 'negative',
                                          onClick: (i) => ue('asignatura', a),
                                        },
                                        {
                                          default: t(() => [
                                            o(G, null, {
                                              default: t(() => [
                                                ...(e[51] ||
                                                  (e[51] = [f('Eliminar asignatura', -1)])),
                                              ]),
                                              _: 1,
                                            }),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ['onClick'],
                                      ),
                                    ],
                                  ),
                                ],
                                10,
                                Ba,
                              ),
                              o(
                                sa,
                                { name: 'expand' },
                                {
                                  default: t(() => [
                                    H.value.has(a.id)
                                      ? (n(),
                                        b('div', La, [
                                          !a.grupos || a.grupos.length === 0
                                            ? (n(),
                                              b(
                                                'div',
                                                Ma,
                                                ' Sin grupos — usa el botón + para agregar uno ',
                                              ))
                                            : (n(),
                                              b('div', Ra, [
                                                e[57] ||
                                                  (e[57] = s(
                                                    'div',
                                                    {
                                                      class:
                                                        'grupo-cols-header row items-center text-caption text-grey-6',
                                                    },
                                                    [
                                                      s('div', { style: { width: '32px' } }),
                                                      s('div', { class: 'col-2' }, 'GRUPO / TIPO'),
                                                      s('div', { class: 'col-3' }, 'DOCENTE'),
                                                      s(
                                                        'div',
                                                        { class: 'col-1 text-center' },
                                                        'DÍA',
                                                      ),
                                                      s(
                                                        'div',
                                                        { class: 'col-2 text-center' },
                                                        'HORARIO',
                                                      ),
                                                      s('div', { class: 'col-2' }, 'AULA'),
                                                      s(
                                                        'div',
                                                        { class: 'col-1 text-center' },
                                                        'MALLA',
                                                      ),
                                                      s('div', { style: { width: '80px' } }),
                                                    ],
                                                    -1,
                                                  )),
                                                (n(!0),
                                                b(
                                                  pe,
                                                  null,
                                                  ve(
                                                    a.grupos,
                                                    (i) => (
                                                      n(),
                                                      b('div', { key: i.id }, [
                                                        (n(!0),
                                                        b(
                                                          pe,
                                                          null,
                                                          ve(
                                                            Ce(i),
                                                            (u, y) => (
                                                              n(),
                                                              b(
                                                                'div',
                                                                {
                                                                  key: y,
                                                                  class: Se([
                                                                    'grupo-fila row items-center no-wrap',
                                                                    y === 0
                                                                      ? 'grupo-fila--first'
                                                                      : 'grupo-fila--extra',
                                                                  ]),
                                                                },
                                                                [
                                                                  s('div', $a, [
                                                                    y === 0
                                                                      ? (n(),
                                                                        L(q, {
                                                                          key: 0,
                                                                          name: 'subdirectory_arrow_right',
                                                                          size: '14px',
                                                                          color: 'grey-4',
                                                                        }))
                                                                      : R('', !0),
                                                                  ]),
                                                                  y === 0
                                                                    ? (n(),
                                                                      b('div', Da, [
                                                                        s('div', Qa, [
                                                                          o(
                                                                            $,
                                                                            {
                                                                              dense: '',
                                                                              size: 'sm',
                                                                              outline: '',
                                                                              color: me(i.tipo)
                                                                                .border,
                                                                              'text-color': me(
                                                                                i.tipo,
                                                                              ).text,
                                                                            },
                                                                            {
                                                                              default: t(() => [
                                                                                f(c(i.nombre), 1),
                                                                              ]),
                                                                              _: 2,
                                                                            },
                                                                            1032,
                                                                            ['color', 'text-color'],
                                                                          ),
                                                                          o(
                                                                            $,
                                                                            {
                                                                              dense: '',
                                                                              size: 'xs',
                                                                              color: me(i.tipo).bg,
                                                                              'text-color': me(
                                                                                i.tipo,
                                                                              ).text,
                                                                            },
                                                                            {
                                                                              default: t(() => [
                                                                                f(c(Pe(i.tipo)), 1),
                                                                              ]),
                                                                              _: 2,
                                                                            },
                                                                            1032,
                                                                            ['color', 'text-color'],
                                                                          ),
                                                                        ]),
                                                                      ]))
                                                                    : (n(), b('div', Ga)),
                                                                  y === 0
                                                                    ? (n(),
                                                                      b('div', ja, [
                                                                        i.docente_nombre
                                                                          ? (n(),
                                                                            b('div', Ha, [
                                                                              o(
                                                                                ia,
                                                                                {
                                                                                  size: '18px',
                                                                                  color: 'grey-3',
                                                                                },
                                                                                {
                                                                                  default: t(() => [
                                                                                    o(q, {
                                                                                      name: 'person',
                                                                                      size: '12px',
                                                                                      color:
                                                                                        'grey-7',
                                                                                    }),
                                                                                  ]),
                                                                                  _: 1,
                                                                                },
                                                                              ),
                                                                              s(
                                                                                'span',
                                                                                {
                                                                                  class:
                                                                                    'text-caption ellipsis',
                                                                                  style: {
                                                                                    'max-width':
                                                                                      '160px',
                                                                                  },
                                                                                  title:
                                                                                    i.docente_nombre,
                                                                                },
                                                                                c(i.docente_nombre),
                                                                                9,
                                                                                Fa,
                                                                              ),
                                                                            ]))
                                                                          : (n(),
                                                                            b(
                                                                              'span',
                                                                              Ja,
                                                                              'Sin docente',
                                                                            )),
                                                                      ]))
                                                                    : (n(), b('div', Wa)),
                                                                  s('div', Ka, [
                                                                    u.horario
                                                                      ? (n(),
                                                                        L(
                                                                          $,
                                                                          {
                                                                            key: 0,
                                                                            dense: '',
                                                                            size: 'xs',
                                                                            color: Me(
                                                                              u.horario.dia,
                                                                            ),
                                                                            'text-color': Re(
                                                                              u.horario.dia,
                                                                            ),
                                                                          },
                                                                          {
                                                                            default: t(() => [
                                                                              f(
                                                                                c(
                                                                                  Le(u.horario.dia),
                                                                                ),
                                                                                1,
                                                                              ),
                                                                            ]),
                                                                            _: 2,
                                                                          },
                                                                          1032,
                                                                          ['color', 'text-color'],
                                                                        ))
                                                                      : (n(), b('span', Xa, '—')),
                                                                  ]),
                                                                  s('div', Ya, [
                                                                    u.horario
                                                                      ? (n(),
                                                                        b(
                                                                          'span',
                                                                          Za,
                                                                          c(
                                                                            u.horario.hora_inicio?.substring(
                                                                              0,
                                                                              5,
                                                                            ),
                                                                          ) +
                                                                            ' – ' +
                                                                            c(
                                                                              u.horario.hora_fin?.substring(
                                                                                0,
                                                                                5,
                                                                              ),
                                                                            ),
                                                                          1,
                                                                        ))
                                                                      : (n(), b('span', el, '—')),
                                                                  ]),
                                                                  s('div', al, [
                                                                    u.horario?.aula
                                                                      ? (n(),
                                                                        b('div', ll, [
                                                                          o(q, {
                                                                            name: 'door_front',
                                                                            size: '13px',
                                                                            color: 'grey-6',
                                                                          }),
                                                                          s(
                                                                            'span',
                                                                            ol,
                                                                            c(
                                                                              u.horario.aula.nombre,
                                                                            ),
                                                                            1,
                                                                          ),
                                                                          o(
                                                                            ua,
                                                                            {
                                                                              color: 'grey-3',
                                                                              'text-color':
                                                                                'grey-7',
                                                                              outline: '',
                                                                              class: 'text-caption',
                                                                            },
                                                                            {
                                                                              default: t(() => [
                                                                                f(
                                                                                  c(
                                                                                    u.horario.aula
                                                                                      .bloque
                                                                                      ?.nombre,
                                                                                  ),
                                                                                  1,
                                                                                ),
                                                                              ]),
                                                                              _: 2,
                                                                            },
                                                                            1024,
                                                                          ),
                                                                        ]))
                                                                      : (n(), b('span', tl, '—')),
                                                                  ]),
                                                                  y === 0
                                                                    ? (n(),
                                                                      b('div', sl, [
                                                                        o(
                                                                          $,
                                                                          {
                                                                            dense: '',
                                                                            size: 'xs',
                                                                            color:
                                                                              i.plan_estudios ===
                                                                              'A'
                                                                                ? 'blue-2'
                                                                                : i.plan_estudios ===
                                                                                    'N'
                                                                                  ? 'orange-2'
                                                                                  : 'grey-2',
                                                                            'text-color':
                                                                              i.plan_estudios ===
                                                                              'A'
                                                                                ? 'blue-9'
                                                                                : i.plan_estudios ===
                                                                                    'N'
                                                                                  ? 'orange-9'
                                                                                  : 'grey-6',
                                                                          },
                                                                          {
                                                                            default: t(() => [
                                                                              f(
                                                                                c(
                                                                                  i.plan_estudios ||
                                                                                    '—',
                                                                                ),
                                                                                1,
                                                                              ),
                                                                            ]),
                                                                            _: 2,
                                                                          },
                                                                          1032,
                                                                          ['color', 'text-color'],
                                                                        ),
                                                                      ]))
                                                                    : (n(), b('div', il)),
                                                                  s(
                                                                    'div',
                                                                    {
                                                                      style: { width: '80px' },
                                                                      class:
                                                                        'row items-center justify-end no-wrap q-gutter-xs',
                                                                      onClick:
                                                                        e[6] ||
                                                                        (e[6] = ge(() => {}, [
                                                                          'stop',
                                                                        ])),
                                                                    },
                                                                    [
                                                                      u.horario
                                                                        ? (n(),
                                                                          L(
                                                                            m,
                                                                            {
                                                                              key: 0,
                                                                              flat: '',
                                                                              dense: '',
                                                                              round: '',
                                                                              icon: 'schedule',
                                                                              size: 'xs',
                                                                              color: 'primary',
                                                                              onClick: (S) =>
                                                                                J(
                                                                                  'horario',
                                                                                  u.horario,
                                                                                  {
                                                                                    grupoId: i.id,
                                                                                    grupoNombre:
                                                                                      i.nombre,
                                                                                    asignaturaNombre:
                                                                                      a.nombre,
                                                                                  },
                                                                                ),
                                                                            },
                                                                            {
                                                                              default: t(() => [
                                                                                o(G, null, {
                                                                                  default: t(() => [
                                                                                    ...(e[52] ||
                                                                                      (e[52] = [
                                                                                        f(
                                                                                          'Editar horario',
                                                                                          -1,
                                                                                        ),
                                                                                      ])),
                                                                                  ]),
                                                                                  _: 1,
                                                                                }),
                                                                              ]),
                                                                              _: 2,
                                                                            },
                                                                            1032,
                                                                            ['onClick'],
                                                                          ))
                                                                        : R('', !0),
                                                                      y === Ce(i).length - 1
                                                                        ? (n(),
                                                                          L(
                                                                            m,
                                                                            {
                                                                              key: 1,
                                                                              flat: '',
                                                                              dense: '',
                                                                              round: '',
                                                                              icon: 'add_alarm',
                                                                              size: 'xs',
                                                                              color: 'teal',
                                                                              onClick: (S) =>
                                                                                J('horario', null, {
                                                                                  grupoId: i.id,
                                                                                  grupoNombre:
                                                                                    i.nombre,
                                                                                  asignaturaNombre:
                                                                                    a.nombre,
                                                                                }),
                                                                            },
                                                                            {
                                                                              default: t(() => [
                                                                                o(G, null, {
                                                                                  default: t(() => [
                                                                                    ...(e[53] ||
                                                                                      (e[53] = [
                                                                                        f(
                                                                                          'Agregar horario',
                                                                                          -1,
                                                                                        ),
                                                                                      ])),
                                                                                  ]),
                                                                                  _: 1,
                                                                                }),
                                                                              ]),
                                                                              _: 2,
                                                                            },
                                                                            1032,
                                                                            ['onClick'],
                                                                          ))
                                                                        : R('', !0),
                                                                      u.horario
                                                                        ? (n(),
                                                                          L(
                                                                            m,
                                                                            {
                                                                              key: 2,
                                                                              flat: '',
                                                                              dense: '',
                                                                              round: '',
                                                                              icon: 'remove_circle_outline',
                                                                              size: 'xs',
                                                                              color: 'red-4',
                                                                              onClick: (S) =>
                                                                                ue(
                                                                                  'horario',
                                                                                  u.horario,
                                                                                ),
                                                                            },
                                                                            {
                                                                              default: t(() => [
                                                                                o(G, null, {
                                                                                  default: t(() => [
                                                                                    ...(e[54] ||
                                                                                      (e[54] = [
                                                                                        f(
                                                                                          'Eliminar horario',
                                                                                          -1,
                                                                                        ),
                                                                                      ])),
                                                                                  ]),
                                                                                  _: 1,
                                                                                }),
                                                                              ]),
                                                                              _: 2,
                                                                            },
                                                                            1032,
                                                                            ['onClick'],
                                                                          ))
                                                                        : R('', !0),
                                                                      y === 0
                                                                        ? (n(),
                                                                          L(
                                                                            m,
                                                                            {
                                                                              key: 3,
                                                                              flat: '',
                                                                              dense: '',
                                                                              round: '',
                                                                              icon: 'edit',
                                                                              size: 'xs',
                                                                              color: 'grey-6',
                                                                              onClick: (S) =>
                                                                                J('grupo', i, {
                                                                                  asignaturaId:
                                                                                    a.id,
                                                                                  asignaturaNombre:
                                                                                    a.nombre,
                                                                                }),
                                                                            },
                                                                            {
                                                                              default: t(() => [
                                                                                o(G, null, {
                                                                                  default: t(() => [
                                                                                    ...(e[55] ||
                                                                                      (e[55] = [
                                                                                        f(
                                                                                          'Editar grupo',
                                                                                          -1,
                                                                                        ),
                                                                                      ])),
                                                                                  ]),
                                                                                  _: 1,
                                                                                }),
                                                                              ]),
                                                                              _: 2,
                                                                            },
                                                                            1032,
                                                                            ['onClick'],
                                                                          ))
                                                                        : R('', !0),
                                                                      y === 0
                                                                        ? (n(),
                                                                          L(
                                                                            m,
                                                                            {
                                                                              key: 4,
                                                                              flat: '',
                                                                              dense: '',
                                                                              round: '',
                                                                              icon: 'delete',
                                                                              size: 'xs',
                                                                              color: 'red-3',
                                                                              onClick: (S) =>
                                                                                ue('grupo', i),
                                                                            },
                                                                            {
                                                                              default: t(() => [
                                                                                o(G, null, {
                                                                                  default: t(() => [
                                                                                    ...(e[56] ||
                                                                                      (e[56] = [
                                                                                        f(
                                                                                          'Eliminar grupo',
                                                                                          -1,
                                                                                        ),
                                                                                      ])),
                                                                                  ]),
                                                                                  _: 1,
                                                                                }),
                                                                              ]),
                                                                              _: 2,
                                                                            },
                                                                            1032,
                                                                            ['onClick'],
                                                                          ))
                                                                        : R('', !0),
                                                                    ],
                                                                  ),
                                                                ],
                                                                2,
                                                              )
                                                            ),
                                                          ),
                                                          128,
                                                        )),
                                                      ])
                                                    ),
                                                  ),
                                                  128,
                                                )),
                                              ])),
                                          s('div', rl, [
                                            o(
                                              m,
                                              {
                                                flat: '',
                                                dense: '',
                                                size: 'sm',
                                                icon: 'add',
                                                label: 'Agregar grupo',
                                                color: 'teal',
                                                'no-caps': '',
                                                onClick: (i) =>
                                                  J('grupo', null, {
                                                    asignaturaId: a.id,
                                                    asignaturaNombre: a.nombre,
                                                  }),
                                              },
                                              null,
                                              8,
                                              ['onClick'],
                                            ),
                                          ]),
                                        ]))
                                      : R('', !0),
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
                    ])),
              o(
                W,
                {
                  modelValue: v.value.asignatura,
                  'onUpdate:modelValue': e[19] || (e[19] = (a) => (v.value.asignatura = a)),
                  persistent: '',
                },
                {
                  default: t(() => [
                    o(
                      Q,
                      { style: { width: '700px', 'max-width': '96vw' } },
                      {
                        default: t(() => [
                          o(
                            k,
                            { class: 'bg-primary text-white row items-center q-py-sm' },
                            {
                              default: t(() => [
                                o(
                                  q,
                                  { name: d.value.id ? 'edit' : 'add', class: 'q-mr-sm' },
                                  null,
                                  8,
                                  ['name'],
                                ),
                                s(
                                  'span',
                                  nl,
                                  c(d.value.id ? 'Editar Asignatura' : 'Nueva Asignatura'),
                                  1,
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          o(
                            k,
                            { class: 'q-pt-md' },
                            {
                              default: t(() => [
                                s('div', ul, [
                                  s('div', dl, [
                                    o(
                                      V,
                                      {
                                        modelValue: d.value.codigo,
                                        'onUpdate:modelValue':
                                          e[7] || (e[7] = (a) => (d.value.codigo = a)),
                                        label: 'Código *',
                                        outlined: '',
                                        dense: '',
                                        disable: !!d.value.id,
                                        hint: d.value.id ? 'No editable' : '',
                                        rules: [(a) => !!a || 'Obligatorio'],
                                      },
                                      null,
                                      8,
                                      ['modelValue', 'disable', 'hint', 'rules'],
                                    ),
                                  ]),
                                  s('div', cl, [
                                    o(
                                      V,
                                      {
                                        modelValue: d.value.nombre,
                                        'onUpdate:modelValue':
                                          e[8] || (e[8] = (a) => (d.value.nombre = a)),
                                        label: 'Nombre *',
                                        outlined: '',
                                        dense: '',
                                        rules: [(a) => !!a || 'Obligatorio'],
                                      },
                                      null,
                                      8,
                                      ['modelValue', 'rules'],
                                    ),
                                  ]),
                                  s('div', ml, [
                                    o(
                                      V,
                                      {
                                        modelValue: d.value.sigla,
                                        'onUpdate:modelValue':
                                          e[9] || (e[9] = (a) => (d.value.sigla = a)),
                                        label: 'Sigla',
                                        outlined: '',
                                        dense: '',
                                        clearable: '',
                                      },
                                      null,
                                      8,
                                      ['modelValue'],
                                    ),
                                  ]),
                                  s('div', pl, [
                                    o(
                                      O,
                                      {
                                        modelValue: d.value.plan_estudios,
                                        'onUpdate:modelValue':
                                          e[10] || (e[10] = (a) => (d.value.plan_estudios = a)),
                                        options: [
                                          { label: 'Nueva (N) — Plan vigente', value: 'N' },
                                          { label: 'Antigua (A) — Plan anterior', value: 'A' },
                                        ],
                                        label: 'Plan de Malla',
                                        outlined: '',
                                        dense: '',
                                        clearable: '',
                                        'emit-value': '',
                                        'map-options': '',
                                      },
                                      {
                                        prepend: t(() => [
                                          o(
                                            q,
                                            {
                                              name:
                                                d.value.plan_estudios === 'A'
                                                  ? 'history'
                                                  : 'new_releases',
                                              color:
                                                d.value.plan_estudios === 'A'
                                                  ? 'blue-7'
                                                  : 'orange-7',
                                              size: '18px',
                                            },
                                            null,
                                            8,
                                            ['name', 'color'],
                                          ),
                                        ]),
                                        _: 1,
                                      },
                                      8,
                                      ['modelValue'],
                                    ),
                                  ]),
                                  s('div', vl, [
                                    o(
                                      O,
                                      {
                                        modelValue: d.value.estado,
                                        'onUpdate:modelValue':
                                          e[11] || (e[11] = (a) => (d.value.estado = a)),
                                        options: [
                                          { label: 'En Proceso', value: 'EN_PROCESO' },
                                          { label: 'Activo', value: 'ACTIVO' },
                                          { label: 'Inactivo', value: 'INACTIVO' },
                                        ],
                                        label: 'Estado',
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
                                  s('div', gl, [
                                    o(
                                      O,
                                      {
                                        modelValue: d.value.modalidad,
                                        'onUpdate:modelValue':
                                          e[12] || (e[12] = (a) => (d.value.modalidad = a)),
                                        options: [
                                          { label: 'Presencial', value: 'PRESENCIAL' },
                                          { label: 'Semi-presencial', value: 'SEMI_PRESENCIAL' },
                                          { label: 'Virtual', value: 'VIRTUAL' },
                                        ],
                                        label: 'Modalidad',
                                        outlined: '',
                                        dense: '',
                                        clearable: '',
                                        'emit-value': '',
                                        'map-options': '',
                                      },
                                      null,
                                      8,
                                      ['modelValue'],
                                    ),
                                  ]),
                                  s('div', bl, [
                                    o(
                                      V,
                                      {
                                        modelValue: d.value.creditos,
                                        'onUpdate:modelValue':
                                          e[13] || (e[13] = (a) => (d.value.creditos = a)),
                                        modelModifiers: { number: !0 },
                                        label: 'Créd.',
                                        type: 'number',
                                        min: '0',
                                        outlined: '',
                                        dense: '',
                                      },
                                      null,
                                      8,
                                      ['modelValue'],
                                    ),
                                  ]),
                                  s('div', _l, [
                                    o(
                                      V,
                                      {
                                        modelValue: d.value.horas_teoricas,
                                        'onUpdate:modelValue':
                                          e[14] || (e[14] = (a) => (d.value.horas_teoricas = a)),
                                        modelModifiers: { number: !0 },
                                        label: 'H.Teóricas',
                                        type: 'number',
                                        min: '0',
                                        outlined: '',
                                        dense: '',
                                      },
                                      null,
                                      8,
                                      ['modelValue'],
                                    ),
                                  ]),
                                  s('div', fl, [
                                    o(
                                      V,
                                      {
                                        modelValue: d.value.horas_practicas,
                                        'onUpdate:modelValue':
                                          e[15] || (e[15] = (a) => (d.value.horas_practicas = a)),
                                        modelModifiers: { number: !0 },
                                        label: 'H.Prácticas',
                                        type: 'number',
                                        min: '0',
                                        outlined: '',
                                        dense: '',
                                      },
                                      null,
                                      8,
                                      ['modelValue'],
                                    ),
                                  ]),
                                  s('div', yl, [
                                    o(
                                      V,
                                      {
                                        modelValue: d.value.horas_laboratorio,
                                        'onUpdate:modelValue':
                                          e[16] || (e[16] = (a) => (d.value.horas_laboratorio = a)),
                                        modelModifiers: { number: !0 },
                                        label: 'H.Lab.',
                                        type: 'number',
                                        min: '0',
                                        outlined: '',
                                        dense: '',
                                      },
                                      null,
                                      8,
                                      ['modelValue'],
                                    ),
                                  ]),
                                  s('div', hl, [
                                    o(
                                      V,
                                      {
                                        modelValue: d.value.sesiones_semanales,
                                        'onUpdate:modelValue':
                                          e[17] ||
                                          (e[17] = (a) => (d.value.sesiones_semanales = a)),
                                        modelModifiers: { number: !0 },
                                        label: 'Ses./Sem.',
                                        type: 'number',
                                        min: '0',
                                        outlined: '',
                                        dense: '',
                                      },
                                      null,
                                      8,
                                      ['modelValue'],
                                    ),
                                  ]),
                                  s('div', xl, [
                                    o(
                                      V,
                                      {
                                        modelValue: d.value.carga_horaria_total,
                                        'onUpdate:modelValue':
                                          e[18] ||
                                          (e[18] = (a) => (d.value.carga_horaria_total = a)),
                                        modelModifiers: { number: !0 },
                                        label: 'Total horas',
                                        type: 'number',
                                        min: '0',
                                        outlined: '',
                                        dense: '',
                                      },
                                      null,
                                      8,
                                      ['modelValue'],
                                    ),
                                  ]),
                                ]),
                              ]),
                              _: 1,
                            },
                          ),
                          o(we),
                          o(
                            le,
                            { align: 'right', class: 'q-pa-md' },
                            {
                              default: t(() => [
                                K(o(m, { flat: '', label: 'Cancelar' }, null, 512), [[X]]),
                                o(
                                  m,
                                  {
                                    color: d.value.id ? 'primary' : 'positive',
                                    icon: d.value.id ? 'save' : 'add',
                                    label: d.value.id ? 'Guardar cambios' : 'Crear Asignatura',
                                    loading: p.value,
                                    onClick: Je,
                                  },
                                  null,
                                  8,
                                  ['color', 'icon', 'label', 'loading'],
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
              o(
                W,
                {
                  modelValue: v.value.grupo,
                  'onUpdate:modelValue': e[28] || (e[28] = (a) => (v.value.grupo = a)),
                  persistent: '',
                },
                {
                  default: t(() => [
                    o(
                      Q,
                      { style: { width: '680px', 'max-width': '96vw' } },
                      {
                        default: t(() => [
                          o(
                            k,
                            { class: 'bg-teal text-white row items-center q-py-sm' },
                            {
                              default: t(() => [
                                o(
                                  q,
                                  { name: _.value.id ? 'edit' : 'add', class: 'q-mr-sm' },
                                  null,
                                  8,
                                  ['name'],
                                ),
                                s('span', wl, c(_.value.id ? 'Editar Grupo' : 'Nuevo Grupo'), 1),
                                s('span', Vl, '— ' + c(_.value._asignaturaNombre), 1),
                              ]),
                              _: 1,
                            },
                          ),
                          o(
                            k,
                            { class: 'q-pt-md' },
                            {
                              default: t(() => [
                                s('div', ql, [
                                  s('div', Cl, [
                                    o(
                                      V,
                                      {
                                        modelValue: _.value.nombre,
                                        'onUpdate:modelValue':
                                          e[20] || (e[20] = (a) => (_.value.nombre = a)),
                                        label: 'Nombre del grupo *',
                                        outlined: '',
                                        dense: '',
                                        placeholder: 'A, B, 1, 2...',
                                        hint: 'Letra o número que identifica al grupo',
                                        rules: [(a) => !!a || 'Obligatorio'],
                                      },
                                      null,
                                      8,
                                      ['modelValue', 'rules'],
                                    ),
                                  ]),
                                  s('div', Al, [
                                    o(
                                      O,
                                      {
                                        modelValue: _.value.tipo,
                                        'onUpdate:modelValue':
                                          e[21] || (e[21] = (a) => (_.value.tipo = a)),
                                        options: [
                                          { label: 'Teórico', value: 'TEORICO' },
                                          { label: 'Práctico', value: 'PRACTICO' },
                                          { label: 'Laboratorio', value: 'LABORATORIO' },
                                        ],
                                        label: 'Tipo *',
                                        outlined: '',
                                        dense: '',
                                        'emit-value': '',
                                        'map-options': '',
                                        rules: [(a) => !!a || 'Obligatorio'],
                                      },
                                      null,
                                      8,
                                      ['modelValue', 'rules'],
                                    ),
                                  ]),
                                  s('div', El, [
                                    o(
                                      O,
                                      {
                                        modelValue: _.value.turno,
                                        'onUpdate:modelValue':
                                          e[22] || (e[22] = (a) => (_.value.turno = a)),
                                        options: [
                                          { label: 'Mañana', value: 'MANANA' },
                                          { label: 'Tarde', value: 'TARDE' },
                                          { label: 'Noche', value: 'NOCHE' },
                                        ],
                                        label: 'Turno',
                                        outlined: '',
                                        dense: '',
                                        clearable: '',
                                        'emit-value': '',
                                        'map-options': '',
                                      },
                                      null,
                                      8,
                                      ['modelValue'],
                                    ),
                                  ]),
                                  s('div', Nl, [
                                    o(
                                      O,
                                      {
                                        modelValue: _.value.estado,
                                        'onUpdate:modelValue':
                                          e[23] || (e[23] = (a) => (_.value.estado = a)),
                                        options: [
                                          { label: 'Activo', value: 'ACTIVO' },
                                          { label: 'Inactivo', value: 'INACTIVO' },
                                          { label: 'Suspendido', value: 'SUSPENDIDO' },
                                        ],
                                        label: 'Estado',
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
                                  s('div', Sl, [
                                    o(
                                      O,
                                      {
                                        modelValue: _.value.docente_id,
                                        'onUpdate:modelValue':
                                          e[24] || (e[24] = (a) => (_.value.docente_id = a)),
                                        options: ne.value,
                                        label: 'Docente (opcional — clearable para quitar)',
                                        outlined: '',
                                        dense: '',
                                        clearable: '',
                                        'map-options': '',
                                        'emit-value': '',
                                        'option-value': 'id',
                                        'option-label': 'nombre_completo',
                                        'use-input': '',
                                        'input-debounce': '200',
                                        onFilter: Qe,
                                      },
                                      {
                                        prepend: t(() => [o(q, { name: 'person', size: '18px' })]),
                                        option: t((a) => [
                                          o(
                                            oe,
                                            ke(Oe(a.itemProps)),
                                            {
                                              default: t(() => [
                                                o(
                                                  te,
                                                  null,
                                                  {
                                                    default: t(() => [
                                                      o(
                                                        de,
                                                        null,
                                                        {
                                                          default: t(() => [
                                                            f(c(a.opt.nombre_completo), 1),
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
                                              ]),
                                              _: 2,
                                            },
                                            1040,
                                          ),
                                        ]),
                                        'no-option': t(() => [
                                          o(oe, null, {
                                            default: t(() => [
                                              o(
                                                te,
                                                { class: 'text-grey' },
                                                {
                                                  default: t(() => [
                                                    ...(e[58] ||
                                                      (e[58] = [f('Sin resultados', -1)])),
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
                                      ['modelValue', 'options'],
                                    ),
                                  ]),
                                  s('div', kl, [
                                    o(
                                      O,
                                      {
                                        modelValue: _.value.plan_estudios,
                                        'onUpdate:modelValue':
                                          e[25] || (e[25] = (a) => (_.value.plan_estudios = a)),
                                        options: [
                                          { label: 'Nueva (N)', value: 'N' },
                                          { label: 'Antigua (A)', value: 'A' },
                                        ],
                                        label: 'Plan de Malla',
                                        outlined: '',
                                        dense: '',
                                        clearable: '',
                                        'emit-value': '',
                                        'map-options': '',
                                      },
                                      {
                                        prepend: t(() => [
                                          o(
                                            q,
                                            {
                                              name:
                                                _.value.plan_estudios === 'A'
                                                  ? 'history'
                                                  : 'new_releases',
                                              color:
                                                _.value.plan_estudios === 'A'
                                                  ? 'blue-7'
                                                  : 'orange-7',
                                              size: '18px',
                                            },
                                            null,
                                            8,
                                            ['name', 'color'],
                                          ),
                                        ]),
                                        _: 1,
                                      },
                                      8,
                                      ['modelValue'],
                                    ),
                                  ]),
                                  s('div', Ol, [
                                    o(
                                      V,
                                      {
                                        modelValue: _.value.gestion,
                                        'onUpdate:modelValue':
                                          e[26] || (e[26] = (a) => (_.value.gestion = a)),
                                        label: 'Gestión *',
                                        outlined: '',
                                        dense: '',
                                        placeholder: '1-2026',
                                        rules: [(a) => !!a || 'Obligatorio'],
                                      },
                                      null,
                                      8,
                                      ['modelValue', 'rules'],
                                    ),
                                  ]),
                                  s('div', Il, [
                                    o(
                                      V,
                                      {
                                        modelValue: _.value.id_horario_api,
                                        'onUpdate:modelValue':
                                          e[27] || (e[27] = (a) => (_.value.id_horario_api = a)),
                                        modelModifiers: { number: !0 },
                                        label: 'ID API externo',
                                        type: 'number',
                                        outlined: '',
                                        dense: '',
                                        clearable: '',
                                        hint: 'Opcional',
                                      },
                                      null,
                                      8,
                                      ['modelValue'],
                                    ),
                                  ]),
                                ]),
                              ]),
                              _: 1,
                            },
                          ),
                          o(we),
                          o(
                            le,
                            { align: 'right', class: 'q-pa-md' },
                            {
                              default: t(() => [
                                K(o(m, { flat: '', label: 'Cancelar' }, null, 512), [[X]]),
                                o(
                                  m,
                                  {
                                    color: _.value.id ? 'teal' : 'positive',
                                    icon: _.value.id ? 'save' : 'add',
                                    label: _.value.id ? 'Guardar cambios' : 'Crear Grupo',
                                    loading: p.value,
                                    onClick: We,
                                  },
                                  null,
                                  8,
                                  ['color', 'icon', 'label', 'loading'],
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
              o(
                W,
                {
                  modelValue: v.value.horario,
                  'onUpdate:modelValue': e[34] || (e[34] = (a) => (v.value.horario = a)),
                  persistent: '',
                },
                {
                  default: t(() => [
                    o(
                      Q,
                      { style: { width: '580px', 'max-width': '96vw' } },
                      {
                        default: t(() => [
                          o(
                            k,
                            { class: 'bg-orange-8 text-white row items-center q-py-sm' },
                            {
                              default: t(() => [
                                o(
                                  q,
                                  { name: w.value.id ? 'edit' : 'add', class: 'q-mr-sm' },
                                  null,
                                  8,
                                  ['name'],
                                ),
                                s(
                                  'span',
                                  zl,
                                  c(w.value.id ? 'Editar Horario' : 'Nuevo Horario'),
                                  1,
                                ),
                                s(
                                  'span',
                                  Ul,
                                  ' — ' +
                                    c(w.value._asignaturaNombre) +
                                    ' / Grupo ' +
                                    c(w.value._grupoNombre),
                                  1,
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          o(
                            k,
                            { class: 'q-pt-md' },
                            {
                              default: t(() => [
                                s('div', Bl, [
                                  s('div', Tl, [
                                    o(
                                      O,
                                      {
                                        modelValue: w.value.dia,
                                        'onUpdate:modelValue':
                                          e[29] || (e[29] = (a) => (w.value.dia = a)),
                                        options: [
                                          { label: 'Lunes', value: 'LUNES' },
                                          { label: 'Martes', value: 'MARTES' },
                                          { label: 'Miércoles', value: 'MIERCOLES' },
                                          { label: 'Jueves', value: 'JUEVES' },
                                          { label: 'Viernes', value: 'VIERNES' },
                                          { label: 'Sábado', value: 'SABADO' },
                                          { label: 'Domingo', value: 'DOMINGO' },
                                        ],
                                        label: 'Día *',
                                        outlined: '',
                                        dense: '',
                                        'emit-value': '',
                                        'map-options': '',
                                        rules: [(a) => !!a || 'Obligatorio'],
                                      },
                                      null,
                                      8,
                                      ['modelValue', 'rules'],
                                    ),
                                  ]),
                                  s('div', Pl, [
                                    o(
                                      V,
                                      {
                                        modelValue: w.value.hora_inicio,
                                        'onUpdate:modelValue':
                                          e[30] || (e[30] = (a) => (w.value.hora_inicio = a)),
                                        label: 'Hora inicio *',
                                        type: 'time',
                                        outlined: '',
                                        dense: '',
                                        rules: [(a) => !!a || 'Obligatorio'],
                                      },
                                      null,
                                      8,
                                      ['modelValue', 'rules'],
                                    ),
                                  ]),
                                  s('div', Ll, [
                                    o(
                                      V,
                                      {
                                        modelValue: w.value.hora_fin,
                                        'onUpdate:modelValue':
                                          e[31] || (e[31] = (a) => (w.value.hora_fin = a)),
                                        label: 'Hora fin *',
                                        type: 'time',
                                        outlined: '',
                                        dense: '',
                                        rules: [(a) => !!a || 'Obligatorio'],
                                      },
                                      null,
                                      8,
                                      ['modelValue', 'rules'],
                                    ),
                                  ]),
                                  s('div', Ml, [
                                    o(
                                      O,
                                      {
                                        modelValue: w.value.aula_id,
                                        'onUpdate:modelValue':
                                          e[32] || (e[32] = (a) => (w.value.aula_id = a)),
                                        options: he.value,
                                        label: 'Aula (opcional — clearable para quitar)',
                                        outlined: '',
                                        dense: '',
                                        clearable: '',
                                        'map-options': '',
                                        'emit-value': '',
                                        'option-value': 'id',
                                        'option-label': 'label',
                                        'use-input': '',
                                        'input-debounce': '200',
                                        onFilter: Ge,
                                      },
                                      {
                                        prepend: t(() => [
                                          o(q, { name: 'door_front', size: '18px' }),
                                        ]),
                                        option: t((a) => [
                                          o(
                                            oe,
                                            ke(Oe(a.itemProps)),
                                            {
                                              default: t(() => [
                                                o(
                                                  te,
                                                  null,
                                                  {
                                                    default: t(() => [
                                                      o(
                                                        de,
                                                        null,
                                                        {
                                                          default: t(() => [f(c(a.opt.label), 1)]),
                                                          _: 2,
                                                        },
                                                        1024,
                                                      ),
                                                      o(
                                                        de,
                                                        { caption: '' },
                                                        {
                                                          default: t(() => [
                                                            f(c(a.opt.detalle), 1),
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
                                              ]),
                                              _: 2,
                                            },
                                            1040,
                                          ),
                                        ]),
                                        'no-option': t(() => [
                                          o(oe, null, {
                                            default: t(() => [
                                              o(
                                                te,
                                                { class: 'text-grey' },
                                                {
                                                  default: t(() => [
                                                    ...(e[59] ||
                                                      (e[59] = [f('Sin resultados', -1)])),
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
                                      ['modelValue', 'options'],
                                    ),
                                  ]),
                                  s('div', Rl, [
                                    o(
                                      V,
                                      {
                                        modelValue: w.value.id_horario_api,
                                        'onUpdate:modelValue':
                                          e[33] || (e[33] = (a) => (w.value.id_horario_api = a)),
                                        modelModifiers: { number: !0 },
                                        label: 'ID API externo',
                                        type: 'number',
                                        outlined: '',
                                        dense: '',
                                        clearable: '',
                                        hint: 'Opcional',
                                      },
                                      null,
                                      8,
                                      ['modelValue'],
                                    ),
                                  ]),
                                ]),
                              ]),
                              _: 1,
                            },
                          ),
                          o(we),
                          o(
                            le,
                            { align: 'right', class: 'q-pa-md' },
                            {
                              default: t(() => [
                                K(o(m, { flat: '', label: 'Cancelar' }, null, 512), [[X]]),
                                o(
                                  m,
                                  {
                                    color: w.value.id ? 'orange-8' : 'positive',
                                    icon: w.value.id ? 'save' : 'add',
                                    label: w.value.id ? 'Guardar cambios' : 'Crear Horario',
                                    loading: p.value,
                                    onClick: Ke,
                                  },
                                  null,
                                  8,
                                  ['color', 'icon', 'label', 'loading'],
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
              o(
                W,
                {
                  modelValue: v.value.aulas,
                  'onUpdate:modelValue': e[37] || (e[37] = (a) => (v.value.aulas = a)),
                  'full-width': '',
                },
                {
                  default: t(() => [
                    o(
                      Q,
                      { style: { 'max-width': '1000px', width: '100%' } },
                      {
                        default: t(() => [
                          o(
                            k,
                            { class: 'bg-grey-8 text-white row items-center q-py-sm' },
                            {
                              default: t(() => [
                                o(q, { name: 'meeting_room', class: 'q-mr-sm' }),
                                e[60] ||
                                  (e[60] = s(
                                    'span',
                                    { class: 'text-subtitle1 text-weight-bold' },
                                    'Gestión de Aulas y Bloques',
                                    -1,
                                  )),
                                o(be),
                                K(
                                  o(
                                    m,
                                    { flat: '', round: '', dense: '', icon: 'close' },
                                    null,
                                    512,
                                  ),
                                  [[X]],
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          o(
                            k,
                            { class: 'q-pa-md' },
                            {
                              default: t(() => [
                                s('div', $l, [
                                  s('div', Dl, [
                                    s('div', Ql, [
                                      e[61] ||
                                        (e[61] = s(
                                          'span',
                                          { class: 'text-weight-bold text-subtitle2' },
                                          'Bloques',
                                          -1,
                                        )),
                                      o(be),
                                      o(m, {
                                        flat: '',
                                        dense: '',
                                        icon: 'add',
                                        size: 'sm',
                                        color: 'primary',
                                        label: 'Nuevo bloque',
                                        onClick: e[35] || (e[35] = (a) => Ee(null)),
                                      }),
                                    ]),
                                    o(
                                      da,
                                      { bordered: '', separator: '', class: 'rounded-borders' },
                                      {
                                        default: t(() => [
                                          ra(B).bloques.length === 0
                                            ? (n(),
                                              L(
                                                oe,
                                                { key: 0, class: 'text-grey-5 text-caption' },
                                                {
                                                  default: t(() => [
                                                    ...(e[62] ||
                                                      (e[62] = [f(' Sin bloques ', -1)])),
                                                  ]),
                                                  _: 1,
                                                },
                                              ))
                                            : R('', !0),
                                          (n(!0),
                                          b(
                                            pe,
                                            null,
                                            ve(
                                              Ae.value,
                                              (a) => (
                                                n(),
                                                L(
                                                  oe,
                                                  {
                                                    key: a.id,
                                                    active: N.value?.id === a.id,
                                                    'active-class': 'bg-blue-1',
                                                    clickable: '',
                                                    onClick: (i) => (N.value = a),
                                                  },
                                                  {
                                                    default: t(() => [
                                                      o(
                                                        te,
                                                        null,
                                                        {
                                                          default: t(() => [
                                                            o(
                                                              de,
                                                              null,
                                                              {
                                                                default: t(() => [
                                                                  f(c(a.nombre), 1),
                                                                ]),
                                                                _: 2,
                                                              },
                                                              1024,
                                                            ),
                                                            o(
                                                              de,
                                                              { caption: '' },
                                                              {
                                                                default: t(() => [
                                                                  f(
                                                                    c(a.sede?.nombre) +
                                                                      ' · ' +
                                                                      c(a.aulas?.length || 0) +
                                                                      ' aulas',
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
                                                      o(
                                                        te,
                                                        { side: '' },
                                                        {
                                                          default: t(() => [
                                                            s('div', Gl, [
                                                              o(
                                                                m,
                                                                {
                                                                  flat: '',
                                                                  dense: '',
                                                                  round: '',
                                                                  icon: 'edit',
                                                                  size: 'xs',
                                                                  color: 'primary',
                                                                  onClick: ge(
                                                                    (i) => Ee(a),
                                                                    ['stop'],
                                                                  ),
                                                                },
                                                                null,
                                                                8,
                                                                ['onClick'],
                                                              ),
                                                              o(
                                                                m,
                                                                {
                                                                  flat: '',
                                                                  dense: '',
                                                                  round: '',
                                                                  icon: 'delete',
                                                                  size: 'xs',
                                                                  color: 'negative',
                                                                  onClick: ge(
                                                                    (i) => ue('bloque', a),
                                                                    ['stop'],
                                                                  ),
                                                                },
                                                                null,
                                                                8,
                                                                ['onClick'],
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
                                                  1032,
                                                  ['active', 'onClick'],
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
                                  s('div', jl, [
                                    s('div', Hl, [
                                      s(
                                        'span',
                                        Fl,
                                        ' Aulas ' + c(N.value ? `— ${N.value.nombre}` : ''),
                                        1,
                                      ),
                                      o(be),
                                      o(
                                        m,
                                        {
                                          flat: '',
                                          dense: '',
                                          icon: 'add',
                                          size: 'sm',
                                          color: 'teal',
                                          label: 'Nueva aula',
                                          disable: !N.value,
                                          onClick: e[36] || (e[36] = (a) => Ne(null)),
                                        },
                                        null,
                                        8,
                                        ['disable'],
                                      ),
                                    ]),
                                    N.value
                                      ? (n(),
                                        L(
                                          ca,
                                          {
                                            key: 1,
                                            rows: Xe.value,
                                            columns: Ye,
                                            'row-key': 'id',
                                            dense: '',
                                            flat: '',
                                            bordered: '',
                                            pagination: { rowsPerPage: 20 },
                                          },
                                          {
                                            'body-cell-actions': t((a) => [
                                              o(
                                                ma,
                                                { props: a },
                                                {
                                                  default: t(() => [
                                                    s('div', Wl, [
                                                      o(
                                                        m,
                                                        {
                                                          flat: '',
                                                          dense: '',
                                                          round: '',
                                                          icon: 'edit',
                                                          size: 'xs',
                                                          color: 'primary',
                                                          onClick: (i) => Ne(a.row),
                                                        },
                                                        null,
                                                        8,
                                                        ['onClick'],
                                                      ),
                                                      o(
                                                        m,
                                                        {
                                                          flat: '',
                                                          dense: '',
                                                          round: '',
                                                          icon: 'delete',
                                                          size: 'xs',
                                                          color: 'negative',
                                                          onClick: (i) => ue('aula', a.row),
                                                        },
                                                        null,
                                                        8,
                                                        ['onClick'],
                                                      ),
                                                    ]),
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
                                        ))
                                      : (n(),
                                        b('div', Jl, ' Selecciona un bloque para ver sus aulas ')),
                                  ]),
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
                8,
                ['modelValue'],
              ),
              o(
                W,
                {
                  modelValue: v.value.bloque,
                  'onUpdate:modelValue': e[40] || (e[40] = (a) => (v.value.bloque = a)),
                  persistent: '',
                },
                {
                  default: t(() => [
                    o(
                      Q,
                      { style: { width: '400px', 'max-width': '96vw' } },
                      {
                        default: t(() => [
                          o(
                            k,
                            { class: 'bg-grey-7 text-white q-py-sm' },
                            {
                              default: t(() => [
                                s('span', Kl, c(D.value.id ? 'Editar Bloque' : 'Nuevo Bloque'), 1),
                              ]),
                              _: 1,
                            },
                          ),
                          o(
                            k,
                            { class: 'q-pt-md' },
                            {
                              default: t(() => [
                                s('div', Xl, [
                                  o(
                                    V,
                                    {
                                      modelValue: D.value.nombre,
                                      'onUpdate:modelValue':
                                        e[38] || (e[38] = (a) => (D.value.nombre = a)),
                                      label: 'Nombre del bloque *',
                                      outlined: '',
                                      dense: '',
                                      placeholder: 'Ej: COLONIAL, FLORIDA NORTE...',
                                      rules: [(a) => !!a || 'Obligatorio'],
                                    },
                                    null,
                                    8,
                                    ['modelValue', 'rules'],
                                  ),
                                  o(
                                    O,
                                    {
                                      modelValue: D.value.sede_id,
                                      'onUpdate:modelValue':
                                        e[39] || (e[39] = (a) => (D.value.sede_id = a)),
                                      options: qe.value,
                                      label: 'Sede *',
                                      outlined: '',
                                      dense: '',
                                      'emit-value': '',
                                      'map-options': '',
                                      rules: [(a) => !!a || 'Obligatorio'],
                                    },
                                    null,
                                    8,
                                    ['modelValue', 'options', 'rules'],
                                  ),
                                ]),
                              ]),
                              _: 1,
                            },
                          ),
                          o(
                            le,
                            { align: 'right' },
                            {
                              default: t(() => [
                                K(o(m, { flat: '', label: 'Cancelar' }, null, 512), [[X]]),
                                o(
                                  m,
                                  {
                                    color: 'grey-7',
                                    label: D.value.id ? 'Guardar' : 'Crear',
                                    loading: p.value,
                                    onClick: Ze,
                                  },
                                  null,
                                  8,
                                  ['label', 'loading'],
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
              o(
                W,
                {
                  modelValue: v.value.aula,
                  'onUpdate:modelValue': e[45] || (e[45] = (a) => (v.value.aula = a)),
                  persistent: '',
                },
                {
                  default: t(() => [
                    o(
                      Q,
                      { style: { width: '420px', 'max-width': '96vw' } },
                      {
                        default: t(() => [
                          o(
                            k,
                            { class: 'bg-teal-8 text-white q-py-sm' },
                            {
                              default: t(() => [
                                s('span', Yl, c(U.value.id ? 'Editar Aula' : 'Nueva Aula'), 1),
                                N.value
                                  ? (n(), b('span', Zl, ' — ' + c(N.value.nombre), 1))
                                  : R('', !0),
                              ]),
                              _: 1,
                            },
                          ),
                          o(
                            k,
                            { class: 'q-pt-md' },
                            {
                              default: t(() => [
                                s('div', eo, [
                                  o(
                                    V,
                                    {
                                      modelValue: U.value.nombre,
                                      'onUpdate:modelValue':
                                        e[41] || (e[41] = (a) => (U.value.nombre = a)),
                                      label: 'Nombre del aula *',
                                      outlined: '',
                                      dense: '',
                                      placeholder: 'Ej: 101-A, Lab-2...',
                                      rules: [(a) => !!a || 'Obligatorio'],
                                    },
                                    null,
                                    8,
                                    ['modelValue', 'rules'],
                                  ),
                                  o(
                                    O,
                                    {
                                      modelValue: U.value.bloque_id,
                                      'onUpdate:modelValue':
                                        e[42] || (e[42] = (a) => (U.value.bloque_id = a)),
                                      options: je.value,
                                      label: 'Bloque *',
                                      outlined: '',
                                      dense: '',
                                      'emit-value': '',
                                      'map-options': '',
                                      rules: [(a) => !!a || 'Obligatorio'],
                                    },
                                    null,
                                    8,
                                    ['modelValue', 'options', 'rules'],
                                  ),
                                  s('div', ao, [
                                    s('div', lo, [
                                      o(
                                        V,
                                        {
                                          modelValue: U.value.capacidad,
                                          'onUpdate:modelValue':
                                            e[43] || (e[43] = (a) => (U.value.capacidad = a)),
                                          modelModifiers: { number: !0 },
                                          label: 'Capacidad (personas)',
                                          type: 'number',
                                          min: '0',
                                          outlined: '',
                                          dense: '',
                                        },
                                        null,
                                        8,
                                        ['modelValue'],
                                      ),
                                    ]),
                                    s('div', oo, [
                                      o(
                                        V,
                                        {
                                          modelValue: U.value.pupitres,
                                          'onUpdate:modelValue':
                                            e[44] || (e[44] = (a) => (U.value.pupitres = a)),
                                          modelModifiers: { number: !0 },
                                          label: 'Pupitres',
                                          type: 'number',
                                          min: '0',
                                          outlined: '',
                                          dense: '',
                                        },
                                        null,
                                        8,
                                        ['modelValue'],
                                      ),
                                    ]),
                                  ]),
                                ]),
                              ]),
                              _: 1,
                            },
                          ),
                          o(
                            le,
                            { align: 'right' },
                            {
                              default: t(() => [
                                K(o(m, { flat: '', label: 'Cancelar' }, null, 512), [[X]]),
                                o(
                                  m,
                                  {
                                    color: 'teal-8',
                                    label: U.value.id ? 'Guardar' : 'Crear',
                                    loading: p.value,
                                    onClick: ea,
                                  },
                                  null,
                                  8,
                                  ['label', 'loading'],
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
              o(
                W,
                {
                  modelValue: v.value.eliminar,
                  'onUpdate:modelValue': e[46] || (e[46] = (a) => (v.value.eliminar = a)),
                  persistent: '',
                },
                {
                  default: t(() => [
                    o(
                      Q,
                      { style: { 'min-width': '360px' } },
                      {
                        default: t(() => [
                          o(
                            k,
                            { class: 'bg-negative text-white q-py-sm' },
                            {
                              default: t(() => [
                                s('div', to, [
                                  o(q, { name: 'warning', class: 'q-mr-sm' }),
                                  e[63] ||
                                    (e[63] = s(
                                      'span',
                                      { class: 'text-subtitle1 text-weight-bold' },
                                      'Confirmar eliminación',
                                      -1,
                                    )),
                                ]),
                              ]),
                              _: 1,
                            },
                          ),
                          o(
                            k,
                            { class: 'q-pt-md' },
                            {
                              default: t(() => [
                                s('p', null, c(He.value), 1),
                                e[64] ||
                                  (e[64] = s(
                                    'small',
                                    { class: 'text-grey-6' },
                                    'Esta acción no se puede deshacer.',
                                    -1,
                                  )),
                              ]),
                              _: 1,
                            },
                          ),
                          o(
                            le,
                            { align: 'right' },
                            {
                              default: t(() => [
                                K(o(m, { flat: '', label: 'Cancelar' }, null, 512), [[X]]),
                                o(
                                  m,
                                  {
                                    color: 'negative',
                                    label: 'Eliminar',
                                    loading: p.value,
                                    onClick: aa,
                                  },
                                  null,
                                  8,
                                  ['loading'],
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
        )
      )
    },
  },
  Oo = ya(so, [['__scopeId', 'data-v-50f20045']])
export { Oo as default }
