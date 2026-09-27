import React from 'react';
import { ManagerClub, PlayerCoin } from '../types/manager';
import { Trophy, Award, Star, Lock, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';

interface TrophyRoomWidgetProps {
  club: ManagerClub;
  squad: PlayerCoin[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progressText: string;
}

export const TrophyRoomWidget: React.FC<TrophyRoomWidgetProps> = ({ club, squad }) => {
  const totalWins = club.won;
  const rarePlayersCount = squad.filter((p) => p.rarity !== 'COMMON').length;
  const totalGoals = club.goalsFor;
  const budget = club.budget;
  const isUndefeated = club.played >= 3 && club.lost === 0;

  const achievements: Achievement[] = [
    {
      id: 'first-win',
      title: 'Primeira Vitória na Mesa',
      description: 'Vença sua primeira partida oficial na liga de moedas.',
      icon: '🏆',
      isUnlocked: totalWins >= 1,
      progressText: `${Math.min(1, totalWins)}/1 vitória`,
    },
    {
      id: 'ten-wins',
      title: 'Mestre da Mesa (10 Vitórias)',
      description: 'Acumule 10 vitórias em sua trajetória como técnico.',
      icon: '⭐',
      isUnlocked: totalWins >= 10,
      progressText: `${Math.min(10, totalWins)}/10 vitórias`,
    },
    {
      id: 'rare-squad',
      title: 'Galeria de Craques Raros',
      description: 'Tenha pelo menos 5 jogadores Raros, Épicos ou Lendários no elenco.',
      icon: '💎',
      isUnlocked: rarePlayersCount >= 5,
      progressText: `${Math.min(5, rarePlayersCount)}/5 craques`,
    },
    {
      id: 'undefeated',
      title: 'Muralha Invicta',
      description: 'Conclua pelo menos 3 partidas na temporada sem nenhuma derrota.',
      icon: '🛡️',
      isUnlocked: isUndefeated,
      progressText: isUndefeated ? 'Conquistado!' : `${club.played - club.lost} jogos invictos`,
    },
    {
      id: 'goal-machine',
      title: 'Artilharia Pesada (20 Gols)',
      description: 'Marque 20 ou mais gols somando todas as rodadas.',
      icon: '⚽',
      isUnlocked: totalGoals >= 20,
      progressText: `${Math.min(20, totalGoals)}/20 gols`,
    },
    {
      id: 'millionaire',
      title: 'Cofre Milionário (R$ 1000)',
      description: 'Acumule um orçamento de R$ 1000 ou mais no cofre do clube.',
      icon: '🪙',
      isUnlocked: budget >= 1000,
      progressText: `R$ ${budget}/R$ 1000`,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-tight flex items-center gap-2">
              Galeria de Troféus & Medalhas Desbloqueáveis
            </h3>
            <p className="text-[10px] text-neutral-400">
              Conquistas da Carreira · {unlockedCount} de {achievements.length} desbloqueados
            </p>
          </div>
        </div>

        <div className="bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 text-right">
          <span className="text-[10px] uppercase font-mono text-neutral-400 block">Progresso</span>
          <span className="text-xs font-bold text-amber-400 font-mono">
            {Math.round((unlockedCount / achievements.length) * 100)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 relative overflow-hidden ${
              ach.isUnlocked
                ? 'bg-gradient-to-br from-amber-500/15 via-neutral-950 to-neutral-950 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30 animate-pulse'
                : 'bg-neutral-950/60 border-neutral-800/80 opacity-60'
            }`}
          >
            {ach.isUnlocked && (
              <div className="absolute -right-8 -top-8 w-20 h-20 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
            )}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${
                ach.isUnlocked
                  ? 'bg-gradient-to-br from-amber-400/30 to-amber-600/20 border-amber-400/60 text-amber-200 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-600'
              }`}
            >
              {ach.isUnlocked ? ach.icon : <Lock className="w-4 h-4 text-neutral-500" />}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className={`text-xs font-bold truncate ${ach.isUnlocked ? 'text-white' : 'text-neutral-400'}`}>
                  {ach.title}
                </span>
                {ach.isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </div>
              <p className="text-[10px] text-neutral-400 leading-snug line-clamp-2">{ach.description}</p>
              <div className="pt-1 flex items-center justify-between text-[10px] font-mono">
                <span className={ach.isUnlocked ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                  {ach.progressText}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
