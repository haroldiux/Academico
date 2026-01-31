<template>
  <q-layout view="lHh Lpr fff">
    <q-page-container>
      <q-page class="fullscreen-bg flex flex-center">

        <!-- Animated Background Shapes -->
        <div class="absolute-full overflow-hidden">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
        </div>

        <!-- Main Card Container -->
        <div class="login-card shadow-24 relative-position bg-white rounded-borders overflow-hidden row q-ma-md">

          <!-- Desktop: Left Panel (Branding) -->
          <div class="col-md-5 col-xs-12 bg-branding flex flex-center q-pa-lg relative-position gt-sm">
            <div class="text-center text-white z-top">
              <img src="/unitepc-logo-clean.png" style="width: 100px; filter: brightness(0) invert(1);"
                class="q-mb-md opacity-90" />
              <h3 class="text-h4 text-weight-bolder q-ma-none q-mb-xs">UNITEPC</h3>
              <div class="text-subtitle2 text-uppercase tracking-widest opacity-80 q-mb-lg">Documentación Académica
              </div>
              <p class="text-body2 opacity-80" style="max-width: 250px; margin: 0 auto;">
                Plataforma integral para la gestión académica.
              </p>
            </div>
            <!-- Decorative overlay -->
            <div class="absolute-full bg-overlay"></div>
          </div>

          <!-- Form Panel -->
          <div class="col-md-7 col-xs-12 q-pa-xl flex flex-center relative-position bg-white column">

            <!-- Mobile Logo (Visible only on xs/sm) -->
            <div class="lt-md q-mb-md text-center">
              <img src="/unitepc-logo-clean.png" style="width: 80px;" class="q-mb-sm" />
              <div class="text-h6 text-primary text-weight-bold">UNITEPC</div>
            </div>

            <div class="full-width" style="max-width: 360px">
              <div class="text-left q-mb-lg">
                <h5 class="text-h5 text-weight-bold q-ma-none text-grey-9">¡Hola! 👋</h5>
                <p class="text-grey-7 q-mt-xs">Inicia sesión para continuar.</p>
              </div>

              <q-form @submit.prevent="handleLogin" class="q-gutter-y-md">
                <q-input v-model="username" outlined label="Usuario / CI" placeholder="Ej: 67760520"
                  class="input-modern" bg-color="grey-1" dense :rules="[val => !!val || 'Requerido']">
                  <template v-slot:prepend>
                    <q-icon name="person" class="text-grey-5" />
                  </template>
                </q-input>

                <q-input v-model="password" outlined :type="showPassword ? 'text' : 'password'" label="Contraseña"
                  class="input-modern" bg-color="grey-1" dense :rules="[val => !!val || 'Requerida']">
                  <template v-slot:prepend>
                    <q-icon name="lock" class="text-grey-5" />
                  </template>
                  <template v-slot:append>
                    <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer text-grey-5"
                      @click="showPassword = !showPassword" />
                  </template>
                </q-input>

                <div class="row items-center justify-between q-mt-none">
                  <q-checkbox v-model="rememberMe" label="Recordarme" color="primary" size="sm" class="text-grey-8" />
                  <a href="#" class="text-primary text-weight-medium text-caption"
                    style="text-decoration: none;">Recuperar acceso</a>
                </div>

                <q-btn type="submit" color="primary" class="full-width q-py-sm shadow-1 q-mt-md btn-modern"
                  label="Ingresar" :loading="loading" no-caps unelevated size="lg" />
              </q-form>

              <div v-if="error" class="q-mt-md">
                <q-banner class="bg-red-1 text-red-9 rounded-borders text-caption" dense>
                  <template v-slot:avatar>
                    <q-icon name="error" color="red" size="xs" />
                  </template>
                  {{ error }}
                </q-banner>
              </div>
            </div>

            <div class="absolute-bottom text-center q-pb-md text-caption text-grey-4">
              v2.0 &bull; UNITEPC
            </div>
          </div>
        </div>

        <!-- Dialog: Cambio de Contraseña (Responsive) -->
        <q-dialog v-model="showChangePassword" persistent backdrop-filter="blur(5px)">
          <q-card class="bg-white rounded-borders shadow-24" style="width: 100%; max-width: 400px; margin: 20px;">
            <q-card-section class="bg-primary text-white q-py-lg text-center relative-position overflow-hidden">
              <div class="absolute-full bg-decoration opacity-20"></div>
              <q-avatar icon="lock_reset" color="white" text-color="primary" size="lg" class="q-mb-sm shadow-3" />
              <div class="text-h6 text-weight-bold">Seguridad de Cuenta</div>
              <div class="text-caption opacity-90">Actualiza tu contraseña para continuar</div>
            </q-card-section>

            <q-card-section class="q-pa-lg">
              <q-form @submit.prevent="handleChangePassword" class="q-gutter-y-md">
                <q-input v-model="currentPasswordChange" outlined readonly dense label="Usuario" bg-color="grey-1">
                  <template v-slot:prepend><q-icon name="badge" color="grey-6" /></template>
                </q-input>

                <q-input v-model="newPassword" outlined :type="showNewPwd ? 'text' : 'password'"
                  label="Nueva contraseña" dense :rules="[val => val.length >= 6 || 'Min. 6 caracteres']">
                  <template v-slot:prepend><q-icon name="key" color="primary" /></template>
                  <template v-slot:append>
                    <q-btn flat round dense :icon="showNewPwd ? 'visibility_off' : 'visibility'"
                      @click="showNewPwd = !showNewPwd" />
                  </template>
                </q-input>

                <q-input v-model="confirmPassword" outlined :type="showConfirmPwd ? 'text' : 'password'"
                  label="Confirmar contraseña" dense :rules="[val => val === newPassword || 'No coinciden']">
                  <template v-slot:prepend><q-icon name="check_circle" color="primary" /></template>
                  <template v-slot:append>
                    <q-btn flat round dense :icon="showConfirmPwd ? 'visibility_off' : 'visibility'"
                      @click="showConfirmPwd = !showConfirmPwd" />
                  </template>
                </q-input>

                <div v-if="changeError" class="q-px-sm q-py-xs bg-red-1 text-red text-caption rounded-borders">
                  {{ changeError }}
                </div>

                <div class="row justify-end q-mt-md">
                  <q-btn type="submit" color="primary" label="Actualizar" class="full-width btn-modern"
                    :loading="changingPassword" no-caps unelevated />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

// Login form
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')

// Change password dialog
const showChangePassword = ref(false)
const currentPasswordChange = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPwd = ref(false)
const showConfirmPwd = ref(false)
const changingPassword = ref(false)
const changeError = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  await new Promise(resolve => setTimeout(resolve, 800))

  const result = await authStore.login(username.value, password.value)
  loading.value = false

  if (result.success) {
    if (result.passwordChangeRequired) {
      currentPasswordChange.value = password.value
      showChangePassword.value = true
    } else {
      $q.notify({
        type: 'positive',
        message: `Bienvenido, ${result.usuario.nombre}`,
        position: 'top',
        timeout: 2500
      })
      router.push('/')
    }
  } else {
    error.value = result.error
  }
}

async function handleChangePassword() {
  changingPassword.value = true
  changeError.value = ''
  const result = await authStore.changePassword(password.value, newPassword.value)
  changingPassword.value = false

  if (result.success) {
    showChangePassword.value = false
    $q.notify({ type: 'positive', message: 'Contraseña actualizada.', position: 'top' })
    router.push('/')
  } else {
    changeError.value = result.error
  }
}
</script>

<style scoped>
.fullscreen-bg {
  background: #f0f2f5;
  background-image: radial-gradient(#e1e8ed 1px, transparent 1px);
  /* Subtle pattern */
  background-size: 20px 20px;
}

.login-card {
  width: 100%;
  max-width: 900px;
  min-height: 550px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
}

.bg-branding {
  background: linear-gradient(135deg, #003366 0%, #0055A4 100%);
}

.bg-overlay {
  background: url('/unitepc-logo-clean.png') no-repeat center center;
  background-size: 600px;
  opacity: 0.05;
  filter: grayscale(100%);
}

.input-modern :deep(.q-field__control) {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.input-modern :deep(.q-field__control:hover) {
  background: #ffffff;
}

.btn-modern {
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.5px;
}

.opacity-90 {
  opacity: 0.9;
}

.opacity-80 {
  opacity: 0.8;
}

.tracking-widest {
  letter-spacing: 2px;
}

/* Responsive adjustments */
@media (max-width: 1023px) {
  .login-card {
    max-width: 450px;
    min-height: auto;
    flex-direction: column;
  }
}
</style>
