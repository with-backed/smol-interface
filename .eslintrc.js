/** @type {import('eslint').Linter.Config} */
module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/jest-testing-library",
    "@remix-run/eslint-config/node",
  ],
};
