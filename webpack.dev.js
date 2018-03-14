var fs = require('fs');
var merge = require('webpack-merge');
var common = require('./webpack.common.js');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var common_css = [
    '<link href="/lib/bootstrap/css/bootstrap.min.css" rel="stylesheet">',
    '<link href="/css/icons.css" rel="stylesheet">',
    '<link href="/css/navbar.css" rel="stylesheet">'
];

var links = {
    weatherRescue: "https://www.zooniverse.org/projects/edh/weather-rescue",
    github: "https://github.com/sktw/weather-rescue-table"
}

module.exports = merge(common, {
    devtool: 'inline-source-map',
    devServer: {
    },
    plugins: [
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
                js: ['<script src="https://sktw.github.io/weather-rescue-subjects/manifests.js"></script>'],
                css: [].concat(common_css, [
                    '<link href="/table/css/styles.css" rel="stylesheet">'
                ]),
                icons: fs.readFileSync('assets/icons/icons.svg')
            }
        })
    ]
});
