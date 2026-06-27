<template>
  <q-page class="carpeta-page q-pa-lg doc-container">
    <!-- Botones de acción (solo visible en pantalla) -->
    <div class="print-actions text-right q-mb-lg q-gutter-sm">
      <q-btn
        icon="picture_as_pdf"
        label="Descargar Carpeta Completa (PDF)"
        color="secondary"
        @click="downloadPDF"
        :loading="loading"
      />
      <q-btn
        icon="description"
        label="Descargar Programa Analítico"
        color="primary"
        outline
        @click="downloadProgramaAnalitico"
        :loading="loadingProgramaAnalitico"
      />
      <q-btn
        icon="print"
        label="Vista Previa / Imprimir Portada"
        color="primary"
        @click="printPage"
      />
    </div>

    <!-- Contenido de la Portada -->
    <div class="portada-container q-px-xl">
      <!-- Encabezado -->
      <div class="text-center text-uppercase text-bold q-mb-xl header-text">
        <div class="text-h6 text-black q-mb-xs">{{ area }}</div>
        <div class="text-h6 text-black q-mb-lg">CARRERA DE {{ carrera }}</div>

        <div class="text-h4 q-my-xl text-purple-title font-weight-900">
          CARPETA PEDAGÓGICA DOCENTE
        </div>

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

  <!-- PÁGINA 2: ÍNDICE -->
  <q-page class="carpeta-page q-pa-lg doc-container page-break">
    <div class="portada-container q-px-xl">
      <!-- Portada simplified header for inner pages -->
      <div class="text-center q-mb-xl">
        <div class="text-h5 text-purple-title text-bold">UNITEPC</div>
        <div class="text-caption text-teal-subtitle">UNIVERSIDAD PRIVADA</div>
      </div>

      <div class="titulo-seccion-box q-mb-xl">
        <div class="text-h4 text-center text-bold text-white">ÍNDICE</div>
      </div>

      <div class="indice-container">
        <table class="indice-table">
          <thead>
            <tr class="seccion-header-valores">
              <th class="text-left text-white">VALORES INSTITUCIONALES</th>
              <th class="text-white" style="width: 100px">CÓDIGO</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="no-border-bottom">
                <div class="q-py-xs">Misión de la carrera</div>
                <div class="q-py-xs">Visión de la carrera</div>
                <div class="q-py-xs">Perfil profesional</div>
              </td>
              <td class="text-center valor-codigo-box">
                <div class="codigo-box bg-light-green">MVP</div>
              </td>
            </tr>

            <tr class="seccion-header-aspectos">
              <td class="text-bold text-white">ASPECTOS ORGANIZACIONALES</td>
              <td class="text-bold text-white text-center">CÓDIGO</td>
            </tr>
            <tr>
              <td>
                <div class="q-py-xs">Horario de clases de la asignatura</div>
                <div class="q-py-xs">Rol de exámenes de la asignatura</div>
              </td>
              <td class="text-center valor-codigo-box">
                <div class="codigo-box bg-light-gray">HR</div>
              </td>
            </tr>

            <tr class="seccion-header-planificacion">
              <td class="text-bold text-white">PLANIFICACIÓN ACADÉMICA</td>
              <td class="text-bold text-white text-center">CÓDIGO</td>
            </tr>
            <tr>
              <td class="no-border-right">
                <div class="row items-center q-py-xs">
                  <div class="col">Programa analítico</div>
                  <div class="text-bold" style="width: 60px">PA</div>
                </div>
                <div class="row items-center q-py-xs">
                  <div class="col">Programa de asignatura por competencias</div>
                  <div class="text-bold" style="width: 60px">PAC</div>
                </div>
                <div class="row items-center q-py-xs">
                  <div class="col">Plan de clase Teórico-Práctico (según corresponda)</div>
                  <div class="text-bold" style="width: 60px">PCT-PCP</div>
                </div>
              </td>
              <td class="bg-light-green-light"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </q-page>

  <!-- PÁGINA 3: VALORES INSTITUCIONALES -->
  <q-page class="carpeta-page q-pa-lg doc-container page-break">
    <div class="portada-container q-px-xl">
      <div class="text-center q-mb-xl">
        <div class="text-h5 text-purple-title text-bold">UNITEPC</div>
        <div class="text-caption text-teal-subtitle">UNIVERSIDAD PRIVADA</div>
      </div>

      <!-- MISIÓN -->
      <div class="mvp-section q-mb-xl">
        <div class="titulo-mvp text-center text-white text-bold q-mb-md">MISIÓN</div>
        <div class="contenido-mvp-box shadow-1">
          {{ mision }}
        </div>
      </div>

      <!-- VISIÓN -->
      <div class="mvp-section q-mb-xl">
        <div class="titulo-mvp text-center text-white text-bold q-mb-md">VISIÓN</div>
        <div class="contenido-mvp-box shadow-1">
          {{ vision }}
        </div>
      </div>

      <!-- PERFIL PROFESIONAL -->
      <div class="mvp-section">
        <div
          class="titulo-mvp text-center text-white text-bold q-mb-md"
          style="background-color: #00a99d"
        >
          PERFIL PROFESIONAL
        </div>
        <div class="contenido-mvp-box shadow-1" style="border-color: #00a99d">
          {{ perfil_profesional }}
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'src/boot/axios'
import {
  generarCarpetaDocente,
  generarProgramaAnaliticoPDF,
} from 'src/services/carpetaDocenteService'

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
const mision = ref('')
const vision = ref('')
const perfil_profesional = ref('')
const loading = ref(false)
const loadingProgramaAnalitico = ref(false)
const fullData = ref(null)
const logoBase64 = ref(null)

function printPage() {
  window.print()
}

async function downloadPDF() {
  if (!fullData.value) return
  loading.value = true
  try {
    await generarCarpetaDocente(fullData.value, fullData.value.carrera_obj, fullData.value.sede, {
      gestion: fullData.value.gestion,
      grupo: fullData.value.grupo,
      logo: logoBase64.value,
    })
  } catch (error) {
    console.error('Error generando PDF:', error)
  } finally {
    loading.value = false
  }
}

async function downloadProgramaAnalitico() {
  if (!fullData.value) return
  loadingProgramaAnalitico.value = true
  try {
    await generarProgramaAnaliticoPDF(fullData.value, fullData.value.carrera_obj, {
      gestion: fullData.value.gestion,
      grupo: fullData.value.grupo,
    })
  } catch (error) {
    console.error('Error generando Programa Analítico:', error)
  } finally {
    loadingProgramaAnalitico.value = false
  }
}

async function convertImageToBase64(url) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (e) {
    console.error('Error converting logo to base64:', e)
    return null
  }
}

function formatDocenteName(name) {
  if (!name) return ''
  let cleaned = name.trim()
  // Regex flexible para Lic, Ing, Mgr, Msc, Dr, Dra (con/sin punto, mayus/minus)
  const prefixRegex = /^(Lic\.?|Ing\.?|Mgr\.?|Dr\.?|Dra\.?|Msc\.?|PhD\.?|Arq\.?)\s*/i

  // Bucle para eliminar MÚLTIPLES prefijos (ej: "Ing. Lic. Juan")
  // Limitado a 5 iteraciones para evitar loops infinitos por seguridad
  let safety = 0
  while (prefixRegex.test(cleaned) && safety < 5) {
    cleaned = cleaned.replace(prefixRegex, '').trim()
    safety++
  }
  return cleaned
}

onMounted(async () => {
  const id = route.params.id
  if (!id) return

  try {
    const { data } = await api.get(`/grupos/${id}`)

    mision.value = data.mision || 'Misión no definida'
    vision.value = data.vision || 'Visión no definida'
    perfil_profesional.value = data.perfil_profesional || 'Perfil no definido'
    fullData.value = data

    // NORMALIZACIÓN DE ÁREA
    let rawArea = data.area ? data.area.toUpperCase().trim() : 'ÁREA NO DEFINIDA'
    // Eliminar "AREA DE " o "ÁREA DE " (insensible a acentos y mayusculas) al inicio
    // \u00C1 = Á
    rawArea = rawArea.replace(/^(ÁREA DE\s*|AREA DE\s*)+/i, '')

    area.value = 'ÁREA DE ' + rawArea

    carrera.value = data.carrera ? data.carrera.toUpperCase() : 'SIN CARRERA'
    sede.value = data.sede ? data.sede.toUpperCase() : 'SIN SEDE'
    docente_nombre.value = data.docente_nombre ? data.docente_nombre.toUpperCase() : ''
    asignatura.value = data.asignatura ? data.asignatura.toUpperCase() : ''
    codigo_asignatura.value = data.codigo_asignatura || ''
    semestre.value = data.semestre || ''
    grupo.value = data.grupo || ''
    gestion.value = data.gestion || ''

    // Convertir logo a base64 para el PDF
    logoBase64.value = await convertImageToBase64('/unitepc-logo-clean.png')
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
  color: #5b3c88;
  /* Purple similar to logo */
  font-weight: 900;
  letter-spacing: 1px;
}

.text-teal-subtitle {
  color: #00a99d;
  /* Teal similar to logo/border */
  font-weight: 700;
  margin-top: 10px;
}

.logo-img {
  max-width: 500px;
  height: auto;
}

.datos-box {
  border: 4px solid #00a99d;
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

  .page-break {
    page-break-before: always;
    break-before: page;
  }
}

/* Estilos de Índice y MVP */
.titulo-seccion-box {
  background-color: #00a99d;
  padding: 10px;
  width: 100%;
}

.indice-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.1rem;
}

.indice-table th {
  background-color: #ccc;
  padding: 8px;
  border: 1px solid black;
}

.indice-table td {
  padding: 10px;
  border: 1px solid black;
}

.seccion-header-valores {
  background-color: #00a99d;
  color: white;
}

.seccion-header-aspectos {
  background-color: #5b3c88;
  color: white;
}

.seccion-header-planificacion {
  background-color: #00a99d;
  color: white;
}

.codigo-box {
  padding: 15px 5px;
  font-weight: bold;
  border-radius: 4px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-light-green {
  background-color: #e6f3e6;
  color: black;
}

.bg-light-gray {
  background-color: #e2e8f0;
  color: black;
}

.bg-light-green-light {
  background-color: #f0f9f0;
}

.valor-codigo-box {
  padding: 10px !important;
}

.no-border-bottom {
  border-bottom: 1px solid black !important;
}

.no-border-right {
  border-right: none !important;
}

.mvp-section {
  width: 100%;
}

.titulo-mvp {
  background-color: #5b3c88;
  padding: 10px;
  font-size: 1.3rem;
  width: 70%;
  margin: 0 auto 15px auto;
}

.contenido-mvp-box {
  border: 2px solid #5b3c88;
  padding: 20px;
  text-align: center;
  font-size: 1.1rem;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
