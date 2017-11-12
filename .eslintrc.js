module.exports = {
  parser: 'babel-eslint',
  extends: ['standard', 'prettier', 'plugin:react/recommended'],
  plugins: ['prettier', 'react'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        semi: false,
      },
    ]
  },
  env: { mocha: true }
}
