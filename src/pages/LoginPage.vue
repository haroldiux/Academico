<template>
  <q-layout view="lHh Lpr fff">
    <q-page-container>
      <q-page class="login-page row window-height">

        <!-- Left Panel: Branding & Decorative -->
        <div class="col-12 col-md-6 bg-branding flex flex-center text-white relative-position overflow-hidden">
          <!-- Animated Background Shapes -->
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>

          <!-- Content -->
          <div class="branding-content text-center q-pa-xl relative-position glass-panel animate-fade-up">
            <div class="logo-container q-mb-lg">
              <img src="/logo.png" alt="UNITEPC" class="logo-img shadow-10 rounded-borders" onerror="this.style.display='none'" />
            </div>
            <h2 class="text-h3 text-weight-bolder q-ma-none text-uppercase tracking-wider">UNITEPC</h2>
            <div class="text-subtitle1 text-uppercase text-weight-medium q-mb-md tracking-widest opacity-80">Sistema Académico</div>
            <p class="text-h6 text-weight-light opacity-90" style="max-width: 400px; margin: 0 auto;">
              Gestión integral para docentes, estudiantes y administrativos.
            </p>
          </div>
        </div>

        <!-- Right Panel: Login Form -->
        <div class="col-12 col-md-6 bg-white flex flex-center relative-position">
          <div class="form-container q-pa-xl full-width" style="max-width: 550px">

            <div class="text-left q-mb-xl animate-fade-in-delayed">
              <h4 class="text-primary text-weight-bold q-ma-none q-mb-sm">Bienvenido de nuevo</h4>
              <p class="text-grey-7 text-body1">Ingresa tus credenciales para acceder a tu cuenta.</p>
            </div>

            <q-form @submit.prevent="handleLogin" class="q-gutter-y-lg animate-fade-in-delayed-2">
              <q-input
                v-model="username"
                outlined
                label="Usuario / CI"
                placeholder="Ej: 1234567"
                class="input-rounded"
                bg-color="grey-1"
                :rules="[val => !!val || 'El usuario es requerido']"
                hide-bottom-space
              >
                <template v-slot:prepend>
                  <q-icon name="person_outline" color="primary" />
                </template>
              </q-input>

              <q-input
                v-model="password"
                outlined
                :type="showPassword ? 'text' : 'password'"
                label="Contraseña"
                placeholder="••••••"
                class="input-rounded"
                bg-color="grey-1"
                :rules="[val => !!val || 'La contraseña es requerida']"
                hide-bottom-space
              >
                <template v-slot:prepend>
                  <q-icon name="lock_outline" color="primary" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer text-grey-6"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>

              <div class="row items-center justify-between q-mt-sm">
                <q-checkbox v-model="rememberMe" label="Recordarme" color="primary" dense size="sm" class="text-grey-8" />
                <a href="#" class="text-primary text-weight-medium" style="text-decoration: none; font-size: 0.9rem">¿Olvidaste tu contraseña?</a>
              </div>

              <q-btn
                type="submit"
                color="primary"
                class="full-width q-py-md btn-rounded shadow-3 text-weight-bold"
                label="Iniciar Sesión"
                :loading="loading"
                no-caps
                unelevated
                size="lg"
              >
                <template v-slot:loading>
                  <q-spinner-dots class="on-left" />
                  Validando...
                </template>
              </q-btn>
            </q-form>

            <div v-if="error" class="q-mt-lg animate-shake">
              <q-banner class="bg-red-1 text-red-9 rounded-borders border-red" dense>
                <template v-slot:avatar>
                  <q-icon name="error_outline" color="red-9" />
                </template>
                {{ error }}
              </q-banner>
            </div>

            <div class="text-center q-mt-xl text-grey-5 text-caption">
              Sistema Académico v2.0 &bull; UNITEPC
            </div>
          </div>
        </div>

        <!-- Dialog: Cambio de Contraseña Obligatorio (Modernizado) -->
        <q-dialog v-model="showChangePassword" persistent backdrop-filter="blur(4px)">
          <q-card style="min-width: 450px; border-radius: 20px;" class="shadow-20">
            <q-card-section class="bg-gradient-warning text-white q-py-lg">
              <div class="text-h6 text-weight-bold flex items-center">
                <q-icon name="lock_reset" size="28px" class="q-mr-sm" />
                Actualización de Seguridad
              </div>
              <div class="text-subtitle2 opacity-80">Tu contraseña debe ser actualizada</div>
            </q-card-section>

            <q-card-section class="q-pa-lg">
              <p class="text-grey-8 q-mb-lg text-body1">
                Es tu primer inicio de sesión o tu contraseña ha expirado. Por favor, define una nueva contraseña segura.
              </p>

              <q-form @submit.prevent="handleChangePassword" class="q-gutter-md">
                <q-input
                  v-model="currentPasswordChange"
                  outlined
                  readonly
                  label="Usuario (CI)"
                  class="input-rounded"
                  bg-color="grey-2"
                  hint="Tu usuario actual"
                >
                  <template v-slot:prepend>
                    <q-icon name="fingerprint" color="grey-7" />
                  </template>
                </q-input>

                <q-input
                  v-model="newPassword"
                  outlined
                  :type="showNewPwd ? 'text' : 'password'"
                  label="Nueva Contraseña"
                  class="input-rounded"
                  :rules="[
                    val => !!val || 'Requerido',
                    val => val.length >= 6 || 'Mínimo 6 caracteres'
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="vpn_key" color="primary" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showNewPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showNewPwd = !showNewPwd"
                    />
                  </template>
                </q-input>

                <q-input
                  v-model="confirmPassword"
                  outlined
                  :type="showConfirmPwd ? 'text' : 'password'"
                  label="Confirmar Nueva Contraseña"
                  class="input-rounded"
                  :rules="[
                    val => !!val || 'Requerido',
                    val => val === newPassword || 'Las contraseñas no coinciden'
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="check_circle_outline" color="primary" />
                  </template>
                   <template v-slot:append>
                    <q-icon
                      :name="showConfirmPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showConfirmPwd = !showConfirmPwd"
                    />
                  </template>
                </q-input>

                <div v-if="changeError" class="q-mb-md">
                  <q-banner class="bg-red-1 text-red-9 rounded-borders border-red" dense>
                    {{ changeError }}
                  </q-banner>
                </div>

                <div class="row justify-end q-mt-lg">
                  <q-btn
                    type="submit"
                    color="primary"
                    class="full-width btn-rounded shadow-2"
                    label="Actualizar y Continuar"
                    :loading="changingPassword"
                    no-caps
                    unelevated
                    size="md"
                  />
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

  // Simulating network delay for effect
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
        icon: 'verified',
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

  const result = await authStore.changePassword(password.value, newPassword.value) // Use original pwd as current

  changingPassword.value = false

  if (result.success) {
    showChangePassword.value = false
    $q.notify({
      type: 'positive',
      message: 'Contraseña actualizada. Bienvenido.',
      icon: 'check_circle',
      position: 'top'
    })
    router.push('/')
  } else {
    changeError.value = result.error
  }
}
</script>

<style scoped>
/* Modern Gradient Background */
.bg-branding {
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%); /* Deep Professional Blue/Dark */
  /* Alternative vibrant: background: linear-gradient(45deg, #85FFBD 0%, #FFFB7D 100%);  Too much? */
  background: linear-gradient(135deg, #003366 0%, #0055A4 100%); /* UNITEPC-ish Blue */
}

.opacity-80 { opacity: 0.8; }
.opacity-90 { opacity: 0.9; }
.tracking-wider { letter-spacing: 2px; }
.tracking-widest { letter-spacing: 3px; }

/* Abstract Shapes */
.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 10s infinite ease-in-out;
}
.shape-1 {
  width: 300px;
  height: 300px;
  background: #4facfe;
  top: -50px;
  left: -50px;
  animation-delay: 0s;
}
.shape-2 {
  width: 400px;
  height: 400px;
  background: #00f2fe;
  bottom: -100px;
  right: -50px;
  animation-delay: -2s;
}
.shape-3 {
  width: 200px;
  height: 200px;
  background: #ffffff;
  top: 40%;
  left: 40%;
  opacity: 0.1;
  animation-delay: -5s;
}

@keyframes float {
  0% { transform: translate(0, 0); }
  50% { transform: translate(20px, 40px); }
  100% { transform: translate(0, 0); }
}

/* Glass Panel on Branding */
.glass-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

/* Logo */
.logo-img {
  width: 120px;
  height: auto;
  background: white;
  padding: 10px;
}

/* Form Styles */
.input-rounded :deep(.q-field__control) {
  border-radius: 12px;
}
.btn-rounded {
  border-radius: 12px;
  letter-spacing: 0.5px;
}

.bg-gradient-warning {
  background: linear-gradient(to right, #f2994a, #f2c94c);
}

.border-red {
  border: 1px solid #ffcdd2;
}

/* Animations */
.animate-fade-up {
  animation: fadeUp 0.8s ease-out;
}
.animate-fade-in-delayed {
  animation: fadeIn 0.8s ease-out 0.3s backwards;
}
.animate-fade-in-delayed-2 {
  animation: fadeIn 0.8s ease-out 0.5s backwards;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Mobile Responsiveness */
@media (max-width: 1023px) {
  .login-page {
    flex-direction: column;
  }
  .bg-branding {
    min-height: 35vh;
  }
}
</style>


