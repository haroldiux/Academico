<template>
  <q-page class="q-pa-lg">
    <!-- Page Header -->
    <div class="row items-center q-mb-lg animate-in">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="admin_panel_settings" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Gestión de Roles</span>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary);">
          Administra los roles y permisos del sistema académico
        </p>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Nuevo Rol"
          class="btn-primary-gradient"
          @click="showDialogNuevoRol = true"
          no-caps
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="stat-card animate-in" style="animation-delay: 0.1s">
          <div class="stat-icon primary q-mb-md">
            <q-icon name="badge" size="28px" />
          </div>
          <div class="stat-value">{{ rolesStore.totalRoles }}</div>
          <div class="stat-label">Total Roles</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="stat-card animate-in" style="animation-delay: 0.15s">
          <div class="stat-icon success q-mb-md">
            <q-icon name="check_circle" size="28px" />
          </div>
          <div class="stat-value">{{ rolesStore.rolesActivos.length }}</div>
          <div class="stat-label">Roles Activos</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="stat-card animate-in" style="animation-delay: 0.2s">
          <div class="stat-icon warning q-mb-md">
            <q-icon name="people" size="28px" />
          </div>
          <div class="stat-value">{{ usuariosStore.totalUsuarios }}</div>
          <div class="stat-label">Usuarios Totales</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="stat-card animate-in" style="animation-delay: 0.25s">
          <div class="stat-icon info q-mb-md">
            <q-icon name="security" size="28px" />
          </div>
          <div class="stat-value">{{ totalPermisos }}</div>
          <div class="stat-label">Permisos Asignados</div>
        </div>
      </div>
    </div>


    <!-- Roles Cards Grid -->
    <div class="row q-col-gutter-lg">
      <div
        v-for="(rol, index) in rolesStore.rolesOrdenados"
        :key="rol.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <div
          class="role-card animate-in"
          :style="{ animationDelay: `${0.3 + index * 0.05}s`, opacity: rol.activo ? 1 : 0.6 }"
        >
          <!-- Card Header -->
          <div
            class="role-card-header"
            :style="{ background: `linear-gradient(135deg, ${rol.color}15 0%, ${rol.color}30 100%)` }"
          >
            <div class="row items-center no-wrap">
              <q-avatar
                size="56px"
                :style="{ background: `linear-gradient(135deg, ${rol.color}, ${rol.color}dd)` }"
                text-color="white"
              >
                <q-icon :name="rol.icono" size="28px" />
              </q-avatar>
              <div class="q-ml-md col">
                <div class="text-subtitle1 text-weight-bold" style="color: var(--text-primary);">{{ rol.nombre }}</div>
                <div class="text-caption" style="font-family: monospace; color: var(--text-secondary);">{{ rol.codigo }}</div>
              </div>
              <q-chip
                :color="rol.activo ? 'green-2' : 'grey-4'"
                :text-color="rol.activo ? 'green-9' : 'grey-7'"
                dense
                class="text-weight-bold"
              >
                {{ rol.activo ? 'Activo' : 'Inactivo' }}
              </q-chip>
            </div>
          </div>

          <!-- Card Body -->
          <div class="role-card-body">
            <p class="text-body2 q-mb-md" style="color: var(--text-secondary); min-height: 40px;">
              {{ rol.descripcion }}
            </p>

            <!-- Permisos Preview -->
            <div class="q-mb-md">
              <div class="text-caption text-weight-bold q-mb-xs" style="color: var(--text-secondary); letter-spacing: 1px;">
                PERMISOS
              </div>
              <div class="row q-gutter-xs">
                <q-chip
                  v-for="(permiso, idx) in rol.permisos.slice(0, 3)"
                  :key="idx"
                  size="sm"
                  color="blue-1"
                  text-color="blue-9"
                  dense
                >
                  {{ permiso === '*' ? 'Todos' : permiso }}
                </q-chip>
                <q-chip
                  v-if="rol.permisos.length > 3"
                  size="sm"
                  color="grey-3"
                  text-color="grey-7"
                  dense
                >
                  +{{ rol.permisos.length - 3 }} más
                </q-chip>
              </div>
            </div>

            <!-- Users Count -->
            <div class="row items-center" style="color: var(--text-secondary);">
              <q-icon name="people" size="18px" class="q-mr-xs" />
              <span class="text-caption">{{ getUsuariosPorRol(rol.id) }} usuarios asignados</span>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="role-card-actions row justify-end q-gutter-xs">
            <q-btn flat round icon="visibility" size="sm" color="primary" @click="verDetalleRol(rol)">
              <q-tooltip>Ver detalles</q-tooltip>
            </q-btn>
            <q-btn flat round icon="edit" size="sm" color="orange" @click="editarRol(rol)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              :icon="rol.activo ? 'toggle_on' : 'toggle_off'"
              size="sm"
              :color="rol.activo ? 'green' : 'grey'"
              @click="toggleEstadoRol(rol)"
            >
              <q-tooltip>{{ rol.activo ? 'Desactivar' : 'Activar' }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              icon="delete"
              size="sm"
              color="red"
              @click="confirmarEliminarRol(rol)"
              :disable="rol.codigo === 'SUPER_ADMIN'"
            >
              <q-tooltip>{{ rol.codigo === 'SUPER_ADMIN' ? 'No se puede eliminar' : 'Eliminar' }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog Nuevo/Editar Rol -->
    <q-dialog v-model="showDialogNuevoRol" persistent>
      <q-card style="width: 550px; max-width: 95vw; border-radius: 16px;">
        <div class="dialog-header">
          <div class="dialog-header-title">
            <q-icon :name="editandoRol ? 'edit' : 'add_circle'" size="28px" />
            {{ editandoRol ? 'Editar Rol' : 'Nuevo Rol' }}
          </div>
        </div>

        <q-card-section class="q-pt-lg">
          <q-form @submit.prevent="guardarRol" class="q-gutter-md">
            <q-input
              v-model="formRol.nombre"
              label="Nombre del Rol"
              outlined
              dense
              :rules="[val => !!val || 'El nombre es requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="badge" color="primary" />
              </template>
            </q-input>

            <q-input
              v-model="formRol.codigo"
              label="Código"
              outlined
              dense
              hint="Identificador único en mayúsculas"
              :rules="[val => !!val || 'El código es requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="code" color="primary" />
              </template>
            </q-input>

            <q-input
              v-model="formRol.descripcion"
              label="Descripción"
              outlined
              dense
              type="textarea"
              rows="2"
            >
              <template v-slot:prepend>
                <q-icon name="description" color="primary" />
              </template>
            </q-input>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model="formRol.color"
                  label="Color"
                  outlined
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="palette" :style="{ color: formRol.color }" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-color v-model="formRol.color" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-6">
                <q-select
                  v-model="formRol.icono"
                  label="Ícono"
                  outlined
                  dense
                  :options="iconoOptions"
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon :name="formRol.icono" color="primary" />
                  </template>
                </q-select>
              </div>
            </div>

            <q-select
              v-model="formRol.permisos"
              label="Permisos"
              outlined
              dense
              multiple
              use-chips
              :options="permisosOptions"
              emit-value
              map-options
            >
              <template v-slot:prepend>
                <q-icon name="security" color="primary" />
              </template>
            </q-select>

            <q-toggle
              v-model="formRol.activo"
              label="Rol Activo"
              color="green"
            />
          </q-form>
        </q-card-section>

        <div class="dialog-actions">
          <q-btn flat label="Cancelar" color="grey" @click="cerrarDialogRol" no-caps />
          <q-btn unelevated label="Guardar" color="primary" @click="guardarRol" no-caps />
        </div>
      </q-card>
    </q-dialog>

    <!-- Dialog Ver Detalle -->
    <q-dialog v-model="showDialogDetalle">
      <q-card style="width: 550px; max-width: 95vw; border-radius: 16px;">
        <div
          class="dialog-header"
          :style="{ background: `linear-gradient(135deg, ${rolSeleccionado?.color || '#1976d2'} 0%, ${rolSeleccionado?.color || '#1976d2'}dd 100%)` }"
        >
          <div class="dialog-header-title">
            <q-avatar size="40px" color="white" text-color="primary">
              <q-icon :name="rolSeleccionado?.icono" :style="{ color: rolSeleccionado?.color }" />
            </q-avatar>
            {{ rolSeleccionado?.nombre }}
          </div>
        </div>

        <q-card-section>
          <div class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <div class="text-caption text-weight-bold" style="color: var(--text-secondary);">CÓDIGO</div>
                <div class="text-body1 text-weight-medium">{{ rolSeleccionado?.codigo }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-weight-bold" style="color: var(--text-secondary);">ESTADO</div>
                <q-chip
                  :color="rolSeleccionado?.activo ? 'green-2' : 'grey-4'"
                  :text-color="rolSeleccionado?.activo ? 'green-9' : 'grey-7'"
                  dense
                >
                  {{ rolSeleccionado?.activo ? 'Activo' : 'Inactivo' }}
                </q-chip>
              </div>
            </div>

            <div>
              <div class="text-caption text-weight-bold" style="color: var(--text-secondary);">DESCRIPCIÓN</div>
              <div class="text-body2">{{ rolSeleccionado?.descripcion }}</div>
            </div>

            <div>
              <div class="text-caption text-weight-bold q-mb-sm" style="color: var(--text-secondary);">PERMISOS</div>
              <div class="row q-gutter-xs">
                <q-chip
                  v-for="(permiso, index) in rolSeleccionado?.permisos"
                  :key="index"
                  color="blue-1"
                  text-color="blue-9"
                  dense
                >
                  {{ permiso === '*' ? 'Acceso Total' : permiso }}
                </q-chip>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <div class="text-caption text-weight-bold" style="color: var(--text-secondary);">USUARIOS ASIGNADOS</div>
                <div class="text-body1 text-weight-medium">{{ getUsuariosPorRol(rolSeleccionado?.id) }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-weight-bold" style="color: var(--text-secondary);">FECHA CREACIÓN</div>
                <div class="text-body1">{{ rolSeleccionado?.fechaCreacion }}</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <div class="dialog-actions">
          <q-btn flat label="Cerrar" color="primary" v-close-popup no-caps />
        </div>
      </q-card>
    </q-dialog>

    <!-- Dialog Confirmar Eliminar -->
    <q-dialog v-model="showDialogEliminar">
      <q-card style="width: 400px; border-radius: 16px;">
        <q-card-section class="text-center q-pt-lg">
          <q-avatar icon="warning" color="red" text-color="white" size="60px" class="q-mb-md" />
          <div class="text-h6 text-weight-bold q-mb-sm">¿Eliminar rol?</div>
          <p class="text-body1">
            ¿Estás seguro de que deseas eliminar el rol
            <strong>{{ rolAEliminar?.nombre }}</strong>?
          </p>
          <p class="text-caption" style="color: var(--text-secondary);">
            Esta acción no se puede deshacer.
          </p>
        </q-card-section>

        <div class="dialog-actions justify-center">
          <q-btn flat label="Cancelar" color="grey" v-close-popup no-caps />
          <q-btn unelevated label="Eliminar" color="red" @click="eliminarRol" no-caps />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRolesStore } from 'src/stores/roles'
import { useUsuariosStore } from 'src/stores/usuarios'

const $q = useQuasar()
const rolesStore = useRolesStore()
const usuariosStore = useUsuariosStore()

onMounted(async () => {
  await Promise.all([
    rolesStore.fetchRoles(),
    usuariosStore.fetchUsuarios()
  ])
})

// Dialogs state
const showDialogNuevoRol = ref(false)
const showDialogDetalle = ref(false)
const showDialogEliminar = ref(false)
const editandoRol = ref(false)
const rolSeleccionado = ref(null)
const rolAEliminar = ref(null)

// Form state
const formRolInicial = {
  nombre: '',
  codigo: '',
  descripcion: '',
  color: '#1976d2',
  icono: 'badge',
  permisos: [],
  activo: true
}

const formRol = ref({ ...formRolInicial })

// Options
const iconoOptions = [
  { label: 'Admin', value: 'admin_panel_settings' },
  { label: 'Usuario', value: 'person' },
  { label: 'Gestión', value: 'manage_accounts' },
  { label: 'Escuela', value: 'school' },
  { label: 'Edificio', value: 'account_balance' },
  { label: 'Ingeniería', value: 'engineering' },
  { label: 'Quiz', value: 'quiz' },
  { label: 'Insignia', value: 'badge' },
  { label: 'Seguridad', value: 'security' },
  { label: 'Verificado', value: 'verified_user' }
]

const permisosOptions = [
  { label: 'Acceso Total', value: '*' },
  { label: 'Usuarios', value: 'usuarios' },
  { label: 'Roles', value: 'roles' },
  { label: 'Configuración', value: 'configuracion' },
  { label: 'Reportes', value: 'reportes' },
  { label: 'Estadísticas', value: 'estadisticas' },
  { label: 'Aprobaciones', value: 'aprobaciones' },
  { label: 'Planificación', value: 'planificacion' },
  { label: 'Seguimiento', value: 'seguimiento' },
  { label: 'Docentes', value: 'docentes' },
  { label: 'Estudiantes', value: 'estudiantes' },
  { label: 'Horarios', value: 'horarios' },
  { label: 'Materias', value: 'materias' },
  { label: 'Notas', value: 'notas' },
  { label: 'Asistencia', value: 'asistencia' },
  { label: 'Materiales', value: 'materiales' },
  { label: 'Evaluaciones', value: 'evaluaciones' },
  { label: 'Exámenes', value: 'examenes' },
  { label: 'Resultados', value: 'resultados' }
]

// Computed
const totalPermisos = computed(() => {
  let total = 0
  rolesStore.roles.forEach(rol => {
    total += rol.permisos.length
  })
  return total
})

// Methods
function getUsuariosPorRol(rolId) {
  return usuariosStore.usuarios.filter(u => u.rolId === rolId).length
}

function verDetalleRol(rol) {
  rolSeleccionado.value = rol
  showDialogDetalle.value = true
}

function editarRol(rol) {
  editandoRol.value = true
  rolSeleccionado.value = rol
  formRol.value = {
    nombre: rol.nombre,
    codigo: rol.codigo,
    descripcion: rol.descripcion,
    color: rol.color,
    icono: rol.icono,
    permisos: [...rol.permisos],
    activo: rol.activo
  }
  showDialogNuevoRol.value = true
}

function cerrarDialogRol() {
  showDialogNuevoRol.value = false
  editandoRol.value = false
  rolSeleccionado.value = null
  formRol.value = { ...formRolInicial }
}

function guardarRol() {
  if (!formRol.value.nombre || !formRol.value.codigo) {
    $q.notify({
      type: 'warning',
      message: 'Por favor completa los campos requeridos',
      position: 'top'
    })
    return
  }

  if (editandoRol.value && rolSeleccionado.value) {
    rolesStore.updateRol(rolSeleccionado.value.id, formRol.value)
    $q.notify({
      type: 'positive',
      message: 'Rol actualizado exitosamente',
      icon: 'check_circle',
      position: 'top'
    })
  } else {
    rolesStore.addRol(formRol.value)
    $q.notify({
      type: 'positive',
      message: 'Rol creado exitosamente',
      icon: 'check_circle',
      position: 'top'
    })
  }

  cerrarDialogRol()
}

function toggleEstadoRol(rol) {
  rolesStore.toggleRolActivo(rol.id)
  $q.notify({
    type: 'info',
    message: `Rol ${!rol.activo ? 'activado' : 'desactivado'}`,
    icon: !rol.activo ? 'toggle_on' : 'toggle_off',
    position: 'top'
  })
}

function confirmarEliminarRol(rol) {
  rolAEliminar.value = rol
  showDialogEliminar.value = true
}

function eliminarRol() {
  if (rolAEliminar.value) {
    rolesStore.deleteRol(rolAEliminar.value.id)
    $q.notify({
      type: 'positive',
      message: 'Rol eliminado exitosamente',
      icon: 'delete',
      position: 'top'
    })
  }
  showDialogEliminar.value = false
  rolAEliminar.value = null
}
</script>

<style scoped>
.q-page {
  background: var(--bg-primary);
  min-height: 100vh;
}

.text-gradient {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn-primary-gradient {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark)) !important;
}

/* Stat Cards */
.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.primary { background: rgba(124, 58, 237, 0.15); color: var(--primary-light); }
.stat-icon.success { background: rgba(34, 197, 94, 0.15); color: var(--accent-green); }
.stat-icon.warning { background: rgba(249, 115, 22, 0.15); color: var(--accent-orange); }
.stat-icon.info { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }

.stat-value {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Cards */
.card-main {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 16px !important;
}

/* Role Grid Cards */
.role-card {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 16px !important;
  transition: all 0.2s ease;
  overflow: hidden;
}

.role-card:hover {
  border-color: var(--primary) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow-color);
}

.role-card-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.role-card-body {
  padding: 16px 20px;
}

.role-card-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-tertiary);
}

/* Animations */
.animate-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
