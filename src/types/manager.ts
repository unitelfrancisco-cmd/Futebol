import { CoinType } from './game';

export type PlayerPosition = 'GL' | 'ZAG' | 'MEI' | 'ATA';

export type PlayerRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface PlayerCoin {
  id: string;
  name: string;
  nickname: string;
  number: number;
  position: PlayerPosition;
  coinType: CoinType;
  overall: number; // 50 to 99
  energy?: number; // 0 to 100% (WSC Stamina)
  stars?: number;  // 1 to 5 stars
  potential?: number; // 50 to 99
  attributes: {
    shotPower: number;   // 50-99: affects max shot speed and rebound force
    accuracy: number;    // 50-99: affects trajectory tightness & guide length
    weight: number;      // 50-99: coin mass (momentum & collision resistance)
    control: number;     // 50-99: reduced friction / smoother slide
  };
  marketValue: number;   // R$ Coin currency
  salary: number;        // per match cost
  age: number;
  rarity: PlayerRarity;
  isStarter: boolean;
  avatarSeed: string;
  stats: {
    matches: number;
    goals: number;
    assists: number;
  };
  colors: {
    outer: string;
    inner: string;
    border: string;
    highlight: string;
  };
}

export type FormationType = '1-2-1' | '1-1-2' | '1-3-0' | '1-0-3';

export interface ManagerClub {
  id: string;
  name: string;
  shortName: string;
  managerName: string;
  stadiumName?: string;
  city?: string;
  emblem?: 'shield' | 'crown' | 'flame' | 'star' | 'zap' | 'trophy' | 'gem' | 'target';
  tutorialCompleted?: boolean;
  primaryColor: string;
  secondaryColor: string;
  budget: number;
  ticketPrice: number;
  divisionName: string;
  season: number;
  matchday: number;
  totalMatchdays: number;
  formation: FormationType;
  tacticalStyle: 'BALANCED' | 'OFFENSIVE' | 'DEFENSIVE' | 'COUNTER';
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  historyLogs: { id: string; dateText: string; title: string; type: 'FINANCE' | 'MATCH' | 'TRANSFER' | 'SCOUT' }[];
}

export interface OpponentClub {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  tacticalStyle: 'BALANCED' | 'OFFENSIVE' | 'DEFENSIVE';
  overall: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  squad: PlayerCoin[];
}

export interface ScoutOption {
  id: string;
  title: string;
  description: string;
  region: string;
  cost: number;
  minOverall: number;
  maxOverall: number;
  iconName: string;
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

export type ManagerViewTab = 'DASHBOARD' | 'SQUAD' | 'TRAINING' | 'TRANSFERS' | 'SCOUT' | 'LEAGUE' | 'MATCH_PREVIEW';

export type HighlightType =
  | 'ATTACK_1V1'
  | 'ATTACK_LONG_SHOT'
  | 'ATTACK_FREE_KICK'
  | 'ATTACK_COUNTER'
  | 'DEFENSE_COUNTER'
  | 'DEFENSE_SAVE';

export interface MatchHighlight {
  id: string;
  minute: number;
  type: HighlightType;
  title: string;
  description: string;
  hint: string;
  isPlayerAttacking: boolean;
  playerRole: 'STRIKER' | 'MIDFIELDER' | 'DEFENDER' | 'GOALKEEPER';
}

export interface GoalScorerRecord {
  minute: number;
  playerName: string;
  isPlayerTeam: boolean;
}

