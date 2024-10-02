const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = [
  {
    mode: 'development',
    entry: {
      modules:'./MobbAutofixer/0.1.0/dist/loadmobblink.ts'
    }, 
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, './MobbAutofixer/0.1.0/dist/scripts'),
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    }
  },
  {
    mode: 'production',
    target: 'node',  
    entry: {
      task:'./MobbAutofixer/0.1.0/task.ts'
    }, 
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, './MobbAutofixer/0.1.0'),
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    externals: {
      // Externalize azure-pipelines-task-lib since it should be available in the runtime environment
      //"azure-pipelines-task-lib/task": "commonjs azure-pipelines-task-lib/task",
    },
  
    plugins: [
      new NodePolyfillPlugin(),  // Polyfill Node.js modules for Webpack bundling
    ],
    devtool: 'source-map',

  }
];
