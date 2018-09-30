import * as execa from 'execa';
import { WebpackEvent, InternalWebpackEvent, allWebpackEvents } from './events';

export class WebpackProcess {
    private afterEmitCount = 0;
    private listeners: { [event: string]: Set<() => void> } = Object.create(null);

    constructor(public readonly childProcess: execa.ExecaChildProcess) {
        for (const event of allWebpackEvents) {
            this.listeners[event] = new Set();
        }
        this.childProcess.on('message', message => {
            if (message === InternalWebpackEvent.afterEmit) {
                this.afterEmitCount++;
                this.emit('built');
                if (this.afterEmitCount === 1) {
                    this.emit('built-initial');
                } else {
                    this.emit('rebuilt');
                }
            }
        });
    }

    private emit(event: WebpackEvent) {
        for (const listener of this.listeners[event]) {
            listener();
        }
    }

    on(event: WebpackEvent, callback: () => void): WebpackProcess {
        this.listeners[event].add(callback);
        return this;
    }

    off(event: WebpackEvent, callback: () => void): WebpackProcess {
        this.listeners[event].delete(callback);
        return this;
    }

    once(event: WebpackEvent, callback: () => void): WebpackProcess {
        const listener = () => {
            this.off(event, listener);
            callback();
        };
        return this.on(event, listener);
    }

    toPromise(event: WebpackEvent): Promise<void> {
        return new Promise(resolve => {
            this.once(event, resolve)
        })
    }
}
