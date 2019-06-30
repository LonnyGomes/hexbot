const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopywebpackPlugin = require('copy-webpack-plugin');

// The path to the CesiumJS source code
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

module.exports = {
    entry: {
        main: './src/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),

        // Needed to compile multiline strings in Cesium
        sourcePrefix: ''
    },
    amd: {
        // Enable webpack-friendly use of require in Cesium
        toUrlUndefined: true
    },
    node: {
        // Resolve node module use of fs
        fs: 'empty'
    },
    resolve: {
        alias: {
            // CesiumJS module name
            cesium: path.resolve(__dirname, cesiumSource)
        }
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist/'
    },
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            template: './index.html' //relative to root of the application
        }),
        // Copy Cesium Assets, Widgets, and Workers to a static directory
        new CopywebpackPlugin([
            { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' }
        ]),
        new CopywebpackPlugin([
            { from: path.join(cesiumSource, 'Assets'), to: 'Assets' }
        ]),
        new CopywebpackPlugin([
            { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' }
        ]),
        new webpack.DefinePlugin({
            // Define relative base path in cesium for loading assets
            CESIUM_BASE_URL: JSON.stringify('')
        })
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
                use: ['url-loader']
            }
        ]
    },
    optimization: {
        splitChunks: {
            // include all types of chunks
            chunks: 'all',
            automaticNameDelimiter: '-',
            cacheGroups: {
                cesium: {
                    test: /[\\/]node_modules[\\/](cesium)[\\/]/,
                    name: 'vendors-cesium',
                    chunks: 'all'
                }
            }
        }
    }
};
