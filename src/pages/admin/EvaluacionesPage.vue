<template>
  <q-page class="evaluaciones-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">
          <q-icon name="quiz" color="orange" class="q-mr-sm" />
          Gestión de Evaluaciones
        </h1>
        <p class="page-subtitle">Crea y administra exámenes desde el banco de preguntas</p>
      </div>
      <div class="header-actions">
        <q-btn outline color="green" icon="upload_file" label="Importar Horarios" no-caps @click="showImportDialog = true" />
        <q-btn unelevated color="orange" icon="add" label="Nueva Evaluación" no-caps @click="openDialog()" />
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <q-select
        v-model="filtros.sede"
        :options="sedesOptions"
        outlined dense label="Sede" emit-value map-options clearable
        style="min-width: 180px;"
      />
      <q-select
        v-model="filtros.carrera"
        :options="carrerasOptions"
        outlined dense label="Carrera" emit-value map-options clearable
        style="min-width: 200px;"
      />
      <q-select
        v-model="filtros.parcial"
        :options="parcialesOptions"
        outlined dense label="Parcial" emit-value map-options clearable
        style="min-width: 150px;"
      />
      <q-select
        v-model="filtros.estado"
        :options="estadosOptions"
        outlined dense label="Estado" emit-value map-options clearable
        style="min-width: 150px;"
      />
    </div>

    <!-- Estadísticas -->
    <div class="stats-row">
      <div class="stat-card">
        <q-icon name="assignment" size="28px" color="orange" />
        <div class="stat-info">
          <span class="stat-value">{{ evaluaciones.length }}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="schedule" size="28px" color="blue" />
        <div class="stat-info">
          <span class="stat-value">{{ evaluacionesProgramadas }}</span>
          <span class="stat-label">Programadas</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="play_circle" size="28px" color="green" />
        <div class="stat-info">
          <span class="stat-value">{{ evaluacionesEnCurso }}</span>
          <span class="stat-label">En Curso</span>
        </div>
      </div>
      <div class="stat-card">
        <q-icon name="check_circle" size="28px" color="purple" />
        <div class="stat-info">
          <span class="stat-value">{{ evaluacionesCompletadas }}</span>
          <span class="stat-label">Completadas</span>
        </div>
      </div>
    </div>

    <!-- Tabla de Evaluaciones -->
    <q-card class="table-card">
      <q-table
        :rows="evaluacionesFiltradas"
        :columns="columns"
        row-key="id"
        flat
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:body-cell-materia="props">
          <q-td :props="props">
            <div class="materia-cell">
              <q-chip size="sm" color="primary" text-color="white" dense>{{ props.row.materia_codigo }}</q-chip>
              <span class="materia-nombre">{{ props.row.materia }}</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-parcial="props">
          <q-td :props="props">
            <q-chip :color="getParcialColor(props.row.parcial)" text-color="white" size="sm" dense>
              {{ getParcialLabel(props.row.parcial) }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-chip :color="getEstadoColor(props.row.estado)" text-color="white" size="sm" dense>
              <q-icon :name="getEstadoIcon(props.row.estado)" size="14px" class="q-mr-xs" />
              {{ props.row.estado }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-preguntas="props">
          <q-td :props="props">
            <div class="flex items-center gap-2">
              <span class="text-weight-medium">{{ props.row.preguntas_count }}</span>
              <q-linear-progress 
                :value="props.row.preguntas_count / props.row.preguntas_total" 
                :color="props.row.preguntas_count >= props.row.preguntas_total ? 'green' : 'orange'" 
                rounded size="6px" style="width: 60px;" 
              />
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-patron="props">
          <q-td :props="props">
            <q-btn 
              v-if="puedeGenerarPatron(props.row)" 
              flat dense color="green" icon="fact_check" label="Generar Patrón" no-caps size="sm"
              @click="generarPatron(props.row)"
            />
            <q-chip v-else-if="props.row.patronGenerado" color="green-2" text-color="green-9" size="sm" dense>
              <q-icon name="check" size="14px" class="q-mr-xs" /> Patrón listo
            </q-chip>
            <span v-else class="text-grey-5 text-caption">Disponible 3h después</span>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn flat round dense icon="visibility" size="sm" color="primary" @click="verEvaluacion(props.row)">
              <q-tooltip>Ver</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="edit" size="sm" color="orange" @click="openDialog(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="picture_as_pdf" size="sm" color="red" @click="exportarPDF(props.row)">
              <q-tooltip>Exportar PDF</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Crear/Editar Evaluación -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="dialog-card" style="min-width: 700px; max-width: 90vw;">
        <div class="dialog-header">
          <h3>
            <q-icon :name="editMode ? 'edit' : 'add_circle'" class="q-mr-sm" />
            {{ editMode ? 'Editar' : 'Nueva' }} Evaluación
          </h3>
        </div>

        <q-card-section>
          <q-stepper v-model="step" vertical color="orange" animated>
            <!-- Paso 1: Información Básica -->
            <q-step :name="1" title="Información Básica" icon="info" :done="step > 1">
              <div class="q-gutter-md">
                <q-input v-model="form.nombre" outlined label="Nombre de la Evaluación *" placeholder="Ej: Primer Parcial - Anatomía I" />
                
                <div class="row q-col-gutter-md">
                  <div class="col-6">
                    <q-select
                      v-model="form.carrera"
                      :options="carrerasOptions"
                      outlined label="Carrera *" emit-value map-options
                    />
                  </div>
                  <div class="col-6">
                    <q-select
                      v-model="form.materia"
                      :options="materiasOptions"
                      outlined label="Materia *" emit-value map-options
                    />
                  </div>
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-4">
                    <q-select
                      v-model="form.parcial"
                      :options="parcialesOptions"
                      outlined label="Parcial *" emit-value map-options
                    >
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section avatar>
                            <q-icon :name="getParcialIcon(scope.opt.value)" :color="getParcialColor(scope.opt.value)" />
                          </q-item-section>
                          <q-item-section>{{ scope.opt.label }}</q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                  <div class="col-4">
                    <q-input v-model="form.fecha" outlined type="date" label="Fecha del Examen *" />
                  </div>
                  <div class="col-4">
                    <q-input v-model="form.hora" outlined type="time" label="Hora de Inicio *" />
                  </div>
                </div>

                <q-input v-model.number="form.duracion" outlined type="number" label="Duración (minutos)" min="15" />
              </div>

              <q-stepper-navigation>
                <q-btn unelevated color="orange" label="Siguiente" @click="step = 2" />
              </q-stepper-navigation>
            </q-step>

            <!-- Paso 2: Configuración de Preguntas -->
            <q-step :name="2" title="Configuración de Preguntas" icon="quiz" :done="step > 2">
              <div class="q-gutter-lg">
                <!-- Total de preguntas -->
                <div class="config-section">
                  <div class="section-title">Total de Preguntas</div>
                  <q-input 
                    v-model.number="form.totalPreguntas" 
                    outlined type="number" min="5" max="100"
                    style="max-width: 200px;"
                  >
                    <template v-slot:append>
                      <span class="text-grey-6">preguntas</span>
                    </template>
                  </q-input>
                </div>

                <!-- Distribución por Dificultad -->
                <div class="config-section">
                  <div class="section-title">Distribución por Dificultad</div>
                  <p class="text-caption text-grey-6 q-mb-md">Arrastra los separadores para distribuir las {{ form.totalPreguntas }} preguntas</p>
                  
                  <!-- Barra única segmentada -->
                  <div class="distribucion-bar-container">
                    <div class="distribucion-bar">
                      <div class="segment segment-facil" :style="{ width: `${porcentajeFacil}%` }">
                        <span v-if="form.dificultad.facil > 0">{{ form.dificultad.facil }}</span>
                      </div>
                      <div class="segment segment-medio" :style="{ width: `${porcentajeMedio}%` }">
                        <span v-if="form.dificultad.medio > 0">{{ form.dificultad.medio }}</span>
                      </div>
                      <div class="segment segment-dificil" :style="{ width: `${porcentajeDificil}%` }">
                        <span v-if="form.dificultad.dificil > 0">{{ form.dificultad.dificil }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Controles de ajuste con inputs editables -->
                  <div class="distribucion-controls q-mt-md">
                    <div class="control-item">
                      <q-chip color="green" text-color="white" size="sm" icon="sentiment_satisfied">Fácil</q-chip>
                      <div class="control-btns">
                        <q-btn round flat dense icon="remove" size="sm" @click="ajustarDificultad('facil', -1)" :disable="form.dificultad.facil <= 0" />
                        <q-input 
                          v-model.number="form.dificultad.facil" 
                          type="number" 
                          dense 
                          borderless 
                          input-class="text-center text-weight-bold" 
                          style="width: 50px;"
                          :min="0"
                          :max="form.totalPreguntas"
                          @update:model-value="validarDificultad('facil')"
                        />
                        <q-btn round flat dense icon="add" size="sm" @click="ajustarDificultad('facil', 1)" :disable="sumaDificultad >= form.totalPreguntas" />
                      </div>
                    </div>
                    <div class="control-item">
                      <q-chip color="orange" text-color="white" size="sm" icon="sentiment_neutral">Medio</q-chip>
                      <div class="control-btns">
                        <q-btn round flat dense icon="remove" size="sm" @click="ajustarDificultad('medio', -1)" :disable="form.dificultad.medio <= 0" />
                        <q-input 
                          v-model.number="form.dificultad.medio" 
                          type="number" 
                          dense 
                          borderless 
                          input-class="text-center text-weight-bold" 
                          style="width: 50px;"
                          :min="0"
                          :max="form.totalPreguntas"
                          @update:model-value="validarDificultad('medio')"
                        />
                        <q-btn round flat dense icon="add" size="sm" @click="ajustarDificultad('medio', 1)" :disable="sumaDificultad >= form.totalPreguntas" />
                      </div>
                    </div>
                    <div class="control-item">
                      <q-chip color="red" text-color="white" size="sm" icon="sentiment_dissatisfied">Difícil</q-chip>
                      <div class="control-btns">
                        <q-btn round flat dense icon="remove" size="sm" @click="ajustarDificultad('dificil', -1)" :disable="form.dificultad.dificil <= 0" />
                        <q-input 
                          v-model.number="form.dificultad.dificil" 
                          type="number" 
                          dense 
                          borderless 
                          input-class="text-center text-weight-bold" 
                          style="width: 50px;"
                          :min="0"
                          :max="form.totalPreguntas"
                          @update:model-value="validarDificultad('dificil')"
                        />
                        <q-btn round flat dense icon="add" size="sm" @click="ajustarDificultad('dificil', 1)" :disable="sumaDificultad >= form.totalPreguntas" />
                      </div>
                    </div>
                  </div>

                  <q-banner :class="sumaDificultad === form.totalPreguntas ? 'bg-green-1 text-green-9' : 'bg-orange-1 text-orange-9'" class="q-mt-md" rounded dense>
                    <q-icon :name="sumaDificultad === form.totalPreguntas ? 'check' : 'warning'" class="q-mr-sm" />
                    Total: {{ sumaDificultad }} / {{ form.totalPreguntas }} preguntas
                    <span v-if="sumaDificultad !== form.totalPreguntas" class="text-caption"> (faltan {{ form.totalPreguntas - sumaDificultad }})</span>
                  </q-banner>
                </div>

                <!-- Fuente de Preguntas -->
                <div class="config-section">
                  <div class="section-title">Fuente de Preguntas</div>
                  <p class="text-caption text-grey-6 q-mb-md">
                    Se tomarán preguntas del banco según el parcial seleccionado:
                    <strong>{{ form.parcial <= 2 ? `${form.parcial}° Parcial` : 'Todos los logros' }}</strong>
                  </p>
                  
                  <!-- Vista previa de temas y logros -->
                  <div v-if="materiaSeleccionada" class="temas-preview q-mt-md">
                    <div class="text-subtitle2 q-mb-sm">
                      <q-icon name="menu_book" color="primary" class="q-mr-xs" />
                      Contenido disponible para {{ materiaSeleccionada.nombre }}:
                    </div>
                    
                    <div v-if="logrosDisponibles.length === 0" class="text-center q-pa-md bg-grey-1 rounded-borders">
                      <q-icon name="info" size="24px" color="grey-5" />
                      <p class="text-caption text-grey-6 q-mb-none">No hay logros marcados para este parcial</p>
                    </div>
                    
                    <q-list v-else dense bordered separator class="rounded-borders">
                      <q-expansion-item 
                        v-for="unidad in unidadesConLogros" 
                        :key="unidad.id"
                        :label="`Unidad ${unidad.numero}: ${unidad.titulo}`"
                        :caption="`${unidad.logrosCount} logros disponibles`"
                        header-class="bg-blue-1"
                        dense
                      >
                        <q-card>
                          <q-card-section class="q-pa-sm">
                            <div v-for="tema in unidad.temas" :key="tema.id" class="q-mb-sm">
                              <div class="text-caption text-weight-medium text-primary q-mb-xs">
                                <q-icon name="topic" size="14px" class="q-mr-xs" />
                                {{ tema.titulo }}
                              </div>
                              <q-list dense class="q-pl-md">
                                <q-item v-for="logro in tema.logros" :key="logro.id" dense class="q-py-xs">
                                  <q-item-section avatar>
                                    <q-chip 
                                      :color="logro.parcial === 1 ? 'blue' : 'orange'" 
                                      text-color="white" 
                                      size="xs" 
                                      dense
                                    >
                                      {{ logro.parcial }}°
                                    </q-chip>
                                  </q-item-section>
                                  <q-item-section>
                                    <q-item-label class="text-caption">{{ logro.codigo }}: {{ logro.descripcion }}</q-item-label>
                                  </q-item-section>
                                </q-item>
                              </q-list>
                            </div>
                          </q-card-section>
                        </q-card>
                      </q-expansion-item>
                    </q-list>
                    
                    <q-banner class="bg-green-1 text-green-9 q-mt-md" rounded dense>
                      <q-icon name="quiz" class="q-mr-sm" />
                      <strong>{{ logrosDisponibles.length }}</strong> logros disponibles para generar preguntas
                    </q-banner>
                  </div>
                  
                  <q-banner v-else class="bg-orange-1 text-orange-9 q-mt-md" rounded dense>
                    <q-icon name="warning" class="q-mr-sm" />
                    Selecciona una materia en el paso anterior para ver los logros disponibles
                  </q-banner>
                </div>
              </div>

              <q-stepper-navigation>
                <q-btn flat color="grey" label="Atrás" @click="step = 1" class="q-mr-sm" />
                <q-btn unelevated color="orange" label="Siguiente" @click="step = 3" :disable="sumaDificultad !== form.totalPreguntas" />
              </q-stepper-navigation>
            </q-step>

            <!-- Paso 3: Opciones Adicionales -->
            <q-step :name="3" title="Opciones Adicionales" icon="settings">
              <div class="q-gutter-md">
                <q-toggle v-model="form.mezclarPreguntas" label="Mezclar orden de preguntas" />
                <q-toggle v-model="form.mezclarOpciones" label="Mezclar orden de opciones" />
                <q-toggle v-model="form.tiempoLimite" label="Habilitar tiempo límite" />
                
                <q-banner class="bg-green-1 text-green-9 q-mt-md" rounded dense>
                  <q-icon name="fact_check" class="q-mr-sm" />
                  <strong>Patrón de Respuestas:</strong> Estará disponible 3 horas después de la hora de inicio del examen.
                </q-banner>
              </div>

              <q-stepper-navigation>
                <q-btn flat color="grey" label="Atrás" @click="step = 2" class="q-mr-sm" />
                <q-btn unelevated color="orange" icon="save" label="Guardar Evaluación" @click="guardarEvaluacion" />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" @click="showDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Importar Horarios -->
    <q-dialog v-model="showImportDialog">
      <q-card class="dialog-card" style="min-width: 500px;">
        <div class="dialog-header bg-green">
          <h3><q-icon name="upload_file" class="q-mr-sm" /> Importar Horarios de Exámenes</h3>
        </div>
        <q-card-section>
          <p class="q-mb-md">Sube un archivo Excel con los horarios de exámenes proporcionado por el Director de Carrera.</p>
          
          <q-file 
            v-model="archivoExcel" 
            outlined 
            label="Seleccionar archivo Excel"
            accept=".xlsx, .xls"
            max-files="1"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <q-banner class="bg-blue-1 text-blue-9 q-mt-md" rounded dense>
            <q-icon name="info" class="q-mr-sm" />
            <strong>Formato requerido:</strong> Columnas: Materia, Grupo, Parcial, Fecha, Hora, Aula
          </q-banner>

          <div v-if="importPreview.length" class="q-mt-lg">
            <div class="text-subtitle2 q-mb-sm">Vista previa ({{ importPreview.length }} registros):</div>
            <q-table :rows="importPreview" :columns="importColumns" dense flat :pagination="{ rowsPerPage: 5 }" />
          </div>
        </q-card-section>
        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" @click="showImportDialog = false" />
          <q-btn unelevated color="green" icon="upload" label="Importar" @click="ejecutarImportacion" :disable="!archivoExcel" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Patrón de Respuestas -->
    <q-dialog v-model="showPatronDialog" maximized>
      <q-card class="patron-dialog">
        <q-card-section class="row items-center q-pb-none no-print">
          <div class="text-h6">
            <q-icon name="fact_check" color="purple" class="q-mr-sm" />
            Patrón de Respuestas
          </div>
          <q-space />
          <q-btn flat round dense icon="print" @click="imprimirPatron" color="primary">
            <q-tooltip>Imprimir</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="patron-content" id="patron-print">
          <!-- Header UNITEPC -->
          <div class="patron-header">
            <div class="logo-section">
              <img src="/logo-unitepc.png" alt="UNITEPC" class="logo" onerror="this.style.display='none'" />
              <div class="logo-fallback">
                <div class="logo-text">UNITEPC</div>
              </div>
            </div>
            <div class="header-info">
              <div class="universidad-name">UNIVERSIDAD TÉCNICA PRIVADA COSMOS</div>
              <div class="carrera-line">Carrera: <span class="field-value">{{ patronData.carrera }}</span></div>
              <div class="slogan">"TÚ ESTÁS AQUÍ PORQUE FORMAS PARTE DE NUESTRA HISTORIA"</div>
            </div>
            <div class="codigo-section">
              <div class="codigo-box">{{ patronData.codigo }}</div>
            </div>
          </div>

          <!-- Datos del Examen -->
          <div class="datos-examen">
            <div class="datos-left">
              <div class="field-row">
                <span class="field-label">Nombre y Apellido(s):</span>
                <span class="field-patron">PATRÓN</span>
              </div>
              <div class="field-row">
                <span class="field-label">Materia:</span>
                <span class="field-value">{{ patronData.materia }}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Docente:</span>
                <span class="field-value">{{ patronData.docente }}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Examen:</span>
                <span class="field-value">{{ patronData.examen }}</span>
              </div>
              <div class="field-row">
                <span class="field-label">Grupo:</span>
                <span class="field-value">{{ patronData.grupo }}</span>
                <span class="field-label q-ml-md">Código Estudiante:</span>
                <span class="field-value">___________</span>
              </div>
            </div>
            <div class="datos-right">
              <div class="tipo-examen-box">
                <div class="tipo-label">TIPO DE EXAMEN</div>
                <div class="tipo-options">
                  <span v-for="tipo in ['A', 'B', 'C', 'D', 'E']" :key="tipo" class="tipo-bubble" :class="{ active: patronData.tipoExamen === tipo }">{{ tipo }}</span>
                </div>
              </div>
              <div class="fecha-box">
                <span class="field-label">FECHA:</span>
                <span class="field-value">{{ patronData.fecha }}</span>
              </div>
              <div class="firma-box">
                <div class="firma-label">FIRMA DOCENTE Y SELLO</div>
              </div>
            </div>
          </div>

          <!-- Grilla de Respuestas -->
          <div class="respuestas-grid">
            <div v-for="col in 4" :key="col" class="respuestas-column">
              <div class="column-header">
                <span class="col-num"></span>
                <span v-for="opt in ['A', 'B', 'C', 'D', 'E']" :key="opt" class="opt-header">{{ opt }}</span>
              </div>
              <div v-for="num in 25" :key="num" class="respuesta-row">
                <span class="pregunta-num">{{ (col - 1) * 25 + num }}</span>
                <span 
                  v-for="opt in ['A', 'B', 'C', 'D', 'E']" 
                  :key="opt" 
                  class="bubble" 
                  :class="{ filled: patronData.respuestas[(col - 1) * 25 + num - 1] === opt }"
                >
                  {{ opt }}
                </span>
              </div>
            </div>
          </div>

          <!-- Recomendaciones -->
          <div class="recomendaciones">
            <div class="rec-title">RECOMENDACIONES: Esta cartilla debe ser llenada con bolígrafo azul, no se aceptan borrones enmendadas o raspaduras; la prueba se realizará en silencio</div>
            <div class="rec-list">
              <div class="rec-col">
                <p>Quedará nulo en caso de:</p>
                <p>- Uso de celular u otro equipo digital</p>
                <p>- El tipo de examen no sea el asignado</p>
                <p>- Uso de corrector será anulada la pregunta</p>
              </div>
              <div class="rec-col">
                <p>- Suplantación de persona o código no correspondiente</p>
                <p>- Copiar o dejar copiar</p>
              </div>
            </div>
            <div class="correcto-incorrecto">
              <span>Correcto <span class="bubble filled">●</span></span>
              <span class="q-ml-lg">Incorrecto <span class="bubble">○</span> <span class="bubble">⊘</span> <span class="bubble">⊗</span></span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog Examen para Impresión -->
    <q-dialog v-model="showExamenDialog" maximized>
      <q-card class="examen-dialog">
        <q-card-section class="row items-center q-pb-none no-print">
          <div class="text-h6">
            <q-icon name="description" color="primary" class="q-mr-sm" />
            Examen para Impresión
          </div>
          <q-space />
          <q-btn flat round dense icon="print" @click="imprimirExamen" color="primary">
            <q-tooltip>Imprimir</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="examen-content" id="examen-print">
          <!-- Header UNITEPC -->
          <div class="examen-header">
            <div class="logo-section">
              <div class="logo-fallback">
                <div class="logo-text">UNITEPC</div>
              </div>
            </div>
            <div class="header-info">
              <div class="universidad-name">UNIVERSIDAD TÉCNICA PRIVADA COSMOS</div>
              <div class="carrera-line">Carrera: <span class="field-value">{{ examenData.carrera }}</span></div>
              <div class="materia-line"><strong>{{ examenData.materia }}</strong></div>
            </div>
            <div class="tipo-section">
              <div class="tipo-box">TIPO {{ examenData.tipo }}</div>
            </div>
          </div>

          <!-- Datos del Estudiante -->
          <div class="datos-estudiante">
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <div class="field-line">
                  <span class="label">Nombre y Apellido(s):</span>
                  <span class="line">___________________________________________</span>
                </div>
              </div>
              <div class="col-3">
                <div class="field-line">
                  <span class="label">Código:</span>
                  <span class="line">________________</span>
                </div>
              </div>
              <div class="col-3">
                <div class="field-line">
                  <span class="label">Grupo:</span>
                  <span class="line">________________</span>
                </div>
              </div>
            </div>
            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-4">
                <div class="field-line">
                  <span class="label">Docente:</span>
                  <span class="field-value">{{ examenData.docente }}</span>
                </div>
              </div>
              <div class="col-4">
                <div class="field-line">
                  <span class="label">Examen:</span>
                  <span class="field-value">{{ examenData.examen }}</span>
                </div>
              </div>
              <div class="col-4">
                <div class="field-line">
                  <span class="label">Fecha:</span>
                  <span class="field-value">{{ examenData.fecha }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Instrucciones -->
          <div class="instrucciones">
            <strong>INSTRUCCIONES:</strong> Lea cuidadosamente cada pregunta y marque con una X la opción correcta en su hoja de respuestas.
            Tiempo máximo: {{ examenData.duracion }} minutos. Total de preguntas: {{ examenData.totalPreguntas }}.
          </div>

          <!-- Preguntas del Examen -->
          <div class="preguntas-container">
            <div v-for="(pregunta, idx) in examenData.preguntas" :key="idx" class="pregunta-item">
              <div class="pregunta-header">
                <span class="pregunta-num">{{ idx + 1 }}.</span>
                <span class="pregunta-texto">{{ pregunta.texto }}</span>
              </div>
              <div class="opciones-list">
                <div v-for="(opcion, oidx) in pregunta.opciones" :key="oidx" class="opcion-item">
                  <span class="opcion-letra">{{ ['a', 'b', 'c', 'd', 'e'][oidx] }})</span>
                  <span class="opcion-texto">{{ opcion }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Pie de página -->
          <div class="examen-footer">
            <div class="footer-line">--- Fin del Examen ---</div>
            <div class="footer-note">Revise sus respuestas antes de entregar. ¡Éxito!</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'
import { useAsignaturasStore } from 'src/stores/asignaturas'

const $q = useQuasar()
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()
const asignaturasStore = useAsignaturasStore()

const showDialog = ref(false)
const showImportDialog = ref(false)
const showPatronDialog = ref(false)
const editMode = ref(false)
const step = ref(1)
const archivoExcel = ref(null)
const importPreview = ref([])

// Datos del patrón de respuestas
const patronData = ref({
  carrera: '',
  materia: '',
  docente: '',
  examen: '',
  grupo: '',
  fecha: '',
  codigo: '',
  tipoExamen: 'A',
  respuestas: [] // Array de 100 respuestas (A, B, C, D, E)
})

// Datos del examen para impresión
const showExamenDialog = ref(false)
const examenData = ref({
  carrera: '',
  materia: '',
  docente: '',
  examen: '',
  fecha: '',
  duracion: 90,
  totalPreguntas: 20,
  tipo: 'A',
  preguntas: [] // Array de preguntas con texto y opciones
})

const filtros = ref({ sede: null, carrera: null, parcial: null, estado: null })

const form = ref({
  nombre: '',
  carrera: null,
  materia: null,
  parcial: 1,
  fecha: '',
  hora: '',
  duracion: 90,
  totalPreguntas: 20,
  dificultad: { facil: 8, medio: 8, dificil: 4 },
  mezclarPreguntas: true,
  mezclarOpciones: true,
  tiempoLimite: true
})

const parcialesOptions = [
  { label: '1° Parcial', value: 1 },
  { label: '2° Parcial', value: 2 },
  { label: 'Examen Final', value: 3 },
  { label: '2da Instancia', value: 4 }
]

const estadosOptions = [
  { label: 'Programada', value: 'Programada' },
  { label: 'En Curso', value: 'En Curso' },
  { label: 'Completada', value: 'Completada' }
]

const sedesOptions = computed(() => sedesStore.sedesActivas.map(s => ({ label: s.nombre, value: s.id })))
const carrerasOptions = computed(() => carrerasStore.carreras.map(c => ({ label: c.nombre, value: c.id })))

// Materias desde el store de asignaturas
const materiasOptions = computed(() => {
  return asignaturasStore.asignaturas.map(a => ({
    label: `${a.nombre} (${a.codigo})`,
    value: a.id
  }))
})

const sumaDificultad = computed(() => form.value.dificultad.facil + form.value.dificultad.medio + form.value.dificultad.dificil)

const porcentajeFacil = computed(() => (form.value.dificultad.facil / form.value.totalPreguntas) * 100)
const porcentajeMedio = computed(() => (form.value.dificultad.medio / form.value.totalPreguntas) * 100)
const porcentajeDificil = computed(() => (form.value.dificultad.dificil / form.value.totalPreguntas) * 100)

// Obtener la materia seleccionada del store
const materiaSeleccionada = computed(() => {
  if (!form.value.materia) return null
  return asignaturasStore.getAsignaturaById(form.value.materia)
})

// Obtener logros disponibles según el parcial seleccionado
const logrosDisponibles = computed(() => {
  if (!materiaSeleccionada.value) return []
  
  const logros = []
  const parcialFiltro = form.value.parcial
  
  materiaSeleccionada.value.unidades?.forEach(unidad => {
    unidad.temas?.forEach(tema => {
      tema.logros_esperados?.forEach(logro => {
        // Para 1° o 2° parcial, filtrar por el campo parcial del logro
        // Para Final (3) o Instancia (4), incluir todos los logros
        if (parcialFiltro >= 3 || logro.parcial === parcialFiltro || !logro.parcial) {
          logros.push({
            ...logro,
            temaId: tema.id,
            temaTitulo: tema.titulo,
            unidadId: unidad.id,
            unidadTitulo: unidad.titulo,
            unidadNumero: unidad.numero
          })
        }
      })
    })
  })
  
  return logros
})

// Agrupar logros por unidad y tema para mostrar en la UI
const unidadesConLogros = computed(() => {
  if (!materiaSeleccionada.value || logrosDisponibles.value.length === 0) return []
  
  const unidadesMap = new Map()
  
  logrosDisponibles.value.forEach(logro => {
    if (!unidadesMap.has(logro.unidadId)) {
      unidadesMap.set(logro.unidadId, {
        id: logro.unidadId,
        numero: logro.unidadNumero,
        titulo: logro.unidadTitulo,
        temas: new Map(),
        logrosCount: 0
      })
    }
    
    const unidad = unidadesMap.get(logro.unidadId)
    unidad.logrosCount++
    
    if (!unidad.temas.has(logro.temaId)) {
      unidad.temas.set(logro.temaId, {
        id: logro.temaId,
        titulo: logro.temaTitulo,
        logros: []
      })
    }
    
    unidad.temas.get(logro.temaId).logros.push(logro)
  })
  
  // Convertir Map a array
  return Array.from(unidadesMap.values()).map(unidad => ({
    ...unidad,
    temas: Array.from(unidad.temas.values())
  }))
})

// Función para ajustar dificultad con +/-
function ajustarDificultad(tipo, delta) {
  const nuevoValor = form.value.dificultad[tipo] + delta
  
  // No permitir valores negativos
  if (nuevoValor < 0) return
  
  // No permitir que el total exceda el máximo
  const nuevoTotal = sumaDificultad.value + delta
  if (nuevoTotal > form.value.totalPreguntas) return
  
  form.value.dificultad[tipo] = nuevoValor
}

// Función para validar cuando se escribe directamente en el input
function validarDificultad(tipo) {
  // Asegurar que sea un número válido
  if (form.value.dificultad[tipo] === null || form.value.dificultad[tipo] === '' || isNaN(form.value.dificultad[tipo])) {
    form.value.dificultad[tipo] = 0
    return
  }
  
  // Convertir a entero
  form.value.dificultad[tipo] = Math.floor(form.value.dificultad[tipo])
  
  // No permitir valores negativos
  if (form.value.dificultad[tipo] < 0) {
    form.value.dificultad[tipo] = 0
  }
  
  // Calcular cuánto espacio hay disponible (total - suma de los otros dos)
  const tipos = ['facil', 'medio', 'dificil']
  const otrosTipos = tipos.filter(t => t !== tipo)
  const sumaOtros = otrosTipos.reduce((sum, t) => sum + form.value.dificultad[t], 0)
  const maximoDisponible = form.value.totalPreguntas - sumaOtros
  
  // Limitar al máximo disponible
  if (form.value.dificultad[tipo] > maximoDisponible) {
    form.value.dificultad[tipo] = maximoDisponible
  }
}

const columns = [
  { name: 'materia', label: 'Materia', field: 'materia', align: 'left', sortable: true },
  { name: 'parcial', label: 'Parcial', field: 'parcial', align: 'center' },
  { name: 'fecha', label: 'Fecha/Hora', field: 'fecha', align: 'center', sortable: true },
  { name: 'preguntas', label: 'Preguntas', field: 'preguntas_count', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'patron', label: 'Patrón Resp.', field: 'patron', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const importColumns = [
  { name: 'materia', label: 'Materia', field: 'materia', align: 'left' },
  { name: 'parcial', label: 'Parcial', field: 'parcial', align: 'center' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'center' },
  { name: 'hora', label: 'Hora', field: 'hora', align: 'center' }
]

const evaluaciones = ref([
  { id: 1, nombre: '1er Parcial - Anatomía I', materia: 'Anatomía I', materia_codigo: 'MED-101', parcial: 1, fecha: '2026-03-15', hora: '08:00', duracion: 90, preguntas_count: 20, preguntas_total: 20, estado: 'Completada', patronGenerado: true, horaInicio: new Date('2026-03-15T08:00:00') },
  { id: 2, nombre: '2do Parcial - Anatomía I', materia: 'Anatomía I', materia_codigo: 'MED-101', parcial: 2, fecha: '2026-04-20', hora: '08:00', duracion: 90, preguntas_count: 18, preguntas_total: 20, estado: 'Programada', patronGenerado: false, horaInicio: new Date('2026-04-20T08:00:00') },
  { id: 3, nombre: '1er Parcial - Ing. Software', materia: 'Ingeniería de Software I', materia_codigo: 'SIS-301', parcial: 1, fecha: '2026-01-12', hora: '10:00', duracion: 120, preguntas_count: 25, preguntas_total: 25, estado: 'En Curso', patronGenerado: false, horaInicio: new Date('2026-01-12T10:00:00') }
])

const evaluacionesFiltradas = computed(() => {
  return evaluaciones.value.filter(e => {
    if (filtros.value.parcial && e.parcial !== filtros.value.parcial) return false
    if (filtros.value.estado && e.estado !== filtros.value.estado) return false
    return true
  })
})

const evaluacionesProgramadas = computed(() => evaluaciones.value.filter(e => e.estado === 'Programada').length)
const evaluacionesEnCurso = computed(() => evaluaciones.value.filter(e => e.estado === 'En Curso').length)
const evaluacionesCompletadas = computed(() => evaluaciones.value.filter(e => e.estado === 'Completada').length)

function getParcialColor(parcial) {
  const colors = { 1: 'blue', 2: 'orange', 3: 'purple', 4: 'red' }
  return colors[parcial] || 'grey'
}

function getParcialLabel(parcial) {
  const labels = { 1: '1° Parcial', 2: '2° Parcial', 3: 'Final', 4: '2da Inst.' }
  return labels[parcial] || ''
}

function getParcialIcon(parcial) {
  const icons = { 1: 'looks_one', 2: 'looks_two', 3: 'emoji_events', 4: 'replay' }
  return icons[parcial] || 'assignment'
}

function getEstadoColor(estado) {
  const colors = { 'Programada': 'blue', 'En Curso': 'green', 'Completada': 'purple' }
  return colors[estado] || 'grey'
}

function getEstadoIcon(estado) {
  const icons = { 'Programada': 'schedule', 'En Curso': 'play_circle', 'Completada': 'check_circle' }
  return icons[estado] || 'info'
}

function puedeGenerarPatron(evaluacion) {
  // Por ahora permitir siempre para demostración
  // En producción: verificar 3h después del inicio
  return !evaluacion.patronGenerado
}

function generarPatron(evaluacion) {
  // Generar respuestas aleatorias para demostración
  const opciones = ['A', 'B', 'C', 'D', 'E']
  const respuestas = Array.from({ length: 100 }, () => 
    opciones[Math.floor(Math.random() * opciones.length)]
  )
  
  // Llenar datos del patrón
  patronData.value = {
    carrera: evaluacion.carrera || 'Medicina',
    materia: evaluacion.materia,
    docente: 'Docente Asignado',
    examen: getParcialLabel(evaluacion.parcial),
    grupo: 'Grupo 1 y 2',
    fecha: evaluacion.fecha,
    codigo: String(Math.floor(100000 + Math.random() * 900000)),
    tipoExamen: 'A',
    respuestas: respuestas
  }
  
  evaluacion.patronGenerado = true
  showPatronDialog.value = true
  $q.notify({ type: 'positive', message: 'Patrón de respuestas generado', icon: 'fact_check' })
}

function imprimirPatron() {
  window.print()
}

function openDialog(evaluacion = null) {
  editMode.value = !!evaluacion
  step.value = 1
  if (evaluacion) {
    form.value = { ...evaluacion, dificultad: { facil: 8, medio: 8, dificil: 4 }, totalPreguntas: evaluacion.preguntas_total }
  } else {
    form.value = { nombre: '', carrera: null, materia: null, parcial: 1, fecha: '', hora: '', duracion: 90, totalPreguntas: 20, dificultad: { facil: 8, medio: 8, dificil: 4 }, mezclarPreguntas: true, mezclarOpciones: true, tiempoLimite: true }
  }
  showDialog.value = true
}

function guardarEvaluacion() {
  showDialog.value = false
  $q.notify({ type: 'positive', message: editMode.value ? 'Evaluación actualizada' : 'Evaluación creada', icon: 'check_circle' })
}

function verEvaluacion(evaluacion) {
  $q.notify({ message: `Viendo: ${evaluacion.nombre}`, icon: 'visibility' })
}

function exportarPDF(evaluacion) {
  // Generar preguntas de demostración para el examen
  const preguntasDemo = []
  const temas = [
    'anatomía del sistema nervioso',
    'fisiología cardiovascular', 
    'histología de tejidos',
    'embriología general',
    'bioquímica celular'
  ]
  
  for (let i = 0; i < evaluacion.preguntas_count; i++) {
    const tema = temas[i % temas.length]
    preguntasDemo.push({
      texto: `Pregunta ${i + 1}: Respecto a ${tema}, identifique la alternativa correcta:`,
      opciones: [
        `Primera opción relacionada con ${tema}`,
        `Segunda opción que describe un concepto de ${tema}`,
        `Tercera alternativa sobre ${tema}`,
        `Cuarta posibilidad referente a ${tema}`,
        `Quinta opción acerca de ${tema}`
      ]
    })
  }
  
  examenData.value = {
    carrera: evaluacion.carrera || 'Medicina',
    materia: evaluacion.materia,
    docente: 'Docente Asignado',
    examen: getParcialLabel(evaluacion.parcial),
    fecha: evaluacion.fecha,
    duracion: evaluacion.duracion,
    totalPreguntas: evaluacion.preguntas_count,
    tipo: 'A',
    preguntas: preguntasDemo
  }
  
  showExamenDialog.value = true
  $q.notify({ type: 'positive', message: `Generando PDF: ${evaluacion.nombre}`, icon: 'picture_as_pdf' })
}

function imprimirExamen() {
  window.print()
}

function ejecutarImportacion() {
  showImportDialog.value = false
  $q.notify({ type: 'positive', message: 'Horarios importados exitosamente', icon: 'check_circle' })
}
</script>

<style scoped>
.evaluaciones-page { padding: 24px; background: var(--bg-primary); min-height: 100vh; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; }
.page-subtitle { color: var(--text-secondary); margin: 4px 0 0 0; }
.header-actions { display: flex; gap: 12px; }

.filters-section { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }

.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; }
.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
.stat-label { font-size: 0.8rem; color: var(--text-muted); }

.table-card { background: var(--bg-secondary) !important; border: 1px solid var(--border-color); border-radius: 16px; }
.materia-cell { display: flex; align-items: center; gap: 8px; }
.materia-nombre { font-size: 0.85rem; }

.dialog-card { background: var(--bg-secondary) !important; border-radius: 16px !important; }
.dialog-header { padding: 20px 24px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; margin: -16px -16px 16px -16px; border-radius: 16px 16px 0 0; }
.dialog-header.bg-green { background: linear-gradient(135deg, #10b981, #059669); }
.dialog-header h3 { margin: 0; font-size: 1.25rem; display: flex; align-items: center; }
.dialog-actions { padding: 16px 24px; border-top: 1px solid var(--border-color); }

.config-section { background: var(--bg-tertiary); padding: 16px; border-radius: 12px; }
.section-title { font-weight: 600; color: var(--text-primary); margin-bottom: 12px; }

/* Barra de distribución segmentada */
.distribucion-bar-container { padding: 8px 0; }
.distribucion-bar { display: flex; height: 48px; border-radius: 12px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
.segment { display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; color: white; transition: width 0.3s ease; min-width: 0; }
.segment span { text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
.segment-facil { background: linear-gradient(135deg, #10b981, #059669); }
.segment-medio { background: linear-gradient(135deg, #f59e0b, #d97706); }
.segment-dificil { background: linear-gradient(135deg, #ef4444, #dc2626); }

/* Controles de ajuste */
.distribucion-controls { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
.control-item { display: flex; flex-direction: column; align-items: center; gap: 8px; background: var(--bg-hover); padding: 12px 16px; border-radius: 12px; min-width: 100px; }
.control-btns { display: flex; align-items: center; gap: 4px; }
.control-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); min-width: 32px; text-align: center; }

/* Patrón de Respuestas */
.patron-dialog { background: white !important; }
.patron-content { 
  background: #f5f0e8; 
  padding: 20px; 
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
}

.patron-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #6b21a8;
}

.logo-section { width: 80px; }
.logo { width: 80px; height: auto; }
.logo-fallback { text-align: center; }
.logo-text { font-size: 14px; font-weight: bold; color: #6b21a8; }

.header-info { flex: 1; text-align: center; }
.universidad-name { font-size: 16px; font-weight: bold; color: #6b21a8; }
.carrera-line { font-size: 14px; margin: 4px 0; }
.slogan { font-size: 10px; color: #666; font-style: italic; }

.codigo-section { text-align: right; }
.codigo-box { 
  background: #dc2626; 
  color: white; 
  padding: 8px 16px; 
  font-size: 18px; 
  font-weight: bold;
  border-radius: 4px;
}

.datos-examen {
  display: flex;
  gap: 16px;
  margin: 16px 0;
  padding: 12px;
  border: 1px solid #ccc;
  background: white;
}

.datos-left { flex: 2; }
.datos-right { flex: 1; }

.field-row { margin: 4px 0; font-size: 12px; }
.field-label { font-weight: bold; }
.field-value { margin-left: 8px; }
.field-patron { font-size: 28px; font-weight: bold; margin-left: 8px; }

.tipo-examen-box { text-align: center; margin-bottom: 8px; }
.tipo-label { font-size: 10px; font-weight: bold; }
.tipo-options { display: flex; justify-content: center; gap: 4px; margin-top: 4px; }
.tipo-bubble { 
  width: 24px; 
  height: 24px; 
  border: 2px solid #333; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  font-size: 12px;
}
.tipo-bubble.active { background: #333; color: white; }

.fecha-box { text-align: center; margin: 8px 0; font-size: 12px; }
.firma-box { 
  border: 1px solid #ccc; 
  padding: 8px; 
  text-align: center; 
  min-height: 60px;
}
.firma-label { font-size: 10px; font-weight: bold; }

.respuestas-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: white;
  padding: 12px;
  border: 1px solid #ccc;
}

.respuestas-column { padding: 4px; }
.column-header {
  display: flex;
  gap: 2px;
  font-size: 10px;
  font-weight: bold;
  padding: 4px 0;
  border-bottom: 1px solid #ccc;
}
.col-num { width: 24px; }
.opt-header { width: 18px; text-align: center; }

.respuesta-row {
  display: flex;
  gap: 2px;
  padding: 2px 0;
  border-bottom: 1px solid #eee;
}

.pregunta-num { 
  width: 24px; 
  font-size: 11px; 
  font-weight: bold; 
  text-align: right;
  padding-right: 4px;
}

.bubble {
  width: 18px;
  height: 18px;
  border: 1px solid #666;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: #999;
}

.bubble.filled {
  background: #333;
  color: white;
  border-color: #333;
}

.recomendaciones {
  margin-top: 12px;
  padding: 8px;
  background: white;
  border: 1px solid #ccc;
  font-size: 9px;
}

.rec-title { font-weight: bold; margin-bottom: 8px; }
.rec-list { display: flex; gap: 16px; }
.rec-col p { margin: 2px 0; }
.correcto-incorrecto { text-align: center; margin-top: 8px; font-weight: bold; }

/* Print styles */
@media print {
  .no-print { display: none !important; }
  .patron-content, .examen-content { 
    padding: 0; 
    background: white;
  }
  .q-dialog__inner { padding: 0 !important; }
  .patron-dialog, .examen-dialog { box-shadow: none !important; }
}

/* Examen para Impresión */
.examen-dialog { background: white !important; }
.examen-content {
  background: white;
  padding: 24px;
  font-family: 'Times New Roman', serif;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.4;
}

.examen-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #333;
  margin-bottom: 16px;
}

.tipo-section { margin-left: auto; }
.tipo-box {
  border: 2px solid #333;
  padding: 8px 16px;
  font-size: 18px;
  font-weight: bold;
}

.datos-estudiante {
  padding: 12px;
  border: 1px solid #ccc;
  margin-bottom: 16px;
  background: #fafafa;
}

.field-line { 
  display: flex; 
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
}
.field-line .label { font-weight: bold; }
.field-line .line { border-bottom: 1px solid #333; flex: 1; }

.instrucciones {
  padding: 12px;
  background: #f0f0f0;
  border: 1px solid #ccc;
  margin-bottom: 20px;
  font-size: 12px;
}

.preguntas-container {
  column-count: 2;
  column-gap: 24px;
}

.pregunta-item {
  break-inside: avoid;
  margin-bottom: 16px;
  padding: 8px;
  border: 1px solid #eee;
  background: #fafafa;
}

.pregunta-header {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.pregunta-num {
  font-weight: bold;
  min-width: 24px;
}

.pregunta-texto {
  text-align: justify;
}

.opciones-list {
  padding-left: 24px;
}

.opcion-item {
  display: flex;
  gap: 8px;
  margin: 4px 0;
  font-size: 11px;
}

.opcion-letra {
  font-weight: bold;
  min-width: 16px;
}

.examen-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #ccc;
  text-align: center;
}

.footer-line {
  font-weight: bold;
  font-size: 14px;
}

.footer-note {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}
</style>
