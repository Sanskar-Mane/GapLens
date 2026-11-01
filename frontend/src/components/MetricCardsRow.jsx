import React from 'react';
import { Layers, AlertTriangle, GitCompare, ShieldCheck } from 'lucide-react';

export default function MetricCardsRow({
  sourcesCount = 0,
  analysis = null,
}) {
  const darkSpotsCount = analysis?.informationGaps
    ? String(analysis.informationGaps.length).padStart(2, '0')
    : '00';

  const contradictionsCount = analysis?.contradictions
    ? String(analysis.contradictions.length).padStart(2, '0')
    : '00';

  const readinessDisplay = analysis?.readinessScore !== undefined
    ? `${analysis.readinessScore}/100`
    : '--/100';

  const readinessSubtitle = analysis?.readinessLabel
    ? analysis.readinessLabel.slice(0, 32)
    : 'Run analysis to calculate readiness';

  const metrics = [
    {
      title: 'Collected Sources',
      value: String(sourcesCount).padStart(2, '0'),
      subtitle: 'Cross-verification ready',
      icon: Layers,
    },
    {
      title: 'Potential Dark Spots',
      value: darkSpotsCount,
      subtitle: 'Unanswered policy questions',
      icon: AlertTriangle,
    },
    {
      title: 'Source Contradictions',
      value: contradictionsCount,
      subtitle: 'Conflicting claims flagged',
      icon: GitCompare,
    },
    {
      title: 'Decision Readiness',
      value: readinessDisplay,
      subtitle: readinessSubtitle,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-soft transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            {/* Top row: Title on left, minimal outlined icon on right */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {m.title}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200/60 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400">
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Middle row: Large bold number */}
            <div className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {m.value}
            </div>

            {/* Bottom row: Subtle helper subtitle */}
            <div className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
              {m.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}

