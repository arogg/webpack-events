import { InternalWebpackEvent, allInternalWebpackEvents } from './events';
import * as execa from 'execa';
import { WebpackProcess } from './webpackProcess';

/**
 * Finds and runs the local webpack installation asynchronously
 * @param args The command line arguments passed to webpack
 * @param options The arguments passed to execa
 */
export function spawnWebpack(args?: string[], options?: execa.Options) {

    options = options || {};
    const cwd = options.cwd || process.cwd();

    const std = options.stdio || 'pipe';
    const stdo = Array.isArray(std) ? std : [std, std, std];
    const baseOptions: execa.Options = {
        stdio: stdo.indexOf('ipc') !== -1 ? stdo : stdo.concat(['ipc'])
    }
    const finalOptions = { ...options, ...baseOptions, extendEnv: false } as execa.Options; // extendEnv needed since else somehow cannot compile webpack.config.ts in tests (maybe because of cross-env package?)

    // don't use npm-which package here since that resolves to .cmd file in node_modules/.bin dir and with that file ipc gives error (bad file descriptor)
    const procArgs = ['node'] as any[];
    args && args.unshift(require.resolve('webpack-cli', { paths: [cwd] })) // todo exception if not found
    args && procArgs.push(args);
    procArgs.push(finalOptions);

    let child;
    if (procArgs.length === 2) { // todo
        child = execa(procArgs[0], procArgs[1]) as execa.ExecaChildProcess;
    } else {
        child = execa(procArgs[0], procArgs[1], procArgs[2]) as execa.ExecaChildProcess;
    }

    return new WebpackProcess(child);
}