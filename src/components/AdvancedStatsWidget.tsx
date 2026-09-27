import React from 'react';
import { ManagerClub } from '../types/manager';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart3, PieChart as PieIcon, Activity, Target } from 'lucide-react';

interface AdvancedStatsWidgetProps {
  club: ManagerClub;
}

export const AdvancedStatsWidget: React.FC<AdvancedStatsWidgetProps> = ({ club }) => {
  // Calculate aggregate stats based on club history or matches played
  const matchesPlayed = Math.max(1, club.played);
  const totalGoalsFor = club.goalsFor;
  const totalGoalsAgainst = club.goalsAgainst;

  // Estimated possession data based on wins/draws or formation
  const possessionUser = Math.min(75, Math.max(35, 50 + (club.points / matchesPlayed) * 5));
  const possessionOpponent = Number((100 - possessionUser).toFixed(1));

  const possessionData = [
    { name: club.name || 'Seu Clube', value: Number(possessionUser.toFixed(1)), color: club.primaryColor || '#FEF08A' },
    { name: 'Adversários (Média)', value: possessionOpponent, color: '#52525B' },
  ];

  const efficiencyData = [
    { name: 'Gols Pró', value: Math.max(1, totalGoalsFor), color: '#10B981' },
    { name: 'Gols Sofridos', value: Math.max(1, totalGoalsAgainst), color: '#EF4444' },
  ];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-tight">
              Estatísticas Avançadas & Scouts
            </h3>
            <p className="text-[10px] text-neutral-400">
              Análise tática e comparativa de desempenho com Recharts
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
          Rodada {club.matchday}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Possession Pie Chart */}
        <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80 flex flex-col items-center">
          <div className="flex items-center gap-1.5 self-start mb-2 text-xs font-semibold text-neutral-300">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Média de Posse de Bola (%)</span>
          </div>

          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={possessionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {possessionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#171717" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#FAFAFA' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goals Efficiency Pie Chart */}
        <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80 flex flex-col items-center">
          <div className="flex items-center gap-1.5 self-start mb-2 text-xs font-semibold text-neutral-300">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Eficiência de Gols (Pró x Sofridos)</span>
          </div>

          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={efficiencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {efficiencyData.map((entry, index) => (
                    <Cell key={`cell-eff-${index}`} fill={entry.color} stroke="#171717" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#FAFAFA' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
