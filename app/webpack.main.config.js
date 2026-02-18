const path = require('path');

module.exports = {
  entry: {
    main: './main/main.ts',
    preload: './main/preload.ts'
  },
  target: 'electron-main',
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: /main/,
        use: { loader: 'ts-loader' }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: '[name].js'
  },
  externals: {
    'better-sqlite3': 'commonjs better-sqlite3',
  },
  devtool: 'inline-source-map',
  stats: 'errors-only'
};