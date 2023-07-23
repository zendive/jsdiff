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

  interface IProgressMessage {
    source: 'jsdiff-proxy-to-panel-inprogress';
    on: boolean;
  }

  interface ISearchMessage {
    source: 'jsdiff-devtools-to-panel-search';
    params: ISearchOptions;
  }

  type TSearchCommands = 'performSearch' | 'nextSearchResult' | 'cancelSearch';

  interface ISearchOptions {
    cmd: TSearchCommands;
    query: string | null;
  }

  type TRuntimeMessageOptions =
    | ICompareMessage
    | IProgressMessage
    | ISearchMessage;
}
