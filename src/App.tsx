import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameMode, Coin, Peg, TableTheme, MatchStats, Difficulty, ReplayData, ReplayFrame } from './types/game';
import {
  PITCH_WIDTH,
  PITCH_HEIGHT,
  WOOD_BORDER,
  GOAL_LEFT,
  GOAL_RIGHT,
  createRealCoin,
  createPegLayout,
  updatePhysics,
  lineSegmentsIntersect,
  distToSegment,
} from './services/physics';
import { computeCPUMove } from './services/ai';
import { sounds } from './services/soundEngine';
import { PitchCanvas } from './components/PitchCanvas';
import { GameHUD } from './components/GameHUD';
import { ModeSelectorModal } from './components/ModeSelectorModal';
import { MatchEndModal } from './components/MatchEndModal';
import { RulesHelpModal } from './components/RulesHelpModal';
import { ReplayOverlay } from './components/ReplayOverlay';
import { ManagerClub, PlayerCoin, OpponentClub, FormationType, ScoutOption } from './types/manager';
import {
  createInitialClub,
  createInitialSquad,
  createCustomSquadForClub,
  createInitialOpponents,
  createTransferMarketPool,
  generateScoutedPlayer,
  loadManagerSave,
  saveManagerGame,
  generateLogId,
} from './services/managerService';
import { ManagerHub } from './components/ManagerHub';
import { CreateTeamModal } from './components/CreateTeamModal';
import { AcademyTutorialModal } from './components/AcademyTutorialModal';

// Setup coins for Manager Career match
function initManagerCoins(
  squad: PlayerCoin[],
  opponent: OpponentClub,
  formation: FormationType
): Coin[] {
  const centerY = PITCH_HEIGHT / 2;
  const starters = squad.filter((p) => p.isStarter);
  const gkPlayer = starters.find((p) => p.position === 'GL') || starters[0] || squad[0];
  const fieldPlayers = starters.filter((p) => p.id !== gkPlayer.id).slice(0, 3);

  for (const candidate of squad) {
    if (fieldPlayers.length >= 3) break;
    if (candidate.id !== gkPlayer.id && !fieldPlayers.some((fp) => fp.id === candidate.id)) {
      fieldPlayers.push(candidate);
    }
  }

  // P1 Goalkeeper
  const p1GK: Coin = {
    ...createRealCoin('p1-gk', WOOD_BORDER + 35, centerY, gkPlayer.coinType, 'PLAYER', 'GL'),
    isGoalkeeper: true,
    radius: gkPlayer.coinType === 'REAL_50' ? 25 : 23,
    mass: 1.2 + (gkPlayer.attributes.weight / 100) * 0.45,
    colorOuter: gkPlayer.colors.outer,
    colorInner: gkPlayer.colors.inner,
    borderColor: gkPlayer.colors.border,
    highlightColor: gkPlayer.colors.highlight,
    label: `#${gkPlayer.number}`,
  };

  // Field player positions based on formation
  let positions = [
    { x: 260, y: centerY - 100 },
    { x: 360, y: centerY },
    { x: 260, y: centerY + 100 },
  ];

  if (formation === '1-1-2') {
    positions = [
      { x: 240, y: centerY },
      { x: 375, y: centerY - 95 },
      { x: 375, y: centerY + 95 },
    ];
  } else if (formation === '1-3-0') {
    positions = [
      { x: 250, y: centerY - 110 },
      { x: 250, y: centerY },
      { x: 250, y: centerY + 110 },
    ];
  } else if (formation === '1-0-3') {
    positions = [
      { x: 390, y: centerY - 105 },
      { x: 410, y: centerY },
      { x: 390, y: centerY + 105 },
    ];
  }

  const p1Coins: Coin[] = fieldPlayers.map((player, idx) => {
    const pos = positions[idx] || { x: 280, y: centerY + (idx - 1) * 80 };
    return {
      ...createRealCoin(`p1-${idx}`, pos.x, pos.y, player.coinType, 'PLAYER', `#${player.number}`),
      mass: 0.9 + (player.attributes.weight / 100) * 0.55,
      colorOuter: player.colors.outer,
      colorInner: player.colors.inner,
      borderColor: player.colors.border,
      highlightColor: player.colors.highlight,
    };
  });

  // Ball
  const ball: Coin = createRealCoin('ball', PITCH_WIDTH / 2, centerY, 'REAL_10', 'BALL', '⚽');

  // Opponent Coins
  const p2GK: Coin = {
    ...createRealCoin('p2-gk', PITCH_WIDTH - WOOD_BORDER - 35, centerY, 'REAL_50', 'OPPONENT', 'GL'),
    isGoalkeeper: true,
    colorOuter: opponent.primaryColor,
    colorInner: opponent.secondaryColor,
    borderColor: '#334155',
  };
  const p2Def: Coin = {
    ...createRealCoin('p2-1', PITCH_WIDTH - 260, centerY - 100, 'REAL_50', 'OPPONENT', '3'),
    colorOuter: opponent.primaryColor,
    colorInner: '#E2E8F0',
    borderColor: '#475569',
  };
  const p2Mid: Coin = {
    ...createRealCoin('p2-2', PITCH_WIDTH - 360, centerY, 'REAL_50', 'OPPONENT', '8'),
    colorOuter: opponent.primaryColor,
    colorInner: '#E2E8F0',
    borderColor: '#475569',
  };
  const p2Fwd: Coin = {
    ...createRealCoin('p2-3', PITCH_WIDTH - 260, centerY + 100, 'REAL_50', 'OPPONENT', '9'),
    colorOuter: opponent.primaryColor,
    colorInner: '#E2E8F0',
    borderColor: '#475569',
  };

  return [p1GK, ...p1Coins, ball, p2GK, p2Def, p2Mid, p2Fwd];
}

// Setup coins based on mode
function initCoins(mode: GameMode): Coin[] {
  const centerY = PITCH_HEIGHT / 2;

  if (mode === 'THREE_COINS') {
    // 3 iconic Brazilian coins for the classic school desk triangle
    return [
      createRealCoin('coin-1', 280, centerY - 65, 'REAL_1', 'PLAYER', '1'),
      createRealCoin('coin-2', 280, centerY + 65, 'REAL_50', 'PLAYER', '50'),
      createRealCoin('coin-3', 190, centerY, 'REAL_25', 'PLAYER', '25'),
    ];
  }

  if (mode === 'MATCH_1V1_CPU' || mode === 'MATCH_1V1_LOCAL') {
    // 1v1 Full pitch match: 3 field coins + 1 goalkeeper each + 1 ball coin
    const p1GK: Coin = {
      ...createRealCoin('p1-gk', WOOD_BORDER + 35, centerY, 'REAL_50', 'PLAYER', 'GL'),
      isGoalkeeper: true,
      colorOuter: '#F59E0B',
      colorInner: '#FEF08A',
      borderColor: '#B45309',
    };
    const p1Def: Coin = {
      ...createRealCoin('p1-1', 260, centerY - 100, 'REAL_1', 'PLAYER', '2'),
      colorOuter: '#D4AF37',
      colorInner: '#E2E8F0',
      borderColor: '#B45309',
    };
    const p1Mid: Coin = {
      ...createRealCoin('p1-2', 360, centerY, 'REAL_1', 'PLAYER', '10'),
      colorOuter: '#D4AF37',
      colorInner: '#E2E8F0',
      borderColor: '#B45309',
    };
    const p1Fwd: Coin = {
      ...createRealCoin('p1-3', 260, centerY + 100, 'REAL_1', 'PLAYER', '9'),
      colorOuter: '#D4AF37',
      colorInner: '#E2E8F0',
      borderColor: '#B45309',
    };

    // Ball
    const ball: Coin = createRealCoin('ball', PITCH_WIDTH / 2, centerY, 'REAL_10', 'BALL', '⚽');

    // Opponent (CPU or P2)
    const p2GK: Coin = {
      ...createRealCoin('p2-gk', PITCH_WIDTH - WOOD_BORDER - 35, centerY, 'REAL_50', 'OPPONENT', 'GL'),
      isGoalkeeper: true,
      colorOuter: '#94A3B8',
      colorInner: '#CBD5E1',
      borderColor: '#334155',
    };
    const p2Def: Coin = {
      ...createRealCoin('p2-1', PITCH_WIDTH - 260, centerY - 100, 'REAL_50', 'OPPONENT', '4'),
      colorOuter: '#94A3B8',
      colorInner: '#E2E8F0',
      borderColor: '#475569',
    };
    const p2Mid: Coin = {
      ...createRealCoin('p2-2', PITCH_WIDTH - 360, centerY, 'REAL_50', 'OPPONENT', '8'),
      colorOuter: '#94A3B8',
      colorInner: '#E2E8F0',
      borderColor: '#475569',
    };
    const p2Fwd: Coin = {
      ...createRealCoin('p2-3', PITCH_WIDTH - 260, centerY + 100, 'REAL_50', 'OPPONENT', '7'),
      colorOuter: '#94A3B8',
      colorInner: '#E2E8F0',
      borderColor: '#475569',
    };

    return [p1GK, p1Def, p1Mid, p1Fwd, ball, p2GK, p2Def, p2Mid, p2Fwd];
  }

  if (mode === 'PEGS_CHALLENGE') {
    // Pegs trick shot setup: Striker coin + Ball + GK defending
    const striker = createRealCoin('striker', 200, centerY, 'REAL_1', 'PLAYER', '1');
    const ball = createRealCoin('ball', 340, centerY, 'REAL_10', 'BALL', '⚽');
    const gk: Coin = {
      ...createRealCoin('gk', PITCH_WIDTH - WOOD_BORDER - 45, centerY, 'REAL_50', 'OPPONENT', 'GL'),
      isGoalkeeper: true,
      colorOuter: '#94A3B8',
      colorInner: '#E2E8F0',
      borderColor: '#334155',
    };
    return [striker, ball, gk];
  }

  return [];
}

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>('MANAGER_CAREER');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [tableTheme, setTableTheme] = useState<TableTheme>('SCHOOL_DESK');
  const [coins, setCoins] = useState<Coin[]>(() => initCoins('THREE_COINS'));
  const [pegs, setPegs] = useState<Peg[]>([]);

  // Manager Career System States
  const [managerClub, setManagerClub] = useState<ManagerClub>(() => {
    const saved = loadManagerSave();
    return saved ? saved.club : createInitialClub();
  });
  const [managerSquad, setManagerSquad] = useState<PlayerCoin[]>(() => {
    const saved = loadManagerSave();
    return saved ? saved.squad : createInitialSquad();
  });
  const [managerOpponents, setManagerOpponents] = useState<OpponentClub[]>(() => {
    const saved = loadManagerSave();
    return saved ? saved.opponents : createInitialOpponents();
  });
  const [managerMarket, setManagerMarket] = useState<PlayerCoin[]>(() => {
    const saved = loadManagerSave();
    return saved ? saved.market : createTransferMarketPool();
  });
  const [managerSubView, setManagerSubView] = useState<'HUB' | 'MATCH'>('HUB');
  const [managerLastReward, setManagerLastReward] = useState<{
    income: number;
    payroll: number;
    net: number;
    newBudget: number;
    pointsGained: number;
    onReturnToHub: () => void;
  } | null>(null);

  // Auto-save Manager Progress
  useEffect(() => {
    saveManagerGame(managerClub, managerSquad, managerOpponents, managerMarket);
  }, [managerClub, managerSquad, managerOpponents, managerMarket]);

  // Current opponent club for the scheduled matchday
  const currentOpponent =
    managerOpponents[(managerClub.matchday - 1) % managerOpponents.length] || managerOpponents[0];

  const [currentTurn, setCurrentTurn] = useState<'PLAYER' | 'OPPONENT'>('PLAYER');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [matchTime, setMatchTime] = useState<number>(180); // 3 minutes match

  const [stats, setStats] = useState<MatchStats>({
    goalsP1: 0,
    goalsP2: 0,
    shotsP1: 0,
    shotsP2: 0,
    passesCompleted: 0,
    foulsP1: 0,
    foulsP2: 0,
    highestCombo: 0,
  });

  const [statusMessage, setStatusMessage] = useState<string>('Puxe e solte uma moeda para chutar!');
  const [statusType, setStatusType] = useState<'INFO' | 'SUCCESS' | 'WARNING' | 'GOAL'>('INFO');
  const [lastGoalSide, setLastGoalSide] = useState<'LEFT' | 'RIGHT' | null>(null);

  // 3 Coins mode specific tracking
  const [combo3Coins, setCombo3Coins] = useState<number>(0);
  const [selected3CoinId, setSelected3CoinId] = useState<string | null>(null);
  const [canShootGoal3Coins, setCanShootGoal3Coins] = useState<boolean>(false);

  // Turn motion tracking & Replay recording
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const activeFlickRef = useRef<{
    coinId: string;
    startPos: { x: number; y: number };
    otherCoinsStart: { id: string; x: number; y: number }[];
    trajectory: { x: number; y: number }[];
    frameSnapshots: ReplayFrame[];
  } | null>(null);

  // Instant Replay States
  const [isReplayActive, setIsReplayActive] = useState<boolean>(false);
  const [lastReplayData, setLastReplayData] = useState<ReplayData | null>(null);
  const [replayFrameIndex, setReplayFrameIndex] = useState<number>(0);
  const [isReplayPlaying, setIsReplayPlaying] = useState<boolean>(true);
  const [replaySpeed, setReplaySpeed] = useState<number>(0.4); // 0.4x slow motion
  const [isReplayLooping, setIsReplayLooping] = useState<boolean>(true);

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isModeModalOpen, setIsModeModalOpen] = useState<boolean>(false);
  const [isMatchEndOpen, setIsMatchEndOpen] = useState<boolean>(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [winner, setWinner] = useState<'PLAYER' | 'OPPONENT' | 'DRAW'>('DRAW');
  const [manOfTheMatch, setManOfTheMatch] = useState<PlayerCoin | null>(null);

  // CPU move timer ref
  const cpuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sound sync
  useEffect(() => {
    sounds.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Pegs setup when mode changes
  useEffect(() => {
    if (gameMode === 'PEGS_CHALLENGE') {
      setPegs(createPegLayout());
    } else {
      setPegs([]);
    }
    resetBoard(gameMode);
  }, [gameMode]);

  const resetBoard = (mode: GameMode) => {
    if (mode === 'MANAGER_CAREER') {
      setCoins(initManagerCoins(managerSquad, currentOpponent, managerClub.formation));
    } else {
      setCoins(initCoins(mode));
    }
    setCurrentTurn('PLAYER');
    setIsMoving(false);
    activeFlickRef.current = null;
    setCombo3Coins(0);
    setCanShootGoal3Coins(false);
    setSelected3CoinId(null);
    setLastGoalSide(null);
    if (cpuTimeoutRef.current) clearTimeout(cpuTimeoutRef.current);

    if (mode === 'THREE_COINS') {
      setStatusMessage('Passe a moeda estritamente entre as outras duas!');
      setStatusType('INFO');
    } else if (mode === 'MANAGER_CAREER') {
      setStatusMessage(`Rodada ${managerClub.matchday}: ${managerClub.name} vs ${currentOpponent.name}!`);
      setStatusType('INFO');
    } else {
      setStatusMessage('Sua vez! Mire e chute no gol adversário.');
      setStatusType('INFO');
    }
  };

  const reinitMatchCoins = useCallback(() => {
    if (gameMode === 'MANAGER_CAREER') {
      return initManagerCoins(managerSquad, currentOpponent, managerClub.formation);
    }
    return initCoins(gameMode);
  }, [gameMode, managerSquad, currentOpponent, managerClub.formation]);

  // Manager Career Action Handlers
  const handleStartCareerMatch = () => {
    setManagerSubView('MATCH');
    setMatchTime(180);
    setStats({
      goalsP1: 0,
      goalsP2: 0,
      shotsP1: 0,
      shotsP2: 0,
      passesCompleted: 0,
      foulsP1: 0,
      foulsP2: 0,
      highestCombo: 0,
    });
    setCoins(initManagerCoins(managerSquad, currentOpponent, managerClub.formation));
    setCurrentTurn('PLAYER');
    setIsMoving(false);
    activeFlickRef.current = null;
    setLastGoalSide(null);
    setStatusMessage(`Partida iniciada! ${managerClub.name} vs ${currentOpponent.name}. Mire e chute!`);
    setStatusType('INFO');
    sounds.playWhistle(true);
  };

  const handleSimulateCareerMatch = () => {
    const starters = managerSquad.filter((p) => p.isStarter);
    const userTeamAvg =
      starters.length > 0
        ? starters.reduce((acc, p) => acc + p.overall, 0) / starters.length
        : 70;
    const oppAvg = currentOpponent.overall || 75;

    const diff = (userTeamAvg - oppAvg) / 10;
    const baseP1 = Math.max(0, Math.round(1.5 + diff + (Math.random() - 0.5) * 2));
    const baseP2 = Math.max(0, Math.round(1.4 - diff + (Math.random() - 0.5) * 2));

    const simStats: MatchStats = {
      goalsP1: baseP1,
      goalsP2: baseP2,
      shotsP1: baseP1 * 3 + Math.floor(Math.random() * 4),
      shotsP2: baseP2 * 3 + Math.floor(Math.random() * 4),
      passesCompleted: Math.floor(10 + Math.random() * 15),
      foulsP1: Math.floor(Math.random() * 3),
      foulsP2: Math.floor(Math.random() * 3),
      highestCombo: 0,
    };

    setStats(simStats);
    setManagerSubView('MATCH');

    const isPlayerWin = simStats.goalsP1 > simStats.goalsP2;
    const isOpponentWin = simStats.goalsP2 > simStats.goalsP1;
    const isDraw = simStats.goalsP1 === simStats.goalsP2;
    setWinner(isPlayerWin ? 'PLAYER' : isOpponentWin ? 'OPPONENT' : 'DRAW');

    const matchIncome = 90 + (isPlayerWin ? 130 : isDraw ? 50 : 15);
    const matchPayroll = starters.reduce((acc, p) => acc + p.salary, 0);
    const netRevenue = matchIncome - matchPayroll;
    const pts = isPlayerWin ? 3 : isDraw ? 1 : 0;
    const newBudget = Math.max(0, managerClub.budget + netRevenue);

    const newLogs: any[] = [];
    const addLog = (title: string, type: any) => {
      newLogs.push({
        id: generateLogId(),
        dateText: `Rodada ${managerClub.matchday}`,
        title,
        type,
      });
    };

    // Process injuries and recovery
    setManagerSquad((prevSquad) => {
      let updated = prevSquad.map((p) => {
        if (p.injuryMatchdaysRemaining && p.injuryMatchdaysRemaining > 0) {
          const rem = p.injuryMatchdaysRemaining - 1;
          if (rem <= 0) {
            addLog(`Recuperação: ${p.name} recuperou-se da lesão e já pode voltar a campo!`, 'SCOUT');
            return { ...p, injuryMatchdaysRemaining: undefined };
          }
          return { ...p, injuryMatchdaysRemaining: rem };
        }
        return p;
      });

      const healthy = updated.filter((p) => !p.injuryMatchdaysRemaining);
      if (healthy.length > 0 && Math.random() < 0.22) {
        const victim = healthy[Math.floor(Math.random() * healthy.length)];
        const duration = 2;
        addLog(`Departamento Médico: ${victim.name} sentiu dores musculares e desfalcará o time por ${duration} rodadas!`, 'MATCH');
        updated = updated.map((p) => (p.id === victim.id ? { ...p, injuryMatchdaysRemaining: duration, isStarter: false } : p));
      }

      // Ensure 4 starters
      const currentStarters = updated.filter((p) => p.isStarter);
      if (currentStarters.length < 4) {
        const subs = updated.filter((p) => !p.isStarter && !p.injuryMatchdaysRemaining);
        for (const sub of subs) {
          if (updated.filter((p) => p.isStarter).length < 4) {
            const target = updated.find((p) => p.id === sub.id);
            if (target) target.isStarter = true;
          }
        }
      }

      return updated;
    });

    setManagerLastReward({
      income: matchIncome,
      payroll: matchPayroll,
      net: netRevenue,
      newBudget,
      pointsGained: pts,
      onReturnToHub: () => {
        setIsMatchEndOpen(false);
        setManagerSubView('HUB');
        setMatchTime(180);
        setStats({
          goalsP1: 0,
          goalsP2: 0,
          shotsP1: 0,
          shotsP2: 0,
          passesCompleted: 0,
          foulsP1: 0,
          foulsP2: 0,
          highestCombo: 0,
        });
        resetBoard('MANAGER_CAREER');
      },
    });

    setManagerClub((prev) => {
      const nextMatchday = prev.matchday < prev.totalMatchdays ? prev.matchday + 1 : 1;
      const newSeason = prev.matchday >= prev.totalMatchdays ? prev.season + 1 : prev.season;
      return {
        ...prev,
        budget: newBudget,
        matchday: nextMatchday,
        season: newSeason,
        points: prev.points + pts,
        played: prev.played + 1,
        won: prev.won + (isPlayerWin ? 1 : 0),
        drawn: prev.drawn + (isDraw ? 1 : 0),
        lost: prev.lost + (isOpponentWin ? 1 : 0),
        goalsFor: prev.goalsFor + simStats.goalsP1,
        goalsAgainst: prev.goalsAgainst + simStats.goalsP2,
        historyLogs: [
          {
            id: generateLogId(),
            dateText: `Rodada ${prev.matchday} (Simulação)`,
            title: `${prev.name} ${simStats.goalsP1} × ${simStats.goalsP2} ${currentOpponent.name} (${netRevenue >= 0 ? '+' : ''}R$ ${netRevenue})`,
            type: 'MATCH',
          },
          ...newLogs,
          ...prev.historyLogs,
        ],
      };
    });

    setManagerOpponents((prev) =>
      prev.map((opp) => {
        if (opp.id === currentOpponent.id) {
          return {
            ...opp,
            played: opp.played + 1,
            won: opp.won + (isOpponentWin ? 1 : 0),
            drawn: opp.drawn + (isDraw ? 1 : 0),
            lost: opp.lost + (isPlayerWin ? 1 : 0),
            goalsFor: opp.goalsFor + simStats.goalsP2,
            goalsAgainst: opp.goalsAgainst + simStats.goalsP1,
            points: opp.points + (isOpponentWin ? 3 : isDraw ? 1 : 0),
          };
        }
        const goalsScored = Math.floor(Math.random() * 3);
        const goalsConceded = Math.floor(Math.random() * 3);
        const oppPts = goalsScored > goalsConceded ? 3 : goalsScored === goalsConceded ? 1 : 0;
        return {
          ...opp,
          played: opp.played + 1,
          won: opp.won + (goalsScored > goalsConceded ? 1 : 0),
          drawn: opp.drawn + (goalsScored === goalsConceded ? 1 : 0),
          lost: opp.lost + (goalsScored < goalsConceded ? 1 : 0),
          goalsFor: opp.goalsFor + goalsScored,
          goalsAgainst: opp.goalsAgainst + goalsConceded,
          points: opp.points + oppPts,
        };
      })
    );

    setIsMatchEndOpen(true);
    sounds.playWhistle(false);
  };

  const handleHirePlayer = (player: PlayerCoin) => {
    if (managerClub.budget < player.marketValue) return;

    setManagerClub((prev) => ({
      ...prev,
      budget: prev.budget - player.marketValue,
      historyLogs: [
        {
          id: generateLogId(),
          dateText: `Rodada ${prev.matchday}`,
          title: `Contratação: ${player.name} (#${player.number}) contratado por R$ ${player.marketValue}`,
          type: 'TRANSFER',
        },
        ...prev.historyLogs,
      ],
    }));

    setManagerSquad((prev) => [...prev, { ...player, isStarter: false }]);
    setManagerMarket((prev) => prev.filter((p) => p.id !== player.id));
  };

  const handleSellPlayer = (player: PlayerCoin) => {
    if (managerSquad.length <= 4) return;
    const saleValue = Math.round(player.marketValue * 0.7);

    setManagerClub((prev) => ({
      ...prev,
      budget: prev.budget + saleValue,
      historyLogs: [
        {
          id: generateLogId(),
          dateText: `Rodada ${prev.matchday}`,
          title: `Venda: ${player.name} (#${player.number}) transferido por +R$ ${saleValue}`,
          type: 'TRANSFER',
        },
        ...prev.historyLogs,
      ],
    }));

    setManagerSquad((prev) => {
      const remaining = prev.filter((p) => p.id !== player.id);
      const starters = remaining.filter((p) => p.isStarter);
      if (starters.length < 4) {
        const nextSub = remaining.find((p) => !p.isStarter);
        if (nextSub) nextSub.isStarter = true;
      }
      return [...remaining];
    });

    setManagerMarket((prev) => [{ ...player, isStarter: false }, ...prev]);
  };

  const handleToggleStarter = (playerId: string) => {
    setManagerSquad((prev) => {
      const target = prev.find((p) => p.id === playerId);
      if (!target) return prev;

      if (target.isStarter) {
        const startersCount = prev.filter((p) => p.isStarter).length;
        if (startersCount <= 4) return prev;
        return prev.map((p) => (p.id === playerId ? { ...p, isStarter: false } : p));
      } else {
        if (target.position === 'GL') {
          return prev.map((p) => {
            if (p.id === playerId) return { ...p, isStarter: true };
            if (p.position === 'GL' && p.isStarter) return { ...p, isStarter: false };
            return p;
          });
        }
        const fieldStarters = prev.filter((p) => p.isStarter && p.position !== 'GL');
        if (fieldStarters.length >= 3) {
          const swapOutId = fieldStarters[fieldStarters.length - 1].id;
          return prev.map((p) => {
            if (p.id === playerId) return { ...p, isStarter: true };
            if (p.id === swapOutId) return { ...p, isStarter: false };
            return p;
          });
        }
        return prev.map((p) => (p.id === playerId ? { ...p, isStarter: true } : p));
      }
    });
  };

  const handleChangeFormation = (formation: FormationType) => {
    setManagerClub((prev) => ({ ...prev, formation }));
    sounds.playCoinClink(0.8);
  };

  const handleScoutMission = (mission: ScoutOption) => {
    if (managerClub.budget < mission.cost) return;

    const scouted = generateScoutedPlayer(mission.minOverall, mission.maxOverall);

    setManagerClub((prev) => ({
      ...prev,
      budget: prev.budget - mission.cost,
      historyLogs: [
        {
          id: generateLogId(),
          dateText: `Rodada ${prev.matchday}`,
          title: `Olheiro: Moeda recrutada via "${mission.title}": ${scouted.name} (${scouted.overall} OVR)`,
          type: 'SCOUT',
        },
        ...prev.historyLogs,
      ],
    }));

    setManagerSquad((prev) => [...prev, scouted]);
  };

  const handleResetCareer = () => {
    const club = createInitialClub();
    const squad = createInitialSquad();
    const opponents = createInitialOpponents();
    const market = createTransferMarketPool();
    setManagerClub(club);
    setManagerSquad(squad);
    setManagerOpponents(opponents);
    setManagerMarket(market);
    saveManagerGame(club, squad, opponents, market);
    sounds.playCoinClink(1);
    setStatusMessage('Carreira reiniciada com sucesso! Você pode agora criar sua equipe e fazer o tutorial.');
    setStatusType('INFO');
  };

  const handleSaveClub = (updatedClub: Partial<ManagerClub>, startTutorial?: boolean) => {
    setManagerClub((prev) => {
      const merged = { ...prev, ...updatedClub };
      return {
        ...merged,
        historyLogs: [
          {
            id: generateLogId(),
            dateText: `Rodada ${prev.matchday}`,
            title: `Identidade atualizada: ${merged.name} (${merged.shortName}) gerido por ${merged.managerName}`,
            type: 'FINANCE',
          },
          ...prev.historyLogs,
        ],
      };
    });

    // Update squad coins colors if colors were changed
    if (updatedClub.primaryColor || updatedClub.secondaryColor) {
      const pColor = updatedClub.primaryColor || managerClub.primaryColor;
      const sColor = updatedClub.secondaryColor || managerClub.secondaryColor;
      setManagerSquad((prev) =>
        prev.map((player) => {
          if (player.position === 'GL') return player;
          return {
            ...player,
            colors: {
              ...player.colors,
              outer: pColor,
              inner: player.isStarter ? sColor : player.colors.inner,
            },
          };
        })
      );
    }

    setStatusMessage(`Clube "${updatedClub.name || managerClub.name}" atualizado com sucesso!`);
    setStatusType('SUCCESS');
    sounds.playCoinClink(0.9);

    if (startTutorial) {
      setIsTutorialOpen(true);
    }
  };

  const handleCompleteTutorial = (selectedStriker: {
    name: string;
    style: 'VELOZ' | 'MATADOR' | 'DRIBLADOR';
  }) => {
    // Generate starter squad customized with the chosen striker and club colors
    const freshSquad = createCustomSquadForClub(managerClub, selectedStriker);
    setManagerSquad(freshSquad);

    const bonusBudget = 300;
    setManagerClub((prev) => ({
      ...prev,
      budget: prev.budget + bonusBudget,
      tutorialCompleted: true,
      historyLogs: [
        {
          id: generateLogId(),
          dateText: 'Academia Concluída',
          title: `Formatura na Escolinha de Moedas! Camisa 9 "${selectedStriker.name}" recrutado + Bônus de R$ ${bonusBudget}!`,
          type: 'SCOUT',
        },
        ...prev.historyLogs,
      ],
    }));

    setStatusMessage(`🎓 Tutorial concluído! Seu camisa 9 "${selectedStriker.name}" e bônus de R$ 300 foram creditados!`);
    setStatusType('SUCCESS');
  };

  // Match Timer
  useEffect(() => {
    if (isPaused || isMatchEndOpen || gameMode === 'THREE_COINS' || (gameMode === 'MANAGER_CAREER' && managerSubView === 'HUB')) return;

    const timer = setInterval(() => {
      setMatchTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleMatchOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isMatchEndOpen, gameMode, managerSubView]);

  const handleMatchOver = () => {
    const isPlayerWin = stats.goalsP1 > stats.goalsP2;
    const isOpponentWin = stats.goalsP2 > stats.goalsP1;
    const isDraw = stats.goalsP1 === stats.goalsP2;

    const winnerResult: 'PLAYER' | 'OPPONENT' | 'DRAW' = isPlayerWin ? 'PLAYER' : isOpponentWin ? 'OPPONENT' : 'DRAW';
    setWinner(winnerResult);

    if (gameMode === 'MANAGER_CAREER') {
      const matchIncome = 90 + (isPlayerWin ? 130 : isDraw ? 50 : 15);
      const starters = managerSquad.filter((p) => p.isStarter);
      const matchPayroll = starters.reduce((acc, p) => acc + p.salary, 0);
      const netRevenue = matchIncome - matchPayroll;
      const pts = isPlayerWin ? 3 : isDraw ? 1 : 0;
      const newBudget = Math.max(0, managerClub.budget + netRevenue);

      setManagerLastReward({
        income: matchIncome,
        payroll: matchPayroll,
        net: netRevenue,
        newBudget,
        pointsGained: pts,
        onReturnToHub: () => {
          setIsMatchEndOpen(false);
          setManOfTheMatch(null);
          setManagerSubView('HUB');
          setMatchTime(180);
          setStats({
            goalsP1: 0,
            goalsP2: 0,
            shotsP1: 0,
            shotsP2: 0,
            passesCompleted: 0,
            foulsP1: 0,
            foulsP2: 0,
            highestCombo: 0,
          });
          resetBoard('MANAGER_CAREER');
        },
      });

      const newLogs: any[] = [];
      const addLog = (title: string, type: any) => {
        newLogs.push({
          id: generateLogId(),
          dateText: `Rodada ${managerClub.matchday}`,
          title,
          type,
        });
      };

      setManagerSquad((prevSquad) => {
        let updated = prevSquad.map((p) => {
          let ovr = p.overall;
          if (p.hasTemporaryOvrBonus) {
            ovr = Math.max(50, ovr - 1);
          }
          let rem = p.injuryMatchdaysRemaining;
          if (rem && rem > 0) {
            const nextRem = rem - 1;
            if (nextRem <= 0) {
              addLog(`Recuperação: ${p.name} recuperou-se da lesão e já pode voltar a campo!`, 'SCOUT');
              return { ...p, overall: ovr, injuryMatchdaysRemaining: undefined, hasTemporaryOvrBonus: false };
            }
            return { ...p, overall: ovr, injuryMatchdaysRemaining: nextRem, hasTemporaryOvrBonus: false };
          }
          return { ...p, overall: ovr, hasTemporaryOvrBonus: false };
        });

        const healthy = updated.filter((p) => !p.injuryMatchdaysRemaining);
        if (healthy.length > 0 && Math.random() < 0.22) {
          const victim = healthy[Math.floor(Math.random() * healthy.length)];
          const duration = 2;
          addLog(`Departamento Médico: ${victim.name} sentiu dores musculares e desfalcará o time por ${duration} rodadas!`, 'MATCH');
          updated = updated.map((p) => (p.id === victim.id ? { ...p, injuryMatchdaysRemaining: duration, isStarter: false } : p));
        }

        const currentStarters = updated.filter((p) => p.isStarter);
        if (currentStarters.length < 4) {
          const subs = updated.filter((p) => !p.isStarter && !p.injuryMatchdaysRemaining);
          for (const sub of subs) {
            if (updated.filter((p) => p.isStarter).length < 4) {
              const target = updated.find((p) => p.id === sub.id);
              if (target) target.isStarter = true;
            }
          }
        }

        // Select Man of the Match (MOTM) from healthy players
        const availableForMotm = updated.filter((p) => !p.injuryMatchdaysRemaining);
        if (availableForMotm.length > 0) {
          const motm = availableForMotm[Math.floor(Math.random() * availableForMotm.length)];
          setManOfTheMatch(motm);
          addLog(`Craque da Partida: ${motm.name} foi eleito o Jogador da Partida e ganhou +1 OVR para o próximo jogo!`, 'SCOUT');
          updated = updated.map((p) =>
            p.id === motm.id
              ? { ...p, hasTemporaryOvrBonus: true, overall: Math.min(99, p.overall + 1) }
              : p
          );
        }

        // Push OVR history for each player
        const currentMd = managerClub.matchday;
        updated = updated.map((p) => {
          const existingHistory = p.ovrHistory || [];
          return {
            ...p,
            ovrHistory: [...existingHistory, { matchday: currentMd, ovr: p.overall }],
          };
        });

        return updated;
      });

      // Update club standings
      setManagerClub((prev) => {
        const nextMatchday = prev.matchday < prev.totalMatchdays ? prev.matchday + 1 : 1;
        const newSeason = prev.matchday >= prev.totalMatchdays ? prev.season + 1 : prev.season;
        return {
          ...prev,
          budget: newBudget,
          matchday: nextMatchday,
          season: newSeason,
          points: prev.points + pts,
          played: prev.played + 1,
          won: prev.won + (isPlayerWin ? 1 : 0),
          drawn: prev.drawn + (isDraw ? 1 : 0),
          lost: prev.lost + (isOpponentWin ? 1 : 0),
          goalsFor: prev.goalsFor + stats.goalsP1,
          goalsAgainst: prev.goalsAgainst + stats.goalsP2,
          historyLogs: [
            {
              id: generateLogId(),
              dateText: `Rodada ${prev.matchday}`,
              title: `${prev.name} ${stats.goalsP1} × ${stats.goalsP2} ${currentOpponent.name} (${netRevenue >= 0 ? '+' : ''}R$ ${netRevenue})`,
              type: 'MATCH',
            },
            ...newLogs,
            ...prev.historyLogs,
          ],
        };
      });

      // Update opponents
      setManagerOpponents((prev) =>
        prev.map((opp) => {
          if (opp.id === currentOpponent.id) {
            return {
              ...opp,
              played: opp.played + 1,
              won: opp.won + (isOpponentWin ? 1 : 0),
              drawn: opp.drawn + (isDraw ? 1 : 0),
              lost: opp.lost + (isPlayerWin ? 1 : 0),
              goalsFor: opp.goalsFor + stats.goalsP2,
              goalsAgainst: opp.goalsAgainst + stats.goalsP1,
              points: opp.points + (isOpponentWin ? 3 : isDraw ? 1 : 0),
            };
          }
          const goalsScored = Math.floor(Math.random() * 3);
          const goalsConceded = Math.floor(Math.random() * 3);
          const oppPts = goalsScored > goalsConceded ? 3 : goalsScored === goalsConceded ? 1 : 0;
          return {
            ...opp,
            played: opp.played + 1,
            won: opp.won + (goalsScored > goalsConceded ? 1 : 0),
            drawn: opp.drawn + (goalsScored === goalsConceded ? 1 : 0),
            lost: opp.lost + (goalsScored < goalsConceded ? 1 : 0),
            goalsFor: opp.goalsFor + goalsScored,
            goalsAgainst: opp.goalsAgainst + goalsConceded,
            points: opp.points + oppPts,
          };
        })
      );
    } else {
      setManagerLastReward(null);
    }

    setIsMatchEndOpen(true);
    sounds.playWhistle(false);
  };

  // Physics animation loop
  useEffect(() => {
    if (isPaused || isReplayActive) return;

    let animId: number;

    const tick = () => {
      setCoins((prevCoins) => {
        const anyMoving = prevCoins.some((c) => !c.resting);

        if (anyMoving) {
          // Record trajectory and frame snapshot for instant replay
          if (activeFlickRef.current) {
            const active = prevCoins.find((c) => c.id === activeFlickRef.current?.coinId);
            if (active) {
              activeFlickRef.current.trajectory.push({ x: active.x, y: active.y });
            }
            activeFlickRef.current.frameSnapshots.push({
              coins: prevCoins.map((c) => ({
                id: c.id,
                x: c.x,
                y: c.y,
                vx: c.vx,
                vy: c.vy,
                resting: c.resting,
              })),
              activeCoinPos: active ? { x: active.x, y: active.y } : undefined,
            });
          }

          // Step physics
          const result = updatePhysics(prevCoins, pegs, 4);

          // Goal check
          if (result.goalScored && !lastGoalSide) {
            handleGoalScored(result.goalScored, prevCoins);
          }

          // Check if coins have stopped moving this frame
          const stillMoving = prevCoins.some((c) => !c.resting);
          if (!stillMoving && isMoving) {
            setIsMoving(false);
            onTurnCompleted(prevCoins, result.hadCollisions, result.collidedWithCoins);
          }

          return [...prevCoins];
        }

        return prevCoins;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isMoving, isReplayActive, pegs, gameMode, lastGoalSide]);

  // Handle Goal Scored & Trigger Instant Replay
  const handleGoalScored = (side: 'LEFT' | 'RIGHT', currentCoins: Coin[]) => {
    sounds.playGoalCelebration();
    setLastGoalSide(side);

    if (side === 'RIGHT') {
      // Goal for Player 1 into Opponent's goal!
      setStats((s) => ({ ...s, goalsP1: s.goalsP1 + 1 }));
      setStatusMessage('GOLAAÇO DO JOGADOR 1! ⚽🔥');
      setStatusType('GOAL');
    } else {
      // Goal for Opponent into Player 1's goal!
      setStats((s) => ({ ...s, goalsP2: s.goalsP2 + 1 }));
      setStatusMessage(gameMode === 'MATCH_1V1_CPU' ? 'Gol do Computador!' : 'Gol do Jogador 2!');
      setStatusType('WARNING');
    }

    // Capture the replay frames and trajectory from activeFlickRef
    const capturedFlick = activeFlickRef.current;
    let capturedReplay: ReplayData | null = null;
    if (capturedFlick && capturedFlick.frameSnapshots.length > 3) {
      capturedReplay = {
        goalSide: side,
        scorer: side === 'RIGHT' ? 'PLAYER' : 'OPPONENT',
        coinId: capturedFlick.coinId,
        frames: [...capturedFlick.frameSnapshots],
        trajectory: [...capturedFlick.trajectory],
      };
      setLastReplayData(capturedReplay);
    }

    // Transition to Slow Motion Instant Replay after celebration burst
    setTimeout(() => {
      if (capturedReplay && capturedReplay.frames.length > 2) {
        startInstantReplay(capturedReplay);
      } else {
        setLastGoalSide(null);
        setCoins(reinitMatchCoins());
        setCanShootGoal3Coins(false);
      }
    }, 1500);
  };

  const startInstantReplay = (replay: ReplayData) => {
    setLastReplayData(replay);
    setReplayFrameIndex(0);
    setIsReplayPlaying(true);
    setReplaySpeed(0.4); // Slow motion default
    setIsReplayLooping(true);
    setIsReplayActive(true);
    setStatusMessage('CÂMERA LENTA · REPLAY OFICIAL DO GOL 📹');
    setStatusType('GOAL');
  };

  const exitReplay = () => {
    setIsReplayActive(false);
    setLastGoalSide(null);
    setCoins(reinitMatchCoins());
    setCanShootGoal3Coins(false);
    setStatusMessage('Bola ao centro! Partida reiniciada.');
    setStatusType('INFO');
  };

  // Instant Replay Playback Timer Loop
  useEffect(() => {
    if (!isReplayActive || !isReplayPlaying || !lastReplayData) return;

    let animId: number;
    let lastTime = performance.now();
    let accumulatedMs = 0;

    const stepReplay = (now: number) => {
      const elapsed = Math.min(100, now - lastTime);
      lastTime = now;
      accumulatedMs += elapsed;

      // Frame interval for slow motion (e.g. 16.66ms / 0.4 = 41.6ms)
      const frameDuration = (1000 / 60) / replaySpeed;

      if (accumulatedMs >= frameDuration) {
        const framesToAdvance = Math.floor(accumulatedMs / frameDuration);
        accumulatedMs %= frameDuration;

        setReplayFrameIndex((prevIndex) => {
          const next = prevIndex + framesToAdvance;
          const max = lastReplayData.frames.length - 1;
          if (next >= max) {
            if (isReplayLooping) {
              return 0;
            } else {
              setIsReplayPlaying(false);
              return max;
            }
          }
          return next;
        });
      }

      animId = requestAnimationFrame(stepReplay);
    };

    animId = requestAnimationFrame(stepReplay);
    return () => cancelAnimationFrame(animId);
  }, [isReplayActive, isReplayPlaying, replaySpeed, isReplayLooping, lastReplayData]);

  // Turn completion evaluation
  const onTurnCompleted = (
    finalCoins: Coin[],
    hadCollisions: boolean,
    collidedCoins: string[]
  ) => {
    if (lastGoalSide !== null || isReplayActive) {
      return;
    }

    if (gameMode === 'THREE_COINS' && activeFlickRef.current) {
      evaluateThreeCoinsTurn(finalCoins, hadCollisions, collidedCoins);
    } else if (gameMode === 'MATCH_1V1_CPU' || gameMode === 'MANAGER_CAREER') {
      // If it was Player's turn, now CPU turn
      if (currentTurn === 'PLAYER') {
        setCurrentTurn('OPPONENT');
        setStatusMessage(
          gameMode === 'MANAGER_CAREER'
            ? `Vez do adversário (${currentOpponent.name}) pensando na jogada...`
            : 'Vez do Computador pensando na jogada...'
        );
        setStatusType('INFO');

        cpuTimeoutRef.current = setTimeout(() => {
          triggerCPUTurn();
        }, 850);
      } else {
        // CPU finished turn, back to player
        setCurrentTurn('PLAYER');
        setStatusMessage(
          gameMode === 'MANAGER_CAREER'
            ? `Sua vez! Chute com seus craques do ${managerClub.name}.`
            : 'Sua vez! Puxe e mire com o mouse.'
        );
        setStatusType('INFO');
      }
    } else if (gameMode === 'MATCH_1V1_LOCAL') {
      // Alternate players
      const nextTurn = currentTurn === 'PLAYER' ? 'OPPONENT' : 'PLAYER';
      setCurrentTurn(nextTurn);
      setStatusMessage(
        nextTurn === 'PLAYER' ? 'Vez do Jogador 1 (Ouro)' : 'Vez do Jogador 2 (Prata)'
      );
      setStatusType('INFO');
    }

    activeFlickRef.current = null;
  };

  // 3-Coin Authentic Brazilian Rule Evaluation
  const evaluateThreeCoinsTurn = (
    finalCoins: Coin[],
    hadCollisions: boolean,
    collidedCoins: string[]
  ) => {
    const flickInfo = activeFlickRef.current;
    if (!flickInfo || flickInfo.otherCoinsStart.length !== 2) return;

    const [otherA, otherB] = flickInfo.otherCoinsStart;
    const movingCoin = finalCoins.find((c) => c.id === flickInfo.coinId);
    if (!movingCoin) return;

    // Check if the moving coin touched any other coin
    const touchedOther = collidedCoins.some((id) => id === otherA.id || id === otherB.id);

    if (touchedOther) {
      // FOUL! Touched another coin
      sounds.playFoulBuzzer();
      setCombo3Coins(0);
      setStats((s) => ({ ...s, foulsP1: s.foulsP1 + 1 }));
      setStatusMessage('Falta! A moeda esbarrou em outra moeda!');
      setStatusType('WARNING');
      return;
    }

    // Check if the trajectory intersected the gate between otherA and otherB
    const gateStart = { x: otherA.x, y: otherA.y };
    const gateEnd = { x: otherB.x, y: otherB.y };

    let passedThroughGate = false;
    const traj = flickInfo.trajectory;

    for (let i = 0; i < traj.length - 1; i++) {
      const stepStart = traj[i];
      const stepEnd = traj[i + 1];

      const inter = lineSegmentsIntersect(stepStart, stepEnd, gateStart, gateEnd);
      if (inter.intersects && inter.point) {
        // Verify it was inside the gap (not on top of either coin center)
        const d1 = Math.hypot(inter.point.x - otherA.x, inter.point.y - otherA.y);
        const d2 = Math.hypot(inter.point.x - otherB.x, inter.point.y - otherB.y);
        if (d1 > 15 && d2 > 15) {
          passedThroughGate = true;
          break;
        }
      }
    }

    // Check if shooting into goal past the attack line
    const isPastMidfield = movingCoin.x > PITCH_WIDTH * 0.52;
    if (isPastMidfield) {
      setCanShootGoal3Coins(true);
    }

    if (passedThroughGate) {
      // Valid Pass!
      sounds.playCoinClink(0.8);
      const newCombo = combo3Coins + 1;
      setCombo3Coins(newCombo);
      setStats((s) => ({
        ...s,
        passesCompleted: s.passesCompleted + 1,
        highestCombo: Math.max(s.highestCombo, newCombo),
      }));

      if (isPastMidfield) {
        setStatusMessage(`Passe Perfeito! (${newCombo}x) Chute a gol liberado!`);
        setStatusType('SUCCESS');
      } else {
        setStatusMessage(`Passe Válido! (${newCombo}x) Continue avançando!`);
        setStatusType('SUCCESS');
      }
    } else {
      // Missed the gate
      sounds.playFoulBuzzer();
      setCombo3Coins(0);
      setStats((s) => ({ ...s, foulsP1: s.foulsP1 + 1 }));
      setStatusMessage('Não passou pelo meio das duas moedas! Tente novamente.');
      setStatusType('WARNING');
    }
  };

  // CPU Turn Execution
  const triggerCPUTurn = () => {
    setCoins((currentCoins) => {
      const cpuMove = computeCPUMove(currentCoins, GOAL_LEFT, difficulty);
      if (cpuMove) {
        sounds.playFlickWhoosh(cpuMove.power);

        const movingCoin = currentCoins.find((c) => c.id === cpuMove.coinId);
        const otherCoins = currentCoins
          .filter((c) => c.id !== cpuMove.coinId)
          .map((c) => ({ id: c.id, x: c.x, y: c.y }));

        activeFlickRef.current = {
          coinId: cpuMove.coinId,
          startPos: { x: movingCoin?.x ?? 0, y: movingCoin?.y ?? 0 },
          otherCoinsStart: otherCoins,
          trajectory: [{ x: movingCoin?.x ?? 0, y: movingCoin?.y ?? 0 }],
          frameSnapshots: [
            {
              coins: currentCoins.map((c) => ({
                id: c.id,
                x: c.x,
                y: c.y,
                vx: c.id === cpuMove.coinId ? cpuMove.vx : 0,
                vy: c.id === cpuMove.coinId ? cpuMove.vy : 0,
                resting: c.id !== cpuMove.coinId,
              })),
              activeCoinPos: { x: movingCoin?.x ?? 0, y: movingCoin?.y ?? 0 },
            },
          ],
        };

        const updated = currentCoins.map((c) => {
          if (c.id === cpuMove.coinId) {
            return {
              ...c,
              vx: cpuMove.vx,
              vy: cpuMove.vy,
              resting: false,
            };
          }
          return c;
        });

        setIsMoving(true);
        setStats((s) => ({ ...s, shotsP2: s.shotsP2 + 1 }));
        return updated;
      } else {
        // Fallback to player turn if CPU can't move
        setCurrentTurn('PLAYER');
        return currentCoins;
      }
    });
  };

  // User Flick Action
  const handleCoinFlick = (coinId: string, vx: number, vy: number) => {
    const coin = coins.find((c) => c.id === coinId);
    if (!coin) return;

    // Track initial positions for 3-Coin mode gate validation
    const otherCoins = coins
      .filter((c) => c.id !== coinId)
      .map((c) => ({ id: c.id, x: c.x, y: c.y }));

    activeFlickRef.current = {
      coinId,
      startPos: { x: coin.x, y: coin.y },
      otherCoinsStart: otherCoins,
      trajectory: [{ x: coin.x, y: coin.y }],
      frameSnapshots: [
        {
          coins: coins.map((c) => ({
            id: c.id,
            x: c.x,
            y: c.y,
            vx: c.id === coinId ? vx : 0,
            vy: c.id === coinId ? vy : 0,
            resting: c.id !== coinId,
          })),
          activeCoinPos: { x: coin.x, y: coin.y },
        },
      ],
    };

    setCoins((prev) =>
      prev.map((c) => (c.id === coinId ? { ...c, vx, vy, resting: false } : c))
    );

    setIsMoving(true);

    if (currentTurn === 'PLAYER') {
      setStats((s) => ({ ...s, shotsP1: s.shotsP1 + 1 }));
    } else {
      setStats((s) => ({ ...s, shotsP2: s.shotsP2 + 1 }));
    }
  };

  // Keyboard controls (R, M, P, Space, Esc)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (isReplayActive) {
        if (e.code === 'Space') {
          e.preventDefault();
          setIsReplayPlaying((prev) => !prev);
          return;
        }
        if (e.key === 'Escape') {
          exitReplay();
          return;
        }
      }

      if (e.key === 'r' || e.key === 'R') {
        resetBoard(gameMode);
      } else if (e.key === 'm' || e.key === 'M') {
        setSoundEnabled((prev) => !prev);
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPaused((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameMode, isReplayActive]);

  // Derived display coins for current frame (normal play vs instant replay)
  const displayCoins =
    isReplayActive && lastReplayData && lastReplayData.frames[replayFrameIndex]
      ? coins.map((c) => {
          const frameCoin = lastReplayData.frames[replayFrameIndex].coins.find((fc) => fc.id === c.id);
          if (frameCoin) {
            return {
              ...c,
              x: frameCoin.x,
              y: frameCoin.y,
              vx: frameCoin.vx,
              vy: frameCoin.vy,
              resting: frameCoin.resting,
            };
          }
          return c;
        })
      : coins;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. Header / HUD */}
      <GameHUD
        gameMode={gameMode}
        difficulty={difficulty}
        currentTurn={currentTurn}
        matchTimeSeconds={matchTime}
        stats={stats}
        soundEnabled={soundEnabled}
        isPaused={isPaused}
        message={statusMessage}
        messageType={statusType}
        combo3Coins={combo3Coins}
        canShootGoal3Coins={canShootGoal3Coins}
        hasReplay={!!lastReplayData}
        onSelectMode={(mode) => {
          setGameMode(mode);
          if (mode === 'MANAGER_CAREER') {
            setManagerSubView('HUB');
          }
          resetBoard(mode);
        }}
        onToggleSound={() => setSoundEnabled((s) => !s)}
        onResetMatch={() => resetBoard(gameMode)}
        onTogglePause={() => setIsPaused((p) => !p)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenModeModal={() => setIsModeModalOpen(true)}
        onTriggerReplay={() => {
          if (lastReplayData) {
            startInstantReplay(lastReplayData);
          }
        }}
      />

      {/* 2. Main Pitch Canvas Arena OR Manager Hub */}
      {gameMode === 'MANAGER_CAREER' && managerSubView === 'HUB' ? (
        <main className="flex-1 w-full max-w-[1440px] mx-auto py-4">
          <ManagerHub
            club={managerClub}
            squad={managerSquad}
            opponents={managerOpponents}
            market={managerMarket}
            nextOpponent={currentOpponent}
            onStartMatch={handleStartCareerMatch}
            onSimulateMatch={handleSimulateCareerMatch}
            onHirePlayer={handleHirePlayer}
            onSellPlayer={handleSellPlayer}
            onToggleStarter={handleToggleStarter}
            onChangeFormation={handleChangeFormation}
            onScoutMission={handleScoutMission}
            onResetCareer={handleResetCareer}
            onBackToCasual={() => {
              setGameMode('THREE_COINS');
              resetBoard('THREE_COINS');
            }}
            onOpenCreateTeam={() => setIsCreateTeamOpen(true)}
            onOpenTutorial={() => setIsTutorialOpen(true)}
            onImportSave={(saveData) => {
              setManagerClub(saveData.club);
              setManagerSquad(saveData.squad);
              setManagerOpponents(saveData.opponents);
              setManagerMarket(saveData.market);
            }}
          />
        </main>
      ) : (
        <main className="flex-1 flex flex-col items-center justify-center p-2 md:p-6 w-full max-w-[1440px] mx-auto">
          {/* Match header bar if playing in Manager Career */}
          {gameMode === 'MANAGER_CAREER' && managerSubView === 'MATCH' && (
            <div className="w-full max-w-[1100px] mb-3 flex items-center justify-between bg-neutral-900/90 border border-neutral-800 px-4 py-2.5 rounded-xl">
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: managerClub.primaryColor, color: '#000' }}
                >
                  {managerClub.shortName}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Rodada {managerClub.matchday}: {managerClub.name} vs {currentOpponent.name}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Tática: {managerClub.formation} · {managerClub.divisionName}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setManagerSubView('HUB');
                    resetBoard('MANAGER_CAREER');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
                >
                  Voltar ao Escritório / Hub
                </button>
                <button
                  onClick={handleSimulateCareerMatch}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Simular Restante
                </button>
              </div>
            </div>
          )}

          <PitchCanvas
            coins={displayCoins}
            pegs={pegs}
            gameMode={gameMode}
            currentTurn={currentTurn}
            activeCoinId={isReplayActive ? null : activeFlickRef.current?.coinId || null}
            onCoinFlick={handleCoinFlick}
            tableTheme={tableTheme}
            isPaused={isPaused}
            canFlick={!isMoving && !isReplayActive && ((gameMode !== 'MATCH_1V1_CPU' && gameMode !== 'MANAGER_CAREER') || currentTurn === 'PLAYER')}
            lastGoalSide={lastGoalSide}
            selected3CoinId={selected3CoinId}
            onSelectCoin={(id) => setSelected3CoinId(id)}
            isReplay={isReplayActive}
            replayTrajectory={lastReplayData?.trajectory || []}
          >
            {isReplayActive && lastReplayData && (
              <ReplayOverlay
                replayData={lastReplayData}
                currentFrame={replayFrameIndex}
                totalFrames={lastReplayData.frames.length}
                isPlaying={isReplayPlaying}
                playbackSpeed={replaySpeed}
                isLooping={isReplayLooping}
                onTogglePlay={() => setIsReplayPlaying((prev) => !prev)}
                onSeek={(frame) => {
                  setReplayFrameIndex(frame);
                  setIsReplayPlaying(false);
                }}
                onChangeSpeed={(spd) => setReplaySpeed(spd)}
                onToggleLoop={() => setIsReplayLooping((l) => !l)}
                onCloseReplay={exitReplay}
              />
            )}
          </PitchCanvas>

          {/* Clean unboxed footer guidance for PC controls */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-500 text-center">
            {isReplayActive ? (
              <>
                <span className="text-amber-400 font-semibold">● Modo Instant Replay em Câmera Lenta</span>
                <span aria-hidden="true">·</span>
                <span>Espaço: Pausar/Play</span>
                <span aria-hidden="true">·</span>
                <span>Arraste o slider para rebobinar</span>
                <span aria-hidden="true">·</span>
                <span>Esc: Continuar Jogo</span>
              </>
            ) : (
              <>
                <span>Clique e arraste a moeda para mirar</span>
                <span aria-hidden="true">·</span>
                <span>Solte para chutar</span>
                <span aria-hidden="true">·</span>
                <span>Espaço cancela mira</span>
                <span aria-hidden="true">·</span>
                <span>R: Reiniciar</span>
                <span aria-hidden="true">·</span>
                <span>M: Som</span>
              </>
            )}
          </div>
        </main>
      )}

      {/* 3. Modals */}
      <RulesHelpModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      <ModeSelectorModal
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
        currentMode={gameMode}
        currentTheme={tableTheme}
        difficulty={difficulty}
        onSelectMode={(mode) => {
          setGameMode(mode);
          if (mode === 'MANAGER_CAREER') {
            setManagerSubView('HUB');
          }
          resetBoard(mode);
        }}
        onSelectTheme={(theme) => setTableTheme(theme)}
        onSelectDifficulty={(diff) => setDifficulty(diff)}
        onOpenCreateTeam={() => {
          setIsModeModalOpen(false);
          setIsCreateTeamOpen(true);
        }}
        onOpenTutorial={() => {
          setIsModeModalOpen(false);
          setIsTutorialOpen(true);
        }}
      />

      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        currentClub={managerClub}
        onSaveClub={handleSaveClub}
      />

      <AcademyTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        club={managerClub}
        onCompleteTutorial={handleCompleteTutorial}
      />

      <MatchEndModal
        isOpen={isMatchEndOpen}
        winner={winner}
        gameMode={gameMode}
        stats={stats}
        managerReward={managerLastReward || undefined}
        manOfTheMatch={manOfTheMatch}
        onPlayAgain={() => {
          setIsMatchEndOpen(false);
          setManOfTheMatch(null);
          setMatchTime(180);
          setStats({
            goalsP1: 0,
            goalsP2: 0,
            shotsP1: 0,
            shotsP2: 0,
            passesCompleted: 0,
            foulsP1: 0,
            foulsP2: 0,
            highestCombo: 0,
          });
          resetBoard(gameMode);
        }}
      />
    </div>
  );
}
