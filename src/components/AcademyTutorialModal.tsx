import React, { useState } from 'react';
import { ManagerClub, PlayerCoin } from '../types/manager';
import {
  X,
  Shield,
  Target,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  Gift,
  Award,
  Coins,
  ChevronRight,
  RotateCcw,
  Flame,
  Volume2,
} from 'lucide-react';
import { sounds } from '../services/soundEngine';

interface AcademyTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: ManagerClub;
  onCompleteTutorial: (selectedStriker: {
    name: string;
    style: 'VELOZ' | 'MATADOR' | 'DRIBLADOR';
  }) => void;
}

export const AcademyTutorialModal: React.FC<AcademyTutorialModalProps> = ({
  isOpen,
  onClose,
  club,
  onCompleteTutorial,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [gkDrillState, setGkDrillState] = useState<'IDLE' | 'SUCCESS' | 'MISSED'>('IDLE');
  const [gkTargetZone, setGkTargetZone] = useState<'LEFT' | 'CENTER' | 'RIGHT'>('CENTER');

  const [defDrillState, setDefDrillState] = useState<'IDLE' | 'SUCCESS' | 'MISSED'>('IDLE');
  const [defBlockAngle, setDefBlockAngle] = useState<'LEFT' | 'CENTER' | 'RIGHT'>('CENTER');

  const [midDrillState, setMidDrillState] = useState<'IDLE' | 'SUCCESS' | 'MISSED'>('IDLE');
  const [aimPower, setAimPower] = useState<number>(75);

  // Pack opening states
  const [isPackOpened, setIsPackOpened] = useState<boolean>(false);
  const [selectedStrikerStyle, setSelectedStrikerStyle] = useState<'VELOZ' | 'MATADOR' | 'DRIBLADOR'>('MATADOR');
  const [strikerRevealed, setStrikerRevealed] = useState<boolean>(false);

  if (!isOpen) return null;

  // GK Drill Action
  const handleGkSave = (choice: 'LEFT' | 'CENTER' | 'RIGHT') => {
    if (choice === gkTargetZone) {
      sounds.playCoinClink(0.9);
      sounds.playWhistle(false);
      setGkDrillState('SUCCESS');
    } else {
      sounds.playWoodRailBounce(0.5);
      setGkDrillState('MISSED');
      setTimeout(() => setGkDrillState('IDLE'), 1200);
    }
  };

  // DEF Drill Action
  const handleDefIntercept = (choice: 'LEFT' | 'CENTER' | 'RIGHT') => {
    if (choice === defBlockAngle) {
      sounds.playCoinClink(0.85);
      setDefDrillState('SUCCESS');
    } else {
      sounds.playWoodRailBounce(0.5);
      setDefDrillState('MISSED');
      setTimeout(() => setDefDrillState('IDLE'), 1200);
    }
  };

  // MID Drill Action
  const handleMidPass = () => {
    sounds.playCoinClink(1);
    setMidDrillState('SUCCESS');
  };

  // Pack Open Action
  const handleOpenPack = () => {
    sounds.playGoalCelebration();
    sounds.playCoinClink(1);
    setIsPackOpened(true);
    setTimeout(() => {
      setStrikerRevealed(true);
    }, 600);
  };

  // Complete
  const handleFinish = () => {
    sounds.playGoalCelebration();
    onCompleteTutorial({
      name:
        selectedStrikerStyle === 'MATADOR'
          ? 'Canhão Matador'
          : selectedStrikerStyle === 'VELOZ'
          ? 'Romarinho Veloz'
          : 'Mago dos Centavos',
      style: selectedStrikerStyle,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-neutral-950 shadow-md border"
              style={{ backgroundColor: club.primaryColor, borderColor: club.secondaryColor }}
            >
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Escolinha & Tutorial de Recrutamento
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Etapa {currentStep} de 4
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Aprenda a física das moedas e desbloqueie os primeiros craques do {club.name}!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="grid grid-cols-4 border-b border-neutral-800 bg-neutral-950/40 text-xs font-semibold">
          {[
            { step: 1, label: '1. Goleiro', sub: 'Massa & Peso' },
            { step: 2, label: '2. Zagueiro', sub: 'Barreira & Cobre' },
            { step: 3, label: '3. Maestro', sub: 'Passe no Vão' },
            { step: 4, label: '4. Atacante', sub: 'Draft & Pacote' },
          ].map((item) => (
            <div
              key={item.step}
              className={`p-3 text-center border-r last:border-r-0 border-neutral-800 transition-colors ${
                currentStep === item.step
                  ? 'bg-amber-500/15 text-amber-300 border-b-2 border-b-amber-400'
                  : currentStep > item.step
                  ? 'text-emerald-400 bg-neutral-900/60'
                  : 'text-neutral-500'
              }`}
            >
              <span className="block text-xs font-bold">{item.label}</span>
              <span className="text-[10px] opacity-75 hidden sm:block">{item.sub}</span>
            </div>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-neutral-200">
          {/* STEP 1: GOALKEEPER (Prata Pesada 50 Centavos) */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="bg-neutral-950/70 border border-neutral-800 p-4 rounded-2xl">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Fundamento #1: A Física do Goleiro
                </span>
                <h3 className="text-base font-bold text-white mb-2">
                  Por que a moeda de 50 Centavos é a melhor para o gol?
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  No futebol de moedas, a massa dita o impacto. A moeda de <strong className="text-white">50 Centavos de Prata</strong> tem peso superior (~88 de massa), o que impede que chutes adversários a empurrem para o fundo da rede com facilidade. Posicione o seu goleiro fechando o ângulo central da trave!
                </p>
              </div>

              {/* Interactive Drill 1: GK Reflex Test */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-center flex flex-col items-center">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 mb-2">
                  Mini-Teste da Academia: Espalme o chute rival no gol!
                </span>

                {/* Simulated Goal Area */}
                <div className="w-full max-w-md h-32 bg-emerald-950/40 border-4 border-white/80 rounded-t-xl relative flex items-center justify-around p-3 my-3 shadow-inner">
                  {/* Goal posts and net texture */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />

                  {/* Target zones */}
                  {(['LEFT', 'CENTER', 'RIGHT'] as const).map((zone) => (
                    <button
                      key={zone}
                      onClick={() => handleGkSave(zone)}
                      disabled={gkDrillState === 'SUCCESS'}
                      className={`relative z-10 w-24 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${
                        gkDrillState === 'SUCCESS' && zone === gkTargetZone
                          ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 scale-105'
                          : 'border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 hover:border-amber-400 text-neutral-300'
                      }`}
                    >
                      <Shield className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold">
                        {zone === 'LEFT' ? 'Canto Esq.' : zone === 'CENTER' ? 'Meio' : 'Canto Dir.'}
                      </span>
                    </button>
                  ))}
                </div>

                {gkDrillState === 'IDLE' && (
                  <p className="text-xs text-neutral-400 animate-pulse">
                    Mire no <strong className="text-amber-400">Meio do Gol</strong> para espalmar a moeda rival!
                  </p>
                )}
                {gkDrillState === 'MISSED' && (
                  <p className="text-xs text-rose-400 font-bold">
                    O chute veio no meio! Tente novamente.
                  </p>
                )}
                {gkDrillState === 'SUCCESS' && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Defesa Espetacular! Moeda espalmada com precisão.</span>
                  </div>
                )}
              </div>

              {/* Reward Unlocked Box */}
              {gkDrillState === 'SUCCESS' && (
                <div className="bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-300 border-2 border-slate-500 shadow-md flex items-center justify-center text-slate-900 font-black text-sm">
                      1
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        🎁 1º Jogador Desbloqueado!
                      </span>
                      <h4 className="text-sm font-bold text-white">Muralha de Prata (GL) · OVR 78</h4>
                      <p className="text-[11px] text-neutral-400">Moeda de 50¢ Pesada · Peso 88 / Defesa 74</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playCoinClink(0.7);
                      setCurrentStep(2);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Próxima Etapa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DEFENDER (Cobre 25 Centavos) */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="bg-neutral-950/70 border border-neutral-800 p-4 rounded-2xl">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block mb-1">
                  Fundamento #2: O Posicionamento da Barreira
                </span>
                <h3 className="text-base font-bold text-white mb-2">
                  Zagueiros de Cobre: O escudo que corta os ângulos
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  As moedas de <strong className="text-white">25 Centavos</strong> possuem diâmetro ideal para formar barreiras sólidas. O segredo da marcação no futebol de moedas é não deixar linha de visão direta entre a moeda do adversário e as traves da sua meta.
                </p>
              </div>

              {/* Interactive Drill 2: Block Angle */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-center flex flex-col items-center">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 mb-2">
                  Mini-Teste da Academia: Posicione o Zagueiro para travar a trajetória!
                </span>

                <div className="w-full max-w-md h-28 bg-emerald-950/40 border border-neutral-700 rounded-xl relative flex items-center justify-around p-3 my-3">
                  {(['LEFT', 'CENTER', 'RIGHT'] as const).map((angle) => (
                    <button
                      key={angle}
                      onClick={() => handleDefIntercept(angle)}
                      disabled={defDrillState === 'SUCCESS'}
                      className={`w-24 h-16 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        defDrillState === 'SUCCESS' && angle === defBlockAngle
                          ? 'bg-sky-500/30 border-sky-400 text-sky-300 scale-105'
                          : 'border-neutral-700 bg-neutral-900/60 hover:border-sky-400 text-neutral-300'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-black/40 flex items-center justify-center text-[10px] font-bold text-white mb-1"
                        style={{ backgroundColor: club.secondaryColor }}
                      >
                        3
                      </div>
                      <span className="text-[10px] font-bold">Bloquear {angle}</span>
                    </button>
                  ))}
                </div>

                {defDrillState === 'IDLE' && (
                  <p className="text-xs text-neutral-400 animate-pulse">
                    O adversário prepara o chute pelo centro. Clique em <strong className="text-sky-400">Bloquear CENTER</strong>!
                  </p>
                )}
                {defDrillState === 'SUCCESS' && (
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-bold bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/30">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bloqueio Impecável! Rebote neutralizado.</span>
                  </div>
                )}
              </div>

              {/* Reward Unlocked Box */}
              {defDrillState === 'SUCCESS' && (
                <div className="bg-gradient-to-r from-sky-500/10 to-emerald-500/10 border border-sky-500/40 p-4 rounded-2xl flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full border-2 border-white/50 shadow-md flex items-center justify-center text-white font-black text-sm"
                      style={{ backgroundColor: club.secondaryColor }}
                    >
                      3
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                        🎁 2º Jogador Desbloqueado!
                      </span>
                      <h4 className="text-sm font-bold text-white">Xerife de Aço (ZAG) · OVR 75</h4>
                      <p className="text-[11px] text-neutral-400">Moeda de 25¢ de Cobre · Firmeza 84 / Desarme 78</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playCoinClink(0.7);
                      setCurrentStep(3);
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Próxima Etapa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: MIDFIELDER (Bimetálica 1 Real - Triangulação) */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="bg-neutral-950/70 border border-neutral-800 p-4 rounded-2xl">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Fundamento #3: A Regra de Ouro das 3 Moedas
                </span>
                <h3 className="text-base font-bold text-white mb-2">
                  Passar no vão entre as outras duas moedas!
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Para avançar em direção ao gol, sua moeda deve <strong className="text-amber-400">passar exatamente pelo meio do vão</strong> formado pelas outras duas. Se você tocar em qualquer outra moeda ou errar o vão, é falta! Moedas bimetálicas de <strong className="text-white">1 Real</strong> têm anel dourado e miolo prateado com alta precisão e deslize suave.
                </p>
              </div>

              {/* Interactive Drill 3: Triangulation Pass */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-center flex flex-col items-center">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 mb-2">
                  Mini-Teste da Academia: Ajuste a mira e execute o passe entre os pinos!
                </span>

                <div className="w-full max-w-md h-32 bg-emerald-950/40 border border-neutral-700 rounded-xl relative flex items-center justify-center p-3 my-3">
                  {/* Two gate coins */}
                  <div className="absolute left-1/4 top-4 w-7 h-7 rounded-full bg-slate-400 border border-black/40 flex items-center justify-center text-[10px] font-bold text-neutral-950">
                    A
                  </div>
                  <div className="absolute right-1/4 top-4 w-7 h-7 rounded-full bg-slate-400 border border-black/40 flex items-center justify-center text-[10px] font-bold text-neutral-950">
                    B
                  </div>

                  {/* Gate trajectory guide */}
                  <div className="absolute inset-x-1/3 top-7 border-t-2 border-dashed border-amber-400/60" />

                  {/* Moving coin */}
                  <div
                    className={`absolute bottom-3 w-8 h-8 rounded-full border-2 border-amber-300 flex items-center justify-center text-xs font-bold text-neutral-950 shadow-lg transition-all duration-500 ${
                      midDrillState === 'SUCCESS' ? 'translate-y-[-50px] scale-110' : ''
                    }`}
                    style={{ backgroundColor: club.primaryColor }}
                  >
                    10
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full max-w-xs mb-3">
                  <span className="text-[11px] text-neutral-400">Força:</span>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={aimPower}
                    onChange={(e) => setAimPower(Number(e.target.value))}
                    disabled={midDrillState === 'SUCCESS'}
                    className="flex-1 accent-amber-400"
                  />
                  <span className="text-xs font-mono text-amber-300">{aimPower}%</span>
                </div>

                {midDrillState === 'IDLE' ? (
                  <button
                    onClick={handleMidPass}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all"
                  >
                    Executar Passe Triangulado 🎯
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Passe Perfeito! Trajetória no vão livre validada.</span>
                  </div>
                )}
              </div>

              {/* Reward Unlocked Box */}
              {midDrillState === 'SUCCESS' && (
                <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/40 p-4 rounded-2xl flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full border-2 border-amber-300 shadow-md flex items-center justify-center text-neutral-950 font-black text-sm"
                      style={{ backgroundColor: club.primaryColor }}
                    >
                      10
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        🎁 3º Jogador Desbloqueado!
                      </span>
                      <h4 className="text-sm font-bold text-white">Maestro do Clube (MEI) · OVR 82</h4>
                      <p className="text-[11px] text-neutral-400">Moeda de 1 R$ Bimetálica · Precisão 89 / Visão 85</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playCoinClink(0.7);
                      setCurrentStep(4);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Ir para o Draft Final</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: PACK OPENING & STRIKER DRAFT */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="bg-neutral-950/70 border border-neutral-800 p-4 rounded-2xl">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Etapa Final: O Pacote Dourado de Revelação da Estrela
                </span>
                <h3 className="text-base font-bold text-white mb-2">
                  Escolha o Estilo do seu Atacante Camisa 9!
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Para completar o seu elenco titular oficial do <strong className="text-white">{club.name}</strong>, abra o <strong className="text-amber-400">Pacote Dourado de Revelação</strong> e escolha a característica do seu goleador. Além do craque, você receberá um bônus de formatura de <strong className="text-emerald-400">+R$ 300</strong> no cofre do clube!
                </p>
              </div>

              {/* Pack Reveal Animation Container */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 text-center flex flex-col items-center relative overflow-hidden">
                {!isPackOpened ? (
                  <div className="flex flex-col items-center py-4">
                    {/* Golden Pack Card */}
                    <div className="w-48 h-64 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-1 shadow-2xl animate-bounce border-2 border-yellow-300 flex flex-col items-center justify-between py-4 text-neutral-950">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Edição Oficial
                        </span>
                      </div>

                      <div className="text-center">
                        <div
                          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-black text-xl shadow-lg border"
                          style={{ backgroundColor: club.primaryColor, borderColor: '#fff' }}
                        >
                          {club.shortName}
                        </div>
                        <h4 className="text-xs font-black tracking-tight mt-2 uppercase">
                          Draft Inicial
                        </h4>
                        <span className="text-[9px] font-bold block opacity-75">
                          Liga das Moedas
                        </span>
                      </div>

                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-black/20">
                        1 Craque + R$ 300
                      </span>
                    </div>

                    <button
                      onClick={handleOpenPack}
                      className="mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                    >
                      <Gift className="w-5 h-5" />
                      <span>Abrir Pacote de Revelação 🌟</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center w-full animate-fade-in">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                      <Sparkles className="w-4 h-4" />
                      <span>Pacote Aberto com Sucesso! Escolha seu Artilheiro:</span>
                    </div>

                    {/* Striker Archetype Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mb-4">
                      {[
                        {
                          style: 'MATADOR' as const,
                          name: 'Canhão Matador',
                          desc: 'Potência bruta (94) para arrebentar as redes rivais',
                          icon: <Flame className="w-5 h-5 text-rose-400" />,
                          overall: 83,
                          coin: 'Moeda de 25¢ Ouro',
                        },
                        {
                          style: 'VELOZ' as const,
                          name: 'Romarinho Veloz',
                          desc: 'Velocidade máxima e aceleração em contra-ataques',
                          icon: <Zap className="w-5 h-5 text-amber-400" />,
                          overall: 82,
                          coin: 'Moeda de 10¢ Leve',
                        },
                        {
                          style: 'DRIBLADOR' as const,
                          name: 'Mago dos Centavos',
                          desc: 'Controle de bola cirúrgico (95) e curvas perigosas',
                          icon: <Target className="w-5 h-5 text-sky-400" />,
                          overall: 83,
                          coin: 'Moeda de 1 Real',
                        },
                      ].map((card) => (
                        <button
                          key={card.style}
                          onClick={() => {
                            sounds.playCoinClink(0.7);
                            setSelectedStrikerStyle(card.style);
                          }}
                          className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            selectedStrikerStyle === card.style
                              ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg ring-2 ring-amber-400/50 scale-102'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              {card.icon}
                              <span className="text-xs font-black font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                {card.overall} OVR
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-white">{card.name}</h5>
                            <p className="text-[10px] text-neutral-400 mt-1 leading-snug">
                              {card.desc}
                            </p>
                          </div>
                          <span className="text-[9px] text-neutral-500 font-mono mt-3 block">
                            {card.coin}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Bonus Coin Reward Ribbon */}
                    <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 rounded-xl text-emerald-300 text-xs font-bold mb-4">
                      <Coins className="w-4 h-4 text-emerald-400" />
                      <span>Bônus da Academia: +R$ 300 adicionados ao seu cofre!</span>
                    </div>

                    {/* Finish Action */}
                    <button
                      onClick={handleFinish}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Concluir Tutorial & Assumir o {club.name} 🏆</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-800 bg-neutral-950/80 text-xs text-neutral-400">
          <span>
            Clube: <strong className="text-white">{club.name}</strong> ({club.shortName})
          </span>
          <span className="text-[11px] text-neutral-500">
            Escadinha da Base · Futebol de Moedas Manager
          </span>
        </div>
      </div>
    </div>
  );
};
