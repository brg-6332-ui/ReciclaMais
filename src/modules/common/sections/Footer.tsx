import { A } from '@solidjs/router'

import logo from '~/assets/logo.png'

export function Footer() {
  return (
    <footer class="bg-base-100 border-t border-base-300/50 mt-20">
      <div class="container mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <div class="h-10 w-10 rounded-full bg-base-200 flex items-center justify-center shadow-lg overflow-clip">
                <A href="/" class="flex items-center select-none">
                  <img src={logo} alt="ReciclaMais" class="h-10" />
                </A>
              </div>
              <span class="font-bold text-xl text-base-content tracking-tight">
                ReciclaMais
              </span>
            </div>
            <p class="text-sm text-base-content/60">
              A transformar reciclagem em recompensas. Juntos por um planeta
              mais sustentável.
            </p>
          </div>

          <div>
            <h3 class="font-semibold mb-4 text-base-content/90">Links Úteis</h3>
            <ul class="space-y-2">
              <li>
                <A
                  class="text-sm text-base-content/60 hover:text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  href="/"
                >
                  Início
                </A>
              </li>
              <li>
                <A
                  class="text-sm text-base-content/60 hover:text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  href="/collection-points"
                >
                  Pontos de Recolha
                </A>
              </li>
              <li>
                <A
                  class="text-sm text-base-content/60 hover:text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  href="/guide"
                >
                  Guia de Reciclagem
                </A>
              </li>
              <li>
                <A
                  class="text-sm text-base-content/60 hover:text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  href="/about"
                >
                  Sobre Nós
                </A>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold mb-4 text-base-content/90">Contacto</h3>
            <ul class="space-y-2">
              <li class="flex items-center gap-2 text-sm text-base-content/60">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-mail h-4 w-4"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                info@reciclamais.pt
              </li>
              <li class="flex items-center gap-2 text-sm text-base-content/60">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-phone h-4 w-4"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                +351 123 456 789
              </li>
              <li class="flex items-center gap-2 text-sm text-base-content/60">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-map-pin h-4 w-4"
                >
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Braga, Portugal
              </li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold mb-4 text-base-content/90">
              Redes Sociais
            </h3>
            <div class="flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                class="h-10 w-10 rounded-full bg-base-200/60 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-facebook h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a
                href="#"
                aria-label="Twitter"
                class="h-10 w-10 rounded-full bg-base-200/60 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-twitter h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                class="h-10 w-10 rounded-full bg-base-200/60 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-instagram h-5 w-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                class="h-10 w-10 rounded-full bg-base-200/60 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-linkedin h-5 w-5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div class="border-t border-base-300/40 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-sm text-base-content/50 text-center md:text-left">
            © 2025–2026 ReciclaMais. Todos os direitos reservados.
          </p>
          <div class="flex gap-6 text-sm text-base-content/50">
            <A
              class="hover:text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              href="/terms"
            >
              Termos de Uso
            </A>
            <A
              class="hover:text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              href="/privacy"
            >
              Política de Privacidade
            </A>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
