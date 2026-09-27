import React from 'react';
import { GameMode, MatchStats, Difficulty } from '../types/game';
import { Volume2, VolumeX, RotateCcw, HelpCircle, Layers, Play, Pause, Video } from 'lucide-react';

interface GameHUDProps {
  gameMode: GameMode;
  difficulty?: Difficulty;
  currentTurn: 'PLAYER' | 'OPPONENT';
  matchTimeSeconds: number;
  stats: MatchStats;
  soundEnabled: boolean;
  isPaused: boolean;
  message: string;
  messageType?: 'INFO' | 'SUCCESS' | 'WARNING' | 'GOAL';
  combo3Coins: number;
  canShootGoal3Coins: boolean;
  hasReplay?: boolean;
  onSelectMode: (mode: GameMode) => void;
  onToggleSound: () => void;
  onResetMatch: () => void;
  onTogglePause: () => void;
  onOpenRules: () => void;
  onOpenModeModal: () => void;
  onTriggerReplay?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  gameMode,
  difficulty = 'MEDIUM',
  currentTurn,
  matchTimeSeconds,
  stats,
  soundEnabled,
  isPaused,
  message,
  messageType = 'INFO',
  combo3Coins,
  canShootGoal3Coins,
  hasReplay = false,
  onSelectMode,
  onToggleSound,
  onResetMatch,
  onTogglePause,
  onOpenRules,
  onOpenModeModal,
  onTriggerReplay,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      {/* 1. TOP BAR (Strict 3-zone Top Bar Contract) */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onOpenModeModal();
          }}
          className="text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors whitespace-nowrap"
        >
          Futebol de Moedas
        </a>

        {/* Zone 2: clean navigation links for game modes */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-neutral-400">
          <button
            onClick={() => onSelectMode('MANAGER_CAREER')}
            className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              gameMode === 'MANAGER_CAREER' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            <span>💼 Carreira Manager</span>
            {gameMode !== 'MANAGER_CAREER' && (
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">NOVO</span>
            )}
          </button>
          <button
            onClick={() => onSelectMode('THREE_COINS')}
            className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap ${
              gameMode === 'THREE_COINS' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            3 Moedas Clássico
          </button>
          <button
            onClick={() => onSelectMode('MATCH_1V1_CPU')}
            className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap ${
              gameMode === 'MATCH_1V1_CPU' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            1v1 vs CPU
          </button>
          <button
            onClick={() => onSelectMode('MATCH_1V1_LOCAL')}
            className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap ${
              gameMode === 'MATCH_1V1_LOCAL' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            1v1 Local (2P)
          </button>
          <button
            onClick={() => onSelectMode('PEGS_CHALLENGE')}
            className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap ${
              gameMode === 'PEGS_CHALLENGE' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Mesa de Pregos
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar Áudio (M)' : 'Ativar Áudio (M)'}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Som"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>

          <button
            onClick={onTogglePause}
            title={isPaused ? 'Continuar (P)' : 'Pausar (P)'}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Pausar"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={onResetMatch}
            title="Reiniciar Mesa (R)"
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {hasReplay && onTriggerReplay && (
            <button
              onClick={onTriggerReplay}
              title="Rever último gol em câmera lenta"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-lg transition-colors cursor-pointer whitespace-nowrap animate-pulse"
            >
              <Video className="w-3.5 h-3.5 text-rose-400" />
              <span>Replay</span>
            </button>
          )}

          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Regras</span>
          </button>
        </div>
      </header>

      {/* 2. MATCH SCOREBOARD & TURN BANNER */}
      <div className="max-w-[1100px] mx-auto px-4 py-2.5 flex items-center justify-between text-xs">
        {/* Mode & Turn Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenModeModal}
            className="flex items-center gap-1.5 text-neutral-300 hover:text-white font-medium bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {gameMode === 'MANAGER_CAREER' && 'Carreira Manager FC'}
              {gameMode === 'THREE_COINS' && '3 Moedas da Escola'}
              {gameMode === 'MATCH_1V1_CPU' && `1v1 vs CPU (${difficulty === 'EASY' ? 'Fácil' : difficulty === 'HARD' ? 'Difícil' : 'Médio'})`}
              {gameMode === 'MATCH_1V1_LOCAL' && '1v1 Local 2 Jogadores'}
              {gameMode === 'PEGS_CHALLENGE' && 'Mesa de Pregos'}
            </span>
          </button>

          {/* Turn text metadata (unboxed per anti-slop rules) */}
          <div className="flex items-center gap-1.5 text-neutral-400 font-medium">
            <span>Vez:</span>
            {currentTurn === 'PLAYER' ? (
              <span className="text-amber-400 font-semibold">
                {gameMode === 'MATCH_1V1_LOCAL' ? 'Jogador 1 (Ouro)' : 'Você (Canarinho)'}
              </span>
            ) : (
              <span className="text-sky-400 font-semibold">
                {gameMode === 'MATCH_1V1_CPU' ? 'Computador (Prata)' : 'Jogador 2 (Prata)'}
              </span>
            )}
          </div>
        </div>

        {/* Center Placar */}
        <div className="flex items-center gap-4 bg-neutral-900/90 border border-neutral-800 px-4 py-1.5 rounded-xl shadow-inner">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span className="font-semibold text-neutral-300">P1</span>
            <span className="text-lg font-bold text-white font-mono tabular-nums">{stats.goalsP1}</span>
          </div>

          <span className="text-neutral-600 font-bold">×</span>

          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white font-mono tabular-nums">{stats.goalsP2}</span>
            <span className="font-semibold text-neutral-300">
              {gameMode === 'MATCH_1V1_CPU' ? 'CPU' : 'P2'}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
          </div>

          <span className="text-neutral-700">|</span>

          {/* Match Clock */}
          <span className="text-neutral-400 font-mono tabular-nums">{formatTime(matchTimeSeconds)}</span>
        </div>

        {/* Right Status Indicator / 3-Coins Guidance */}
        <div className="flex items-center gap-2 text-right">
          {gameMode === 'THREE_COINS' && (
            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <span>Combo:</span>
              <span className="font-mono font-bold text-amber-400 tabular-nums">{combo3Coins}x</span>
              <span className="text-neutral-700">·</span>
              {canShootGoal3Coins ? (
                <span className="text-emerald-400 font-semibold animate-pulse">Chute a Gol Liberado!</span>
              ) : (
                <span className="text-neutral-500">Passe entre as 2 moedas</span>
              )}
            </div>
          )}

          {gameMode !== 'THREE_COINS' && (
            <div className="text-xs text-neutral-400">
              <span
                className={
                  messageType === 'GOAL'
                    ? 'text-amber-400 font-bold animate-bounce'
                    : messageType === 'SUCCESS'
                    ? 'text-emerald-400 font-medium'
                    : messageType === 'WARNING'
                    ? 'text-rose-400 font-medium'
                    : 'text-neutral-400'
                }
              >
                {message}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
