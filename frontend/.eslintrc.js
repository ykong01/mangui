module.exports = {
  settings: {
    react: {
      version: "detect"
    }
  },
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    "standard",
    "plugin:react/recommended"
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: [
    "react"
  ],
  rules: {
    quotes: ["error", "double"],
    "react-hooks/exhaustive-deps": "off",
    "react/prop-types": "off",
    "no-case-declarations": "off"
  },
  ignorePatterns: ["**.css"]
}
