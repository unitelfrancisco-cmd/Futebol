import React from 'react';
import { ManagerClub, OpponentClub, GoalScorerRecord } from '../types/manager';
import { MatchStats } from '../types/game';
import {
  Clock,
  Play,
  HeartPulse,
  Shield,
  Zap,
  Flame,
  Award,
} from 'lucide-react';
import { sounds } from '../services/soundEngine';

interface HalftimeBreakModalProps {
  isOpen: boolean;
  club: ManagerClub;
  opponent: OpponentClub;
  stats: MatchStats;
  goalScorers: GoalScorerRecord[];
  onSetTactics: (style: 'OFFENSIVE' | 'BALANCED' | 'DEFENSIVE') => void;
  currentTactics: 'OFFENSIVE' | 'BALANCED' | 'DEFENSIVE';
  onResumeSecondHalf: () => void;
}

export const HalftimeBreakModal: React.FC<HalftimeBreakModalProps> = ({
  isOpen,
  club,
  opponent,
  stats,
  goalScorers,
  onSetTactics,
  currentTactics,
  onResumeSecondHalf,
}) => {
  if (!isOpen) return null;

  const playerGoals = goalScorers.filter((g) => g.isPlayerTeam && g.minute <= 45);
  const oppGoals = goalScorers.filter((g) => !g.isPlayerTeam && g.minute <= 45);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="bg-neutral-950/90 px-6 py-4 border-b border-neutral-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Intervalo · 45 Minutos</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Fim do 1º Tempo
          </h2>
        </div>

        {/* Score Summary */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-around py-4 px-2 rounded-2xl bg-neutral-950 border border-neutral-800/80">
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center font-bold text-sm border shadow-md"
                style={{ backgroundColor: club.primaryColor, color: '#000', borderColor: club.secondaryColor }}
              >
                {club.shortName}
              </div>
              <span className="text-xs font-bold text-white mt-1 block">{club.name}</span>
            </div>

            <div className="text-center px-4">
              <div className="text-3xl font-black font-mono text-white">
                {stats.goalsP1} <span className="text-neutral-600">×</span> {stats.goalsP2}
              </div>
              <span className="text-[10px] text-neutral-400 font-mono uppercase mt-1 block">
                Placar Parcial
              </span>
            </div>

            <div className="text-center">
              <div
                className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center font-bold text-sm border shadow-md"
                style={{ backgroundColor: opponent.primaryColor, color: '#fff', borderColor: '#64748B' }}
              >
                {opponent.shortName}
              </div>
              <span className="text-xs font-bold text-white mt-1 block">{opponent.name}</span>
            </div>
          </div>

          {/* Goalscorers strip */}
          {(playerGoals.length > 0 || oppGoals.length > 0) && (
            <div className="text-[11px] text-neutral-400 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800 space-y-1">
              {playerGoals.length > 0 && (
                <div>⚽ {club.name}: <strong className="text-amber-300">{playerGoals.map((g) => `${g.playerName} ${g.minute}'`).join(', ')}</strong></div>
              )}
              {oppGoals.length > 0 && (
                <div>⚽ {opponent.name}: <strong className="text-neutral-300">{oppGoals.map((g) => `${g.playerName} ${g.minute}'`).join(', ')}</strong></div>
              )}
            </div>
          )}

          {/* Tactical Adjustment Options (WSC Style) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Instrução Tática para o 2º Tempo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'OFFENSIVE' as const,
                  label: 'Ataque Total',
                  desc: 'Mais chutes no gol',
                  icon: <Flame className="w-4 h-4 text-rose-400" />,
                },
                {
                  id: 'BALANCED' as const,
                  label: 'Equilibrado',
                  desc: 'Manter a estratégia',
                  icon: <Zap className="w-4 h-4 text-amber-400" />,
                },
                {
                  id: 'DEFENSIVE' as const,
                  label: 'Retranca',
                  desc: 'Bloqueio fechado',
                  icon: <Shield className="w-4 h-4 text-sky-400" />,
                },
              ].map((tac) => (
                <button
                  key={tac.id}
                  onClick={() => {
                    sounds.playCoinClink(0.6);
                    onSetTactics(tac.id);
                  }}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    currentTactics === tac.id
                      ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400/50'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="mb-1">{tac.icon}</div>
                  <span className="text-xs font-bold block">{tac.label}</span>
                  <span className="text-[9px] text-neutral-500 block">{tac.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Resume Action */}
        <div className="p-6 pt-0">
          <button
            onClick={() => {
              sounds.playWhistle(true);
              onResumeSecondHalf();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
          >
            <Play className="w-4 h-4 fill-neutral-950" />
            <span>Voltar ao Campo · Iniciar 2º Tempo ▶</span>
          </button>
        </div>
      </div>
    </div>
  );
};
