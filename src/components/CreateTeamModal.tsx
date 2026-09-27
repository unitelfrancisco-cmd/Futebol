import React, { useState } from 'react';
import { ManagerClub } from '../types/manager';
import {
  X,
  Shield,
  Crown,
  Flame,
  Star,
  Zap,
  Trophy,
  Gem,
  Target,
  Sparkles,
  Palette,
  Check,
  GraduationCap,
  Save,
  Dices,
} from 'lucide-react';
import { sounds } from '../services/soundEngine';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClub: ManagerClub;
  onSaveClub: (updatedClub: Partial<ManagerClub>, startTutorial?: boolean) => void;
}

const COLOR_PRESETS = [
  { name: 'Ouro & Esmeralda', primary: '#F59E0B', secondary: '#10B981' },
  { name: 'Rubro-Negro Fogo', primary: '#EF4444', secondary: '#18181B' },
  { name: 'Alvinegro Clássico', primary: '#F8FAFC', secondary: '#09090B' },
  { name: 'Azul Real & Ouro', primary: '#2563EB', secondary: '#F59E0B' },
  { name: 'Verde & Branco', primary: '#16A34A', secondary: '#F8FAFC' },
  { name: 'Grená & Dourado', primary: '#991B1B', secondary: '#D97706' },
  { name: 'Roxo Imperial', primary: '#7C3AED', secondary: '#FBBF24' },
  { name: 'Celeste & Prata', primary: '#38BDF8', secondary: '#94A3B8' },
];

const EMBLEMS: { id: ManagerClub['emblem']; label: string; icon: React.ReactNode }[] = [
  { id: 'crown', label: 'Coroa Real', icon: <Crown className="w-5 h-5" /> },
  { id: 'shield', label: 'Escudo Nobre', icon: <Shield className="w-5 h-5" /> },
  { id: 'flame', label: 'Chama Viva', icon: <Flame className="w-5 h-5" /> },
  { id: 'star', label: 'Estrela Campeã', icon: <Star className="w-5 h-5" /> },
  { id: 'zap', label: 'Raio Veloz', icon: <Zap className="w-5 h-5" /> },
  { id: 'trophy', label: 'Taça da Glória', icon: <Trophy className="w-5 h-5" /> },
  { id: 'gem', label: 'Diamante Puro', icon: <Gem className="w-5 h-5" /> },
  { id: 'target', label: 'Alvo Certeiro', icon: <Target className="w-5 h-5" /> },
];

const RANDOM_NAMES = [
  { name: 'Guerreiros da Moeda FC', short: 'GDM', city: 'São Paulo', stadium: 'Arena Centenária' },
  { name: 'Fênix Bimetálica', short: 'FBX', city: 'Rio de Janeiro', stadium: 'Ninho de Ouro' },
  { name: 'Leões de Prata FC', short: 'LPF', city: 'Belo Horizonte', stadium: 'Coliseu das Moedas' },
  { name: 'Atlético do Cobre', short: 'ACO', city: 'Porto Alegre', stadium: 'Estádio dos Centavos' },
  { name: 'Estrela Real das Mesas', short: 'ERM', city: 'Brasília', stadium: 'Arena Central' },
  { name: 'Dragões de Ouro FC', short: 'DOF', city: 'Curitiba', stadium: 'Cofre Municipal' },
];

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  currentClub,
  onSaveClub,
}) => {
  const [name, setName] = useState(currentClub.name || 'Real Centavo FC');
  const [shortName, setShortName] = useState(currentClub.shortName || 'RCE');
  const [managerName, setManagerName] = useState(currentClub.managerName || 'Professor da Mesa');
  const [stadiumName, setStadiumName] = useState(currentClub.stadiumName || 'Arena do Centavo');
  const [city, setCity] = useState(currentClub.city || 'São Paulo');
  const [emblem, setEmblem] = useState<ManagerClub['emblem']>(currentClub.emblem || 'crown');
  const [primaryColor, setPrimaryColor] = useState(currentClub.primaryColor || '#F59E0B');
  const [secondaryColor, setSecondaryColor] = useState(currentClub.secondaryColor || '#10B981');
  const [tacticalStyle, setTacticalStyle] = useState<ManagerClub['tacticalStyle']>(
    currentClub.tacticalStyle || 'BALANCED'
  );

  if (!isOpen) return null;

  const handleRandomize = () => {
    sounds.playCoinClink(0.7);
    const chosen = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const chosenColor = COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)];
    const chosenEmblem = EMBLEMS[Math.floor(Math.random() * EMBLEMS.length)].id;

    setName(chosen.name);
    setShortName(chosen.short);
    setCity(chosen.city);
    setStadiumName(chosen.stadium);
    setPrimaryColor(chosenColor.primary);
    setSecondaryColor(chosenColor.secondary);
    setEmblem(chosenEmblem);
  };

  const handleSave = (startTutorial: boolean = false) => {
    sounds.playCoinClink(0.9);
    onSaveClub(
      {
        name: name.trim() || 'Meu Clube FC',
        shortName: (shortName.trim() || 'MCF').toUpperCase().slice(0, 4),
        managerName: managerName.trim() || 'Técnico',
        stadiumName: stadiumName.trim() || 'Arena Central',
        city: city.trim() || 'Cidade Principal',
        emblem: emblem || 'shield',
        primaryColor,
        secondaryColor,
        tacticalStyle,
      },
      startTutorial
    );
    onClose();
  };

  const getEmblemIcon = (eType?: ManagerClub['emblem']) => {
    switch (eType) {
      case 'shield':
        return <Shield className="w-7 h-7" />;
      case 'crown':
        return <Crown className="w-7 h-7" />;
      case 'flame':
        return <Flame className="w-7 h-7" />;
      case 'star':
        return <Star className="w-7 h-7" />;
      case 'zap':
        return <Zap className="w-7 h-7" />;
      case 'trophy':
        return <Trophy className="w-7 h-7" />;
      case 'gem':
        return <Gem className="w-7 h-7" />;
      case 'target':
        return <Target className="w-7 h-7" />;
      default:
        return <Crown className="w-7 h-7" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[95vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-neutral-950 shadow-md border"
              style={{ backgroundColor: primaryColor, borderColor: secondaryColor }}
            >
              {getEmblemIcon(emblem)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Criar & Personalizar Clube
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Modo Carreira
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Defina o nome, brasão, cores e a identidade da sua equipe de moedas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomize}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Gerar clube aleatório"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Aleatório</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-neutral-200">
          {/* Live Preview Card */}
          <div
            className="p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
            style={{
              backgroundColor: `${primaryColor}15`,
              borderColor: `${primaryColor}50`,
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-xl border-2"
                style={{
                  backgroundColor: primaryColor,
                  color: '#09090B',
                  borderColor: secondaryColor,
                }}
              >
                {getEmblemIcon(emblem)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    {name || 'Nome do Clube'}
                  </h3>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded text-neutral-950 font-mono"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    {shortName || 'TAG'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Técnico: <span className="text-white font-medium">{managerName || 'Você'}</span> · Estádio: <span className="text-neutral-300">{stadiumName} ({city})</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Moedas em Campo:</span>
                  <div className="flex items-center gap-1.5">
                    {/* Mini coin previews */}
                    <div
                      className="w-5 h-5 rounded-full border border-white/50 flex items-center justify-center text-[9px] font-bold text-neutral-900 shadow-sm"
                      style={{ backgroundColor: '#94A3B8' }}
                      title="Goleiro (50¢)"
                    >
                      1
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border border-white/50 flex items-center justify-center text-[9px] font-bold text-neutral-900 shadow-sm"
                      style={{ backgroundColor: secondaryColor }}
                      title="Zagueiro"
                    >
                      3
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border border-white/50 flex items-center justify-center text-[9px] font-bold text-neutral-900 shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                      title="Meia"
                    >
                      10
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border-2 border-amber-300 flex items-center justify-center text-[9px] font-bold text-neutral-900 shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                      title="Atacante"
                    >
                      9
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-neutral-800/80 sm:pl-6 w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Filosofia</span>
              <span className="text-xs font-bold text-amber-400">
                {tacticalStyle === 'BALANCED' && 'Equilibrado (1-2-1)'}
                {tacticalStyle === 'OFFENSIVE' && 'Ofensivo Total (1-1-2)'}
                {tacticalStyle === 'DEFENSIVE' && 'Muralha Defensiva (1-3-0)'}
                {tacticalStyle === 'COUNTER' && 'Contra-Ataque (1-0-3)'}
              </span>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Club Name */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Nome do Clube
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={32}
                placeholder="Ex: Guerreiros da Moeda FC"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Short Tag */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Sigla do Clube (máx. 4 letras)
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value.toUpperCase().slice(0, 4))}
                maxLength={4}
                placeholder="Ex: GDM"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors uppercase"
              />
            </div>

            {/* Manager Name */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Nome do Técnico / Treinador
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                maxLength={28}
                placeholder="Ex: Professor Silva"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* City */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Cidade de Origem
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                maxLength={24}
                placeholder="Ex: São Paulo"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Stadium Name */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Nome do Estádio / Arena
              </label>
              <input
                type="text"
                value={stadiumName}
                onChange={(e) => setStadiumName(e.target.value)}
                maxLength={32}
                placeholder="Ex: Arena dos Campeões das Moedas"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Emblem Selection */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2">
              Brasão / Símbolo do Clube
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {EMBLEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    sounds.playCoinClink(0.4);
                    setEmblem(item.id);
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                    emblem === item.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                  title={item.label}
                >
                  <div className="mb-1">{item.icon}</div>
                  <span className="text-[10px] text-center truncate w-full font-medium">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Colors Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Cores Oficiais do Clube
              </label>
              <span className="text-[11px] text-neutral-500">Paletas clássicas ou personalizadas</span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    sounds.playCoinClink(0.4);
                    setPrimaryColor(preset.primary);
                    setSecondaryColor(preset.secondary);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    primaryColor === preset.primary && secondaryColor === preset.secondary
                      ? 'bg-neutral-800 border-amber-500/80 shadow-md'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center -space-x-1 shrink-0">
                    <div
                      className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-neutral-300 truncate">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom pickers */}
            <div className="flex items-center gap-4 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Cor Principal:</span>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-7 h-7 rounded border border-neutral-700 cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-neutral-300">{primaryColor}</span>
              </div>
              <div className="w-px h-5 bg-neutral-800" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Cor Secundária:</span>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-7 h-7 rounded border border-neutral-700 cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-neutral-300">{secondaryColor}</span>
              </div>
            </div>
          </div>

          {/* Tactical Philosophy */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2">
              Filosofia Tática Inicial
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {[
                { id: 'BALANCED', label: 'Equilibrado', desc: '1 GL, 2 Meias, 1 Atacante' },
                { id: 'OFFENSIVE', label: 'Ofensivo', desc: '1 GL, 1 Meia, 2 Atacantes' },
                { id: 'DEFENSIVE', label: 'Defensivo', desc: '1 GL, 3 Zagueiros/Meias' },
                { id: 'COUNTER', label: 'Contra-Ataque', desc: '1 GL, 3 Atacantes Rápidos' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setTacticalStyle(style.id as ManagerClub['tacticalStyle'])}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    tacticalStyle === style.id
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <span className="text-xs font-bold block text-amber-300">{style.label}</span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-neutral-800 bg-neutral-950/80">
          <p className="text-xs text-neutral-500">
            Dica: Inicie o <span className="text-amber-400 font-semibold">Tutorial da Academia</span> para ganhar seu primeiro elenco de ouro!
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleSave(false)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Clube</span>
            </button>

            <button
              onClick={() => handleSave(true)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 fill-neutral-950" />
              <span>Salvar & Fazer Tutorial 🎓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
