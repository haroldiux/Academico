import {
  G as z,
  P as f,
  h as o,
  Y as H,
  g as ee,
  aN as st,
  s as Be,
  I as Oe,
  K as Le,
  a$ as ut,
  r as $,
  w as E,
  b0 as ct,
  a_ as ke,
  o as dt,
  a as vt,
  aX as ft,
  aW as gt,
  c as bt,
  ab as mt,
  aP as ge,
  bu as Te,
  aQ as St,
  n as Me,
  bv as yt,
  v as fe,
  bw as N,
  x as Z,
  a2 as ht,
} from './index-CVgKKHHv.js'
import { Q as wt } from './QList-BSXQR-9A.js'
import { u as _t, a as Ct, c as De, Q as Pt } from './QSelect-B2vk19AQ.js'
import { Q as qt } from './QLinearProgress-CGVvufhy.js'
import { u as Rt, a as kt, b as Tt } from './use-fullscreen-DP5Hoaa-.js'
const ll = z({
    name: 'QTd',
    props: { props: Object, autoWidth: Boolean, noHover: Boolean },
    setup(e, { slots: l }) {
      const r = ee(),
        g = f(
          () =>
            'q-td' +
            (e.autoWidth === !0 ? ' q-table--col-auto-width' : '') +
            (e.noHover === !0 ? ' q-td--no-hover' : '') +
            ' ',
        )
      return () => {
        if (e.props === void 0) return o('td', { class: g.value }, H(l.default))
        const i = r.vnode.key,
          m = (e.props.colsMap !== void 0 ? e.props.colsMap[i] : null) || e.props.col
        if (m === void 0) return
        const { row: s } = e.props
        return o('td', { class: g.value + m.__tdClass(s), style: m.__tdStyle(s) }, H(l.default))
      }
    },
  }),
  xt = z({
    name: 'QTh',
    props: { props: Object, autoWidth: Boolean },
    emits: ['click'],
    setup(e, { slots: l, emit: r }) {
      const g = ee(),
        {
          proxy: { $q: i },
        } = g,
        m = (s) => {
          r('click', s)
        }
      return () => {
        if (e.props === void 0)
          return o(
            'th',
            { class: e.autoWidth === !0 ? 'q-table--col-auto-width' : '', onClick: m },
            H(l.default),
          )
        let s, c
        const u = g.vnode.key
        if (u) {
          if (((s = e.props.colsMap[u]), s === void 0)) return
        } else s = e.props.col
        if (s.sortable === !0) {
          const n = s.align === 'right' ? 'unshift' : 'push'
          ;((c = st(l.default, [])),
            c[n](o(Be, { class: s.__iconClass, name: i.iconSet.table.arrowUp })))
        } else c = H(l.default)
        const h = {
          class: s.__thClass + (e.autoWidth === !0 ? ' q-table--col-auto-width' : ''),
          style: s.headerStyle,
          onClick: (n) => {
            ;(s.sortable === !0 && e.props.sort(s), m(n))
          },
        }
        return o('th', h, c)
      }
    },
  }),
  Ft = ['horizontal', 'vertical', 'cell', 'none'],
  Bt = z({
    name: 'QMarkupTable',
    props: {
      ...Oe,
      dense: Boolean,
      flat: Boolean,
      bordered: Boolean,
      square: Boolean,
      wrapCells: Boolean,
      separator: { type: String, default: 'horizontal', validator: (e) => Ft.includes(e) },
    },
    setup(e, { slots: l }) {
      const r = ee(),
        g = Le(e, r.proxy.$q),
        i = f(
          () =>
            `q-markup-table q-table__container q-table__card q-table--${e.separator}-separator` +
            (g.value === !0 ? ' q-table--dark q-table__card--dark q-dark' : '') +
            (e.dense === !0 ? ' q-table--dense' : '') +
            (e.flat === !0 ? ' q-table--flat' : '') +
            (e.bordered === !0 ? ' q-table--bordered' : '') +
            (e.square === !0 ? ' q-table--square' : '') +
            (e.wrapCells === !1 ? ' q-table--no-wrap' : ''),
        )
      return () => o('div', { class: i.value }, [o('table', { class: 'q-table' }, H(l.default))])
    },
  })
function Ve(e, l) {
  return o('div', e, [o('table', { class: 'q-table' }, l)])
}
const Ot = { list: wt, table: Bt },
  Lt = ['list', 'table', '__qtable'],
  Mt = z({
    name: 'QVirtualScroll',
    props: {
      ..._t,
      type: { type: String, default: 'list', validator: (e) => Lt.includes(e) },
      items: { type: Array, default: () => [] },
      itemsFn: Function,
      itemsSize: Number,
      scrollTarget: ut,
    },
    setup(e, { slots: l, attrs: r }) {
      let g
      const i = $(null),
        m = f(() =>
          e.itemsSize >= 0 && e.itemsFn !== void 0
            ? parseInt(e.itemsSize, 10)
            : Array.isArray(e.items)
              ? e.items.length
              : 0,
        ),
        {
          virtualScrollSliceRange: s,
          localResetVirtualScroll: c,
          padVirtualScroll: u,
          onVirtualScrollEvt: h,
        } = Ct({ virtualScrollLength: m, getVirtualScrollTarget: R, getVirtualScrollEl: C }),
        n = f(() => {
          if (m.value === 0) return []
          const B = (O, T) => ({ index: s.value.from + T, item: O })
          return e.itemsFn === void 0
            ? e.items.slice(s.value.from, s.value.to).map(B)
            : e.itemsFn(s.value.from, s.value.to - s.value.from).map(B)
        }),
        S = f(
          () =>
            'q-virtual-scroll q-virtual-scroll' +
            (e.virtualScrollHorizontal === !0 ? '--horizontal' : '--vertical') +
            (e.scrollTarget !== void 0 ? '' : ' scroll'),
        ),
        _ = f(() => (e.scrollTarget !== void 0 ? {} : { tabindex: 0 }))
      ;(E(m, () => {
        c()
      }),
        E(
          () => e.scrollTarget,
          () => {
            ;(y(), w())
          },
        ))
      function C() {
        return i.value.$el || i.value
      }
      function R() {
        return g
      }
      function w() {
        ;((g = ct(C(), e.scrollTarget)), g.addEventListener('scroll', h, ke.passive))
      }
      function y() {
        g !== void 0 && (g.removeEventListener('scroll', h, ke.passive), (g = void 0))
      }
      function F() {
        let B = u(e.type === 'list' ? 'div' : 'tbody', n.value.map(l.default))
        return (l.before !== void 0 && (B = l.before().concat(B)), mt(l.after, B))
      }
      return (
        dt(() => {
          c()
        }),
        vt(() => {
          w()
        }),
        ft(() => {
          w()
        }),
        gt(() => {
          y()
        }),
        bt(() => {
          y()
        }),
        () => {
          if (l.default === void 0) {
            console.error('QVirtualScroll: default scoped slot is required for rendering')
            return
          }
          return e.type === '__qtable'
            ? Ve({ ref: i, class: 'q-table__middle ' + S.value }, F())
            : o(Ot[e.type], { ...r, ref: i, class: [r.class, S.value], ..._.value }, F)
        }
      )
    },
  })
function Dt(e, l) {
  return new Date(e) - new Date(l)
}
const Vt = {
  sortMethod: Function,
  binaryStateSort: Boolean,
  columnSortOrder: { type: String, validator: (e) => e === 'ad' || e === 'da', default: 'ad' },
}
function jt(e, l, r, g) {
  const i = f(() => {
      const { sortBy: c } = l.value
      return (c && r.value.find((u) => u.name === c)) || null
    }),
    m = f(() =>
      e.sortMethod !== void 0
        ? e.sortMethod
        : (c, u, h) => {
            const n = r.value.find((C) => C.name === u)
            if (n === void 0 || n.field === void 0) return c
            const S = h === !0 ? -1 : 1,
              _ = typeof n.field == 'function' ? (C) => n.field(C) : (C) => C[n.field]
            return c.sort((C, R) => {
              let w = _(C),
                y = _(R)
              return n.rawSort !== void 0
                ? n.rawSort(w, y, C, R) * S
                : w == null
                  ? -1 * S
                  : y == null
                    ? 1 * S
                    : n.sort !== void 0
                      ? n.sort(w, y, C, R) * S
                      : ge(w) === !0 && ge(y) === !0
                        ? (w - y) * S
                        : Te(w) === !0 && Te(y) === !0
                          ? Dt(w, y) * S
                          : typeof w == 'boolean' && typeof y == 'boolean'
                            ? (w - y) * S
                            : (([w, y] = [w, y].map((F) =>
                                (F + '').toLocaleString().toLowerCase(),
                              )),
                              w < y ? -1 * S : w === y ? 0 : S)
            })
          },
    )
  function s(c) {
    let u = e.columnSortOrder
    if (St(c) === !0) (c.sortOrder && (u = c.sortOrder), (c = c.name))
    else {
      const S = r.value.find((_) => _.name === c)
      S?.sortOrder && (u = S.sortOrder)
    }
    let { sortBy: h, descending: n } = l.value
    ;(h !== c
      ? ((h = c), (n = u === 'da'))
      : e.binaryStateSort === !0
        ? (n = !n)
        : n === !0
          ? u === 'ad'
            ? (h = null)
            : (n = !1)
          : u === 'ad'
            ? (n = !0)
            : (h = null),
      g({ sortBy: h, descending: n, page: 1 }))
  }
  return { columnToSort: i, computedSortMethod: m, sort: s }
}
const At = { filter: [String, Object], filterMethod: Function }
function Qt(e, l) {
  const r = f(() =>
    e.filterMethod !== void 0
      ? e.filterMethod
      : (g, i, m, s) => {
          const c = i ? i.toLowerCase() : ''
          return g.filter((u) =>
            m.some((h) => {
              const n = s(h, u) + ''
              return (n === 'undefined' || n === 'null' ? '' : n.toLowerCase()).indexOf(c) !== -1
            }),
          )
        },
  )
  return (
    E(
      () => e.filter,
      () => {
        Me(() => {
          l({ page: 1 }, !0)
        })
      },
      { deep: !0 },
    ),
    { computedFilterMethod: r }
  )
}
function Et(e, l) {
  for (const r in l) if (l[r] !== e[r]) return !1
  return !0
}
function xe(e) {
  return (
    e.page < 1 && (e.page = 1),
    e.rowsPerPage !== void 0 && e.rowsPerPage < 1 && (e.rowsPerPage = 0),
    e
  )
}
const Nt = {
  pagination: Object,
  rowsPerPageOptions: { type: Array, default: () => [5, 7, 10, 15, 20, 25, 50, 0] },
  'onUpdate:pagination': [Function, Array],
}
function Ht(e, l) {
  const { props: r, emit: g } = e,
    i = $(
      Object.assign(
        {
          sortBy: null,
          descending: !1,
          page: 1,
          rowsPerPage: r.rowsPerPageOptions.length !== 0 ? r.rowsPerPageOptions[0] : 5,
        },
        r.pagination,
      ),
    ),
    m = f(() => {
      const n = r['onUpdate:pagination'] !== void 0 ? { ...i.value, ...r.pagination } : i.value
      return xe(n)
    }),
    s = f(() => m.value.rowsNumber !== void 0)
  function c(n) {
    u({ pagination: n, filter: r.filter })
  }
  function u(n = {}) {
    Me(() => {
      g('request', {
        pagination: n.pagination || m.value,
        filter: n.filter || r.filter,
        getCellValue: l,
      })
    })
  }
  function h(n, S) {
    const _ = xe({ ...m.value, ...n })
    if (Et(m.value, _) === !0) {
      s.value === !0 && S === !0 && c(_)
      return
    }
    if (s.value === !0) {
      c(_)
      return
    }
    r.pagination !== void 0 && r['onUpdate:pagination'] !== void 0
      ? g('update:pagination', _)
      : (i.value = _)
  }
  return {
    innerPagination: i,
    computedPagination: m,
    isServerSide: s,
    requestServerInteraction: u,
    setPagination: h,
  }
}
function $t(e, l, r, g, i, m) {
  const {
      props: s,
      emit: c,
      proxy: { $q: u },
    } = e,
    h = f(() => (g.value === !0 ? r.value.rowsNumber || 0 : m.value)),
    n = f(() => {
      const { page: T, rowsPerPage: x } = r.value
      return (T - 1) * x
    }),
    S = f(() => {
      const { page: T, rowsPerPage: x } = r.value
      return T * x
    }),
    _ = f(() => r.value.page === 1),
    C = f(() =>
      r.value.rowsPerPage === 0 ? 1 : Math.max(1, Math.ceil(h.value / r.value.rowsPerPage)),
    ),
    R = f(() => (S.value === 0 ? !0 : r.value.page >= C.value)),
    w = f(() =>
      (s.rowsPerPageOptions.includes(l.value.rowsPerPage)
        ? s.rowsPerPageOptions
        : [l.value.rowsPerPage].concat(s.rowsPerPageOptions)
      ).map((x) => ({ label: x === 0 ? u.lang.table.allRows : '' + x, value: x })),
    )
  E(C, (T, x) => {
    if (T === x) return
    const U = r.value.page
    T && !U ? i({ page: 1 }) : T < U && i({ page: T })
  })
  function y() {
    i({ page: 1 })
  }
  function F() {
    const { page: T } = r.value
    T > 1 && i({ page: T - 1 })
  }
  function B() {
    const { page: T, rowsPerPage: x } = r.value
    S.value > 0 && T * x < h.value && i({ page: T + 1 })
  }
  function O() {
    i({ page: C.value })
  }
  return (
    s['onUpdate:pagination'] !== void 0 && c('update:pagination', { ...r.value }),
    {
      firstRowIndex: n,
      lastRowIndex: S,
      isFirstPage: _,
      isLastPage: R,
      pagesNumber: C,
      computedRowsPerPageOptions: w,
      computedRowsNumber: h,
      firstPage: y,
      prevPage: F,
      nextPage: B,
      lastPage: O,
    }
  )
}
const zt = {
    selection: {
      type: String,
      default: 'none',
      validator: (e) => ['single', 'multiple', 'none'].includes(e),
    },
    selected: { type: Array, default: () => [] },
  },
  Ut = ['update:selected', 'selection']
function It(e, l, r, g) {
  const i = f(() => {
      const R = {}
      return (
        e.selected.map(g.value).forEach((w) => {
          R[w] = !0
        }),
        R
      )
    }),
    m = f(() => e.selection !== 'none'),
    s = f(() => e.selection === 'single'),
    c = f(() => e.selection === 'multiple'),
    u = f(() => r.value.length !== 0 && r.value.every((R) => i.value[g.value(R)] === !0)),
    h = f(() => u.value !== !0 && r.value.some((R) => i.value[g.value(R)] === !0)),
    n = f(() => e.selected.length)
  function S(R) {
    return i.value[R] === !0
  }
  function _() {
    l('update:selected', [])
  }
  function C(R, w, y, F) {
    l('selection', { rows: w, added: y, keys: R, evt: F })
    const B =
      s.value === !0
        ? y === !0
          ? w
          : []
        : y === !0
          ? e.selected.concat(w)
          : e.selected.filter((O) => R.includes(g.value(O)) === !1)
    l('update:selected', B)
  }
  return {
    hasSelectionMode: m,
    singleSelection: s,
    multipleSelection: c,
    allRowsSelected: u,
    someRowsSelected: h,
    rowsSelectedNumber: n,
    isRowSelected: S,
    clearSelection: _,
    updateSelection: C,
  }
}
function Fe(e) {
  return Array.isArray(e) ? e.slice() : []
}
const Wt = { expanded: Array },
  Kt = ['update:expanded']
function Gt(e, l) {
  const r = $(Fe(e.expanded))
  E(
    () => e.expanded,
    (s) => {
      r.value = Fe(s)
    },
  )
  function g(s) {
    return r.value.includes(s)
  }
  function i(s) {
    e.expanded !== void 0 ? l('update:expanded', s) : (r.value = s)
  }
  function m(s, c) {
    const u = r.value.slice(),
      h = u.indexOf(s)
    c === !0 ? h === -1 && (u.push(s), i(u)) : h !== -1 && (u.splice(h, 1), i(u))
  }
  return { isRowExpanded: g, setExpanded: i, updateExpanded: m }
}
const Xt = { visibleColumns: Array }
function Yt(e, l, r) {
  const g = f(() => {
      if (e.columns !== void 0) return e.columns
      const c = e.rows[0]
      return c !== void 0
        ? Object.keys(c).map((u) => ({
            name: u,
            label: u.toUpperCase(),
            field: u,
            align: ge(c[u]) ? 'right' : 'left',
            sortable: !0,
          }))
        : []
    }),
    i = f(() => {
      const { sortBy: c, descending: u } = l.value
      return (
        e.visibleColumns !== void 0
          ? g.value.filter((n) => n.required === !0 || e.visibleColumns.includes(n.name) === !0)
          : g.value
      ).map((n) => {
        const S = n.align || 'right',
          _ = `text-${S}`
        return {
          ...n,
          align: S,
          __iconClass: `q-table__sort-icon q-table__sort-icon--${S}`,
          __thClass:
            _ +
            (n.headerClasses !== void 0 ? ' ' + n.headerClasses : '') +
            (n.sortable === !0 ? ' sortable' : '') +
            (n.name === c ? ` sorted ${u === !0 ? 'sort-desc' : ''}` : ''),
          __tdStyle:
            n.style !== void 0
              ? typeof n.style != 'function'
                ? () => n.style
                : n.style
              : () => null,
          __tdClass:
            n.classes !== void 0
              ? typeof n.classes != 'function'
                ? () => _ + ' ' + n.classes
                : (C) => _ + ' ' + n.classes(C)
              : () => _,
        }
      })
    }),
    m = f(() => {
      const c = {}
      return (
        i.value.forEach((u) => {
          c[u.name] = u
        }),
        c
      )
    }),
    s = f(() =>
      e.tableColspan !== void 0 ? e.tableColspan : i.value.length + (r.value === !0 ? 1 : 0),
    )
  return { colList: g, computedCols: i, computedColsMap: m, computedColspan: s }
}
const p = 'q-table__bottom row items-center',
  je = {}
De.forEach((e) => {
  je[e] = {}
})
const al = z({
  name: 'QTable',
  props: {
    rows: { type: Array, required: !0 },
    rowKey: { type: [String, Function], default: 'id' },
    columns: Array,
    loading: Boolean,
    iconFirstPage: String,
    iconPrevPage: String,
    iconNextPage: String,
    iconLastPage: String,
    title: String,
    hideHeader: Boolean,
    grid: Boolean,
    gridHeader: Boolean,
    dense: Boolean,
    flat: Boolean,
    bordered: Boolean,
    square: Boolean,
    separator: {
      type: String,
      default: 'horizontal',
      validator: (e) => ['horizontal', 'vertical', 'cell', 'none'].includes(e),
    },
    wrapCells: Boolean,
    virtualScroll: Boolean,
    virtualScrollTarget: {},
    ...je,
    noDataLabel: String,
    noResultsLabel: String,
    loadingLabel: String,
    selectedRowsLabel: Function,
    rowsPerPageLabel: String,
    paginationLabel: Function,
    color: { type: String, default: 'grey-8' },
    titleClass: [String, Array, Object],
    tableStyle: [String, Array, Object],
    tableClass: [String, Array, Object],
    tableHeaderStyle: [String, Array, Object],
    tableHeaderClass: [String, Array, Object],
    tableRowStyleFn: Function,
    tableRowClassFn: Function,
    cardContainerClass: [String, Array, Object],
    cardContainerStyle: [String, Array, Object],
    cardStyle: [String, Array, Object],
    cardClass: [String, Array, Object],
    cardStyleFn: Function,
    cardClassFn: Function,
    hideBottom: Boolean,
    hideSelectedBanner: Boolean,
    hideNoData: Boolean,
    hidePagination: Boolean,
    onRowClick: Function,
    onRowDblclick: Function,
    onRowContextmenu: Function,
    ...Oe,
    ...kt,
    ...Xt,
    ...At,
    ...Nt,
    ...Wt,
    ...zt,
    ...Vt,
  },
  emits: ['request', 'virtualScroll', ...Rt, ...Kt, ...Ut],
  setup(e, { slots: l, emit: r }) {
    const g = ee(),
      {
        proxy: { $q: i },
      } = g,
      m = Le(e, i),
      { inFullscreen: s, toggleFullscreen: c } = Tt(),
      u = f(() => (typeof e.rowKey == 'function' ? e.rowKey : (t) => t[e.rowKey])),
      h = $(null),
      n = $(null),
      S = f(() => e.grid !== !0 && e.virtualScroll === !0),
      _ = f(
        () =>
          ' q-table__card' +
          (m.value === !0 ? ' q-table__card--dark q-dark' : '') +
          (e.square === !0 ? ' q-table--square' : '') +
          (e.flat === !0 ? ' q-table--flat' : '') +
          (e.bordered === !0 ? ' q-table--bordered' : ''),
      ),
      C = f(
        () =>
          `q-table__container q-table--${e.separator}-separator column no-wrap` +
          (e.grid === !0 ? ' q-table--grid' : _.value) +
          (m.value === !0 ? ' q-table--dark' : '') +
          (e.dense === !0 ? ' q-table--dense' : '') +
          (e.wrapCells === !1 ? ' q-table--no-wrap' : '') +
          (s.value === !0 ? ' fullscreen scroll' : ''),
      ),
      R = f(() => C.value + (e.loading === !0 ? ' q-table--loading' : ''))
    E(
      () => e.tableStyle + e.tableClass + e.tableHeaderStyle + e.tableHeaderClass + C.value,
      () => {
        S.value === !0 && n.value?.reset()
      },
    )
    const {
        innerPagination: w,
        computedPagination: y,
        isServerSide: F,
        requestServerInteraction: B,
        setPagination: O,
      } = Ht(g, A),
      { computedFilterMethod: T } = Qt(e, O),
      { isRowExpanded: x, setExpanded: U, updateExpanded: Ae } = Gt(e, r),
      te = f(() => {
        let t = e.rows
        if (F.value === !0 || t.length === 0) return t
        const { sortBy: a, descending: d } = y.value
        return (
          e.filter && (t = T.value(t, e.filter, M.value, A)),
          $e.value !== null && (t = ze.value(e.rows === t ? t.slice() : t, a, d)),
          t
        )
      }),
      be = f(() => te.value.length),
      D = f(() => {
        let t = te.value
        if (F.value === !0) return t
        const { rowsPerPage: a } = y.value
        return (
          a !== 0 &&
            (W.value === 0 && e.rows !== t
              ? t.length > K.value && (t = t.slice(0, K.value))
              : (t = t.slice(W.value, K.value))),
          t
        )
      }),
      {
        hasSelectionMode: j,
        singleSelection: Qe,
        multipleSelection: me,
        allRowsSelected: Ee,
        someRowsSelected: Se,
        rowsSelectedNumber: le,
        isRowSelected: ae,
        clearSelection: Ne,
        updateSelection: I,
      } = It(e, r, D, u),
      { colList: He, computedCols: M, computedColsMap: ye, computedColspan: he } = Yt(e, y, j),
      { columnToSort: $e, computedSortMethod: ze, sort: ne } = jt(e, y, He, O),
      {
        firstRowIndex: W,
        lastRowIndex: K,
        isFirstPage: oe,
        isLastPage: re,
        pagesNumber: G,
        computedRowsPerPageOptions: Ue,
        computedRowsNumber: X,
        firstPage: ie,
        prevPage: se,
        nextPage: ue,
        lastPage: ce,
      } = $t(g, w, y, F, O, be),
      Ie = f(() => D.value.length === 0),
      We = f(() => {
        const t = {}
        return (
          De.forEach((a) => {
            t[a] = e[a]
          }),
          t.virtualScrollItemSize === void 0 &&
            (t.virtualScrollItemSize = e.dense === !0 ? 28 : 48),
          t
        )
      })
    function Ke() {
      S.value === !0 && n.value.reset()
    }
    function Ge() {
      if (e.grid === !0) return rt()
      const t = e.hideHeader !== !0 ? qe : null
      if (S.value === !0) {
        const d = l['top-row'],
          v = l['bottom-row'],
          b = { default: (k) => _e(k.item, l.body, k.index) }
        if (d !== void 0) {
          const k = o('tbody', d({ cols: M.value }))
          b.before = t === null ? () => k : () => [t()].concat(k)
        } else t !== null && (b.before = t)
        return (
          v !== void 0 && (b.after = () => o('tbody', v({ cols: M.value }))),
          o(
            Mt,
            {
              ref: n,
              class: e.tableClass,
              style: e.tableStyle,
              ...We.value,
              scrollTarget: e.virtualScrollTarget,
              items: D.value,
              type: '__qtable',
              tableColspan: he.value,
              onVirtualScroll: Ye,
            },
            b,
          )
        )
      }
      const a = [Je()]
      return (
        t !== null && a.unshift(t()),
        Ve({ class: ['q-table__middle scroll', e.tableClass], style: e.tableStyle }, a)
      )
    }
    function Xe(t, a) {
      if (n.value !== null) {
        n.value.scrollTo(t, a)
        return
      }
      t = parseInt(t, 10)
      const d = h.value.querySelector(`tbody tr:nth-of-type(${t + 1})`)
      if (d !== null) {
        const v = h.value.querySelector('.q-table__middle.scroll'),
          b = d.offsetTop - e.virtualScrollStickySizeStart,
          k = b < v.scrollTop ? 'decrease' : 'increase'
        ;((v.scrollTop = b),
          r('virtualScroll', { index: t, from: 0, to: w.value.rowsPerPage - 1, direction: k }))
      }
    }
    function Ye(t) {
      r('virtualScroll', t)
    }
    function we() {
      return [
        o(qt, {
          class: 'q-table__linear-progress',
          color: e.color,
          dark: m.value,
          indeterminate: !0,
          trackColor: 'transparent',
        }),
      ]
    }
    function _e(t, a, d) {
      const v = u.value(t),
        b = ae(v)
      if (a !== void 0) {
        const q = { key: v, row: t, pageIndex: d, __trClass: b ? 'selected' : '' }
        if (
          (e.tableRowStyleFn !== void 0 && (q.__trStyle = e.tableRowStyleFn(t)),
          e.tableRowClassFn !== void 0)
        ) {
          const V = e.tableRowClassFn(t)
          V && (q.__trClass = `${V} ${q.__trClass}`)
        }
        return a(Ce(q))
      }
      const k = l['body-cell'],
        P = M.value.map((q) => {
          const V = l[`body-cell-${q.name}`],
            J = V !== void 0 ? V : k
          return J !== void 0
            ? J(Ze({ key: v, row: t, pageIndex: d, col: q }))
            : o('td', { class: q.__tdClass(t), style: q.__tdStyle(t) }, A(q, t))
        })
      if (j.value === !0) {
        const q = l['body-selection'],
          V =
            q !== void 0
              ? q(pe({ key: v, row: t, pageIndex: d }))
              : [
                  o(fe, {
                    modelValue: b,
                    color: e.color,
                    dark: m.value,
                    dense: e.dense,
                    'onUpdate:modelValue': (J, it) => {
                      I([v], [t], J, it)
                    },
                  }),
                ]
        P.unshift(o('td', { class: 'q-table--col-auto-width' }, V))
      }
      const L = { key: v, class: { selected: b } }
      if (
        (e.onRowClick !== void 0 &&
          ((L.class['cursor-pointer'] = !0),
          (L.onClick = (q) => {
            r('rowClick', q, t, d)
          })),
        e.onRowDblclick !== void 0 &&
          ((L.class['cursor-pointer'] = !0),
          (L.onDblclick = (q) => {
            r('rowDblclick', q, t, d)
          })),
        e.onRowContextmenu !== void 0 &&
          ((L.class['cursor-pointer'] = !0),
          (L.onContextmenu = (q) => {
            r('rowContextmenu', q, t, d)
          })),
        e.tableRowStyleFn !== void 0 && (L.style = e.tableRowStyleFn(t)),
        e.tableRowClassFn !== void 0)
      ) {
        const q = e.tableRowClassFn(t)
        q && (L.class[q] = !0)
      }
      return o('tr', L, P)
    }
    function Je() {
      const t = l.body,
        a = l['top-row'],
        d = l['bottom-row']
      let v = D.value.map((b, k) => _e(b, t, k))
      return (
        a !== void 0 && (v = a({ cols: M.value }).concat(v)),
        d !== void 0 && (v = v.concat(d({ cols: M.value }))),
        o('tbody', v)
      )
    }
    function Ce(t) {
      return (de(t), (t.cols = t.cols.map((a) => N({ ...a }, 'value', () => A(a, t.row)))), t)
    }
    function Ze(t) {
      return (de(t), N(t, 'value', () => A(t.col, t.row)), t)
    }
    function pe(t) {
      return (de(t), t)
    }
    function de(t) {
      ;(Object.assign(t, {
        cols: M.value,
        colsMap: ye.value,
        sort: ne,
        rowIndex: W.value + t.pageIndex,
        color: e.color,
        dark: m.value,
        dense: e.dense,
      }),
        j.value === !0 &&
          N(
            t,
            'selected',
            () => ae(t.key),
            (a, d) => {
              I([t.key], [t.row], a, d)
            },
          ),
        N(
          t,
          'expand',
          () => x(t.key),
          (a) => {
            Ae(t.key, a)
          },
        ))
    }
    function A(t, a) {
      const d = typeof t.field == 'function' ? t.field(a) : a[t.field]
      return t.format !== void 0 ? t.format(d, a) : d
    }
    const Q = f(() => ({
      pagination: y.value,
      pagesNumber: G.value,
      isFirstPage: oe.value,
      isLastPage: re.value,
      firstPage: ie,
      prevPage: se,
      nextPage: ue,
      lastPage: ce,
      inFullscreen: s.value,
      toggleFullscreen: c,
    }))
    function et() {
      const t = l.top,
        a = l['top-left'],
        d = l['top-right'],
        v = l['top-selection'],
        b = j.value === !0 && v !== void 0 && le.value > 0,
        k = 'q-table__top relative-position row items-center'
      if (t !== void 0) return o('div', { class: k }, [t(Q.value)])
      let P
      if (
        (b === !0
          ? (P = v(Q.value).slice())
          : ((P = []),
            a !== void 0
              ? P.push(o('div', { class: 'q-table__control' }, [a(Q.value)]))
              : e.title &&
                P.push(
                  o('div', { class: 'q-table__control' }, [
                    o('div', { class: ['q-table__title', e.titleClass] }, e.title),
                  ]),
                )),
        d !== void 0 &&
          (P.push(o('div', { class: 'q-table__separator col' })),
          P.push(o('div', { class: 'q-table__control' }, [d(Q.value)]))),
        P.length !== 0)
      )
        return o('div', { class: k }, P)
    }
    const Pe = f(() => (Se.value === !0 ? null : Ee.value))
    function qe() {
      const t = tt()
      return (
        e.loading === !0 &&
          l.loading === void 0 &&
          t.push(
            o('tr', { class: 'q-table__progress' }, [
              o('th', { class: 'relative-position', colspan: he.value }, we()),
            ]),
          ),
        o('thead', t)
      )
    }
    function tt() {
      const t = l.header,
        a = l['header-cell']
      if (t !== void 0) return t(ve({ header: !0 })).slice()
      const d = M.value.map((v) => {
        const b = l[`header-cell-${v.name}`],
          k = b !== void 0 ? b : a,
          P = ve({ col: v })
        return k !== void 0 ? k(P) : o(xt, { key: v.name, props: P }, () => v.label)
      })
      if (Qe.value === !0 && e.grid !== !0)
        d.unshift(o('th', { class: 'q-table--col-auto-width' }, ' '))
      else if (me.value === !0) {
        const v = l['header-selection'],
          b =
            v !== void 0
              ? v(ve({}))
              : [
                  o(fe, {
                    color: e.color,
                    modelValue: Pe.value,
                    dark: m.value,
                    dense: e.dense,
                    'onUpdate:modelValue': Re,
                  }),
                ]
        d.unshift(o('th', { class: 'q-table--col-auto-width' }, b))
      }
      return [o('tr', { class: e.tableHeaderClass, style: e.tableHeaderStyle }, d)]
    }
    function ve(t) {
      return (
        Object.assign(t, {
          cols: M.value,
          sort: ne,
          colsMap: ye.value,
          color: e.color,
          dark: m.value,
          dense: e.dense,
        }),
        me.value === !0 && N(t, 'selected', () => Pe.value, Re),
        t
      )
    }
    function Re(t) {
      ;(Se.value === !0 && (t = !1), I(D.value.map(u.value), D.value, t))
    }
    const Y = f(() => {
      const t = [
        e.iconFirstPage || i.iconSet.table.firstPage,
        e.iconPrevPage || i.iconSet.table.prevPage,
        e.iconNextPage || i.iconSet.table.nextPage,
        e.iconLastPage || i.iconSet.table.lastPage,
      ]
      return i.lang.rtl === !0 ? t.reverse() : t
    })
    function lt() {
      if (e.hideBottom === !0) return
      if (Ie.value === !0) {
        if (e.hideNoData === !0) return
        const d =
            e.loading === !0
              ? e.loadingLabel || i.lang.table.loading
              : e.filter
                ? e.noResultsLabel || i.lang.table.noResults
                : e.noDataLabel || i.lang.table.noData,
          v = l['no-data'],
          b =
            v !== void 0
              ? [v({ message: d, icon: i.iconSet.table.warning, filter: e.filter })]
              : [o(Be, { class: 'q-table__bottom-nodata-icon', name: i.iconSet.table.warning }), d]
        return o('div', { class: p + ' q-table__bottom--nodata' }, b)
      }
      const t = l.bottom
      if (t !== void 0) return o('div', { class: p }, [t(Q.value)])
      const a =
        e.hideSelectedBanner !== !0 && j.value === !0 && le.value > 0
          ? [
              o('div', { class: 'q-table__control' }, [
                o('div', [(e.selectedRowsLabel || i.lang.table.selectedRecords)(le.value)]),
              ]),
            ]
          : []
      if (e.hidePagination !== !0) return o('div', { class: p + ' justify-end' }, nt(a))
      if (a.length !== 0) return o('div', { class: p }, a)
    }
    function at(t) {
      O({ page: 1, rowsPerPage: t.value })
    }
    function nt(t) {
      let a
      const { rowsPerPage: d } = y.value,
        v = e.paginationLabel || i.lang.table.pagination,
        b = l.pagination,
        k = e.rowsPerPageOptions.length > 1
      if (
        (t.push(o('div', { class: 'q-table__separator col' })),
        k === !0 &&
          t.push(
            o('div', { class: 'q-table__control' }, [
              o('span', { class: 'q-table__bottom-item' }, [
                e.rowsPerPageLabel || i.lang.table.recordsPerPage,
              ]),
              o(Pt, {
                class: 'q-table__select inline q-table__bottom-item',
                color: e.color,
                modelValue: d,
                options: Ue.value,
                displayValue: d === 0 ? i.lang.table.allRows : d,
                dark: m.value,
                borderless: !0,
                dense: !0,
                optionsDense: !0,
                optionsCover: !0,
                'onUpdate:modelValue': at,
              }),
            ]),
          ),
        b !== void 0)
      )
        a = b(Q.value)
      else if (
        ((a = [
          o('span', d !== 0 ? { class: 'q-table__bottom-item' } : {}, [
            d ? v(W.value + 1, Math.min(K.value, X.value), X.value) : v(1, be.value, X.value),
          ]),
        ]),
        d !== 0 && G.value > 1)
      ) {
        const P = { color: e.color, round: !0, dense: !0, flat: !0 }
        ;(e.dense === !0 && (P.size = 'sm'),
          G.value > 2 &&
            a.push(
              o(Z, {
                key: 'pgFirst',
                ...P,
                icon: Y.value[0],
                disable: oe.value,
                'aria-label': i.lang.pagination.first,
                onClick: ie,
              }),
            ),
          a.push(
            o(Z, {
              key: 'pgPrev',
              ...P,
              icon: Y.value[1],
              disable: oe.value,
              'aria-label': i.lang.pagination.prev,
              onClick: se,
            }),
            o(Z, {
              key: 'pgNext',
              ...P,
              icon: Y.value[2],
              disable: re.value,
              'aria-label': i.lang.pagination.next,
              onClick: ue,
            }),
          ),
          G.value > 2 &&
            a.push(
              o(Z, {
                key: 'pgLast',
                ...P,
                icon: Y.value[3],
                disable: re.value,
                'aria-label': i.lang.pagination.last,
                onClick: ce,
              }),
            ))
      }
      return (t.push(o('div', { class: 'q-table__control' }, a)), t)
    }
    function ot() {
      const t =
        e.gridHeader === !0
          ? [o('table', { class: 'q-table' }, [qe()])]
          : e.loading === !0 && l.loading === void 0
            ? we()
            : void 0
      return o('div', { class: 'q-table__middle' }, t)
    }
    function rt() {
      const t =
        l.item !== void 0
          ? l.item
          : (a) => {
              const d = a.cols.map((b) =>
                o('div', { class: 'q-table__grid-item-row' }, [
                  o('div', { class: 'q-table__grid-item-title' }, [b.label]),
                  o('div', { class: 'q-table__grid-item-value' }, [b.value]),
                ]),
              )
              if (j.value === !0) {
                const b = l['body-selection'],
                  k =
                    b !== void 0
                      ? b(a)
                      : [
                          o(fe, {
                            modelValue: a.selected,
                            color: e.color,
                            dark: m.value,
                            dense: e.dense,
                            'onUpdate:modelValue': (P, L) => {
                              I([a.key], [a.row], P, L)
                            },
                          }),
                        ]
                d.unshift(
                  o('div', { class: 'q-table__grid-item-row' }, k),
                  o(ht, { dark: m.value }),
                )
              }
              const v = {
                class: ['q-table__grid-item-card' + _.value, e.cardClass],
                style: e.cardStyle,
              }
              if (
                (e.cardStyleFn !== void 0 && (v.style = [v.style, e.cardStyleFn(a.row)]),
                e.cardClassFn !== void 0)
              ) {
                const b = e.cardClassFn(a.row)
                b && (v.class[0] += ` ${b}`)
              }
              return (
                (e.onRowClick !== void 0 ||
                  e.onRowDblclick !== void 0 ||
                  e.onRowContextmenu !== void 0) &&
                  ((v.class[0] += ' cursor-pointer'),
                  e.onRowClick !== void 0 &&
                    (v.onClick = (b) => {
                      r('RowClick', b, a.row, a.pageIndex)
                    }),
                  e.onRowDblclick !== void 0 &&
                    (v.onDblclick = (b) => {
                      r('RowDblclick', b, a.row, a.pageIndex)
                    }),
                  e.onRowContextmenu !== void 0 &&
                    (v.onContextmenu = (b) => {
                      r('rowContextmenu', b, a.row, a.pageIndex)
                    })),
                o(
                  'div',
                  {
                    class:
                      'q-table__grid-item col-xs-12 col-sm-6 col-md-4 col-lg-3' +
                      (a.selected === !0 ? ' q-table__grid-item--selected' : ''),
                  },
                  [o('div', v, d)],
                )
              )
            }
      return o(
        'div',
        { class: ['q-table__grid-content row', e.cardContainerClass], style: e.cardContainerStyle },
        D.value.map((a, d) => t(Ce({ key: u.value(a), row: a, pageIndex: d }))),
      )
    }
    return (
      Object.assign(g.proxy, {
        requestServerInteraction: B,
        setPagination: O,
        firstPage: ie,
        prevPage: se,
        nextPage: ue,
        lastPage: ce,
        isRowSelected: ae,
        clearSelection: Ne,
        isRowExpanded: x,
        setExpanded: U,
        sort: ne,
        resetVirtualScroll: Ke,
        scrollTo: Xe,
        getCellValue: A,
      }),
      yt(g.proxy, {
        filteredSortedRows: () => te.value,
        computedRows: () => D.value,
        computedRowsNumber: () => X.value,
      }),
      () => {
        const t = [et()],
          a = { ref: h, class: R.value }
        return (
          e.grid === !0
            ? t.push(ot())
            : Object.assign(a, { class: [a.class, e.cardClass], style: e.cardStyle }),
          t.push(Ge(), lt()),
          e.loading === !0 && l.loading !== void 0 && t.push(l.loading()),
          o('div', a, t)
        )
      }
    )
  },
})
export { al as Q, ll as a, xt as b, Bt as c }
