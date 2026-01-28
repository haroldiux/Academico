<template>
  <q-table :rows="rows" :columns="columns" row-key="id" flat bordered :loading="loading"
    :pagination="{ rowsPerPage: 10 }">
    <template v-slot:top-right>
      <q-btn color="primary" icon="add" label="Nuevo Reporte" @click="$emit('create')" />
    </template>

    <template v-slot:body-cell-alerta="props">
      <q-td :props="props">
        <q-chip :color="getColorAlerta(props.row.alerta)" text-color="white" size="sm">
          {{ props.row.alerta }}
        </q-chip>
      </q-td>
    </template>

    <template v-slot:body-cell-criterios="props">
      <q-td :props="props">
        <div class="row q-gutter-xs">
          <!-- Show small indicators for criteria -->
          <q-icon v-for="(val, key) in props.row.criterios" :key="key" :name="val ? 'check' : 'close'"
            :color="val ? 'positive' : 'negative'" size="xs">
            <q-tooltip>{{ formatCriterioName(key) }}: {{ val ? 'Cumple' : 'No cumple' }}</q-tooltip>
          </q-icon>
        </div>
      </q-td>
    </template>

    <template v-slot:body-cell-semana="props">
      <q-td :props="props">
        {{ formatDate(props.row.semana_inicio) }}
      </q-td>
    </template>
    <template v-slot:body-cell-acciones="props">
      <q-td :props="props">
        <q-btn flat round dense icon="rate_review" color="primary" @click="$emit('edit', props.row)">
          <q-tooltip>Revisar y añadir observaciones</q-tooltip>
        </q-btn>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { computed } from 'vue'
import { date } from 'quasar'

const props = defineProps({
  rows: {
    type: Array,
    default: () => []
  },
  loading: Boolean
})

const emit = defineEmits(['create'])

const columns = [
  { name: 'asignatura', label: 'Asignatura', field: row => row.asignatura?.nombre || 'N/A', align: 'left', sortable: true },
  { name: 'carrera', label: 'Carrera', field: row => row.carrera?.nombre || 'N/A', align: 'left', sortable: true },
  { name: 'docente', label: 'Docente', field: row => row.docente?.nombre || row.docente?.username || 'N/A', align: 'left', sortable: true },
  { name: 'semana', label: 'Semana', field: 'semana_inicio', align: 'left', sortable: true },
  { name: 'criterios', label: 'Criterios', field: 'criterios', align: 'center' },
  { name: 'alerta', label: 'Alerta', field: 'alerta', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const getColorAlerta = (alerta) => {
  if (alerta === 'VERDE') return 'positive'
  if (alerta === 'AMARILLO') return 'warning'
  return 'negative'
}

const formatDate = (fecha) => {
  return date.formatDate(fecha, 'DD/MM/YYYY')
}

const formatCriterioName = (key) => {
  // Map keys to readable names if needed, or just capitalize
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}
</script>
