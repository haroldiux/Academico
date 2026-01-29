<template>
    <q-page class="carpeta-page q-pa-lg doc-container">
        <!-- Botón de imprimir (solo visible en pantalla) -->
        <div class="print-actions text-right q-mb-lg">
            <q-btn icon="print" label="Imprimir Portada" color="primary" @click="printPage" />
        </div>

        <!-- Contenido de la Portada -->
        <div class="portada-container q-px-xl">

            <!-- Encabezado -->
            <div class="text-center text-uppercase text-bold q-mb-xl header-text">
                <div class="text-h6 text-black q-mb-xs">{{ area }}</div>
                <div class="text-h6 text-black q-mb-lg">CARRERA DE {{ carrera }}</div>

                <div class="text-h4 q-my-xl text-purple-title font-weight-900">CARPETA PEDAGÓGICA DOCENTE</div>

                <div class="text-h6 text-teal-subtitle">SEDE {{ sede }}</div>
            </div>

            <!-- Logo -->
            <div class="text-center q-my-xl logo-box">
                <img src="/unitepc-logo-clean.png" alt="Logo UNITEPC" class="logo-img" />
            </div>

            <!-- Cuadro de Datos -->
            <div class="datos-box q-mx-auto q-mt-xl">
                <div class="row q-mb-md">
                    <div class="col-5 text-bold field-label">Carrera:</div>
                    <div class="col-7 field-value">{{ carrera }}</div>
                </div>
                <div class="row q-mb-md">
                    <div class="col-5 text-bold field-label">Asignatura:</div>
                    <div class="col-7 field-value">{{ asignatura }}</div>
                </div>
                <div class="row q-mb-md">
                    <div class="col-5 text-bold field-label">Código de la asignatura:</div>
                    <div class="col-7 field-value">{{ codigo_asignatura }}</div>
                </div>
                <div class="row q-mb-md">
                    <div class="col-5 text-bold field-label">Nombre del Docente:</div>
                    <div class="col-7 field-value">{{ formatDocenteName(docente_nombre) }}</div>
                </div>
                <div class="row q-mb-md">
                    <div class="col-5 text-bold field-label">Semestre:</div>
                    <div class="col-7 field-value">{{ semestre }}</div>
                </div>
                <div class="row q-mb-md">
                    <div class="col-5 text-bold field-label">Grupo:</div>
                    <div class="col-7 field-value">Grupo {{ grupo }}</div>
                </div>
                <div class="row">
                    <div class="col-5 text-bold field-label">Gestión:</div>
                    <div class="col-7 field-value">{{ gestion }}</div>
                </div>
            </div>

        </div>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'src/boot/axios'

const route = useRoute()

const area = ref('')
const carrera = ref('')
const sede = ref('')
const docente_nombre = ref('')
const asignatura = ref('')
const codigo_asignatura = ref('')
const semestre = ref('')
const grupo = ref('')
const gestion = ref('')

function printPage() {
    window.print()
}

function formatDocenteName(name) {
    if (!name) return ''
    let cleaned = name.trim();
    // Regex flexible para Lic, Ing, Mgr, Msc, Dr, Dra (con/sin punto, mayus/minus)
    const prefixRegex = /^(Lic\.?|Ing\.?|Mgr\.?|Dr\.?|Dra\.?|Msc\.?|PhD\.?|Arq\.?)\s*/i;

    // Bucle para eliminar MÚLTIPLES prefijos (ej: "Ing. Lic. Juan")
    // Limitado a 5 iteraciones para evitar loops infinitos por seguridad
    let safety = 0;
    while (prefixRegex.test(cleaned) && safety < 5) {
        cleaned = cleaned.replace(prefixRegex, '').trim();
        safety++;
    }
    return cleaned;
}

onMounted(async () => {
    const id = route.params.id
    if (!id) return

    try {
        const { data } = await api.get(`/grupos/${id}`)

        // NORMALIZACIÓN DE ÁREA
        let rawArea = data.area ? data.area.toUpperCase().trim() : 'ÁREA NO DEFINIDA';
        // Eliminar "AREA DE " o "ÁREA DE " (insensible a acentos y mayusculas) al inicio
        // \u00C1 = Á
        rawArea = rawArea.replace(/^(ÁREA DE\s*|AREA DE\s*)+/i, '');

        area.value = 'ÁREA DE ' + rawArea;

        carrera.value = data.carrera ? data.carrera.toUpperCase() : 'SIN CARRERA'
        sede.value = data.sede ? data.sede.toUpperCase() : 'SIN SEDE'
        docente_nombre.value = data.docente_nombre ? data.docente_nombre.toUpperCase() : ''
        asignatura.value = data.asignatura ? data.asignatura.toUpperCase() : ''
        codigo_asignatura.value = data.codigo_asignatura || ''
        semestre.value = data.semestre || ''
        grupo.value = data.grupo || ''
        gestion.value = data.gestion || ''
    } catch (error) {
        console.error('Error cargando datos de carpeta:', error)
    }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap');

.carpeta-page {
    background-color: white;
    min-height: 100vh;
    font-family: 'Roboto', 'Arial', sans-serif;
    color: black;
}

.portada-container {
    max-width: 900px;
    margin: 0 auto;
}

.header-text .text-h6 {
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.5px;
}

.text-purple-title {
    color: #5B3C88;
    /* Purple similar to logo */
    font-weight: 900;
    letter-spacing: 1px;
}

.text-teal-subtitle {
    color: #00A99D;
    /* Teal similar to logo/border */
    font-weight: 700;
    margin-top: 10px;
}

.logo-img {
    max-width: 500px;
    height: auto;
}

.datos-box {
    border: 4px solid #00A99D;
    /* Teal border */
    padding: 40px 60px;
    width: 100%;
    max-width: 800px;
    background: white;
    font-size: 1.1rem;
}

.field-label {
    color: black;
}

.field-value {
    color: black;
    text-transform: uppercase;
}

@media print {
    .print-actions {
        display: none;
    }

    .q-page,
    .carpeta-page {
        padding: 0 !important;
        margin: 0 !important;
    }

    .portada-container {
        margin-top: 2cm;
    }

    .datos-box {
        border-width: 3px !important;
        /* Ensure border prints */
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
}

@media print {

    /* ESTRATEGIA DE VISIBILIDAD BRUTA */
    /* Ocultar TODO por defecto */
    body * {
        visibility: hidden;
    }

    /* Mostrar SOLO la página de carpeta y sus hijos */
    .carpeta-page,
    .carpeta-page * {
        visibility: visible;
    }

    /* Ocultar explícitamente contenedores de layout que puedan estorbar */
    .q-drawer-container,
    .q-header,
    .q-footer,
    .print-actions,
    .sidebar-footer,
    .logout,
    .sidebar-content {
        display: none !important;
    }

    /* Posicionar la página encima de todo */
    .carpeta-page {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0 !important;
        padding: 0 !important;
        background: white;
        z-index: 9999;
    }

    /* Resetear layouts de Quasar */
    .q-page-container {
        padding: 0 !important;
        margin: 0 !important;
    }

    body {
        overflow: hidden;
        /* Evitar scrollbars fantasmas */
    }
}
</style>
