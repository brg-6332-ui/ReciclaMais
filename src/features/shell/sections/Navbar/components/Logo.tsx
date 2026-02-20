import { A } from '@solidjs/router'

import logo from '~/assets/logo2.png'

/**
 * Logo component displayed in the navbar
 */
export function Logo() {
  return (
    <div class="rounded-full bg-base-400/20 overflow-clip p-1">
      <A href="/" class="flex items-center gap-3 select-none">
        <img src={logo} alt="Recicla+" class="h-10" />
      </A>
    </div>
  )
}
