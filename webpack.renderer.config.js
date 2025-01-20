const rules = require("./webpack.rules");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const RemovePlugin = require("remove-files-webpack-plugin");
const webpack = require("webpack");

rules.push(
  {
    test: /\.css$/,
    use: [MiniCssExtractPlugin.loader, { loader: "css-loader" }],
  },
  {
    test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    type: "asset/resource",
  },
  {
    test: /\.png$/,
    type: "asset",
    parser: { dataUrlCondition: { maxSize: 10000 } },
  },
  { test: /\.jpg$/, type: "asset/resource" }
);

module.exports = {
  devtool: "source-map",
  module: {
    rules,
  },
  entry: {
    light: "./src/css/light.css",
    dark: "./src/css/dark.css",
    goldenLayoutBase: "golden-layout/dist/css/goldenlayout-base.css",
    goldenLayoutDark:
      "golden-layout/dist/css/themes/goldenlayout-dark-theme.css",
    goldenLayoutLight:
      "golden-layout/dist/css/themes/goldenlayout-light-theme.css",
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new RemovePlugin({
      after: {
        include: [
          "./.webpack/renderer/light",
          "./.webpack/renderer/dark",
          "./.webpack/renderer/goldenLayoutBase",
          "./.webpack/renderer/goldenLayoutLight",
          "./.webpack/renderer/goldenLayoutDark",
        ],
      },
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
    }),
    // new webpack.ProvidePlugin({
    //   $: "/src/third-party/jquery-3.7.1.min.js",
    //   jQuery: "/src/third-party/jquery-3.7.1.min.js",
    //   jquery: "/src/third-party/jquery-3.7.1.min.js",
    //   "window.jQuery": "/src/third-party/jquery-3.7.1.min.js",
    //   "$.jQuery": "/src/third-party/jquery-3.7.1.min.js",
    // }),
    new webpack.ProvidePlugin({
      jstree: "jstree",
    }),
    // new webpack.ProvidePlugin({
    //   jstree: "/src/third-party/jstree/jstree.min.js",
    // }),
  ],
};
