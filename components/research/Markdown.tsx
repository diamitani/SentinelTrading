import React from 'react';
import { AnswerSource } from '../../services/answerEngine';

// A small, safe Markdown renderer for AI answers.
// It builds React elements directly (never injects raw HTML), and turns
// citation markers like [2] into hoverable source chips.

interface MarkdownProps {
  text: string;
  sources?: AnswerSource[];
  streaming?: boolean;
  compact?: boolean;
}

const CitationChip: React.FC<{ n: number; source?: AnswerSource }> = ({ n, source }) => {
  if (!source) {
    return <sup className="text-[10px] text-slate-400 font-mono">[{n}]</sup>;
  }
  return (
    <span className="relative inline-block group align-baseline">
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Source ${n}: ${source.title}`}
        className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 mx-0.5 -translate-y-px rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold font-mono hover:bg-blue-600 hover:text-white transition-colors no-underline"
      >
        {n}
      </a>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 bottom-full mb-2 w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 transition-all z-50"
      >
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <img
            src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(source.domain)}&sz=32`}
            alt=""
            className="w-3.5 h-3.5 rounded-sm"
          />
          {source.domain}
        </span>
        <span className="mt-1 block text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
          {source.title}
        </span>
        {source.snippet && (
          <span className="mt-1 block text-[11px] text-slate-500 leading-snug line-clamp-3">
            {source.snippet}
          </span>
        )}
      </span>
    </span>
  );
};

function renderInline(text: string, sources: AnswerSource[], keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // **bold**, *italic*, `code`, [n] citations, [label](https://link)
  const pattern =
    /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[\d+\](?!\()|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyBase}-${i++}`;
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={key} className="font-semibold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`')) {
      nodes.push(
        <code key={key} className="px-1 py-0.5 rounded bg-slate-100 text-[0.85em] font-mono text-slate-800">
          {token.slice(1, -1)}
        </code>
      );
    } else if (/^\[\d+\]$/.test(token)) {
      const n = Number(token.slice(1, -1));
      nodes.push(<CitationChip key={key} n={n} source={sources.find((s) => s.id === n)} />);
    } else if (token.startsWith('[')) {
      const m = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      nodes.push(
        m ? (
          <a key={key} href={m[2]} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline decoration-blue-200 underline-offset-2 hover:decoration-blue-600">
            {m[1]}
          </a>
        ) : (
          token
        )
      );
    } else {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export const Markdown: React.FC<MarkdownProps> = ({ text, sources = [], streaming, compact }) => {
  const lines = text.replace(/\r/g, '').split('\n');
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let para: string[] = [];

  const bodySize = compact ? 'text-[13px] leading-6' : 'text-[15px] leading-7';

  const flushPara = () => {
    if (!para.length) return;
    const k = `p-${blocks.length}`;
    blocks.push(
      <p key={k} className={`${bodySize} text-slate-700`}>
        {renderInline(para.join(' '), sources, k)}
      </p>
    );
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const k = `l-${blocks.length}`;
    const Tag = list.ordered ? 'ol' : 'ul';
    blocks.push(
      <Tag
        key={k}
        className={`${bodySize} text-slate-700 space-y-1.5 pl-5 ${list.ordered ? 'list-decimal' : 'list-disc'} marker:text-slate-400`}
      >
        {list.items.map((item, idx) => (
          <li key={idx} className="pl-1">
            {renderInline(item, sources, `${k}-${idx}`)}
          </li>
        ))}
      </Tag>
    );
    list = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);

    if (!line.trim()) {
      flushPara();
      flushList();
    } else if (heading) {
      flushPara();
      flushList();
      const k = `h-${blocks.length}`;
      blocks.push(
        <h3
          key={k}
          className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-slate-900 tracking-tight pt-2`}
        >
          {renderInline(heading[2].replace(/\*\*/g, ''), sources, k)}
        </h3>
      );
    } else if (bullet || numbered) {
      flushPara();
      const ordered = Boolean(numbered && !bullet);
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push((bullet || numbered)![1]);
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();

  return (
    <div className={`space-y-3 ${streaming ? 'sentinel-caret' : ''}`}>
      {blocks}
    </div>
  );
};
