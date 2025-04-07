import {
  proxyMessageGate,
  proxyInprogressHandler,
  proxyCompareHandler,
} from './api/proxy.ts';

window.addEventListener(
  'message',
  proxyMessageGate(proxyInprogressHandler, proxyCompareHandler)
);
