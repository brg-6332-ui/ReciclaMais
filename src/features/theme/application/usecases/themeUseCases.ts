import { createEffect, createRoot, onMount } from 'solid-js'

import { createThemeStore } from '~/features/theme/application/store/themeStore'
import { DEFAULT_THEME, Theme } from '~/features/theme/domain/theme'
import { createThemeLocalStorage } from '~/features/theme/infrastructure/themeLocalStorage'

const { themeStore } = createRoot(() => {
  const themeStore = createThemeStore()
  const themeLocalStorage = createThemeLocalStorage()

  onMount(() => {
    const savedTheme = themeLocalStorage.getTheme({
      defaultTheme: DEFAULT_THEME,
    })
    themeStore.setTheme(savedTheme)
  })

  createEffect(() => {
    themeLocalStorage.saveTheme(themeStore.theme())
    document.documentElement.setAttribute('data-theme', themeStore.theme())
  })

  return { themeStore, themeLocalStorage }
})

export const themeUseCases = {
  toggleTheme: () => {
    themeStore.setTheme((prevTheme) =>
      prevTheme === 'light' ? 'dark' : 'light',
    )
  },
  currentTheme: (): Theme => {
    return themeStore.theme()
  },
}
