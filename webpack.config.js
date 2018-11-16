var path = require('path');
var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');

module.exports = {
  externals: [nodeExternals()],
  entry: [
    './src/normalize'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ],
  module: {
    rules: [
      { test: /\.js?$/, use: ['babel-loader', 'eslint-loader'], exclude: /node_modules/ },
    ]
  },
  resolve: {
    modules: [
      path.join(__dirname, 'src'),
      'node_modules'
    ]
  }
};
