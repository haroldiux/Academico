<template>
  <q-page class="q-pa-md gestion-page">
    <!-- ═══════════════════════════════════════
         HEADER
    ═══════════════════════════════════════ -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="row items-center no-wrap q-gutter-sm">
          <q-icon name="grid_view" size="28px" color="primary" />
          <div>
            <div class="text-h6 text-weight-bold" style="line-height: 1.2">Gestión Académica</div>
            <div class="text-caption text-grey-6">Edición local completa · sin sincronización</div>
          </div>
        </div>
      </div>
      <div class="col-auto row q-gutter-xs">
        <q-btn
          flat
          dense
          icon="meeting_room"
          label="Aulas"
          color="grey-7"
          size="sm"
          @click="abrirGestorAulas"
        />
        <q-btn
          flat
          dense
          icon="person_add"
          label="Nuevo docente"
          color="grey-7"
          size="sm"
          @click="abrirDialogo('docente', null)"
        />
        <q-btn
          flat
          dense
          icon="refresh"
          color="grey-7"
          size="sm"
          :loading="cargando"
          @click="recargar"
        />
        <q-btn
          color="primary"
          icon="add"
          label="Nueva asignatura"
          size="sm"
          @click="abrirDialogo('asignatura', null)"
        />
        <q-btn
          flat
          dense
          icon="playlist_add"
          label="Asignar materias"
          color="secondary"
          size="sm"
          :disable="!filtCarrera"
          @click="abrirDlgAsignarMaterias"
        />
      </div>
    </div>

    <!-- ═══════════════════════════════════════
         FILTROS CASCADA
    ═══════════════════════════════════════ -->
    <q-card flat bordered class="q-mb-md filtros-card">
      <q-card-section class="q-py-sm">
        <div class="row q-col-gutter-sm items-end">
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filtSede"
              :options="opcionesSedes"
              label="Sede"
              outlined
              dense
              clearable
              emit-value
              map-options
              @update:model-value="onCambioSede"
            >
              <template #prepend
                ><q-icon name="location_city" size="18px" color="grey-6"
              /></template>
            </q-select>
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filtCarrera"
              :options="opcionesCarreras"
              label="Carrera"
              outlined
              dense
              clearable
              emit-value
              map-options
              :disable="!filtSede"
              @update:model-value="cargarDatos"
            >
              <template #prepend><q-icon name="school" size="18px" color="grey-6" /></template>
            </q-select>
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filtPlan"
              :options="[
                { label: 'Malla Nueva (N)', value: 'N' },
                { label: 'Malla Antigua (A)', value: 'A' },
              ]"
              label="Plan de Malla"
              outlined
              dense
              clearable
              emit-value
              map-options
            >
              <template #prepend
                ><q-icon name="account_tree" size="18px" color="grey-6"
              /></template>
            </q-select>
          </div>
          <div class="col-12 col-sm-3">
            <q-input
              v-model="filtTexto"
              outlined
              dense
              clearable
              placeholder="Buscar materia, docente..."
            >
              <template #prepend><q-icon name="search" size="18px" color="grey-6" /></template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- ═══════════════════════════════════════
         TABLA PRINCIPAL
    ═══════════════════════════════════════ -->
    <div v-if="cargando" class="column items-center q-py-xl">
      <q-spinner-dots color="primary" size="40px" />
      <div class="q-mt-sm text-grey-6">Cargando datos...</div>
    </div>

    <div v-else-if="asignaturasFiltradas.length === 0" class="column items-center q-py-xl">
      <q-icon name="school" size="56px" color="grey-4" />
      <div class="q-mt-sm text-grey-6 text-body2">
        {{
          filtSede
            ? 'No se encontraron asignaturas con los filtros actuales'
            : 'Selecciona una sede para comenzar'
        }}
      </div>
    </div>

    <div v-else>
      <!-- Contador -->
      <div class="row items-center q-mb-sm q-gutter-sm">
        <q-chip size="sm" color="primary" text-color="white" dense>
          {{ asignaturasFiltradas.length }} asignaturas
        </q-chip>
        <q-chip size="sm" color="teal" text-color="white" dense> {{ totalGrupos }} grupos </q-chip>
        <q-chip size="sm" color="orange-7" text-color="white" dense>
          {{ totalHorarios }} horarios
        </q-chip>
        <q-space />
        <q-btn
          flat
          dense
          size="xs"
          :label="todoExpandido ? 'Colapsar todo' : 'Expandir todo'"
          :icon="todoExpandido ? 'unfold_less' : 'unfold_more'"
          color="grey-6"
          @click="toggleTodo"
        />
      </div>

      <!-- Tarjetas de asignaturas -->
      <div v-for="asig in asignaturasFiltradas" :key="asig.id" class="asig-card q-mb-sm">
        <!-- Cabecera de asignatura -->
        <div
          class="asig-header row items-center no-wrap"
          :class="expandidas.has(asig.id) ? 'asig-header--open' : ''"
          @click="toggleAsig(asig.id)"
        >
          <q-icon
            :name="expandidas.has(asig.id) ? 'expand_more' : 'chevron_right'"
            size="20px"
            color="grey-6"
            class="q-mr-xs"
          />

          <!-- Plan badge -->
          <q-chip
            dense
            size="xs"
            class="q-mr-sm"
            :color="
              asig.plan_estudios === 'A'
                ? 'blue-3'
                : asig.plan_estudios === 'N'
                  ? 'orange-3'
                  : 'grey-3'
            "
            :text-color="
              asig.plan_estudios === 'A'
                ? 'blue-9'
                : asig.plan_estudios === 'N'
                  ? 'orange-9'
                  : 'grey-7'
            "
          >
            {{
              asig.plan_estudios === 'A'
                ? 'Antigua'
                : asig.plan_estudios === 'N'
                  ? 'Nueva'
                  : 'Sin malla'
            }}
          </q-chip>

          <code class="text-caption text-grey-7 q-mr-sm" style="min-width: 70px">{{
            asig.codigo
          }}</code>
          <span class="text-weight-medium col ellipsis">{{ asig.nombre }}</span>

          <div class="row items-center no-wrap q-gutter-xs q-ml-sm" @click.stop>
            <q-chip dense size="xs" color="grey-2" text-color="grey-7">
              {{ asig.grupos?.length || 0 }} grupos
            </q-chip>
            <q-btn
              flat
              dense
              round
              icon="edit"
              size="xs"
              color="primary"
              @click="abrirDialogo('asignatura', asig)"
            >
              <q-tooltip>Editar asignatura</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="add_circle"
              size="xs"
              color="teal"
              @click="
                abrirDialogo('grupo', null, {
                  asignaturaId: asig.id,
                  asignaturaNombre: asig.nombre,
                })
              "
            >
              <q-tooltip>Agregar grupo</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="sync"
              size="xs"
              color="orange"
              :loading="cargandoSync === asig.id"
              @click="sincronizarAsignatura(asig)"
            >
              <q-tooltip>Sincronizar materia desde API</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="delete"
              size="xs"
              color="negative"
              @click="confirmarEliminar('asignatura', asig)"
            >
              <q-tooltip>Eliminar asignatura</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Grupos expandidos -->
        <transition name="expand">
          <div v-if="expandidas.has(asig.id)" class="asig-body">
            <div
              v-if="!asig.grupos || asig.grupos.length === 0"
              class="text-grey-5 text-caption q-pa-sm q-ml-lg"
            >
              Sin grupos — usa el botón + para agregar uno
            </div>

            <div v-else>
              <!-- Cabecera de columnas -->
              <div class="grupo-cols-header row items-center text-caption text-grey-6">
                <div style="width: 32px"></div>
                <div class="col-2">GRUPO / TIPO</div>
                <div class="col-3">DOCENTE</div>
                <div class="col-1 text-center">DÍA</div>
                <div class="col-2 text-center">HORARIO</div>
                <div class="col-2">AULA</div>
                <div class="col-1 text-center">MALLA</div>
                <div style="width: 80px"></div>
              </div>

              <div v-for="grupo in asig.grupos" :key="grupo.id">
                <!-- Fila del grupo (primera línea = primer horario o vacío) -->
                <div
                  v-for="(linea, li) in grupoLineas(grupo)"
                  :key="li"
                  class="grupo-fila row items-center no-wrap"
                  :class="li === 0 ? 'grupo-fila--first' : 'grupo-fila--extra'"
                >
                  <!-- Indent -->
                  <div style="width: 32px" class="row justify-center">
                    <q-icon
                      v-if="li === 0"
                      name="subdirectory_arrow_right"
                      size="14px"
                      color="grey-4"
                    />
                  </div>

                  <!-- GRUPO / TIPO (solo en primera línea del grupo) -->
                  <div class="col-2" v-if="li === 0">
                    <div class="row items-center no-wrap q-gutter-xs">
                      <q-chip
                        dense
                        size="sm"
                        outline
                        :color="tipoColor(grupo.tipo).border"
                        :text-color="tipoColor(grupo.tipo).text"
                      >
                        {{ grupo.nombre }}
                      </q-chip>
                      <q-chip
                        dense
                        size="xs"
                        :color="tipoColor(grupo.tipo).bg"
                        :text-color="tipoColor(grupo.tipo).text"
                      >
                        {{ tipoLabel(grupo.tipo) }}
                      </q-chip>
                    </div>
                  </div>
                  <div class="col-2" v-else></div>

                  <!-- DOCENTE (solo primera línea) -->
                  <div class="col-3" v-if="li === 0">
                    <div v-if="grupo.docente_nombre" class="row items-center no-wrap q-gutter-xs">
                      <q-avatar size="18px" color="grey-3">
                        <q-icon name="person" size="12px" color="grey-7" />
                      </q-avatar>
                      <span
                        class="text-caption ellipsis"
                        style="max-width: 160px"
                        :title="grupo.docente_nombre"
                        >{{ grupo.docente_nombre }}</span
                      >
                    </div>
                    <span v-else class="text-caption text-grey-4 text-italic">Sin docente</span>
                  </div>
                  <div class="col-3" v-else></div>

                  <!-- DÍA -->
                  <div class="col-1 text-center">
                    <q-chip
                      v-if="linea.horario"
                      dense
                      size="xs"
                      :color="diaColor(linea.horario.dia)"
                      :text-color="diaTextColor(linea.horario.dia)"
                    >
                      {{ diaCorto(linea.horario.dia) }}
                    </q-chip>
                    <span v-else class="text-grey-4 text-caption">—</span>
                  </div>

                  <!-- HORARIO -->
                  <div class="col-2 text-center">
                    <span v-if="linea.horario" class="text-caption text-weight-medium">
                      {{ linea.horario.hora_inicio?.substring(0, 5) }} –
                      {{ linea.horario.hora_fin?.substring(0, 5) }}
                    </span>
                    <span v-else class="text-grey-4 text-caption">—</span>
                  </div>

                  <!-- AULA -->
                  <div class="col-2">
                    <div v-if="linea.horario?.aula" class="row items-center no-wrap q-gutter-xs">
                      <q-icon name="door_front" size="13px" color="grey-6" />
                      <span class="text-caption">{{ linea.horario.aula.nombre }}</span>
                      <q-badge color="grey-3" text-color="grey-7" outline class="text-caption">
                        {{ linea.horario.aula.bloque?.nombre }}
                      </q-badge>
                    </div>
                    <span v-else class="text-grey-4 text-caption">—</span>
                  </div>

                  <!-- MALLA GRUPO (solo primera línea) -->
                  <div class="col-1 text-center" v-if="li === 0">
                    <q-chip
                      dense
                      size="xs"
                      :color="
                        grupo.plan_estudios === 'A'
                          ? 'blue-2'
                          : grupo.plan_estudios === 'N'
                            ? 'orange-2'
                            : 'grey-2'
                      "
                      :text-color="
                        grupo.plan_estudios === 'A'
                          ? 'blue-9'
                          : grupo.plan_estudios === 'N'
                            ? 'orange-9'
                            : 'grey-6'
                      "
                    >
                      {{ grupo.plan_estudios || '—' }}
                    </q-chip>
                  </div>
                  <div class="col-1" v-else></div>

                  <!-- ACCIONES -->
                  <div
                    style="width: 80px"
                    class="row items-center justify-end no-wrap q-gutter-xs"
                    @click.stop
                  >
                    <!-- Editar horario existente -->
                    <q-btn
                      v-if="linea.horario"
                      flat
                      dense
                      round
                      icon="schedule"
                      size="xs"
                      color="primary"
                      @click="
                        abrirDialogo('horario', linea.horario, {
                          grupoId: grupo.id,
                          grupoNombre: grupo.nombre,
                          asignaturaNombre: asig.nombre,
                        })
                      "
                    >
                      <q-tooltip>Editar horario</q-tooltip>
                    </q-btn>
                    <!-- Agregar horario (solo en última línea del grupo) -->
                    <q-btn
                      v-if="li === grupoLineas(grupo).length - 1"
                      flat
                      dense
                      round
                      icon="add_alarm"
                      size="xs"
                      color="teal"
                      @click="
                        abrirDialogo('horario', null, {
                          grupoId: grupo.id,
                          grupoNombre: grupo.nombre,
                          asignaturaNombre: asig.nombre,
                        })
                      "
                    >
                      <q-tooltip>Agregar horario</q-tooltip>
                    </q-btn>
                    <!-- Eliminar horario -->
                    <q-btn
                      v-if="linea.horario"
                      flat
                      dense
                      round
                      icon="remove_circle_outline"
                      size="xs"
                      color="red-4"
                      @click="confirmarEliminar('horario', linea.horario)"
                    >
                      <q-tooltip>Eliminar horario</q-tooltip>
                    </q-btn>
                    <!-- Editar grupo (solo primera línea) -->
                    <q-btn
                      v-if="li === 0"
                      flat
                      dense
                      round
                      icon="edit"
                      size="xs"
                      color="grey-6"
                      @click="
                        abrirDialogo('grupo', grupo, {
                          asignaturaId: asig.id,
                          asignaturaNombre: asig.nombre,
                        })
                      "
                    >
                      <q-tooltip>Editar grupo</q-tooltip>
                    </q-btn>
                    <!-- Eliminar grupo (solo primera línea) -->
                    <q-btn
                      v-if="li === 0"
                      flat
                      dense
                      round
                      icon="delete"
                      size="xs"
                      color="red-3"
                      @click="confirmarEliminar('grupo', grupo)"
                    >
                      <q-tooltip>Eliminar grupo</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botón agregar grupo -->
            <div class="row q-ml-lg q-mt-xs q-mb-xs">
              <q-btn
                flat
                dense
                size="sm"
                icon="add"
                label="Agregar grupo"
                color="teal"
                no-caps
                @click="
                  abrirDialogo('grupo', null, {
                    asignaturaId: asig.id,
                    asignaturaNombre: asig.nombre,
                  })
                "
              />
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- ═══════════════════════════════════════
         DIÁLOGOS
    ═══════════════════════════════════════ -->

    <!-- ── Diálogo: Asignatura ── -->
    <q-dialog v-model="dlg.asignatura" persistent>
      <q-card style="width: 700px; max-width: 96vw">
        <q-card-section class="bg-primary text-white row items-center q-py-sm">
          <q-icon :name="dlgAsig.id ? 'edit' : 'add'" class="q-mr-sm" />
          <span class="text-subtitle1 text-weight-bold">
            {{ dlgAsig.id ? 'Editar Asignatura' : 'Nueva Asignatura' }}
          </span>
        </q-card-section>
        <q-card-section class="q-pt-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              <q-input
                v-model="dlgAsig.codigo"
                label="Código *"
                outlined
                dense
                :disable="!!dlgAsig.id"
                :hint="dlgAsig.id ? 'No editable' : ''"
                :rules="[(v) => !!v || 'Obligatorio']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="dlgAsig.nombre"
                label="Nombre *"
                outlined
                dense
                :rules="[(v) => !!v || 'Obligatorio']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="dlgAsig.sigla" label="Sigla" outlined dense clearable />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="dlgAsig.plan_estudios"
                :options="[
                  { label: 'Nueva (N) — Plan vigente', value: 'N' },
                  { label: 'Antigua (A) — Plan anterior', value: 'A' },
                ]"
                label="Plan de Malla"
                outlined
                dense
                clearable
                emit-value
                map-options
              >
                <template #prepend>
                  <q-icon
                    :name="dlgAsig.plan_estudios === 'A' ? 'history' : 'new_releases'"
                    :color="dlgAsig.plan_estudios === 'A' ? 'blue-7' : 'orange-7'"
                    size="18px"
                  />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="dlgAsig.estado"
                :options="[
                  { label: 'En Proceso', value: 'EN_PROCESO' },
                  { label: 'Activo', value: 'ACTIVO' },
                  { label: 'Inactivo', value: 'INACTIVO' },
                ]"
                label="Estado"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="dlgAsig.modalidad"
                :options="[
                  { label: 'Presencial', value: 'PRESENCIAL' },
                  { label: 'Semi-presencial', value: 'SEMI_PRESENCIAL' },
                  { label: 'Virtual', value: 'VIRTUAL' },
                ]"
                label="Modalidad"
                outlined
                dense
                clearable
                emit-value
                map-options
              />
            </div>
            <div class="col-4 col-md-2">
              <q-input
                v-model.number="dlgAsig.creditos"
                label="Créd."
                type="number"
                min="0"
                outlined
                dense
              />
            </div>
            <div class="col-4 col-md-2">
              <q-input
                v-model.number="dlgAsig.horas_teoricas"
                label="H.Teóricas"
                type="number"
                min="0"
                outlined
                dense
              />
            </div>
            <div class="col-4 col-md-2">
              <q-input
                v-model.number="dlgAsig.horas_practicas"
                label="H.Prácticas"
                type="number"
                min="0"
                outlined
                dense
              />
            </div>
            <div class="col-4 col-md-2">
              <q-input
                v-model.number="dlgAsig.horas_laboratorio"
                label="H.Lab."
                type="number"
                min="0"
                outlined
                dense
              />
            </div>
            <div class="col-4 col-md-2">
              <q-input
                v-model.number="dlgAsig.sesiones_semanales"
                label="Ses./Sem."
                type="number"
                min="0"
                outlined
                dense
              />
            </div>
            <div class="col-4 col-md-2">
              <q-input
                v-model.number="dlgAsig.carga_horaria_total"
                label="Total horas"
                type="number"
                min="0"
                outlined
                dense
              />
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            :color="dlgAsig.id ? 'primary' : 'positive'"
            :icon="dlgAsig.id ? 'save' : 'add'"
            :label="dlgAsig.id ? 'Guardar cambios' : 'Crear Asignatura'"
            :loading="guardando"
            @click="guardarAsignatura"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Diálogo: Grupo ── -->
    <q-dialog v-model="dlg.grupo" persistent>
      <q-card style="width: 680px; max-width: 96vw">
        <q-card-section class="bg-teal text-white row items-center q-py-sm">
          <q-icon :name="dlgGrupo.id ? 'edit' : 'add'" class="q-mr-sm" />
          <span class="text-subtitle1 text-weight-bold">
            {{ dlgGrupo.id ? 'Editar Grupo' : 'Nuevo Grupo' }}
          </span>
          <span class="q-ml-sm text-caption opacity-80">— {{ dlgGrupo._asignaturaNombre }}</span>
        </q-card-section>
        <q-card-section class="q-pt-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              <q-input
                v-model="dlgGrupo.nombre"
                label="Nombre del grupo *"
                outlined
                dense
                placeholder="A, B, 1, 2..."
                hint="Letra o número que identifica al grupo"
                :rules="[(v) => !!v || 'Obligatorio']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="dlgGrupo.tipo"
                :options="[
                  { label: 'Teórico', value: 'TEORICO' },
                  { label: 'Práctico', value: 'PRACTICO' },
                  { label: 'Laboratorio', value: 'LABORATORIO' },
                ]"
                label="Tipo *"
                outlined
                dense
                emit-value
                map-options
                :rules="[(v) => !!v || 'Obligatorio']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="dlgGrupo.turno"
                :options="[
                  { label: 'Mañana', value: 'MANANA' },
                  { label: 'Tarde', value: 'TARDE' },
                  { label: 'Noche', value: 'NOCHE' },
                ]"
                label="Turno"
                outlined
                dense
                clearable
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="dlgGrupo.estado"
                :options="[
                  { label: 'Activo', value: 'ACTIVO' },
                  { label: 'Inactivo', value: 'INACTIVO' },
                  { label: 'Suspendido', value: 'SUSPENDIDO' },
                ]"
                label="Estado"
                outlined
                dense
                emit-value
                map-options
              />
            </div>

            <!-- Docente — clearable para quitar -->
            <div class="col-12">
              <q-select
                v-model="dlgGrupo.docente_id"
                :options="opcionesDocentes"
                label="Docente (opcional — clearable para quitar)"
                outlined
                dense
                clearable
                map-options
                emit-value
                option-value="id"
                option-label="nombre_completo"
                use-input
                input-debounce="200"
                @filter="filtrarDocentes"
              >
                <template #prepend><q-icon name="person" size="18px" /></template>
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.nombre_completo }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template #no-option>
                  <q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item>
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-4">
              <q-select
                v-model="dlgGrupo.plan_estudios"
                :options="[
                  { label: 'Nueva (N)', value: 'N' },
                  { label: 'Antigua (A)', value: 'A' },
                ]"
                label="Plan de Malla"
                outlined
                dense
                clearable
                emit-value
                map-options
              >
                <template #prepend>
                  <q-icon
                    :name="dlgGrupo.plan_estudios === 'A' ? 'history' : 'new_releases'"
                    :color="dlgGrupo.plan_estudios === 'A' ? 'blue-7' : 'orange-7'"
                    size="18px"
                  />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="dlgGrupo.gestion"
                label="Gestión *"
                outlined
                dense
                placeholder="1-2026"
                :rules="[(v) => !!v || 'Obligatorio']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="dlgGrupo.id_horario_api"
                label="ID API externo"
                type="number"
                outlined
                dense
                clearable
                hint="Opcional"
              />
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            :color="dlgGrupo.id ? 'teal' : 'positive'"
            :icon="dlgGrupo.id ? 'save' : 'add'"
            :label="dlgGrupo.id ? 'Guardar cambios' : 'Crear Grupo'"
            :loading="guardando"
            @click="guardarGrupo"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Diálogo: Horario ── -->
    <q-dialog v-model="dlg.horario" persistent>
      <q-card style="width: 580px; max-width: 96vw">
        <q-card-section class="bg-orange-8 text-white row items-center q-py-sm">
          <q-icon :name="dlgHorario.id ? 'edit' : 'add'" class="q-mr-sm" />
          <span class="text-subtitle1 text-weight-bold">
            {{ dlgHorario.id ? 'Editar Horario' : 'Nuevo Horario' }}
          </span>
          <span class="q-ml-sm text-caption opacity-80">
            — {{ dlgHorario._asignaturaNombre }} / Grupo {{ dlgHorario._grupoNombre }}
          </span>
        </q-card-section>
        <q-card-section class="q-pt-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-select
                v-model="dlgHorario.dia"
                :options="[
                  { label: 'Lunes', value: 'LUNES' },
                  { label: 'Martes', value: 'MARTES' },
                  { label: 'Miércoles', value: 'MIERCOLES' },
                  { label: 'Jueves', value: 'JUEVES' },
                  { label: 'Viernes', value: 'VIERNES' },
                  { label: 'Sábado', value: 'SABADO' },
                  { label: 'Domingo', value: 'DOMINGO' },
                ]"
                label="Día *"
                outlined
                dense
                emit-value
                map-options
                :rules="[(v) => !!v || 'Obligatorio']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="dlgHorario.hora_inicio"
                label="Hora inicio *"
                type="time"
                outlined
                dense
                :rules="[(v) => !!v || 'Obligatorio']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="dlgHorario.hora_fin"
                label="Hora fin *"
                type="time"
                outlined
                dense
                :rules="[(v) => !!v || 'Obligatorio']"
              />
            </div>

            <!-- Aula — clearable para quitar -->
            <div class="col-12">
              <q-select
                v-model="dlgHorario.aula_id"
                :options="opcionesAulas"
                label="Aula (opcional — clearable para quitar)"
                outlined
                dense
                clearable
                map-options
                emit-value
                option-value="id"
                option-label="label"
                use-input
                input-debounce="200"
                @filter="filtrarAulas"
              >
                <template #prepend><q-icon name="door_front" size="18px" /></template>
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.detalle }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template #no-option>
                  <q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item>
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model.number="dlgHorario.id_horario_api"
                label="ID API externo"
                type="number"
                outlined
                dense
                clearable
                hint="Opcional"
              />
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            :color="dlgHorario.id ? 'orange-8' : 'positive'"
            :icon="dlgHorario.id ? 'save' : 'add'"
            :label="dlgHorario.id ? 'Guardar cambios' : 'Crear Horario'"
            :loading="guardando"
            @click="guardarHorario"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Diálogo: Gestión de Aulas ── -->
    <q-dialog v-model="dlg.aulas" full-width>
      <q-card style="max-width: 1000px; width: 100%">
        <q-card-section class="bg-grey-8 text-white row items-center q-py-sm">
          <q-icon name="meeting_room" class="q-mr-sm" />
          <span class="text-subtitle1 text-weight-bold">Gestión de Aulas y Bloques</span>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <!-- Panel izquierdo: Bloques -->
            <div class="col-12 col-md-5">
              <div class="row items-center q-mb-sm">
                <span class="text-weight-bold text-subtitle2">Bloques</span>
                <q-space />
                <q-btn
                  flat
                  dense
                  icon="add"
                  size="sm"
                  color="primary"
                  label="Nuevo bloque"
                  @click="abrirDialogoBloques(null)"
                />
              </div>

              <q-list bordered separator class="rounded-borders">
                <q-item v-if="bloquesStore.bloques.length === 0" class="text-grey-5 text-caption">
                  Sin bloques
                </q-item>
                <q-item
                  v-for="bloque in bloquesFiltradosPorSede"
                  :key="bloque.id"
                  :active="bloqueSeleccionado?.id === bloque.id"
                  active-class="bg-blue-1"
                  clickable
                  @click="bloqueSeleccionado = bloque"
                >
                  <q-item-section>
                    <q-item-label>{{ bloque.nombre }}</q-item-label>
                    <q-item-label caption
                      >{{ bloque.sede?.nombre }} ·
                      {{ bloque.aulas?.length || 0 }} aulas</q-item-label
                    >
                  </q-item-section>
                  <q-item-section side>
                    <div class="row no-wrap q-gutter-xs">
                      <q-btn
                        flat
                        dense
                        round
                        icon="edit"
                        size="xs"
                        color="primary"
                        @click.stop="abrirDialogoBloques(bloque)"
                      />
                      <q-btn
                        flat
                        dense
                        round
                        icon="delete"
                        size="xs"
                        color="negative"
                        @click.stop="confirmarEliminar('bloque', bloque)"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Panel derecho: Aulas del bloque seleccionado -->
            <div class="col-12 col-md-7">
              <div class="row items-center q-mb-sm">
                <span class="text-weight-bold text-subtitle2">
                  Aulas {{ bloqueSeleccionado ? `— ${bloqueSeleccionado.nombre}` : '' }}
                </span>
                <q-space />
                <q-btn
                  flat
                  dense
                  icon="add"
                  size="sm"
                  color="teal"
                  label="Nueva aula"
                  :disable="!bloqueSeleccionado"
                  @click="abrirDialogoAula(null)"
                />
              </div>

              <div v-if="!bloqueSeleccionado" class="text-grey-5 text-caption text-center q-py-lg">
                Selecciona un bloque para ver sus aulas
              </div>
              <q-table
                v-else
                :rows="aulasDelBloque"
                :columns="colsAulas"
                row-key="id"
                dense
                flat
                bordered
                :pagination="{ rowsPerPage: 20 }"
              >
                <template #body-cell-actions="props">
                  <q-td :props="props">
                    <div class="row no-wrap q-gutter-xs">
                      <q-btn
                        flat
                        dense
                        round
                        icon="edit"
                        size="xs"
                        color="primary"
                        @click="abrirDialogoAula(props.row)"
                      />
                      <q-btn
                        flat
                        dense
                        round
                        icon="delete"
                        size="xs"
                        color="negative"
                        @click="confirmarEliminar('aula', props.row)"
                      />
                    </div>
                  </q-td>
                </template>
              </q-table>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ── Diálogo: Crear/Editar Bloque ── -->
    <q-dialog v-model="dlg.bloque" persistent>
      <q-card style="width: 400px; max-width: 96vw">
        <q-card-section class="bg-grey-7 text-white q-py-sm">
          <span class="text-subtitle1 text-weight-bold">
            {{ dlgBloque.id ? 'Editar Bloque' : 'Nuevo Bloque' }}
          </span>
        </q-card-section>
        <q-card-section class="q-pt-md">
          <div class="q-gutter-md">
            <q-input
              v-model="dlgBloque.nombre"
              label="Nombre del bloque *"
              outlined
              dense
              placeholder="Ej: COLONIAL, FLORIDA NORTE..."
              :rules="[(v) => !!v || 'Obligatorio']"
            />
            <q-select
              v-model="dlgBloque.sede_id"
              :options="opcionesSedes"
              label="Sede *"
              outlined
              dense
              emit-value
              map-options
              :rules="[(v) => !!v || 'Obligatorio']"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="grey-7"
            :label="dlgBloque.id ? 'Guardar' : 'Crear'"
            :loading="guardando"
            @click="guardarBloque"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Diálogo: Crear/Editar Aula ── -->
    <q-dialog v-model="dlg.aula" persistent>
      <q-card style="width: 420px; max-width: 96vw">
        <q-card-section class="bg-teal-8 text-white q-py-sm">
          <span class="text-subtitle1 text-weight-bold">
            {{ dlgAula.id ? 'Editar Aula' : 'Nueva Aula' }}
          </span>
          <span v-if="bloqueSeleccionado" class="q-ml-sm text-caption opacity-80">
            — {{ bloqueSeleccionado.nombre }}
          </span>
        </q-card-section>
        <q-card-section class="q-pt-md">
          <div class="q-gutter-md">
            <q-input
              v-model="dlgAula.nombre"
              label="Nombre del aula *"
              outlined
              dense
              placeholder="Ej: 101-A, Lab-2..."
              :rules="[(v) => !!v || 'Obligatorio']"
            />
            <q-select
              v-model="dlgAula.bloque_id"
              :options="opcionesBloques"
              label="Bloque *"
              outlined
              dense
              emit-value
              map-options
              :rules="[(v) => !!v || 'Obligatorio']"
            />
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model.number="dlgAula.capacidad"
                  label="Capacidad (personas)"
                  type="number"
                  min="0"
                  outlined
                  dense
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model.number="dlgAula.pupitres"
                  label="Pupitres"
                  type="number"
                  min="0"
                  outlined
                  dense
                />
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="teal-8"
            :label="dlgAula.id ? 'Guardar' : 'Crear'"
            :loading="guardando"
            @click="guardarAula"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Diálogo: Docente ── -->
    <q-dialog v-model="dlg.docente" persistent>
      <q-card style="width: 520px; max-width: 96vw">
        <q-card-section class="bg-indigo text-white row items-center q-py-sm">
          <q-icon name="person_add" class="q-mr-sm" />
          <span class="text-subtitle1 text-weight-bold">Nuevo Docente</span>
        </q-card-section>
        <q-card-section class="q-pt-md">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="dlgDocente.nombre_completo"
                label="Nombre completo *"
                outlined
                dense
                :rules="[(v) => !!v || 'Obligatorio']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="dlgDocente.ci"
                label="CI *"
                outlined
                dense
                :rules="[(v) => !!v || 'Obligatorio']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="dlgDocente.email" label="Email" outlined dense type="email" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="dlgDocente.celular" label="Celular" outlined dense />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="dlgDocente.grado_academico"
                label="Grado académico"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="dlgDocente.especialidad" label="Especialidad" outlined dense />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="dlgDocente.sede_id"
                :options="opcionesSedes"
                label="Sede"
                outlined
                dense
                clearable
                emit-value
                map-options
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="indigo"
            icon="save"
            label="Crear Docente"
            :loading="guardando"
            @click="guardarDocente"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Diálogo: Confirmar eliminación ── -->
    <q-dialog v-model="dlg.eliminar" persistent>
      <q-card style="min-width: 360px">
        <q-card-section class="bg-negative text-white q-py-sm">
          <div class="row items-center">
            <q-icon name="warning" class="q-mr-sm" />
            <span class="text-subtitle1 text-weight-bold">Confirmar eliminación</span>
          </div>
        </q-card-section>
        <q-card-section class="q-pt-md">
          <p>{{ eliminarMensaje }}</p>
          <small class="text-grey-6">Esta acción no se puede deshacer.</small>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="negative" label="Eliminar" :loading="guardando" @click="ejecutarEliminar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Diálogo: Asignar Materias Faltantes ── -->
    <q-dialog v-model="dlg.asignarMaterias" persistent>
      <q-card style="min-width: 800px; max-width: 90vw">
        <q-card-section class="bg-secondary text-white row items-center q-py-sm">
          <q-icon name="playlist_add" class="q-mr-sm" />
          <span class="text-subtitle1 text-weight-bold">Asignar Materias a Carrera</span>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="dlgAsignar.sede_id"
                :options="opcionesSedes"
                label="Sede destino *"
                outlined
                dense
                clearable
                emit-value
                map-options
                :rules="[(v) => !!v || 'Obligatorio']"
              >
                <template #prepend><q-icon name="location_city" size="18px" /></template>
              </q-select>
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                v-model="dlgAsignar.semestre"
                :options="semestresOptions"
                label="Semestre *"
                outlined
                dense
                emit-value
                map-options
                :rules="[(v) => !!v || 'Obligatorio']"
              >
                <template #prepend><q-icon name="filter_1" size="18px" /></template>
              </q-select>
            </div>
          </div>

          <q-tabs
            v-model="dlgAsignar.tabMalla"
            class="text-primary"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="N" label="Malla Nueva" />
            <q-tab name="A" label="Malla Antigua" />
          </q-tabs>

          <q-separator />

          <div v-if="cargandoMaster" class="column items-center q-py-lg">
            <q-spinner-dots color="primary" size="40px" />
            <div class="q-mt-sm text-grey-6">Cargando materias...</div>
          </div>

          <div v-else-if="materiasParaAsignar.length === 0" class="text-grey-5 text-center q-py-lg">
            No hay materias disponibles para esta malla en esta carrera.
          </div>

          <div v-else class="q-mt-sm" style="max-height: 400px; overflow-y: auto">
            <div v-for="sem in semestresAgrupados" :key="sem" class="q-mb-md">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs q-pl-sm">
                SEMESTRE {{ sem }}
              </div>
              <q-list dense bordered separator class="rounded-borders">
                <q-item v-for="materia in getMateriasPorSemestre(sem)" :key="materia.asignatura_id">
                  <q-item-section avatar>
                    <q-checkbox
                      v-model="dlgAsignar.seleccionados"
                      :val="materia.asignatura_id"
                      :disable="materia.ya_asignada_en_sede_actual"
                      color="primary"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      <code class="text-grey-7 q-mr-sm">{{ materia.codigo }}</code>
                      {{ materia.nombre }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ materia.creditos || 0 }} créditos
                      <span v-if="materia.asignada_en_sedes && materia.asignada_en_sedes.length > 0">
                        — Ya en:
                        <span
                          v-for="(s, idx) in materia.asignada_en_sedes"
                          :key="s.sede_id"
                          class="text-primary"
                        >
                          {{ s.sede_nombre }}{{ idx < materia.asignada_en_sedes.length - 1 ? ', ' : '' }}
                        </span>
                      </span>
                      <span v-if="materia.ya_asignada_en_sede_actual" class="text-positive q-ml-sm">
                        ✓ Ya asignada aquí
                      </span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="secondary"
            icon="check"
            :label="`Asignar Seleccionadas (${dlgAsignar.seleccionados.length})`"
            :loading="guardando"
            :disable="dlgAsignar.seleccionados.length === 0 || !dlgAsignar.sede_id || !dlgAsignar.semestre"
            @click="asignarMateriasSeleccionadas"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useSedesStore } from 'src/stores/sedes'
import { useCarrerasStore } from 'src/stores/carreras'
import { useAulasStore } from 'src/stores/aulas'
import { useBloquesStore } from 'src/stores/bloques'
import { useAsignaturasStore } from 'src/stores/asignaturas'
import { useHorariosStore } from 'src/stores/horarios'
import cargaAcademicaService from 'src/services/cargaAcademicaService'
import { Notify } from 'quasar'

// ── Stores ──
const sedesStore = useSedesStore()
const carrerasStore = useCarrerasStore()
const aulasStore = useAulasStore()
const bloquesStore = useBloquesStore()
const asignaturasStore = useAsignaturasStore()
// horariosStore se importa pero no se usa directamente (se usa la api directa)
useHorariosStore()

// ── Estado principal ──
const cargando = ref(false)
const guardando = ref(false)
const cargandoSync = ref(null)
const filtSede = ref(null)
const filtCarrera = ref(null)
const filtPlan = ref(null)
const filtTexto = ref('')
const expandidas = ref(new Set())
const todoExpandido = ref(false)
const asignaturas = ref([]) // datos enriquecidos: [{...asig, grupos:[{...grupo, horarios:[]}]}]
const docentesSimple = ref([]) // Lista ligera de docentes para selectores

// ── Filtros cascada ──
const opcionesSedes = computed(() =>
  sedesStore.sedes.map((s) => ({ label: s.nombre, value: s.id })),
)
const opcionesCarreras = computed(() => {
  if (!filtSede.value) return []
  return carrerasStore.carreras
    .filter(
      (c) =>
        c.sede_id == filtSede.value ||
        (c.sedes_ids && c.sedes_ids.includes(Number(filtSede.value))),
    )
    .map((c) => ({ label: c.nombre, value: c.id }))
})

// ── Datos filtrados ──
const asignaturasFiltradas = computed(() => {
  let list = asignaturas.value
  if (filtPlan.value) list = list.filter((a) => a.plan_estudios === filtPlan.value)
  if (filtTexto.value) {
    const n = filtTexto.value.toLowerCase()
    list = list.filter((a) => {
      if ((a.nombre || '').toLowerCase().includes(n) || (a.codigo || '').toLowerCase().includes(n))
        return true
      return a.grupos?.some(
        (g) =>
          (g.docente_nombre || '').toLowerCase().includes(n) ||
          (g.nombre || '').toLowerCase().includes(n),
      )
    })
  }
  return list
})

const totalGrupos = computed(() =>
  asignaturasFiltradas.value.reduce((s, a) => s + (a.grupos?.length || 0), 0),
)
const totalHorarios = computed(() =>
  asignaturasFiltradas.value.reduce(
    (s, a) => s + (a.grupos?.reduce((sg, g) => sg + (g.horarios?.length || 0), 0) || 0),
    0,
  ),
)

// ── Expandir / colapsar ──
function toggleAsig(id) {
  const s = new Set(expandidas.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expandidas.value = s
}
function toggleTodo() {
  todoExpandido.value = !todoExpandido.value
  if (todoExpandido.value) {
    expandidas.value = new Set(asignaturasFiltradas.value.map((a) => a.id))
  } else {
    expandidas.value = new Set()
  }
}

// ── Lineas por grupo (cada horario = una línea, mínimo 1) ──
function grupoLineas(grupo) {
  if (!grupo.horarios || grupo.horarios.length === 0) return [{ horario: null }]
  return grupo.horarios.map((h) => ({ horario: h }))
}

// ── Helpers visuales ──
function tipoColor(tipo) {
  if (tipo === 'TEORICO') return { bg: 'blue-2', text: 'blue-9', border: 'blue' }
  if (tipo === 'PRACTICO') return { bg: 'green-2', text: 'green-9', border: 'green' }
  if (tipo === 'LABORATORIO') return { bg: 'orange-2', text: 'orange-9', border: 'orange' }
  return { bg: 'grey-2', text: 'grey-7', border: 'grey' }
}
function tipoLabel(tipo) {
  return { TEORICO: 'Teórico', PRACTICO: 'Práctico', LABORATORIO: 'Lab.' }[tipo] || tipo
}
function diaCorto(dia) {
  return (
    {
      LUNES: 'Lun',
      MARTES: 'Mar',
      MIERCOLES: 'Mié',
      JUEVES: 'Jue',
      VIERNES: 'Vie',
      SABADO: 'Sáb',
      DOMINGO: 'Dom',
    }[dia] || dia
  )
}
function diaColor(dia) {
  return (
    {
      LUNES: 'blue-2',
      MARTES: 'green-2',
      MIERCOLES: 'amber-2',
      JUEVES: 'orange-2',
      VIERNES: 'red-2',
      SABADO: 'purple-2',
      DOMINGO: 'grey-3',
    }[dia] || 'grey-2'
  )
}
function diaTextColor(dia) {
  return (
    {
      LUNES: 'blue-9',
      MARTES: 'green-9',
      MIERCOLES: 'amber-10',
      JUEVES: 'orange-9',
      VIERNES: 'red-9',
      SABADO: 'purple-9',
      DOMINGO: 'grey-8',
    }[dia] || 'grey-9'
  )
}

// ══════════════════════════════════════════════
// CARGA DE DATOS
// ══════════════════════════════════════════════
onMounted(async () => {
  // Promise.allSettled: si falla alguno, los demás datos siguen cargando
  const results = await Promise.allSettled([
    sedesStore.fetchSedes(),
    carrerasStore.fetchCarreras(),
    aulasStore.fetchAulas(),
    bloquesStore.fetchBloques(),
  ])
  // Informar silenciosamente de errores parciales (sin bloquear la UI)
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      const nombres = ['sedes', 'carreras', 'aulas', 'bloques']
      console.warn(`[GestionAcademica] Error cargando ${nombres[i]}:`, r.reason)
    }
  })
  // Preseleccionar Cochabamba
  const cbba = sedesStore.sedes.find((s) => s.nombre?.toLowerCase().includes('cochabamba'))
  if (cbba) {
    filtSede.value = cbba.id
    // Cargar docentes simples filtrados por sede (endpoint ligero, sin error de memoria)
    await cargarDocentesSimple(cbba.id)
    await cargarDatos()
  } else {
    // Sin sede preseleccionada, cargar todos los docentes simples
    await cargarDocentesSimple()
  }
})

function onCambioSede() {
  filtCarrera.value = null
  asignaturas.value = []
  if (filtSede.value) cargarDatos()
}

async function cargarDatos() {
  if (!filtSede.value && !filtCarrera.value) return
  cargando.value = true
  try {
    // 1. Cargar grupos-flat con filtros
    const params = { per_page: 500 }
    if (filtSede.value) params.sede_id = filtSede.value
    if (filtCarrera.value) params.carrera_id = filtCarrera.value

    const rGrupos = await api.get('/grupos-flat', { params })
    const grupos = rGrupos.data.data || []

    // 2. Cargar horarios con filtros
    const hParams = {}
    if (filtSede.value) hParams.sede_id = filtSede.value
    if (filtCarrera.value) hParams.carrera_id = filtCarrera.value
    const rHorarios = await api.get('/horarios', { params: hParams })

    // 3. Indexar horarios por grupo_id
    const horariosPorGrupo = {}
    rHorarios.data.forEach((h) => {
      if (!horariosPorGrupo[h.grupo_id]) horariosPorGrupo[h.grupo_id] = []
      horariosPorGrupo[h.grupo_id].push(h)
    })

    // 4. Enriquecer grupos con horarios
    const gruposEnriquecidos = grupos.map((g) => ({
      ...g,
      horarios: horariosPorGrupo[g.id] || [],
    }))

    // 5. Agrupar por asignatura_id (filtrar grupos sin asignatura válida)
    const asigMap = {}
    gruposEnriquecidos
      .filter((g) => g.asignatura_id && g.asignatura_nombre) // Excluir huérfanos residuales
      .forEach((g) => {
        if (!asigMap[g.asignatura_id]) {
          asigMap[g.asignatura_id] = {
            id: g.asignatura_id,
            nombre: g.asignatura_nombre,
            codigo: g.asignatura_codigo,
            plan_estudios: g.asignatura_plan || null,
            grupos: [],
          }
        }
        asigMap[g.asignatura_id].grupos.push(g)
      })

    // 6. También cargar asignaturas asignadas a la carrera/sede que NO tengan grupos
    const aParams = { per_page: 500 }
    if (filtSede.value) aParams.sede_id = filtSede.value
    if (filtCarrera.value) aParams.carrera_id = filtCarrera.value
    try {
      const rAsignaturas = await api.get('/asignaturas', { params: aParams })
      const asignaturasSinGrupos = rAsignaturas.data || []
      asignaturasSinGrupos.forEach((a) => {
        if (!asigMap[a.id]) {
          // Solo agregar si no está ya (porque ya tiene grupos)
          asigMap[a.id] = {
            id: a.id,
            nombre: a.nombre,
            codigo: a.codigo,
            plan_estudios: a.plan_estudios || null,
            grupos: [],
            // Traer datos extra del backend para consistencia
            creditos: a.creditos,
            semestre: a.semestre,
            horas_teoricas: a.horas_teoricas,
            horas_practicas: a.horas_practicas,
            carrera_id: a.carrera_id,
            carrera_nombre: a.carrera_nombre,
            sede_id: a.sede_id,
            sede_nombre: a.sede_nombre,
          }
        }
      })
    } catch (e) {
      // Si falla, seguir con solo las que tienen grupos
      console.warn('[GestionAcademica] No se pudieron cargar asignaturas sin grupos:', e.message)
    }

    asignaturas.value = Object.values(asigMap)
      .filter((a) => a.nombre) // Descartar entradas con nombre nulo (grupos huérfanos residuales)
      .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
  } catch (err) {
    Notify.create({ type: 'negative', message: 'Error cargando datos: ' + err.message })
  } finally {
    cargando.value = false
  }
}

async function sincronizarAsignatura(asig) {
  if (!filtSede.value || !filtCarrera.value) {
    Notify.create({ type: 'warning', message: 'Selecciona sede y carrera para sincronizar' })
    return
  }
  cargandoSync.value = asig.id
  try {
    const resp = await cargaAcademicaService.syncMateria({
      sede_id: filtSede.value,
      carrera_id: filtCarrera.value,
      asignatura_id: asig.id,
      gestion: asig.grupos?.[0]?.gestion || '1-2026',
    })
    if (resp.data.ok) {
      Notify.create({ type: 'positive', message: resp.data.mensaje || 'Sincronización exitosa' })
      await cargarDatos()
      // Recargar docentes por si se crearon nuevos
      await cargarDocentesSimple(filtSede.value)
    } else {
      Notify.create({ type: 'warning', message: resp.data.mensaje || 'Sin cambios' })
    }
  } catch (err) {
    Notify.create({
      type: 'negative',
      message: 'Error sincronizando: ' + (err.response?.data?.error || err.message),
    })
  } finally {
    cargandoSync.value = null
  }
}

async function recargar() {
  await Promise.all([aulasStore.fetchAulas(), bloquesStore.fetchBloques()])
  await cargarDatos()
}

/**
 * Carga docentes desde el endpoint ligero /docentes-simple.
 * Llamada directamente a la api (no al store) para evitar problemas de cache HMR.
 */
async function cargarDocentesSimple(sedeId = null) {
  try {
    const params = sedeId ? { sede_id: sedeId } : {}
    const resp = await api.get('/docentes-simple', { params })
    const lista = Array.isArray(resp.data) ? resp.data : []
    docentesSimple.value = lista
    opcionesDocentes.value = lista
    return lista
  } catch (err) {
    console.warn('[GestionAcademica] No se pudo cargar docentes-simple:', err.message)
    return []
  }
}

// ══════════════════════════════════════════════
// OPCIONES DE SELECTS
// ══════════════════════════════════════════════
// allDocentes: lista ligera cargada desde /docentes-simple (sin relaciones pesadas)
const allDocentes = computed(() => docentesSimple.value)
const opcionesDocentes = ref([])
function filtrarDocentes(val, update) {
  update(() => {
    opcionesDocentes.value = !val
      ? allDocentes.value
      : allDocentes.value.filter((d) => d.nombre_completo.toLowerCase().includes(val.toLowerCase()))
  })
}

const allAulas = computed(() =>
  aulasStore.aulas.map((a) => ({
    id: a.id,
    label: a.nombre,
    detalle: a.bloque
      ? `${a.bloque.nombre} · ${a.bloque.sede?.nombre || ''}${a.capacidad ? ' · Cap.' + a.capacidad : ''}`
      : '',
    sede_id: a.bloque?.sede_id || a.bloque?.sede?.id,
    bloque_nombre: a.bloque?.nombre || '',
  })),
)
const opcionesAulas = ref([])
function filtrarAulas(val, update) {
  const sedeId = dlgHorario.value._sedeId || filtSede.value
  const base = sedeId ? allAulas.value.filter((a) => a.sede_id == sedeId) : allAulas.value
  update(() => {
    opcionesAulas.value = !val
      ? base
      : base.filter((a) => (a.label + a.detalle).toLowerCase().includes(val.toLowerCase()))
  })
}

const opcionesBloques = computed(() =>
  bloquesStore.bloques.map((b) => ({
    label: `${b.nombre} (${b.sede?.nombre || 'Sede ' + b.sede_id})`,
    value: b.id,
  })),
)

const bloquesFiltradosPorSede = computed(() => {
  if (!filtSede.value) return bloquesStore.bloques
  return bloquesStore.bloques.filter((b) => b.sede_id == filtSede.value)
})

// ══════════════════════════════════════════════
// ESTADO DE DIÁLOGOS
// ══════════════════════════════════════════════
const dlg = ref({
  asignatura: false,
  grupo: false,
  horario: false,
  aulas: false,
  bloque: false,
  aula: false,
  docente: false,
  eliminar: false,
  asignarMaterias: false
})

// Formularios de cada diálogo
const dlgAsig = ref({})
const dlgGrupo = ref({})
const dlgHorario = ref({})
const dlgBloque = ref({})
const dlgAula = ref({})
const dlgDocente = ref({})

// Asignar materias faltantes
const dlgAsignar = ref({
  sede_id: null,
  semestre: null,
  tabMalla: 'N',
  seleccionados: [],
  masterData: null
})
const cargandoMaster = ref(false)
const materiasMaster = ref([])

// Para eliminación
const eliminarTipo = ref('')
const eliminarItem = ref(null)
const eliminarMensaje = computed(() => {
  if (!eliminarItem.value) return ''
  const t = eliminarTipo.value
  if (t === 'asignatura')
    return `¿Eliminar la asignatura "${eliminarItem.value.nombre}"? Se eliminarán también sus grupos y horarios.`
  if (t === 'grupo')
    return `¿Eliminar el grupo "${eliminarItem.value.nombre}" (${eliminarItem.value.asignatura_nombre || ''})? Se eliminarán también sus horarios.`
  if (t === 'horario')
    return `¿Eliminar el horario del ${eliminarItem.value.dia} ${eliminarItem.value.hora_inicio}–${eliminarItem.value.hora_fin}?`
  if (t === 'aula') return `¿Eliminar el aula "${eliminarItem.value.nombre}"?`
  if (t === 'bloque')
    return `¿Eliminar el bloque "${eliminarItem.value.nombre}"? Solo se puede si no tiene aulas.`
  return ''
})

// ══════════════════════════════════════════════
// ABRIR DIÁLOGOS
// ══════════════════════════════════════════════
async function abrirDialogo(tipo, item, ctx = {}) {
  if (tipo === 'asignatura') {
    dlgAsig.value = item
      ? {
          id: item.id,
          codigo: item.codigo,
          nombre: item.nombre,
          sigla: item.sigla || '',
          plan_estudios: item.plan_estudios || null,
          estado: item.estado || 'EN_PROCESO',
          modalidad: item.modalidad || null,
          creditos: item.creditos ?? 0,
          horas_teoricas: item.horas_teoricas ?? 0,
          horas_practicas: item.horas_practicas ?? 0,
          horas_laboratorio: item.horas_laboratorio ?? 0,
          sesiones_semanales: item.sesiones_semanales ?? 0,
          carga_horaria_total: item.carga_horaria_total ?? 0,
        }
      : {
          codigo: '',
          nombre: '',
          sigla: '',
          plan_estudios: null,
          estado: 'EN_PROCESO',
          modalidad: null,
          creditos: 0,
          horas_teoricas: 0,
          horas_practicas: 0,
          horas_laboratorio: 0,
          sesiones_semanales: 0,
          carga_horaria_total: 0,
        }
    dlg.value.asignatura = true
  } else if (tipo === 'grupo') {
    opcionesDocentes.value = allDocentes.value
    // Si aún no se cargaron docentes, recargar desde endpoint ligero
    if (opcionesDocentes.value.length === 0) {
      await cargarDocentesSimple(filtSede.value || null)
    }
    dlgGrupo.value = item
      ? {
          id: item.id,
          nombre: item.nombre,
          tipo: item.tipo || 'TEORICO',
          turno: item.turno || null,
          estado: item.estado || 'ACTIVO',
          docente_id: item.docente_id ? Number(item.docente_id) : null,
          plan_estudios: item.plan_estudios || null,
          gestion: item.gestion || '1-2026',
          id_horario_api: item.id_horario_api ? Number(item.id_horario_api) : null,
          asignatura_id: item.asignatura_id || ctx.asignaturaId,
          carrera_id: item.carrera_id || filtCarrera.value || null,
          sede_id: item.sede_id || filtSede.value || null,
          _asignaturaNombre: ctx.asignaturaNombre || item.asignatura_nombre || '',
        }
      : {
          nombre: '',
          tipo: 'TEORICO',
          turno: null,
          estado: 'ACTIVO',
          docente_id: null,
          plan_estudios: null,
          gestion: '1-2026',
          id_horario_api: null,
          asignatura_id: ctx.asignaturaId,
          carrera_id: filtCarrera.value || null,
          sede_id: filtSede.value || null,
          _asignaturaNombre: ctx.asignaturaNombre || '',
        }
    dlg.value.grupo = true
  } else if (tipo === 'docente') {
    dlgDocente.value = {
      nombre_completo: '',
      ci: '',
      email: '',
      celular: '',
      grado_academico: '',
      especialidad: '',
      sede_id: filtSede.value || null,
    }
    dlg.value.docente = true
  } else if (tipo === 'horario') {
    opcionesAulas.value = allAulas.value.filter(
      (a) => !filtSede.value || a.sede_id == filtSede.value,
    )
    dlgHorario.value = item
      ? {
          id: item.id,
          dia: item.dia,
          hora_inicio: item.hora_inicio?.substring(0, 5) || '',
          hora_fin: item.hora_fin?.substring(0, 5) || '',
          aula_id: item.aula_id ? Number(item.aula_id) : null,
          id_horario_api: item.id_horario_api ? Number(item.id_horario_api) : null,
          grupo_id: item.grupo_id || ctx.grupoId,
          _grupoNombre: ctx.grupoNombre || '',
          _asignaturaNombre: ctx.asignaturaNombre || '',
          _sedeId: filtSede.value,
        }
      : {
          dia: '',
          hora_inicio: '',
          hora_fin: '',
          aula_id: null,
          id_horario_api: null,
          grupo_id: ctx.grupoId,
          _grupoNombre: ctx.grupoNombre || '',
          _asignaturaNombre: ctx.asignaturaNombre || '',
          _sedeId: filtSede.value,
        }
    dlg.value.horario = true
  }
}

function abrirGestorAulas() {
  bloqueSeleccionado.value = bloquesFiltradosPorSede.value[0] || null
  dlg.value.aulas = true
}

// ══════════════════════════════════════════════
// GUARDAR: ASIGNATURA
// ══════════════════════════════════════════════
async function guardarAsignatura() {
  const f = dlgAsig.value
  if (!f.codigo?.trim() || !f.nombre?.trim()) {
    Notify.create({ type: 'warning', message: 'Código y nombre son obligatorios' })
    return
  }
  guardando.value = true
  try {
    const payload = {
      codigo: f.codigo.trim(),
      nombre: f.nombre.trim(),
      sigla: f.sigla?.trim() || null,
      plan_estudios: f.plan_estudios || null,
      estado: f.estado || 'EN_PROCESO',
      modalidad: f.modalidad || null,
      creditos: f.creditos ?? 0,
      horas_teoricas: f.horas_teoricas ?? 0,
      horas_practicas: f.horas_practicas ?? 0,
      horas_laboratorio: f.horas_laboratorio ?? 0,
      sesiones_semanales: f.sesiones_semanales ?? 0,
      carga_horaria_total: f.carga_horaria_total ?? 0,
      modificado_localmente: true,
    }
    if (f.id) {
      await asignaturasStore.updateAsignatura(f.id, payload)
      // Si se cambió el plan, el backend puede haber fusionado duplicados → recargar todo
      if (payload.plan_estudios !== null) {
        Notify.create({
          type: 'positive',
          message:
            'Asignatura actualizada. Si había duplicados del mismo código, se fusionaron automáticamente.',
          timeout: 4000,
        })
        dlg.value.asignatura = false
        await cargarDatos()
        return
      }
      // Actualizar nombre/plan en la vista local sin recargar
      const a = asignaturas.value.find((x) => x.id === f.id)
      if (a) {
        a.nombre = payload.nombre
        a.plan_estudios = payload.plan_estudios
      }
      Notify.create({ type: 'positive', message: 'Asignatura actualizada' })
    } else {
      await asignaturasStore.createAsignatura(payload)
      Notify.create({ type: 'positive', message: 'Asignatura creada' })
      await cargarDatos()
    }
    dlg.value.asignatura = false
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      Object.values(err.response?.data?.errors || {})
        .flat()
        .join(' | ') ||
      err.message
    Notify.create({ type: 'negative', message: 'Error: ' + msg })
  } finally {
    guardando.value = false
  }
}

// ══════════════════════════════════════════════
// GUARDAR: GRUPO
// ══════════════════════════════════════════════
async function guardarGrupo() {
  const f = dlgGrupo.value
  if (!f.nombre?.trim() || !f.tipo || !f.gestion?.trim()) {
    Notify.create({ type: 'warning', message: 'Nombre, tipo y gestión son obligatorios' })
    return
  }
  // Validar conflictos si se cambió el docente y el grupo tiene horarios
  if (f.id && f.docente_id) {
    const grupo = asignaturas.value.flatMap((a) => a.grupos || []).find((g) => g.id === f.id)
    if (grupo?.horarios?.length && grupo.docente_id !== f.docente_id) {
      for (const h of grupo.horarios) {
        try {
          const v = await cargaAcademicaService.validar({
            docente_id: f.docente_id,
            aula_id: h.aula_id || null,
            dia: h.dia,
            hora_inicio: h.hora_inicio,
            hora_fin: h.hora_fin,
            exclude_horario_id: h.id,
            exclude_grupo_id: f.id,
          })
          if (!v.data.valido) {
            const msgs = v.data.conflictos.map((c) => c.mensaje).join('\n')
            Notify.create({ type: 'negative', message: msgs, multiLine: true, timeout: 5000 })
            return
          }
        } catch {
          // fallback
        }
      }
    }
  }
  guardando.value = true
  try {
    const payload = {
      nombre: f.nombre.trim(),
      asignatura_id: f.asignatura_id,
      carrera_id: f.carrera_id || filtCarrera.value || null,
      sede_id: f.sede_id || filtSede.value || null,
      tipo: f.tipo,
      turno: f.turno || null,
      estado: f.estado || 'ACTIVO',
      docente_id: f.docente_id || null,
      plan_estudios: f.plan_estudios || null,
      gestion: f.gestion.trim(),
      id_horario_api: f.id_horario_api || null,
      modificado_localmente: true,
    }
    if (f.id) {
      await api.put(`/grupos/${f.id}`, payload)
      // Actualizar vista local
      const asig = asignaturas.value.find((a) => a.grupos?.some((g) => g.id === f.id))
      if (asig) {
        const g = asig.grupos.find((g) => g.id === f.id)
        if (g) {
          Object.assign(g, {
            ...payload,
            docente_nombre: payload.docente_id
              ? allDocentes.value.find((d) => d.id === payload.docente_id)?.nombre_completo ||
                g.docente_nombre
              : null,
          })
        }
      }
      Notify.create({ type: 'positive', message: 'Grupo actualizado' })
    } else {
      const resp = await api.post('/grupos', payload)
      // Agregar a la vista sin recargar todo
      const asig = asignaturas.value.find((a) => a.id === f.asignatura_id)
      if (asig) {
        asig.grupos.push({
          ...resp.data,
          asignatura_nombre: asig.nombre,
          asignatura_codigo: asig.codigo,
          docente_nombre: payload.docente_id
            ? allDocentes.value.find((d) => d.id === payload.docente_id)?.nombre_completo || null
            : null,
          horarios: [],
        })
      } else {
        await cargarDatos()
      }
      Notify.create({ type: 'positive', message: 'Grupo creado' })
    }
    dlg.value.grupo = false
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      Object.values(err.response?.data?.errors || {})
        .flat()
        .join(' | ') ||
      err.message
    Notify.create({ type: 'negative', message: 'Error: ' + msg })
  } finally {
    guardando.value = false
  }
}

// ══════════════════════════════════════════════
// GUARDAR: HORARIO
// ══════════════════════════════════════════════
async function guardarHorario() {
  const f = dlgHorario.value
  if (!f.dia || !f.hora_inicio || !f.hora_fin) {
    Notify.create({ type: 'warning', message: 'Día y horas son obligatorios' })
    return
  }
  // Validar conflictos de horario (docente y aula)
  const grupo = asignaturas.value.flatMap((a) => a.grupos || []).find((g) => g.id === f.grupo_id)
  if (grupo?.docente_id || f.aula_id) {
    try {
      const v = await cargaAcademicaService.validar({
        docente_id: grupo?.docente_id || null,
        aula_id: f.aula_id || null,
        dia: f.dia,
        hora_inicio: f.hora_inicio,
        hora_fin: f.hora_fin,
        exclude_horario_id: f.id || null,
        exclude_grupo_id: f.grupo_id,
      })
      if (!v.data.valido) {
        const msgs = v.data.conflictos.map((c) => c.mensaje).join('\n')
        Notify.create({ type: 'negative', message: msgs, multiLine: true, timeout: 5000 })
        return
      }
    } catch {
      // Si falla la validación, continuar de todas formas (fallback)
    }
  }
  guardando.value = true
  try {
    const payload = {
      grupo_id: f.grupo_id,
      dia: f.dia,
      hora_inicio: f.hora_inicio,
      hora_fin: f.hora_fin,
      aula_id: f.aula_id || null,
      id_horario_api: f.id_horario_api || null,
      modificado_localmente: true,
    }
    const aulaObj = f.aula_id ? aulasStore.getAulaById(f.aula_id) : null

    if (f.id) {
      const resp = await api.put(`/horarios/${f.id}`, payload)
      // Actualizar en vista local
      for (const asig of asignaturas.value) {
        const g = asig.grupos?.find((g) => g.id === f.grupo_id)
        if (g) {
          const hi = g.horarios.findIndex((h) => h.id === f.id)
          if (hi !== -1) {
            g.horarios[hi] = {
              ...g.horarios[hi],
              ...resp.data,
              aula: aulaObj || g.horarios[hi].aula,
            }
          }
          break
        }
      }
      Notify.create({ type: 'positive', message: 'Horario actualizado' })
    } else {
      const resp = await api.post('/horarios', payload)
      for (const asig of asignaturas.value) {
        const g = asig.grupos?.find((g) => g.id === f.grupo_id)
        if (g) {
          g.horarios.push({ ...resp.data, aula: aulaObj || null })
          break
        }
      }
      Notify.create({ type: 'positive', message: 'Horario creado' })
    }
    dlg.value.horario = false
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      Object.values(err.response?.data?.errors || {})
        .flat()
        .join(' | ') ||
      err.message
    Notify.create({ type: 'negative', message: 'Error: ' + msg })
  } finally {
    guardando.value = false
  }
}

// ══════════════════════════════════════════════
// GESTIÓN DE AULAS Y BLOQUES
// ══════════════════════════════════════════════
const bloqueSeleccionado = ref(null)

const aulasDelBloque = computed(() => {
  if (!bloqueSeleccionado.value) return []
  return aulasStore.aulas.filter((a) => a.bloque_id === bloqueSeleccionado.value.id)
})

const colsAulas = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'capacidad', label: 'Cap.', field: 'capacidad', align: 'center' },
  { name: 'pupitres', label: 'Pupitres', field: 'pupitres', align: 'center' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

function abrirDialogoBloques(bloque) {
  dlgBloque.value = bloque
    ? { id: bloque.id, nombre: bloque.nombre, sede_id: bloque.sede_id }
    : { nombre: '', sede_id: filtSede.value || null }
  dlg.value.bloque = true
}

function abrirDialogoAula(aula) {
  dlgAula.value = aula
    ? {
        id: aula.id,
        nombre: aula.nombre,
        bloque_id: aula.bloque_id,
        capacidad: aula.capacidad,
        pupitres: aula.pupitres,
      }
    : {
        nombre: '',
        bloque_id: bloqueSeleccionado.value?.id || null,
        capacidad: null,
        pupitres: null,
      }
  dlg.value.aula = true
}

async function guardarBloque() {
  const f = dlgBloque.value
  if (!f.nombre?.trim() || !f.sede_id) {
    Notify.create({ type: 'warning', message: 'Nombre y sede son obligatorios' })
    return
  }
  guardando.value = true
  try {
    const payload = { nombre: f.nombre.trim(), sede_id: f.sede_id }
    if (f.id) {
      await bloquesStore.updateBloque(f.id, payload)
      Notify.create({ type: 'positive', message: 'Bloque actualizado' })
    } else {
      const nuevo = await bloquesStore.createBloque(payload)
      bloqueSeleccionado.value = nuevo
      Notify.create({ type: 'positive', message: 'Bloque creado' })
    }
    dlg.value.bloque = false
  } catch (err) {
    Notify.create({
      type: 'negative',
      message: 'Error: ' + (err.response?.data?.message || err.message),
    })
  } finally {
    guardando.value = false
  }
}

async function guardarAula() {
  const f = dlgAula.value
  if (!f.nombre?.trim() || !f.bloque_id) {
    Notify.create({ type: 'warning', message: 'Nombre y bloque son obligatorios' })
    return
  }
  guardando.value = true
  try {
    const payload = {
      nombre: f.nombre.trim(),
      bloque_id: f.bloque_id,
      capacidad: f.capacidad || null,
      pupitres: f.pupitres || null,
    }
    if (f.id) {
      await aulasStore.updateAula(f.id, payload)
      Notify.create({ type: 'positive', message: 'Aula actualizada' })
    } else {
      await aulasStore.createAula(payload)
      Notify.create({ type: 'positive', message: 'Aula creada' })
    }
    dlg.value.aula = false
  } catch (err) {
    Notify.create({
      type: 'negative',
      message: 'Error: ' + (err.response?.data?.message || err.message),
    })
  } finally {
    guardando.value = false
  }
}

// ══════════════════════════════════════════════
// GUARDAR: DOCENTE
// ══════════════════════════════════════════════
async function guardarDocente() {
  const f = dlgDocente.value
  if (!f.nombre_completo?.trim() || !f.ci?.trim()) {
    Notify.create({ type: 'warning', message: 'Nombre completo y CI son obligatorios' })
    return
  }
  guardando.value = true
  try {
    const payload = {
      nombre_completo: f.nombre_completo.trim(),
      ci: f.ci.trim(),
      email: f.email?.trim() || null,
      celular: f.celular?.trim() || null,
      grado_academico: f.grado_academico?.trim() || null,
      especialidad: f.especialidad?.trim() || null,
      sede_id: f.sede_id || null,
      estado: true,
    }
    const resp = await api.post('/docentes', payload)
    // Agregar a la lista local para no recargar todo
    docentesSimple.value.push(resp.data)
    opcionesDocentes.value = docentesSimple.value
    Notify.create({ type: 'positive', message: 'Docente creado: ' + resp.data.nombre_completo })
    dlg.value.docente = false
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      Object.values(err.response?.data?.errors || {})
        .flat()
        .join(' | ') ||
      err.message
    Notify.create({ type: 'negative', message: 'Error: ' + msg })
  } finally {
    guardando.value = false
  }
}

// ══════════════════════════════════════════════
// ELIMINAR
// ══════════════════════════════════════════════
function confirmarEliminar(tipo, item) {
  eliminarTipo.value = tipo
  eliminarItem.value = item
  dlg.value.eliminar = true
}

async function ejecutarEliminar() {
  guardando.value = true
  try {
    const tipo = eliminarTipo.value
    const item = eliminarItem.value

    if (tipo === 'asignatura') {
      await asignaturasStore.deleteAsignatura(item.id)
      asignaturas.value = asignaturas.value.filter((a) => a.id !== item.id)
      Notify.create({ type: 'positive', message: 'Asignatura eliminada' })
    } else if (tipo === 'grupo') {
      await api.delete(`/grupos/${item.id}`)
      for (const asig of asignaturas.value) {
        if (asig.grupos) asig.grupos = asig.grupos.filter((g) => g.id !== item.id)
      }
      Notify.create({ type: 'positive', message: 'Grupo eliminado' })
    } else if (tipo === 'horario') {
      await api.delete(`/horarios/${item.id}`)
      for (const asig of asignaturas.value) {
        for (const g of asig.grupos || []) {
          g.horarios = (g.horarios || []).filter((h) => h.id !== item.id)
        }
      }
      Notify.create({ type: 'positive', message: 'Horario eliminado' })
    } else if (tipo === 'aula') {
      await aulasStore.deleteAula(item.id)
      Notify.create({ type: 'positive', message: 'Aula eliminada' })
    } else if (tipo === 'bloque') {
      await bloquesStore.deleteBloque(item.id)
      if (bloqueSeleccionado.value?.id === item.id) bloqueSeleccionado.value = null
      Notify.create({ type: 'positive', message: 'Bloque eliminado' })
    }

    dlg.value.eliminar = false
  } catch (err) {
    Notify.create({
      type: 'negative',
      message: 'Error: ' + (err.response?.data?.message || err.message),
    })
  } finally {
    guardando.value = false
  }
}

// ══════════════════════════════════════════════
// ASIGNAR MATERIAS FALTANTES
// ══════════════════════════════════════════════
async function abrirDlgAsignarMaterias() {
  if (!filtCarrera.value) {
    Notify.create({ type: 'warning', message: 'Selecciona una carrera primero' })
    return
  }
  dlgAsignar.value = {
    sede_id: filtSede.value,
    semestre: null,
    tabMalla: 'N',
    seleccionados: [],
    masterData: null
  }
  materiasMaster.value = []
  dlg.value.asignarMaterias = true
  await cargarMasterMaterias()
}

async function cargarMasterMaterias() {
  if (!filtCarrera.value) return
  cargandoMaster.value = true
  try {
    const resp = await api.get(`/asignaturas/master/${filtCarrera.value}`, {
      params: { sede_id: dlgAsignar.value.sede_id }
    })
    dlgAsignar.value.masterData = resp.data
    materiasMaster.value = resp.data.mallas || { N: [], A: [] }
  } catch (err) {
    Notify.create({ type: 'negative', message: 'Error cargando materias: ' + err.message })
  } finally {
    cargandoMaster.value = false
  }
}

const materiasParaAsignar = computed(() => {
  const tab = dlgAsignar.value.tabMalla
  return materiasMaster.value[tab] || []
})

const semestresAgrupados = computed(() => {
  const sems = [...new Set(materiasParaAsignar.value.map((m) => m.semestre).filter(Boolean))]
  return sems.sort((a, b) => a - b)
})

function getMateriasPorSemestre(sem) {
  return materiasParaAsignar.value.filter((m) => m.semestre === sem)
}

const semestresOptions = computed(() => {
  const sems = [...new Set(materiasParaAsignar.value.map((m) => m.semestre).filter(Boolean))]
  return sems.sort((a, b) => a - b).map((s) => ({ label: `Semestre ${s}`, value: s }))
})

async function asignarMateriasSeleccionadas() {
  const seleccionados = dlgAsignar.value.seleccionados
  if (!seleccionados.length || !dlgAsignar.value.sede_id || !dlgAsignar.value.semestre) {
    Notify.create({ type: 'warning', message: 'Completa sede y semestre' })
    return
  }
  guardando.value = true
  try {
    const resp = await api.post('/asignaturas/asignar', {
      asignatura_ids: seleccionados,
      carrera_id: filtCarrera.value,
      sede_id: dlgAsignar.value.sede_id,
      semestre: dlgAsignar.value.semestre
    })
    Notify.create({
      type: 'positive',
      message: `${resp.data.asignadas} materia(s) asignada(s), ${resp.data.ya_existian} ya existían`
    })
    dlg.value.asignarMaterias = false
    await cargarDatos()
  } catch (err) {
    Notify.create({ type: 'negative', message: 'Error: ' + (err.response?.data?.message || err.message) })
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
.gestion-page {
  background: var(--bg-primary, #f5f5f5);
}

/* Filtros */
.filtros-card {
  border-radius: 10px;
  background: var(--bg-secondary, #fff);
}

/* Tarjeta de asignatura */
.asig-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.asig-header {
  padding: 8px 12px;
  cursor: pointer;
  background: #fafafa;
  user-select: none;
  transition: background 0.15s;
}
.asig-header:hover {
  background: #f0f4ff;
}
.asig-header--open {
  background: #e8f0fe;
}

/* Cuerpo expandible */
.asig-body {
  border-top: 1px solid #e8e8e8;
}
.grupo-cols-header {
  padding: 4px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #eee;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

/* Filas de grupo */
.grupo-fila {
  padding: 5px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.83rem;
  transition: background 0.1s;
}
.grupo-fila:hover {
  background: #fafeff;
}
.grupo-fila--first {
  background: #fdfdfd;
}
.grupo-fila--extra {
  background: #f9f9f9;
}
.grupo-fila:last-child {
  border-bottom: none;
}

/* Animación expand */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
