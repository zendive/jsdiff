import { escapeHTML } from '../toolkit.ts';
import BaseFormatter from 'jsondiffpatch/formatters/base';
import type {
  DeltaType,
  NodeType,
  BaseFormatterContext,
} from 'jsondiffpatch/formatters/base';
import type {
  AddedDelta,
  ArrayDelta,
  DeletedDelta,
  ModifiedDelta,
  MovedDelta,
  ObjectDelta,
  TextDiffDelta,
} from 'jsondiffpatch';
export type { Delta } from 'jsondiffpatch';

export class HtmlFormatter extends BaseFormatter<BaseFormatterContext> {
  typeFormattterErrorFormatter(context: BaseFormatterContext, err: unknown) {
    context.out(
      `<pre class="jsondiffpatch-error">${escapeHTML(String(err))}</pre>`
    );
  }

  formatValue(context: BaseFormatterContext, value: unknown) {
    context.out(`<pre>${escapeHTML(JSON.stringify(value, null, 2))}</pre>`);
  }

  formatTextDiffString(context: BaseFormatterContext, value: string) {
    const lines = this.parseTextDiff(value);
    context.out('<ul class="jsondiffpatch-textdiff">');
    for (let i = 0, l = lines.length; i < l; i++) {
      const line = lines[i];
      context.out(
        '<li><div class="jsondiffpatch-textdiff-location">' +
          `<span class="jsondiffpatch-textdiff-line-number">${
            line.location.line
          }</span><span class="jsondiffpatch-textdiff-char">${
            line.location.chr
          }</span></div><div class="jsondiffpatch-textdiff-line">`
      );
      const pieces = line.pieces;
      for (let i = 0, I = pieces.length; i < I; i++) {
        const piece = pieces[i];
        context.out(
          `<span class="jsondiffpatch-textdiff-${piece.type}">${escapeHTML(
            decodeURI(piece.text)
          )}</span>`
        );
      }
      context.out('</div></li>');
    }
    context.out('</ul>');
  }

  rootBegin(
    context: BaseFormatterContext,
    type: DeltaType,
    nodeType: NodeType
  ) {
    const nodeClass = `jsondiffpatch-${type}${
      nodeType ? ` jsondiffpatch-child-node-type-${nodeType}` : ''
    }`;
    context.out(`<div class="jsondiffpatch-delta ${nodeClass}">`);
  }

  rootEnd(context: BaseFormatterContext) {
    context.out('</div>');
  }

  nodeBegin(
    context: BaseFormatterContext,
    key: string,
    leftKey: string | number,
    type: DeltaType,
    nodeType: NodeType
  ) {
    const nodeClass = `jsondiffpatch-${type}${
      nodeType ? ` jsondiffpatch-child-node-type-${nodeType}` : ''
    }`;
    context.out(
      `<li class="${nodeClass}"><div class="jsondiffpatch-property-name">${
        typeof leftKey === 'string' ? escapeHTML(leftKey) : leftKey
      }</div>`
    );
  }

  nodeEnd(context: BaseFormatterContext) {
    context.out('</li>');
  }

  format_unchanged(
    context: BaseFormatterContext,
    delta: undefined,
    left: unknown
  ) {
    if (typeof left === 'undefined') {
      return;
    }
    context.out('<div class="jsondiffpatch-value">');
    this.formatValue(context, left);
    context.out('</div>');
  }

  format_movedestination(
    context: BaseFormatterContext,
    delta: undefined,
    left: unknown
  ) {
    if (typeof left === 'undefined') {
      return;
    }
    context.out('<div class="jsondiffpatch-value">');
    this.formatValue(context, left);
    context.out('</div>');
  }

  format_node(
    context: BaseFormatterContext,
    delta: ObjectDelta | ArrayDelta,
    left: unknown
  ) {
    // recurse
    const nodeType = delta._t === 'a' ? 'array' : 'object';
    context.out(
      `<ul class="jsondiffpatch-node jsondiffpatch-node-type-${nodeType}">`
    );
    this.formatDeltaChildren(context, delta, left);
    context.out('</ul>');
  }

  format_added(context: BaseFormatterContext, delta: AddedDelta) {
    context.out('<div class="jsondiffpatch-value">');
    this.formatValue(context, delta[0]);
    context.out('</div>');
  }

  format_modified(context: BaseFormatterContext, delta: ModifiedDelta) {
    context.out('<div class="jsondiffpatch-value jsondiffpatch-left-value">');
    this.formatValue(context, delta[0]);
    context.out('</div>');
    context.out('<div class="jsondiffpatch-value jsondiffpatch-right-value">');
    this.formatValue(context, delta[1]);
    context.out('</div>');
  }

  format_deleted(context: BaseFormatterContext, delta: DeletedDelta) {
    context.out('<div class="jsondiffpatch-value">');
    this.formatValue(context, delta[0]);
    context.out('</div>');
  }

  format_moved(context: BaseFormatterContext, delta: MovedDelta) {
    context.out('<div class="jsondiffpatch-value">');
    this.formatValue(context, delta[0]);
    context.out('</div>');
  }

  format_textdiff(context: BaseFormatterContext, delta: TextDiffDelta) {
    context.out('<div class="jsondiffpatch-value">');
    this.formatTextDiffString(context, delta[0]);
    context.out('</div>');
  }
}
