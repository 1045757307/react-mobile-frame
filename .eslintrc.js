module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['react-app', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'prettier/prettier': 'error',
    'react/jsx-wrap-multilines': [
      'error',
      { declaration: false, assignment: false },
    ],
  },
};
