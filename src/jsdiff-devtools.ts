import { ERROR_QUOTA_EXCEEDED, TAG_EMPTY } from './api/const.ts';
import {
  ERT_TYPE,
  type IDiffPayload,
  type IRuntimeDiffEvent,
  type IRuntimeErrorEvent,
  type TRuntimeEvents,
} from './api/events.ts';
import { runtimeResponse } from './api/toolkit.ts';

// tabId may be null if user opened the devtools of the devtools
if (chrome.devtools.inspectedWindow.tabId !== null) {
  chrome.devtools.panels.create(
    'JSDiff',
    '/public/img/panel-icon28.png',
    '/public/jsdiff-panel.html',
    (/*panel*/) => {
      chrome.runtime.onMessage.addListener(onRuntimeMessage);
    },
  );
}

function onRuntimeMessage(e: TRuntimeEvents) {
  if (e.type === ERT_TYPE.SAVE) {
    mergeStoreRelay(e.payload);
  }
}

async function mergeStoreRelay(payload: IDiffPayload) {
  const current = payload;
  const {
    lastApiReq: previous,
  }: {
    lastApiReq: IDiffPayload;
  } = await chrome.storage.local.get(['lastApiReq']);
  const actual = constructComparisonPayload(previous, current);

  try {
    // may throw if out of QUOTA memory
    await chrome.storage.local.set({ lastApiReq: actual, lastError: '' });

    // if not thrown then its safe to assume that payload
    // wasn't a memory bomb and it's safe to sent to front-end
    postRuntime({ type: ERT_TYPE.DIFF, payload: actual });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === ERROR_QUOTA_EXCEEDED
    ) {
      await chrome.storage.local.set({ lastError: error.message });
      postRuntime({ type: ERT_TYPE.ERROR });
    } else {
      console.error('Unhandled', error);
    }
  }
}

function postRuntime(e: IRuntimeDiffEvent | IRuntimeErrorEvent) {
  chrome.runtime.sendMessage(e).catch(runtimeResponse);
}

function constructComparisonPayload(
  previous: IDiffPayload,
  current: IDiffPayload,
) {
  if (!previous) {
    previous = {
      left: TAG_EMPTY,
      right: TAG_EMPTY,
      timestamp: Date.now(),
    };
  }

  const rv = previous;

  if (Reflect.has(current, 'push')) {
    rv.left = rv.right;
    rv.right = current.push;
  } else {
    if (Reflect.has(current, 'left')) {
      rv.left = current.left;
    }
    if (Reflect.has(current, 'right')) {
      rv.right = current.right;
    }
  }

  rv.timestamp = current.timestamp;

  return rv;
}
