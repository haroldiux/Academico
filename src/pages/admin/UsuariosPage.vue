<template>
  <q-page class="q-pa-lg">
    <!-- Page Header -->
    <div class="row items-center q-mb-lg animate-in">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">
          <q-icon name="people" size="36px" color="primary" class="q-mr-sm" />
          <span class="text-gradient">Gestión de Usuarios</span>
        </h4>
        <p class="q-ma-none q-mt-xs" style="color: var(--text-secondary);">
          Administra los usuarios del sistema académico
        </p>
      </div>
      <div class="col-auto">
        <q-btn unelevated color="primary" icon="person_add" label="Nuevo Usuario" class="btn-primary-gradient"
          @click="abrirDialogNuevo" no-caps />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="stat-card animate-in" style="animation-delay: 0.1s">
          <div class="stat-icon primary q-mb-md">
            <q-icon name="people" size="28px" />
          </div>
          <div class="stat-value">{{ usuariosStore.totalUsuarios }}</div>
          <div class="stat-label">Total Usuarios</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="stat-card animate-in" style="animation-delay: 0.15s">
          <div class="stat-icon success q-mb-md">
            <q-icon name="check_circle" size="28px" />
          </div>
          <div class="stat-value">{{ usuariosStore.usuariosActivos.length }}</div>
          <div class="stat-label">Usuarios Activos</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="stat-card animate-in" style="animation-delay: 0.2s">
          <div class="stat-icon warning q-mb-md">
            <q-icon name="person_off" size="28px" />
          </div>
          <div class="stat-value">{{ usuariosStore.usuariosInactivos.length }}</div>
          <div class="stat-label">Usuarios Inactivos</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="stat-card animate-in" style="animation-delay: 0.25s">
          <div class="stat-icon info q-mb-md">
            <q-icon name="badge" size="28px" />
          </div>

          <div class="stat-value">{{ rolesStore.rolesActivos.length }}</div>
          <div class="stat-label">Roles Activos</div>
        </div>
      </div>
    </div>

    <!-- Filter Card -->
    <q-card class="card-main q-mb-lg animate-in" style="animation-delay: 0.3s">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-4">
            <q-input v-model="filtros.busqueda" outlined dense placeholder="Buscar por nombre, email..." clearable>
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select v-model="filtros.rol" outlined dense :options="opcionesRoles" label="Filtrar por Rol" emit-value
              map-options clearable>
              <template v-slot:prepend>
                <q-icon name="admin_panel_settings" color="primary" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-3">
            <q-select v-model="filtros.estado" outlined dense :options="opcionesEstado" label="Estado" emit-value
              map-options clearable>
              <template v-slot:prepend>
                <q-icon name="toggle_on" color="primary" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-2">
            <q-btn flat color="primary" icon="filter_alt_off" label="Limpiar" @click="limpiarFiltros" class="full-width"
              no-caps />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Users Table -->
    <q-card class="card-main animate-in" style="animation-delay: 0.35s">
      <q-table :rows="usuariosFiltrados" :columns="columnas" row-key="id" :pagination="paginacion" flat
        class="table-main" :loading="usuariosStore.loading" :rows-per-page-options="[5, 10, 20, 50]">
        <!-- Avatar + Name Column -->
        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="40px" :style="{ background: getColorRol(props.row.rolId) }" text-color="white">
                <span class="text-weight-bold">{{ getInitials(props.row) }}</span>
              </q-avatar>
              <div class="q-ml-md">
                <div class="text-weight-medium text-body2">
                  {{ props.row.nombre }} {{ props.row.apellido }}
                </div>
                <div class="text-caption" style="color: var(--text-secondary);">
                  CI: {{ props.row.ci }}
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Email Column -->
        <template v-slot:body-cell-email="props">
          <q-td :props="props">
            <div class="column">
              <span class="text-body2">{{ props.row.email }}</span>
              <span class="text-caption" style="color: var(--text-secondary);">{{ props.row.telefono }}</span>
            </div>
          </q-td>
        </template>

        <!-- Rol Column -->
        <template v-slot:body-cell-rol="props">
          <q-td :props="props">
            <q-chip :style="{ background: getColorRolBg(props.row.rolId), color: getColorRolText(props.row.rolId) }"
              dense class="text-weight-bold" size="sm">
              <q-icon :name="getIconoRol(props.row.rolId)" size="16px" class="q-mr-xs" />
              {{ props.row.rolNombre }}
            </q-chip>
          </q-td>
        </template>

        <!-- Carrera Column -->
        <template v-slot:body-cell-carrera="props">
          <q-td :props="props">
            <span v-if="props.row.carrera" class="text-body2">
              {{ props.row.carrera }}
            </span>
            <span v-else class="text-caption" style="color: var(--text-secondary);">N/A</span>
          </q-td>
        </template>

        <!-- Estado Column -->
        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-chip :color="props.row.estado === 'activo' ? 'green-2' : 'grey-4'"
              :text-color="props.row.estado === 'activo' ? 'green-9' : 'grey-7'" dense class="text-weight-bold"
              size="sm">
              <q-icon :name="props.row.estado === 'activo' ? 'check_circle' : 'cancel'" size="16px" class="q-mr-xs" />
              {{ props.row.estado === 'activo' ? 'Activo' : 'Inactivo' }}
            </q-chip>
          </q-td>
        </template>

        <!-- Ultimo Acceso Column -->
        <template v-slot:body-cell-ultimoAcceso="props">
          <q-td :props="props">
            <span class="text-caption" style="color: var(--text-secondary);">
              {{ formatFecha(props.row.ultimoAcceso) }}
            </span>
          </q-td>
        </template>

        <!-- Actions Column -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn flat round dense icon="visibility" size="sm" color="primary" @click="verUsuario(props.row)">
              <q-tooltip>Ver detalles</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="edit" size="sm" color="orange" @click="editarUsuario(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense :icon="props.row.estado === 'activo' ? 'person_off' : 'person'" size="sm"
              :color="props.row.estado === 'activo' ? 'orange' : 'green'" @click="toggleEstado(props.row)">
              <q-tooltip>{{ props.row.estado === 'activo' ? 'Desactivar' : 'Activar' }}</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete" size="sm" color="red" @click="confirmarEliminar(props.row)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <!-- Empty state -->
        <template v-slot:no-data>
          <div class="full-width column items-center q-pa-xl" style="color: var(--text-secondary);">
            <q-icon name="search_off" size="64px" class="q-mb-md" />
            <span class="text-h6">No se encontraron usuarios</span>
            <span class="text-caption">Intenta ajustar los filtros de búsqueda</span>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Nuevo/Editar Usuario -->
    <q-dialog v-model="showDialogUsuario" persistent>
      <q-card style="width: 650px; max-width: 95vw; border-radius: 16px;">
        <div class="dialog-header">
          <div class="dialog-header-title">
            <q-icon :name="editando ? 'edit' : 'person_add'" size="28px" />
            {{ editando ? 'Editar Usuario' : 'Nuevo Usuario' }}
          </div>
        </div>

        <q-card-section class="q-pt-lg">
          <q-form @submit.prevent="guardarUsuario" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model="formUsuario.nombre" label="Nombre" outlined dense
                  :rules="[val => !!val || 'El nombre es requerido']">
                  <template v-slot:prepend>
                    <q-icon name="person" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="formUsuario.apellido" label="Apellido" outlined dense
                  :rules="[val => !!val || 'El apellido es requerido']">
                  <template v-slot:prepend>
                    <q-icon name="person" color="primary" />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model="formUsuario.ci" label="Cédula de Identidad" outlined dense
                  :rules="[val => !!val || 'El CI es requerido']">
                  <template v-slot:prepend>
                    <q-icon name="badge" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="formUsuario.telefono" label="Teléfono" outlined dense>
                  <template v-slot:prepend>
                    <q-icon name="phone" color="primary" />
                  </template>
                </q-input>
              </div>
            </div>

            <q-input v-model="formUsuario.email" label="Correo Electrónico" outlined dense type="email" :rules="[
              val => !!val || 'El email es requerido',
              val => /.+@.+\..+/.test(val) || 'Email inválido'
            ]">
              <template v-slot:prepend>
                <q-icon name="email" color="primary" />
              </template>
            </q-input>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select v-model="formUsuario.rolId" label="Rol" outlined dense :options="opcionesRolesForm" emit-value
                  map-options :rules="[val => !!val || 'Seleccione un rol']" @update:model-value="onRolChange">
                  <template v-slot:prepend>
                    <q-icon name="admin_panel_settings" color="primary" />
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-6">
                <q-select v-model="formUsuario.carrera" label="Carrera (opcional)" outlined dense
                  :options="opcionesCarreras" emit-value map-options clearable :disable="!requiereCarrera"
                  :hint="requiereCarrera ? 'Requerido para este rol' : ''">
                  <template v-slot:prepend>
                    <q-icon name="school" color="primary" />
                  </template>
                </q-select>
              </div>
            </div>

            <q-toggle v-model="formUsuario.estado"
              :label="formUsuario.estado === 'activo' ? 'Usuario Activo' : 'Usuario Inactivo'"
              :color="formUsuario.estado === 'activo' ? 'green' : 'grey'" true-value="activo" false-value="inactivo" />
          </q-form>
        </q-card-section>

        <div class="dialog-actions">
          <q-btn flat label="Cancelar" color="grey" @click="cerrarDialog" no-caps />
          <q-btn unelevated label="Guardar" color="primary" @click="guardarUsuario" no-caps />
        </div>
      </q-card>
    </q-dialog>

    <!-- Dialog Ver Usuario -->
    <q-dialog v-model="showDialogVer">
      <q-card style="width: 550px; max-width: 95vw; border-radius: 16px;">
        <div class="dialog-header">
          <div class="dialog-header-title">
            <q-avatar size="40px" color="white" text-color="primary">
              <span class="text-weight-bold">{{ getInitials(usuarioSeleccionado || {}) }}</span>
            </q-avatar>
            {{ usuarioSeleccionado?.nombre }} {{ usuarioSeleccionado?.apellido }}
          </div>
        </div>

        <q-card-section>
          <div class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <div class="text-caption text-weight-bold" style="color: var(--text-secondary);">CÉDULA DE IDENTIDAD
                </div>
                <div class="text-body1 text-weight-medium">{{ usuarioSeleccionado?.ci }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-weight-bold" style="color: var(--text-secondary);">ESTADO</div>
                <q-chip :color="usuarioSeleccionado?.estado === 'activo' ? 'green-2' : 'grey-2'"
                  :text-color="usuarioSeleccionado?.estado === 'activo' ? 'green-9' : 'grey-9'" dense>
                  {{ usuarioSeleccionado?.estado === 'activo' ? 'Activo' : 'Inactivo' }}
                </q-chip>
              </div>
            </div>

            <q-separator />

            <div>
              <div class="text-caption text-weight-bold" style="color: var(--text-secondary);">EMAIL</div>
              <div class="text-body1">{{ usuarioSeleccionado?.email }}</div>
            </div>

            <div>
              <div class="text-caption text-weight-bold" style="color: var(--text-secondary);">TELÉFONO</div>
              <div class="text-body1">{{ usuarioSeleccionado?.telefono }}</div>
            </div>

            <q-separator />

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <div class="text-caption text-weight-bold" style="color: var(--text-secondary);">ROL</div>
                <q-chip
                  :style="{ background: getColorRolBg(usuarioSeleccionado?.rolId), color: getColorRolText(usuarioSeleccionado?.rolId) }"
                  dense>
                  {{ usuarioSeleccionado?.rolNombre }}
                </q-chip>
              </div>
              <div class="col-6">
                <div class="text-caption text-weight-bold" style="color: var(--text-secondary);">CARRERA</div>
                <div class="text-body1">{{ usuarioSeleccionado?.carrera || 'N/A' }}</div>
              </div>
            </div>

            <q-separator />

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <div class="text-caption text-weight-bold" style="color: var(--text-secondary);">ÚLTIMO ACCESO</div>
                <div class="text-body2">{{ formatFecha(usuarioSeleccionado?.ultimoAcceso) }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-weight-bold" style="color: var(--text-secondary);">FECHA REGISTRO</div>
                <div class="text-body2">{{ usuarioSeleccionado?.fechaCreacion }}</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <div class="dialog-actions">
          <q-btn flat label="Cerrar" color="primary" v-close-popup no-caps />
          <q-btn unelevated label="Editar" color="orange" icon="edit" @click="editarDesdeVer" no-caps />
        </div>
      </q-card>
    </q-dialog>

    <!-- Dialog Confirmar Eliminar -->
    <q-dialog v-model="showDialogEliminar">
      <q-card style="width: 400px; border-radius: 16px;">
        <q-card-section class="text-center q-pt-lg">
          <q-avatar icon="warning" color="red" text-color="white" size="60px" class="q-mb-md" />
          <div class="text-h6 text-weight-bold q-mb-sm">¿Eliminar usuario?</div>
          <p class="text-body1">
            ¿Estás seguro de que deseas eliminar al usuario
            <strong>{{ usuarioAEliminar?.nombre }} {{ usuarioAEliminar?.apellido }}</strong>?
          </p>
          <p class="text-caption" style="color: var(--text-secondary);">
            Esta acción no se puede deshacer.
          </p>
        </q-card-section>

        <div class="dialog-actions justify-center">
          <q-btn flat label="Cancelar" color="grey" v-close-popup no-caps />
          <q-btn unelevated label="Eliminar" color="red" @click="eliminarUsuario" no-caps />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useUsuariosStore } from 'src/stores/usuarios'
import { useRolesStore } from 'src/stores/roles'

const $q = useQuasar()
const usuariosStore = useUsuariosStore()
const rolesStore = useRolesStore()

onMounted(async () => {
  await Promise.all([
    usuariosStore.fetchUsuarios(),
    rolesStore.fetchRoles()
  ])
})

// Dialogs
const showDialogUsuario = ref(false)
const showDialogVer = ref(false)
const showDialogEliminar = ref(false)
const editando = ref(false)
const usuarioSeleccionado = ref(null)
const usuarioAEliminar = ref(null)

// Filters
const filtros = ref({
  busqueda: '',
  rol: null,
  estado: null
})

// Pagination
const paginacion = ref({
  sortBy: 'nombre',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

// Form
const formUsuarioInicial = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  ci: '',
  rolId: null,
  rolNombre: '',
  estado: 'activo',
  carrera: null
}

const formUsuario = ref({ ...formUsuarioInicial })

// Table columns
const columnas = [
  { name: 'nombre', label: 'Usuario', field: 'nombre', align: 'left', sortable: true },
  { name: 'email', label: 'Contacto', field: 'email', align: 'left', sortable: true },
  { name: 'rol', label: 'Rol', field: 'rolNombre', align: 'left', sortable: true },
  { name: 'carrera', label: 'Carrera', field: 'carrera', align: 'left', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  { name: 'ultimoAcceso', label: 'Último Acceso', field: 'ultimoAcceso', align: 'left', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Options
const opcionesEstado = [
  { label: 'Activo', value: 'activo' },
  { label: 'Inactivo', value: 'inactivo' }
]

const opcionesCarreras = [
  { label: 'Ingeniería de Sistemas', value: 'Ingeniería de Sistemas' },
  { label: 'Administración de Empresas', value: 'Administración de Empresas' },
  { label: 'Contaduría Pública', value: 'Contaduría Pública' },
  { label: 'Derecho', value: 'Derecho' },
  { label: 'Medicina', value: 'Medicina' },
  { label: 'Enfermería', value: 'Enfermería' },
  { label: 'Arquitectura', value: 'Arquitectura' },
  { label: 'Ingeniería Civil', value: 'Ingeniería Civil' }
]

// Computed
const opcionesRoles = computed(() => {
  return rolesStore.rolesActivos.map(rol => ({
    label: rol.nombre,
    value: rol.id
  }))
})

const opcionesRolesForm = computed(() => {
  return rolesStore.roles.map(rol => ({
    label: rol.nombre,
    value: rol.id
  }))
})

const requiereCarrera = computed(() => {
  const rolesConCarrera = ['DIRECTOR_CARRERA', 'DOCENTE']
  const rol = rolesStore.getRolById(formUsuario.value.rolId)
  return rol && rolesConCarrera.includes(rol.codigo)
})

const usuariosFiltrados = computed(() => {
  let resultado = [...usuariosStore.usuarios]

  if (filtros.value.busqueda) {
    const termino = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(u =>
      u.nombre.toLowerCase().includes(termino) ||
      u.apellido.toLowerCase().includes(termino) ||
      u.email.toLowerCase().includes(termino) ||
      u.ci.includes(termino)
    )
  }

  if (filtros.value.rol) {
    resultado = resultado.filter(u => u.rolId === filtros.value.rol)
  }

  if (filtros.value.estado) {
    resultado = resultado.filter(u => u.estado === filtros.value.estado)
  }

  return resultado
})

// Methods
function getInitials(usuario) {
  if (!usuario.nombre) return '?'
  return `${usuario.nombre.charAt(0)}${usuario.apellido?.charAt(0) || ''}`
}

function getColorRol(rolId) {
  const rol = rolesStore.getRolById(rolId)
  return rol ? rol.color : '#616161'
}

function getColorRolBg(rolId) {
  const rol = rolesStore.getRolById(rolId)
  return rol ? `${rol.color}20` : '#e0e0e0'
}

function getColorRolText(rolId) {
  const rol = rolesStore.getRolById(rolId)
  return rol ? rol.color : '#616161'
}

function getIconoRol(rolId) {
  const rol = rolesStore.getRolById(rolId)
  return rol ? rol.icono : 'person'
}

function formatFecha(fecha) {
  if (!fecha) return 'Nunca'
  return new Date(fecha).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function limpiarFiltros() {
  filtros.value = { busqueda: '', rol: null, estado: null }
}

function abrirDialogNuevo() {
  editando.value = false
  formUsuario.value = { ...formUsuarioInicial }
  showDialogUsuario.value = true
}

function editarUsuario(usuario) {
  editando.value = true
  usuarioSeleccionado.value = usuario
  formUsuario.value = {
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    telefono: usuario.telefono,
    ci: usuario.ci,
    rolId: usuario.rolId,
    rolNombre: usuario.rolNombre,
    estado: usuario.estado,
    carrera: usuario.carrera
  }
  showDialogUsuario.value = true
}

function verUsuario(usuario) {
  usuarioSeleccionado.value = usuario
  showDialogVer.value = true
}

function editarDesdeVer() {
  showDialogVer.value = false
  editarUsuario(usuarioSeleccionado.value)
}

function cerrarDialog() {
  showDialogUsuario.value = false
  editando.value = false
  usuarioSeleccionado.value = null
  formUsuario.value = { ...formUsuarioInicial }
}

function onRolChange(rolId) {
  const rol = rolesStore.getRolById(rolId)
  if (rol) {
    formUsuario.value.rolNombre = rol.nombre
  }
}

function guardarUsuario() {
  if (!formUsuario.value.nombre || !formUsuario.value.apellido || !formUsuario.value.email || !formUsuario.value.rolId) {
    $q.notify({
      type: 'warning',
      message: 'Por favor completa los campos requeridos',
      icon: 'warning',
      position: 'top'
    })
    return
  }

  if (editando.value && usuarioSeleccionado.value) {
    usuariosStore.updateUsuario(usuarioSeleccionado.value.id, formUsuario.value)
    $q.notify({
      type: 'positive',
      message: 'Usuario actualizado exitosamente',
      icon: 'check_circle',
      position: 'top'
    })
  } else {
    usuariosStore.addUsuario(formUsuario.value)
    $q.notify({
      type: 'positive',
      message: 'Usuario creado exitosamente',
      icon: 'check_circle',
      position: 'top'
    })
  }

  cerrarDialog()
}

function toggleEstado(usuario) {
  usuariosStore.toggleUsuarioEstado(usuario.id)
  $q.notify({
    type: 'info',
    message: `Usuario ${usuario.estado === 'activo' ? 'desactivado' : 'activado'}`,
    icon: usuario.estado === 'activo' ? 'person_off' : 'person',
    position: 'top'
  })
}

function confirmarEliminar(usuario) {
  usuarioAEliminar.value = usuario
  showDialogEliminar.value = true
}

function eliminarUsuario() {
  if (usuarioAEliminar.value) {
    usuariosStore.deleteUsuario(usuarioAEliminar.value.id)
    $q.notify({
      type: 'positive',
      message: 'Usuario eliminado exitosamente',
      icon: 'delete',
      position: 'top'
    })
  }
  showDialogEliminar.value = false
  usuarioAEliminar.value = null
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

.stat-icon.primary {
  background: rgba(124, 58, 237, 0.15);
  color: var(--primary-light);
}

.stat-icon.success {
  background: rgba(34, 197, 94, 0.15);
  color: var(--accent-green);
}

.stat-icon.warning {
  background: rgba(249, 115, 22, 0.15);
  color: var(--accent-orange);
}

.stat-icon.info {
  background: rgba(59, 130, 246, 0.15);
  color: var(--accent-blue);
}

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

/* Table */
.table-main {
  background: transparent !important;
}

.table-main :deep(thead tr) {
  background: var(--bg-tertiary) !important;
}

.table-main :deep(th) {
  color: var(--text-secondary) !important;
  font-weight: 600 !important;
  border-bottom: 1px solid var(--border-color) !important;
}

.table-main :deep(tbody tr) {
  transition: background 0.15s ease;
}

.table-main :deep(tbody tr:hover) {
  background: var(--bg-hover) !important;
}

.table-main :deep(td) {
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

/* Dialog */
.dialog-header {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  padding: 20px 24px;
  margin: -16px -16px 0 -16px;
  border-radius: 16px 16px 0 0;
}

.dialog-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Animations */
.animate-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
