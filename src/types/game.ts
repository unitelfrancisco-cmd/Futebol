export type GameMode = 'MANAGER_CAREER' | 'THREE_COINS' | 'MATCH_1V1_CPU' | 'MATCH_1V1_LOCAL' | 'PEGS_CHALLENGE';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface ReplayFrame {
  coins: { id: string; x: number; y: number; vx: number; vy: number; resting: boolean }[];
  activeCoinPos?: { x: number; y: number };
}

export interface ReplayData {
  goalSide: 'LEFT' | 'RIGHT';
  scorer: 'PLAYER' | 'OPPONENT';
  coinId: string;
  frames: ReplayFrame[];
  trajectory: { x: number; y: number }[];
}

export type CoinType = 'REAL_1' | 'REAL_50' | 'REAL_25' | 'REAL_10' | 'GOLD' | 'SILVER';

export type TableTheme = 'SCHOOL_DESK' | 'PRO_FELT' | 'NOBLE_WOOD';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Coin {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  type: CoinType;
  team?: 'PLAYER' | 'OPPONENT' | 'BALL' | 'NEUTRAL';
  isGoalkeeper?: boolean;
  label?: string;
  colorOuter: string;
  colorInner: string;
  borderColor: string;
  highlightColor: string;
  resting: boolean;
}

export interface Peg {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export interface Goal {
  side: 'LEFT' | 'RIGHT';
  x: number;
  yTop: number;
  yBottom: number;
  width: number;
}

export interface AimState {
  isAiming: boolean;
  coinId: string | null;
  startPos: Vector2D;
  currentPos: Vector2D;
  power: number; // 0 to 1
  angle: number; // radians
}

export interface MatchStats {
  goalsP1: number;
  goalsP2: number;
  shotsP1: number;
  shotsP2: number;
  passesCompleted: number;
  foulsP1: number;
  foulsP2: number;
  highestCombo: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  soundVolume: number;
  tableTheme: TableTheme;
  matchDurationSeconds: number;
  maxGoals: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}
