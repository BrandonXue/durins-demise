var HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        filename: path.resolve(__dirname, '..', 'src', 'index.js'),
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../dist'),
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(mp3|ogg)$/i,
                use: ['file-loader'],
            }
        ],
    },
    plugins: [
        new CleanWebpackPlugin({
            root: path.resolve(__dirname, "../dist")
        }),
        new HtmlWebpackPlugin({
            title: 'Durin\'s Demise',
            // template: "index.html",
        })
      ]
};