"use strict";
(() => {
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

  // src/browser.ts
  var request = {
    post(url, payload, done) {
      if (typeof window.fetch === "function") {
        window.fetch(url, {
          method: "POST",
          body: JSON.stringify(payload)
        }).then(function(response) {
          return response.text();
        }).then(function(data) {
          if (data === "ok" || data === "") {
            done(void 0, data);
          } else {
            done(data);
          }
        }).catch(done);
        return;
      }
      if (window.jQuery && typeof window.jQuery.ajax === "function") {
        window.jQuery.ajax({
          type: "POST",
          url,
          data: JSON.stringify(payload),
          crossDomain: true,
          success: function(data) {
            if (data === "ok") {
              done(void 0, data);
            } else {
              done(data);
            }
          },
          error: function(xhr, status, error) {
            done(error);
          }
        });
        return;
      }
      done(new Error("Client Slack Notifier: fetch or jQuery.ajax must be available."));
    }
  };
  window.slackNotifier = createSlackNotifier(request, "client");
})();
