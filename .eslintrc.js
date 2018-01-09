module.exports = {
  extends: ['standard', "standard-react", 'prettier'],
  plugins: ['prettier'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
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