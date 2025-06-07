const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const eslintConfig = require('./.eslintrc.cjs');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
});

module.exports = [
  ...compat.config(eslintConfig),
  {
    ignores: ['dist/**', 'node_modules/**']
  }
];
