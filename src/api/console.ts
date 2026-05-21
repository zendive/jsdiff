import {
  CUSTOM_DOC_EVENT,
  ECS_TYPE,
  type IDiffPayload,
  type TContentScriptEvents,
} from './events.ts';
import { TAG_NULL, TAG_UNDEFINED } from './const.ts';
import { customClone } from './clone.ts';

export interface IConsoleApi {
  diff(left: unknown, right?: unknown): void;
  diffPush(next: unknown): void;
  diffLeft(left: unknown): void;
  diffRight(right: unknown): void;
}

export function post(payload: IDiffPayload) {
  try {
    postToProxy({ type: ECS_TYPE.PROGRESS, on: true });

    for (const key of ['push', 'left', 'right']) {
      if (Reflect.has(payload, key)) {
        const value = payload[key];

        if (value === undefined) {
          payload[key] = TAG_UNDEFINED;
        } else if (value === null) {
          payload[key] = TAG_NULL;
        } else {
          payload[key] = customClone(value);
        }
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
