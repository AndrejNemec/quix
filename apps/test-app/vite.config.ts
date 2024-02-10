import { defineConfig } from 'quix/config'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

export default defineConfig({
    quix: {
        ssr: true
    },
    plugins: [TanStackRouterVite()],
    resolve: {
        alias: {
            '~': './src'
        }
    }
})