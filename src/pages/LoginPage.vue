<template>
  <q-layout view="lHh Lpr fff">
    <q-page-container>
      <q-page class="fullscreen-bg flex flex-center">
        <!-- Dynamic Background Elements -->
        <div class="absolute-full overflow-hidden">
          <div class="blob blob-1"></div>
          <div class="blob blob-2"></div>
          <div class="blob blob-3"></div>
          <div class="glass-overlay absolute-full"></div>
        </div>

        <!-- Main Card Container -->
        <div class="login-card shadow-24 relative-position row overflow-hidden animate-pop-in">
          <!-- BRANDING PANEL (Left/Top) -->
          <div
            class="col-md-5 col-xs-12 branding-panel relative-position flex flex-center q-pa-lg text-white"
          >
            <div class="absolute-full overlay-gradient"></div>

            <div class="relative-position z-top text-center" style="width: 100%">
              <div class="logo-circle shadow-10 q-mb-lg">
                <img src="/unitepc-logo-clean.png" class="logo-img" alt="UNITEPC Logo" />
              </div>

              <h1 class="text-h4 text-weight-bolder q-my-sm tracking-wide">UNITEPC</h1>
              <div class="text-subtitle2 text-uppercase opacity-70 tracking-widest q-mb-xl">
                Documentación Académica
              </div>

              <div class="gt-sm">
                <p class="text-body1 text-italic opacity-90 q-mb-none">
                  "Excelencia académica y gestión integral."
                </p>
                <div class="separator-small q-my-md q-mx-auto bg-white opacity-50"></div>
                <p class="text-caption opacity-70">
                  Acceso exclusivo para docentes y administrativos.
                </p>
              </div>
            </div>
          </div>

          <!-- FORM PANEL (Right/Bottom) -->
          <div class="col-md-7 col-xs-12 form-panel bg-white flex flex-center relative-position">
            <div class="form-content full-width q-pa-xl">
              <div class="text-left q-mb-lg">
                <h4 class="text-primary text-weight-bold q-mb-xs">Bienvenido</h4>
                <p class="text-grey-7">Ingresa tus credenciales para continuar.</p>
              </div>

              <q-form @submit.prevent="handleLogin" class="q-gutter-y-md">
                <q-input
                  v-model="username"
                  filled
                  label="Usuario / CI"
                  class="input-premium"
                  color="primary"
                  bg-color="grey-1"
                  :rules="[(val) => !!val || 'El usuario es requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="account_circle" color="primary" />
                  </template>
                </q-input>

                <q-input
                  v-model="password"
                  filled
                  :type="showPassword ? 'text' : 'password'"
                  label="Contraseña"
                  class="input-premium"
                  color="primary"
                  bg-color="grey-1"
                  :rules="[(val) => !!val || 'La contraseña es requerida']"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="primary" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer opacity-50 hover-opacity-100"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>

                <div class="row items-center justify-between q-mt-sm">
                  <q-checkbox
                    v-model="rememberMe"
                    label="Recordarme"
                    color="primary"
                    dense
                    class="text-body2 text-grey-8"
                  />
                  <a href="#" class="link-forget text-primary text-weight-bold text-caption">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <q-btn
                  type="submit"
                  color="primary"
                  class="full-width btn-hero shadow-3 q-mt-lg"
                  label="INICIAR SESIÓN"
                  :loading="loading"
                  unelevated
                  size="lg"
                />
              </q-form>

              <!-- Error Banner -->
              <transition name="fade">
                <div v-if="error" class="q-mt-md">
                  <q-banner class="bg-red-1 text-red-9 rounded-borders border-red-left" dense>
                    <template v-slot:avatar>
                      <q-icon name="warning" color="red-9" />
                    </template>
                    {{ error }}
                  </q-banner>
                </div>
              </transition>

              <div class="text-center q-mt-xl text-caption text-grey-4">
                &copy; 2026 UNITEPC &bull; v2.1
              </div>
            </div>
          </div>
        </div>

        <!-- Dialog: Change Password (FIXED CLEAN DESIGN) -->
        <q-dialog v-model="showChangePassword" persistent backdrop-filter="blur(4px)">
          <q-card class="bg-white shadow-24 rounded-borders" style="width: 100%; max-width: 450px">
            <q-card-section class="bg-primary text-white q-py-lg text-center">
              <div class="q-mb-sm">
                <q-avatar
                  color="white"
                  text-color="primary"
                  icon="lock_reset"
                  size="50px"
                  class="shadow-2"
                />
              </div>
              <div class="text-h6 text-weight-bold">Actualización de Seguridad</div>
              <div class="text-caption opacity-90">
                Tu contraseña ha expirado o es el primer acceso
              </div>
            </q-card-section>

            <q-card-section class="q-px-lg q-pt-lg q-pb-md">
              <p class="text-grey-8 text-center q-mb-md">
                Por favor, establece una nueva contraseña segura para tu cuenta.
              </p>

              <q-form @submit.prevent="handleChangePassword" class="q-gutter-y-md">
                <q-input
                  outlined
                  v-model="currentPasswordChange"
                  label="Usuario / CI"
                  readonly
                  bg-color="grey-1"
                  dense
                >
                  <template v-slot:prepend><q-icon name="person" color="grey-6" /></template>
                </q-input>

                <q-input
                  outlined
                  v-model="newPassword"
                  :type="showNewPwd ? 'text' : 'password'"
                  label="Nueva Contraseña"
                  :rules="[(val) => val.length >= 6 || 'Mínimo 6 caracteres']"
                  bg-color="white"
                >
                  <template v-slot:prepend><q-icon name="vpn_key" color="primary" /></template>
                  <template v-slot:append>
                    <q-btn
                      flat
                      round
                      dense
                      :icon="showNewPwd ? 'visibility_off' : 'visibility'"
                      @click="showNewPwd = !showNewPwd"
                      color="grey-7"
                    />
                  </template>
                </q-input>

                <q-input
                  outlined
                  v-model="confirmPassword"
                  :type="showConfirmPwd ? 'text' : 'password'"
                  label="Confirmar Contraseña"
                  :rules="[(val) => val === newPassword || 'No coinciden']"
                  bg-color="white"
                >
                  <template v-slot:prepend><q-icon name="check_circle" color="primary" /></template>
                  <template v-slot:append>
                    <q-btn
                      flat
                      round
                      dense
                      :icon="showConfirmPwd ? 'visibility_off' : 'visibility'"
                      @click="showConfirmPwd = !showConfirmPwd"
                      color="grey-7"
                    />
                  </template>
                </q-input>

                <div
                  v-if="changeError"
                  class="q-pa-sm bg-red-1 text-red-9 rounded-borders text-center text-caption"
                >
                  <q-icon name="warning" class="q-mr-xs" /> {{ changeError }}
                </div>

                <div class="row q-mt-md">
                  <q-btn
                    type="submit"
                    color="primary"
                    label="Confirmar Cambio"
                    class="full-width q-py-sm text-weight-bold shadow-2 btn-rounded"
                    :loading="changingPassword"
                    unelevated
                    no-caps
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

// State
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')

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
  // Fake UX delay
  await new Promise((resolve) => setTimeout(resolve, 800))

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
        timeout: 2500,
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

  const result = await authStore.changePassword(newPassword.value)

  changingPassword.value = false
  if (result.success) {
    showChangePassword.value = false
    $q.notify({ type: 'positive', message: '¡Contraseña actualizada!', position: 'top' })
    router.push('/')
  } else {
    changeError.value = result.error
  }
}
</script>

<style scoped>
/* PAGE BACKGROUND */
.fullscreen-bg {
  background: radial-gradient(circle at 10% 20%, rgb(0, 32, 96) 0%, rgb(0, 0, 0) 90%);
  position: relative;
}

/* BACKGROUND BLOBS ANIMATION */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: floatBlobs 10s infinite alternate ease-in-out;
}

.blob-1 {
  top: -10%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: #0056b3;
}

.blob-2 {
  bottom: -10%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: #004080;
  animation-delay: -5s;
}

.blob-3 {
  top: 40%;
  left: 40%;
  width: 300px;
  height: 300px;
  background: #00aaff;
  opacity: 0.2;
}

@keyframes floatBlobs {
  0% {
    transform: translate(0, 0) scale(1);
  }

  100% {
    transform: translate(30px, 50px) scale(1.1);
  }
}

/* MAIN CARD CONTAINER */
.login-card {
  width: 1000px;
  max-width: 90vw;
  min-height: 600px;
  background: white;
  border-radius: 24px;
  z-index: 10;
}

/* BRANDING PANEL */
.branding-panel {
  background: url('/unitepc-logo-clean.png') no-repeat center center;
  /* Fallback */
  background-size: cover;
}

.overlay-gradient {
  background: linear-gradient(135deg, #0d47a1 0%, #002171 100%);
  opacity: 0.95;
}

.logo-circle {
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 50%;
  padding: 20px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  width: 100%;
  height: auto;
}

/* FORM PANEL */
.input-premium :deep(.q-field__control) {
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 0.3s;
}

.input-premium :deep(.q-field__control:before) {
  border: none;
}

.input-premium :deep(.q-field__control:hover) {
  background: #f5f5f5;
}

.input-premium :deep(.q-field__native) {
  font-weight: 500;
}

.btn-hero {
  border-radius: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  font-size: 1rem;
  background: linear-gradient(90deg, #0d47a1 0%, #1976d2 100%);
  transition: transform 0.2s;
}

.btn-hero:active {
  transform: scale(0.98);
}

.link-forget {
  text-decoration: none;
  font-size: 0.85rem;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.link-forget:hover {
  opacity: 1;
}

.border-red-left {
  border-left: 4px solid #d32f2f;
}

/* DIALOG STYLES (Fixed) */
.dialog-card {
  /* Using utility classes instead */
}

/* UTILS */
.opacity-70 {
  opacity: 0.7;
}

.opacity-90 {
  opacity: 0.9;
}

.tracking-wide {
  letter-spacing: 1px;
}

.tracking-widest {
  letter-spacing: 2px;
}

.separator-small {
  height: 2px;
  width: 40px;
}

.hover-opacity-100:hover {
  opacity: 1;
}

.animate-pop-in {
  animation: popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* RESPONSIVENESS */
@media (max-width: 1023px) {
  .login-card {
    flex-direction: column;
    width: 90vw;
    margin: 20px;
    height: auto;
    min-height: auto;
  }

  .branding-panel {
    padding: 30px;
    min-height: 200px;
  }

  .logo-circle {
    width: 80px;
    height: 80px;
    padding: 15px;
  }

  .branding-panel h1 {
    font-size: 1.8rem;
  }

  .form-content {
    padding: 30px !important;
  }
}
</style>
