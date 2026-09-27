import React from 'react';
import { ManagerClub, FormationType } from '../types/manager';
import { Lightbulb, Zap, ShieldAlert, Award, ArrowRight } from 'lucide-react';

interface TrainingTipsWidgetProps {
  club: ManagerClub;
  onNavigateSquad: () => void;
}

export const TrainingTipsWidget: React.FC<TrainingTipsWidgetProps> = ({ club, onNavigateSquad }) => {
  const getFormationTip = (formation: FormationType) => {
    switch (formation) {
      case '1-2-1':
        return {
          title: 'Esquema Equilibrado (1-2-1)',
          tip: 'Excelente controle do meio-campo e transição rápida. Treine a precisão e o controle dos seus meiistas para dominar as jogadas de tabela.',
          color: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/30',
        };
      case '1-1-2':
        return {
          title: 'Esquema Ofensivo (1-1-2)',
          tip: 'Foco total no ataque! Certifique-se de que seus atacantes possuem alta potência de chute para surpreender o goleiro adversário.',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/30',
        };
      case '1-3-0':
        return {
          title: 'Sua formação 1-3-0 é uma muralha defensiva!',
          tip: 'Retranca sólida para segurar empates ou vantagens contra líderes da liga. Treine o peso e a resistência das moedas defensivas.',
          color: 'text-sky-400',
          bg: 'bg-sky-500/10 border-sky-500/30',
        };
      case '1-0-3':
        return {
          title: 'Ataque Total (1-0-3)',
          tip: 'Pressão sufocante no campo adversário! Fique atento aos contra-ataques rápidos; tente recuar o goleiro ligeiramente para evitar surpresas.',
          color: 'text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/30',
        };
      default:
        return {
          title: 'Tática Padrão',
          tip: 'Mantenha seus jogadores descansados e faça treinos regulares para subir o overall do elenco.',
          color: 'text-purple-400',
          bg: 'bg-purple-500/10 border-purple-500/30',
        };
    }
  };

  const advice = getFormationTip(club.formation);

  return (
    <div className={`border rounded-2xl p-5 shadow-xl space-y-3 ${advice.bg}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl bg-neutral-900 border flex items-center justify-center ${advice.color}`}>
            <Lightbulb className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-tight flex items-center gap-2">
              Dicas de Treinamento & Tática
            </h3>
            <p className="text-[10px] text-neutral-300">
              Análise baseada na formação atual: <span className="font-mono font-bold text-amber-300">{club.formation}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateSquad}
          className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer bg-neutral-900/80 px-3 py-1.5 rounded-xl border border-neutral-800"
        >
          <span>Ajustar Tática</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 space-y-1.5">
        <span className={`text-xs font-bold block ${advice.color}`}>{advice.title}</span>
        <p className="text-xs text-neutral-300 leading-relaxed">{advice.tip}</p>
      </div>
    </div>
  );
};
