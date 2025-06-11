const path = require('path');

module.exports = {
    entry: './src/backend/backend.ts',
    target: 'electron-main',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'backend.js'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    node: {
        __dirname: false,
        __filename: false,
    },
};