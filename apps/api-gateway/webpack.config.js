const { NxAppWebpackPlugin } = require("@nx/webpack/app-plugin");
const path = require("path");

module.exports = {
  target: "node",
  mode: process.env.NODE_ENV || "production",
  entry: path.resolve(__dirname, "./src/main.ts"),
  output: {
    path: path.resolve(__dirname, "../../dist/apps/kafka-service"),
    filename: "main.js",
    clean: true,
    ...(process.env.NODE_ENV !== "production" && {
      devtoolModuleFilenameTemplate: "[absolute-resource-path]",
    }),
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      // match imports like: import prisma from "@packages/libs/prisma"
      "@packages": path.resolve(__dirname, "../../packages"),
    },
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: "node",
      // Use a bundling compiler so the alias is honored
      compiler: "babel", // or "swc"
      main: "./src/main.ts",
      tsConfig: "./tsconfig.app.json",
      assets: [],
      optimization: false,
      outputHashing: "none",
      generatePackageJson: true,
      sourceMaps: true,
    }),
  ],
  externalsPresets: { node: true },
  externals: {
    "@prisma/client": "commonjs @prisma/client",
    ".prisma/client": "commonjs .prisma/client",
  },
};
