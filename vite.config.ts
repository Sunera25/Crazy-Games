import { defineConfig } from 'vite'

// Both portals serve the game from a subpath on their CDN, so all asset
// URLs must be relative ('./assets/...'), never absolute ('/assets/...').
//
// Build modes:
//   default            (npm run build)    -> CrazyGames build into dist/
//   gamedistribution   (npm run build:gd) -> GameDistribution build into
//     dist-gd/. Set the GD_GAME_ID environment variable to bake in the real
//     game id from the GameDistribution portal (Upload tab).

const GD_GAME_ID = process.env.GD_GAME_ID ?? 'YOUR_GAMEDISTRIBUTION_GAME_ID'

const gdSnippet = [
  '<script>',
  'window["GD_OPTIONS"] = {',
  '  gameId: "' + GD_GAME_ID + '",',
  '  onEvent: function (event) {',
  '    var names = { SDK_READY: "gd:ready", SDK_GAME_PAUSE: "gd:pause", SDK_GAME_START: "gd:start", SDK_REWARDED_WATCH_COMPLETE: "gd:rewarded" };',
  '    var forwarded = names[event.name];',
  '    if (forwarded) window.dispatchEvent(new CustomEvent(forwarded));',
  '  }',
  '};',
  '(function (d, s, id) {',
  '  var js, fjs = d.getElementsByTagName(s)[0];',
  '  if (d.getElementById(id)) return;',
  '  js = d.createElement(s); js.id = id;',
  "  js.src = 'https://html5.api.gamedistribution.com/main.min.js';",
  '  fjs.parentNode.insertBefore(js, fjs);',
  "}(document, 'script', 'gamedistribution-jssdk'));",
  '</script>'
].join('\n')

const crazyGamesSnippet = '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>'

export default defineConfig(({ mode }) => {
  const isGd = mode === 'gamedistribution'
  const isApp = mode === 'app'
  return {
    base: './',
    build: { outDir: isGd ? 'dist-gd' : isApp ? 'dist-app' : 'dist' },
    plugins: [
      {
        name: 'platform-sdk',
        transformIndexHtml(html: string) {
          return html.replace('<!--PLATFORM_SDK-->', isGd ? gdSnippet : isApp ? '' : crazyGamesSnippet)
        }
      }
    ]
  }
})
