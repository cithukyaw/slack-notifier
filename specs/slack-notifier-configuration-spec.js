var path = require("path");

function requireFreshNotifier() {
    var entry = path.resolve(__dirname, "../slack-notifier.js");
    var dist = path.resolve(__dirname, "../dist/slack-notifier.js");
    delete require.cache[entry];
    delete require.cache[dist];
    return require(entry);
}

describe("Configuration", function() {
    var slackNotifier;

    beforeEach(function() {
        slackNotifier = requireFreshNotifier();
    });

    it("should throw when no options are passed", function() {
        expect(function() {
            slackNotifier.configure();
        }).toThrow("'options' must be provided.");
    });

    it("should not throw when options are passed", function() {
        expect(function() {
            slackNotifier.configure({});
        }).not.toThrow();
    });

    it("should replace previous configuration", function() {
        slackNotifier.configure({
            url: "https://hooks.slack.com/services/first",
            username: "first"
        });

        slackNotifier.configure({});

        expect(function() {
            slackNotifier.send("message");
        }).toThrow("Node Slack Notifier: Slack Webhook URL must be defined.");
    });
});
