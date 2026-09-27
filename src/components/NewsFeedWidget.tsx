import React, { useState } from 'react';
import { Newspaper, Flame, Sparkles, TrendingUp, RefreshCw, Award, ArrowRight } from 'lucide-react';

interface NewsItem {
  id: string;
  category: 'TRANSFERÊNCIA' | 'LIGA' | 'MERCADO' | 'BASTIDORES';
  headline: string;
  source: string;
  timeAgo: string;
  isHot?: boolean;
}

const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'n1',
    category: 'TRANSFERÊNCIA',
    headline: 'Bomba no Mercado da Bola: Atacante lendário de 1 Real é cobiçado por gigantes da Suíça!',
    source: 'Gazeta das Moedas',
    timeAgo: 'Há 15 min',
    isHot: true,
  },
  {
    id: 'n2',
    category: 'LIGA',
    headline: 'Imprensa esportiva elogia a solidez defensiva do zagueiro de 50 Centavos no último clássico.',
    source: 'Esporte Tático',
    timeAgo: 'Há 1 hora',
  },
  {
    id: 'n3',
    category: 'BASTIDORES',
    headline: 'Técnico do rival underprende e balança no cargo após goleada sofrida na mesa de jogo.',
    source: 'Plantão Manager',
    timeAgo: 'Há 3 horas',
  },
  {
    id: 'n4',
    category: 'MERCADO',
    headline: 'Valorização recorde: Moeda comemorativa de 1998 atinge cotação histórica de R$ 450 no mercado secundário.',
    source: 'Bolsa Numismática',
    timeAgo: 'Há 5 horas',
    isHot: true,
  },
  {
    id: 'n5',
    category: 'LIGA',
    headline: 'Clássico da rodada promete lotar as dependências do estádio com bilheteria esgotada e torcida inflamada.',
    source: 'Arena News',
    timeAgo: 'Ontem',
  },
];

export const NewsFeedWidget: React.FC = () => {
  const [filter, setFilter] = useState<string>('TODOS');
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshNews = () => {
    setRefreshing(true);
    setTimeout(() => {
      const extraHeadlines: NewsItem[] = [
        {
          id: `rand-${Date.now()}-1`,
          category: 'TRANSFERÊNCIA',
          headline: 'Oferta milionária recusada pela diretoria por jovem promessa das moedas de 10 Centavos.',
          source: 'Mercado FC',
          timeAgo: 'Agora mesmo',
          isHot: true,
        },
        {
          id: `rand-${Date.now()}-2`,
          category: 'BASTIDORES',
          headline: 'Treinador do clube é eleito o melhor gestor do mês após sequência invicta na Liga!',
          source: 'Prêmios da Mesa',
          timeAgo: 'Há 30 min',
          isHot: true,
        },
        {
          id: `rand-${Date.now()}-3`,
          category: 'MERCADO',
          headline: 'Novo lote de moedas raras desembarca nos cofres centrais para olheiros internacionais.',
          source: 'Cofres Suíços',
          timeAgo: 'Há 2 horas',
        },
      ];
      setNews([...extraHeadlines, ...INITIAL_NEWS]);
      setRefreshing(false);
    }, 600);
  };

  const filteredNews =
    filter === 'TODOS' ? news : news.filter((item) => item.category === filter);

  const getBadgeColor = (cat: string) => {
    switch (cat) {
      case 'TRANSFERÊNCIA':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'LIGA':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'MERCADO':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'BASTIDORES':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-tight">
              Feed de Notícias & Imprensa
            </h3>
            <p className="text-[10px] text-neutral-400">
              Manchetes do mundo do futebol de moedas em tempo real
            </p>
          </div>
        </div>

        <button
          onClick={handleRefreshNews}
          disabled={refreshing}
          className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
          title="Atualizar manchetes"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
          <span className="hidden sm:inline">Atualizar</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['TODOS', 'TRANSFERÊNCIA', 'LIGA', 'MERCADO', 'BASTIDORES'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === cat
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Headlines List */}
      <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
        {filteredNews.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col gap-2 group"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getBadgeColor(
                    item.category
                  )}`}
                >
                  {item.category}
                </span>
                {item.isHot && (
                  <span className="flex items-center gap-0.5 text-[9px] font-black uppercase text-rose-400 bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 rounded">
                    <Flame className="w-3 h-3 fill-current" />
                    Hot
                  </span>
                )}
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">{item.timeAgo}</span>
            </div>

            <p className="text-xs font-semibold text-neutral-200 group-hover:text-white leading-relaxed">
              {item.headline}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-neutral-900 text-[10px] text-neutral-400">
              <span className="italic">Fonte: {item.source}</span>
              <span className="text-amber-400 font-medium flex items-center gap-1 group-hover:underline">
                Ler matéria <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
