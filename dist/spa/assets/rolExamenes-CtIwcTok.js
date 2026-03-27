import { aj as s, aw as T, e as k, r as m, P as p } from './index-CVgKKHHv.js'
const u = {
    uploadExcel(n, t = {}) {
      return s.post('/rol-examenes/upload', n, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: t,
      })
    },
    getRolExamenes(n = {}) {
      return s.get('/rol-examenes', { params: n })
    },
    getExamenesByMateria(n, t) {
      return s.get(`/rol-examenes/materia/${n}`, { params: { gestion: t } })
    },
    updateExamen(n, t) {
      return s.put(`/rol-examenes/${n}`, t)
    },
    deleteExamen(n) {
      return s.delete(`/rol-examenes/${n}`)
    },
    createExamen(n) {
      return s.post('/rol-examenes', n)
    },
    downloadTemplate() {
      return s.get('/rol-examenes/template', { responseType: 'blob' })
    },
    deleteAll(n, t, o) {
      return s.post('/rol-examenes/bulk-delete', { gestion: n, carrera_id: t, sede_id: o })
    },
  },
  D = T('rolExamenes', () => {
    const n = k(),
      t = m([]),
      o = m(!1),
      d = m(!1),
      i = m(null),
      x = m({ gestion: '2026-I', carrera_id: null, materia_id: null }),
      f = p(() => {
        const a = n.rol
        return ['DIRECTOR_CARRERA', 'ADMIN', 'SUPER_ADMIN'].includes(a)
      }),
      v = p(() => {
        const a = new Map()
        return (
          t.value.forEach((e) => {
            const r = e.materia_codigo || e.materia_id
            ;(a.has(r) || a.set(r, []), a.get(r).push(e))
          }),
          a
        )
      }),
      y = p(() => {
        const a = new Map()
        return (
          t.value.forEach((e) => {
            ;(a.has(e.semana) || a.set(e.semana, []), a.get(e.semana).push(e))
          }),
          a
        )
      })
    async function E(a = {}) {
      ;((o.value = !0), (i.value = null))
      try {
        const e = await u.getRolExamenes({ ...x.value, ...a })
        return ((t.value = e.data.data || e.data || []), t.value)
      } catch (e) {
        return (
          console.error('Error cargando exámenes:', e),
          (i.value = e.message || 'Error al cargar exámenes'),
          []
        )
      } finally {
        o.value = !1
      }
    }
    async function h(a, e, r, l) {
      ;((d.value = !0), (i.value = null))
      try {
        const c = new FormData()
        c.append('file', a)
        const S = await u.uploadExcel(c, { gestion: e, carrera_id: r, sede_id: l })
        return (await E({ gestion: e, carrera_id: r, sede_id: l }), S.data)
      } catch (c) {
        throw (
          console.error('Error subiendo Excel:', c),
          (i.value = c.response?.data?.message || c.message || 'Error al subir archivo'),
          c
        )
      } finally {
        d.value = !1
      }
    }
    async function w(a, e) {
      try {
        const r = await u.getExamenesByMateria(a, e)
        return r.data.data || r.data || []
      } catch (r) {
        return (console.error('Error obteniendo exámenes de materia:', r), [])
      }
    }
    async function g(a, e) {
      o.value = !0
      try {
        await u.updateExamen(a, e)
        const r = t.value.findIndex((l) => l.id === a)
        return (r !== -1 && (t.value[r] = { ...t.value[r], ...e }), !0)
      } catch (r) {
        throw (console.error('Error actualizando examen:', r), r)
      } finally {
        o.value = !1
      }
    }
    async function R(a) {
      o.value = !0
      try {
        return (await u.deleteExamen(a), (t.value = t.value.filter((e) => e.id !== a)), !0)
      } catch (e) {
        throw (console.error('Error eliminando examen:', e), e)
      } finally {
        o.value = !1
      }
    }
    async function b(a) {
      o.value = !0
      try {
        const e = await u.createExamen(a)
        return (t.value.push(e.data), e.data)
      } catch (e) {
        throw (console.error('Error creando examen:', e), e)
      } finally {
        o.value = !1
      }
    }
    async function _() {
      try {
        const a = await u.downloadTemplate(),
          e = window.URL.createObjectURL(new Blob([a.data])),
          r = document.createElement('a')
        return (
          (r.href = e),
          r.setAttribute('download', 'plantilla_rol_examenes.xlsx'),
          document.body.appendChild(r),
          r.click(),
          document.body.removeChild(r),
          window.URL.revokeObjectURL(e),
          !0
        )
      } catch (a) {
        throw (console.error('Error descargando plantilla:', a), a)
      }
    }
    async function A(a, e, r) {
      d.value = !0
      try {
        const l = await u.deleteAll(a, e, r)
        return ((t.value = []), l.data)
      } catch (l) {
        throw (console.error('Error eliminando todo:', l), l)
      } finally {
        d.value = !1
      }
    }
    function M() {
      ;((t.value = []), (i.value = null))
    }
    return {
      examenes: t,
      loading: o,
      uploading: d,
      error: i,
      filtros: x,
      puedeEditar: f,
      examenesPorMateria: v,
      examenesPorSemana: y,
      cargarExamenes: E,
      uploadExcel: h,
      getExamenesMateria: w,
      actualizarExamen: g,
      eliminarExamen: R,
      crearExamen: b,
      downloadTemplate: _,
      deleteAll: A,
      limpiar: M,
    }
  })
export { u as r, D as u }
