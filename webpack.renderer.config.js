const rules = require("./webpack.rules");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

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
  // {
  //   test: /\.(jpe?g|png|gif|svg)$/i,

  //   use: [
  //     {
  //       loader: "file-loader",
  //       options: {
  //         name: "/images/[name].[ext]",
  //       },
  //     },
  //   ],
  // }
);

module.exports = {
  devtool: "source-map",
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
  ],
  module: {
    rules,
  },
  entry: {
    light: "./src/css/light.css",
    dark: "./src/css/dark.css",
    goldenLayoutDark:
      "golden-layout/dist/css/themes/goldenlayout-dark-theme.css",
    goldenLayoutLight:
      "golden-layout/dist/css/themes/goldenlayout-light-theme.css",
  },
};
