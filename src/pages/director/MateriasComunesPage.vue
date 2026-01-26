<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center q-mb-lg animate-in">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="merge_type" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Materias Comunes</span>
        </h4>
        <div class="text-body2 text-grey-7 q-mt-xs">
          Gestione la vinculación de asignaturas compartidas entre carreras (mismo docente, aula y horario).
        </div>
      </div>
      <div class="col-auto">
        <q-btn label="Hacer Común" color="primary" icon="add_link" @click="abrirDialogoLink" />
      </div>
    </div>

    <!-- Tabla de Materias Comunes Existentes -->
    <q-card flat bordered class="q-mb-lg shadow-1">
      <q-card-section>
        <div class="text-h6 q-mb-md">Mis Asignaturas Vinculadas</div>
        <q-table
          :rows="materiasComunes"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          no-data-label="No tiene materias comunes configuradas"
        >
          <template v-slot:body-cell-vinculadas="props">
            <q-td :props="props">
              <div v-for="vinculo in props.row.vinculadas" :key="vinculo.id" class="q-mb-xs">
                <q-chip size="sm" color="blue-grey-1" text-color="blue-grey-9" icon="school">
                  {{ vinculo.nombre }} ({{ vinculo.carrera_nombre }})
                </q-chip>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props" class="text-center">
              <q-btn flat round dense icon="link_off" color="negative" @click="confirmarDesvincular(props.row)">
                <q-tooltip>Desvincular (Salir del grupo)</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Diálogo para Vincular -->
    <q-dialog v-model="dialogLink" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Hacer Materia Común</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
            <q-stepper v-model="step" vertical color="primary" animated flat>
                <!-- Paso 1: Seleccionar MI materia -->
                <q-step :name="1" title="Seleccione su Asignatura" icon="person" :done="step > 1">
                    <p class="text-caption">Elija la materia de su carrera que será la base.</p>
                    <q-select
                        v-model="form.asignatura_id"
                        :options="misAsignaturasFiltered"
                        label="Mi Asignatura"
                        outlined
                        emit-value
                        map-options
                        option-label="label"
                        option-value="value"
                        use-input
                        @filter="filterMisAsignaturas"
                    />
                    <q-stepper-navigation>
                        <q-btn @click="step = 2" color="primary" label="Siguiente" :disable="!form.asignatura_id" />
                    </q-stepper-navigation>
                </q-step>

                <!-- Paso 2: Seleccionar Carrera Destino -->
                <q-step :name="2" title="Carrera Destino" icon="school" :done="step > 2">
                     <p class="text-caption">Busque la carrera con la que desea compartir la materia.</p>
                     <q-select
                        v-model="form.target_carrera_id"
                        :options="carrerasDestinoOptions"
                        label="Carrera Destino"
                        outlined
                        emit-value
                        map-options
                        @update:model-value="buscarCandidatos"
                     />
                    <q-stepper-navigation>
                        <q-btn @click="step = 3" color="primary" label="Siguiente" :disable="!form.target_carrera_id" />
                        <q-btn flat @click="step = 1" label="Atrás" class="q-ml-sm" />
                    </q-stepper-navigation>
                </q-step>

                <!-- Paso 3: Seleccionar Asignatura Destino -->
                 <q-step :name="3" title="Asignatura a Vincular" icon="link" :done="step > 3">
                     <p class="text-caption">Seleccione la materia específica de la otra carrera.</p>
                     <q-select
                        v-model="form.target_asignatura_id"
                        :options="candidatosOptions"
                        :loading="loadingCandidatos"
                        label="Asignatura Destino"
                        outlined
                        emit-value
                        map-options
                        use-input
                        @filter="filterCandidatos"
                     >
                        <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                                <q-item-section>
                                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                                    <q-item-label caption>{{ scope.opt.codigo }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </template>
                     </q-select>

                    <q-stepper-navigation>
                        <q-btn @click="vincular" color="primary" label="Confirmar Vinculación" :loading="saving" />
                        <q-btn flat @click="step = 2" label="Atrás" class="q-ml-sm" />
                    </q-stepper-navigation>
                </q-step>
            </q-stepper>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useAsignaturasStore } from 'src/stores/asignaturas'

const $q = useQuasar()
const authStore = useAuthStore() // Necesitamos saber mi carrera/sede
const asignaturasStore = useAsignaturasStore()

// Datos
const materiasComunes = ref([])
const loading = ref(false)

// Dialogo
const dialogLink = ref(false)
const step = ref(1)
const saving = ref(false)

// Formulario
const form = ref({
    asignatura_id: null,
    target_carrera_id: null,
    target_asignatura_id: null
})

// Opciones
const misAsignaturasOptions = ref([])
const misAsignaturasFiltered = ref([])
const carrerasDestinoOptions = ref([]) // Se cargan al abrir
const candidatosOptions = ref([])
const loadingCandidatos = ref(false)

// Columnas Tabla
const columns = [
    { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
    { name: 'nombre', label: 'Mi Asignatura', field: 'nombre', align: 'left' },
    { name: 'vinculadas', label: 'Vinculada Con', field: 'vinculadas', align: 'left' },
    { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// --- API Calls ---

const fetchMateriasComunes = async () => {
    loading.value = true
    try {
        const res = await api.get('/materias-comunes')
        materiasComunes.value = res.data
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const fetchMisAsignaturas = async () => {
    // Reutilizar store si es posible, o llamar API simple
    // Usaremos el store que ya filtra por carreraId del director
    // Pero necesitamos asegurar que cargue TODAS
    const director = authStore.usuarioActual?.director
    if (!director) return

    // Truco: Usar el store de asignaturas ya existente
    // Asumimos que ya se cargaron en la vista anterior o forzamos carga
    await asignaturasStore.fetchAsignaturas(director.sede_id, director.carrera_id || director.carrera?.id)
    misAsignaturasOptions.value = asignaturasStore.asignaturas.map(a => ({
        label: `${a.nombre} (${a.codigo})`,
        value: a.id
    }))
    misAsignaturasFiltered.value = misAsignaturasOptions.value
}

const fetchCarrerasDestino = async () => {
    // Cargar carreras de la misma sede (excepto la mìa)
    try {
        // Llamada directa a API de carreras
        // Podriamos usar carrerasStore si existiera filtrado por sede
         await api.get('/carreras') // Retorna todas, filtramos en cliente? Ojalá filtrara backend
         // Filtramos en cliente por ahora si el dataset es pequeño, o usariamos endpoint especifico
         // Lo ideal es tener un endpoint de carreras por sede.
         // Usaremos el endpoint cascading que hicimos antes: /sedes/{id}/carreras
         const director = authStore.usuarioActual?.director
         if(director) {
             const res2 = await api.get(`/sedes/${director.sede_id}/carreras`)
             carrerasDestinoOptions.value = res2.data
                .filter(c => c.id !== director.carrera_id) // Excluir mi carrera
                .map(c => ({ label: c.nombre, value: c.id }))
         }
    } catch(e) { console.error(e) }
}

const buscarCandidatos = async () => {
    form.value.target_asignatura_id = null
    candidatosOptions.value = []
    // Se cargan dinamicamente con filterCandidatos o pre-cargamos aqui?
    // Pre-carguemos las primeras 50
    // Lógica movida a filterCandidatos para búsqueda real
}

const filterMisAsignaturas = (val, update) => {
    if (val === '') {
        update(() => {
            misAsignaturasFiltered.value = misAsignaturasOptions.value
        })
        return
    }

    update(() => {
        const needle = val.toLowerCase()
        misAsignaturasFiltered.value = misAsignaturasOptions.value.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
    })
}

const filterCandidatos = (val, update) => {
    if (val.length < 2) {
        // Cargar default si vacio
        cargarCandidatosAPI('')
        update()
        return
    }
    update(() => {
        cargarCandidatosAPI(val)
    })
}

const cargarCandidatosAPI = async (search) => {
    loadingCandidatos.value = true
    try {
        const res = await api.get('/materias-comunes/candidates', {
            params: {
                carrera_id: form.value.target_carrera_id,
                search: search
            }
        })
        candidatosOptions.value = res.data.map(a => ({
             label: a.nombre,
             value: a.id,
             codigo: a.codigo
        }))
    } catch(e) { console.error(e) }
    finally { loadingCandidatos.value = false }
}

const vincular = async () => {
    saving.value = true
    try {
        await api.post('/materias-comunes/link', {
            asignatura_id: form.value.asignatura_id,
            target_asignatura_id: form.value.target_asignatura_id
        })
        $q.notify({ type: 'positive', message: 'Materia vinculada correctamente' })
        dialogLink.value = false
        fetchMateriasComunes()
    } catch(e) {
        $q.notify({ type: 'negative', message: 'Error al vincular materias' })
        console.error(e)
    } finally {
        saving.value = false
    }
}

const confirmarDesvincular = (row) => {
    $q.dialog({
        title: 'Desvincular Materia',
        message: '¿Está seguro de que desea desvincular esta materia del grupo común? Volverá a ser independiente.',
        cancel: true,
        persistent: true
    }).onOk(async () => {
        try {
            await api.post(`/materias-comunes/unlink/${row.id}`)
            $q.notify({ type: 'positive', message: 'Desvinculada correctamente' })
            fetchMateriasComunes()
        } catch {
            $q.notify({ type: 'negative', message: 'Error al desvincular' })
        }
    })
}

const abrirDialogoLink = async () => {
    step.value = 1
    form.value = { asignatura_id: null, target_carrera_id: null, target_asignatura_id: null }
    dialogLink.value = true
    await fetchMisAsignaturas()
    await fetchCarrerasDestino()
}

onMounted(() => {
    fetchMateriasComunes()
})

</script>

<style scoped>
.text-gradient {
  background: linear-gradient(45deg, var(--q-primary), var(--q-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
