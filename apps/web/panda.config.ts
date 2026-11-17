import { defineConfig } from '@pandacss/dev'
import { foldlab } from '@foldlab/ui/preset'

export default defineConfig({
  presets: [foldlab],
  preflight: true,
  include: ['./src/**/*.ts', '../../packages/ui/src/**/*.ts'],
  exclude: [],
  outdir: 'styled-system',
})
