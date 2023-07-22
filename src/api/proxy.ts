import { TAG } from '@/api/const';

export function proxyMessageGate<T extends MessageEvent>(
  callbackInprogress: (e: T) => void,
  callbackCompare: (e: T) => Promise<void>
) {
  return function (e: T) {
    if (
      e.origin === window.location.origin &&
      e.source === window &&
      typeof e.data === 'object' &&
      e.data !== null
    ) {
      if ('jsdiff-console-to-proxy-inprogress' === e.data.source) {
        callbackInprogress(e);
      } else if ('jsdiff-console-to-proxy-compare' === e.data.source) {
        callbackCompare(e);
      }
    }
  };
}

export async function proxyCompareHandler(
  e: MessageEvent<ICompareMessage>
): Promise<void> {
  const current = e.data.payload;
  const { lastApiReq: old } = await chrome.storage.local.get(['lastApiReq']);
  const next = processComparisonObject(old, current);

  await chrome.storage.local.set({ lastApiReq: next });
  chrome.runtime.sendMessage({ source: 'jsdiff-proxy-to-panel-compare' });
}

export function proxyInprogressHandler(
  e: MessageEvent<IProgressMessage>
): void {
  chrome.runtime.sendMessage({
    source: 'jsdiff-proxy-to-panel-inprogress',
    on: e.data.on,
  });
}

function processComparisonObject(
  old: ICompareMessagePayload,
  next: ICompareMessagePayload
) {
  if (!old) {
    old = {
      left: TAG.VALUE_IS_EMPTY,
      right: TAG.VALUE_IS_EMPTY,
      timestamp: Date.now(),
    };
  }

  const rv = old;

  if (Reflect.has(next, 'push')) {
    rv.left = rv.right;
    rv.right = next.push;
  } else {
    if (Reflect.has(next, 'left')) {
      rv.left = next.left;
    }
    if (Reflect.has(next, 'right')) {
      rv.right = next.right;
    }
  }

  rv.timestamp = next.timestamp;

  return rv;
}
