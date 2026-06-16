import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const GOOGLE_SITE_VERIFICATION = 'mS3BhbAKGapcFgu0FsJb_3XDIOMQUuTYAJgR-xLojqk'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'inject-google-verification',
      transformIndexHtml(html) {
        const tag = `<meta name="google-site-verification" content="${GOOGLE_SITE_VERIFICATION}" />`
        if (html.includes('google-site-verification')) return html
        return html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    ${tag}`)
      },
    },
  ],
})
