# Omi — native Android app

A true native rewrite of Omi in Kotlin + Jetpack Compose, living on the
`native-android` branch. The web game (CrazyGames / GameDistribution /
Capacitor APK) stays on `main` and is untouched by this branch.

Why: the Capacitor build renders through Android's WebView, and the
v1.0.0 build froze completely on the user's phone. The user chose a
native app anyway on 2026-11-10, knowing it is a second codebase.

## Identity

- Same applicationId `com.suneragames.omi` and the same signing keystore
  as the Capacitor app, so the native build replaces it as an update.
- Native versioning starts at versionCode 3 / versionName "2.0.0"
  (the Capacitor line ended at versionCode 2 / 1.0.1).
- Player progress does NOT carry over from the WebView build
  (its localStorage is not readable from native code) — fresh start.

## Stack

- Kotlin 2.2.20, AGP 8.13.0, Gradle 8.14.3, compileSdk/targetSdk 36,
  minSdk 24 — the same toolchain versions the Capacitor build proved
  on Codemagic.
- Game logic in `app/src/main/java/com/suneragames/omi/game/` is a
  faithful port of `src/game/` (deck, deal, rules, AI) — same behavior,
  verified against the same test cases.
- Sounds are synthesized at runtime (AudioTrack); the ambient music
  loop is the same master as the web build, embedded base64 in
  `scripts/omi-music.b64.txt` and decoded into `res/raw/` at build time
  (binary files cannot be pushed through the GitHub connector).
- Launcher icons are generated at build time by
  `scripts/gen-android-res.sh` with `RES_DIR=android-native/app/src/main/res`.

## Scope

- v1 (2.0.0): home screen, full match flow (two-stage deal, trump call,
  8 tricks, tokens to 10, Kapothi), ported bot AI, wallet/stats basics,
  music + synthesized SFX.
- Later: gem wheel, wardrobe, rewarded popups, then multiplayer.

## Build

Codemagic workflow `android-native` in this branch's codemagic.yaml
produces the unsigned release APK; signing happens locally with
apksigner and the project keystore, exactly like the Capacitor line.
