import { Theme } from '~/modules/theme/domain/theme'

export function createThemeLocalStorage() {
  return {
    saveTheme: (theme: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('app-theme', theme)
      }
    },
    getTheme: (args: { defaultTheme: Theme }): Theme => {
      if (typeof window !== 'undefined') {
        const theme = localStorage.getItem('app-theme')
        if (theme === 'light' || theme === 'dark') {
          return theme
        }

        const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : window.matchMedia('(prefers-color-scheme: light)').matches
            ? 'light'
            : args.defaultTheme
        return preferredTheme
      }
      return args.defaultTheme
    },
  }
}
