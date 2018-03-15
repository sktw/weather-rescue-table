var fs = require('fs');
var webpack = require('webpack');
var merge = require('webpack-merge');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var common = require('./webpack.common.js');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var utils = require('./templates/utils');

var link = utils.link;
var script = utils.script;

/* urls on github pages need to be relative to project
 * See https://stackoverflow.com/a/19173888
*/

var publicPath = '/weather-rescue-table';
var url = utils.createUrlResolver(publicPath);

var common_css = [
    link({
        href: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css', 
        rel: 'stylesheet', 
        integrity: 'sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm', 
        crossorigin: 'anonymous'
    }),
    link({href: url('css/icons.css'), rel: 'stylesheet'}),
    link({href: url('css/navbar.css'), rel: 'stylesheet'})
];

var links = {
    weatherRescue: "https://www.zooniverse.org/projects/edh/weather-rescue",
    github: "https://github.com/sktw/weather-rescue-table",
    home: url(''),
    table: url('table/'),
    docs: url('docs/')
}

module.exports = merge(common, {
    devtool: 'none',
    output: {
        publicPath: publicPath
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
    },
    plugins: [
        new UglifyJSPlugin(),
        new CleanWebpackPlugin(['docs']),
        new HtmlWebpackPlugin({
            template: 'templates/index.html',
            filename: 'index.html',
            context: {
                css: common_css,
                links: links
            },
            excludeChunks: ['main']
        }),
        new HtmlWebpackPlugin({
            template: 'templates/docs/index.html',
            filename: 'docs/index.html',
            context: {
                css: common_css,
                links: links,
                icons: fs.readFileSync('assets/icons/icons.svg')
            },
            excludeChunks: ['main']
        }),
        new HtmlWebpackPlugin({
            template: 'templates/table/index.html',
            filename: 'table/index.html',
            context: {
                js: [
                    script({
                        crossorigin: '', 
                        src: 'https://unpkg.com/react@16.2.0/umd/react.production.min.js', 
                        integrity: 'sha384-j40ChW3xknV2Dsc9+kP3/6SW2UrR7gYSbx9pmyNU1YTacm/PEj/0bxB9vM8jWFqx'
                    }),
                    script({
                        crossorigin: '', 
                        src: 'https://unpkg.com/react-dom@16.2.0/umd/react-dom.production.min.js', 
                        integrity: 'sha384-P4XM5fEtXj1kXZzsm1EOHZ7HmQIuzyRjjvX4na21R4eRLjmm+oUZua5ALb2PIojw'
                    }),
                    script({src: 'https://sktw.github.io/weather-rescue-subjects/manifests.js'})
                ],
                css: [].concat(common_css, [
                    link({href: url('table/css/styles.css'), rel: 'stylesheet'})
                ]),
                links: links,
                icons: fs.readFileSync('assets/icons/icons.svg')
            }
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ]
});
