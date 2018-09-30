import { Plugin } from '../../src';
import * as path from 'path';
import * as webpack from 'webpack';

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'output.js'
    },
    plugins: [new Plugin()]
} as webpack.Configuration;
