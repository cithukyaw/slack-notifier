# Slack Notifier

**Slack Notifier** sends notifications and messages to [Slack](https://slack.com/) service using Incoming Webhook. It can be used both on the server (Node.js) and the client-side (Browser).

It is basically designed for notification messages, not support file attachment yet. You may also use this for error reporting purpose for your production environment because

- error stack is sent in code format when an Error object is thrown to the `send()` method.
- you can turn on/off the service globally as the `enabled` option can be given through the `configure()` method.

## Install with npm

    npm install slack-notifier --save

## Install with bower

    bower install slack-notifier --save

## Usage

Check the example files:

- Node.js: [/example/server.js](https://github.com/cithukyaw/slack-notifier/blob/master/example/server.js)
- Browser: [/example/client.html](https://github.com/cithukyaw/slack-notifier/blob/master/example/client.html)

## License
Released under the [MIT License](LICENSE).
