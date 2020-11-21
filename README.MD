# encrypt-nodejs-module-webpack-plugin

This is a  webpack plugin (`webpack >= 5`) that creates an encrypted bundle nodejs module that will be decrypted at runtime on server using an environment variable as the desencription key.

## how to use it

add it to a webpack project

```shell
npm i encrypt-nodejs-module-webpack-plugin -D
```

if you are creating a webpack configuration from zero use this

```shell
npm i @babel/core @babel/preset-env babel-loader copy-webpack-plugin webpack webpack-cli webpack-obfuscator webpack-node-externals encrypt-nodejs-module-webpack-plugin -D
```

generate a password

```shell
openssl rand -base64 128
```

then create a webpack configuration file or modify yours
webpack.config.js

```js
const path = require("path");
const webpack = require("webpack");
const fs = require("fs");
const nodeExternals = require("webpack-node-externals");
const JavaScriptObfuscator = require("webpack-obfuscator");
const EncryptModule = require("webpack-encrypt-nodejs-module");
const CopyPlugin = require("copy-webpack-plugin");
// const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    server: "./index.js", // server is the name of your output file (server.js), and index.js your source script
  },
  output: {
    path: path.join(__dirname, "dist"), // dist is the output dir
    publicPath: "/",
    filename: "[name].js", // file output name, [name] variable will take the value declared in entry, in this case [server]
  },
  target: "node",
  node: {
    // Need this when working with express, otherwise the build fails
    __dirname: false, // if you don't put this is, __dirname
    __filename: false, // and __filename return blank or /
  },
  externals: [nodeExternals()], // Need this to avoid error when working with Express
  // module: {
  //   rules: [
  //     {
  //       // Transpiles ES6-8 into ES5
  //       test: /\.js$/,
  //       exclude: /node_modules/,
  //       use: {
  //         loader: "babel-loader",
  //       },
  //     },
  //   ],
  // },
  plugins: [
    new EncryptModule({
      algorithm: 'aes-192-cbc', //default
      keylen: 24, // default key length, this depend of algorithm
      ivlen: 16, //  default initialization vector length, this depend of algorithm
      password: "copy here in one line the generated password with the command -> openssl rand -base64 128", // this is used to generate a key
      // password: 'r9jKFPQolKPkh1sMevkDlyHmSrcl5br1gQ8bRESC4UBBCXo4qC4O0S5PKAduodsejDW789RdOqpRQsez9I+4S0KUabHKPoYOZ3PP3ExAZiErMFs7HQqdNNBjkTG3EknH6OjkLhoHBZ3NmodBnURHkMf6CXucIrjt+dqMQoEOq1M=',
      envVar: "PROTECTION_KEY", // environment varible where password will be obtained at runtime in server
    }),
    new JavaScriptObfuscator({
        // obfuscate code first
        unicodeEscapeSequence: true,
        rotateUnicodeArray: true,
      },
      ["excluded_bundle_name.js"]
    ),
    new CopyPlugin({
      patterns: ["package.json"],
    }),
  ],
};
```

to build with a command add this to your _package.json_

```json
  "scripts": {
    "build": "webpack --mode production --config webpack.config.js",
  }
```

then run

```shell
npm run build
```

To test the result run node with the password in an environment variable

```shell
PROTECTION_KEY=yourpassword-with-no-spaces node dist/server.js
```

you should see the final result in dist folder
then use your selected method to upload your code to server
then in your env variables add envVarName key (in this case is PUBLIC_KEY) put public.pem content
You can use terminal or your hosting provider gui

```shell
PROTECTION_KEY=content of your public key
```
