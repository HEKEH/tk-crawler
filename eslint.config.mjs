import antfu from '@antfu/eslint-config';

export default antfu(
  {
    stylistic: true, // 启用样式规则
    vue: true,
    ignores: ['**/tk-crack', '**/play/request-result-demo'],
    rules: {
      'style/semi': 'off',
      'style/operator-linebreak': 'off',
      'style/arrow-parens': 'off',
      'style/brace-style': 'off',
      'style/member-delimiter-style': 'off',
      'style/multiline-ternary': 'off',
      'style/quote-props': 'off',
      'style/indent': 'off',
      'style/indent-binary-ops': 'off',
      'no-console': 'warn',
      'ts/no-unused-vars': 'warn',
      'antfu/consistent-list-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-indent': 'off',
    },
  },
  {
    files: ['**/*.json', '**/*.json5'],
    rules: {
      'style/eol-last': 'off',
    },
  },
);
