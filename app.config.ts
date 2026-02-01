import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import fs from 'fs';
export default defineConfig({
  ssr: false,
  vite: (() => {
    const hasCerts = fs.existsSync('./.cert/key.pem') && fs.existsSync('./.cert/cert.pem')
    // Base server config: bind to localhost and keep a stable port so the HMR websocket
    // stays on the same host/port as the HTTP server. When using HTTPS certs, enable https.
    const serverBase: Record<string, unknown> = {
      host: 'localhost',
      port: 3000,
      // Do not hardcode the HMR port here. Let Vite use the same HTTP server port when possible.
      // Provide protocol/host so client uses the correct scheme/host; omit `port` to avoid
      // mismatches if the dev server falls back to another free port.
      hmr: {
        protocol: hasCerts ? 'wss' : 'ws',
        host: 'localhost',
      },
    }

    const server = hasCerts
      ? {
          ...serverBase,
          https: {
            key: fs.readFileSync('./.cert/key.pem'),
            cert: fs.readFileSync('./.cert/cert.pem'),
          },
        }
      : serverBase

    return {
      server,
      plugins: [tailwindcss()],
      ssr: {
        noExternal: ['@googlemaps/markerclusterer'],
      },
    }
  })(),
});
