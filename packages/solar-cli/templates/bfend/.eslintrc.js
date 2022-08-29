module.exports = {
  'parser': '@typescript-eslint/parser',
  'plugins': ['@typescript-eslint'],
  'extends': [
    'plugin:react/recommended',
    'google',
  ],
  'env': {
    browser: true,
    node: true,
    es6: true,
    commonjs: true,
  },
  'parserOptions': {
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  'rules': {
    'semi': 0,
    'eol-last': 0,
    'comma-dangle': 0,
    'require-jsdoc': 0,
    'object-curly-spacing': 0,
    'max-len': 0,
    'valid-jsdoc': 0,
    'indent': 0,
    'prefer-promise-reject-errors': 0,
    'react/prop-types': 0,
    'arrow-parens': 0,
    'no-invalid-this': 0,
    'space-before-function-paren': 0,
  },
  'globals': {},
  'settings': {
    'react': {
      'version': 'detect'
    }
  }
};
