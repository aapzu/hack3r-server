import type { Options } from 'tsup'
import pkg from './package.json'

export const tsup: Options = {
  clean: true,
  dts: true,
  format: ['esm'],
  bundle: false,
  skipNodeModulesBundle: true,
  entryPoints: [pkg.main],
  target: 'es2020',
  outDir: 'dist',
  entry: ['src/**/*.ts'],
}
