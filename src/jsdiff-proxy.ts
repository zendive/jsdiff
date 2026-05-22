import {
  CUSTOM_DOC_EVENT,
  ECS_TYPE,
  ERT_TYPE,
  type IRuntimeProgressEvent,
  type IRuntimeSaveEvent,
  type TContentScriptEvents,
} from './api/events.ts';
import { runtimeResponse } from './api/toolkit.ts';

document.addEventListener(CUSTOM_DOC_EVENT, proxyListener);

function proxyListener(e: CustomEvent<TContentScriptEvents>) {
  if (
    e.detail && typeof e.detail === 'object' &&
    'type' in e.detail
  ) {
    if (ECS_TYPE.PROGRESS === e.detail.type) {
      postRuntime({ type: ERT_TYPE.PROGRESS, on: e.detail.on });
    } else if (ECS_TYPE.DIFF === e.detail.type) {
      postRuntime({ type: ERT_TYPE.SAVE, payload: e.detail.payload });
    }
  }
}

function postRuntime(e: IRuntimeProgressEvent | IRuntimeSaveEvent) {
  chrome.runtime.sendMessage(e).catch(runtimeResponse);
}
