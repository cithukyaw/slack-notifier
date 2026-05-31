var http = require("http");
var https = require("https");
var path = require("path");

function requireFreshNotifier() {
    var entry = path.resolve(__dirname, "../slack-notifier.js");
    var dist = path.resolve(__dirname, "../dist/slack-notifier.js");
    delete require.cache[entry];
    delete require.cache[dist];
    return require(entry);
}

function installTransportStub(statusCode, responseBody) {
    var originalHttpRequest = http.request;
    var originalHttpsRequest = https.request;
    var calls = [];

    function request(options, onResponse) {
        var req = {
            body: "",
            handlers: {},
            on: function(eventName, handler) {
                this.handlers[eventName] = handler;
            },
            write: function(body) {
                this.body += body;
            },
            end: function() {
                var res = {
                    statusCode: statusCode || 200,
                    handlers: {},
                    setEncoding: function() {},
                    on: function(eventName, handler) {
                        this.handlers[eventName] = handler;
                    }
                };

                onResponse(res);

                if (responseBody && res.handlers.data) {
                    res.handlers.data(responseBody);
                }
                if (res.handlers.end) {
                    res.handlers.end();
                }
            }
        };

        calls.push({
            options: options,
            req: req
        });

        return req;
    }

    http.request = request;
    https.request = request;

    return {
        calls: calls,
        restore: function() {
            http.request = originalHttpRequest;
            https.request = originalHttpsRequest;
        }
    };
}

describe("Send", function() {
    var slackNotifier;
    var transport;

    beforeEach(function() {
        transport = installTransportStub();
        slackNotifier = requireFreshNotifier();
        spyOn(console, "log");
    });

    afterEach(function() {
        transport.restore();
    });

    it("should throw if URL is not configured", function() {
        expect(function() {
            slackNotifier.send();
        }).toThrow("Node Slack Notifier: Slack Webhook URL must be defined.");
    });

    it("should not post when notifier is disabled", function() {
        slackNotifier.configure({
            enabled: false,
            url: "https://hooks.slack.com/services/test"
        });

        slackNotifier.send("message");

        expect(transport.calls.length).toBe(0);
        expect(console.log).toHaveBeenCalledWith("Node Slack Notifier is disabled.");
    });

    it("should post string messages to the configured Slack URL", function() {
        slackNotifier.configure({
            url: "https://hooks.slack.com/services/test"
        });

        slackNotifier.send("hello");

        expect(transport.calls.length).toBe(1);
        expect(transport.calls[0].options.protocol).toBe("https:");
        expect(transport.calls[0].options.hostname).toBe("hooks.slack.com");
        expect(transport.calls[0].options.path).toBe("/services/test");
        expect(transport.calls[0].options.method).toBe("POST");
        expect(transport.calls[0].options.headers["Content-Type"]).toBe("application/json");
        expect(JSON.parse(transport.calls[0].req.body)).toEqual({
            text: "hello",
            username: "Node Slack Notifier"
        });
        expect(console.log).toHaveBeenCalledWith("Node Slack Notifier sent a notification to Slack.");
    });

    it("should include configured username, icons, and channel", function() {
        slackNotifier.configure({
            url: "http://localhost/slack?token=abc",
            username: "deploy bot",
            icon_url: "https://example.com/icon.png",
            icon_emoji: ":rocket:",
            channel: "#deploys"
        });

        slackNotifier.send("released");

        expect(transport.calls[0].options.protocol).toBe("http:");
        expect(transport.calls[0].options.path).toBe("/slack?token=abc");
        expect(JSON.parse(transport.calls[0].req.body)).toEqual({
            text: "released",
            username: "deploy bot",
            icon_url: "https://example.com/icon.png",
            icon_emoji: ":rocket:",
            channel: "#deploys"
        });
    });

    it("should send object data as the payload text", function() {
        var text = {
            attachments: [
                {
                    text: "build failed"
                }
            ]
        };

        slackNotifier.configure({
            url: "https://hooks.slack.com/services/test"
        });

        slackNotifier.send(text);

        expect(JSON.parse(transport.calls[0].req.body).text).toEqual(text);
    });

    it("should format Error stack data as a Slack code block", function() {
        var error = new Error("boom");
        error.stack = "Error: boom\n    at spec";

        slackNotifier.configure({
            url: "https://hooks.slack.com/services/test"
        });

        slackNotifier.send(error);

        expect(JSON.parse(transport.calls[0].req.body).text).toBe("```Error: boom\n    at spec```");
    });

    it("should format stack-like object data as a Slack code block", function() {
        var errorData = {
            message: "boom",
            stack: "Error: boom\n    at plain object"
        };

        slackNotifier.configure({
            url: "https://hooks.slack.com/services/test"
        });

        slackNotifier.send(errorData);

        expect(JSON.parse(transport.calls[0].req.body).text).toBe("```Error: boom\n    at plain object```");
    });

    it("should apply per-send options and callback", function() {
        var callback = jasmine.createSpy("callback");

        slackNotifier.configure({
            url: "https://hooks.slack.com/services/default",
            username: "default"
        });

        slackNotifier.send("override", {
            url: "https://hooks.slack.com/services/override",
            username: "override",
            channel: "#alerts",
            callback: callback
        });

        expect(transport.calls[0].options.path).toBe("/services/override");
        expect(JSON.parse(transport.calls[0].req.body)).toEqual({
            text: "override",
            username: "override",
            channel: "#alerts"
        });
        expect(callback).toHaveBeenCalled();
    });

    it("should call the configured callback when no per-send callback is supplied", function() {
        var callback = jasmine.createSpy("callback");

        slackNotifier.configure({
            url: "https://hooks.slack.com/services/test",
            callback: callback
        });

        slackNotifier.send("message");

        expect(callback).toHaveBeenCalled();
    });

    it("should accept a callback as the second send argument", function() {
        var callback = jasmine.createSpy("callback");

        slackNotifier.configure({
            url: "https://hooks.slack.com/services/test"
        });

        slackNotifier.send("message", callback);

        expect(callback).toHaveBeenCalled();
    });

    it("should throw when Slack returns an error response", function() {
        transport.restore();
        transport = installTransportStub(500, "server error");
        slackNotifier = requireFreshNotifier();

        slackNotifier.configure({
            url: "https://hooks.slack.com/services/test"
        });

        expect(function() {
            slackNotifier.send("message");
        }).toThrow(new Error("Slack webhook returned 500: server error"));
    });
});
