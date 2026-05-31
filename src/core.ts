export type RuntimeEnvironment = 'server' | 'client';

export type SlackNotifierCallback = () => void;

export interface SlackNotifierOptions {
    enabled?: boolean;
    url?: string;
    username?: string;
    icon_url?: string;
    icon_emoji?: string;
    channel?: string;
    callback?: SlackNotifierCallback;
}

export interface SlackNotifierPayload {
    text?: string | object;
    username?: string;
    icon_url?: string;
    icon_emoji?: string;
    channel?: string;
}

export type SlackNotifierData = string | Error | object;
export type SlackNotifierSendParam = SlackNotifierCallback | SlackNotifierOptions;

export interface SlackNotifier {
    configure(options: SlackNotifierOptions): void;
    send(data?: SlackNotifierData, param?: SlackNotifierSendParam): void;
}

export interface RequestAdapter {
    post(url: string, payload: SlackNotifierPayload, done: (err?: unknown, data?: unknown) => void): void;
}

interface InternalSettings {
    enabled?: boolean;
    url?: string;
    username?: string;
    iconUrl?: string;
    iconEmoji?: string;
    channel?: string;
    text?: string | object;
}

function applyOptions(settings: InternalSettings, options: SlackNotifierOptions): void {
    if (Object.prototype.hasOwnProperty.call(options, 'enabled')) {
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

export function createSlackNotifier(request: RequestAdapter, env: RuntimeEnvironment): SlackNotifier {
    let settings: InternalSettings = {};
    let callback: SlackNotifierCallback | null = null;
    const name = env === 'server' ? 'Node Slack Notifier' : 'Client Slack Notifier';

    return {
        configure(options: SlackNotifierOptions): void {
            if (!options) {
                throw "'options' must be provided.";
            }

            const nextSettings: InternalSettings = {};
            if (typeof options.callback === 'function') {
                callback = options.callback;
            }
            applyOptions(nextSettings, options);
            settings = nextSettings;
        },

        send(data?: SlackNotifierData, param?: SlackNotifierSendParam): void {
            if (settings.enabled === false) {
                console.log(name + ' is disabled.');
                return;
            }

            let fn: SlackNotifierCallback | null = null;
            if (typeof param === 'function') {
                fn = param;
            } else if (param && typeof param === 'object') {
                applyOptions(settings, param);
                if (typeof param.callback === 'function') {
                    fn = param.callback;
                }
            }

            if (!settings.url) {
                throw name + ': Slack Webhook URL must be defined.';
            }

            if (!settings.username) {
                settings.username = name;
            }

            if (typeof data === 'string') {
                settings.text = data;
            } else if (data && typeof data === 'object') {
                if (data instanceof Error && data.stack) {
                    settings.text = '```' + data.stack + '```';
                } else if ('stack' in data && typeof data.stack === 'string') {
                    settings.text = '```' + data.stack + '```';
                } else {
                    settings.text = data;
                }
            }

            const payload: SlackNotifierPayload = {
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

            request.post(settings.url, payload, function(err: unknown): void {
                if (err) {
                    throw err;
                }

                console.log(name + ' sent a notification to Slack.');

                if (fn) {
                    fn();
                } else if (callback) {
                    callback();
                }
            });
        }
    };
}
