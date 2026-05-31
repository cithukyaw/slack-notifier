import { createSlackNotifier, RequestAdapter, SlackNotifierPayload } from './core';

declare global {
    interface Window {
        slackNotifier: ReturnType<typeof createSlackNotifier>;
        jQuery?: {
            ajax(options: {
                type: string;
                url: string;
                data: string;
                crossDomain: boolean;
                success(data: unknown): void;
                error(xhr: unknown, status: unknown, error: unknown): void;
            }): void;
        };
    }
}

const request: RequestAdapter = {
    post(url: string, payload: SlackNotifierPayload, done: (err?: unknown, data?: unknown) => void): void {
        if (typeof window.fetch === 'function') {
            window.fetch(url, {
                method: 'POST',
                body: JSON.stringify(payload)
            })
                .then(function(response): Promise<string> {
                    return response.text();
                })
                .then(function(data): void {
                    if (data === 'ok' || data === '') {
                        done(undefined, data);
                    } else {
                        done(data);
                    }
                })
                .catch(done);
            return;
        }

        if (window.jQuery && typeof window.jQuery.ajax === 'function') {
            window.jQuery.ajax({
                type: 'POST',
                url: url,
                data: JSON.stringify(payload),
                crossDomain: true,
                success: function(data: unknown): void {
                    if (data === 'ok') {
                        done(undefined, data);
                    } else {
                        done(data);
                    }
                },
                error: function(xhr: unknown, status: unknown, error: unknown): void {
                    done(error);
                }
            });
            return;
        }

        done(new Error('Client Slack Notifier: fetch or jQuery.ajax must be available.'));
    }
};

window.slackNotifier = createSlackNotifier(request, 'client');
