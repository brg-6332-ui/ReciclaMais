import { createSignal } from 'solid-js'

import { DEFAULT_THEME, Theme } from '~/modules/theme/domain/theme'

export function createThemeStore() {
  const [theme, setTheme] = createSignal<Theme>(DEFAULT_THEME)
  return {
    theme,
    setTheme,
  }
}
