import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')?.[1];
const ghPagesBase = process.env.GITHUB_ACTIONS === 'true' && repoName ? `/${repoName}/` : '/';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Familia Meds',
        short_name: 'Meds',
        description: 'Control familiar de medicación, tomas y stock',
        theme_color: '#0b1220',
        background_color: '#0b1220',
        display: 'standalone',
        // relativo para que funcione igual en localhost y en GitHub Pages (/repo/)
        start_url: '.',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: { port: 5173 },
  // GitHub Pages (Project site): https://<user>.github.io/<repo>/
  base: '/FamilyMed/'
});
