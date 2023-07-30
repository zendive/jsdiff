import {
  proxyMessageGate,
  proxyInprogressHandler,
  proxyCompareHandler,
} from '@/api/proxy';

window.addEventListener(
  'message',
  proxyMessageGate(proxyInprogressHandler, proxyCompareHandler)
);
