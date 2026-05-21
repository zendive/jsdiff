export const CUSTOM_DOC_EVENT = 'X-jsdiff-cs-event';

export interface IDiffPayload {
  push?: unknown;
  left?: unknown;
  right?: unknown;
  timestamp: number;
  [key: string]: unknown;
}

export enum ECS_TYPE {
  PROGRESS,
  DIFF,
}
interface IContentScriptProgressEvent {
  type: ECS_TYPE.PROGRESS;
  on: boolean;
}
interface IContentScriptDiffEvent {
  type: ECS_TYPE.DIFF;
  payload: IDiffPayload;
}

export enum ERT_TYPE {
  PROGRESS,
  SAVE,
  DIFF,
  ERROR,
}
export interface IRuntumeProgressEvent {
  type: ERT_TYPE.PROGRESS;
  on: boolean;
}
export interface IRuntimeSaveEvent {
  type: ERT_TYPE.SAVE;
  payload: IDiffPayload;
}
export interface IRuntimeDiffEvent {
  type: ERT_TYPE.DIFF;
  payload: IDiffPayload;
}
export interface IRuntimeErrorEvent {
  type: ERT_TYPE.ERROR;
}

export type TContentScriptEvents =
  | IContentScriptProgressEvent
  | IContentScriptDiffEvent;
export type TRuntimeEvents =
  | IRuntumeProgressEvent
  | IRuntimeSaveEvent
  | IRuntimeDiffEvent
  | IRuntimeErrorEvent;
