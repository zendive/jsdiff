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

  type TMessages =
    | 'jsdiff-proxy-to-panel-compare'
    | 'jsdiff-proxy-to-panel-inprogress'
    | 'jsdiff-devtools-to-panel-search';

  interface ICompareMessage {
    source: TMessages;
    payload: ICompareMessagePayload;
  }

  interface IProgressMessage {
    source: TMessages;
    on: boolean;
  }

  interface ISearchMessage {
    source: TMessages;
    params: ISearchOptions;
  }

  type TSearchCommands = 'performSearch' | 'nextSearchResult' | 'cancelSearch';

  interface ISearchOptions {
    cmd: TSearchCommands;
    query: string | null;
  }

  interface IRuntimeMessageOptions
    extends ICompareMessage,
      IProgressMessage,
      ISearchMessage {}
}
