# Slack Notifier

[![](https://data.jsdelivr.com/v1/package/npm/slack-notifier/badge)](https://www.jsdelivr.com/package/npm/slack-notifier)

**Slack Notifier** sends notifications and messages to [Slack](https://slack.com/) service using Incoming Webhook. It can be used both on the server (Node.js) and the client-side (Browser).

It is basically designed for notification messages, not support file attachment yet. You may also use this for error reporting purpose for your production environment because

- error stack is sent in code format when an Error object is thrown to the `send()` method.
- you can turn on/off the service globally as the `enabled` option can be given through the `configure()` method.

## Install with npm
```bash
npm install slack-notifier --save
```

## Install with bower
```bash
bower install slack-notifier --save
```

## CDN
```html
<script src="//cdn.jsdelivr.net/npm/slack-notifier@2.0.0/dist/slack-notifier.browser.js" type="text/javascript"></script>
```

## TypeScript

Type declarations are included in the package. Node.js users can continue to use CommonJS:
```js
var slackNotifier = require('slack-notifier');
```

Browser users can load the bundled script, which exposes `window.slackNotifier`. The browser bundle uses `fetch` when available and falls back to `jQuery.ajax`.

## Usage

```js
slackNotifier.configure({
    url: '' // your Webhook URL (mandatory)
    // username: 'your-custom-name',
    // channel: '#your-custom-channel',
    // icon_url: '/path/to/your/icon',
    // icon_emoji: ':slack:',
    // enabled: true or false (default to true; if false all notification will not be sent; useful if you want to turn off this service from a place)
    // callback: function() { } // The callback function to be executed when every notification is sent
});
```

Check the example files:

- Node.js: [/example/server.js](https://github.com/cithukyaw/slack-notifier/blob/master/example/server.js)
- Browser: [/example/client.html](https://github.com/cithukyaw/slack-notifier/blob/master/example/client.html)

## Unit testing

Run the Jasmine test suite:
```bash
bun run test
```

Generate a Jasmine JUnit XML report:
```bash
bun run test:report
```

The XML report is written to `reports/jasmine/`.

Run the test suite with code coverage:
```bash
bun run test:coverage
```

Coverage output is written to `coverage/`, including terminal text, `lcov`, and Cobertura XML reports.

## License
Released under the [MIT License](LICENSE).
