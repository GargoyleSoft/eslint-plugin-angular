'use strict'

module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint'
    ],
    extends: [
        'eslint:recommended',
        'plugin:eslint-plugin/recommended',
        'plugin:node/recommended'
    ],
    env: {
        node: true,
        es6: true
    }
}
