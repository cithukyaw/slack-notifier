var slackNotifier = require("../slack-notifier");

describe("Configuration", function() {
    it("should throw when no options are passed", function() {
        expect(function() {
            slackNotifier.configure();
        }).toThrow("'options' must be provided.");
    });

    it("should not throw when something is passed", function() {
        expect(function() {
            slackNotifier.configure({});
        }).not.toThrow();
    });
});
