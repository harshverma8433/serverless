const path = require('path');

module.exports = {
  entry: './handler.js',
  target: 'node',
  mode: 'production',
  externals: ['aws-sdk', '@middy/core'],  // Ensure aws-sdk and middy are externalized
  resolve: {
    extensions: ['.js', '.ts'],
  },
  output: {
    path: path.join(__dirname, '.webpack'),
    filename: 'handler.js',
  },
};
