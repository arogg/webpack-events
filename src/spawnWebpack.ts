import { InternalWebpackEvent, allInternalWebpackEvents } from './events';
import * as execa from 'execa';
import { WebpackProcess } from './webpackProcess';

/**
 * Finds and runs the local webpack installation asynchronously
 * @param args The command line arguments passed to webpack
 * @param options The arguments passed to execa
 */
export function spawnWebpack(args?: string[], options?: execa.Options) {

    const cmd = 'node';

    args = args || [];
    let webpackCli: string;
    try {
        const cwd = options && options.cwd || process.cwd();
        webpackCli = require.resolve('webpack-cli', { paths: [cwd] });
    } catch {
        throw new Error('Cannot find webpack-cli in local node_modules');
    }
    args = [webpackCli, ...args];

    options = options || {};
    let stdio = options.stdio || 'pipe';
    stdio = Array.isArray(stdio) ? stdio : [stdio, stdio, stdio];
    stdio = stdio.indexOf('ipc') !== -1 ? stdio : stdio.concat(['ipc']);
    options = { ...options, stdio };

    // don't use npm-which package here since that resolves to .cmd file in node_modules/.bin dir and with that file ipc gives error (bad file descriptor)

    const allArgs = [cmd, args, options];
    // console.log(JSON.stringify(allArgs,null,4));
    const child = execa.apply(execa, allArgs);

    return new WebpackProcess(child);
}