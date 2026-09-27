import React from 'react';
import { MatchStats, GameMode } from '../types/game';
import { PlayerCoin } from '../types/manager';
import { RotateCcw, Trophy, Target, ShieldAlert, Award, Briefcase, Coins } from 'lucide-react';

interface MatchEndModalProps {
  isOpen: boolean;
  winner: 'PLAYER' | 'OPPONENT' | 'DRAW';
  gameMode: GameMode;
  stats: MatchStats;
  onPlayAgain: () => void;
  managerReward?: {
    income: number;
    payroll: number;
    net: number;
    newBudget: number;
    pointsGained: number;
    onReturnToHub: () => void;
  };
  manOfTheMatch?: PlayerCoin | null;
}

export const MatchEndModal: React.FC<MatchEndModalProps> = ({
  isOpen,
  winner,
  gameMode,
  stats,
  onPlayAgain,
  managerReward,
  manOfTheMatch,
}) => {
  if (!isOpen) return null;

  let title = 'Fim de Jogo!';
  let subtitle = 'Grande partida de futebol de moedas!';

  if (gameMode === 'MANAGER_CAREER') {
    title = winner === 'PLAYER' ? 'Vitória Importante na Liga!' : winner === 'OPPONENT' ? 'Derrota Difícil na Rodada' : 'Empate Suado!';
    subtitle = winner === 'PLAYER' ? 'Sua equipe garantiu 3 pontos vitais rumo ao título!' : 'A diretoria avaliou a atuação da equipe na mesa.';
  } else if (gameMode === 'THREE_COINS') {
    title = stats.goalsP1 > 0 ? 'Golaço Histórico!' : 'Fim do Desafio!';
    subtitle = `Você completou ${stats.passesCompleted} passes válidos com combo máximo de ${stats.highestCombo}x!`;
  } else if (winner === 'PLAYER') {
    title = 'Vitória Sensacional!';
    subtitle = 'Você dominou a mesa e conquistou o título da rodada!';
  } else if (winner === 'OPPONENT') {
    title = gameMode === 'MATCH_1V1_CPU' ? 'A CPU Venceu!' : 'Jogador 2 Venceu!';
    subtitle = 'Foi por pouco! Tente uma nova tática com rebotes na madeira.';
  } else {
    title = 'Empate Eletrizante!';
    subtitle = 'Ninguém deu espaço na mesa!';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl p-6 shadow-2xl text-center">
        {/* Trophy Emblem */}
        <div className="relative mx-auto w-24 h-24 mb-4 rounded-2xl overflow-hidden border border-amber-500/40 shadow-lg shadow-amber-500/10 bg-neutral-950">
          <img
            src="/src/assets/images/coin_soccer_trophy_1790474467605.jpg"
            alt="Troféu do Futebol de Moedas"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <h2 className="text-2xl font-extrabold text-white font-serif tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* Score Board */}
        <div className="my-6 p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-around">
          <div className="text-center">
            <span className="block text-xs text-neutral-400 font-medium">Jogador 1</span>
            <span className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
              {stats.goalsP1}
            </span>
          </div>
          <div className="text-neutral-600 font-mono text-xl font-bold">X</div>
          <div className="text-center">
            <span className="block text-xs text-neutral-400 font-medium">
              {gameMode === 'MATCH_1V1_CPU' ? 'CPU' : 'Jogador 2'}
            </span>
            <span className="text-3xl font-extrabold text-neutral-300 font-mono tabular-nums">
              {stats.goalsP2}
            </span>
          </div>
        </div>

        {/* Match Statistics */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-xs">
          <div className="p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800/80">
            <span className="text-neutral-500 block mb-0.5">Chutes a Gol</span>
            <span className="font-bold text-white font-mono tabular-nums">
              {stats.shotsP1 + stats.shotsP2}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800/80">
            <span className="text-neutral-500 block mb-0.5">Passes Válidos</span>
            <span className="font-bold text-emerald-400 font-mono tabular-nums">
              {stats.passesCompleted}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800/80">
            <span className="text-neutral-500 block mb-0.5">Faltas</span>
            <span className="font-bold text-rose-400 font-mono tabular-nums">
              {stats.foulsP1 + stats.foulsP2}
            </span>
          </div>
        </div>

        {/* Man of the Match Card */}
        {manOfTheMatch && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-neutral-950 to-purple-950/60 border border-amber-500/50 shadow-xl flex items-center gap-4 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-amber-500 text-neutral-950 text-[9px] font-extrabold uppercase tracking-wider rounded-bl-lg shadow">
              ⭐ Craque da Partida
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold border-2 shadow-lg shrink-0"
              style={{
                backgroundColor: manOfTheMatch.colors.inner,
                borderColor: manOfTheMatch.colors.outer,
                color: manOfTheMatch.colors.border,
              }}
            >
              #{manOfTheMatch.number}
            </div>
            <div className="space-y-1 min-w-0 flex-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  Jogador da Partida (MOTM)
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  OVR {manOfTheMatch.overall} <span className="text-emerald-400 font-bold">(+1 Próx. Jogo)</span>
                </span>
              </div>
              <h4 className="text-sm font-bold text-white truncate">
                {manOfTheMatch.name} <span className="text-xs font-normal text-neutral-400">({manOfTheMatch.position} · {manOfTheMatch.rarity})</span>
              </h4>
              <p className="text-[11px] text-neutral-300 leading-snug">
                Excelente atuação! Ganhou bônus temporário de +1 OVR para a próxima rodada.
              </p>
            </div>
          </div>
        )}

        {/* Manager Financial & Points Reward Breakdown */}
        {managerReward && (
          <div className="mb-6 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-left space-y-2">
            <span className="font-bold text-neutral-300 uppercase tracking-wider text-[10px] block border-b border-neutral-800 pb-1">
              Balanço Financeiro da Partida
            </span>
            <div className="flex justify-between text-neutral-400">
              <span>Bilheteria + Bônus de Resultado:</span>
              <span className="font-mono text-emerald-400 font-bold">+R$ {managerReward.income}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Pagamento de Folha Salarial:</span>
              <span className="font-mono text-rose-400 font-bold">-R$ {managerReward.payroll}</span>
            </div>
            <div className="flex justify-between text-white font-bold pt-1 border-t border-neutral-800/80">
              <span>Lucro Líquido no Cofre:</span>
              <span className="font-mono text-amber-400">
                {managerReward.net >= 0 ? `+R$ ${managerReward.net}` : `-R$ ${Math.abs(managerReward.net)}`}
              </span>
            </div>
            <div className="flex justify-between text-neutral-400 text-[11px] pt-1">
              <span>Pontos Somados na Liga:</span>
              <span className="font-mono text-white font-bold">+{managerReward.pointsGained} pts</span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {managerReward ? (
            <>
              <button
                onClick={managerReward.onReturnToHub}
                className="flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Briefcase className="w-4 h-4" />
                Ir ao Escritório do Clube
              </button>
              <button
                onClick={onPlayAgain}
                className="py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                Jogar Novamente
              </button>
            </>
          ) : (
            <button
              onClick={onPlayAgain}
              className="w-full py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              Jogar Novamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
