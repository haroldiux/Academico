<template>
    <q-page padding class="bg-grey-1">
        <!-- Header -->
        <div class="row items-center q-mb-md">
            <div class="col">
                <div class="text-h5 text-weight-bold text-primary">
                    <q-icon name="merge_type" size="sm" class="q-mr-xs" />
                    Materias Comunes
                </div>
                <div class="text-caption text-grey-7">
                    Vincule asignaturas de diferentes carreras para compartir planificación
                </div>
            </div>
            <q-btn 
                label="Vincular Materias" 
                color="primary" 
                icon="add_link" 
                @click="abrirDialogoLink"
                unelevated
                class="q-px-md"
            />
        </div>

        <!-- Tabla de Grupos Comunes -->
        <q-card flat bordered>
            <q-table
                :rows="materiasComunes"
                :columns="columns"
                row-key="comun_token"
                flat
                :loading="loading"
                :rows-per-page-options="[10, 20, 50]"
                no-data-label="No tiene materias comunes configuradas"
                class="materias-table"
            >
                <template v-slot:body-cell-base="props">
                    <q-td :props="props">
                        <div class="text-weight-medium">{{ props.row.base?.nombre }}</div>
                        <div class="text-caption text-grey-6">
                            {{ props.row.base?.codigo }} · {{ props.row.base?.carrera_nombre }}
                        </div>
                    </q-td>
                </template>

                <template v-slot:body-cell-tipo="props">
                    <q-td :props="props">
                        <q-chip 
                            :color="props.row.comun_tipo === 'fusionada' ? 'primary' : 'orange'" 
                            text-color="white"
                            size="sm"
                            dense
                        >
                            {{ props.row.comun_tipo === 'fusionada' ? 'Fusionada' : 'Espejo' }}
                        </q-chip>
                    </q-td>
                </template>

                <template v-slot:body-cell-vinculadas="props">
                    <q-td :props="props" style="max-width: 400px;">
                        <div class="row q-gutter-xs" style="flex-wrap: wrap;">
                            <q-chip 
                                v-for="v in props.row.vinculadas?.slice(0, 3)" 
                                :key="v.id"
                                size="sm" 
                                color="grey-3" 
                                text-color="grey-9"
                                dense
                            >
                                {{ v.nombre }} ({{ v.carrera_nombre?.split(',')[0] }})
                            </q-chip>
                            <q-chip 
                                v-if="props.row.vinculadas?.length > 3" 
                                size="sm" 
                                color="blue-grey-2"
                                text-color="blue-grey-8"
                                dense
                                clickable
                                @click="verDetalleGrupo(props.row)"
                            >
                                +{{ props.row.vinculadas.length - 3 }} más
                            </q-chip>
                        </div>
                    </q-td>
                </template>

                <template v-slot:body-cell-acciones="props">
                    <q-td :props="props">
                        <q-btn flat round dense size="sm" icon="visibility" color="primary" @click="verDetalleGrupo(props.row)">
                            <q-tooltip>Ver detalle</q-tooltip>
                        </q-btn>
                        <q-btn flat round dense size="sm" icon="link_off" color="negative" @click="confirmarDesvincular(props.row)">
                            <q-tooltip>Desvincular grupo</q-tooltip>
                        </q-btn>
                    </q-td>
                </template>
            </q-table>
        </q-card>

        <!-- Diálogo para Vincular (Más compacto) -->
        <q-dialog v-model="dialogLink" persistent :maximized="$q.screen.lt.md">
            <q-card :style="$q.screen.gt.sm ? 'width: 900px; max-width: 95vw;' : ''">
                <q-card-section class="row items-center q-py-sm bg-primary text-white">
                    <q-icon name="add_link" size="sm" class="q-mr-sm" />
                    <div class="text-subtitle1">Vincular Materias Comunes</div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup size="sm" />
                </q-card-section>

                <q-card-section class="q-pa-md">
                    <div class="row q-col-gutter-md">
                        <!-- Columna Izquierda: Mi Materia + Tipo -->
                        <div class="col-12 col-md-5">
                            <div class="text-subtitle2 text-grey-8 q-mb-sm">
                                <q-icon name="star" color="amber" size="xs" /> Mi Materia Base
                            </div>
                            <q-select
                                v-model="materiaBase"
                                :options="misAsignaturasFiltered"
                                label="Buscar mi asignatura..."
                                outlined
                                dense
                                option-label="nombre"
                                option-value="id"
                                use-input
                                @filter="filterMisAsignaturas"
                                :loading="loadingMisAsignaturas"
                                popup-content-class="my-popup"
                            >
                                <template v-slot:option="scope">
                                    <q-item v-bind="scope.itemProps" dense>
                                        <q-item-section>
                                            <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                                            <q-item-label caption>{{ scope.opt.codigo }} · {{ scope.opt.carrera_nombre }}</q-item-label>
                                        </q-item-section>
                                    </q-item>
                                </template>
                                <template v-slot:selected-item="scope">
                                    <div v-if="scope.opt" class="ellipsis">
                                        {{ scope.opt.nombre }} <span class="text-grey-6">({{ scope.opt.codigo }})</span>
                                    </div>
                                </template>
                            </q-select>

                            <div class="text-subtitle2 text-grey-8 q-mt-md q-mb-sm" v-if="materiaBase">
                                <q-icon name="tune" size="xs" /> Tipo de Vinculación
                            </div>
                            <q-btn-toggle
                                v-if="materiaBase"
                                v-model="tipoVinculacion"
                                spread
                                no-caps
                                rounded
                                unelevated
                                toggle-color="primary"
                                color="grey-3"
                                text-color="grey-8"
                                :options="[
                                    {label: 'Fusionada', value: 'fusionada'},
                                    {label: 'Espejo', value: 'espejo'}
                                ]"
                                class="q-mb-sm"
                            />
                            <div v-if="materiaBase" class="text-caption text-grey-6">
                                {{ tipoVinculacion === 'fusionada' ? 'Lista unificada, mismo horario' : 'Listas separadas, comparten planificación' }}
                            </div>
                        </div>

                        <!-- Columna Derecha: Materias a Vincular -->
                        <div class="col-12 col-md-7" v-if="materiaBase">
                            <div class="row items-center q-mb-sm">
                                <div class="text-subtitle2 text-grey-8">
                                    <q-icon name="playlist_add" size="xs" /> Materias a Vincular
                                </div>
                                <q-space />
                                <q-badge v-if="materiasSeleccionadas.length" color="teal">
                                    {{ materiasSeleccionadas.length }} seleccionadas
                                </q-badge>
                            </div>
                            
                            <q-input
                                v-model="busquedaCandidatos"
                                outlined
                                dense
                                placeholder="Buscar materias..."
                                @update:model-value="buscarCandidatos"
                                class="q-mb-sm"
                            >
                                <template v-slot:prepend>
                                    <q-icon name="search" size="xs" />
                                </template>
                            </q-input>

                            <div class="candidatos-list" style="max-height: 250px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 4px;">
                                <q-list dense separator v-if="candidatos.length">
                                    <q-item
                                        v-for="c in candidatos"
                                        :key="c.id"
                                        tag="label"
                                        clickable
                                        :class="{'bg-teal-1': isSelected(c.id)}"
                                    >
                                        <q-item-section side>
                                            <q-checkbox
                                                :model-value="isSelected(c.id)"
                                                @update:model-value="toggleSeleccion(c)"
                                                color="teal"
                                                size="sm"
                                            />
                                        </q-item-section>
                                        <q-item-section>
                                            <q-item-label>{{ c.nombre }}</q-item-label>
                                            <q-item-label caption>{{ c.codigo }} · {{ c.carrera_nombre }}</q-item-label>
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                                <div v-else-if="loadingCandidatos" class="text-center q-pa-md">
                                    <q-spinner color="teal" size="sm" />
                                </div>
                                <div v-else class="text-center text-grey-5 q-pa-md text-caption">
                                    Escriba para buscar materias
                                </div>
                            </div>
                        </div>
                    </div>
                </q-card-section>

                <q-separator v-if="materiaBase && materiasSeleccionadas.length" />
                
                <q-card-actions align="right" class="q-pa-md" v-if="materiaBase && materiasSeleccionadas.length">
                    <div class="text-caption text-grey-7 q-mr-auto">
                        Vincular <strong>{{ materiaBase.nombre }}</strong> con {{ materiasSeleccionadas.length }} materia(s)
                    </div>
                    <q-btn flat label="Cancelar" v-close-popup />
                    <q-btn 
                        unelevated
                        color="primary" 
                        label="Confirmar"
                        icon="check"
                        @click="vincularMultiple"
                        :loading="saving"
                    />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- Diálogo de Detalle del Grupo -->
        <q-dialog v-model="dialogDetalle">
            <q-card style="min-width: 350px; max-width: 500px;">
                <q-card-section class="row items-center q-py-sm bg-blue-grey-1">
                    <div class="text-subtitle1 text-weight-medium">Detalle del Grupo</div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup size="sm" />
                </q-card-section>
                <q-card-section v-if="grupoDetalle">
                    <div class="text-weight-medium q-mb-xs">{{ grupoDetalle.base?.nombre }}</div>
                    <div class="text-caption text-grey-6 q-mb-md">
                        {{ grupoDetalle.base?.codigo }} · {{ grupoDetalle.base?.carrera_nombre }}
                    </div>
                    <q-separator class="q-mb-sm" />
                    <div class="text-caption text-grey-7 q-mb-xs">Vinculadas ({{ grupoDetalle.vinculadas?.length }}):</div>
                    <q-list dense>
                        <q-item v-for="v in grupoDetalle.vinculadas" :key="v.id" dense>
                            <q-item-section avatar>
                                <q-icon name="subdirectory_arrow_right" size="xs" color="grey" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ v.nombre }}</q-item-label>
                                <q-item-label caption>{{ v.codigo }} · {{ v.carrera_nombre }}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card-section>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Datos de tabla
const materiasComunes = ref([])
const loading = ref(false)

// Diálogo vincular
const dialogLink = ref(false)
const saving = ref(false)

// Diálogo detalle
const dialogDetalle = ref(false)
const grupoDetalle = ref(null)

// Step 1: Mi materia base
const misAsignaturas = ref([])
const misAsignaturasFiltered = ref([])
const materiaBase = ref(null)
const loadingMisAsignaturas = ref(false)

// Step 2: Tipo
const tipoVinculacion = ref('fusionada')

// Step 3: Candidatos multi-select
const busquedaCandidatos = ref('')
const candidatos = ref([])
const loadingCandidatos = ref(false)
const materiasSeleccionadas = ref([])

// Columnas de tabla
const columns = [
    { name: 'base', label: 'Materia Base', field: 'base', align: 'left', style: 'width: 250px' },
    { name: 'tipo', label: 'Tipo', field: 'comun_tipo', align: 'center', style: 'width: 100px' },
    { name: 'vinculadas', label: 'Vinculadas', field: 'vinculadas', align: 'left' },
    { name: 'acciones', label: '', field: 'acciones', align: 'right', style: 'width: 100px' }
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
    loadingMisAsignaturas.value = true
    try {
        const res = await api.get('/materias-comunes/mis-asignaturas')
        misAsignaturas.value = res.data
        misAsignaturasFiltered.value = res.data
    } catch (e) {
        console.error('Error cargando asignaturas:', e)
    } finally {
        loadingMisAsignaturas.value = false
    }
}

const filterMisAsignaturas = (val, update) => {
    if (val === '') {
        update(() => { misAsignaturasFiltered.value = misAsignaturas.value })
        return
    }
    update(() => {
        const needle = val.toLowerCase()
        misAsignaturasFiltered.value = misAsignaturas.value.filter(v => 
            v.nombre.toLowerCase().includes(needle) || v.codigo.toLowerCase().includes(needle)
        )
    })
}

const buscarCandidatos = async () => {
    if (!materiaBase.value) return
    loadingCandidatos.value = true
    try {
        const res = await api.get('/materias-comunes/candidates', { params: { search: busquedaCandidatos.value } })
        candidatos.value = res.data
            .filter(c => c.id !== materiaBase.value.id)
            .map(c => ({
                id: c.id,
                nombre: c.nombre,
                codigo: c.codigo,
                carrera_nombre: c.carreras?.map(cr => cr.nombre).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'Sin carrera'
            }))
    } catch (e) { console.error(e) }
    finally { loadingCandidatos.value = false }
}

const isSelected = (id) => materiasSeleccionadas.value.some(m => m.id === id)

const toggleSeleccion = (candidato) => {
    const idx = materiasSeleccionadas.value.findIndex(m => m.id === candidato.id)
    if (idx >= 0) materiasSeleccionadas.value.splice(idx, 1)
    else materiasSeleccionadas.value.push(candidato)
}

const vincularMultiple = async () => {
    if (!materiaBase.value || !materiasSeleccionadas.value.length) return
    saving.value = true
    try {
        for (const target of materiasSeleccionadas.value) {
            await api.post('/materias-comunes/link', {
                asignatura_id: materiaBase.value.id,
                target_asignatura_id: target.id,
                tipo: tipoVinculacion.value
            })
        }
        $q.notify({ type: 'positive', message: `${materiasSeleccionadas.value.length} materia(s) vinculadas` })
        dialogLink.value = false
        fetchMateriasComunes()
    } catch (e) {
        $q.notify({ type: 'negative', message: 'Error al vincular' })
    } finally { saving.value = false }
}

const confirmarDesvincular = (row) => {
    $q.dialog({
        title: 'Desvincular Grupo',
        message: '¿Desvincular todas las materias de este grupo?',
        cancel: true
    }).onOk(async () => {
        try {
            await api.post(`/materias-comunes/unlink/${row.id}`)
            $q.notify({ type: 'positive', message: 'Desvinculado' })
            fetchMateriasComunes()
        } catch { $q.notify({ type: 'negative', message: 'Error' }) }
    })
}

const verDetalleGrupo = (row) => {
    grupoDetalle.value = row
    dialogDetalle.value = true
}

const abrirDialogoLink = async () => {
    materiaBase.value = null
    tipoVinculacion.value = 'fusionada'
    busquedaCandidatos.value = ''
    candidatos.value = []
    materiasSeleccionadas.value = []
    dialogLink.value = true
    await fetchMisAsignaturas()
}

onMounted(() => { fetchMateriasComunes() })
</script>

<style scoped>
.materias-table :deep(.q-table__top) {
    padding: 8px 16px;
}
.materias-table :deep(th) {
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    color: #666;
}
.candidatos-list {
    background: #fafafa;
}
</style>
