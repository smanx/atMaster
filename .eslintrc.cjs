module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-strongly-recommended',
    'plugin:vue/vue3-recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  rules: {
    // Vue特定规则
    'vue/multi-word-component-names': 'off',
    'vue/require-default-prop': 'off',
    'vue/no-unused-vars': 'error',
    'vue/no-use-v-if-with-v-for': 'error',
    'vue/require-v-for-key': 'error',

    // JavaScript规则
    'no-unused-vars': 'error',
    'no-console': 'warn',
    'no-debugger': 'error',
    'eqeqeq': 'error',
    'curly': 'error',
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'indent': ['error', 2],
    'comma-dangle': ['error', 'never'],
    'arrow-spacing': 'error',
    'space-before-blocks': 'error',
    'keyword-spacing': 'error',
    'space-infix-ops': 'error',
    'eol-last': 'error',
    'no-trailing-spaces': 'error'
  },
  globals: {
    navigator: 'readonly',
    window: 'readonly',
    document: 'readonly',
    console: 'readonly',
    alert: 'readonly',
    fetch: 'readonly',
    setTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly'
  }
}
