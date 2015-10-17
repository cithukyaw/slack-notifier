/**
 * slack-notifier.js 0.0.3
 * slack-notifier may be freely distributed under the MIT license.
 */
(function() {
    'use strict';

    // Establish the running environment: server (node.js) or client (browser)
    var env = (typeof module !== 'undefined' && module.exports) ? 'server' : 'client';

    var slackNotifier = function(request) {
        var settings = {};
        var name = (env === 'server') ? 'Node Slack Notifier' : 'Client Slack Notifier';
        var callback = null;

        return {
            /**
             * Configure a Slack Incoming Webhook
             * This will be used as global configuration
             * @param {Object}   options            The configuration options
             * @param {Boolean}  options.enabled    Notification sending On or Off; defaults to `true`
             * @param {String}   options.url        (require) Send your JSON payloads to this URL.
             * @param {String}   options.username   The username that this integration will post as.
             * @param {String}   options.icon_url   The icon image URL that is used for sender avator
             * @param {String}   options.icon_emoji The slack emoji icon that is used for sender avator, e.g., :ghost:
             * @param {String}   options.channel    The slack channel where messages are sent to
             * @param {Function} options.callback   The callback function to be called when the notification is sent
             */
            configure: function(options) {
                if (!options) {
                    throw 'The parameter "options" must be provided.';
                }

                if (typeof(options.callback) === 'function') {
                    callback = options.callback;
                    delete options.callback;
                }
                settings = options;
            },
            /**
             * Post to Slack
             * @param {String|Object} data             The text or the error object that will be posted
             *
             * @param {Function}      param            The callback function to be called when the notification is sent
             *                                         [OR]
             * @param {Object}        param            Optional configuration that overwrites the global setting for the current hook
             * @param {String}        param.url        Send your JSON payloads to this URL.
             * @param {String}        param.username   The username that this integration will post as.
             * @param {String}        param.icon_url   The icon image URL that is used for sender avator
             * @param {String}        param.icon_emoji The slack emoji icon that is used for sender avator, e.g., :ghost:
             * @param {String}        param.channel    The slack channel where messages are sent to
             * @param {Function}      param.callback   The callback function to be called when the notification is sent
             */
            send: function(data, param) {
                if (settings.enabled === false) {
                    console.log(name + ' is disabled.');
                    return;
                }

                var fn = null;
                if (typeof(param) === 'object') {
                    // overwrite settings
                    if (param.url) {
                        settings.url = param.url;
                    }
                    if (param.username) {
                        settings.username = param.username;
                    }
                    if (param.icon_url) {
                        settings.iconUrl = param.icon_url;
                    }
                    if (param.icon_emoji) {
                        settings.iconEmoji = param.icon_emoji;
                    }
                    if (param.channel) {
                        settings.channel = param.channel;
                    }
                    if (param.callback) {
                        fn = param.callback;
                    }
                } else if (typeof(param) === 'function') {
                    fn = param;
                }

                if (!settings.url) {
                    throw name + ': Slack Webhook URL must be defined.';
                }

                if (!settings.username) { // use default name
                    settings.username = name;
                }

                if (typeof(data) === 'string') {
                    settings.text = data;
                } else if (typeof(data) === 'object') {
                    if (data.stack) {
                        settings.text = '```' + data.stack + '```';
                    } else {
                        settings.text = data;
                    }
                }

                var playload = {
                    text: settings.text
                };
                if (settings.username) {
                    playload.username = settings.username;
                }
                if (settings.iconUrl) {
                    playload.icon_url = settings.iconUrl;
                }
                if (settings.iconEmoji) {
                    playload.icon_emoji = settings.iconEmoji;
                }
                if (settings.channel) {
                    playload.channel = settings.channel;
                }

                if (env === 'server') {
                    request.post(settings.url)
                        .send(playload)
                        .end(function(err) {
                            if (err) {
                                throw err;
                            }

                            console.log(name + ' sent a notification to Slack.');

                            if (fn) { // callback function given here
                                fn();
                            } else if (callback) { // callback functions for all
                                callback();
                            }
                        });
                } else {
                    request.ajax({
                        type: 'POST',
                        url: settings.url,
                        data: JSON.stringify(playload),
                        crossDomain: true,
                        success: function(data) {
                            if (data === 'ok') {
                                console.log(name + ' sent a notification to Slack.');

                                if (fn) { // callback function given here
                                    fn();
                                } else if (callback) { // callback functions for all
                                    callback();
                                }
                            } else {
                                console.log(name + ': ' + data);
                            }
                        },
                        error: function(xhr, status, error) {
                            throw error;
                        }
                    });
                }
            }
        };
    };

    // "sync" the behavior of node require() and browser <script> tag
    if (env === 'server') {
        // we're on node.js where we have the sweet module system to support exports and require
        exports = module.exports = slackNotifier(require('superagent'));
    } else {
        // we're on browser, so let's "call" the defered self-executing function
        window.slackNotifier = slackNotifier(jQuery); // given that jQuery library is included already
    }
}());
