// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("@angular-eslint/eslint-plugin");
const angularTemplate = require("@angular-eslint/eslint-plugin-template");
const angularTemplateParser = require("@angular-eslint/template-parser");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
    ],
    plugins: {
      "@angular-eslint": angular,
    },
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: ["app", "lib"],
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: ["app", "lib"],
          style: "kebab-case",
        },
      ],
      // Relaxed rules for legacy SOAP library code
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/prefer-function-type": "off",
      "@typescript-eslint/no-misused-new": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/consistent-type-assertions": "off",
      "@typescript-eslint/prefer-for-of": "off",
      "no-case-declarations": "off",
      "prefer-spread": "off",
      "prefer-rest-params": "off",
      "prefer-const": "off",
      "no-prototype-builtins": "off",
      "no-useless-escape": "off",
      "no-cond-assign": "off",
      "no-constant-condition": "off",
      "no-var": "off",
      "no-empty": "off",
    },
  },
  {
    files: ["**/*.html"],
    plugins: {
      "@angular-eslint/template": angularTemplate,
    },
    languageOptions: {
      parser: angularTemplateParser,
    },
    rules: {
      "@angular-eslint/template/banana-in-box": "error",
      "@angular-eslint/template/eqeqeq": "error",
      "@angular-eslint/template/no-negated-async": "error",
    },
  },
  {
    ignores: ["dist/", "node_modules/", "projects/ngx-soap/node_modules/"],
  }
);
