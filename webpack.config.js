/**
 * React Static Boilerplate
 * https://github.com/kriasoft/react-static-boilerplate
 *
 * Copyright © 2015-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* eslint-disable global-require */

const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const BannerPlugin = require('banner-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const pkg = require('./package.json');

const isDebug = global.DEBUG === false ? false : !process.argv.includes('--release');
const isRelease = process.argv.includes('--release');
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');
const useHMR = !!global.HMR; // Hot Module Replacement (HMR)
const babelConfig = Object.assign({}, pkg.babel, {
    babelrc: false,
    cacheDirectory: useHMR,
});

const environments = {
    dev: {
        publicPath: `https://cdn-dev.elasticmedia.io/lib/elasticprogram-sdk/${pkg.version}/`
    },
    prod: {
        publicPath: `https://cdn.elasticmedia.io/lib/elasticprogram-sdk/${pkg.version}/`
    },
    local: {
        publicPath: `/sdk/`
    },
};

let env;
for (let e in environments) {
    if (process.argv.includes(`--${e}`)) {
        env = e;
        break;
    }
}


env = env || (isDebug ? "local" : "prod");
const envConfig = environments[env];


// Webpack configuration (main.js => public/dist/main.{hash}.js)
// http://webpack.github.io/docs/configuration.html
const config = {

    // The base directory for resolving the entry option
    context: __dirname,

    // The entry point for the bundle
    entry: {
        /* The main entry point of your JavaScript application */
        'elasticprogram-sdk': './sdk/main',
    },

    // Options affecting the output of the compilation
    output: {
        path: path.resolve(__dirname, './dist/sdk'),
        publicPath: envConfig.publicPath,
        filename: isDebug ? '[name].js?[hash]' : '[name].js',
        chunkFilename: isDebug ? '[id].js?[chunkhash]' : '[id].[chunkhash].js',
    },

    // Switch loaders to debug or release mode
    debug: isDebug,

    // Developer tool to enhance debugging, source maps
    // http://webpack.github.io/docs/configuration.html#devtool
    devtool: isDebug ? 'source-map' : false,

    // What information should be printed to the console
    stats: {
        colors: true,
        reasons: isDebug,
        hash: isVerbose,
        version: isVerbose,
        timings: true,
        chunks: isVerbose,
        chunkModules: isVerbose,
        cached: isVerbose,
        cachedAssets: isVerbose,
    },

    // The list of plugins for Webpack compiler
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': isDebug ? '"development"' : '"production"',
            __DEV__: isDebug,
            MINI_CMS_BASE_URL: isDebug ? '"http://mini-cms-dev.elasticmedia.io/em/v2/"' : '"https://mini-cms.elasticmedia.io/em/v2/"',
            ANALYTICS_BASE_URL: isDebug ? '"http://analytics-dev.elasticmedia.io/em/v2/"' : '"http://analytics-dev.elasticmedia.io/em/v2/"'
        }),
        // Emit a JSON file with assets paths
        // https://github.com/sporto/assets-webpack-plugin#options
        new AssetsPlugin({
            path: path.resolve(__dirname, './dist'),
            filename: 'assets.json',
            prettyPrint: true,
        }),
        new ExtractTextPlugin(isDebug ? '[name].css?[hash]' : '[name].css'),
    ],

    // Options affecting the normal modules
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, './clients'),
                    path.resolve(__dirname, './components'),
                    path.resolve(__dirname, './core'),
                    path.resolve(__dirname, './pages'),
                    path.resolve(__dirname, './sdk'),
                ],
                loader: `babel-loader?${JSON.stringify(babelConfig)}`,
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract(
                    'style-loader',
                    `css-loader?${JSON.stringify({
                        sourceMap: isDebug,
                        // modules: true,
                        localIdentName: isDebug ? '[name]_[local]_[hash:base64:3]' : '[name]_[hash:base64:4]',
                        minimize: !isDebug,
                    })}`
                ),
            },
            {
                test: /\.json$/,
                exclude: [
                    path.resolve(__dirname, './routes.json'),
                ],
                loader: 'json-loader',
            },
            {
                test: /\.json$/,
                include: [
                    path.resolve(__dirname, './routes.json'),
                ],
                loaders: [
                    `babel-loader?${JSON.stringify(babelConfig)}`,
                    path.resolve(__dirname, './utils/routes-loader.js'),
                ],
            },
            {
                test: /\.md$/,
                loader: path.resolve(__dirname, './utils/markdown-loader.js'),
            },
            {
                test: /\.(png|jpg|jpeg|gif|webp|svg|woff|woff2)$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: 'images/[name].[ext]',
                },
            },
            {
                test: /\.(eot|ttf|wav|mp3)$/,
                loader: 'file-loader',
            },
            {
                test: /\.ejs$/,
                loader: 'ejs-loader',
            }
        ],
    },

    // The list of plugins for PostCSS
    // https://github.com/postcss/postcss
    postcss(bundler) {
        return [
            // Transfer @import rule by inlining content, e.g. @import 'normalize.css'
            // https://github.com/postcss/postcss-import
            require('postcss-import')({ addDependencyTo: bundler }),
            // W3C variables, e.g. :root { --color: red; } div { background: var(--color); }
            // https://github.com/postcss/postcss-custom-properties
            require('postcss-custom-properties')(),
            // W3C CSS Custom Media Queries, e.g. @custom-media --small-viewport (max-width: 30em);
            // https://github.com/postcss/postcss-custom-media
            require('postcss-custom-media')(),
            // CSS4 Media Queries, e.g. @media screen and (width >= 500px) and (width <= 1200px) { }
            // https://github.com/postcss/postcss-media-minmax
            require('postcss-media-minmax')(),
            // W3C CSS Custom Selectors, e.g. @custom-selector :--heading h1, h2, h3, h4, h5, h6;
            // https://github.com/postcss/postcss-custom-selectors
            require('postcss-custom-selectors')(),
            // W3C calc() function, e.g. div { height: calc(100px - 2em); }
            // https://github.com/postcss/postcss-calc
            require('postcss-calc')(),
            // Allows you to nest one style rule inside another
            // https://github.com/jonathantneal/postcss-nesting
            require('postcss-nesting')(),
            // W3C color() function, e.g. div { background: color(red alpha(90%)); }
            // https://github.com/postcss/postcss-color-function
            require('postcss-color-function')(),
            // Convert CSS shorthand filters to SVG equivalent, e.g. .blur { filter: blur(4px); }
            // https://github.com/iamvdo/pleeease-filters
            require('pleeease-filters')(),
            // Generate pixel fallback for "rem" units, e.g. div { margin: 2.5rem 2px 3em 100%; }
            // https://github.com/robwierzbowski/node-pixrem
            require('pixrem')(),
            // W3C CSS Level4 :matches() pseudo class, e.g. p:matches(:first-child, .special) { }
            // https://github.com/postcss/postcss-selector-matches
            require('postcss-selector-matches')(),
            // Transforms :not() W3C CSS Level 4 pseudo class to :not() CSS Level 3 selectors
            // https://github.com/postcss/postcss-selector-not
            require('postcss-selector-not')(),
            // Postcss flexbox bug fixer
            // https://github.com/luisrudge/postcss-flexbugs-fixes
            require('postcss-flexbugs-fixes')(),
            // Add vendor prefixes to CSS rules using values from caniuse.com
            // https://github.com/postcss/autoprefixer
            require('autoprefixer')(),
        ];
    },
};

// Optimize the bundle in release (production) mode
if (!isDebug) {
    config.plugins.push(new webpack.optimize.DedupePlugin());
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({ compress: { warnings: isVerbose } }));
    config.plugins.push(new webpack.optimize.AggressiveMergingPlugin());
}

// Hot Module Replacement (HMR) + React Hot Reload
if (isDebug && useHMR) {
    babelConfig.plugins.unshift('react-hot-loader/babel');
    config.entry['hot-load'] = 'react-hot-loader/patch';
    config.entry['hot-middleware'] = 'webpack-hot-middleware/client';
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.plugins.push(new webpack.NoErrorsPlugin());
}

let client = process.argv.find(function(element) { return element.startsWith('--client=') });
if (client) {
    client = client.substr(9);  // Remove "--client=" prefix
}

if (client) {
    config.entry = { 'elasticprogram-sdk': `./clients/${client}/${client}.js` };
}

if (!useHMR) {
    config.plugins.push(
        new BannerPlugin({
            chunks: {
                'elasticprogram-sdk': {
                    beforeContent: `/* Elastic Media elasticprogram-sdk v${pkg.version} */\n`
                }
            }
        })
    );
}

const demo = {
    entry: {
        'index': './public/index'
    },

    output: {
        path: path.resolve(__dirname, './dist/'),
        publicPath: '',
        filename: '[name].js',
        chunkFilename: '[id].js',
    },

    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'public/index.ejs',
            inject: false,
        }),
        new ExtractTextPlugin('[name].css'),
    ],

    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract(
                    'style-loader',
                    'css-loader'
                ),
            },
            {
                test: /\.ejs$/,
                loader: 'ejs-loader',
            }
        ]
    },

    demoConfig: {
        debug: isDebug,
        title: 'Demo',
    },

    sdk: {
        js: `${envConfig.publicPath}elasticprogram-sdk.js`,
        css: `${envConfig.publicPath}elasticprogram-sdk.css`,
    },
}

module.exports = [demo, config];
