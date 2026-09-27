import React from 'react';
import { Download, Monitor, CheckCircle2, X, Globe, Sparkles } from 'lucide-react';

interface InstallDesktopAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallDesktopAppModal: React.FC<InstallDesktopAppModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Instalar Futebol de Moedas no PC</h2>
              <p className="text-xs text-neutral-400">Jogue direto no seu computador como um app nativo (PWA)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5 text-sm text-neutral-300">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-amber-200/90">
              Instalar o app no seu PC elimina a barra de endereços do navegador, melhora o desempenho e permite acesso rápido direto pela barra de tarefas ou menu iniciar!
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Guia Rápido (Google Chrome / Edge)</h3>

            <div className="flex items-start gap-3 bg-neutral-950/60 border border-neutral-800 rounded-xl p-3.5">
              <div className="w-6 h-6 rounded-full bg-neutral-800 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div className="text-xs leading-relaxed">
                Abra o menu de opções do navegador clicando no ícone de três pontos (<span className="font-mono text-amber-400">⋮</span>) no canto superior direito.
              </div>
            </div>

            <div className="flex items-start gap-3 bg-neutral-950/60 border border-neutral-800 rounded-xl p-3.5">
              <div className="w-6 h-6 rounded-full bg-neutral-800 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div className="text-xs leading-relaxed">
                Procure e clique na opção <span className="font-semibold text-white">"Instalar Futebol de Moedas..."</span> ou vá em <span className="text-neutral-200 font-medium">Salvar e Compartilhar &gt; Instalar o aplicativo</span>.
              </div>
            </div>

            <div className="flex items-start gap-3 bg-neutral-950/60 border border-neutral-800 rounded-xl p-3.5">
              <div className="w-6 h-6 rounded-full bg-neutral-800 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div className="text-xs leading-relaxed">
                Confirme a instalação na janela pop-up. O jogo criará um atalho automático na sua área de trabalho e abrirá em janela dedicada.
              </div>
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex items-center gap-3">
            <Monitor className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-xs text-neutral-400">
              <span className="text-white font-semibold">Dica:</span> Se a opção de instalar não aparecer de imediato, certifique-se de que a página carregou completamente ou clique no ícone de monitor com uma seta na barra de endereços do Chrome.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Entendi, Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
