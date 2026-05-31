"use strict";

// src/core.ts
function applyOptions(settings, options) {
  if (Object.prototype.hasOwnProperty.call(options, "enabled")) {
    settings.enabled = options.enabled;
  }
  if (options.url) {
    settings.url = options.url;
  }
  if (options.username) {
    settings.username = options.username;
  }
  if (options.icon_url) {
    settings.iconUrl = options.icon_url;
  }
  if (options.icon_emoji) {
    settings.iconEmoji = options.icon_emoji;
  }
  if (options.channel) {
    settings.channel = options.channel;
  }
}
function createSlackNotifier(request2, env) {
  let settings = {};
  let callback = null;
  const name = env === "server" ? "Node Slack Notifier" : "Client Slack Notifier";
  return {
    configure(options) {
      if (!options) {
        throw "'options' must be provided.";
      }
      const nextSettings = {};
      if (typeof options.callback === "function") {
        callback = options.callback;
      }
      applyOptions(nextSettings, options);
      settings = nextSettings;
    },
    send(data, param) {
      if (settings.enabled === false) {
        console.log(name + " is disabled.");
        return;
      }
      let fn = null;
      if (typeof param === "function") {
        fn = param;
      } else if (param && typeof param === "object") {
        applyOptions(settings, param);
        if (typeof param.callback === "function") {
          fn = param.callback;
        }
      }
      if (!settings.url) {
        throw name + ": Slack Webhook URL must be defined.";
      }
      if (!settings.username) {
        settings.username = name;
      }
      if (typeof data === "string") {
        settings.text = data;
      } else if (data && typeof data === "object") {
        if (data instanceof Error && data.stack) {
          settings.text = "```" + data.stack + "```";
        } else if ("stack" in data && typeof data.stack === "string") {
          settings.text = "```" + data.stack + "```";
        } else {
          settings.text = data;
        }
      }
      const payload = {
        text: settings.text
      };
      if (settings.username) {
        payload.username = settings.username;
      }
      if (settings.iconUrl) {
        payload.icon_url = settings.iconUrl;
      }
      if (settings.iconEmoji) {
        payload.icon_emoji = settings.iconEmoji;
      }
      if (settings.channel) {
        payload.channel = settings.channel;
      }
      request2.post(settings.url, payload, function(err) {
        if (err) {
          throw err;
        }
        console.log(name + " sent a notification to Slack.");
        if (fn) {
          fn();
        } else if (callback) {
          callback();
        }
      });
    }
  };
}

// src/index.ts
var http = require("http");
var https = require("https");
var URL = require("url").URL;
var Buffer = require("buffer").Buffer;
var request = {
  post(url, payload, done) {
    const webhookUrl = new URL(url);
    const body = JSON.stringify(payload);
    const transport = webhookUrl.protocol === "https:" ? https : http;
    const req = transport.request(
      {
        protocol: webhookUrl.protocol,
        hostname: webhookUrl.hostname,
        port: webhookUrl.port,
        path: webhookUrl.pathname + webhookUrl.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        }
      },
      function(res) {
        let responseBody = "";
        res.setEncoding("utf8");
        res.on("data", function(chunk) {
          responseBody += chunk;
        });
        res.on("end", function() {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            done();
          } else {
            done(new Error("Slack webhook returned " + res.statusCode + ": " + responseBody));
          }
        });
      }
    );
    req.on("error", done);
    req.write(body);
    req.end();
  }
};
var slackNotifier = createSlackNotifier(request, "server");
module.exports = slackNotifier;
