import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [''],
  outDir: 'build',
  clean: true,
  dts: true,
  format: 'esm',
  target: 'esnext',
})
