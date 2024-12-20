import pluginReactCompiler from "eslint-plugin-react-compiler";

export default [
  {
    plugins: {
      "react-compiler": pluginReactCompiler,
    },
    rules: {
      "react-compiler/react-compiler": "error",
    },
  },
];
