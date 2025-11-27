const webpack = require('webpack');

module.exports = {
    resolve: {
      fallback: { 
        "url": require.resolve("url/"),
        "assert": require.resolve("assert/"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "vm": require.resolve("vm-browserify")
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
        global: 'global/window'
      })
    ]
  };
