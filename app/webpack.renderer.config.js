const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './renderer/src/index.tsx',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'bundle.js',
    publicPath: '/', 
  },
  performance: {
    hints: false,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './renderer/public/index.html'
    }),
    new webpack.ProvidePlugin({
      global: 'globalThis', 
      process: 'process/browser', 
    })
  ],
  devtool: 'inline-source-map',
  stats: 'errors-only', 

  devServer: {
    static: {
      directory: path.join(__dirname, 'renderer/public'),
    },
    port: 3000,
    hot: true,
    liveReload: false,
    open: false,
    compress: true,
    historyApiFallback: true,
    allowedHosts: 'all',
    client: {
      overlay: true,
      progress: false,
    },
    host: 'localhost',
  },
};