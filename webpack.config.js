const { merge } = require('webpack-merge');
const common = require('./webpack.config.common.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({ uglifyOptions: { output: { comments: false } } }),
      new CssMinimizerPlugin(),
    ],
  },
});