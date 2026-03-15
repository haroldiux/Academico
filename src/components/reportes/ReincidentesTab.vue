<template>
  <div class="reincidentes-tab-container q-pa-md" id="reincidentes-print-area">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h5 class="text-h5 text-weight-bold q-my-none text-negative">
          <q-icon name="warning" class="q-mr-xs" />Docentes con Reincidencia Crítica
        </h5>
        <div class="text-subtitle2 text-grey-7" v-if="semanaLabel">
          <span class="text-weight-bold text-negative">SEMANA {{ semanaNum }}</span>
          &nbsp;·&nbsp;{{ semanaLabel }}
          &nbsp;·&nbsp;
          <q-badge color="negative" class="text-subtitle2">2 semanas consecutivas en ROJO</q-badge>
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn color="negative" icon="refresh" flat round @click="cargarDatos">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
        <q-btn
          color="negative"
          icon="picture_as_pdf"
          unelevated
          label="Exportar PDF"
          @click="exportarPDF"
          :loading="exportando"
        />
      </div>
    </div>

    <!-- Sin reincidentes -->
    <div
      v-if="!loading && reincidentes.length === 0"
      class="q-pa-xl text-center bg-green-1 rounded-borders"
      style="border: 1px solid #c8e6c9"
    >
      <q-icon name="task_alt" size="64px" color="positive" class="q-mb-sm" />
      <div class="text-h6 text-positive q-mt-sm">Sin casos críticos detectados</div>
      <div class="text-subtitle2 text-grey-8">
        Ningún docente acumula 2 semanas consecutivas en estado ROJO para la semana seleccionada.
      </div>
    </div>

    <!-- Cards de Reincidentes -->
    <div class="row q-col-gutter-lg q-mt-sm" v-else>
      <div
        class="col-12 col-md-6 col-lg-4"
        v-for="docente in reincidentes"
        :key="docente.docente_id"
      >
        <q-card flat class="reincidente-card hover-effect">
          <div class="card-top-bar">
            <q-icon name="error" color="white" size="18px" class="q-mr-xs" />
            <span class="text-caption text-white text-weight-bold"
              >ROJO · 2 Semanas Consecutivas</span
            >
            <q-space />
            <span class="text-caption text-white opacity-80"
              >Sem. {{ semanaNum }} · {{ semanaLabel }}</span
            >
          </div>

          <q-card-section class="q-pb-xs row items-center no-wrap">
            <q-avatar
              color="negative"
              text-color="white"
              icon="person"
              size="44px"
              class="q-mr-md shadow-3"
            />
            <div class="col">
              <div class="text-subtitle1 text-weight-bold text-dark ellipsis">
                {{ docente.nombre }}
              </div>
              <div class="text-caption text-negative text-weight-medium">Prioridad Crítica</div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="col-grow q-pt-sm">
            <div class="text-caption text-grey-7 text-uppercase text-weight-bold q-mb-xs">
              Asignaturas Afectadas
            </div>
            <div class="q-gutter-xs q-mb-md">
              <q-badge
                color="red-1"
                text-color="red-9"
                outline
                v-for="(materia, i) in docente.materias"
                :key="i"
                >{{ materia }}</q-badge
              >
            </div>

            <div class="text-caption text-grey-7 text-uppercase text-weight-bold q-mb-xs">
              Acción Tomada por el Director
            </div>
            <div
              class="accion-box q-pa-sm rounded-borders text-body2"
              :class="
                docente.accion_director === 'Sin observaciones registradas.'
                  ? 'accion-pending'
                  : 'accion-done'
              "
            >
              <q-icon
                :name="
                  docente.accion_director === 'Sin observaciones registradas.'
                    ? 'pending_actions'
                    : 'check_circle'
                "
                :color="
                  docente.accion_director === 'Sin observaciones registradas.'
                    ? 'orange-8'
                    : 'positive'
                "
                size="16px"
                class="q-mr-xs"
              />
              {{ docente.accion_director }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-inner-loading :showing="loading">
      <q-spinner-dots size="50px" color="negative" />
    </q-inner-loading>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, date } from 'quasar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const props = defineProps({
  carreraId: { type: Number, required: false },
  semana: { type: String, required: true },
})

const $q = useQuasar()
const loading = ref(false)
const exportando = ref(false)
const reincidentes = ref([])
const semanaFin = ref('')
const semanaNum = ref(0)

const semanaLabel = computed(() => {
  if (!props.semana) return ''
  const ini = date.formatDate(new Date(props.semana + 'T12:00:00'), 'DD/MM/YYYY')
  if (semanaFin.value) {
    const fin = date.formatDate(new Date(semanaFin.value + 'T12:00:00'), 'DD/MM/YYYY')
    return `${ini} – ${fin}`
  }
  return ini
})

// ─── PDF EXPORT ─────────────────────────────────────────────────────────────
const exportarPDF = () => {
  if (reincidentes.value.length === 0) {
    $q.notify({ color: 'info', message: 'No hay docentes reincidentes para exportar' })
    return
  }
  exportando.value = true
  try {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const rojo = [183, 28, 28]

    // Encabezado
    doc.setFillColor(...rojo)
    doc.rect(0, 0, 297, 22, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('DOCENTES CON REINCIDENCIA CRÍTICA — 2 SEMANAS CONSECUTIVAS EN ROJO', 14, 10)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`SEMANA ${semanaNum.value}   |   ${semanaLabel.value}`, 14, 18)
    doc.text(`Generado: ${date.formatDate(new Date(), 'DD/MM/YYYY HH:mm')}`, 297 - 14, 18, {
      align: 'right',
    })

    // Tabla de reincidentes
    autoTable(doc, {
      startY: 28,
      head: [['Semana', 'Docente', 'Asignaturas Afectadas', 'Acción / Observación del Director']],
      body: reincidentes.value.map((d) => [
        `SEMANA ${semanaNum.value}\n${semanaLabel.value}`,
        d.nombre,
        (d.materias || []).join('\n'),
        d.accion_director || 'Sin acción registrada aún',
      ]),
      headStyles: { fillColor: rojo, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, valign: 'top' },
      alternateRowStyles: { fillColor: [255, 235, 235] },
      columnStyles: { 0: { cellWidth: 32 }, 1: { cellWidth: 60 }, 2: { cellWidth: 45 } },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.column.index === 0 && data.section === 'body') {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.textColor = rojo
        }
        if (
          data.column.index === 3 &&
          data.section === 'body' &&
          data.row.raw[3] === 'Sin acción registrada aún'
        ) {
          data.cell.styles.textColor = [200, 100, 0]
          data.cell.styles.fontStyle = 'italic'
        }
      },
    })

    // Pie
    const total = doc.internal.getNumberOfPages()
    for (let i = 1; i <= total; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(`Página ${i} de ${total}`, 297 - 14, 205, { align: 'right' })
    }

    doc.save(`reincidentes_semana${semanaNum.value}_${props.semana}.pdf`)
    $q.notify({ color: 'positive', icon: 'check_circle', message: 'PDF generado exitosamente' })
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', icon: 'error', message: 'Error al generar el PDF' })
  } finally {
    exportando.value = false
  }
}
// ────────────────────────────────────────────────────────────────────────────

const cargarDatos = async () => {
  if (!props.carreraId || !props.semana) return
  loading.value = true
  try {
    const { data } = await api.get('/reportes/director/resumen-carrera', {
      params: { carrera_id: props.carreraId, semana_inicio: props.semana },
    })
    reincidentes.value = data.docentes_criticos ?? []
    semanaFin.value = data.semana_fin ?? ''
    semanaNum.value = data.semana_academica ?? 0
  } catch (error) {
    console.error('Error cargando reincidentes:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar docentes reincidentes',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

watch(() => props.semana, cargarDatos)
watch(() => props.carreraId, cargarDatos)
onMounted(cargarDatos)
</script>

<style scoped>
.reincidente-card {
  display: flex;
  flex-direction: column;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  overflow: hidden;
}
.card-top-bar {
  background: linear-gradient(90deg, #b71c1c, #e53935);
  padding: 6px 12px;
  display: flex;
  align-items: center;
}
.hover-effect {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.hover-effect:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(193, 0, 21, 0.2);
}
.accion-box {
  white-space: pre-wrap;
  font-style: italic;
}
.accion-done {
  background: #e8f5e9;
  color: #2e7d32;
}
.accion-pending {
  background: #fff8e1;
  color: #e65100;
}
</style>
