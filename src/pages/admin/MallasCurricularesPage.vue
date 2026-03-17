<template>
  <q-page class="mallas-curriculares-page q-pa-lg">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title text-gradient">
          <q-icon name="school" color="primary" class="q-mr-sm" />
          Mallas Curriculares (Admin)
        </h1>
        <div class="header-subtitle">
          <p class="page-subtitle">
            Consulta y administra planes de estudio desde API de Planificación externa
          </p>
          <div class="header-badges q-mt-xs">
            <q-badge color="positive" label="API Externa" class="q-mr-xs" />
            <q-badge color="primary" label="Plan Nuevo (N)" />
          </div>
        </div>
      </div>
      <div class="header-actions">
        <q-btn
          outline
          color="primary"
          icon="download"
          label="Exportar Excel"
          @click="exportarExcel"
          :disable="!hasData"
          no-caps
        />
        <q-btn
          unelevated
          color="primary"
          icon="sync"
          label="Sincronizar API"
          @click="sincronizarAPI"
          :loading="sincronizando"
          no-caps
        />
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <q-select
        v-model="filtros.sede"
        :options="sedesOptions"
        outlined
        dense
        label="Sede"
        emit-value
        map-options
        clearable
        style="min-width: 200px"
        @update:model-value="onSedeChange"
      />
      <q-select
        v-model="filtros.carrera"
        :options="carrerasOptions"
        outlined
        dense
        label="Carrera"
        emit-value
        map-options
        clearable
        use-input
        input-debounce="0"
        @filter="filterCarreras"
        :disable="!filtros.sede"
        style="min-width: 300px"
      />
      <q-input
        v-model="filtros.gestion"
        outlined
        dense
        label="Gestión"
        placeholder="1-2026"
        style="min-width: 150px"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="filtros.gestion" mask="1-YYYY" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-btn
        color="primary"
        icon="search"
        label="Consultar"
        @click="fetchMallas"
        :disable="!filtros.sede || !filtros.carrera"
        :loading="loading"
        unelevated
        no-caps
      />
    </div>

    <!-- Estadísticas -->
    <div class="stats-row" v-if="hasData">
      <div class="stat-card">
        <q-icon name="menu_book" size="28px" color="primary" />
        <div class="stat-info">
          <span class="stat-value">{{ totalMaterias }}</span>
          <span class="stat-label">Materias</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="layers" size="28px" color="blue" />
        <div class="stat-info">
          <span class="stat-value">{{ semestresUnicos.length }}</span>
          <span class="stat-label">Semestres</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="person" size="28px" color="green" />
        <div class="stat-info">
          <span class="stat-value">{{ totalDocentes }}</span>
          <span class="stat-label">Docentes Únicos</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="new_releases" size="28px" color="amber" />
        <div class="stat-info">
          <span class="stat-value">Plan N</span>
          <span class="stat-label">Todas son Plan Nuevo</span>
        </div>
      </div>
    </div>

    <!-- Tabla de Materias -->
    <q-card class="table-card" v-if="hasData">
      <q-table
        :rows="materiasFiltradas"
        :columns="columns"
        row-key="codigo"
        :pagination="{ rowsPerPage: 20 }"
        flat
        bordered
        :loading="loading"
      >
        <template v-slot:no-data>
          <div class="full-width row flex-center text-accent q-gutter-sm" style="padding: 40px">
            <q-icon size="2em" name="info" />
            <span>No se encontraron materias para esta selección.</span>
          </div>
        </template>

        <template v-slot:body-cell-codigo="props">
          <q-td :props="props">
            <q-chip
              outline
              color="primary"
              text-color="primary"
              size="sm"
              class="text-weight-bold cursor-pointer"
              clickable
              @click="verComparacion(props.row)"
            >
              {{ props.row.codigo }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="materia-info">
              <span class="materia-nombre text-weight-bold">{{ props.row.nombre }}</span>
              <span class="materia-carrera text-grey-8">{{ props.row.carrera_nombre }}</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-semestre="props">
          <q-td :props="props">
            <q-badge
              :color="getSemestreColor(props.row.semestre)"
              text-color="white"
              class="q-px-sm q-py-xs text-weight-medium"
              rounded
            >
              {{ props.row.semestre }}° Sem
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-plan="props">
          <q-td :props="props">
            <q-badge color="positive" :label="props.row.plan_estudios || 'N'" />
          </q-td>
        </template>

        <template v-slot:body-cell-docentes="props">
          <q-td :props="props">
            <div class="docentes-lines">
              <div
                v-for="(docenteStr, idx) in props.row.docentesArray"
                :key="idx"
                class="docente-line"
              >
                <template v-if="docenteStr">
                  {{ parseDocenteConGrupos(docenteStr).docente }}
                  <template v-if="parseDocenteConGrupos(docenteStr).grupos.length">
                    <q-chip
                      v-for="(grupo, gIdx) in parseDocenteConGrupos(docenteStr).grupos"
                      :key="gIdx"
                      dense
                      color="primary"
                      text-color="white"
                      size="xs"
                      class="q-ml-xs"
                    >
                      {{ grupo }}
                    </q-chip>
                  </template>
                </template>
              </div>
              <div
                v-if="!props.row.docentesArray?.length"
                class="text-grey-7 text-italic"
                style="font-size: 0.85rem"
              >
                Sin asignar
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-comparacion="props">
          <q-td :props="props">
            <div v-if="getLocalAsignatura(props.row.codigo)" class="comparacion-local">
              <div class="text-weight-medium">
                {{ getLocalAsignatura(props.row.codigo).nombre }}
              </div>
              <div
                v-if="getLocalDocentesConGrupos(getLocalAsignatura(props.row.codigo)).length"
                class="text-caption"
              >
                <div
                  v-for="(item, idx) in getLocalDocentesConGrupos(
                    getLocalAsignatura(props.row.codigo),
                  )"
                  :key="idx"
                  class="docente-line"
                >
                  {{ item.docente }}
                  <template v-if="item.grupos.length">
                    <q-chip
                      v-for="(grupo, gIdx) in item.grupos"
                      :key="gIdx"
                      dense
                      color="primary"
                      text-color="white"
                      size="xs"
                      class="q-ml-xs"
                    >
                      {{ grupo }}
                    </q-chip>
                  </template>
                </div>
              </div>
              <div v-else class="text-grey-7 text-italic">Sin asignar localmente</div>
            </div>
            <div v-else class="text-grey-7 text-italic">No existe en asignaturas locales</div>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-right">
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="primary"
              size="sm"
              @click="editarMateria(props.row)"
            >
              <q-tooltip>Editar información</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="sync"
              color="amber"
              size="sm"
              @click="sincronizarMateria(props.row)"
            >
              <q-tooltip>Sincronizar desde API</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Estado Vacío -->
    <q-card flat bordered v-else-if="searched && !hasData" class="q-mt-md text-center q-pa-xl">
      <q-icon name="warning" size="4rem" color="warning" class="q-mb-md" />
      <div class="text-h6 text-grey-8">No se encontraron materias.</div>
      <div class="text-body2 text-grey-6">
        Verifica los filtros seleccionados o que la API de planificación esté disponible.
      </div>
    </q-card>

    <!-- Diálogo Edición -->
    <q-dialog v-model="dialogEdicion" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Editar Materia</div>
          <div class="text-caption text-grey-7">
            {{ materiaEditada?.codigo }} - {{ materiaEditada?.nombre }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="materiaEditada.semestre"
            label="Semestre"
            type="number"
            min="1"
            max="12"
            outlined
            dense
          />
          <q-input
            v-model="materiaEditada.observaciones"
            label="Observaciones"
            type="textarea"
            outlined
            dense
            class="q-mt-sm"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" @click="dialogEdicion = false" />
          <q-btn color="primary" label="Guardar" @click="guardarEdicion" :loading="guardando" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useSedesStore } from 'stores/sedes'
import { useCarrerasStore } from 'stores/carreras'
import { useAsignaturasStore } from 'stores/asignaturas'
import { exportFile } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()
const asignaturasStore = useAsignaturasStore()

// Mapeo de carreras a códigos API externos (como fallback)
const CARRERAS_API_MAP = {
  enfermería: 'carenl',
  'licenciatura en enfermería': 'carenl',
  sistemas: 'carsis',
  'ingeniería de sistemas': 'carsis',
  // agregar más según necesidad
}

// Helper para obtener código API de carrera
function getCarreraApiCode(carrera) {
  if (!carrera) return null
  // 1. Usar codigo_api si existe
  if (carrera.codigo_api) return carrera.codigo_api
  // 2. Usar codigo en minúsculas
  if (carrera.codigo) return carrera.codigo.toLowerCase()
  // 3. Buscar en mapeo por nombre
  const nombreLower = carrera.nombre.toLowerCase()
  for (const [key, value] of Object.entries(CARRERAS_API_MAP)) {
    if (nombreLower.includes(key)) return value
  }
  return null
}

function onSedeChange() {
  filtros.value.carrera = null
  materias.value = []
  localAsignaturas.value = []
  searched.value = false
}

// Filtros
const filtros = ref({
  sede: null,
  carrera: null,
  gestion: getGestionActual(),
})

// Estados
const loading = ref(false)
const sincronizando = ref(false)
const guardando = ref(false)
const searched = ref(false)
const materias = ref([])
const dialogEdicion = ref(false)
const materiaEditada = ref(null)
const localAsignaturas = ref([])
const loadingLocal = ref(false)

// Opciones de filtro
const carrerasFiltradas = ref([])

// Columnas de tabla
const columns = [
  {
    name: 'codigo',
    label: 'CÓDIGO',
    field: 'codigo',
    align: 'left',
    sortable: true,
    style: 'font-weight: bold; width: 100px;',
  },
  {
    name: 'nombre',
    label: 'MATERIA',
    field: 'nombre',
    align: 'left',
    sortable: true,
  },
  {
    name: 'semestre',
    label: 'SEMESTRE',
    field: 'semestre',
    align: 'center',
    sortable: true,
    style: 'width: 120px;',
  },
  {
    name: 'plan',
    label: 'PLAN',
    field: 'plan_estudios',
    align: 'center',
    style: 'width: 80px;',
  },
  {
    name: 'docentes',
    label: 'DOCENTES',
    field: 'docentes',
    align: 'left',
  },
  {
    name: 'comparacion',
    label: 'COMPARACIÓN LOCAL',
    align: 'left',
    style: 'width: 250px;',
  },
  {
    name: 'acciones',
    label: 'ACCIONES',
    align: 'right',
    style: 'width: 120px;',
  },
]

// Computed
const sedesOptions = computed(() => {
  return sedesStore.sedes
    .filter((s) => s.activo)
    .map((s) => ({
      label: s.nombre,
      value: s.id,
      id_api: s.id_api || s.id,
    }))
})

const carrerasOptions = computed(() => {
  if (!filtros.value.sede) return []
  return carrerasStore.carreras
    .filter((c) => {
      return (
        c.sede_id === filtros.value.sede ||
        (c.sedes_ids && c.sedes_ids.includes(filtros.value.sede))
      )
    })
    .map((c) => ({
      label: `${c.nombre} (${c.codigo || 'sin código'})`,
      value: c.id,
      codigo_api: c.codigo_api || c.codigo?.toLowerCase(),
    }))
})

const hasData = computed(() => materias.value.length > 0)

const materiasFiltradas = computed(() => {
  return materias.value.map((m) => ({
    ...m,
    docentesArray: normalizeDocentes(m.docentes),
    carrera_nombre: getCarreraNombre(m.carrera_id),
  }))
})

const totalMaterias = computed(() => materias.value.length)

const semestresUnicos = computed(() => {
  const semestres = materias.value.map((m) => m.semestre).filter(Boolean)
  return [...new Set(semestres)].sort((a, b) => a - b)
})

const totalDocentes = computed(() => {
  const todosDocentes = materias.value
    .filter((m) => m.docentes)
    .flatMap((m) => normalizeDocentes(m.docentes))
    .map((d) => d.trim())
  return new Set(todosDocentes).size
})

const localAsignaturasMap = computed(() => {
  const map = new Map()
  localAsignaturas.value.forEach((asig) => {
    if (asig.codigo) map.set(asig.codigo.trim().toUpperCase(), asig)
  })
  return map
})

function getLocalAsignatura(codigo) {
  const codigoNormalizado = codigo?.trim().toUpperCase()
  const result = localAsignaturasMap.value.get(codigoNormalizado)
  console.log('getLocalAsignatura:', {
    codigo,
    codigoNormalizado,
    result: result
      ? {
          codigo: result.codigo,
          nombre: result.nombre,
          hasDocentes: !!result.docentes,
          hasGrupos: !!result.grupos,
        }
      : null,
    mapKeys: Array.from(localAsignaturasMap.value.keys()),
  })
  return result
}

function getLocalDocentesConGrupos(asig) {
  if (!asig) return []
  console.log('getLocalDocentesConGrupos - asignatura:', {
    codigo: asig.codigo,
    nombre: asig.nombre,
    docentes: asig.docentes,
    grupos: asig.grupos,
    hasDocentes: !!asig.docentes,
    hasGrupos: !!asig.grupos,
    docentesType: typeof asig.docentes,
    gruposType: typeof asig.grupos,
    isArrayDocentes: Array.isArray(asig.docentes),
    isArrayGrupos: Array.isArray(asig.grupos),
  })

  const map = new Map()

  // 1. Agregar docentes directos (sin grupos)
  if (asig.docentes && Array.isArray(asig.docentes)) {
    console.log('  Procesando docentes directos, cantidad:', asig.docentes.length)
    asig.docentes.forEach((doc, idx) => {
      let nombre = 'Sin nombre'
      if (typeof doc === 'string') {
        nombre = doc.trim() || 'Sin nombre'
      } else if (doc && typeof doc === 'object') {
        nombre = doc.nombre_completo || doc.nombre || doc.nombres || 'Sin nombre'
        if (doc.apellidos && nombre === 'Sin nombre') {
          nombre = `${doc.nombres || ''} ${doc.apellidos || ''}`.trim() || 'Sin nombre'
        }
      }
      console.log(`  Docente directo ${idx}:`, {
        nombre,
        doc,
        type: typeof doc,
        isString: typeof doc === 'string',
        isObject: typeof doc === 'object' && doc !== null,
      })
      if (!map.has(nombre)) {
        map.set(nombre, { docente: nombre, grupos: [] })
        console.log(`    -> Agregado nuevo docente: ${nombre}`)
      } else {
        console.log(`    -> Docente ya existe: ${nombre}`)
      }
    })
  } else {
    console.log('  No hay docentes directos o no es array')
  }

  // 2. Agregar docentes de grupos (con nombres de grupo)
  if (asig.grupos && Array.isArray(asig.grupos)) {
    console.log('  Total grupos:', asig.grupos.length)
    asig.grupos.forEach((grupo, index) => {
      console.log(`  Grupo ${index}:`, {
        id: grupo.id,
        nombre: grupo.nombre,
        tipo: grupo.tipo,
        turno: grupo.turno,
        docente: grupo.docente,
        hasDocente: !!grupo.docente,
        docenteType: typeof grupo.docente,
        allFields: Object.keys(grupo),
      })

      const docente = grupo.docente
      if (docente) {
        console.log(`  Grupo ${index} tiene docente`)
        let nombre = 'Sin nombre'
        if (typeof docente === 'string') {
          nombre = docente.trim() || 'Sin nombre'
          console.log(`    Docente es string: "${docente}" -> nombre: "${nombre}"`)
        } else if (docente && typeof docente === 'object') {
          nombre = docente.nombre_completo || docente.nombre || docente.nombres || 'Sin nombre'
          if (docente.apellidos && nombre === 'Sin nombre') {
            nombre = `${docente.nombres || ''} ${docente.apellidos || ''}`.trim() || 'Sin nombre'
          }
          console.log(`    Docente es objeto:`, docente, `-> nombre: "${nombre}"`)
        }

        // Intentar obtener nombre de grupo de varias fuentes
        let grupoNombre = grupo.nombre || grupo.tipo || grupo.turno || 'Sin grupo'
        console.log(
          `    Campos grupo: nombre="${grupo.nombre}", tipo="${grupo.tipo}", turno="${grupo.turno}" -> grupoNombre="${grupoNombre}"`,
        )

        // Si el nombre es un número o código, formatearlo mejor
        if (grupoNombre && !isNaN(grupoNombre) && grupoNombre !== 'Sin grupo') {
          grupoNombre = `Grupo ${grupoNombre}`
          console.log(`    Formateado número: "${grupoNombre}"`)
        }

        console.log(`    Resultado final grupo ${index}:`, {
          nombre,
          grupoNombre,
          grupoNombreRaw: grupo.nombre,
          grupoTipo: grupo.tipo,
          grupoTurno: grupo.turno,
        })

        if (!map.has(nombre)) {
          map.set(nombre, { docente: nombre, grupos: [] })
          console.log(`    -> Agregado nuevo docente desde grupo: ${nombre}`)
        } else {
          console.log(`    -> Docente ya existe en map: ${nombre}`)
        }
        const entry = map.get(nombre)
        console.log(`    Entry actual para ${nombre}:`, entry)
        if (grupoNombre && !entry.grupos.includes(grupoNombre)) {
          entry.grupos.push(grupoNombre)
          console.log(`    -> Agregado grupo "${grupoNombre}" a docente "${nombre}"`)
        } else if (!grupoNombre) {
          console.log(`    -> grupoNombre es falsy, no se agrega`)
        } else {
          console.log(`    -> Grupo "${grupoNombre}" ya existe para docente "${nombre}"`)
        }
      } else {
        console.log(`  Grupo ${index} sin docente asignado`)
      }
    })
  } else {
    console.log('  No hay grupos o no es array')
  }

  const result = Array.from(map.values())
  console.log('  Resultado final:', result)
  console.log('  Resumen:')
  result.forEach((item, idx) => {
    console.log(`    ${idx}. ${item.docente} - grupos: ${item.grupos.length}`, item.grupos)
  })
  return result
}

function normalizeDocentes(docentes) {
  if (!docentes) return []
  if (Array.isArray(docentes)) return docentes
  // String separado por comas
  return docentes
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseDocenteConGrupos(docenteStr) {
  // Formato: "Docente (Grupo1, Grupo2)" o "Docente"
  const match = docenteStr.match(/^(.+?)\s*\((.+)\)$/)
  if (match) {
    const docente = match[1].trim()
    const grupos = match[2]
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean)
    return { docente, grupos }
  }
  return { docente: docenteStr, grupos: [] }
}

// Funciones
function getGestionActual() {
  const year = new Date().getFullYear()
  const month = new Date().getMonth() + 1
  const periodo = month <= 6 ? 1 : 2
  return `${periodo}-${year}`
}

function getSemestreColor(semestre) {
  const colors = [
    'red',
    'pink',
    'purple',
    'deep-purple',
    'indigo',
    'blue',
    'light-blue',
    'cyan',
    'teal',
    'green',
    'light-green',
    'lime',
  ]
  const index = (semestre - 1) % colors.length
  return colors[index] || 'grey'
}

function getCarreraNombre(carreraId) {
  const carrera = carrerasStore.carreras.find((c) => c.id === carreraId)
  return carrera?.nombre || 'Carrera no encontrada'
}

function filterCarreras(val, update) {
  if (val === '') {
    update(() => {
      carrerasFiltradas.value = carrerasOptions.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    carrerasFiltradas.value = carrerasOptions.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    )
  })
}

async function fetchLocalAsignaturas() {
  if (!filtros.value.sede || !filtros.value.carrera) return
  loadingLocal.value = true
  try {
    await asignaturasStore.fetchAsignaturas(
      filtros.value.sede,
      filtros.value.carrera,
      null, // semestre
      '', // search
    )
    localAsignaturas.value = asignaturasStore.asignaturas
    console.log(
      'fetchLocalAsignaturas - asignaturas locales:',
      localAsignaturas.value.map((a) => ({
        codigo: a.codigo,
        nombre: a.nombre,
        docentes: a.docentes,
        grupos: a.grupos,
        grupos_count: a.grupos?.length || 0,
      })),
    )
  } catch (error) {
    console.error('Error fetching local asignaturas:', error)
    localAsignaturas.value = []
  } finally {
    loadingLocal.value = false
  }
}

async function fetchMallas() {
  if (!filtros.value.sede || !filtros.value.carrera) return

  loading.value = true
  searched.value = true
  materias.value = []

  try {
    const carrera = carrerasStore.carreras.find((c) => c.id === filtros.value.carrera)
    const codigoCarrera = getCarreraApiCode(carrera)

    console.log('Fetching mallas for:', {
      sede: filtros.value.sede,
      carreraId: filtros.value.carrera,
      carreraNombre: carrera?.nombre,
      codigoCarrera,
    })

    if (!codigoCarrera) {
      throw new Error('Carrera no tiene código API configurado')
    }

    const sedeApiId = sedesStore.getSedeApiId(filtros.value.sede)
    console.log('Sede API ID:', sedeApiId, 'Sede internal ID:', filtros.value.sede)
    const response = await api.get('/grupos-externo/plan-n', {
      params: {
        gestion: filtros.value.gestion,
        carrera: codigoCarrera,
        sede: sedeApiId,
      },
    })

    console.log('API Response:', response.data)
    if (response.data.success) {
      materias.value = response.data.data.map((m) => ({
        ...m,
        carrera_id: filtros.value.carrera,
        sede_id: filtros.value.sede,
      }))

      await fetchLocalAsignaturas()

      $q.notify({
        type: 'positive',
        message: `Cargadas ${materias.value.length} materias del Plan N`,
        position: 'top-right',
      })
    }
  } catch (error) {
    console.error('Error fetching mallas curriculares:', error)
    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message || 'Error al cargar las mallas curriculares desde la API',
      position: 'top-right',
    })
  } finally {
    loading.value = false
  }
}

async function sincronizarAPI() {
  sincronizando.value = true
  try {
    // Forzar recarga de datos limpiando cache
    if (filtros.value.sede && filtros.value.carrera) {
      const carrera = carrerasStore.carreras.find((c) => c.id === filtros.value.carrera)
      const codigoCarrera = carrera?.codigo_api || carrera?.codigo?.toLowerCase()

      await api.post('/grupos-externo/refresh', {
        gestion: filtros.value.gestion,
        carrera: codigoCarrera,
        sede: filtros.value.sede,
      })

      // Recargar datos
      await fetchMallas()

      $q.notify({
        type: 'positive',
        message: 'Datos sincronizados correctamente',
        position: 'top-right',
      })
    }
  } catch (error) {
    console.error('Error sincronizando API:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al sincronizar con la API externa',
      position: 'top-right',
    })
  } finally {
    sincronizando.value = false
  }
}

function editarMateria(materia) {
  materiaEditada.value = { ...materia }
  dialogEdicion.value = true
}

async function guardarEdicion() {
  guardando.value = true
  try {
    // Aquí iría la lógica para guardar en backend
    // Por ahora solo actualizamos localmente
    const index = materias.value.findIndex((m) => m.codigo === materiaEditada.value.codigo)
    if (index !== -1) {
      materias.value[index] = { ...materias.value[index], ...materiaEditada.value }
    }

    $q.notify({
      type: 'positive',
      message: 'Cambios guardados localmente',
      position: 'top-right',
    })

    dialogEdicion.value = false
  } catch (error) {
    console.error('Error guardando edición:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al guardar los cambios',
      position: 'top-right',
    })
  } finally {
    guardando.value = false
  }
}

function sincronizarMateria(materia) {
  $q.notify({
    type: 'info',
    message: `Sincronizando ${materia.codigo}...`,
    position: 'top-right',
  })
  // Lógica para sincronizar materia individual
}

function exportarExcel() {
  if (!materias.value.length) return

  const headers = [
    'Código',
    'Materia',
    'Semestre',
    'Plan',
    'Docentes',
    'Carrera',
    'Sede',
    'Gestión',
  ]
  const rows = materias.value.map((m) => [
    m.codigo,
    m.nombre,
    m.semestre,
    m.plan_estudios || 'N',
    (Array.isArray(m.docentes) ? m.docentes.join(', ') : m.docentes) || 'Sin asignar',
    getCarreraNombre(m.carrera_id),
    sedesStore.getSedeById(m.sede_id)?.nombre || 'Desconocida',
    filtros.value.gestion,
  ])

  const content = [headers, ...rows].map((row) => row.join(',')).join('\n')

  const status = exportFile(
    `mallas-curriculares-${filtros.value.gestion}-${new Date().toISOString().slice(0, 10)}.csv`,
    content,
    'text/csv',
  )

  if (status !== true) {
    $q.notify({
      type: 'negative',
      message: 'Error al exportar el archivo',
      position: 'top-right',
    })
  }
}

function verComparacion(materia) {
  const sedeApiId = sedesStore.getSedeApiId(filtros.value.sede)
  const carrera = carrerasStore.carreras.find((c) => c.id === filtros.value.carrera)
  const carreraApiCode = carrera ? getCarreraApiCode(carrera) : filtros.value.carrera
  router.push({
    name: 'comparacion-asignatura',
    query: {
      codigo: materia.codigo,
      sede: sedeApiId,
      carrera: carreraApiCode,
      gestion: filtros.value.gestion,
    },
  })
}

// Lifecycle
onMounted(async () => {
  if (sedesStore.sedes.length === 0) await sedesStore.fetchSedes()
  if (carrerasStore.carreras.length === 0) await carrerasStore.fetchCarreras()
})
</script>

<style scoped>
.mallas-curriculares-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-info .page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.text-gradient {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  margin: 4px 0 0;
  color: #6c757d;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filters-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 2px;
}

.table-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.materia-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.materia-nombre {
  font-size: 0.95rem;
  line-height: 1.3;
}

.materia-carrera {
  font-size: 0.8rem;
}

.docentes-lines {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.docente-line {
  line-height: 1.3;
}

.comparacion-local {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
