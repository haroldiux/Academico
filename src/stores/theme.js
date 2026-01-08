import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Check for saved theme preference or system preference
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const isDark = ref(getInitialTheme())

  // Apply theme to document
  const applyTheme = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('body--dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('body--dark')
    }
  }

  // Initialize theme on load
  applyTheme(isDark.value)

  // Watch for changes and persist
  watch(isDark, (newValue) => {
    localStorage.setItem('theme', newValue ? 'dark' : 'light')
    applyTheme(newValue)
  })

  // Toggle theme
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // Set specific theme
  const setTheme = (dark) => {
    isDark.value = dark
  }

  return {
    isDark,
    toggleTheme,
    setTheme
  }
})
