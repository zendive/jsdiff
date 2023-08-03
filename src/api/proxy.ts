import { ERROR, TAG } from '@/api/const';

export function proxyMessageGate(
  callbackInprogress: (e: MessageEvent<IProgressMessage>) => void,
  callbackCompare: (e: MessageEvent<ICompareMessage>) => Promise<void>
) {
  return function (e: MessageEvent) {
    if (e.source === window && typeof e.data === 'object' && e.data !== null) {
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

  try {
    // may throw
    await chrome.storage.local.set({ lastApiReq: next, lastError: '' });

    chrome.runtime.sendMessage(
      {
        source: 'jsdiff-proxy-to-panel-compare',
      } as ICompareMessage,
      handleResponse
    );
  } catch (error: any) {
    if (error?.message === ERROR.QUOTA_EXCEEDED) {
      await chrome.storage.local.set({ lastError: ERROR.QUOTA_EXCEEDED });

      chrome.runtime.sendMessage(
        { source: 'jsdiff-proxy-to-panel-error' } as IErrorMessage,
        handleResponse
      );
    } else if (error?.message) {
      console.error('Unhnadled', error.message);
    }
  }
}

export function proxyInprogressHandler(
  e: MessageEvent<IProgressMessage>
): void {
  chrome.runtime.sendMessage(
    {
      source: 'jsdiff-proxy-to-panel-inprogress',
      on: e.data.on,
    } as IProgressMessage,
    handleResponse
  );
}

function processComparisonObject(
  old: ICompareMessagePayload,
  next: ICompareMessagePayload
) {
  if (!old) {
    old = {
      left: TAG.EMPTY,
      right: TAG.EMPTY,
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

function handleResponse(): void {
  if (!isIgnorable(chrome.runtime.lastError)) {
    console.error(chrome.runtime.lastError);
  }
}

function isIgnorable(error: chrome.runtime.LastError | undefined): boolean {
  return (
    !error ||
    error.message === ERROR.NO_CONNECTION ||
    error.message === ERROR.PORT_CLOSED
  );
}
