var path = require('path');
var webpack = require('webpack');
var stylus_plugin = require('poststylus');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var baseName = "finance-embedded";

module.exports = {
    entry: path.join(__dirname, 'src', 'index'),
    output: {
        path: path.join(__dirname, '.'),
        filename: baseName + '.min.js'
    },
    devtool: 'source-map',
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true,
            beautify: false,
            sourceMap: true,
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
        new webpack.DefinePlugin({
            'ENV': JSON.stringify('prod')
        }),

        new webpack.IgnorePlugin(/\.\/locale$/),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            jquery: "jquery",
            "window.jQuery": "jquery",
            "window.moment": "moment-timezone",
            moment: "moment-timezone"
        }),
        new webpack.LoaderOptionsPlugin({
            options: {
                stylus: {
                    use: [stylus_plugin(['autoprefixer'])]
                }
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.styl$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader!stylus-loader",
                    // use: 'css-loader'
                })
            },
            {
                test: /\.css/,
                use: ExtractTextPlugin.extract({
                    use: 'css-loader'
                })
            },
            {
                test: /\.js$/,
                exclude: [/node_modules/],
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
            // ,{
            //     test: /\.styl$/,
            //     use: [
            //         {
            //             loader: 'style-loader'
            //         },
            //         {
            //             loader: 'css-loader'
            //         },
            //         {
            //             loader: 'stylus-loader?paths=src/style/',
            //             options: {
            //                 use: [stylus_plugin()]
            //             }
            //         }
            //     ]
            // }
        ]
    },
};
