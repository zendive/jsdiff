import {
  proxyCompareHandler,
  proxyInprogressHandler,
  proxyMessageGate,
} from './api/proxy.ts';

globalThis.addEventListener(
  'message',
  proxyMessageGate(proxyInprogressHandler, proxyCompareHandler),
);
