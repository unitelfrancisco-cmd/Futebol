import React from 'react';
import { ManagerClub, PlayerCoin } from '../types/manager';
import { TrophyRoomWidget } from './TrophyRoomWidget';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Trophy, TrendingUp, Award, BarChart2, ShieldCheck, Activity, DollarSign, Coins, PieChart } from 'lucide-react';

interface SeasonHistoryTabProps {
  club: ManagerClub;
  squad: PlayerCoin[];
}

export const SeasonHistoryTab: React.FC<SeasonHistoryTabProps> = ({ club, squad }) => {
  // Generate matchday progression data based on club current stats
  const played = Math.max(1, club.played);
  const currentPoints = club.points;
  const currentGF = club.goalsFor;
  const currentGA = club.goalsAgainst;

  // Build progression array for each matchday played so far
  const progressionData = Array.from({ length: Math.max(5, club.matchday) }, (_, i) => {
    const md = i + 1;
    const ratio = md / Math.max(1, club.matchday);
    // Simulate gradual growth up to current stats
    const pts = Math.round(currentPoints * ratio);
    const gf = Math.round(currentGF * ratio);
    const ga = Math.round(currentGA * ratio);
    const historicalBenchmark = Math.round(pts * 0.85 + (i % 2 === 0 ? 1 : 0)); // historical average benchmark

    return {
      matchday: `Rodada ${md}`,
      pontos: pts,
      mediaHistorica: historicalBenchmark,
      golsPro: gf,
      golsSofridos: ga,
    };
  });

  // Budget evolution data based on club budget & matchdays
  const budgetData = Array.from({ length: Math.max(5, club.matchday) }, (_, i) => {
    const md = i + 1;
    const simulatedBudget = Math.max(
      150,
      Math.round(club.budget - Math.max(0, (club.matchday - md)) * 90 + Math.sin(i * 1.5) * 80)
    );
    return {
      matchday: `Rodada ${md}`,
      orcamento: simulatedBudget,
    };
  });

  // Total squad market value evolution data
  const currentSquadMarketValue = squad.reduce((sum, p) => sum + (p.marketValue || 0), 0);
  const squadValueData = Array.from({ length: Math.max(5, club.matchday) }, (_, i) => {
    const md = i + 1;
    const ratio = md / Math.max(1, club.matchday);
    const simulatedVal = Math.max(
      300,
      Math.round(currentSquadMarketValue * (0.8 + ratio * 0.2) + Math.sin(i * 1.8) * 40)
    );
    return {
      matchday: `Rodada ${md}`,
      valorElenco: simulatedVal,
    };
  });

  // Injury frequency data by month highlighting overload peaks
  const injuryFrequencyData = Array.from({ length: Math.min(6, Math.max(3, club.season * 2)) }, (_, i) => {
    const period = `Mês ${i + 1}`;
    const activeInjuries = squad.filter((p) => p.injuryMatchdaysRemaining && p.injuryMatchdaysRemaining > 0).length;
    const peakFactor = i === 1 || i === 3 ? 2 : 0;
    const count = Math.min(5, Math.max(0, (i === club.season - 1 ? activeInjuries : 0) + peakFactor + (i % 2)));
    return {
      period,
      lesoes: count,
    };
  });

  // Financial report monthly breakdown data (salaries, scouts, maintenance vs ticket sales, prizes)
  const financialReportData = Array.from({ length: Math.min(6, Math.max(3, club.season * 2)) }, (_, i) => {
    const period = `Mês ${i + 1}`;
    const baseSalaries = 120 + i * 15;
    const scouts = 60 + (i % 2) * 40;
    const maintenance = 45;
    const ticketRevenue = 200 + i * 35;
    const prizeMoney = i === club.season - 1 ? 150 : 80;

    return {
      period,
      Salarios: baseSalaries,
      Scouts: scouts,
      Manutencao: maintenance,
      Bilheteria: ticketRevenue,
      Premios: prizeMoney,
    };
  });

  return (
    <div className="space-y-6">
      {/* Trophy Room & Achievements Widget */}
      <TrophyRoomWidget club={club} squad={squad} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-purple-950/40 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-lg">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Histórico da Temporada & Relatório Financeiro
            </h2>
            <p className="text-xs text-neutral-400">
              Temporada {club.season} · Divisão: {club.divisionName} · Análise completa com Recharts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-neutral-950/80 px-4 py-2.5 rounded-xl border border-neutral-800">
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 block uppercase font-mono">Aproveitamento</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              {club.played > 0 ? Math.round((club.points / (club.played * 3)) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Evolution Chart */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Evolução de Pontos (Atual vs Média Histórica)
            </h3>
            <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
              Linha do Tempo
            </span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="matchday" stroke="#737373" fontSize={11} />
                <YAxis stroke="#737373" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#FAFAFA' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="pontos"
                  name="Seus Pontos"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPts)"
                />
                <Line
                  type="monotone"
                  dataKey="mediaHistorica"
                  name="Média Temporada Passada"
                  stroke="#A855F7"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goals Scored vs Conceded Chart */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Balanço de Gols (Pró x Sofridos)
            </h3>
            <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
              Acumulado
            </span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="matchday" stroke="#737373" fontSize={11} />
                <YAxis stroke="#737373" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#FAFAFA' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="golsPro"
                  name="Gols Pró"
                  stroke="#10B981"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="golsSofridos"
                  name="Gols Sofridos"
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budget Evolution Full-Width Chart */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            Evolução do Orçamento do Clube ao Longo da Temporada (R$)
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            Atual: R$ {club.budget}
          </span>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={budgetData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="matchday" stroke="#737373" fontSize={11} />
              <YAxis stroke="#737373" fontSize={11} unit=" R$" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#FAFAFA' }}
                formatter={(val: any) => [`R$ ${val}`, 'Orçamento']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="orcamento"
                name="Orçamento (R$)"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorBudget)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Squad Market Value Evolution Chart */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            Valor de Mercado Total do Elenco (Soma dos Passes)
          </h3>
          <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
            Atual: R$ {currentSquadMarketValue}
          </span>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={squadValueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSquadVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="matchday" stroke="#737373" fontSize={11} />
              <YAxis stroke="#737373" fontSize={11} unit=" R$" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#FAFAFA' }}
                formatter={(val: any) => [`R$ ${val}`, 'Valor do Elenco']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="valorElenco"
                name="Valor do Elenco (R$)"
                stroke="#A855F7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorSquadVal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Injury Frequency & Squad Overload Chart */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            Frequência de Lesões & Picos de Sobrecarga do Elenco
          </h3>
          <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
            Departamento Médico
          </span>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={injuryFrequencyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInjury" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="period" stroke="#737373" fontSize={11} />
              <YAxis stroke="#737373" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#FAFAFA' }}
                formatter={(val: any) => [`${val} jogadores`, 'Lesões Registradas']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="lesoes"
                name="Lesões por Mês"
                stroke="#F43F5E"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorInjury)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Report Bar Chart */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Relatório Financeiro: Despesas (Salários, Scouts) vs Receitas (Bilheteria, Prêmios)
          </h3>
          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
            Balanço Mensal
          </span>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialReportData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="period" stroke="#737373" fontSize={11} />
              <YAxis stroke="#737373" fontSize={11} unit=" R$" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#FAFAFA' }}
                formatter={(val: any) => [`R$ ${val}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="Salarios" name="Salários" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Scouts" name="Scouts" fill="#F97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Manutencao" name="Manutenção" fill="#64748B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Bilheteria" name="Bilheteria" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Premios" name="Prêmios" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
