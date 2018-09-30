import * as execa from 'execa';
import { WebpackProcess } from './webpackProcess';

/**
 * Finds and runs the local webpack installation asynchronously
 * @param args The command line arguments passed to webpack
 * @param options The arguments passed to execa
 */
export function spawnWebpack(args?: string[], options?: execa.Options) {

    const cmd = 'node';// don't use npm-which package here since that resolves to .cmd file in node_modules/.bin dir and with that file ipc gives error (bad file descriptor)

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
    const DEFAULT = 'pipe';
    let stdio: typeof options.stdio = options.stdio || DEFAULT;
    if (!Array.isArray(stdio)) {
        stdio = [stdio, stdio, stdio, 'ipc'] as any[];
    } else if (stdio.indexOf('ipc') === -1) {
        while (stdio.length < 3)
            stdio.push(DEFAULT);
        stdio.push('ipc');
    }
    options = { ...options, stdio };

    const allArgs = [cmd, args, options];
    const child = execa.apply(execa, allArgs);

    return new WebpackProcess(child);
}