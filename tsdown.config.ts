import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  platform: 'neutral',
  format: ['esm', 'cjs', 'iife'],
  dts: true,
  globalName: 'PointerJS',
})
