const nodeExternals = require('webpack-node-externals'),
      path          = require('path')

module.exports = {

    target: 'node', // in order to ignore built-in modules like path, fs, etc.
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    mode: "production", // "production" | "development" | "none",

    output: {
      filename: "index.bundle.js"
    },

    module: {
      rules: [ {
        test : /\.js$/,
        exclude : /(node_modules)/,
        include: [path.resolve(__dirname, 'src')],
        use : {
          loader: "babel-loader",
          options: {
            presets: ["env"]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          {loader: "style-loader"},
          {loader: "css-loader"},
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {loader: "style-loader"},
          {loader: "css-loader"},
          {loader: "sass-loader"}
        ]
      },
      {
        test: /\.jpg$/,
        use: [
          {loader: "url-loader"}
        ]
      }
    ]
  }
};
