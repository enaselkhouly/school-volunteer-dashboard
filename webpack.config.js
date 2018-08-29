const nodeExternals = require('webpack-node-externals'),
      miniCssExtractPlugin = require("mini-css-extract-plugin"),
      path = require('path');

//const devMode = process.env.Noed_ENV !== 'production';

module.exports = {

    target: 'node', // in order to ignore built-in modules like path, fs, etc.
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    mode: "production", // "production" | "development" | "none",

    node: {
      __dirname: true
    },

    entry: {
      main: ["./src/index.js", "./src/public/scss/styles.scss"]
    },
    output: {
      filename: "index.bundle.js",
      path: path.join(__dirname, "dist")
    },

    plugins: [
    new miniCssExtractPlugin({
        filename: "../src/public/css/styles.css"
      })
    ],
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
            'postcss-loader',
            'sass-loader',
          ],
      },
      {
        test: /\.(jpg|png)$/,
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
  }
};
