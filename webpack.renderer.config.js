const rules = require("./webpack.rules");
const webpack = require("webpack");

rules.push(
  {
    test: /\.css$/,
    use: [{ loader: "style-loader" }, { loader: "css-loader" }],
  },
  // {
  //   test: /\.(scss)$/,
  //   use: [
  //     {
  //       loader: "style-loader",
  //     },
  //     {
  //       loader: "css-loader",
  //     },
  //     {
  //       loader: "postcss-loader",
  //       options: {
  //         postcssOptions: {
  //           plugins: function () {
  //             return [require("autoprefixer")];
  //           },
  //         },
  //       },
  //     },
  //     {
  //       loader: "sass-loader",
  //     },
  //   ],
  // },

  // {
  //   test: /\.(png|jpe?g|gif|ico|svg)$/,
  //   use: [
  //     {
  //       loader: "file-loader",
  //     },
  //   ],
  // }
  // For newer versions of Webpack it should be

  {
    test: /\.(jpe?g|png|gif|svg)$/i,

    use: [
      {
        loader: "file-loader",
        options: {
          name: "/[name].[ext]",
        },
      },
    ],
  }
);

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  devtool: "source-map",
  // plugins: [
  //   new webpack.ProvidePlugin({
  //     $: "jquery",
  //     jQuery: "jquery",
  //   }),
  // ],
};
