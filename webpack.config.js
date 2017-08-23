var path = require('path');
var webpack = require('webpack');
var stylus_plugin = require('poststylus');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var baseName = "finance-embedded";

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, 'dist/'),
        filename: baseName + '.min.js'
    },
    devServer: {
        inline: true,
        port: 1111
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: false,
            beautify: true,
            comments: false,
            mangle: false,
            compress: {
                warnings: false
            }
        }),
        new ExtractTextPlugin({
            filename: baseName + ".min.css",
            allChunks: true
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jquery: "jquery",
            jQuery: "jquery",
            "window.jquery": "jquery"
        })
    ],
    module: {
        rules: [
            {
                test: /\.css/,
                use: ExtractTextPlugin.extract({
                    use: 'css-loader'
                })
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'babel-loader'
                    }
                ]
            },
            {
                test: /\.(jpe?g|png|gif|svg|eot|woff2|woff|ttf)$/i,
                use: "file-loader?name=bower_components/grands-components/resources/images/[name].[ext]"
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'ngtemplate-loader?relativeTo=src'
                    },
                    {
                        loader: 'html-loader'
                    }
                ]
            }
        ]
    },
};
