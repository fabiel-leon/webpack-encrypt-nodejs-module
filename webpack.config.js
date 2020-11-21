const path = require('path');
const fs = require('fs');
const nodeExternals = require('webpack-node-externals');
const JavaScriptObfuscator = require('webpack-obfuscator');
const EncryptModule = require('./src/');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        server: './src/index.js', // server is the name of your output file (server.js), and index.js your source script
    },
    output: {
        path: path.join(__dirname, 'dist'), // dist is the output dir
        publicPath: '/',
        filename: '[name].js', // file output name, [name] variable will take the value declared in entry, in this case [server]
    },
    target: 'node',
    node: {
        // Need this when working with express, otherwise the build fails
        __dirname: false, // if you don't put this is, __dirname
        __filename: false, // and __filename return blank or /
    },
    externals: [nodeExternals()], // Need this to avoid error when working with Express
    // module: {
    //     rules: [
    //         {
    //             // Transpiles ES6-8 into ES5
    //             test: /\.js$/,
    //             exclude: /node_modules/,
    //             use: {
    //                 loader: 'babel-loader',
    //             },
    //         },
    //     ],
    // },
    plugins: [
        new EncryptModule({  // encrypt obfuscated code with privateKey
            algorithm: 'aes-256-cbc',
            keylen: 32,
            ivlen: 16,
            password: 'r9jKFPQolKPkh1sMevkDlyHmSrcl5br1gQ8bRESC4UBBCXo4qC4O0S5PKAduodsejDW789RdOqpRQsez9I+4S0KUabHKPoYOZ3PP3ExAZiErMFs7HQqdNNBjkTG3EknH6OjkLhoHBZ3NmodBnURHkMf6CXucIrjt+dqMQoEOq1M=',
            envVar: "PROTECTION_KEY",
        }),
        new JavaScriptObfuscator({  // obfuscate code first
            unicodeEscapeSequence: true,
            rotateUnicodeArray: true,
        }, ['excluded_bundle_name.js']),
        new CopyPlugin({
            patterns: [
                'package.json',
            ]
        }),
    ],
};