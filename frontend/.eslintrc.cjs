module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  plugins: ['react', 'react-hooks', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "JSXAttribute[name.name='className'][value.type='Literal'][value.value=/bg-white\\s+rounded-lg\\s+shadow(?:-[a-z]+)?/]",
        message:
          'Use shared primitive `.card` instead of raw `bg-white rounded-lg shadow...` classes.'
      },
      {
        selector:
          "JSXAttribute[name.name='className'][value.type='Literal'][value.value=/bg-blue-600\\s+text-white\\s+rounded(?:-lg|-md)?\\s+hover:bg-blue-700/]",
        message:
          'Use shared primitive `.btn-primary` instead of raw primary button class combinations.'
      },
      {
        selector:
          "JSXAttribute[name.name='className'][value.type='Literal'][value.value=/bg-red-600\\s+text-white\\s+rounded(?:-lg|-md)?\\s+hover:bg-red-700/]",
        message:
          'Use shared primitive `.btn-danger` instead of raw danger button class combinations.'
      },
      {
        selector:
          "JSXAttribute[name.name='className'][value.type='Literal'][value.value=/border\\s+border-gray-300\\s+rounded-lg\\s+focus:ring-2\\s+focus:ring-(?:blue|green)-500(?:\\s+focus:border-(?:transparent|blue-500))?/]",
        message:
          'Use shared primitive `.input-field` instead of repeated raw input classes.'
      }
    ]
  }
};
