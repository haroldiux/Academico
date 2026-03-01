<template>
  <q-page padding>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12">
        <div class="text-h5 text-primary q-mb-sm">Comparador de Backups de Base de Datos</div>
        <div class="text-subtitle2 text-grey-7">Busque una asignatura por código y compárela con una base de datos histórica.</div>
      </div>
    </div>

    <!-- Filtros y Búsqueda -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-3">
          <q-input v-model="codigoBusqueda" label="Sigla Asignatura (Ej: ADM-100)" outlined dense @keyup.enter="buscarYComparar" />
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="backupSeleccionado"
            :options="backupsDisponibles"
            label="Base de Backup"
            outlined
            dense
            emit-value
            map-options
            :loading="loadingBackups"
          />
        </div>
        <div class="col-12 col-md-3" v-if="resultado?.docentes?.length > 0">
          <q-select
            v-model="docenteSeleccionado"
            :options="resultado.docentes"
            option-label="name"
            option-value="id"
            label="Docente (Plan. Personal)"
            outlined
            dense
            clearable
            emit-value
            map-options
            @update:model-value="buscarYComparar"
          >
            <template v-slot:no-option>
              <q-item><q-item-section class="text-grey">No hay docentes con plan. personal</q-item-section></q-item>
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-3">
          <q-btn color="primary" label="Buscar y Comparar" :loading="loadingComparacion" @click="buscarYComparar" class="full-width" icon="search" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Resultados -->
    <div v-if="resultado" class="row q-col-gutter-md">
      <!-- ... (contenido de resultados) ... -->
      <div class="col-12 q-mb-md">
        <q-banner dense class="bg-blue-1 text-blue-9 rounded-borders">
          <template v-slot:avatar>
            <q-icon name="info" color="blue" />
          </template>
          Comparando <strong>{{ resultado.codigo }}</strong>:
          Base Actual (<strong>{{ resultado.current_db }}</strong>) vs 
          Histórica (<strong>{{ resultado.backup_db }}</strong>)
          <span v-if="resultado.docente_name"> (Planificación Personal de <strong>{{ resultado.docente_name }}</strong>)</span>
        </q-banner>
      </div>

      <div class="col-12">
        <div class="text-subtitle1 text-weight-bold q-mb-sm">Datos Generales de la Asignatura</div>
        <q-table :rows="resultado.comparison" :columns="columns" row-key="field" flat bordered :pagination="{ rowsPerPage: 0 }" hide-bottom class="q-mb-xl">
          <template v-slot:body="props">
            <q-tr :props="props" :class="props.row.different ? 'bg-orange-1' : ''">
              <q-td key="field" :props="props" class="text-weight-bold text-uppercase">{{ props.row.field.replace(/_/g, ' ') }}</q-td>
              <q-td key="current" :props="props" class="vertical-top white-space-pre">
                <div v-if="props.row.current" class="q-pa-xs scroll" style="max-height: 200px; max-width: 400px; font-size: 0.9em;">{{ props.row.current }}</div>
                <div v-else class="text-grey-5 italic">Vacío</div>
              </q-td>
              <q-td key="backup" :props="props" class="vertical-top white-space-pre">
                <div v-if="props.row.backup" class="q-pa-xs scroll" style="max-height: 200px; max-width: 400px; font-size: 0.9em;">{{ props.row.backup }}</div>
                <div v-else class="text-grey-5 italic">Vacío</div>
              </q-td>
              <q-td key="status" :props="props">
                <q-icon v-if="props.row.different" name="warning" color="orange" size="sm"><q-tooltip>Diferente</q-tooltip></q-icon>
                <q-icon v-else name="check_circle" color="positive" size="sm" />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>

      <div class="col-12" v-if="resultado.unidades?.length > 0">
        <div class="text-subtitle1 text-weight-bold q-mb-md">Estructura Detallada (Unidades y Temas)</div>
        <div v-for="(unidad, uIdx) in resultado.unidades" :key="uIdx" class="q-mb-lg">
          <q-card flat bordered>
            <q-item :class="!unidad.found_current ? 'bg-red-1 text-red-9' : 'bg-grey-2'">
              <q-item-section avatar><q-icon :name="unidad.found_current ? 'folder' : 'folder_off'" /></q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Unidad: {{ unidad.titulo }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-list separator>
              <q-item v-for="(tema, tIdx) in unidad.temas" :key="tIdx" :class="tema.different ? 'bg-orange-1' : ''">
                <q-item-section avatar><q-icon :name="tema.found_current ? 'description' : 'error_outline'" :color="tema.different ? 'orange' : 'grey'" /></q-item-section>
                <q-item-section>
                  <q-item-label>{{ tema.titulo }}</q-item-label>
                  <q-item-label caption v-if="!tema.found_current" class="text-negative text-weight-bold">TEMA PERDIDO</q-item-label>
                </q-item-section>
                <q-item-section side>
                   <q-btn flat round icon="visibility" :color="tema.different ? 'orange' : 'grey'" @click="verDiferenciaTema(tema)" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Estado Inicial or No Encontrado -->
    <div v-else-if="!loadingComparacion" class="flex flex-center q-pa-xl">
       <div class="text-center text-grey-6">
          <q-icon name="database" size="100px" class="q-mb-md" />
          <div class="text-h6">Ingrese una sigla y seleccione un backup</div>
          <p>Podrá ver las diferencias campo por campo de la tabla de asignaturas.</p>
       </div>
    </div>

    <!-- Diálogo para ver contenido de backup de un tema -->
    <q-dialog v-model="showDiffDialog">
      <q-card style="min-width: 800px; max-width: 1000px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Comparación de Tema: {{ selectedTema?.titulo }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md" style="max-height: 80vh; overflow-y: auto;">
          <div v-if="(selectedTema?.differences && Object.keys(selectedTema.differences).length > 0) || (selectedTema?.logros && selectedTema.logros.length > 0) || selectedTema?.planificacion_personal">
            
            <!-- Sección de Campos de Contenido -->
            <div v-if="selectedTema?.differences && Object.keys(selectedTema.differences).length > 0">
            <div v-for="(diff, field) in selectedTema.differences" :key="field" class="q-mb-xl">
              <div class="text-subtitle1 text-weight-bold text-uppercase text-primary q-mb-sm border-bottom">
                Campo: {{ formatFieldName(field) }}
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <div class="text-weight-bold text-blue q-mb-xs">Valor Actual:</div>
                  <div class="q-pa-sm bg-grey-1 rounded-borders scroll" style="max-height: 300px; white-space: pre-wrap; border: 1px solid #ddd;">
                    {{ diff.current || '(Vacío en base actual)' }}
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-weight-bold text-orange q-mb-xs">Valor en Backup:</div>
                  <div class="q-pa-sm bg-orange-1 rounded-borders scroll" style="max-height: 300px; white-space: pre-wrap; border: 1px solid #ffcc80;">
                    {{ diff.backup || '(Vacío en backup)' }}
                  </div>
                </div>
              </div> <!-- end current/backup row -->
            </div> <!-- end div-if differences -->
          </div>
          
          <!-- Sección de Logros e Indicadores -->
            <div v-if="selectedTema?.logros && selectedTema.logros.length > 0" class="q-mt-xl">
              <q-separator class="q-mb-lg" />
              <div class="text-h6 text-grey-8 q-mb-md flex items-center">
                <q-icon name="emoji_events" color="orange" class="q-mr-sm" />
                Logros Esperados e Indicadores (Backup)
              </div>
              <div class="q-pl-md">
                <div v-for="(logro, lIdx) in selectedTema.logros" :key="lIdx" class="q-mb-lg">
                  <div class="text-subtitle1 flex items-center" :class="logro.found_current ? 'text-black' : 'text-negative text-strike'">
                    <q-icon :name="logro.found_current ? 'check_circle' : 'cancel'" :color="logro.found_current ? 'positive' : 'negative'" class="q-mr-sm" />
                    {{ logro.descripcion }}
                    <q-badge v-if="!logro.found_current" color="negative" label="ELIMINADO / NO CONCUERDA" class="q-ml-sm" />
                  </div>
                  
                  <!-- Indicadores del Logro -->
                  <div v-if="logro.indicadores && logro.indicadores.length > 0" class="q-pl-xl q-mt-sm">
                    <div class="text-caption text-grey-7 q-mb-xs">Indicadores asociados:</div>
                    <div v-for="(ind, iIdx) in logro.indicadores" :key="iIdx" class="flex items-center q-mb-xs">
                      <q-icon name="radio_button_unchecked" size="xs" :color="ind.found_current ? 'blue' : 'negative'" class="q-mr-sm" />
                      <span :class="ind.found_current ? '' : 'text-negative text-strike'">{{ ind.descripcion }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sección de Planificación Personal -->
            <div v-if="selectedTema?.planificacion_personal" class="q-mt-xl">
              <q-separator class="q-mb-lg" />
              <div class="text-h6 text-grey-8 q-mb-md flex items-center">
                <q-icon name="person" color="blue" class="q-mr-sm" />
                Planificación Personal (Docente)
              </div>

              <!-- Diferencias en campos de texto (Estrategias, Evaluación) -->
              <div v-if="Object.keys(selectedTema.planificacion_personal.differences || {}).length > 0" class="q-mb-lg">
                <div v-for="(diff, field) in selectedTema.planificacion_personal.differences" :key="field" class="q-mb-md">
                   <div v-if="field !== 'secuencia_didactica'" class="q-mb-sm">
                      <div class="text-subtitle2 text-primary text-uppercase">{{ formatFieldName(field) }}</div>
                      <div class="row q-col-gutter-sm">
                        <div class="col-6">
                          <div class="text-caption text-grey-6 italic">Valor Actual</div>
                          <div class="q-pa-xs bg-grey-1 rounded-borders" style="font-size: 0.85em; min-height: 40px; border:1px solid #ddd;">
                            <div v-if="field.includes('recursos') || field.includes('evaluacion')">
                              <div v-for="(item, idx) in parseJSONList(diff.current)" :key="idx" class="flex items-center q-mb-xs">
                                <q-icon name="circle" size="6px" class="q-mr-xs" color="grey-7" />
                                {{ item }}
                              </div>
                            </div>
                            <div v-else>{{ diff.current || '(Vacío)' }}</div>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="text-caption text-orange-6 italic">Valor en Backup</div>
                          <div class="q-pa-xs bg-orange-1 rounded-borders" style="font-size: 0.85em; min-height: 40px; border:1px solid #ffcc80;">
                            <div v-if="field.includes('recursos') || field.includes('evaluacion')">
                              <div v-for="(item, idx) in parseJSONList(diff.backup)" :key="idx" class="flex items-center q-mb-xs">
                                <q-icon name="circle" size="6px" class="q-mr-xs" color="orange-7" />
                                {{ item }}
                              </div>
                            </div>
                            <div v-else>{{ diff.backup || '(Vacío)' }}</div>
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              <div class="text-subtitle1 text-weight-bold q-mb-sm text-blue-8">Comparación de Secuencia Didáctica</div>
              <div class="q-pl-md" v-if="selectedTema.planificacion_personal.backup_data?.secuencia || selectedTema.planificacion_personal.current_data?.secuencia">
                <!-- Mostramos todos los momentos (los del backup y los que son nuevos en el actual) -->
                <div v-for="(momento, mIdx) in getAllMoments(selectedTema.planificacion_personal.backup_data?.secuencia, selectedTema.planificacion_personal.current_data?.secuencia)" :key="mIdx" class="q-mb-md q-pa-sm border-left-blue">
                   <div class="text-weight-bold text-blue-9 text-uppercase">
                     {{ momento.momento }}
                     <q-badge v-if="momento.isNew" color="positive" label="NUEVO" class="q-ml-sm" />
                     <q-badge v-if="momento.isDeleted" color="negative" label="ELIMINADO" class="q-ml-sm" />
                   </div>
                   <div class="row q-col-gutter-sm">
                      <div class="col-6">
                        <div class="text-caption text-grey-7">Descripción Actual:</div>
                        <div class="q-pa-xs bg-grey-1 rounded-borders" style="font-size: 0.9em; min-height: 40px;">
                          {{ findDescriptionByMoment(momento.momento, selectedTema.planificacion_personal.current_data?.secuencia) || '(No existe este momento)' }}
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="text-caption text-orange-7">Descripción Backup:</div>
                        <div class="q-pa-xs bg-orange-1 rounded-borders" style="font-size: 0.9em; min-height: 40px;">
                          {{ findDescriptionByMoment(momento.momento, selectedTema.planificacion_personal.backup_data?.secuencia) || '(No existe en backup)' }}
                        </div>
                      </div>
                   </div>
                </div>
              </div>
              <div v-else class="text-grey italic q-pa-md">No hay secuencia didáctica definida.</div>
            </div>
          </div>
          <div v-else class="text-center q-pa-lg text-grey">
            No se encontraron diferencias en este tema ni en su planificación.
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const codigoBusqueda = ref('')
const backupSeleccionado = ref(null)
const docenteSeleccionado = ref(null)
const backupsDisponibles = ref([])
const loadingBackups = ref(false)
const loadingComparacion = ref(false)
const resultado = ref(null)

// Control de Diálogo de Temas
const showDiffDialog = ref(false)
const selectedTema = ref(null)

const columns = [
  { name: 'field', label: 'Campo', field: 'field', align: 'left' },
  { name: 'current', label: 'Base Actual', field: 'current', align: 'left' },
  { name: 'backup', label: 'Base de Backup (Anterior)', field: 'backup', align: 'left' },
  { name: 'status', label: '', field: 'different', align: 'center' }
]

onMounted(() => {
  cargarBackups()
})

async function cargarBackups() {
  loadingBackups.value = true
  try {
    const response = await api.get('/backups/list')
    backupsDisponibles.value = response.data.backups
    if (backupsDisponibles.value.length > 0) {
      // Seleccionar el primero por defecto si hay alguno
      backupSeleccionado.value = backupsDisponibles.value[0]
    }
  } catch (error) {
    console.error('Error cargando backups:', error)
    $q.notify({ color: 'negative', message: 'Error al obtener lista de backups', icon: 'error' })
  } finally {
    loadingBackups.value = false
  }
}

async function buscarYComparar() {
  if (!codigoBusqueda.value || !backupSeleccionado.value) {
    $q.notify({ color: 'warning', message: 'Ingrese sigla y seleccione backup', icon: 'warning' })
    return
  }

  loadingComparacion.value = true
  resultado.value = null
  
  try {
    const response = await api.post('/backups/compare', {
      codigo: codigoBusqueda.value,
      backup_db: backupSeleccionado.value,
      user_id: docenteSeleccionado.value
    })
    resultado.value = response.data
    
    $q.notify({
      color: 'positive',
      message: 'Comparación completada',
      icon: 'check',
      timeout: 1000
    })
  } catch (error) {
    console.error('Error en comparación:', error)
    const errorMsg = error.response?.data?.error || 'Error al procesar la comparación'
    $q.notify({ color: 'negative', message: errorMsg, icon: 'error' })
  } finally {
    loadingComparacion.value = false
  }
}

function verDiferenciaTema(tema) {
  selectedTema.value = tema
  showDiffDialog.value = true
}

function findDescriptionByMoment(momentTitle, secuencia) {
  if (!secuencia || !Array.isArray(secuencia)) return null
  const moment = secuencia.find(m => normalizeStr(m.momento) === normalizeStr(momentTitle))
  // Se usa 'actividad' según TemaEditPage.vue, pero dejamos fallback a 'descripcion'
  return moment ? (moment.actividad || moment.descripcion) : null
}

function normalizeStr(str) {
  if (!str) return ''
  return str.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim()
}

function getAllMoments(backupSec, currentSec) {
  const names = new Set()
  if (Array.isArray(backupSec)) backupSec.forEach(m => names.add(m.momento))
  if (Array.isArray(currentSec)) currentSec.forEach(m => names.add(m.momento))
  
  return Array.from(names).map(name => {
    const inBackup = backupSec?.some(m => normalizeStr(m.momento) === normalizeStr(name))
    const inCurrent = currentSec?.some(m => normalizeStr(m.momento) === normalizeStr(name))
    return {
      momento: name,
      isNew: inCurrent && !inBackup,
      isDeleted: inBackup && !inCurrent
    }
  })
}

function parseJSONList(val) {
  if (!val) return []
  try {
    const parsed = JSON.parse(val)
    return Array.isArray(parsed) ? parsed : [val]
  } catch (e) {
    return [val]
  }
}

function formatFieldName(field) {
  const map = {
    'contenido_conceptual': 'Contenido Conceptual',
    'contenido_procedimental': 'Contenido Procedimental',
    'contenido_actitudinal': 'Contenido Actitudinal',
    'resultado_aprendizaje': 'Resultado de Aprendizaje',
    'estrategias_metodologicas': 'Estrategias Metodológicas',
    'estrategias_aprendizaje': 'Estrategias de Aprendizaje',
    'estrategias_recursos': 'Recursos Didácticos',
    'evaluacion_formativa': 'Evaluación Formativa',
    'evaluacion_sumativa': 'Evaluación Sumativa'
  }
  return map[field] || field.replace(/_/g, ' ').toUpperCase()
}
</script>

<style scoped>
.white-space-pre {
  white-space: pre-wrap;
}
.vertical-top {
  vertical-align: top !important;
}
.border-left-blue {
  border-left: 4px solid #2196F3;
}
</style>
