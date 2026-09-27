import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Coin, Peg, AimState, GameMode, TableTheme, Vector2D } from '../types/game';
import {
  PITCH_WIDTH,
  PITCH_HEIGHT,
  WOOD_BORDER,
  GOAL_LEFT,
  GOAL_RIGHT,
  lineSegmentsIntersect,
  distToSegment,
} from '../services/physics';
import { sounds } from '../services/soundEngine';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  vy: number;
}

interface PitchCanvasProps {
  coins: Coin[];
  pegs: Peg[];
  gameMode: GameMode;
  currentTurn: 'PLAYER' | 'OPPONENT';
  activeCoinId: string | null;
  onCoinFlick: (coinId: string, vx: number, vy: number) => void;
  tableTheme: TableTheme;
  isPaused: boolean;
  canFlick: boolean;
  lastGoalSide: 'LEFT' | 'RIGHT' | null;
  selected3CoinId: string | null;
  onSelectCoin?: (coinId: string) => void;
  isReplay?: boolean;
  replayTrajectory?: { x: number; y: number }[];
  children?: React.ReactNode;
}

export const PitchCanvas: React.FC<PitchCanvasProps> = ({
  coins,
  pegs,
  gameMode,
  currentTurn,
  activeCoinId,
  onCoinFlick,
  tableTheme,
  isPaused,
  canFlick,
  lastGoalSide,
  selected3CoinId,
  onSelectCoin,
  isReplay = false,
  replayTrajectory = [],
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [aimState, setAimState] = useState<AimState>({
    isAiming: false,
    coinId: null,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    power: 0,
    angle: 0,
  });

  const [hoveredCoinId, setHoveredCoinId] = useState<string | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const woodTextureRef = useRef<HTMLImageElement | null>(null);

  // Load pitch wood texture
  useEffect(() => {
    const img = new Image();
    img.src = '/src/assets/images/tabletop_pitch_wood_1790474454514.jpg';
    img.onload = () => {
      woodTextureRef.current = img;
    };
  }, []);

  // Goal celebration particles
  useEffect(() => {
    if (lastGoalSide) {
      const goalX = lastGoalSide === 'RIGHT' ? PITCH_WIDTH - WOOD_BORDER : WOOD_BORDER;
      const goalY = PITCH_HEIGHT / 2;
      const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899', '#FBBF24', '#FFFFFF'];

      for (let i = 0; i < 90; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 8;
        particlesRef.current.push({
          x: goalX + (Math.random() - 0.5) * 40,
          y: goalY + (Math.random() - 0.5) * 80,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 5,
          life: 0,
          maxLife: 60 + Math.random() * 40,
        });
      }

      floatingTextsRef.current.push({
        id: Math.random().toString(),
        text: 'GOLAAAAÇO!',
        x: PITCH_WIDTH / 2,
        y: PITCH_HEIGHT / 2 - 40,
        color: '#FBBF24',
        alpha: 1,
        vy: -1.2,
      });
    }
  }, [lastGoalSide]);

  // Convert mouse/touch screen event coordinates to canvas space (1100 x 650)
  const getCanvasCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent): Vector2D | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = PITCH_WIDTH / rect.width;
    const scaleY = PITCH_HEIGHT / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // Find clickable coin
  const findEligibleCoinAt = useCallback(
    (pos: Vector2D): Coin | null => {
      if (!canFlick) return null;

      for (const coin of coins) {
        // Can only flick resting coins
        if (!coin.resting) continue;

        // In 3-Coin Mode, all 3 coins are playable by the active player
        if (gameMode === 'THREE_COINS') {
          const dist = Math.hypot(coin.x - pos.x, coin.y - pos.y);
          if (dist <= coin.radius + 8) {
            return coin;
          }
        } else if (gameMode === 'MATCH_1V1_CPU' || gameMode === 'MATCH_1V1_LOCAL') {
          // In 1v1, player can only flick their team coins (not the ball)
          const validTeam = currentTurn;
          if (coin.team === validTeam) {
            const dist = Math.hypot(coin.x - pos.x, coin.y - pos.y);
            if (dist <= coin.radius + 8) {
              return coin;
            }
          }
        } else if (gameMode === 'PEGS_CHALLENGE') {
          if (coin.team === 'PLAYER') {
            const dist = Math.hypot(coin.x - pos.x, coin.y - pos.y);
            if (dist <= coin.radius + 8) {
              return coin;
            }
          }
        }
      }
      return null;
    },
    [coins, canFlick, gameMode, currentTurn]
  );

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPaused || !canFlick || isReplay) return;
    const pos = getCanvasCoordinates(e);
    if (!pos) return;

    const coin = findEligibleCoinAt(pos);
    if (coin) {
      sounds.playCoinClink(0.2);
      if (onSelectCoin) onSelectCoin(coin.id);

      setAimState({
        isAiming: true,
        coinId: coin.id,
        startPos: { x: coin.x, y: coin.y },
        currentPos: pos,
        power: 0,
        angle: 0,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getCanvasCoordinates(e);
    if (!pos) return;

    // Check hover
    const hovered = findEligibleCoinAt(pos);
    setHoveredCoinId(hovered ? hovered.id : null);

    if (!aimState.isAiming || !aimState.coinId) return;

    // Slingshot logic: dragging away pulls back the coin
    const dx = aimState.startPos.x - pos.x;
    const dy = aimState.startPos.y - pos.y;
    const dragDist = Math.hypot(dx, dy);

    // Max drag limit ~160px
    const maxDrag = 160;
    const power = Math.min(1, dragDist / maxDrag);
    const angle = Math.atan2(dy, dx);

    setAimState((prev) => ({
      ...prev,
      currentPos: pos,
      power,
      angle,
    }));
  };

  const handleMouseUp = () => {
    if (!aimState.isAiming || !aimState.coinId) return;

    if (aimState.power > 0.04) {
      // Max impulse speed ~26 px/frame
      const maxSpeed = 26;
      const speed = aimState.power * maxSpeed;
      const vx = Math.cos(aimState.angle) * speed;
      const vy = Math.sin(aimState.angle) * speed;

      sounds.playFlickWhoosh(aimState.power);
      onCoinFlick(aimState.coinId, vx, vy);
    }

    setAimState({
      isAiming: false,
      coinId: null,
      startPos: { x: 0, y: 0 },
      currentPos: { x: 0, y: 0 },
      power: 0,
      angle: 0,
    });
  };

  // Keyboard shortcut listener (Space to cancel aim)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setAimState({
          isAiming: false,
          coinId: null,
          startPos: { x: 0, y: 0 },
          currentPos: { x: 0, y: 0 },
          power: 0,
          angle: 0,
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // 1. Draw Field Background
      drawField(ctx, tableTheme, woodTextureRef.current);

      // Replay Trajectory Trail
      if (isReplay && replayTrajectory && replayTrajectory.length > 1) {
        drawReplayTrail(ctx, replayTrajectory);
      }

      // 2. Draw 3-Coin Gate Line if in 3-Moedas mode
      if (gameMode === 'THREE_COINS') {
        drawThreeCoinGate(ctx, coins, aimState.coinId || selected3CoinId);
      }

      // 3. Draw Pegs / Nails (if any)
      drawPegs(ctx, pegs);

      // 4. Draw Trajectory Line & Prediction if aiming
      if (aimState.isAiming && aimState.coinId) {
        drawTrajectoryGuide(ctx, aimState, coins);
      }

      // 5. Draw Coins
      drawCoins(ctx, coins, aimState, hoveredCoinId, currentTurn, gameMode);

      // 6. Draw Particles
      drawParticles(ctx, particlesRef.current);

      // 7. Draw Floating Texts
      drawFloatingTexts(ctx, floatingTextsRef.current);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [coins, pegs, aimState, hoveredCoinId, tableTheme, gameMode, currentTurn, selected3CoinId, isReplay, replayTrajectory]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[1100px] mx-auto select-none rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-950/80 bg-neutral-950 flex items-center justify-center aspect-[1100/650]"
    >
      <canvas
        ref={canvasRef}
        width={PITCH_WIDTH}
        height={PITCH_HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-full block ${
          isReplay
            ? 'cursor-default'
            : aimState.isAiming
            ? 'cursor-grabbing'
            : hoveredCoinId
            ? 'cursor-grab'
            : 'cursor-crosshair'
        }`}
      />

      {/* Aiming power HUD overlay badge */}
      {aimState.isAiming && (
        <div
          className="absolute pointer-events-none px-3 py-1 rounded bg-black/80 backdrop-blur border border-amber-400/50 text-amber-300 font-mono text-xs font-semibold tabular-nums shadow-lg"
          style={{
            left: `${((aimState.startPos.x) / PITCH_WIDTH) * 100}%`,
            top: `${((aimState.startPos.y - 45) / PITCH_HEIGHT) * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          FORÇA: {Math.round(aimState.power * 100)}%
        </div>
      )}

      {/* Children overlay (e.g. ReplayOverlay) */}
      {children}
    </div>
  );
};

// ---------------------------------------------------------
// CANVAS DRAWING HELPERS
// ---------------------------------------------------------

function drawField(ctx: CanvasRenderingContext2D, theme: TableTheme, woodImg: HTMLImageElement | null) {
  // Wood Border Frame
  if (woodImg && woodImg.complete && woodImg.naturalWidth > 0) {
    ctx.drawImage(woodImg, 0, 0, PITCH_WIDTH, PITCH_HEIGHT);
  } else {
    // Rich mahogany fallback
    const woodGrad = ctx.createLinearGradient(0, 0, 0, PITCH_HEIGHT);
    woodGrad.addColorStop(0, '#2D1B11');
    woodGrad.addColorStop(0.5, '#452A1C');
    woodGrad.addColorStop(1, '#1E120A');
    ctx.fillStyle = woodGrad;
    ctx.fillRect(0, 0, PITCH_WIDTH, PITCH_HEIGHT);
  }

  // Inner Pitch Canvas (Green felt or School Desk)
  const pitchX = WOOD_BORDER;
  const pitchY = WOOD_BORDER;
  const pitchW = PITCH_WIDTH - WOOD_BORDER * 2;
  const pitchH = PITCH_HEIGHT - WOOD_BORDER * 2;

  // Inner table surface
  if (theme === 'SCHOOL_DESK') {
    // Vintage green classroom desk fórmica
    const deskGrad = ctx.createLinearGradient(pitchX, pitchY, pitchX + pitchW, pitchY + pitchH);
    deskGrad.addColorStop(0, '#0F382A');
    deskGrad.addColorStop(0.5, '#164E3A');
    deskGrad.addColorStop(1, '#0C2D22');
    ctx.fillStyle = deskGrad;
    ctx.fillRect(pitchX, pitchY, pitchW, pitchH);

    // Subtle chalk desk grain
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    for (let i = 0; i < pitchW; i += 32) {
      ctx.fillRect(pitchX + i, pitchY, 16, pitchH);
    }
  } else if (theme === 'PRO_FELT') {
    // Emerald green mown felt
    const feltGrad = ctx.createRadialGradient(
      PITCH_WIDTH / 2,
      PITCH_HEIGHT / 2,
      50,
      PITCH_WIDTH / 2,
      PITCH_HEIGHT / 2,
      pitchW / 1.5
    );
    feltGrad.addColorStop(0, '#065F46');
    feltGrad.addColorStop(1, '#022C22');
    ctx.fillStyle = feltGrad;
    ctx.fillRect(pitchX, pitchY, pitchW, pitchH);

    // Mown grass strips
    const stripeCount = 14;
    const stripeW = pitchW / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
        ctx.fillRect(pitchX + i * stripeW, pitchY, stripeW, pitchH);
      }
    }
  } else {
    // Noble varnished wood
    const nobleGrad = ctx.createLinearGradient(pitchX, pitchY, pitchX, pitchY + pitchH);
    nobleGrad.addColorStop(0, '#3F2010');
    nobleGrad.addColorStop(0.5, '#5C3119');
    nobleGrad.addColorStop(1, '#2E150A');
    ctx.fillStyle = nobleGrad;
    ctx.fillRect(pitchX, pitchY, pitchW, pitchH);
  }

  // Inner shadow along cushions
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.lineWidth = 6;
  ctx.strokeRect(pitchX, pitchY, pitchW, pitchH);
  ctx.restore();

  // Draw Soccer Pitch Markings (Crisp chalk white lines)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 2.5;

  // Boundary
  ctx.strokeRect(pitchX, pitchY, pitchW, pitchH);

  // Halfway Line
  const midX = PITCH_WIDTH / 2;
  ctx.beginPath();
  ctx.moveTo(midX, pitchY);
  ctx.lineTo(midX, pitchY + pitchH);
  ctx.stroke();

  // Center Circle & Spot
  ctx.beginPath();
  ctx.arc(midX, PITCH_HEIGHT / 2, 75, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(midX, PITCH_HEIGHT / 2, 4, 0, Math.PI * 2);
  ctx.fill();

  // Penalty Boxes (Grandes áreas)
  const boxW = 140;
  const boxH = 260;
  const boxY = (PITCH_HEIGHT - boxH) / 2;

  // Left Box
  ctx.strokeRect(pitchX, boxY, boxW, boxH);
  // Left Small Box
  ctx.strokeRect(pitchX, (PITCH_HEIGHT - 120) / 2, 50, 120);
  // Left Penalty Spot
  ctx.beginPath();
  ctx.arc(pitchX + 90, PITCH_HEIGHT / 2, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Left Penalty Arc
  ctx.beginPath();
  ctx.arc(pitchX + 90, PITCH_HEIGHT / 2, 45, -Math.PI / 3, Math.PI / 3);
  ctx.stroke();

  // Right Box
  ctx.strokeRect(pitchX + pitchW - boxW, boxY, boxW, boxH);
  // Right Small Box
  ctx.strokeRect(pitchX + pitchW - 50, (PITCH_HEIGHT - 120) / 2, 50, 120);
  // Right Penalty Spot
  ctx.beginPath();
  ctx.arc(pitchX + pitchW - 90, PITCH_HEIGHT / 2, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Right Penalty Arc
  ctx.beginPath();
  ctx.arc(pitchX + pitchW - 90, PITCH_HEIGHT / 2, 45, (2 * Math.PI) / 3, (4 * Math.PI) / 3);
  ctx.stroke();

  // Corner Arcs
  const cornerR = 18;
  // Top-left
  ctx.beginPath();
  ctx.arc(pitchX, pitchY, cornerR, 0, Math.PI / 2);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.arc(pitchX, pitchY + pitchH, cornerR, -Math.PI / 2, 0);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.arc(pitchX + pitchW, pitchY, cornerR, Math.PI / 2, Math.PI);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.arc(pitchX + pitchW, pitchY + pitchH, cornerR, Math.PI, -Math.PI / 2);
  ctx.stroke();

  ctx.restore();

  // Draw Goals (Mouth, Post & Netting)
  drawGoal(ctx, GOAL_LEFT);
  drawGoal(ctx, GOAL_RIGHT);
}

function drawGoal(ctx: CanvasRenderingContext2D, goal: typeof GOAL_LEFT) {
  const isLeft = goal.side === 'LEFT';
  const netX = isLeft ? goal.x - goal.width : goal.x;
  const netW = goal.width;
  const netH = goal.yBottom - goal.yTop;

  ctx.save();

  // Goal net dark backing
  ctx.fillStyle = 'rgba(10, 15, 20, 0.75)';
  ctx.fillRect(netX, goal.yTop, netW, netH);

  // Net grid lines (diamond pattern)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 1;

  for (let x = netX; x <= netX + netW; x += 10) {
    ctx.beginPath();
    ctx.moveTo(x, goal.yTop);
    ctx.lineTo(x, goal.yBottom);
    ctx.stroke();
  }
  for (let y = goal.yTop; y <= goal.yBottom; y += 10) {
    ctx.beginPath();
    ctx.moveTo(netX, y);
    ctx.lineTo(netX + netW, y);
    ctx.stroke();
  }

  // Cylindrical metallic Goal Posts
  const postGrad = ctx.createLinearGradient(goal.x - 4, 0, goal.x + 4, 0);
  postGrad.addColorStop(0, '#E2E8F0');
  postGrad.addColorStop(0.5, '#FFFFFF');
  postGrad.addColorStop(1, '#94A3B8');

  ctx.fillStyle = postGrad;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 4;

  // Top Post
  ctx.beginPath();
  ctx.arc(goal.x, goal.yTop, 6, 0, Math.PI * 2);
  ctx.fill();

  // Bottom Post
  ctx.beginPath();
  ctx.arc(goal.x, goal.yBottom, 6, 0, Math.PI * 2);
  ctx.fill();

  // Goal line between posts
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(goal.x, goal.yTop);
  ctx.lineTo(goal.x, goal.yBottom);
  ctx.stroke();

  ctx.restore();
}

function drawThreeCoinGate(
  ctx: CanvasRenderingContext2D,
  coins: Coin[],
  selectedId: string | null
) {
  // If we have 3 coins, find the 2 non-selected coins
  if (coins.length !== 3) return;

  const targetCoins = selectedId
    ? coins.filter((c) => c.id !== selectedId)
    : coins.slice(1);

  if (targetCoins.length === 2) {
    const [c1, c2] = targetCoins;

    ctx.save();
    // Glowing Gate Line between the other two coins
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 6]);
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.stroke();

    // Center gate beacon
    const midX = (c1.x + c2.x) / 2;
    const midY = (c1.y + c2.y) / 2;

    ctx.setLineDash([]);
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(midX, midY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Subtle text hint: "PORTAL"
    ctx.font = '600 10px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
    ctx.textAlign = 'center';
    ctx.fillText('PASSE AQUI', midX, midY - 10);

    ctx.restore();
  }
}

function drawPegs(ctx: CanvasRenderingContext2D, pegs: Peg[]) {
  pegs.forEach((peg) => {
    ctx.save();
    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    // Brass Pin Head
    const grad = ctx.createRadialGradient(
      peg.x - 1.5,
      peg.y - 1.5,
      1,
      peg.x,
      peg.y,
      peg.radius
    );
    grad.addColorStop(0, '#FEF08A');
    grad.addColorStop(0.5, '#F59E0B');
    grad.addColorStop(1, '#78350F');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  });
}

function drawTrajectoryGuide(
  ctx: CanvasRenderingContext2D,
  aim: AimState,
  coins: Coin[]
) {
  const selectedCoin = coins.find((c) => c.id === aim.coinId);
  if (!selectedCoin) return;

  const maxSpeed = 26;
  const speed = aim.power * maxSpeed;
  const dirX = Math.cos(aim.angle);
  const dirY = Math.sin(aim.angle);

  // Guide length proportional to power
  const lineLength = 50 + aim.power * 240;

  ctx.save();

  // Color from emerald (low) to yellow (med) to red (high power)
  let guideColor = '#10B981';
  if (aim.power > 0.4) guideColor = '#F59E0B';
  if (aim.power > 0.75) guideColor = '#EF4444';

  ctx.strokeStyle = guideColor;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 5]);
  ctx.shadowColor = guideColor;
  ctx.shadowBlur = 8;

  const startX = selectedCoin.x;
  const startY = selectedCoin.y;
  let endX = startX + dirX * lineLength;
  let endY = startY + dirY * lineLength;

  // Simple bank bounce preview if ray hits top/bottom cushion
  const minY = WOOD_BORDER + selectedCoin.radius;
  const maxY = PITCH_HEIGHT - WOOD_BORDER - selectedCoin.radius;

  if (endY < minY && dirY < 0) {
    const t = (minY - startY) / dirY;
    const hitX = startX + dirX * t;
    const hitY = minY;

    // Draw segment to wall
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(hitX, hitY);
    ctx.stroke();

    // Reflected segment
    const remaining = lineLength - t;
    const reflectEndX = hitX + dirX * remaining;
    const reflectEndY = hitY - dirY * remaining;

    ctx.beginPath();
    ctx.moveTo(hitX, hitY);
    ctx.lineTo(reflectEndX, reflectEndY);
    ctx.stroke();
  } else if (endY > maxY && dirY > 0) {
    const t = (maxY - startY) / dirY;
    const hitX = startX + dirX * t;
    const hitY = maxY;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(hitX, hitY);
    ctx.stroke();

    const remaining = lineLength - t;
    const reflectEndX = hitX + dirX * remaining;
    const reflectEndY = hitY - dirY * remaining;

    ctx.beginPath();
    ctx.moveTo(hitX, hitY);
    ctx.lineTo(reflectEndX, reflectEndY);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  // Draw aim arrowhead at end
  ctx.setLineDash([]);
  ctx.fillStyle = guideColor;
  ctx.beginPath();
  ctx.arc(endX, endY, 5, 0, Math.PI * 2);
  ctx.fill();

  // Draw pull-back line (slingshot band)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(selectedCoin.x, selectedCoin.y);
  ctx.lineTo(aim.currentPos.x, aim.currentPos.y);
  ctx.stroke();

  ctx.restore();
}

function drawCoins(
  ctx: CanvasRenderingContext2D,
  coins: Coin[],
  aim: AimState,
  hoveredId: string | null,
  currentTurn: 'PLAYER' | 'OPPONENT',
  gameMode: GameMode
) {
  coins.forEach((coin) => {
    ctx.save();

    const isAimingThis = aim.isAiming && aim.coinId === coin.id;
    const isHovered = hoveredId === coin.id;

    // Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = isAimingThis ? 14 : 7;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = isAimingThis ? 6 : 4;

    // Outer Edge / Rim
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
    ctx.fillStyle = coin.colorOuter;
    ctx.fill();

    // Clear shadow for crisp inner details
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Outer Rim Border
    ctx.lineWidth = 2;
    ctx.strokeStyle = coin.borderColor;
    ctx.stroke();

    // Embossed serrated coin ticks
    const tickCount = 18;
    ctx.strokeStyle = coin.borderColor;
    ctx.lineWidth = 1;
    for (let i = 0; i < tickCount; i++) {
      const angle = (i * 2 * Math.PI) / tickCount;
      const rInner = coin.radius - 3.5;
      const rOuter = coin.radius - 0.5;
      ctx.beginPath();
      ctx.moveTo(coin.x + Math.cos(angle) * rInner, coin.y + Math.sin(angle) * rInner);
      ctx.lineTo(coin.x + Math.cos(angle) * rOuter, coin.y + Math.sin(angle) * rOuter);
      ctx.stroke();
    }

    // Inner Metallic Center (e.g. bimetallic 1 Real or Team Insignia)
    const innerRadius = coin.radius * 0.68;
    const innerGrad = ctx.createRadialGradient(
      coin.x - innerRadius * 0.35,
      coin.y - innerRadius * 0.35,
      1,
      coin.x,
      coin.y,
      innerRadius
    );
    innerGrad.addColorStop(0, coin.highlightColor);
    innerGrad.addColorStop(0.7, coin.colorInner);
    innerGrad.addColorStop(1, coin.borderColor);

    ctx.beginPath();
    ctx.arc(coin.x, coin.y, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = innerGrad;
    ctx.fill();

    ctx.strokeStyle = coin.borderColor;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Center Label / Number / Soccer Ball
    if (coin.label) {
      ctx.font = coin.team === 'BALL' ? '14px sans-serif' : 'bold 13px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Coin relief shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillText(coin.label, coin.x + 1, coin.y + 1);

      // Foreground text
      ctx.fillStyle = coin.team === 'BALL' ? '#000000' : '#1E293B';
      ctx.fillText(coin.label, coin.x, coin.y);
    }

    // Active Turn Pulse Ring or Hover Indicator
    const canFlickThis =
      (gameMode === 'THREE_COINS') ||
      (coin.team === currentTurn);

    if (canFlickThis && (isHovered || isAimingThis)) {
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = isAimingThis ? '#F59E0B' : '#10B981';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    ctx.restore();
  });
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08; // gravity
    p.vx *= 0.98;
    p.life++;

    const alpha = 1 - p.life / p.maxLife;
    if (alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    t.y += t.vy;
    t.alpha -= 0.015;

    if (t.alpha <= 0) {
      texts.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = t.alpha;
    ctx.font = '800 24px Cinzel, serif';
    ctx.fillStyle = t.color;
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10;
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  }
}

function drawReplayTrail(ctx: CanvasRenderingContext2D, trail: { x: number; y: number }[]) {
  if (trail.length < 2) return;
  ctx.save();

  // Glowing trajectory line
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3;
  ctx.setLineDash([7, 5]);
  ctx.shadowColor = '#F59E0B';
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.moveTo(trail[0].x, trail[0].y);
  for (let i = 1; i < trail.length; i++) {
    ctx.lineTo(trail[i].x, trail[i].y);
  }
  ctx.stroke();

  // Start point
  ctx.setLineDash([]);
  ctx.fillStyle = '#10B981';
  ctx.shadowColor = '#10B981';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(trail[0].x, trail[0].y, 5, 0, Math.PI * 2);
  ctx.fill();

  // Target/Goal end point
  const last = trail[trail.length - 1];
  ctx.fillStyle = '#EF4444';
  ctx.shadowColor = '#EF4444';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(last.x, last.y, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
