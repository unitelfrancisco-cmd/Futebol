import { Coin, Peg, Goal, Vector2D, CoinType } from '../types/game';
import { sounds } from './soundEngine';

export const PITCH_WIDTH = 1100;
export const PITCH_HEIGHT = 650;
export const WOOD_BORDER = 36;
export const GOAL_WIDTH = 55;
export const GOAL_HEIGHT = 160;

export const GOAL_LEFT: Goal = {
  side: 'LEFT',
  x: WOOD_BORDER,
  yTop: (PITCH_HEIGHT - GOAL_HEIGHT) / 2,
  yBottom: (PITCH_HEIGHT + GOAL_HEIGHT) / 2,
  width: GOAL_WIDTH,
};

export const GOAL_RIGHT: Goal = {
  side: 'RIGHT',
  x: PITCH_WIDTH - WOOD_BORDER,
  yTop: (PITCH_HEIGHT - GOAL_HEIGHT) / 2,
  yBottom: (PITCH_HEIGHT + GOAL_HEIGHT) / 2,
  width: GOAL_WIDTH,
};

export function createRealCoin(id: string, x: number, y: number, type: CoinType, team?: 'PLAYER' | 'OPPONENT' | 'BALL' | 'NEUTRAL', label?: string): Coin {
  switch (type) {
    case 'REAL_1':
      return {
        id,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 24,
        mass: 1.3,
        type,
        team,
        label: label || '1',
        colorOuter: '#D4AF37', // Gold ring
        colorInner: '#E2E8F0', // Stainless steel center
        borderColor: '#B45309',
        highlightColor: '#FEF08A',
        resting: true,
      };
    case 'REAL_50':
      return {
        id,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 22,
        mass: 1.15,
        type,
        team,
        label: label || '50',
        colorOuter: '#CBD5E1', // Silver
        colorInner: '#94A3B8',
        borderColor: '#475569',
        highlightColor: '#FFFFFF',
        resting: true,
      };
    case 'REAL_25':
      return {
        id,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 23,
        mass: 1.2,
        type,
        team,
        label: label || '25',
        colorOuter: '#F59E0B',
        colorInner: '#D97706',
        borderColor: '#92400E',
        highlightColor: '#FDE68A',
        resting: true,
      };
    case 'GOLD':
      return {
        id,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 25,
        mass: 1.4,
        type,
        team,
        label: label || '★',
        colorOuter: '#EAB308',
        colorInner: '#FEF08A',
        borderColor: '#713F12',
        highlightColor: '#FFFFFF',
        resting: true,
      };
    case 'SILVER':
      return {
        id,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 23,
        mass: 1.25,
        type,
        team,
        label: label || '◆',
        colorOuter: '#E2E8F0',
        colorInner: '#CBD5E1',
        borderColor: '#475569',
        highlightColor: '#FFFFFF',
        resting: true,
      };
    case 'REAL_10':
    default:
      return {
        id,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 17,
        mass: 0.7,
        type: 'REAL_10',
        team: team || 'BALL',
        label: label || '⚽',
        colorOuter: '#B45309', // Copper / Bronze or mini soccer ball
        colorInner: '#F8FAFC',
        borderColor: '#78350F',
        highlightColor: '#FDE68A',
        resting: true,
      };
  }
}

// Check intersection of segment AB and segment CD
export function lineSegmentsIntersect(a: Vector2D, b: Vector2D, c: Vector2D, d: Vector2D): { intersects: boolean; point?: Vector2D; t?: number } {
  const dx1 = b.x - a.x;
  const dy1 = b.y - a.y;
  const dx2 = d.x - c.x;
  const dy2 = d.y - c.y;

  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < 1e-6) return { intersects: false };

  const s = ((c.x - a.x) * dy2 - (c.y - a.y) * dx2) / denom;
  const t = ((c.x - a.x) * dy1 - (c.y - a.y) * dx1) / denom;

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    return {
      intersects: true,
      point: { x: a.x + s * dx1, y: a.y + s * dy1 },
      t,
    };
  }
  return { intersects: false };
}

// Distance from point to line segment
export function distToSegment(p: Vector2D, v: Vector2D, w: Vector2D): number {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

export interface PhysicsStepResult {
  goalScored: 'LEFT' | 'RIGHT' | null;
  hadCollisions: boolean;
  collidedWithCoins: string[];
}

export function updatePhysics(
  coins: Coin[],
  pegs: Peg[],
  subSteps: number = 4
): PhysicsStepResult {
  const friction = 0.984; // Per frame air and felt drag
  const subFriction = Math.pow(friction, 1 / subSteps);
  let goalScored: 'LEFT' | 'RIGHT' | null = null;
  let hadCollisions = false;
  const collidedWithCoins: string[] = [];

  const minX = WOOD_BORDER;
  const maxX = PITCH_WIDTH - WOOD_BORDER;
  const minY = WOOD_BORDER;
  const maxY = PITCH_HEIGHT - WOOD_BORDER;

  for (let step = 0; step < subSteps; step++) {
    // 1. Move coins & wall collisions
    for (const coin of coins) {
      if (coin.resting) continue;

      coin.x += coin.vx / subSteps;
      coin.y += coin.vy / subSteps;
      coin.vx *= subFriction;
      coin.vy *= subFriction;

      if (Math.hypot(coin.vx, coin.vy) < 0.12) {
        coin.vx = 0;
        coin.vy = 0;
        coin.resting = true;
      }

      // Check Left Goal
      const inGoalY = coin.y >= GOAL_LEFT.yTop && coin.y <= GOAL_LEFT.yBottom;
      if (coin.x - coin.radius <= minX) {
        if (inGoalY) {
          // Inside goal mouth!
          if (coin.x < minX - 15) {
            goalScored = 'LEFT';
            coin.vx *= 0.3;
            coin.vy *= 0.3;
          }
          // Back of the net boundary
          if (coin.x - coin.radius < minX - GOAL_WIDTH) {
            coin.x = minX - GOAL_WIDTH + coin.radius;
            coin.vx = -coin.vx * 0.2;
          }
          // Top & bottom of the left goal net
          if (coin.y - coin.radius < GOAL_LEFT.yTop) {
            coin.y = GOAL_LEFT.yTop + coin.radius;
            coin.vy = -coin.vy * 0.4;
          } else if (coin.y + coin.radius > GOAL_LEFT.yBottom) {
            coin.y = GOAL_LEFT.yBottom - coin.radius;
            coin.vy = -coin.vy * 0.4;
          }
        } else {
          // Rebound on left wood rail
          coin.x = minX + coin.radius;
          coin.vx = -coin.vx * 0.75;
          sounds.playWoodRailBounce(Math.abs(coin.vx) / 10);
        }
      }

      // Check Right Goal
      if (coin.x + coin.radius >= maxX) {
        if (inGoalY) {
          if (coin.x > maxX + 15) {
            goalScored = 'RIGHT';
            coin.vx *= 0.3;
            coin.vy *= 0.3;
          }
          if (coin.x + coin.radius > maxX + GOAL_WIDTH) {
            coin.x = maxX + GOAL_WIDTH - coin.radius;
            coin.vx = -coin.vx * 0.2;
          }
          if (coin.y - coin.radius < GOAL_RIGHT.yTop) {
            coin.y = GOAL_RIGHT.yTop + coin.radius;
            coin.vy = -coin.vy * 0.4;
          } else if (coin.y + coin.radius > GOAL_RIGHT.yBottom) {
            coin.y = GOAL_RIGHT.yBottom - coin.radius;
            coin.vy = -coin.vy * 0.4;
          }
        } else {
          coin.x = maxX - coin.radius;
          coin.vx = -coin.vx * 0.75;
          sounds.playWoodRailBounce(Math.abs(coin.vx) / 10);
        }
      }

      // Top & Bottom rails
      if (coin.y - coin.radius <= minY) {
        coin.y = minY + coin.radius;
        coin.vy = -coin.vy * 0.75;
        sounds.playWoodRailBounce(Math.abs(coin.vy) / 10);
      } else if (coin.y + coin.radius >= maxY) {
        coin.y = maxY - coin.radius;
        coin.vy = -coin.vy * 0.75;
        sounds.playWoodRailBounce(Math.abs(coin.vy) / 10);
      }

      // Goalpost collision points
      const posts = [
        { x: minX, y: GOAL_LEFT.yTop },
        { x: minX, y: GOAL_LEFT.yBottom },
        { x: maxX, y: GOAL_RIGHT.yTop },
        { x: maxX, y: GOAL_RIGHT.yBottom },
      ];

      for (const post of posts) {
        const dist = Math.hypot(coin.x - post.x, coin.y - post.y);
        const postRadius = 6;
        if (dist < coin.radius + postRadius && dist > 0) {
          const nx = (coin.x - post.x) / dist;
          const ny = (coin.y - post.y) / dist;
          coin.x = post.x + nx * (coin.radius + postRadius);
          const dot = coin.vx * nx + coin.vy * ny;
          if (dot < 0) {
            coin.vx = (coin.vx - 2 * dot * nx) * 0.8;
            coin.vy = (coin.vy - 2 * dot * ny) * 0.8;
            sounds.playPegPing();
          }
        }
      }
    }

    // 2. Coin-to-Coin Elastic Collisions
    for (let i = 0; i < coins.length; i++) {
      for (let j = i + 1; j < coins.length; j++) {
        const c1 = coins[i];
        const c2 = coins[j];

        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = c1.radius + c2.radius;

        if (dist < minDist && dist > 0.001) {
          hadCollisions = true;
          if (!collidedWithCoins.includes(c1.id)) collidedWithCoins.push(c1.id);
          if (!collidedWithCoins.includes(c2.id)) collidedWithCoins.push(c2.id);

          const nx = dx / dist;
          const ny = dy / dist;

          // Separate overlapping coins
          const overlap = minDist - dist;
          const totalMass = c1.mass + c2.mass;
          const m1Ratio = c2.mass / totalMass;
          const m2Ratio = c1.mass / totalMass;

          c1.x -= nx * overlap * m1Ratio;
          c1.y -= ny * overlap * m1Ratio;
          c2.x += nx * overlap * m2Ratio;
          c2.y += ny * overlap * m2Ratio;

          // Relative velocity
          const rvx = c2.vx - c1.vx;
          const rvy = c2.vy - c1.vy;
          const velAlongNormal = rvx * nx + rvy * ny;

          // Do not resolve if velocities are separating
          if (velAlongNormal < 0) {
            const restitution = 0.86; // Crisp metallic bounce
            const impulseMagnitude = (-(1 + restitution) * velAlongNormal) / (1 / c1.mass + 1 / c2.mass);

            const impulseX = impulseMagnitude * nx;
            const impulseY = impulseMagnitude * ny;

            c1.vx -= impulseX / c1.mass;
            c1.vy -= impulseY / c1.mass;
            c2.vx += impulseX / c2.mass;
            c2.vy += impulseY / c2.mass;

            c1.resting = false;
            c2.resting = false;

            const impactSpeed = Math.abs(velAlongNormal);
            sounds.playCoinClink(impactSpeed / 12);
          }
        }
      }
    }

    // 3. Peg Collisions (Obstacle Nails)
    for (const coin of coins) {
      for (const peg of pegs) {
        const dx = coin.x - peg.x;
        const dy = coin.y - peg.y;
        const dist = Math.hypot(dx, dy);
        const minDist = coin.radius + peg.radius;

        if (dist < minDist && dist > 0.0001) {
          const nx = dx / dist;
          const ny = dy / dist;
          coin.x = peg.x + nx * minDist;

          const dot = coin.vx * nx + coin.vy * ny;
          if (dot < 0) {
            coin.vx = (coin.vx - 1.8 * dot * nx) * 0.8;
            coin.vy = (coin.vy - 1.8 * dot * ny) * 0.8;
            coin.resting = false;
            sounds.playPegPing();
          }
        }
      }
    }
  }

  return { goalScored, hadCollisions, collidedWithCoins };
}

// Generate classic Brazilian nail soccer layout (Futebol de Pregos)
export function createPegLayout(): Peg[] {
  const pegs: Peg[] = [];
  const minX = WOOD_BORDER + 80;
  const maxX = PITCH_WIDTH - WOOD_BORDER - 80;
  const centerY = PITCH_HEIGHT / 2;

  // Midfield pins
  pegs.push(
    { id: 'mid-top', x: PITCH_WIDTH / 2, y: centerY - 140, radius: 5 },
    { id: 'mid-bot', x: PITCH_WIDTH / 2, y: centerY + 140, radius: 5 }
  );

  // Left & Right Defense Triangles (classic wooden game pegs)
  const xOffsets = [minX + 90, minX + 220, maxX - 220, maxX - 90];
  xOffsets.forEach((x, idx) => {
    const isOuter = idx === 0 || idx === 3;
    const ySpread = isOuter ? [centerY - 90, centerY, centerY + 90] : [centerY - 160, centerY - 60, centerY + 60, centerY + 160];
    ySpread.forEach((y, yIdx) => {
      pegs.push({
        id: `peg-${idx}-${yIdx}`,
        x,
        y,
        radius: 5,
      });
    });
  });

  return pegs;
}
