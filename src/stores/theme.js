import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Forzar siempre modo claro
  const isDark = ref(false)

  // Forzar tema claro en localStorage y DOM
  const applyTheme = () => {
    localStorage.setItem('theme', 'light')
    document.documentElement.classList.remove('dark')
    document.body.classList.remove('body--dark')
  }

  // Aplicar tema claro al cargar
  applyTheme()

  // Toggle deshabilitado - siempre modo claro
  const toggleTheme = () => {
    // No hace nada - modo oscuro deshabilitado
    console.warn('Modo oscuro deshabilitado')
  }

  // Set theme deshabilitado
  const setTheme = () => {
    // Siempre forzar modo claro
    isDark.value = false
    applyTheme()
  }

  // Alias usado en ConfiguracionPage
  const setDarkMode = setTheme

  return {
    isDark,
    toggleTheme,
    setTheme,
    setDarkMode
  }
})
