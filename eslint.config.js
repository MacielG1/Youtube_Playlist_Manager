import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";
import pluginReactCompiler from "eslint-plugin-react-compiler";

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    plugins: {
      "react-compiler": pluginReactCompiler,
    },
    rules: {
      "react-compiler/react-compiler": "error",
      "prefer-const": "off",
    },
  },
];

export default eslintConfig;
