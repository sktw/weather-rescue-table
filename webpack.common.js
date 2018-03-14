var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'table/bundle.js',
        path: path.resolve(__dirname, 'docs')
    },
    externals: {
        'manifests': 'manifests',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                use: ['babel-loader', 'eslint-loader'],
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: './assets/css/icons.css',
            to: 'css/icons.css'
        },
        {
            from: './assets/css/navbar.css',
            to: 'css/navbar.css'
        },
        {
            from: './assets/css/table/styles.css',
            to: 'table/css/styles.css'
        }, 
        {
            from: './assets/images',
            to: 'docs/images',
        }], 
        {
            ignore: ['*.swp']
        })
    ]
}
