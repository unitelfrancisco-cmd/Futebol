import React, { useState, useEffect } from 'react';
import { PlayerCoin, ManagerClub } from '../types/manager';
import { Sparkles, ShoppingBag, ArrowRight, X, Zap } from 'lucide-react';

interface TransferNotificationBannerProps {
  market: PlayerCoin[];
  club: ManagerClub;
  onNavigateTransfers: () => void;
  onSignPlayer: (player: PlayerCoin) => void;
}

export const TransferNotificationBanner: React.FC<TransferNotificationBannerProps> = ({
  market,
  club,
  onNavigateTransfers,
  onSignPlayer,
}) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Find rare/legendary/epic player in market
  const featuredStar = market.find(
    (p) => (p.rarity === 'RARE' || p.rarity === 'EPIC' || p.rarity === 'LEGENDARY') && !dismissedIds.includes(p.id)
  );

  if (!featuredStar) return null;

  const canAfford = club.budget >= featuredStar.marketValue;

  return (
    <div className="bg-gradient-to-r from-purple-950/80 via-neutral-900 to-amber-950/70 border border-purple-500/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="absolute top-0 right-0 p-3">
        <button
          onClick={() => setDismissedIds((prev) => [...prev, featuredStar.id])}
          className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800/80 transition-colors cursor-pointer"
          title="Fechar Notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pr-6">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold border-2 shadow-xl shrink-0"
            style={{
              backgroundColor: featuredStar.colors.inner,
              borderColor: featuredStar.colors.outer,
              color: featuredStar.colors.border,
            }}
          >
            #{featuredStar.number}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                Alerta de Craque no Mercado
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">R$ {featuredStar.marketValue}</span>
            </div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              {featuredStar.name} <span className="text-xs font-normal text-neutral-400">({featuredStar.position} · {featuredStar.rarity})</span>
            </h4>
            <p className="text-xs text-neutral-300 leading-snug">
              Um jogador de alto nível está disponível para transferência. Oportunidade imperdível para fortalecer seu time!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={onNavigateTransfers}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 cursor-pointer transition-colors"
          >
            Ver no Mercado
          </button>
          <button
            onClick={() => onSignPlayer(featuredStar)}
            disabled={!canAfford}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg transition-all ${
              canAfford
                ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-amber-500/20'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{canAfford ? 'Contratar Direto' : 'Saldo Insuficiente'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
