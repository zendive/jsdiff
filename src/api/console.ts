import {
  CUSTOM_DOC_EVENT,
  ECS_TYPE,
  type IDiffPayload,
  type TContentScriptEvents,
} from './events.ts';
import { customClone } from './clone.ts';

export function post(payload: IDiffPayload) {
  try {
    postToProxy({ type: ECS_TYPE.PROGRESS, on: true });

    for (const key of ['push', 'left', 'right']) {
      if (Reflect.has(payload, key)) {
        payload[key] = customClone(payload[key]);
      }
    }

    postToProxy({ type: ECS_TYPE.DIFF, payload });
  } catch (error) {
    console.error('JSDiff', error);

    postToProxy({ type: ECS_TYPE.PROGRESS, on: false });
  }
}

function postToProxy(detail: TContentScriptEvents) {
  document.dispatchEvent(new CustomEvent(CUSTOM_DOC_EVENT, { detail }));
}
