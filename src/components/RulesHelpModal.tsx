import React from 'react';
import { X, Trophy, Target, MousePointer, Volume2, RotateCcw } from 'lucide-react';

interface RulesHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesHelpModal: React.FC<RulesHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl p-6 shadow-2xl text-neutral-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Como Jogar Futebol de Moedas</h2>
            <p className="text-xs text-neutral-400">Regras nostálgicas e comandos para PC</p>
          </div>
        </div>

        <div className="space-y-6 text-sm">
          {/* 3 Coins Rule */}
          <section className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
            <h3 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              1. A Regra Clássica das 3 Moedas (Futebol Escolar)
            </h3>
            <p className="text-neutral-300 leading-relaxed text-xs">
              No modo clássico da carteira escolar, você controla 3 moedas. Para avançar, você deve <strong>chutar uma moeda de modo que ela passe estritamente pelo meio das outras duas moedas</strong> (pelo portal formado entre elas).
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-neutral-400">
              <li>• <strong>Passe Válido:</strong> A moeda passa limpa entre as duas sem colidir com elas.</li>
              <li>• <strong>Falta:</strong> Se a moeda bater em outra ou não passar entre elas, o turno é perdido.</li>
              <li>• <strong>Chute a Gol:</strong> Ao cruzar o meio de campo ou entrar na área adversária, mire direto na trave e chute para marcar!</li>
            </ul>
          </section>

          {/* 1v1 Match Rule */}
          <section className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
            <h3 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              2. Partida 1v1 (vs CPU ou 2 Jogadores no PC)
            </h3>
            <p className="text-neutral-300 leading-relaxed text-xs">
              Cada equipe possui seus jogadores de moeda e um goleiro. Vocês alternam as jogadas para chutar a moeda bola no gol adversário. Vale usar as tabelas de madeira para surpreender o adversário com rebotes calculados!
            </p>
          </section>

          {/* PC Controls */}
          <section className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
            <h3 className="font-semibold text-sky-400 mb-2 flex items-center gap-2">
              <MousePointer className="w-4 h-4" />
              Controles no Computador (Mouse e Teclado)
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                <span className="font-mono text-amber-300 block mb-0.5">Clique + Arrastar</span>
                <span className="text-neutral-400">Puxa o estilingue da moeda para mirar direção e força.</span>
              </div>
              <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                <span className="font-mono text-amber-300 block mb-0.5">Soltar o Clique</span>
                <span className="text-neutral-400">Dispara o peteleco na moeda na velocidade calculada.</span>
              </div>
              <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                <span className="font-mono text-amber-300 block mb-0.5">Espaço (Space)</span>
                <span className="text-neutral-400">Cancela a mira atual sem disparar.</span>
              </div>
              <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                <span className="font-mono text-amber-300 block mb-0.5">Teclas R / M / P</span>
                <span className="text-neutral-400">R: Reiniciar · M: Som · P: Pausar partida.</span>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Entendido, Bora Jogar!
          </button>
        </div>
      </div>
    </div>
  );
};
