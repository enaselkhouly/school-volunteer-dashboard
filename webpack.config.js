const nodeExternals = require('webpack-node-externals'),
      miniCssExtractPlugin = require("mini-css-extract-plugin"),
      path          = require('path');

module.exports = {

    target: 'node', // in order to ignore built-in modules like path, fs, etc.
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    mode: "production", // "production" | "development" | "none",

    node: {
      __dirname: true
    },

    entry: "./src/index.js",
    output: {
      filename: "index.bundle.js",
      path: path.join(__dirname, "dist")
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
        test: /\.(sa|sc|c)ss$/,
        use: [
          miniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
          ],
      },
      {
        test: /\.jpg$/,
        use: [
          {loader: "url-loader"}
        ]
      },
      { test: /\.ejs$/,
        use: [
          {loader: 'ejs-html-loader'}
        ]
      },

    ]
  },

  plugins: [
  new miniCssExtractPlugin({
      filename: "styles.css"
    })
]
};
