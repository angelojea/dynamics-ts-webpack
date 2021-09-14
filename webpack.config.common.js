const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
	},
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ESLintPlugin({ extensions: ['js', 'ts'], failOnWarning: true }),
  ],
  module: {
    rules: [
      { test: /\.css$/, use: ["css-loader"] },
      { test: /\.html$/, loader: "html-loader" },
      { test: /\.tsx?$/, exclude: /node_modules/, use: [ 'babel-loader', 'ts-loader' ] }
    ]
  },
  resolve: { extensions: ['.tsx', '.ts', '.js', '.html', '.css'] }
}