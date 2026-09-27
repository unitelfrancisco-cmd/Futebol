import React from 'react';
import { GameMode, TableTheme, Difficulty } from '../types/game';
import {
  X,
  Award,
  Users,
  Bot,
  CircleDot,
  Zap,
  Gauge,
  Target,
  Briefcase,
  GraduationCap,
  Edit3,
} from 'lucide-react';

interface ModeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: GameMode;
  currentTheme: TableTheme;
  difficulty: Difficulty;
  onSelectMode: (mode: GameMode) => void;
  onSelectTheme: (theme: TableTheme) => void;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onOpenCreateTeam?: () => void;
  onOpenTutorial?: () => void;
}

export const ModeSelectorModal: React.FC<ModeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  currentTheme,
  difficulty,
  onSelectMode,
  onSelectTheme,
  onSelectDifficulty,
  onOpenCreateTeam,
  onOpenTutorial,
}) => {
  if (!isOpen) return null;

  const modes: { id: GameMode; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      id: 'MANAGER_CAREER',
      title: 'Modo Carreira Manager 💼',
      subtitle: 'Comande seu próprio clube de moedas: contrate craques no mercado, envie olheiros para garimpar talentos, escale a tática e dispute o título da Liga!',
      icon: <Briefcase className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'THREE_COINS',
      title: 'Clássico das 3 Moedas',
      subtitle: 'A regra lendária da carteira da escola: passe a moeda estritamente entre as outras duas até fazer o gol.',
      icon: <CircleDot className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'MATCH_1V1_CPU',
      title: 'Partida 1v1 vs CPU',
      subtitle: 'Enfrente o computador com time completo de moedas e física real com rebotes nas tabelas.',
      icon: <Bot className="w-5 h-5 text-sky-400" />,
    },
    {
      id: 'MATCH_1V1_LOCAL',
      title: '1v1 Dois Jogadores (Local)',
      subtitle: 'Dispute cara a cara com um amigo no mesmo computador alternando os chutes.',
      icon: <Users className="w-5 h-5 text-violet-400" />,
    },
    {
      id: 'PEGS_CHALLENGE',
      title: 'Mesa de Pregos (Dedobol)',
      subtitle: 'O autêntico futebol de pregos e moedas: desvie dos pinos de metal e acerte chutes impossíveis.',
      icon: <Award className="w-5 h-5 text-rose-400" />,
    },
  ];

  const difficulties: {
    id: Difficulty;
    title: string;
    description: string;
    precision: string;
    power: string;
    color: string;
    activeBorder: string;
    badgeBg: string;
  }[] = [
    {
      id: 'EASY',
      title: 'Fácil',
      description: 'Chutes mais suaves e menor precisão angular da CPU.',
      precision: 'Baixa (~60%)',
      power: 'Suave (65%)',
      color: 'text-emerald-400',
      activeBorder: 'border-emerald-500/80 bg-emerald-500/10 ring-1 ring-emerald-500/50',
      badgeBg: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      id: 'MEDIUM',
      title: 'Médio',
      description: 'Equilíbrio ideal entre força de chute e pontaria no gol.',
      precision: 'Média (~85%)',
      power: 'Equilibrada (85%)',
      color: 'text-amber-400',
      activeBorder: 'border-amber-500/80 bg-amber-500/10 ring-1 ring-amber-500/50',
      badgeBg: 'bg-amber-500/20 text-amber-300',
    },
    {
      id: 'HARD',
      title: 'Difícil',
      description: 'Chutes potentes com precisão cirúrgica mirando nos cantos.',
      precision: 'Cirúrgica (~98%)',
      power: 'Máxima (100%)',
      color: 'text-rose-400',
      activeBorder: 'border-rose-500/80 bg-rose-500/10 ring-1 ring-rose-500/50',
      badgeBg: 'bg-rose-500/20 text-rose-300',
    },
  ];

  const themes: { id: TableTheme; label: string; desc: string }[] = [
    { id: 'SCHOOL_DESK', label: 'Carteira Escolar', desc: 'Fórmica verde nostálgica com linhas de giz' },
    { id: 'PRO_FELT', label: 'Feltro Estádio Pro', desc: 'Gramado clássico com faixas de corte' },
    { id: 'NOBLE_WOOD', label: 'Madeira Nobre', desc: 'Mogno maciço envernizado com linhas gravadas' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-700/80 rounded-2xl p-6 shadow-2xl text-neutral-200 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Modos de Jogo & Mesa</h2>
          <p className="text-xs text-neutral-400 mt-1">Escolha o estilo de futebol de moedas para disputar no PC</p>
        </div>

        {/* Game Modes */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
            Modo de Jogo
          </label>
          <div className="grid gap-2.5">
            {modes.map((m) => {
              const isSelected = currentMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectMode(m.id);
                  }}
                  className={`flex items-start gap-3.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/80 ring-1 ring-amber-500/50'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 shrink-0">
                    {m.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{m.title}</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                          Ativo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed line-clamp-2">
                      {m.subtitle}
                    </p>
                    {m.id === 'MANAGER_CAREER' && (
                      <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-neutral-800/80">
                        {onOpenCreateTeam && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectMode('MANAGER_CAREER');
                              onOpenCreateTeam();
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] font-semibold text-amber-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Criar Minha Equipa</span>
                          </span>
                        )}
                        {onOpenTutorial && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectMode('MANAGER_CAREER');
                              onOpenTutorial();
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <GraduationCap className="w-3 h-3" />
                            <span>Tutorial & Primeiros Craques</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Selector (Fácil, Médio, Difícil) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
              Dificuldade da CPU (IA)
            </label>
            <span className="text-[11px] text-neutral-400">
              Modifica precisão e força dos chutes da máquina
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {difficulties.map((d) => {
              const isSelected = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => onSelectDifficulty(d.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? d.activeBorder
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold ${isSelected ? d.color : 'text-neutral-200'}`}>
                        {d.title}
                      </span>
                      {isSelected && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${d.badgeBg}`}>
                          Selecionado
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-snug mb-2">
                      {d.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 space-y-1 text-[10px]">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-neutral-500" />
                        Precisão:
                      </span>
                      <span className="font-mono font-medium text-neutral-300">{d.precision}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-neutral-500" />
                        Força:
                      </span>
                      <span className="font-mono font-medium text-neutral-300">{d.power}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Themes */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
            Tema da Mesa
          </label>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => {
              const isSelected = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTheme(t.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/80 text-amber-300'
                      : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="block text-xs font-semibold">{t.label}</span>
                  <span className="block text-[10px] text-neutral-500 mt-0.5 truncate">{t.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Confirmar e Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
