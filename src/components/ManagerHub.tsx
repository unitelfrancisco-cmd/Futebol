import React, { useState } from 'react';
import {
  ManagerClub,
  PlayerCoin,
  OpponentClub,
  ManagerViewTab,
  FormationType,
  SCOUT_MISSIONS,
  ScoutOption,
} from '../types/manager';
import {
  Trophy,
  Users,
  Coins,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Shield,
  Zap,
  Target,
  Sparkles,
  ShoppingBag,
  Sliders,
  ChevronRight,
  ArrowUpRight,
  UserPlus,
  Play,
  RotateCcw,
  Check,
  Briefcase,
  AlertCircle,
  Eye,
  Calendar,
  GraduationCap,
  Edit3,
  Crown,
  Flame,
  Star,
  MapPin,
  Building2,
} from 'lucide-react';
import { sounds } from '../services/soundEngine';

interface ManagerHubProps {
  club: ManagerClub;
  squad: PlayerCoin[];
  opponents: OpponentClub[];
  market: PlayerCoin[];
  nextOpponent: OpponentClub;
  onStartMatch: () => void;
  onSimulateMatch: () => void;
  onHirePlayer: (player: PlayerCoin) => void;
  onSellPlayer: (player: PlayerCoin) => void;
  onToggleStarter: (playerId: string) => void;
  onChangeFormation: (formation: FormationType) => void;
  onScoutMission: (mission: ScoutOption) => void;
  onResetCareer: () => void;
  onBackToCasual: () => void;
  onOpenCreateTeam: () => void;
  onOpenTutorial: () => void;
}

export const ManagerHub: React.FC<ManagerHubProps> = ({
  club,
  squad,
  opponents,
  market,
  nextOpponent,
  onStartMatch,
  onSimulateMatch,
  onHirePlayer,
  onSellPlayer,
  onToggleStarter,
  onChangeFormation,
  onScoutMission,
  onResetCareer,
  onBackToCasual,
  onOpenCreateTeam,
  onOpenTutorial,
}) => {
  const [activeTab, setActiveTab] = useState<ManagerViewTab>('DASHBOARD');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerCoin | null>(squad[0] || null);
  const [scoutingFeedback, setScoutingFeedback] = useState<PlayerCoin | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'SUCCESS' | 'ERROR' | 'INFO' } | null>(null);

  const showToast = (text: string, type: 'SUCCESS' | 'ERROR' | 'INFO' = 'INFO') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.text === text ? null : cur));
    }, 3500);
  };

  const starters = squad.filter((p) => p.isStarter);
  const reserves = squad.filter((p) => !p.isStarter);

  // League table sorted by Points, then GD, then GF
  const allClubsInLeague = [
    {
      id: club.id,
      name: club.name,
      shortName: club.shortName,
      primaryColor: club.primaryColor,
      points: club.points,
      played: club.played,
      won: club.won,
      drawn: club.drawn,
      lost: club.lost,
      goalsFor: club.goalsFor,
      goalsAgainst: club.goalsAgainst,
      isUser: true,
    },
    ...opponents.map((o) => ({ ...o, isUser: false })),
  ].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });

  const userRank = allClubsInLeague.findIndex((c) => c.isUser) + 1;
  const totalPayroll = starters.reduce((acc, p) => acc + p.salary, 0);

  const handleHireClick = (p: PlayerCoin) => {
    if (club.budget < p.marketValue) {
      sounds.playFoulBuzzer();
      showToast(`Orçamento insuficiente para contratar ${p.name}! Faltam R$ ${p.marketValue - club.budget}.`, 'ERROR');
      return;
    }
    sounds.playCoinClink(0.9);
    onHirePlayer(p);
    showToast(`Contratação confirmada! ${p.name} (#${p.number}) agora joga pelo ${club.name}.`, 'SUCCESS');
  };

  const handleSellClick = (p: PlayerCoin) => {
    if (squad.length <= 4) {
      sounds.playFoulBuzzer();
      showToast('Seu clube precisa de pelo menos 4 moedas no elenco para disputar partidas!', 'ERROR');
      return;
    }
    sounds.playCoinClink(0.7);
    onSellPlayer(p);
    showToast(`${p.name} vendido! +R$ ${Math.round(p.marketValue * 0.7)} adicionados ao cofre.`, 'SUCCESS');
    if (selectedPlayer?.id === p.id) {
      setSelectedPlayer(squad.find((sp) => sp.id !== p.id) || null);
    }
  };

  const handleScoutClick = (mission: ScoutOption) => {
    if (club.budget < mission.cost) {
      sounds.playFoulBuzzer();
      showToast(`Saldo insuficiente para enviar olheiro para ${mission.title}!`, 'ERROR');
      return;
    }
    sounds.playCoinClink(1);
    onScoutMission(mission);
    showToast(`Missão "${mission.title}" concluída com sucesso! Nova moeda garimpada.`, 'SUCCESS');
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto p-3 sm:p-6 text-neutral-100 flex flex-col gap-6">
      {/* 1. TOP MANAGER BRAND HEADER */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        {/* Club Crest & Title */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-extrabold text-lg shadow-lg border-2"
            style={{
              backgroundColor: club.primaryColor,
              color: '#0A0A0A',
              borderColor: club.secondaryColor,
            }}
          >
            {club.emblem === 'crown' && <Crown className="w-5 h-5 mb-0.5" />}
            {club.emblem === 'shield' && <Shield className="w-5 h-5 mb-0.5" />}
            {club.emblem === 'flame' && <Flame className="w-5 h-5 mb-0.5" />}
            {club.emblem === 'star' && <Star className="w-5 h-5 mb-0.5" />}
            {club.emblem === 'zap' && <Zap className="w-5 h-5 mb-0.5" />}
            {club.emblem === 'trophy' && <Trophy className="w-5 h-5 mb-0.5" />}
            {club.emblem === 'gem' && <Sparkles className="w-5 h-5 mb-0.5" />}
            {club.emblem === 'target' && <Target className="w-5 h-5 mb-0.5" />}
            <span className="text-[11px] leading-none font-black font-mono">{club.shortName}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">{club.name}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {club.divisionName}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Técnico: <span className="text-neutral-200 font-medium">{club.managerName}</span> · {club.city ? `${club.city} · ` : ''}Temporada {club.season} · Rodada {club.matchday}/{club.totalMatchdays}
            </p>
          </div>
        </div>

        {/* Club Quick Key Numbers */}
        <div className="flex items-center gap-5 bg-neutral-950/70 border border-neutral-800/90 px-4 py-2.5 rounded-xl">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Cofre do Clube</span>
            <span className="text-base font-extrabold text-amber-400 font-mono tabular-nums flex items-center gap-1">
              <Coins className="w-4 h-4 text-amber-400 inline" />
              R$ {club.budget}
            </span>
          </div>

          <div className="w-px h-8 bg-neutral-800" />

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Posição</span>
            <span className="text-base font-extrabold text-white font-mono tabular-nums">
              {userRank}º <span className="text-xs font-normal text-neutral-400">({club.points} pts)</span>
            </span>
          </div>

          <div className="w-px h-8 bg-neutral-800" />

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">Folha Salarial</span>
            <span className="text-base font-extrabold text-rose-400 font-mono tabular-nums">
              -R$ {totalPayroll}
            </span>
          </div>
        </div>

        {/* Action Buttons: Create Team, Tutorial, Play Match */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenCreateTeam}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 font-semibold text-xs transition-colors cursor-pointer"
            title="Criar ou personalizar seu clube, escudo e cores"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Criar / Editar Equipa</span>
          </button>

          <button
            onClick={onOpenTutorial}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-xs transition-colors cursor-pointer"
            title="Aprenda as regras e ganhe seu elenco de ouro"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tutorial & Recrutamento</span>
            {!club.tutorialCompleted && (
              <span className="text-[9px] bg-emerald-400 text-neutral-950 font-bold px-1.5 py-0.2 rounded-full">
                Ganhe Craques
              </span>
            )}
          </button>

          <button
            onClick={onStartMatch}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-neutral-950" />
            <span>Jogar Rodada {club.matchday}</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2 overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'DASHBOARD'
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>Escritório & Próximo Jogo</span>
          </button>

          <button
            onClick={() => setActiveTab('SQUAD')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'SQUAD'
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Elenco & Tática ({squad.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TRANSFERS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'TRANSFERS'
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mercado da Bola ({market.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SCOUT')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'SCOUT'
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Olheiro & Recrutamento</span>
          </button>

          <button
            onClick={() => setActiveTab('LEAGUE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'LEAGUE'
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Tabela da Liga</span>
          </button>
        </div>

        <button
          onClick={onBackToCasual}
          className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 transition-colors whitespace-nowrap cursor-pointer"
        >
          Modo Casual / 3 Moedas
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB: DASHBOARD */}
      {activeTab === 'DASHBOARD' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Next Match Card & Recent News */}
          <div className="lg:col-span-2 space-y-6">
            {/* Academy & Tutorial Recruitment Banner */}
            <div className="bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-amber-950/40 border border-emerald-500/40 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Escolinha & Recrutamento da Academia</h4>
                    {!club.tutorialCompleted ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Ganhe Seus Primeiros Craques
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                        Concluído
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">
                    Aprenda a física das moedas (goleiro pesado, zagueiro de cobre, triangulação) e desbloqueie seu Pacote Dourado de Atacante Estrela + R$ 300 de bônus!
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenTutorial}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 shrink-0 uppercase tracking-wider"
              >
                <span>{!club.tutorialCompleted ? 'Fazer Tutorial' : 'Repetir Tutorial'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Next Match Showcase */}
            <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Próxima Partida · Rodada {club.matchday}
                </span>
                <span className="text-xs text-neutral-400">
                  {club.stadiumName || 'Estádio da Mesa Central'} ({club.city || 'Casa'})
                </span>
              </div>

              <div className="flex items-center justify-around py-6 my-2 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
                {/* Home (Player) */}
                <div className="text-center space-y-2">
                  <div
                    className="w-16 h-16 rounded-full mx-auto flex items-center justify-center font-bold text-2xl border-2 shadow-lg"
                    style={{
                      backgroundColor: club.primaryColor,
                      color: '#0A0A0A',
                      borderColor: '#FEF08A',
                    }}
                  >
                    {club.shortName}
                  </div>
                  <div>
                    <span className="font-bold text-sm block text-white">{club.name}</span>
                    <span className="text-xs text-neutral-400 font-mono">Mandante</span>
                  </div>
                </div>

                {/* VS Badge */}
                <div className="text-center px-4">
                  <span className="text-2xl font-black text-amber-400 font-serif italic">VS</span>
                  <div className="mt-2 text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
                    Valendo 3 pts
                  </div>
                </div>

                {/* Away (Opponent) */}
                <div className="text-center space-y-2">
                  <div
                    className="w-16 h-16 rounded-full mx-auto flex items-center justify-center font-bold text-2xl border-2 shadow-lg"
                    style={{
                      backgroundColor: nextOpponent.primaryColor,
                      color: '#FFFFFF',
                      borderColor: '#E2E8F0',
                    }}
                  >
                    {nextOpponent.shortName}
                  </div>
                  <div>
                    <span className="font-bold text-sm block text-white">{nextOpponent.name}</span>
                    <span className="text-xs text-neutral-400 font-mono">
                      Visitante · Força {nextOpponent.overall}
                    </span>
                  </div>
                </div>
              </div>

              {/* Match actions */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-800/80">
                <div className="text-xs text-neutral-400">
                  <span>Expectativa de renda de bilheteria: </span>
                  <span className="font-bold text-emerald-400 font-mono">+R$ 90</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={onSimulateMatch}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Simular Rápido
                  </button>
                  <button
                    onClick={onStartMatch}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-neutral-950" />
                    <span>Entrar em Campo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Club Feed & Logs */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
              <h3 className="font-semibold text-sm text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Diário da Diretoria & Finanças
              </h3>
              <div className="space-y-2.5">
                {club.historyLogs.slice(0, 5).map((log, index) => (
                  <div
                    key={`${log.id}-${index}`}
                    className="flex items-start justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/70 text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="text-neutral-400 text-[10px] block font-mono">{log.dateText}</span>
                      <p className="text-neutral-200 font-medium">{log.title}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-neutral-900 text-neutral-400 border border-neutral-800">
                      {log.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: League Table Snapshot & Squad Overview */}
          <div className="space-y-6">
            {/* Top of the League Mini Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Classificação da Liga
                </h3>
                <button
                  onClick={() => setActiveTab('LEAGUE')}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  Ver Completa <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-neutral-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-950 text-neutral-400 text-[10px] uppercase font-mono">
                    <tr>
                      <th className="p-2 text-center w-8">#</th>
                      <th className="p-2">Clube</th>
                      <th className="p-2 text-center">J</th>
                      <th className="p-2 text-center">SG</th>
                      <th className="p-2 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 bg-neutral-900/50">
                    {allClubsInLeague.slice(0, 5).map((c, i) => (
                      <tr
                        key={c.id}
                        className={c.isUser ? 'bg-amber-500/10 font-bold text-amber-300' : 'text-neutral-300'}
                      >
                        <td className="p-2 text-center font-mono">{i + 1}</td>
                        <td className="p-2 truncate max-w-[120px]">{c.name}</td>
                        <td className="p-2 text-center font-mono text-neutral-400">{c.played}</td>
                        <td className="p-2 text-center font-mono text-neutral-400">{c.goalsFor - c.goalsAgainst}</td>
                        <td className="p-2 text-right font-mono font-bold">{c.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tactical Lineup Preview */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Titulares Escalados ({starters.length}/4)
                </h3>
                <button
                  onClick={() => setActiveTab('SQUAD')}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  Mudar <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {starters.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center font-mono">
                        {p.number}
                      </span>
                      <div>
                        <span className="font-semibold text-white block">{p.name}</span>
                        <span className="text-[10px] text-neutral-400">{p.position} · {p.coinType.replace('REAL_', 'R$ ')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-400 font-mono">{p.overall} OVR</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SQUAD & TACTICS */}
      {activeTab === 'SQUAD' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Squad List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-neutral-900 p-4 rounded-xl border border-neutral-800">
              <div>
                <h2 className="text-base font-bold text-white">Gestão do Elenco de Moedas</h2>
                <p className="text-xs text-neutral-400">
                  Clique na estrela para definir os 4 titulares que entram na mesa de jogo
                </p>
              </div>

              {/* Formation selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-400">Esquema:</span>
                <select
                  value={club.formation}
                  onChange={(e) => onChangeFormation(e.target.value as FormationType)}
                  className="bg-neutral-950 border border-neutral-700 text-white text-xs rounded-lg px-2.5 py-1.5 font-mono cursor-pointer"
                >
                  <option value="1-2-1">1-2-1 (Equilibrado)</option>
                  <option value="1-1-2">1-1-2 (Ofensivo)</option>
                  <option value="1-3-0">1-3-0 (Muralha Retranca)</option>
                  <option value="1-0-3">1-0-3 (Ataque Total)</option>
                </select>
              </div>
            </div>

            {/* List of Coins in Club */}
            <div className="grid gap-2.5">
              {squad.map((player) => {
                const isSelected = selectedPlayer?.id === player.id;
                return (
                  <div
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/80 ring-1 ring-amber-500/50'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Starter toggle star */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStarter(player.id);
                        }}
                        title={player.isStarter ? 'Titular (clique para virar reserva)' : 'Reserva (clique para virar titular)'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs transition-colors cursor-pointer ${
                          player.isStarter
                            ? 'bg-amber-400 text-neutral-950'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        #{player.number}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{player.name}</span>
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                            {player.position}
                          </span>
                          {player.isStarter && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              Titular
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-0.5">
                          <span>Moeda: {player.coinType.replace('REAL_', 'R$ ')}</span>
                          <span>·</span>
                          <span>Salário: R$ {player.salary}/jogo</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Overall badge */}
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-amber-400 font-mono block">
                          {player.overall}
                        </span>
                        <span className="text-[10px] uppercase text-neutral-500 font-medium">OVR</span>
                      </div>

                      {/* Sell button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSellClick(player);
                        }}
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-rose-500/20 hover:text-rose-300 border border-neutral-700 text-neutral-400 text-[11px] transition-colors cursor-pointer"
                        title="Dispensar/Vender jogador para arrecadar moedas"
                      >
                        Vender (+R$ {player.marketValue})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Player Detailed Technical File */}
          <div>
            {selectedPlayer ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl sticky top-6">
                <div className="text-center pb-4 border-b border-neutral-800">
                  {/* Coin Emblem Preview */}
                  <div
                    className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-xl font-bold border-4 shadow-xl mb-3"
                    style={{
                      backgroundColor: selectedPlayer.colors.inner,
                      borderColor: selectedPlayer.colors.outer,
                      color: selectedPlayer.colors.border,
                    }}
                  >
                    #{selectedPlayer.number}
                  </div>
                  <h3 className="font-bold text-lg text-white">{selectedPlayer.name}</h3>
                  <span className="text-xs text-neutral-400">
                    {selectedPlayer.position} · {selectedPlayer.rarity} · {selectedPlayer.age} anos
                  </span>
                </div>

                {/* Attributes Gauges */}
                <div className="py-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-400 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Força do Chute (Impulso)
                      </span>
                      <span className="font-mono font-bold text-white">{selectedPlayer.attributes.shotPower}</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${selectedPlayer.attributes.shotPower}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-400 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-emerald-400" />
                        Pontaria & Efeito (Mira)
                      </span>
                      <span className="font-mono font-bold text-white">{selectedPlayer.attributes.accuracy}</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${selectedPlayer.attributes.accuracy}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-400 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-sky-400" />
                        Massa da Moeda (Resistência)
                      </span>
                      <span className="font-mono font-bold text-white">{selectedPlayer.attributes.weight}</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-400 rounded-full"
                        style={{ width: `${selectedPlayer.attributes.weight}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        Controle & Deslize
                      </span>
                      <span className="font-mono font-bold text-white">{selectedPlayer.attributes.control}</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-400 rounded-full"
                        style={{ width: `${selectedPlayer.attributes.control}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Status bar */}
                <div className="pt-3 border-t border-neutral-800 text-xs flex justify-between text-neutral-400">
                  <span>Valor de Mercado:</span>
                  <span className="font-bold text-amber-400 font-mono">R$ {selectedPlayer.marketValue}</span>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center text-neutral-500">
                Selecione um jogador para inspecionar
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: TRANSFERS MARKET */}
      {activeTab === 'TRANSFERS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-neutral-900 p-4 rounded-xl border border-neutral-800">
            <div>
              <h2 className="text-base font-bold text-white">Mercado da Bola & Contratações</h2>
              <p className="text-xs text-neutral-400">
                Contrate moedas de alto nível para reforçar seu elenco. Seu saldo atual é <strong className="text-amber-400 font-mono">R$ {club.budget}</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {market.map((player) => {
              const canAfford = club.budget >= player.marketValue;
              return (
                <div
                  key={player.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between hover:border-neutral-700 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 shadow-md"
                          style={{
                            backgroundColor: player.colors.inner,
                            borderColor: player.colors.outer,
                            color: player.colors.border,
                          }}
                        >
                          #{player.number}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-white block">{player.name}</span>
                          <span className="text-[10px] text-neutral-400">{player.position} · {player.age} anos</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-amber-400 font-mono">{player.overall}</span>
                        <span className="text-[9px] block uppercase text-neutral-500 font-bold">Overall</span>
                      </div>
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 mb-4">
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Chute:</span>
                        <span className="font-mono font-bold text-white">{player.attributes.shotPower}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Mira:</span>
                        <span className="font-mono font-bold text-white">{player.attributes.accuracy}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Peso:</span>
                        <span className="font-mono font-bold text-white">{player.attributes.weight}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Salário:</span>
                        <span className="font-mono font-bold text-rose-400">R$ {player.salary}/j</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleHireClick(player)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Contratar (R$ {player.marketValue})</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: SCOUT & ACADEMY */}
      {activeTab === 'SCOUT' && (
        <div className="space-y-6">
          <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
            <h2 className="text-base font-bold text-white">Rede de Olheiros & Garimpo Numismático</h2>
            <p className="text-xs text-neutral-400">
              Envie olheiros especializados para descobrir joias escondidas e moedas raras por uma taxa de expedição.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SCOUT_MISSIONS.map((mission: ScoutOption) => {
              const canAfford = club.budget >= mission.cost;
              return (
                <div
                  key={mission.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-neutral-700 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        {mission.iconName === 'ShoppingBag' ? (
                          <ShoppingBag className="w-5 h-5" />
                        ) : mission.iconName === 'Sparkles' ? (
                          <Sparkles className="w-5 h-5" />
                        ) : (
                          <Shield className="w-5 h-5" />
                        )}
                      </div>
                      <span className="font-mono font-bold text-sm text-amber-400">
                        R$ {mission.cost}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-white mb-1">{mission.title}</h3>
                    <span className="text-[10px] uppercase font-mono font-semibold text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 inline-block mb-2">
                      {mission.region}
                    </span>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                      {mission.description}
                    </p>

                    <div className="p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800/80 text-xs mb-4">
                      <span className="text-neutral-500 block text-[10px]">Faixa de Nível Esperada:</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {mission.minOverall} a {mission.maxOverall} OVR
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleScoutClick(mission)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Garimpar Talento</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: LEAGUE TABLE */}
      {activeTab === 'LEAGUE' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Tabela da {club.divisionName}</h2>
              <p className="text-xs text-neutral-400">Rodada {club.matchday} de {club.totalMatchdays}</p>
            </div>
            <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20">
              O Campeão leva Troféu & Prêmio R$ 500
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-950 text-neutral-400 text-[11px] uppercase font-mono">
                <tr>
                  <th className="p-3 text-center w-10">Pos</th>
                  <th className="p-3">Clube</th>
                  <th className="p-3 text-center">J</th>
                  <th className="p-3 text-center">V</th>
                  <th className="p-3 text-center">E</th>
                  <th className="p-3 text-center">D</th>
                  <th className="p-3 text-center">GP</th>
                  <th className="p-3 text-center">GC</th>
                  <th className="p-3 text-center">SG</th>
                  <th className="p-3 text-right">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80 bg-neutral-900/60">
                {allClubsInLeague.map((c, idx) => {
                  const isLeader = idx === 0;
                  const isUser = c.isUser;
                  return (
                    <tr
                      key={c.id}
                      className={
                        isUser
                          ? 'bg-amber-500/15 font-bold text-amber-300'
                          : isLeader
                          ? 'bg-yellow-500/5 text-white'
                          : 'text-neutral-300 hover:bg-neutral-800/40'
                      }
                    >
                      <td className="p-3 text-center font-mono font-bold">
                        {isLeader ? '🏆 1' : `${idx + 1}`}
                      </td>
                      <td className="p-3 font-medium flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: c.primaryColor }}
                        />
                        <span>{c.name}</span>
                        {isUser && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/20 px-1.5 py-0.2 rounded">
                            Você
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono text-neutral-400">{c.played}</td>
                      <td className="p-3 text-center font-mono text-emerald-400">{c.won}</td>
                      <td className="p-3 text-center font-mono text-neutral-400">{c.drawn}</td>
                      <td className="p-3 text-center font-mono text-rose-400">{c.lost}</td>
                      <td className="p-3 text-center font-mono text-neutral-400">{c.goalsFor}</td>
                      <td className="p-3 text-center font-mono text-neutral-400">{c.goalsAgainst}</td>
                      <td className="p-3 text-center font-mono font-semibold">
                        {c.goalsFor - c.goalsAgainst > 0 ? `+${c.goalsFor - c.goalsAgainst}` : c.goalsFor - c.goalsAgainst}
                      </td>
                      <td className="p-3 text-right font-mono font-extrabold text-sm text-white">
                        {c.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* In-app Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`p-4 rounded-xl shadow-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
              toastMessage.type === 'ERROR'
                ? 'bg-rose-950/95 border-rose-700/80 text-rose-200'
                : toastMessage.type === 'SUCCESS'
                ? 'bg-emerald-950/95 border-emerald-700/80 text-emerald-200'
                : 'bg-neutral-900/95 border-neutral-700/80 text-neutral-200'
            }`}
          >
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-neutral-400 hover:text-white p-1 rounded transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
