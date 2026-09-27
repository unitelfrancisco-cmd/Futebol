import React from 'react';
import { ManagerClub, OpponentClub, MatchHighlight, GoalScorerRecord } from '../types/manager';
import { MatchStats } from '../types/game';
import {
  Zap,
  Clock,
  Play,
  Pause,
  FastForward,
  Shield,
  Flame,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface WSCMatchHUDProps {
  club: ManagerClub;
  opponent: OpponentClub;
  matchMinute: number;
  stats: MatchStats;
  currentHighlight: MatchHighlight | null;
  activeCommentary: string;
  goalScorers: GoalScorerRecord[];
  isSimulatingBetween: boolean;
  onNextHighlight: () => void;
  onReturnToHub: () => void;
}

export const WSCMatchHUD: React.FC<WSCMatchHUDProps> = ({
  club,
  opponent,
  matchMinute,
  stats,
  currentHighlight,
  activeCommentary,
  goalScorers,
  isSimulatingBetween,
  onNextHighlight,
  onReturnToHub,
}) => {
  const period = matchMinute <= 45 ? '1º TEMPO' : '2º TEMPO';
  const playerGoals = goalScorers.filter((g) => g.isPlayerTeam);
  const oppGoals = goalScorers.filter((g) => !g.isPlayerTeam);

  return (
    <div className="w-full max-w-[1100px] mb-3 flex flex-col gap-2">
      {/* 1. RETRO-MODERN WSC SCOREBOARD */}
      <div className="bg-neutral-900/95 border border-neutral-800 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          {/* Home Team (Player) */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 justify-start min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-md border shrink-0"
              style={{
                backgroundColor: club.primaryColor,
                color: '#0A0A0A',
                borderColor: club.secondaryColor,
              }}
            >
              {club.shortName}
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-xs sm:text-sm text-white block truncate">
                {club.name}
              </span>
              {playerGoals.length > 0 && (
                <span className="text-[10px] text-amber-300 font-mono block truncate">
                  ⚽ {playerGoals.map((g) => `${g.playerName} ${g.minute}'`).join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* Central Score & Clock Block */}
          <div className="flex flex-col items-center px-3 py-1 rounded-xl bg-neutral-950/80 border border-neutral-800 shrink-0">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-amber-400 font-bold">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{matchMinute}&apos;</span>
              <span className="text-neutral-500 font-normal">· {period}</span>
            </div>

            <div className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white tabular-nums my-0.5">
              {stats.goalsP1} <span className="text-neutral-600">×</span> {stats.goalsP2}
            </div>

            <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">
              Rodada {club.matchday}
            </span>
          </div>

          {/* Away Team (Opponent) */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 justify-end min-w-0 text-right">
            <div className="min-w-0">
              <span className="font-extrabold text-xs sm:text-sm text-white block truncate">
                {opponent.name}
              </span>
              {oppGoals.length > 0 && (
                <span className="text-[10px] text-neutral-400 font-mono block truncate">
                  ⚽ {oppGoals.map((g) => `${g.playerName} ${g.minute}'`).join(', ')}
                </span>
              )}
            </div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-md border shrink-0"
              style={{
                backgroundColor: opponent.primaryColor,
                color: '#FFFFFF',
                borderColor: '#64748B',
              }}
            >
              {opponent.shortName}
            </div>
          </div>
        </div>

        {/* Live Commentary Strip */}
        <div className="bg-neutral-950/90 border border-neutral-800/80 px-3 py-1.5 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[11px] text-neutral-300 truncate">
              {activeCommentary || 'Partida em andamento na mesa...'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNextHighlight}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Acelerar até a próxima jogada de perigo"
            >
              <FastForward className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Próximo Lance</span>
            </button>
            <button
              onClick={onReturnToHub}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-semibold cursor-pointer transition-colors"
            >
              Hub
            </button>
          </div>
        </div>
      </div>

      {/* 2. WORLD SOCCER CHAMPS HIGHLIGHT ALERT BANNER */}
      {currentHighlight && (
        <div
          className={`border rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 animate-fade-in ${
            currentHighlight.isPlayerAttacking
              ? 'bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-neutral-900 border-amber-500/50'
              : 'bg-gradient-to-r from-rose-500/15 via-red-500/10 to-neutral-900 border-rose-500/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md ${
                currentHighlight.isPlayerAttacking
                  ? 'bg-amber-500 text-neutral-950'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {currentHighlight.isPlayerAttacking ? (
                <Zap className="w-5 h-5 fill-current" />
              ) : (
                <Shield className="w-5 h-5 fill-current" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  {currentHighlight.title}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-neutral-300">
                  {currentHighlight.minute}&apos;
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                {currentHighlight.description} <strong className="text-amber-300">{currentHighlight.hint}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onNextHighlight}
            className="px-3 py-1.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer border border-neutral-700"
          >
            <span>Pular Lance</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
