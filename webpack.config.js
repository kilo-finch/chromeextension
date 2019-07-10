const isDev = process.env.NODE_ENV === 'development';
const path = require('path');

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: './client/popup/index.js',
  output: {
    path: __dirname,
    filename: './public/js/popup.js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devtool: 'source-map',
  watchOptions: {
    ignored: /node_modules/,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
};
