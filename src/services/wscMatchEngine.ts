import { MatchHighlight, HighlightType, PlayerCoin, OpponentClub } from '../types/manager';
import { Coin } from '../types/game';
import { PITCH_WIDTH, PITCH_HEIGHT, WOOD_BORDER, createRealCoin } from './physics';

export function generateMatchHighlights(
  playerSquad: PlayerCoin[],
  opponent: OpponentClub
): MatchHighlight[] {
  const starters = playerSquad.filter((p) => p.isStarter);
  const playerAvg = starters.length > 0
    ? starters.reduce((acc, p) => acc + p.overall, 0) / starters.length
    : 75;
  const oppAvg = opponent.overall || 75;

  const diff = (playerAvg - oppAvg) / 10;
  // Higher player overall -> more attacking highlights, fewer defensive emergencies
  const attackRatio = Math.max(0.4, Math.min(0.8, 0.6 + diff * 0.1));

  const minutesPool = [11, 23, 38, 52, 67, 79, 88];
  // Pick 5 to 6 minutes for highlights
  const selectedMinutes = minutesPool.sort(() => Math.random() - 0.5).slice(0, 5).sort((a, b) => a - b);

  const striker = starters.find((p) => p.position === 'ATA') || starters[0];
  const midfielder = starters.find((p) => p.position === 'MEI') || starters[0];

  const highlights: MatchHighlight[] = selectedMinutes.map((minute, idx) => {
    const isAttack = Math.random() < attackRatio || idx === 0;

    if (isAttack) {
      const types: { type: HighlightType; title: string; desc: string; hint: string; role: 'STRIKER' | 'MIDFIELDER' }[] = [
        {
          type: 'ATTACK_1V1',
          title: '⚡ Cara a Cara com o Goleiro!',
          desc: `${striker?.name || 'Seu atacante'} recebe na entrada da área com liberdade.`,
          hint: 'Mire no canto oposto do goleiro para marcar!',
          role: 'STRIKER',
        },
        {
          type: 'ATTACK_LONG_SHOT',
          title: '💥 Bomba de Fora da Área!',
          desc: `${midfielder?.name || 'Seu meia'} encontra espaço na intermediária para arrematar.`,
          hint: 'Puxe com força máxima para soltar uma bomba na gaveta!',
          role: 'MIDFIELDER',
        },
        {
          type: 'ATTACK_FREE_KICK',
          title: '🎯 Falta Perigosa na Meia-Lua!',
          desc: 'Falta marcada na entrada da área. Barreira montada.',
          hint: 'Use a tabela de madeira ou curve por cima da barreira!',
          role: 'MIDFIELDER',
        },
        {
          type: 'ATTACK_COUNTER',
          title: '⚡ Contra-Ataque Fulminante!',
          desc: 'A defesa rival foi apanhada desprevenida em velocidade 2 contra 1.',
          hint: 'Finalize no gol ou toque na moeda do companheiro!',
          role: 'STRIKER',
        },
      ];
      const chosen = types[Math.floor(Math.random() * types.length)];
      return {
        id: `hl-${minute}-${idx}`,
        minute,
        type: chosen.type,
        title: chosen.title,
        description: chosen.desc,
        hint: chosen.hint,
        isPlayerAttacking: true,
        playerRole: chosen.role,
      };
    } else {
      const defTypes: { type: HighlightType; title: string; desc: string; hint: string; role: 'DEFENDER' | 'GOALKEEPER' }[] = [
        {
          type: 'DEFENSE_COUNTER',
          title: '⚠️ Contra-Ataque Perigoso do Rival!',
          desc: `O ${opponent.name} escapa pela ponta e arma o arremate contra sua meta.`,
          hint: 'Intercepte com seu zagueiro antes que a moeda passe!',
          role: 'DEFENDER',
        },
        {
          type: 'DEFENSE_SAVE',
          title: '🛡️ Defesa Decisiva do Goleiro!',
          desc: 'O rival chuta forte na grande área! Seu paredão precisa espalmar.',
          hint: 'Posicione sua moeda fechando o ângulo para bloquear!',
          role: 'GOALKEEPER',
        },
      ];
      const chosenDef = defTypes[Math.floor(Math.random() * defTypes.length)];
      return {
        id: `hl-${minute}-${idx}`,
        minute,
        type: chosenDef.type,
        title: chosenDef.title,
        description: chosenDef.desc,
        hint: chosenDef.hint,
        isPlayerAttacking: false,
        playerRole: chosenDef.role,
      };
    }
  });

  return highlights;
}

export function setupHighlightPitch(
  highlight: MatchHighlight,
  squad: PlayerCoin[],
  opponent: OpponentClub,
  clubPrimaryColor: string,
  clubSecondaryColor: string
): Coin[] {
  const centerY = PITCH_HEIGHT / 2;
  const starters = squad.filter((p) => p.isStarter);
  const gk = starters.find((p) => p.position === 'GL') || starters[0];
  const def = starters.find((p) => p.position === 'ZAG') || starters[1] || starters[0];
  const mid = starters.find((p) => p.position === 'MEI') || starters[2] || starters[0];
  const atk = starters.find((p) => p.position === 'ATA') || starters[3] || starters[0];

  const oppColorOuter = opponent.primaryColor || '#EF4444';
  const oppColorInner = opponent.secondaryColor || '#7F1D1D';

  if (highlight.isPlayerAttacking) {
    // Player is attacking RIGHT goal
    const shooter = highlight.playerRole === 'MIDFIELDER' ? mid : atk;
    const support = highlight.playerRole === 'MIDFIELDER' ? atk : mid;

    let shooterX = 760;
    let shooterY = centerY;
    let oppDefX = 930;
    let oppDefY = centerY - 50;

    if (highlight.type === 'ATTACK_1V1') {
      shooterX = 810;
      shooterY = centerY + (Math.random() - 0.5) * 60;
      oppDefX = 950;
      oppDefY = centerY - 80;
    } else if (highlight.type === 'ATTACK_FREE_KICK') {
      shooterX = 730;
      shooterY = centerY + 40;
      oppDefX = 890;
      oppDefY = centerY + 30; // Wall blocking
    } else if (highlight.type === 'ATTACK_LONG_SHOT') {
      shooterX = 680;
      shooterY = centerY - 60;
      oppDefX = 880;
      oppDefY = centerY - 40;
    }

    const shooterCoin: Coin = {
      ...createRealCoin('p-shooter', shooterX, shooterY, shooter.coinType, 'PLAYER', `#${shooter.number}`),
      mass: 0.95 + (shooter.attributes.weight / 100) * 0.5,
      colorOuter: clubPrimaryColor,
      colorInner: clubSecondaryColor,
      borderColor: '#B45309',
      highlightColor: '#FFFFFF',
    };

    const supportCoin: Coin = {
      ...createRealCoin('p-support', shooterX - 80, shooterY > centerY ? shooterY - 140 : shooterY + 140, support.coinType, 'PLAYER', `#${support.number}`),
      mass: 0.95 + (support.attributes.weight / 100) * 0.5,
      colorOuter: clubPrimaryColor,
      colorInner: clubSecondaryColor,
      borderColor: '#B45309',
      highlightColor: '#FFFFFF',
    };

    // Opponent Goalkeeper
    const oppGK: Coin = {
      ...createRealCoin('opp-gk', PITCH_WIDTH - WOOD_BORDER - 35, centerY, 'REAL_50', 'OPPONENT', 'GL'),
      isGoalkeeper: true,
      radius: 25,
      mass: 1.45,
      colorOuter: '#64748B',
      colorInner: '#94A3B8',
      borderColor: '#1E293B',
      highlightColor: '#FFFFFF',
    };

    // Opponent Defender
    const oppDefender: Coin = {
      ...createRealCoin('opp-def', oppDefX, oppDefY, 'REAL_25', 'OPPONENT', '3'),
      mass: 1.25,
      colorOuter: oppColorOuter,
      colorInner: oppColorInner,
      borderColor: '#7F1D1D',
      highlightColor: '#FCA5A5',
    };

    return [shooterCoin, supportCoin, oppGK, oppDefender];
  } else {
    // Opponent is attacking LEFT goal -> Player must defend!
    const playerDef = highlight.playerRole === 'GOALKEEPER' ? gk : def;

    // Opponent attacker approaching
    const oppAttacker: Coin = {
      ...createRealCoin('opp-atk', 380, centerY + (Math.random() - 0.5) * 80, 'REAL_1', 'OPPONENT', '9'),
      mass: 1.2,
      colorOuter: oppColorOuter,
      colorInner: oppColorInner,
      borderColor: '#7F1D1D',
      highlightColor: '#FFFFFF',
    };

    // Player Goalkeeper
    const playerGK: Coin = {
      ...createRealCoin('p-gk', WOOD_BORDER + 35, centerY, gk.coinType, 'PLAYER', 'GL'),
      isGoalkeeper: true,
      radius: 25,
      mass: 1.2 + (gk.attributes.weight / 100) * 0.45,
      colorOuter: gk.colors.outer,
      colorInner: gk.colors.inner,
      borderColor: gk.colors.border,
      highlightColor: '#FFFFFF',
    };

    // Player Defender positioned to intercept
    const defenderCoin: Coin = {
      ...createRealCoin('p-def', 250, centerY + 20, playerDef.coinType, 'PLAYER', `#${playerDef.number}`),
      mass: 0.95 + (playerDef.attributes.weight / 100) * 0.5,
      colorOuter: clubPrimaryColor,
      colorInner: clubSecondaryColor,
      borderColor: '#334155',
      highlightColor: '#FFFFFF',
    };

    return [playerGK, defenderCoin, oppAttacker];
  }
}

export const MATCH_COMMENTARY_BANK = [
  'Disputa acirrada no meio de campo!',
  'Bela troca de passes na intermediária.',
  'A zaga afasta com firmeza pela linha lateral.',
  'O treinador orienta a equipe a subir as linhas de marcação.',
  'Tentativa de lançamento longo interceptada pela zaga.',
  'Torcida empurra o time em busca do resultado na mesa!',
  'Drible desconcertante no setor ofensivo.',
  'Marcação pressão surte efeito na transição rápida.',
  'O goleiro sai da meta e orienta o posicionamento dos zagueiros.',
  'Muita disputa física e estratégia a cada toque!',
];
