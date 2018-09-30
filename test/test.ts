import { Plugin, spawnWebpack } from '../src';
import { InternalWebpackEvent } from '../src/events';
import * as fs from 'fs-extra';
import { expect, assert, should } from 'chai';
const delay = require('delay');
import * as path from 'path';

const wpdir = path.resolve(__dirname, 'webpack');

describe('plugin', function () {
    this.timeout(20_000);

    async function run(args?: string[], callback?: () => void | boolean, timeout?: number) {
        let evs = 0;
        const cp = spawnWebpack((args || []).concat(['--mode', 'development']), { cwd: wpdir, timeout, reject: false, extendEnv: false }).on('built', () => { // extendEnv needed since else somehow cannot compile webpack.config.ts in tests (maybe because of cross-env package?)
            evs++;
            const result = callback && callback();
            if (result === true) {
                cp.childProcess.kill();
            }
        })
        const { timedOut, killed, code } = await cp.childProcess;
        if (timedOut) // process was also killed by execa on timeout so do this check before killed check
            assert.fail('timeout');
        if (killed)
            return evs;
        if (code !== 0)
            assert.fail('webpack error code !== 0');
        return evs;
    }

    it('will call afterEmit once in watch mode if no change occurs', async function () {
        await run(['--watch'], () => {
            return true;
        }, 10_000);
    });

    it('will call afterEmit on file change in watch mode', async function () {
        let w = false;
        await run(['--watch'], () => {
            if (w) {
                return true;
            } else {
                fs.writeFileSync(path.resolve(wpdir, 'src', 'index.js'), 'console.log("hello");');
                w = true;
            }
        }, 10_000);
    });

    it('will call afterEmit once on normal build', async function () {
        const evs = await run();
        expect(evs).to.equal(1);
    })
})
