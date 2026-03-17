<template>
  <q-page class="perfil-page">
    <!-- Header -->
    <div class="perfil-header animate-fade-in">
      <div class="header-left">
        <p class="section-tag">Ajustes de Cuenta</p>
        <h1 class="page-title">Mi Perfil</h1>
      </div>
      <div class="header-right">
        <q-chip v-if="saving" color="warning" text-color="white" icon="sync"> Guardando... </q-chip>
        <q-chip v-else color="positive" text-color="white" icon="check_circle">
          Guardado Automático
        </q-chip>
      </div>
    </div>

    <div class="content-grid">
      <!-- Left Column: Main Data -->
      <div class="main-column">
        <div class="profile-card">
          <div class="card-header">
            <h2 class="card-title">Información Personal</h2>
            <p class="card-subtitle">Actualiza tus datos básicos de contacto e identificación.</p>
          </div>

          <div class="form-grid">
            <q-input
              v-model="form.nombre"
              label="Nombre(s)"
              outlined
              class="input-rounded"
              bg-color="bg-tertiary"
              :rules="[(val) => !!val || 'Requerido']"
            >
              <template v-slot:prepend><q-icon name="person" /></template>
            </q-input>

            <q-input
              v-model="form.apellido"
              label="Apellidos"
              outlined
              class="input-rounded"
              bg-color="bg-tertiary"
              :rules="[(val) => !!val || 'Requerido']"
            >
              <template v-slot:prepend><q-icon name="people" /></template>
            </q-input>

            <q-input
              v-model="form.ci"
              label="Cédula de Identidad (CI)"
              outlined
              class="input-rounded"
              bg-color="bg-tertiary"
              :rules="[(val) => !!val || 'Requerido']"
            >
              <template v-slot:prepend><q-icon name="fingerprint" /></template>
            </q-input>

            <q-input
              v-model="form.email"
              label="Correo Electrónico"
              outlined
              class="input-rounded"
              bg-color="bg-tertiary"
              :rules="[
                (val) => !!val || 'Correo inválido',
                (val) => /.+@.+\..+/.test(val) || 'Formato inválido',
              ]"
            >
              <template v-slot:prepend><q-icon name="email" /></template>
            </q-input>

            <q-input
              v-model="form.telefono"
              label="Número de Teléfono / Celular"
              outlined
              class="input-rounded"
              bg-color="bg-tertiary"
              placeholder="Ej: 78945612"
            >
              <template v-slot:prepend><q-icon name="phone" /></template>
            </q-input>

            <q-input
              v-model="form.formacion"
              label="Formación Académica / Título"
              outlined
              class="input-rounded"
              bg-color="bg-tertiary"
              placeholder="Ej: Magister en Educación Superior"
            >
              <template v-slot:prepend><q-icon name="school" /></template>
            </q-input>
          </div>
        </div>

        <!-- Security Section -->
        <div class="profile-card security-card q-mt-lg">
          <div class="card-header">
            <h2 class="card-title">Seguridad</h2>
            <p class="card-subtitle">Gestiona tu contraseña y acceso al sistema.</p>
          </div>

          <div class="security-action-row">
            <div class="action-info">
              <q-icon name="vpn_key" size="24px" color="orange" class="q-mr-md" />
              <div>
                <p class="action-title">Cambiar Contraseña</p>
                <p class="action-desc">
                  Se recomienda usar una contraseña segura que no sea tu número de CI.
                </p>
              </div>
            </div>
            <q-btn
              outline
              color="orange"
              label="Modificar"
              class="btn-rounded"
              @click="showPwdDialog = true"
            />
          </div>
        </div>
      </div>

      <!-- Right Column: Sidebar Info -->
      <div class="side-column">
        <!-- Photo Card -->
        <div class="profile-card photo-card text-center">
          <div class="avatar-container q-mb-md">
            <div class="avatar-large">{{ authStore.avatar }}</div>
            <q-btn round color="primary" icon="camera_alt" size="sm" class="photo-edit-btn" />
          </div>
          <h3 class="user-display-name">{{ authStore.nombreCompleto }}</h3>
          <p class="user-display-role">{{ rolLabel }}</p>
        </div>

        <!-- Institutional Info -->
        <div class="profile-card info-card q-mt-lg">
          <div class="card-header">
            <h2 class="card-title">Datos Institucionales</h2>
          </div>

          <div class="info-list">
            <div class="info-item">
              <p class="info-label">Sede</p>
              <p class="info-value">{{ sedeNombre }}</p>
            </div>
            <q-separator dark class="q-my-sm opacity-10" />
            <div class="info-item">
              <p class="info-label">Carrera Principal</p>
              <p class="info-value">{{ carreraNombre }}</p>
            </div>
            <q-separator dark class="q-my-sm opacity-10" />
            <div v-if="authStore.usuarioActual?.docente?.grado_academico" class="info-item">
              <p class="info-label">Grado Académico</p>
              <p class="info-value">{{ authStore.usuarioActual.docente.grado_academico }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Password Dialog -->
    <q-dialog v-model="showPwdDialog" backdrop-filter="blur(4px)">
      <q-card style="width: 100%; max-width: 400px; border-radius: 16px">
        <q-card-section class="bg-gradient-warning text-white q-py-lg">
          <div class="text-h6 text-weight-bold">Cambiar Contraseña</div>
        </q-card-section>

        <q-card-section class="q-pa-lg q-gutter-md">
          <q-input
            v-model="pwdForm.new"
            label="Nueva Contraseña"
            outlined
            type="password"
            class="input-rounded"
          />
          <q-input
            v-model="pwdForm.confirm"
            label="Confirmar Nueva Contraseña"
            outlined
            type="password"
            class="input-rounded"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md border-top">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup no-caps />
          <q-btn
            unelevated
            label="Actualizar Contraseña"
            color="primary"
            class="btn-rounded"
            :loading="changingPwd"
            @click="handleUpdatePwd"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore, ROLES } from 'src/stores/auth'
import { useQuasar } from 'quasar'

const authStore = useAuthStore()
const $q = useQuasar()

const saving = ref(false)
const showPwdDialog = ref(false)
const changingPwd = ref(false)

const form = ref({
  nombre: '',
  apellido: '',
  ci: '',
  email: '',
  telefono: '',
  formacion: '',
})

const pwdForm = ref({
  new: '',
  confirm: '',
})

onMounted(async () => {
  // Cargar datos actuales del store inmediatamente
  const user = authStore.usuarioActual
  if (user) {
    const nombres = user.nombre.split(' ')
    form.value = {
      nombre: nombres[0] || '',
      apellido: nombres.slice(1).join(' ') || '',
      ci: user.ci || '',
      email: user.email || '',
      telefono: user.telefono || '',
    }
  }

  // Refrescar datos desde el servidor para obtener carreras actualizadas
  await authStore.fetchUser()

  // Actualizar formulario con datos frescos
  const freshUser = authStore.usuarioActual
  if (freshUser) {
    const nombres = freshUser.nombre.split(' ')
    form.value = {
      nombre: nombres[0] || '',
      apellido: nombres.slice(1).join(' ') || '',
      ci: freshUser.ci || '',
      email: freshUser.email || '',
      telefono: freshUser.telefono || '',
      // Cargar formación si existe en el perfil docente
      formacion: freshUser.docente?.formacion || '',
    }
  }
})

const rolLabel = computed(() => {
  const labels = {
    [ROLES.SUPER_ADMIN]: 'Super Administrador',
    [ROLES.ADMIN]: 'Administrador',
    [ROLES.DOCENTE]: 'Docente',
    [ROLES.DIRECTOR_CARRERA]: 'Director de Carrera',
    [ROLES.DIRECCION_ACADEMICA]: 'Dirección Académica',
  }
  return labels[authStore.rol] || 'Usuario'
})

const sedeNombre = computed(() => authStore.usuarioActual?.docente?.sede?.nombre || 'Cochabamba')
const carreraNombre = computed(() => {
  const director = authStore.usuarioActual?.director
  if (director?.carrera) return director.carrera.nombre

  // Si es docente, mostrar todas sus carreras asociadas
  const careers = authStore.usuarioActual?.carreras || []
  if (careers.length > 0) return careers.join(', ')

  return 'General'
})

async function handleSave() {
  if (!form.value.nombre || !form.value.apellido || !form.value.email) {
    $q.notify({ type: 'warning', message: 'Por favor complete los campos obligatorios' })
    return
  }

  saving.value = true
  const result = await authStore.updateProfile(form.value)
  saving.value = false

  if (result.success) {
    // $q.notify({ type: 'positive', message: 'Perfil actualizado correctamente', icon: 'check_circle' }) // Convert to silent
  } else {
    $q.notify({ type: 'negative', message: result.error })
  }
}

// Autosave Logic
let autoSaveTimeout = null
watch(
  form,
  () => {
    saving.value = true
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout)

    autoSaveTimeout = setTimeout(async () => {
      await handleSave()
      saving.value = false
    }, 2000)
  },
  { deep: true },
)

async function handleUpdatePwd() {
  if (pwdForm.value.new !== pwdForm.value.confirm) {
    $q.notify({ type: 'negative', message: 'Las contraseñas no coinciden' })
    return
  }

  if (pwdForm.value.new.length < 6) {
    $q.notify({ type: 'negative', message: 'La contraseña debe tener al menos 6 caracteres' })
    return
  }

  changingPwd.value = true
  const result = await authStore.changePassword(pwdForm.value.new)
  changingPwd.value = false

  if (result.success) {
    $q.notify({ type: 'positive', message: 'Contraseña actualizada' })
    showPwdDialog.value = false
    pwdForm.value = { new: '', confirm: '' }
  } else {
    $q.notify({ type: 'negative', message: result.error })
  }
}
</script>

<style scoped>
.perfil-page {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.perfil-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.section-tag {
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0 0 4px 0;
}

.page-title {
  color: var(--text-primary);
  font-size: 2.25rem;
  font-weight: 800;
  margin: 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.profile-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-header {
  margin-bottom: 24px;
}

.card-title {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.card-subtitle {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.input-rounded :deep(.q-field__control) {
  border-radius: 12px;
}

.btn-rounded {
  border-radius: 12px;
  font-weight: 600;
}

/* Security Card */
.security-action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.action-info {
  display: flex;
  align-items: center;
}

.action-title {
  color: var(--text-primary);
  font-weight: 600;
  margin: 0;
}

.action-desc {
  color: var(--text-muted);
  font-size: 0.75rem;
  margin: 2px 0 0 0;
}

/* Photo Card */
.photo-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar-large {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.photo-edit-btn {
  position: absolute;
  bottom: -5px;
  right: -5px;
  border: 4px solid var(--bg-secondary);
}

.user-display-name {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 700;
  margin: 12px 0 4px 0;
}

.user-display-role {
  color: var(--primary);
  font-weight: 600;
  font-size: 0.875rem;
  margin: 0;
}

/* Info Card */
.info-list {
  display: flex;
  flex-direction: column;
}

.info-item {
  padding: 8px 0;
}

.info-label {
  color: var(--text-muted);
  font-size: 0.75rem;
  margin: 0 0 2px 0;
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.875rem;
  margin: 0;
}

.bg-gradient-warning {
  background: linear-gradient(135deg, #f2994a, #f2c94c);
}

.border-top {
  border-top: 1px solid var(--border-color);
}

.opacity-10 {
  opacity: 0.1;
}
</style>
