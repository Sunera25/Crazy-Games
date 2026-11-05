import { defineConfig } from 'vite'

// CrazyGames serves the game from a subpath on their CDN, so all asset
// URLs must be relative ('./assets/...'), never absolute ('/assets/...').
export default defineConfig({
  base: './'
})
