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
export declare function createSlackNotifier(request: RequestAdapter, env: RuntimeEnvironment): SlackNotifier;
