var slackNotifier = require("../slack-notifier");

describe("Send", function() {
    it("should throw if URL is not configured", function() {
        expect(function() {
            slackNotifier.send();
        }).toThrow("Node Slack Notifier: Slack Webhook URL must be defined.");
    });
});
