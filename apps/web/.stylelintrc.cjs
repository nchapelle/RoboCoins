module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
  rules: {
    'color-hex-length': 'short',
    'color-hex-case': 'lower',
    'number-leading-zero': 'always',
    'selector-class-pattern': '^[a-z0-9\\-]+$',
    'declaration-colon-newline-after': null,
    'no-descending-specificity': null
  }
};