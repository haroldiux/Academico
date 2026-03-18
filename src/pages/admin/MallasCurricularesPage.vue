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
            <q-badge color="grey-6" label="BD Local" class="q-mr-xs" />
            <q-badge color="primary" label="Plan Nuevo (N)" class="q-mr-xs" />
            <q-badge
              v-if="ultimoSync"
              color="positive"
              :label="`Sync: ${ultimoSync}`"
            />
            <q-badge v-else color="warning" label="Sin sincronizar" />
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
          @click="abrirDialogoSincronizar"
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

    <!-- Diálogo Sincronización -->
    <q-dialog v-model="dialogSincronizar" persistent>
      <q-card style="min-width: 680px; max-width: 96vw">
        <q-card-section class="bg-primary text-white q-pb-sm">
          <div class="row items-center justify-between">
            <div class="text-h6">
              <q-icon name="sync" class="q-mr-sm" />
              Sincronizar API Planning — Cochabamba
            </div>
            <q-btn flat round dense icon="close" color="white" @click="cerrarDialogoSincronizar" />
          </div>
          <div class="text-caption text-blue-2">Gestión: {{ filtros.gestion }}</div>
        </q-card-section>

        <!-- Estado por carrera -->
        <q-card-section class="q-pa-sm">
          <div class="row items-center justify-between q-px-sm q-mb-xs">
            <span class="text-subtitle2 text-grey-8">Estado por carrera</span>
            <div class="row gap-sm">
              <q-chip dense color="positive" text-color="white" size="sm">
                <q-icon name="check" size="xs" class="q-mr-xs" />
                {{ syncCarreras.filter(c => c.sincronizado).length }} con datos
              </q-chip>
              <q-chip dense color="warning" text-color="white" size="sm">
                <q-icon name="warning" size="xs" class="q-mr-xs" />
                {{ syncCarreras.filter(c => !c.sincronizado).length }} sin datos
              </q-chip>
            </div>
          </div>

          <q-scroll-area style="height: 280px">
            <q-list dense separator>
              <q-item
                v-for="carrera in syncCarreras"
                :key="carrera.codigo"
                class="q-py-xs"
              >
                <q-item-section avatar style="min-width: 40px">
                  <q-icon
                    :name="carrera.sincronizando ? 'hourglass_empty'
                          : carrera.sincronizado ? 'check_circle'
                          : carrera.error ? 'error'
                          : 'radio_button_unchecked'"
                    :color="carrera.sincronizando ? 'blue'
                           : carrera.sincronizado ? 'positive'
                           : carrera.error ? 'negative'
                           : 'grey-4'"
                    :class="{ 'rotating': carrera.sincronizando }"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-medium" style="font-size:0.85rem">
                    {{ carrera.codigo }}
                  </q-item-label>
                  <q-item-label caption>
                    <span v-if="carrera.sincronizando" class="text-blue">Sincronizando...</span>
                    <span v-else-if="carrera.sincronizado" class="text-positive">
                      {{ carrera.registros_en_bd }} registros
                      <span v-if="carrera.sincronizado_at" class="text-grey-6">
                        · {{ formatFecha(carrera.sincronizado_at) }}
                      </span>
                    </span>
                    <span v-else-if="carrera.error" class="text-negative">{{ carrera.error }}</span>
                    <span v-else class="text-grey-6">Sin datos en BD</span>
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    round
                    icon="refresh"
                    size="sm"
                    color="primary"
                    :loading="carrera.sincronizando"
                    :disable="sincronizando"
                    @click="sincronizarCarreraIndividual(carrera.codigo)"
                  >
                    <q-tooltip>Re-sincronizar solo {{ carrera.codigo }}</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card-section>

        <q-separator />

        <!-- Confirmación para sync masivo -->
        <q-card-section class="q-pt-sm q-pb-sm">
          <q-banner class="bg-orange-1 text-orange-10 q-mb-sm" rounded dense>
            <template v-slot:avatar>
              <q-icon name="warning" color="orange" />
            </template>
            Sincronizar todas reemplaza los datos actuales de la gestión
            <strong>{{ filtros.gestion }}</strong>.
          </q-banner>
          <div class="text-body2 text-grey-8 q-mb-xs">
            Para sincronizar <strong>todas</strong>, escribe <strong>sincronizar</strong>:
          </div>
          <q-input
            v-model="confirmacionTexto"
            outlined
            dense
            placeholder="sincronizar"
            :error="confirmacionError"
            error-message="Escribe exactamente 'sincronizar'"
            @keyup.enter="ejecutarSincronizacion"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pb-md q-pr-md">
          <q-btn flat label="Cerrar" @click="cerrarDialogoSincronizar" />
          <q-btn
            color="primary"
            icon="sync"
            label="Sincronizar Todas"
            :disable="confirmacionTexto !== 'sincronizar' || sincronizando"
            @click="ejecutarSincronizacion"
            :loading="sincronizando"
            unelevated
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

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

// Mapeo de carreras a códigos API externos (fallback por nombre)
// Fuente de verdad: campo `codigo` en la tabla carreras de la BD
const CARRERAS_API_MAP = {
  'administración de empresas': 'caradm',
  'arte y escultura': 'caraye',
  'bioquímica y farmacia': 'carbyf',
  'complementaria en administración': 'carcad',
  'complementaria contaduría': 'carccp',
  'complementaria ingeniería comercial': 'carcic',
  'cinematografía': 'carcne',
  'contaduría pública': 'carcpu',
  'comunicación social': 'carcso',
  'derecho': 'carder',
  'economía': 'careco',
  'ingeniería electronica': 'carele',
  'enfermería': 'carenl',
  'fisioterapia': 'carfis',
  'fonoaudiologia': 'carfon',
  'ingeniería biomédica': 'caribi',
  'ingeniería comercial': 'carico',
  'medicina veterinaria': 'carvet',
  'medicina': 'carmed',
  'nutrición': 'carnyd',
  'odontología': 'carodo',
  'protesis dental': 'carpro',
  'ingeniería de sistemas': 'carsis',
  'ingeniería de sonido': 'carson',
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

// Diálogo de sincronización
const dialogSincronizar = ref(false)
const confirmacionTexto = ref('')
const confirmacionError = ref(false)
const ultimoSync = ref(null) // fecha de último sync exitoso
const syncCarreras = ref([]) // estado por carrera en el diálogo

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

    if (!codigoCarrera) {
      $q.notify({
        type: 'warning',
        message: 'Esta carrera no tiene código API configurado. Contacta al administrador.',
        position: 'top-right',
      })
      return
    }

    const sedeApiId = sedesStore.getSedeApiId(filtros.value.sede) || filtros.value.sede

    // Leer de la BD local (planning_cache) — NO de la API externa
    const response = await api.get('/planning/cache', {
      params: {
        gestion: filtros.value.gestion,
        carrera_codigo: codigoCarrera.toUpperCase(),
        sede_api_id: sedeApiId,
      },
    })

    if (response.data.success) {
      if (!response.data.sincronizado || response.data.data.length === 0) {
        // No hay datos en BD — avisar al usuario que debe sincronizar
        $q.notify({
          type: 'warning',
          icon: 'sync',
          message: 'No hay datos sincronizados para esta carrera y gestión. Usa "Sincronizar API" primero.',
          position: 'top-right',
          timeout: 5000,
        })
        return
      }

      materias.value = response.data.data.map((m) => ({
        ...m,
        carrera_id: filtros.value.carrera,
        sede_id: filtros.value.sede,
      }))

      // Actualizar fecha de último sync
      if (response.data.sincronizado_at) {
        ultimoSync.value = new Date(response.data.sincronizado_at).toLocaleString('es-BO', {
          dateStyle: 'short',
          timeStyle: 'short',
        })
      }

      await fetchLocalAsignaturas()

      $q.notify({
        type: 'positive',
        message: `${materias.value.length} materias cargadas desde BD local`,
        position: 'top-right',
      })
    }
  } catch (error) {
    console.error('Error fetching mallas desde BD:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al consultar los datos locales',
      position: 'top-right',
    })
  } finally {
    loading.value = false
  }
}

async function abrirDialogoSincronizar() {
  confirmacionTexto.value = ''
  confirmacionError.value = false
  dialogSincronizar.value = true
  await cargarEstadoCarreras()
}

function cerrarDialogoSincronizar() {
  dialogSincronizar.value = false
  confirmacionTexto.value = ''
  confirmacionError.value = false
}

async function cargarEstadoCarreras() {
  try {
    const res = await api.get('/planning/sync-status', {
      params: { gestion: filtros.value.gestion },
    })
    if (res.data.success) {
      // Combinar la lista del servidor con estado de sincronizando=false
      syncCarreras.value = (res.data.carreras || []).map((c) => ({
        ...c,
        sincronizando: false,
        error: null,
      }))
    }
  } catch {
    // silencioso
  }
}

function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })
}

async function sincronizarCarreraIndividual(codigo) {
  const carrera = syncCarreras.value.find((c) => c.codigo === codigo)
  if (!carrera) return

  carrera.sincronizando = true
  carrera.error = null

  try {
    const res = await api.post('/planning/sincronizar-carrera', {
      gestion: filtros.value.gestion,
      carrera_codigo: codigo,
    })

    if (res.data.success) {
      carrera.sincronizado = true
      carrera.registros_en_bd = res.data.resultado?.registros ?? 0
      carrera.sincronizado_at = new Date().toISOString()
      $q.notify({
        type: 'positive',
        message: `${codigo} sincronizada: ${carrera.registros_en_bd} registros`,
        position: 'top-right',
      })
    } else {
      carrera.error = res.data.message || 'Error desconocido'
      $q.notify({ type: 'negative', message: `Error en ${codigo}: ${carrera.error}`, position: 'top-right' })
    }
  } catch (e) {
    carrera.error = e.response?.data?.message || 'Error de conexión'
    $q.notify({ type: 'negative', message: `Error en ${codigo}`, position: 'top-right' })
  } finally {
    carrera.sincronizando = false
    // Si hay filtros activos y es la carrera seleccionada, recargar tabla
    const carreraActual = carrerasStore.carreras.find((c) => c.id === filtros.value.carrera)
    const codigoActual = getCarreraApiCode(carreraActual)
    if (codigoActual?.toUpperCase() === codigo && filtros.value.sede && filtros.value.carrera) {
      await fetchMallas()
    }
  }
}

async function ejecutarSincronizacion() {
  if (confirmacionTexto.value !== 'sincronizar') {
    confirmacionError.value = true
    return
  }

  confirmacionError.value = false
  sincronizando.value = true

  try {
    const response = await api.post('/planning/sincronizar-cochabamba', {
      gestion: filtros.value.gestion,
    })

    cerrarDialogoSincronizar()

    if (response.data.success) {
      // Actualizar el estado visual de cada carrera con los resultados
      if (response.data.resultados) {
        response.data.resultados.forEach((r) => {
          const carrera = syncCarreras.value.find((c) => c.codigo === r.codigo)
          if (carrera) {
            carrera.sincronizado = r.status === 'ok'
            carrera.registros_en_bd = r.registros ?? 0
            carrera.error = r.status === 'error' ? r.mensaje : null
            if (r.status === 'ok') carrera.sincronizado_at = new Date().toISOString()
          }
        })
      }

      confirmacionTexto.value = ''

      const conDatos = (response.data.resultados || []).filter((r) => r.status === 'ok').length
      const sinDatos = (response.data.resultados || []).filter((r) => r.status === 'sin_datos').length
      const conError = (response.data.resultados || []).filter((r) => r.status === 'error').length

      $q.notify({
        type: 'positive',
        icon: 'check_circle',
        message: response.data.message,
        caption: `${conDatos} con datos · ${sinDatos} sin datos · ${conError} errores`,
        position: 'top-right',
        timeout: 7000,
      })

      // Si hay filtros activos, recargar la tabla automáticamente
      if (filtros.value.sede && filtros.value.carrera) {
        await fetchMallas()
      }
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.message || 'Error al sincronizar',
        position: 'top-right',
      })
    }
  } catch (error) {
    console.error('Error sincronizando:', error)
    cerrarDialogoSincronizar()
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al conectar con la API de Planning',
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

  // Cargar estado de última sincronización
  try {
    const res = await api.get('/planning/sync-status', {
      params: { gestion: filtros.value.gestion },
    })
    if (res.data.success && res.data.sincronizado && res.data.ultimo_sync?.finished_at) {
      ultimoSync.value = new Date(res.data.ultimo_sync.finished_at).toLocaleString('es-BO', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    }
  } catch {
    // silencioso — no es crítico
  }
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

/* Ícono giratorio para sincronización en curso */
.rotating {
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Chips del resumen en el diálogo */
.gap-sm {
  gap: 6px;
}
</style>
