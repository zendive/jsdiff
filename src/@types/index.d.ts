export {};

declare global {
  interface ICompareState {
    timestamp: number;
    left?: unknown;
    right?: unknown;
  }

  interface ICompareMessagePayload {
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

  type TRuntimeMessageOptions =
    | ICompareMessage
    | IProgressMessage
    | IErrorMessage;

  interface Window {
    wrappedJSObject: { jsdiff: () => void };
  }

  // firefox extension context
  // currently not present in '@types/firefox-webext-browser'
  function cloneInto(...args: any[]): any;
}
