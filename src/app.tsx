import './app.css'

import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { APIProvider } from 'solid-google-maps'
import { onMount, Suspense } from 'solid-js'
import { Toaster } from 'solid-toast'

import Footer from '~/modules/common/sections/Footer'
import { Navbar } from '~/modules/common/sections/Navbar'
import UnifiedModalContainer from '~/modules/modal/components/UnifiedModalContainer'
import { env, validateEnvVars } from '~/utils/env'

export default function App() {
  onMount(() => {
    validateEnvVars()
  })

  return (
    <Router
      root={(props) => (
        <>
          <APIProvider
            apiKey={env.VITE_GOOGLE_MAPS_API_KEY}
            libraries={['places']}
          >
            <Toaster />
            <UnifiedModalContainer />
            <Navbar />
            <Suspense>{props.children}</Suspense>
            <Footer />
          </APIProvider>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
