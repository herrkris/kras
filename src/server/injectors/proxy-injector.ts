import * as WebSocket from 'ws';
import { Request } from 'express';
import { EventEmitter } from 'events';
import { proxyRequest } from '../helpers/proxy-request';
import { KrasInjector, KrasAnswer, KrasInjectorConfig, KrasConfiguration, KrasRequest, KrasInjectorOptions } from '../types';

export interface ProxyInjectorConfig {
}

export interface DynamicProxyInjectorConfig {

}

interface WebSocketSessions {
  [id: string]: WebSocket;
}

export default class ProxyInjector implements KrasInjector {
  private readonly sessions: WebSocketSessions = {};
  private readonly options: KrasInjectorConfig & ProxyInjectorConfig;
  private readonly map: {
    [target: string]: string;
  };

  constructor(options: KrasInjectorConfig & ProxyInjectorConfig, config: KrasConfiguration, core: EventEmitter) {
    this.options = options;
    this.map = config.map;

    core.on('user-connected', (e) => {
      const url = this.map[e.target] + e.url;
      const ws = new WebSocket(url, {
        rejectUnauthorized: false,
      });
      ws.on('message', (data) => {
        core.emit('message', { data });
        e.ws.send(data);
      });
      ws.on('error', (err) => core.emit('error', err));
      this.sessions[e.id] = ws;
    });

    core.on('user-disconnected', (e) => {
      const ws = this.sessions[e.id];
      ws.close();
      delete this.sessions[e.id];
    });
  }

  getOptions(): KrasInjectorOptions {
    return {};
  }

  setOptions(options: DynamicProxyInjectorConfig): void {
  }

  get name() {
    return 'proxy-injector';
  }

  get active() {
    return this.options.active;
  }

  set active(value: boolean) {
    this.options.active = value;
  }

  handle(req: KrasRequest) {
    return new Promise<KrasAnswer>((resolve) => {
      const target = this.map[req.target];
      const name = this.name;
      const label = {
        name,
        host: {
          name: target,
        },
      };
      proxyRequest({
        headers: req.headers,
        url: target + req.url,
        method: req.method,
        body: req.content,
      }, (err, ans) => resolve(ans), label);
    });
  }
}
