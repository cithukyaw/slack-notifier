import { createSlackNotifier, RequestAdapter, SlackNotifierPayload } from './core';

declare const require: (moduleName: string) => any;

const http = require('http');
const https = require('https');
const URL = require('url').URL;
const Buffer = require('buffer').Buffer;

const request: RequestAdapter = {
    post(url: string, payload: SlackNotifierPayload, done: (err?: unknown) => void): void {
        const webhookUrl = new URL(url);
        const body = JSON.stringify(payload);
        const transport = webhookUrl.protocol === 'https:' ? https : http;

        const req = transport.request(
            {
                protocol: webhookUrl.protocol,
                hostname: webhookUrl.hostname,
                port: webhookUrl.port,
                path: webhookUrl.pathname + webhookUrl.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                }
            },
            function(res: any): void {
                let responseBody = '';

                res.setEncoding('utf8');
                res.on('data', function(chunk: string): void {
                    responseBody += chunk;
                });
                res.on('end', function(): void {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        done();
                    } else {
                        done(new Error('Slack webhook returned ' + res.statusCode + ': ' + responseBody));
                    }
                });
            }
        );

        req.on('error', done);
        req.write(body);
        req.end();
    }
};

const slackNotifier = createSlackNotifier(request, 'server');

export = slackNotifier;
