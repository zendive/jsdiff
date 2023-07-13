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
    source: string;
    payload: ICompareMessagePayload;
  }

  type TSearchCommands = 'performSearch' | 'nextSearchResult' | 'cancelSearch';

  interface ISearchOptions {
    cmd: TSearchCommands;
    query: string | null;
  }

  interface IRuntimeMessageOptions {
    source: string;
    payload?: ICompareState;
    params?: ISearchOptions;
  }
}
