
import * as webpack from 'webpack';
import { InternalWebpackEvent } from './events';

const id = 'webpack-events';

export class Plugin implements webpack.Plugin {
    apply(compiler: webpack.Compiler) {
        compiler.hooks.afterEmit.tap(id, (compilation) => {
            if (process.send) {
                process.send(InternalWebpackEvent.afterEmit);
            }
        });
    }
}