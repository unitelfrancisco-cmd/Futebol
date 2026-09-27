import React, { useState } from 'react';
import { PlayerCoin, ManagerClub } from '../types/manager';
import {
  Zap,
  Target,
  Flame,
  Shield,
  Dumbbell,
  Sparkles,
  Check,
  Coins,
  HeartPulse,
  TrendingUp,
  Star,
  Award,
} from 'lucide-react';
import { sounds } from '../services/soundEngine';

interface TrainingCenterProps {
  club: ManagerClub;
  squad: PlayerCoin[];
  onUpgradePlayer: (
    playerId: string,
    stat: 'shotPower' | 'accuracy' | 'weight' | 'control',
    cost: number
  ) => void;
  onRecoverEnergy: (playerId: string | 'ALL', cost: number) => void;
}

export const TrainingCenter: React.FC<TrainingCenterProps> = ({
  club,
  squad,
  onUpgradePlayer,
  onRecoverEnergy,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(squad[0]?.id || '');
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedPlayer = squad.find((p) => p.id === selectedPlayerId) || squad[0];

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => {
      setFeedback((cur) => (cur === msg ? null : cur));
    }, 3000);
  };

  const handleTrainStat = (stat: 'shotPower' | 'accuracy' | 'weight' | 'control', cost: number) => {
    if (!selectedPlayer) return;
    if (club.budget < cost) {
      sounds.playFoulBuzzer();
      showFeedback(`Saldo insuficiente! Você precisa de R$ ${cost}.`);
      return;
    }
    if (selectedPlayer.attributes[stat] >= 99) {
      showFeedback('Este atributo já atingiu o nível máximo (99)!');
      return;
    }

    sounds.playCoinClink(0.9);
    onUpgradePlayer(selectedPlayer.id, stat, cost);
    showFeedback(`Treino concluído com sucesso! +2 em ${stat.toUpperCase()} para ${selectedPlayer.name}.`);
  };

  const handleRecoverSingle = (cost: number) => {
    if (!selectedPlayer) return;
    if (club.budget < cost) {
      sounds.playFoulBuzzer();
      showFeedback(`Saldo insuficiente! Você precisa de R$ ${cost}.`);
      return;
    }
    sounds.playCoinClink(0.8);
    onRecoverEnergy(selectedPlayer.id, cost);
    showFeedback(`Energia de ${selectedPlayer.name} restaurada para 100%! ⚡`);
  };

  const handleRecoverTeam = (cost: number) => {
    if (club.budget < cost) {
      sounds.playFoulBuzzer();
      showFeedback(`Saldo insuficiente! Você precisa de R$ ${cost}.`);
      return;
    }
    sounds.playCoinClink(1);
    onRecoverEnergy('ALL', cost);
    showFeedback('Fisioterapia concluída! Energia de todo o elenco restaurada para 100%! ⚡');
  };

  const getEnergy = (p: PlayerCoin) => p.energy ?? 100;
  const getStars = (p: PlayerCoin) => {
    if (p.stars) return p.stars;
    if (p.overall >= 88) return 5;
    if (p.overall >= 80) return 4;
    if (p.overall >= 74) return 3;
    return 2;
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Dumbbell className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Centro de Treinamento & Fisioterapia
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                World Soccer Champs Style
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Desenvolva as habilidades dos seus atletas de moeda e recupere o condicionamento físico para as partidas da Liga!
            </p>
          </div>
        </div>

        {/* Global Team Physio Action */}
        <button
          onClick={() => handleRecoverTeam(60)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
        >
          <HeartPulse className="w-4 h-4 text-emerald-400" />
          <span>Fisioterapia Geral (Todo o Elenco) · R$ 60</span>
        </button>
      </div>

      {feedback && (
        <div className="bg-amber-500/15 border border-amber-500/40 px-4 py-2 rounded-xl text-amber-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Grid: Player List on Left, Training Cockpit on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Squad Roster with Stamina Bars */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Escolha o Atleta ({squad.length})
            </h3>
            <span className="text-[11px] text-neutral-500">Energia & Estrelas</span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {squad.map((player) => {
              const isSelected = player.id === selectedPlayer?.id;
              const energy = getEnergy(player);
              const stars = getStars(player);

              return (
                <button
                  key={player.id}
                  onClick={() => {
                    sounds.playCoinClink(0.4);
                    setSelectedPlayerId(player.id);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/80 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-neutral-950/70 border-neutral-800/80 hover:bg-neutral-900 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-sm shrink-0"
                      style={{
                        backgroundColor: player.colors.outer,
                        borderColor: player.colors.border,
                        color: player.colors.highlight,
                      }}
                    >
                      {player.number}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white truncate">{player.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                          {player.position}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-2.5 h-2.5 ${
                              i < stars ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-amber-400 font-mono">
                      {player.overall} OVR
                    </span>
                    {/* Energy Mini Bar */}
                    <div className="flex items-center gap-1 mt-1">
                      <Zap className={`w-3 h-3 ${energy > 60 ? 'text-emerald-400' : 'text-amber-400'}`} />
                      <div className="w-12 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            energy > 70 ? 'bg-emerald-400' : energy > 35 ? 'bg-amber-400' : 'bg-rose-500'
                          }`}
                          style={{ width: `${energy}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">{energy}%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Player Training Workspace */}
        {selectedPlayer && (
          <div className="lg:col-span-2 space-y-5">
            {/* Player Card Showcase */}
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-black text-2xl shadow-xl shrink-0"
                  style={{
                    backgroundColor: selectedPlayer.colors.outer,
                    borderColor: selectedPlayer.colors.border,
                    color: selectedPlayer.colors.highlight,
                  }}
                >
                  #{selectedPlayer.number}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white">{selectedPlayer.name}</h4>
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                      {selectedPlayer.overall} OVR
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {selectedPlayer.position} · {selectedPlayer.age} anos · Valor: R$ {selectedPlayer.marketValue} · Salário: R$ {selectedPlayer.salary}/jogo
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-semibold text-neutral-300">
                        Energia: <strong className="text-white">{getEnergy(selectedPlayer)}%</strong>
                      </span>
                    </div>
                    {getEnergy(selectedPlayer) < 100 && (
                      <button
                        onClick={() => handleRecoverSingle(20)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <HeartPulse className="w-3 h-3" />
                        <span>Restaurar 100% (R$ 20)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Cofre Tag */}
              <div className="bg-neutral-900 border border-neutral-800 px-4 py-2.5 rounded-xl text-center shrink-0">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Saldo do Clube</span>
                <span className="text-sm font-extrabold text-amber-400 font-mono flex items-center gap-1 justify-center">
                  <Coins className="w-3.5 h-3.5" />
                  R$ {club.budget}
                </span>
              </div>
            </div>

            {/* Drills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Shot Power */}
              <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Chute & Potência</h5>
                      <span className="text-[10px] text-neutral-400 block">Aumenta velocidade de disparo</span>
                    </div>
                  </div>
                  <span className="text-sm font-black font-mono text-rose-400">
                    {selectedPlayer.attributes.shotPower}
                  </span>
                </div>

                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${selectedPlayer.attributes.shotPower}%` }}
                  />
                </div>

                <button
                  onClick={() => handleTrainStat('shotPower', 45)}
                  className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                  <span>Treinar Chute (+2) · R$ 45</span>
                </button>
              </div>

              {/* 2. Accuracy */}
              <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Pontaria & Mira</h5>
                      <span className="text-[10px] text-neutral-400 block">Linha-guia mais longa e estável</span>
                    </div>
                  </div>
                  <span className="text-sm font-black font-mono text-amber-400">
                    {selectedPlayer.attributes.accuracy}
                  </span>
                </div>

                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${selectedPlayer.attributes.accuracy}%` }}
                  />
                </div>

                <button
                  onClick={() => handleTrainStat('accuracy', 45)}
                  className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Treinar Pontaria (+2) · R$ 45</span>
                </button>
              </div>

              {/* 3. Weight / Mass */}
              <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Massa & Firmeza</h5>
                      <span className="text-[10px] text-neutral-400 block">Resistência a empurrões rivais</span>
                    </div>
                  </div>
                  <span className="text-sm font-black font-mono text-sky-400">
                    {selectedPlayer.attributes.weight}
                  </span>
                </div>

                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${selectedPlayer.attributes.weight}%` }}
                  />
                </div>

                <button
                  onClick={() => handleTrainStat('weight', 40)}
                  className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                  <span>Treinar Firmeza (+2) · R$ 40</span>
                </button>
              </div>

              {/* 4. Control */}
              <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Controle & Deslize</h5>
                      <span className="text-[10px] text-neutral-400 block">Menor atrito nas tabelas</span>
                    </div>
                  </div>
                  <span className="text-sm font-black font-mono text-emerald-400">
                    {selectedPlayer.attributes.control}
                  </span>
                </div>

                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${selectedPlayer.attributes.control}%` }}
                  />
                </div>

                <button
                  onClick={() => handleTrainStat('control', 40)}
                  className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Treinar Controle (+2) · R$ 40</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
