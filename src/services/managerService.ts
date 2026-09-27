import { ManagerClub, PlayerCoin, OpponentClub, ScoutOption, FormationType } from '../types/manager';

const LOCAL_STORAGE_KEY = 'futebol_moedas_manager_save_v1';

export function createInitialClub(): ManagerClub {
  return {
    id: 'club-player-1',
    name: 'Real Centavo FC',
    shortName: 'RCE',
    managerName: 'Professor da Mesa',
    stadiumName: 'Arena do Centavo',
    city: 'São Paulo',
    emblem: 'crown',
    tutorialCompleted: false,
    primaryColor: '#F59E0B', // Dourado Real
    secondaryColor: '#10B981', // Verde Campo
    budget: 650, // Moedas R$
    ticketPrice: 20,
    divisionName: 'Liga Principal das Moedas',
    season: 1,
    matchday: 1,
    totalMatchdays: 7,
    formation: '1-2-1',
    tacticalStyle: 'BALANCED',
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    historyLogs: [
      {
        id: 'log-1',
        dateText: 'Início da Temporada',
        title: 'Você assumiu o comando do Real Centavo FC na Liga das Moedas!',
        type: 'FINANCE',
      },
    ],
  };
}

export interface CreateCustomClubParams {
  name: string;
  shortName: string;
  managerName: string;
  stadiumName?: string;
  city?: string;
  emblem?: 'shield' | 'crown' | 'flame' | 'star' | 'zap' | 'trophy' | 'gem' | 'target';
  primaryColor: string;
  secondaryColor: string;
  tacticalStyle?: 'BALANCED' | 'OFFENSIVE' | 'DEFENSIVE' | 'COUNTER';
}

let logCounter = 0;
export function generateLogId(): string {
  logCounter++;
  return `log-${Date.now()}-${logCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createCustomClub(params: CreateCustomClubParams): ManagerClub {
  return {
    id: `club-${Date.now()}`,
    name: params.name.trim() || 'Meu Clube FC',
    shortName: (params.shortName.trim() || 'MCF').toUpperCase().slice(0, 4),
    managerName: params.managerName.trim() || 'Treinador',
    stadiumName: params.stadiumName?.trim() || 'Estádio Municipal',
    city: params.city?.trim() || 'Capital',
    emblem: params.emblem || 'shield',
    tutorialCompleted: false,
    primaryColor: params.primaryColor || '#F59E0B',
    secondaryColor: params.secondaryColor || '#10B981',
    budget: 700,
    ticketPrice: 20,
    divisionName: 'Liga Principal das Moedas',
    season: 1,
    matchday: 1,
    totalMatchdays: 7,
    formation: '1-2-1',
    tacticalStyle: params.tacticalStyle || 'BALANCED',
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    historyLogs: [
      {
        id: generateLogId(),
        dateText: 'Fundação do Clube',
        title: `Clube fundado sob a gestão de ${params.managerName || 'Treinador'}! Bem-vindo à Liga das Moedas.`,
        type: 'FINANCE',
      },
    ],
  };
}

export function createInitialSquad(): PlayerCoin[] {
  return [
    {
      id: 'p-1',
      name: 'Muralha de Prata',
      nickname: 'Muralha',
      number: 1,
      position: 'GL',
      coinType: 'REAL_50',
      overall: 78,
      attributes: {
        shotPower: 70,
        accuracy: 72,
        weight: 88, // Heavy silver coin - hard to push into net
        control: 74,
      },
      marketValue: 240,
      salary: 15,
      age: 28,
      rarity: 'RARE',
      isStarter: true,
      avatarSeed: 'gk-silver',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: {
        outer: '#94A3B8',
        inner: '#CBD5E1',
        border: '#475569',
        highlight: '#FFFFFF',
      },
    },
    {
      id: 'p-2',
      name: 'Xerife do Cobre',
      nickname: 'Xerife',
      number: 3,
      position: 'ZAG',
      coinType: 'REAL_25',
      overall: 74,
      attributes: {
        shotPower: 76,
        accuracy: 68,
        weight: 82,
        control: 70,
      },
      marketValue: 180,
      salary: 12,
      age: 26,
      rarity: 'COMMON',
      isStarter: true,
      avatarSeed: 'def-bronze',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: {
        outer: '#D97706',
        inner: '#F59E0B',
        border: '#92400E',
        highlight: '#FEF3C7',
      },
    },
    {
      id: 'p-3',
      name: 'Maestro Bimetálico',
      nickname: 'Maestro',
      number: 10,
      position: 'MEI',
      coinType: 'REAL_1',
      overall: 82,
      attributes: {
        shotPower: 84,
        accuracy: 88,
        weight: 80,
        control: 86,
      },
      marketValue: 320,
      salary: 22,
      age: 24,
      rarity: 'EPIC',
      isStarter: true,
      avatarSeed: 'mid-bimetal',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: {
        outer: '#D4AF37',
        inner: '#E2E8F0',
        border: '#B45309',
        highlight: '#FEF08A',
      },
    },
    {
      id: 'p-4',
      name: 'Centavinho Flecha',
      nickname: 'Flecha',
      number: 9,
      position: 'ATA',
      coinType: 'REAL_1',
      overall: 80,
      attributes: {
        shotPower: 86,
        accuracy: 82,
        weight: 76,
        control: 84,
      },
      marketValue: 290,
      salary: 18,
      age: 22,
      rarity: 'RARE',
      isStarter: true,
      avatarSeed: 'fwd-gold',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: {
        outer: '#F59E0B',
        inner: '#FEF08A',
        border: '#B45309',
        highlight: '#FFFFFF',
      },
    },
    // Reserves
    {
      id: 'p-5',
      name: 'Biro-Moeda Rápido',
      nickname: 'Biro',
      number: 7,
      position: 'ATA',
      coinType: 'REAL_10',
      overall: 71,
      attributes: {
        shotPower: 78,
        accuracy: 70,
        weight: 65,
        control: 82,
      },
      marketValue: 120,
      salary: 8,
      age: 19,
      rarity: 'COMMON',
      isStarter: false,
      avatarSeed: 'sub-copper',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: {
        outer: '#B45309',
        inner: '#F8FAFC',
        border: '#78350F',
        highlight: '#FDE68A',
      },
    },
    {
      id: 'p-6',
      name: 'Cilindro Reserva',
      nickname: 'Cilindro',
      number: 4,
      position: 'ZAG',
      coinType: 'REAL_50',
      overall: 69,
      attributes: {
        shotPower: 65,
        accuracy: 62,
        weight: 84,
        control: 66,
      },
      marketValue: 110,
      salary: 7,
      age: 31,
      rarity: 'COMMON',
      isStarter: false,
      avatarSeed: 'sub-silver',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: {
        outer: '#64748B',
        inner: '#94A3B8',
        border: '#334155',
        highlight: '#E2E8F0',
      },
    },
  ];
}

export function createCustomSquadForClub(
  club: ManagerClub,
  customStriker?: { name: string; style: 'VELOZ' | 'MATADOR' | 'DRIBLADOR' }
): PlayerCoin[] {
  const primary = club.primaryColor || '#F59E0B';
  const secondary = club.secondaryColor || '#10B981';

  let strikerOverall = 81;
  let strikerName = 'Flecha de Ouro';
  let strikerPower = 88;
  let strikerAcc = 84;
  let strikerWeight = 78;
  let strikerCtrl = 86;

  if (customStriker?.style === 'MATADOR') {
    strikerName = customStriker.name || 'Canhão Matador';
    strikerOverall = 83;
    strikerPower = 94;
    strikerAcc = 88;
    strikerWeight = 85;
    strikerCtrl = 78;
  } else if (customStriker?.style === 'DRIBLADOR') {
    strikerName = customStriker.name || 'Bruxinho das Moedas';
    strikerOverall = 83;
    strikerPower = 82;
    strikerAcc = 93;
    strikerWeight = 72;
    strikerCtrl = 95;
  } else if (customStriker?.style === 'VELOZ') {
    strikerName = customStriker.name || 'Relâmpago do Gol';
    strikerOverall = 82;
    strikerPower = 86;
    strikerAcc = 85;
    strikerWeight = 70;
    strikerCtrl = 92;
  } else if (customStriker?.name) {
    strikerName = customStriker.name;
  }

  return [
    {
      id: `p-${Date.now()}-1`,
      name: 'Muralha de Prata',
      nickname: 'Muralha',
      number: 1,
      position: 'GL',
      coinType: 'REAL_50',
      overall: 78,
      attributes: { shotPower: 70, accuracy: 72, weight: 88, control: 74 },
      marketValue: 240,
      salary: 15,
      age: 28,
      rarity: 'RARE',
      isStarter: true,
      avatarSeed: 'gk-silver',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: {
        outer: '#94A3B8',
        inner: '#CBD5E1',
        border: '#475569',
        highlight: '#FFFFFF',
      },
    },
    {
      id: `p-${Date.now()}-2`,
      name: 'Xerife de Aço',
      nickname: 'Xerife',
      number: 3,
      position: 'ZAG',
      coinType: 'REAL_25',
      overall: 75,
      attributes: { shotPower: 78, accuracy: 70, weight: 84, control: 72 },
      marketValue: 190,
      salary: 13,
      age: 26,
      rarity: 'COMMON',
      isStarter: true,
      avatarSeed: 'def-steel',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: {
        outer: secondary,
        inner: '#F1F5F9',
        border: '#334155',
        highlight: '#FFFFFF',
      },
    },
    {
      id: `p-${Date.now()}-3`,
      name: 'Maestro do Clube',
      nickname: 'Maestro',
      number: 10,
      position: 'MEI',
      coinType: 'REAL_1',
      overall: 82,
      attributes: { shotPower: 85, accuracy: 89, weight: 80, control: 88 },
      marketValue: 330,
      salary: 22,
      age: 25,
      rarity: 'EPIC',
      isStarter: true,
      avatarSeed: 'mid-maestro',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: {
        outer: primary,
        inner: '#F8FAFC',
        border: '#B45309',
        highlight: '#FEF08A',
      },
    },
    {
      id: `p-${Date.now()}-4`,
      name: strikerName,
      nickname: strikerName.split(' ')[0],
      number: 9,
      position: 'ATA',
      coinType: 'REAL_1',
      overall: strikerOverall,
      attributes: {
        shotPower: strikerPower,
        accuracy: strikerAcc,
        weight: strikerWeight,
        control: strikerCtrl,
      },
      marketValue: 310,
      salary: 20,
      age: 22,
      rarity: 'RARE',
      isStarter: true,
      avatarSeed: 'fwd-custom',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: {
        outer: primary,
        inner: secondary,
        border: '#78350F',
        highlight: '#FFFFFF',
      },
    },
    // Reserves
    {
      id: `p-${Date.now()}-5`,
      name: 'Jovem Talento da Base',
      nickname: 'Cria',
      number: 7,
      position: 'ATA',
      coinType: 'REAL_10',
      overall: 72,
      attributes: { shotPower: 79, accuracy: 72, weight: 66, control: 84 },
      marketValue: 130,
      salary: 8,
      age: 18,
      rarity: 'COMMON',
      isStarter: false,
      avatarSeed: 'sub-cria',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: {
        outer: '#B45309',
        inner: '#F8FAFC',
        border: '#78350F',
        highlight: '#FDE68A',
      },
    },
    {
      id: `p-${Date.now()}-6`,
      name: 'Reserva Seguro',
      nickname: 'Segurança',
      number: 4,
      position: 'ZAG',
      coinType: 'REAL_50',
      overall: 70,
      attributes: { shotPower: 66, accuracy: 64, weight: 85, control: 68 },
      marketValue: 115,
      salary: 7,
      age: 29,
      rarity: 'COMMON',
      isStarter: false,
      avatarSeed: 'sub-guard',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: {
        outer: '#64748B',
        inner: '#94A3B8',
        border: '#334155',
        highlight: '#E2E8F0',
      },
    },
  ];
}

export function createTransferMarketPool(): PlayerCoin[] {
  return [
    {
      id: 'm-1',
      name: 'Realdo Fenômeno',
      nickname: 'Realdo',
      number: 9,
      position: 'ATA',
      coinType: 'REAL_1',
      overall: 92,
      attributes: { shotPower: 95, accuracy: 93, weight: 85, control: 91 },
      marketValue: 580,
      salary: 40,
      age: 27,
      rarity: 'LEGENDARY',
      isStarter: false,
      avatarSeed: 'realdo',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: { outer: '#EAB308', inner: '#F8FAFC', border: '#854D0E', highlight: '#FEF08A' },
    },
    {
      id: 'm-2',
      name: 'Centavinho Gaúcho',
      nickname: 'Bruxo',
      number: 10,
      position: 'MEI',
      coinType: 'REAL_1',
      overall: 90,
      attributes: { shotPower: 88, accuracy: 96, weight: 80, control: 97 },
      marketValue: 520,
      salary: 35,
      age: 26,
      rarity: 'LEGENDARY',
      isStarter: false,
      avatarSeed: 'bruxo',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: { outer: '#F59E0B', inner: '#FEF3C7', border: '#78350F', highlight: '#FFFFFF' },
    },
    {
      id: 'm-3',
      name: 'Titan de Aço 50',
      nickname: 'Titan',
      number: 1,
      position: 'GL',
      coinType: 'REAL_50',
      overall: 87,
      attributes: { shotPower: 76, accuracy: 80, weight: 96, control: 82 },
      marketValue: 410,
      salary: 28,
      age: 29,
      rarity: 'EPIC',
      isStarter: false,
      avatarSeed: 'titan',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: { outer: '#94A3B8', inner: '#F1F5F9', border: '#334155', highlight: '#FFFFFF' },
    },
    {
      id: 'm-4',
      name: 'Canhão Dourado',
      nickname: 'Canhão',
      number: 11,
      position: 'ATA',
      coinType: 'REAL_25',
      overall: 83,
      attributes: { shotPower: 92, accuracy: 84, weight: 81, control: 79 },
      marketValue: 340,
      salary: 24,
      age: 23,
      rarity: 'RARE',
      isStarter: false,
      avatarSeed: 'canhao',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: { outer: '#D97706', inner: '#FBBF24', border: '#92400E', highlight: '#FEF9C3' },
    },
    {
      id: 'm-5',
      name: 'Corta-Luz 25',
      nickname: 'Corta-Luz',
      number: 5,
      position: 'MEI',
      coinType: 'REAL_25',
      overall: 79,
      attributes: { shotPower: 78, accuracy: 82, weight: 80, control: 81 },
      marketValue: 240,
      salary: 16,
      age: 25,
      rarity: 'RARE',
      isStarter: false,
      avatarSeed: 'cortaluz',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: { outer: '#F59E0B', inner: '#FEF3C7', border: '#B45309', highlight: '#FFFFFF' },
    },
    {
      id: 'm-6',
      name: 'Trancaço de Cobre',
      nickname: 'Trancaço',
      number: 2,
      position: 'ZAG',
      coinType: 'REAL_50',
      overall: 77,
      attributes: { shotPower: 74, accuracy: 68, weight: 89, control: 72 },
      marketValue: 210,
      salary: 14,
      age: 28,
      rarity: 'COMMON',
      isStarter: false,
      avatarSeed: 'trancaco',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: { outer: '#64748B', inner: '#94A3B8', border: '#1E293B', highlight: '#E2E8F0' },
    },
    {
      id: 'm-7',
      name: 'Jovem da Moeda 10',
      nickname: 'Faísca',
      number: 17,
      position: 'ATA',
      coinType: 'REAL_10',
      overall: 73,
      attributes: { shotPower: 76, accuracy: 74, weight: 64, control: 86 },
      marketValue: 140,
      salary: 9,
      age: 18,
      rarity: 'COMMON',
      isStarter: false,
      avatarSeed: 'faisca',
      stats: { matches: 0, goals: 0, assists: 0 },
      colors: { outer: '#B45309', inner: '#F59E0B', border: '#78350F', highlight: '#FDE68A' },
    },
  ];
}

export function createInitialOpponents(): OpponentClub[] {
  return [
    {
      id: 'opp-1',
      name: 'Moeda Forte EC',
      shortName: 'MFO',
      primaryColor: '#3B82F6',
      secondaryColor: '#1D4ED8',
      tacticalStyle: 'OFFENSIVE',
      overall: 81,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      squad: [],
    },
    {
      id: 'opp-2',
      name: 'Prata Fina FC',
      shortName: 'PFI',
      primaryColor: '#94A3B8',
      secondaryColor: '#475569',
      tacticalStyle: 'DEFENSIVE',
      overall: 78,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      squad: [],
    },
    {
      id: 'opp-3',
      name: 'Cruzado Nobre AC',
      shortName: 'CNO',
      primaryColor: '#8B5CF6',
      secondaryColor: '#6D28D9',
      tacticalStyle: 'BALANCED',
      overall: 80,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      squad: [],
    },
    {
      id: 'opp-4',
      name: 'Cobre Urbano',
      shortName: 'CUR',
      primaryColor: '#EA580C',
      secondaryColor: '#9A3412',
      tacticalStyle: 'BALANCED',
      overall: 75,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      squad: [],
    },
    {
      id: 'opp-5',
      name: 'Dólar Imperial',
      shortName: 'DIM',
      primaryColor: '#059669',
      secondaryColor: '#047857',
      tacticalStyle: 'OFFENSIVE',
      overall: 83,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      squad: [],
    },
    {
      id: 'opp-6',
      name: 'Dinheiro Vivo SC',
      shortName: 'DVI',
      primaryColor: '#E11D48',
      secondaryColor: '#BE123C',
      tacticalStyle: 'DEFENSIVE',
      overall: 76,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      squad: [],
    },
    {
      id: 'opp-7',
      name: 'Troco Rápido FC',
      shortName: 'TRQ',
      primaryColor: '#D97706',
      secondaryColor: '#B45309',
      tacticalStyle: 'BALANCED',
      overall: 73,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      squad: [],
    },
  ];
}

export const SCOUT_MISSIONS: ScoutOption[] = [
  {
    id: 'scout-bakery',
    title: 'Troco da Padaria & Mercearia',
    description: 'Investigue o fundo das caixas registradoras para encontrar jovens moedas ágeis e acessíveis.',
    region: 'Comércio Local',
    cost: 60,
    minOverall: 68,
    maxOverall: 76,
    iconName: 'ShoppingBag',
  },
  {
    id: 'scout-fair',
    title: 'Feira de Antiguidades & Colecionadores',
    description: 'Contrate um avaliador experiente para encontrar peças raras e moedas comemorativas de alta classe.',
    region: 'Feira Numismática',
    cost: 160,
    minOverall: 76,
    maxOverall: 86,
    iconName: 'Sparkles',
  },
  {
    id: 'scout-vault',
    title: 'Cofre Secreto da Reserva Monetária',
    description: 'Missão internacional de elite para recrutar moedas lendárias de peso histórico imbatível.',
    region: 'Cofres Suíços',
    cost: 380,
    minOverall: 84,
    maxOverall: 95,
    iconName: 'ShieldCheck',
  },
];

// Random names and nicknames generator for recruits
const FIRST_NAMES = ['Romário', 'Ronaldo', 'Pelé', 'Zico', 'Cafu', 'Dida', 'Kaká', 'Sócrates', 'Garrincha', 'Rivaldo', 'Ney', 'Casemiro', 'Alisson', 'Taffarel', 'Bebeto'];
const COIN_SUFFIXES = ['Centavo', 'Real', 'Cobre', 'Níquel', 'Ouro', 'Prata', 'Bronze', 'Coroa', 'Florim', 'Dobrado'];

export function generateScoutedPlayer(minOverall: number, maxOverall: number): PlayerCoin {
  const overall = Math.floor(minOverall + Math.random() * (maxOverall - minOverall + 1));
  const posChoice: PlayerCoin['position'][] = ['GL', 'ZAG', 'MEI', 'ATA'];
  const position = posChoice[Math.floor(Math.random() * posChoice.length)];

  let coinType: PlayerCoin['coinType'] = 'REAL_1';
  let rarity: PlayerCoin['rarity'] = 'COMMON';
  let colors = { outer: '#D4AF37', inner: '#E2E8F0', border: '#B45309', highlight: '#FEF08A' };

  if (position === 'GL') {
    coinType = 'REAL_50';
    colors = { outer: '#94A3B8', inner: '#CBD5E1', border: '#334155', highlight: '#FFFFFF' };
  } else if (overall >= 88) {
    rarity = 'LEGENDARY';
    coinType = 'GOLD';
    colors = { outer: '#EAB308', inner: '#FEF08A', border: '#713F12', highlight: '#FFFFFF' };
  } else if (overall >= 80) {
    rarity = 'EPIC';
    coinType = 'REAL_1';
    colors = { outer: '#D4AF37', inner: '#F8FAFC', border: '#B45309', highlight: '#FEF08A' };
  } else if (overall >= 74) {
    rarity = 'RARE';
    coinType = 'REAL_25';
    colors = { outer: '#F59E0B', inner: '#D97706', border: '#92400E', highlight: '#FEF3C7' };
  } else {
    rarity = 'COMMON';
    coinType = 'REAL_10';
    colors = { outer: '#B45309', inner: '#78350F', border: '#451A03', highlight: '#FDE68A' };
  }

  const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lName = COIN_SUFFIXES[Math.floor(Math.random() * COIN_SUFFIXES.length)];

  const shotPower = Math.min(99, Math.max(50, overall + Math.floor((Math.random() - 0.5) * 12)));
  const accuracy = Math.min(99, Math.max(50, overall + Math.floor((Math.random() - 0.5) * 10)));
  const weight = Math.min(99, Math.max(50, (position === 'GL' ? 88 : 74) + Math.floor((Math.random() - 0.5) * 14)));
  const control = Math.min(99, Math.max(50, overall + Math.floor((Math.random() - 0.5) * 10)));

  const marketValue = Math.round((Math.pow(overall / 10, 2.5) * 1.8) / 10) * 10;
  const salary = Math.round(marketValue * 0.07);

  return {
    id: `scout-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: `${fName} ${lName}`,
    nickname: `${fName} das Moedas`,
    number: Math.floor(1 + Math.random() * 98),
    position,
    coinType,
    overall,
    attributes: {
      shotPower,
      accuracy,
      weight,
      control,
    },
    marketValue,
    salary,
    age: Math.floor(17 + Math.random() * 8),
    rarity,
    isStarter: false,
    avatarSeed: `seed-${overall}`,
    stats: { matches: 0, goals: 0, assists: 0 },
    colors,
  };
}

// Local Storage Handlers
export function loadManagerSave(): {
  club: ManagerClub;
  squad: PlayerCoin[];
  opponents: OpponentClub[];
  market: PlayerCoin[];
} | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.club && Array.isArray(parsed.club.historyLogs)) {
      const seenIds = new Set<string>();
      parsed.club.historyLogs = parsed.club.historyLogs.map((log: any, idx: number) => {
        let id = log.id || `log-${idx}`;
        if (seenIds.has(id)) {
          id = `${id}-${idx}-${Math.random().toString(36).slice(2, 6)}`;
        }
        seenIds.add(id);
        return { ...log, id };
      });
    }
    return parsed;
  } catch (err) {
    console.error('Error loading manager save:', err);
    return null;
  }
}

export function saveManagerGame(
  club: ManagerClub,
  squad: PlayerCoin[],
  opponents: OpponentClub[],
  market: PlayerCoin[]
) {
  try {
    const payload = JSON.stringify({ club, squad, opponents, market });
    localStorage.setItem(LOCAL_STORAGE_KEY, payload);
  } catch (err) {
    console.error('Error saving manager game:', err);
  }
}
