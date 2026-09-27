import { Coin, Difficulty, Goal, Vector2D } from '../types/game';
import { PITCH_WIDTH, PITCH_HEIGHT, WOOD_BORDER, lineSegmentsIntersect } from './physics';

export interface AIShotDecision {
  coinId: string;
  vx: number;
  vy: number;
  power: number;
}

export function computeCPUMove(
  coins: Coin[],
  targetGoal: Goal, // The goal CPU wants to score into (usually GOAL_LEFT for player's goal)
  difficulty: Difficulty = 'MEDIUM'
): AIShotDecision | null {
  const cpuCoins = coins.filter((c) => c.team === 'OPPONENT');
  const ball = coins.find((c) => c.team === 'BALL');

  if (cpuCoins.length === 0 || !ball) return null;

  let bestCoin: Coin | null = null;
  let bestScore = -Infinity;
  let chosenDir: Vector2D = { x: 0, y: 0 };
  let chosenPower = 0.7;

  // Difficulty configurations for precision and force:
  // EASY: high angular error (low precision), gentle/subdued power
  // MEDIUM: moderate angular noise, balanced power
  // HARD: surgical pinpoint accuracy aiming at open corners, maximum force & speed
  let noiseScale = 0.16;
  let maxSpeed = 24;
  let powerScale = 0.85;
  let minPower = 0.40;
  let maxPower = 0.85;

  if (difficulty === 'EASY') {
    noiseScale = 0.38;       // Low precision: wide angle deviation
    maxSpeed = 19;           // Slower impulse
    powerScale = 0.65;       // Weaker kicks
    minPower = 0.30;
    maxPower = 0.68;
  } else if (difficulty === 'HARD') {
    noiseScale = 0.02;       // Surgical precision: almost zero error
    maxSpeed = 28;           // Maximum physical speed
    powerScale = 1.05;       // Powerful, decisive kicks
    minPower = 0.55;
    maxPower = 1.0;
  }

  // Determine target point on goal mouth
  // Hard AI dynamically aims at the corner furthest from goalkeeper
  let targetY = (targetGoal.yTop + targetGoal.yBottom) / 2;
  if (difficulty === 'HARD') {
    const playerGK = coins.find((c) => c.team === 'PLAYER' && c.isGoalkeeper);
    if (playerGK) {
      // Aim away from player's goalkeeper
      if (playerGK.y < (targetGoal.yTop + targetGoal.yBottom) / 2) {
        targetY = targetGoal.yBottom - 24; // Aim low corner
      } else {
        targetY = targetGoal.yTop + 24;    // Aim high corner
      }
    }
  } else if (difficulty === 'EASY') {
    // Slight random deviation in target goal point
    targetY += (Math.random() - 0.5) * 45;
  }

  const goalCenter: Vector2D = {
    x: targetGoal.x,
    y: targetY,
  };

  for (const coin of cpuCoins) {
    // Distance to ball
    const distToBall = Math.hypot(ball.x - coin.x, ball.y - coin.y);

    // Vector from ball to goal center
    const b2gX = goalCenter.x - ball.x;
    const b2gY = goalCenter.y - ball.y;
    const b2gLen = Math.hypot(b2gX, b2gY) || 1;
    const normB2GX = b2gX / b2gLen;
    const normB2GY = b2gY / b2gLen;

    // Ideal strike position: behind the ball opposite to goal
    const idealStrikeOffset = (ball.radius + coin.radius);
    const idealStrikePos: Vector2D = {
      x: ball.x - normB2GX * idealStrikeOffset,
      y: ball.y - normB2GY * idealStrikeOffset,
    };

    // Vector from coin to ideal strike position
    const c2sX = idealStrikePos.x - coin.x;
    const c2sY = idealStrikePos.y - coin.y;
    const c2sDist = Math.hypot(c2sX, c2sY);

    // Alignment factor: is the coin behind the ball relative to goal?
    const c2bX = ball.x - coin.x;
    const c2bY = ball.y - coin.y;
    const c2bLen = Math.hypot(c2bX, c2bY) || 1;
    const normC2BX = c2bX / c2bLen;
    const normC2BY = c2bY / c2bLen;

    const alignment = normC2BX * normB2GX + normC2BY * normB2GY;

    // Goalkeeper penalty (prefer field coins over goalkeeper unless necessary)
    const gkPenalty = coin.isGoalkeeper ? -150 : 0;

    // Score calculation
    let score = alignment * 250 - distToBall * 0.8 + gkPenalty;

    // In EASY mode, introduce random evaluation jitter so it occasionally picks a suboptimal coin
    if (difficulty === 'EASY') {
      score += (Math.random() - 0.5) * 80;
    }

    // Check if path to ball is blocked by another coin
    let pathBlocked = false;
    for (const other of coins) {
      if (other.id === coin.id || other.id === ball.id) continue;
      const d = Math.hypot(other.x - coin.x, other.y - coin.y);
      if (d < distToBall) {
        const proj = ((other.x - coin.x) * c2bX + (other.y - coin.y) * c2bY) / (c2bLen * c2bLen);
        if (proj > 0 && proj < 1) {
          const perpX = coin.x + proj * c2bX - other.x;
          const perpY = coin.y + proj * c2bY - other.y;
          if (Math.hypot(perpX, perpY) < coin.radius + other.radius) {
            pathBlocked = true;
            break;
          }
        }
      }
    }

    if (pathBlocked) score -= 200;

    if (score > bestScore) {
      bestScore = score;
      bestCoin = coin;

      // Calculate shot direction directly at the ball or through it
      // Add angle offset/noise according to difficulty
      const angleNoise = (Math.random() - 0.5) * noiseScale;
      const baseAngle = Math.atan2(c2bY, c2bX) + angleNoise;

      chosenDir = {
        x: Math.cos(baseAngle),
        y: Math.sin(baseAngle),
      };

      // Power needed: distance to ball + extra for kick, modulated by difficulty
      const rawPower = (distToBall + 220) / 700 * powerScale;
      chosenPower = Math.min(maxPower, Math.max(minPower, rawPower));
    }
  }

  if (!bestCoin) return null;

  const speed = chosenPower * maxSpeed;

  return {
    coinId: bestCoin.id,
    vx: chosenDir.x * speed,
    vy: chosenDir.y * speed,
    power: chosenPower,
  };
}
