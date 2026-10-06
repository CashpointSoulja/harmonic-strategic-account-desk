import type { ReactNode } from 'react';
import type { Score } from '../domain/logic';

export type Tone = 'ok' | 'warn' | 'risk' | 'info' | 'muted' | 'syn' | 'real';

export function Pill({ tone, children, title }: { tone: Tone; children: ReactNode; title?: string }) {
  return <span className={`pill pill-${tone}`} title={title}>{children}</span>;
}

export function ProvenanceChip({ synthetic }: { synthetic: boolean }) {
  return synthetic ? <Pill tone="syn">Synthetic</Pill> : <Pill tone="real">Public sources · prospect hypothesis</Pill>;
}

export function ScoreBar({ label, score, weight }: { label: string; score: Score; weight: number }) {
  const v = score.value;
  return (
    <div className="score" title={score.basis}>
      <span className="score-label">{label} <small>×{weight}</small></span>
      {v === null ? (
        <span className="score-unknown">Unknown</span>
      ) : (
        <span className="score-track" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} aria-label={`${label} ${v} of 100`}>
          <span className="score-fill" style={{ width: `${v}%` }} />
        </span>
      )}
      <span className="score-num">{v ?? '—'}</span>
    </div>
  );
}

export function Section({ title, kicker, actions, children, id }: { title: string; kicker?: ReactNode; actions?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section className="card" aria-labelledby={id}>
      <div className="card-head">
        <div>
          <h2 id={id}>{title}</h2>
          {kicker && <p className="kicker">{kicker}</p>}
        </div>
        {actions && <div className="card-actions">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
