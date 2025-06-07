import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import eslintConfig from './.eslintrc.cjs'

const compat = new FlatCompat({
  baseDirectory: new URL('.', import.meta.url).pathname,
  recommendedConfig: js.configs.recommended
})

export default compat.config(eslintConfig)
