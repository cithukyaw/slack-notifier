(function() {
    'use strict';

    var slackNotifier = require('../slack-notifier');

    // global configuration, but it can be overidden by each call
    slackNotifier.configure({
        url: '' // your Webhook URL (mandatory)
        // username: 'your-custom-name',
        // channel: '#your-custom-channel',
        // icon_url: '/path/to/your/icon',
        // icon_emoji: ':slack:',
        // enabled: true or false (default to true; if false all notification will not be sent; useful if you want to turn off this service from a place)
        // callback: function() { } // The callback function to be executed when every notification is sent
    });

    slackNotifier.send('*1.* This is a message to the default configured channel.');

    slackNotifier.send(new Error('2. This is an error object to the default configured channel'));

    slackNotifier.send('*3.* This is a message to the default configured channel with callback.', function() {
        console.log('The callback is executed for (3) only.');
    });

    slackNotifier.send('*4.* This is a message to #general.', {
        // url: 'another web hook URL',
        username: 'node-slack-notifier',
        channel: '#general',
        //icon_url: '',
        icon_emoji: ':ghost:'
    });

    slackNotifier.send('*5.* This is a message to #general with callback.', {
        channel: '#general',
        callback: function() {
            console.log('The callback is executed for (5) only.');
        }
    });
}());
