// mock DOM in deno environment
Object.assign(globalThis, {
  Element: class Element {
    [Symbol.toStringTag] = 'Element';
    nodeName = 'stub-element';
  },
  Document: class Document {
    [Symbol.toStringTag] = 'Document';
    nodeName = 'stub-document';
  },
  window: globalThis,
});
