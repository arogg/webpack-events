# webpack-events

Define what to do at different stages of a webpack build/watch process (outside of webpack itsself)

## Motivation

- There are several things that you could want to do while webpack runs at different stages of the webpack run, e.g. (re-)starting servers, browser-sync, etc.
- Oftentimes you don't want to hardcode that logic into the webpack config, because it's inpractical or you want separation of concerns.
- Maybe you want to coordinate multiple webpack builds (e.g. server and client) and want something to happen once every webpack build is at a certain stage.
- Order is often important. Maybe something only works when started after something else.

## Usage

Add the plugin to your webpack configuration(s)

```javascript
module.exports = {
    // ...
    plugins: [new require('webpack-events').Plugin()]
}
```

Then configure your build steps (e.g. in a [gulp](https://gulpjs.com/) file)

```javascript
const { spawnWebpack } = require('webpack-events');

const webpackServer = spawnWebpack(['--watch', '--config', 'server/webpack.config.js']);
const webpackClient = spawnWebpack(['--watch', '--config', 'client/webpack.config.js']);

Promise.all(
    webpackServer.toPromise('built-initial'),
    webpackClient.toPromise('built-initial')
).then(() => {
    // start server
    // start browser-sync
});

webpackServer.on('rebuilt', () => {
    // restart server here
});
```

## API

### spawnWebpack([arguments], [options])

args: array of string<br>
options: [`execa`](https://www.npmjs.com/package/execa) options<br>

Runs the *local* webpack-cli installation.

Returns a WebpackProcess.

### <a name="on"></a>WebpackProcess.on(event, callback)

event: string<br>
    - `built` after every webpack emit<br>
    - `built-initial` after the first webpack emit<br>
    - `rebuilt` after all but the first webpack emit<br>
callback: called when the event occurs with no arguments

Subscribes to an event.

### WebpackProcess.off(event, callback)

See [`WebpackProcess.on`](#on) for a parameter description.

Unsubscribes from an event.

### WebpackProcess.once(event, callback)

See [`WebpackProcess.on`](#on) for a parameter description.

Subscribes to an event and unsubscribe after the first instance of the event.

### WebpackProcess.toPromise(event)

See [`WebpackProcess.on`](#on) for a parameter description.

Returns a promise that resolves when the event occurs.

### WebpackProcess.childProcess

The instance of the [`execa`](https://www.npmjs.com/package/execa) child process instance.

## TypeScript

Supports TypeScript natively and typings are included.

## License

MIT