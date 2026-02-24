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
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
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
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
    fallback: {
      "process": require.resolve("process/browser"),
      "buffer": require.resolve("buffer/"),         
    },
    alias: {
      'process/browser': require.resolve('process/browser.js'),
    }
  },
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'bundle.js',
    publicPath: '/', 
    clean: true, 
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
      Buffer: ['buffer', 'Buffer'], 
    }),
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