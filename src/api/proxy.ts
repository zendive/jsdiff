import {
  ERROR_NO_CONNECTION,
  ERROR_PORT_CLOSED,
  ERROR_QUOTA_EXCEEDED,
  TAG_EMPTY,
} from './const.ts';

export interface ICompareMessagePayload {
  push?: unknown;
  left?: unknown;
  right?: unknown;
  timestamp: number;
  [key: string]: unknown;
}

interface ICompareMessage {
  source: 'jsdiff-proxy-to-panel-compare';
  payload: ICompareMessagePayload;
}

interface IErrorMessage {
  source: 'jsdiff-proxy-to-panel-error';
}

interface IProgressMessage {
  source: 'jsdiff-proxy-to-panel-inprogress';
  on: boolean;
}

export type TRuntimeMessageOptions =
  | ICompareMessage
  | IProgressMessage
  | IErrorMessage;

export function proxyMessageGate(
  callbackInprogress: (e: MessageEvent<IProgressMessage>) => void,
  callbackCompare: (e: MessageEvent<ICompareMessage>) => Promise<void>,
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
  e: MessageEvent<ICompareMessage>,
): Promise<void> {
  try {
    const current = e.data.payload;
    const { lastApiReq: old } = await chrome.storage.local.get(['lastApiReq']);
    const next = processComparisonObject(
      old as ICompareMessagePayload,
      current,
    );

    // may throw
    await chrome.storage.local.set({ lastApiReq: next, lastError: '' });

    chrome.runtime.sendMessage(
      {
        source: 'jsdiff-proxy-to-panel-compare',
      } as ICompareMessage,
      handleResponse,
    );
  } catch (error: unknown) {
    if (error?.message === ERROR_QUOTA_EXCEEDED) {
      await chrome.storage.local.set({ lastError: ERROR_QUOTA_EXCEEDED });

      chrome.runtime.sendMessage(
        { source: 'jsdiff-proxy-to-panel-error' } as IErrorMessage,
        handleResponse,
      );
    } else if (error?.message) {
      console.error('Unhnadled', error.message);
    }
  }
}

export function proxyInprogressHandler(
  e: MessageEvent<IProgressMessage>,
): void {
  chrome.runtime.sendMessage(
    {
      source: 'jsdiff-proxy-to-panel-inprogress',
      on: e.data.on,
    } as IProgressMessage,
    handleResponse,
  );
}

function processComparisonObject(
  old: ICompareMessagePayload,
  next: ICompareMessagePayload,
) {
  if (!old) {
    old = {
      left: TAG_EMPTY,
      right: TAG_EMPTY,
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
    error.message === ERROR_NO_CONNECTION ||
    error.message === ERROR_PORT_CLOSED
  );
}
