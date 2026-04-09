<template>
  <div>
    <div v-if="materias.length === 0" class="text-center text-grey q-py-md">
      No hay materias en esta categoría
    </div>
    
    <q-table
      v-else
      :rows="materias"
      :columns="columnas"
      row-key="id"
      flat
      dense
      :pagination="{ rowsPerPage: 0 }"
    >
      <template v-slot:body-cell-progreso="props">
        <q-td :props="props">
          <q-linear-progress
            :value="props.row.progreso / 100"
            :color="getColorProgreso(props.row.progreso)"
            class="q-mt-xs"
          />
          <span class="text-caption">{{ props.row.progreso }}%</span>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn
            flat
            dense
            round
            icon="visibility"
            size="sm"
            @click="verDetalle(props.row)"
          >
            <q-tooltip>Ver detalle de documentación</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo de detalle -->
    <q-dialog v-model="mostrarDetalle" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ materiaSeleccionada?.nombre }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="materiaSeleccionada">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="text-caption text-grey">Código</div>
              <div>{{ materiaSeleccionada.codigo }}</div>
            </div>
            <div class="col-12">
              <div class="text-caption text-grey">Docentes</div>
              <div>{{ materiaSeleccionada.docentes || 'Sin docente asignado' }}</div>
            </div>
            <div class="col-12">
              <div class="text-caption text-grey">Progreso General</div>
              <div class="row items-center q-gutter-sm">
                <q-linear-progress
                  :value="materiaSeleccionada.progreso / 100"
                  :color="getColorProgreso(materiaSeleccionada.progreso)"
                  class="col"
                />
                <span class="text-weight-bold">{{ materiaSeleccionada.progreso }}%</span>
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 q-mb-sm">Indicadores de Documentación</div>
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <div class="text-caption text-grey">Programa Asignatura</div>
              <div :class="getColorIndicador(materiaSeleccionada.indicadores?.programa_asignatura?.porcentaje)">
                {{ materiaSeleccionada.indicadores?.programa_asignatura?.porcentaje ?? 0 }}%
              </div>
            </div>
            <div class="col-4">
              <div class="text-caption text-grey">Programa Analítico</div>
              <div :class="getColorIndicador(materiaSeleccionada.indicadores?.programa_analitico?.porcentaje)">
                {{ materiaSeleccionada.indicadores?.programa_analitico?.porcentaje ?? 0 }}%
              </div>
            </div>
            <div class="col-4">
              <div class="text-caption text-grey">Plan de Clase</div>
              <div :class="getColorIndicador(materiaSeleccionada.indicadores?.plan_clase?.porcentaje)">
                {{ materiaSeleccionada.indicadores?.plan_clase?.porcentaje ?? 0 }}%
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  materias: {
    type: Array,
    default: () => []
  },
  tipo: {
    type: String,
    default: 'completas'
  }
})

const mostrarDetalle = ref(false)
const materiaSeleccionada = ref(null)

const columnas = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', style: 'width: 100px' },
  { name: 'nombre', label: 'Materia', field: 'nombre', align: 'left' },
  { name: 'docentes', label: 'Docentes', field: 'docentes', align: 'left' },
  { name: 'progreso', label: 'Progreso', field: 'progreso', align: 'center', style: 'width: 120px' },
  { name: 'acciones', label: '', field: 'acciones', align: 'center', style: 'width: 50px' }
]

function getColorProgreso(progreso) {
  if (progreso >= 100) return 'positive'
  if (progreso >= 50) return 'blue'
  return 'warning'
}

function getColorIndicador(porcentaje) {
  if (porcentaje >= 100) return 'text-positive'
  if (porcentaje >= 50) return 'text-blue'
  return 'text-warning'
}

function verDetalle(materia) {
  materiaSeleccionada.value = materia
  mostrarDetalle.value = true
}
</script>