import React from 'react';
import { Play, Pause, RotateCcw, FastForward, CheckCircle2, Video } from 'lucide-react';
import { ReplayData } from '../types/game';

interface ReplayOverlayProps {
  replayData: ReplayData;
  currentFrame: number;
  totalFrames: number;
  isPlaying: boolean;
  playbackSpeed: number;
  isLooping: boolean;
  onTogglePlay: () => void;
  onSeek: (frame: number) => void;
  onChangeSpeed: (speed: number) => void;
  onToggleLoop: () => void;
  onCloseReplay: () => void;
}

export const ReplayOverlay: React.FC<ReplayOverlayProps> = ({
  replayData,
  currentFrame,
  totalFrames,
  isPlaying,
  playbackSpeed,
  isLooping,
  onTogglePlay,
  onSeek,
  onChangeSpeed,
  onToggleLoop,
  onCloseReplay,
}) => {
  const isPlayerGoal = replayData.scorer === 'PLAYER';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
      {/* Top TV Broadcast Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 bg-black/85 backdrop-blur-md border border-neutral-700/80 px-4 py-2 rounded-xl pointer-events-auto shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-black tracking-widest text-rose-400 uppercase font-mono">
              INSTANT REPLAY
            </span>
          </div>
          <span className="text-neutral-600">|</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-neutral-400">ÂNGULO SLOW-MO:</span>
            <span className={isPlayerGoal ? 'text-amber-400' : 'text-sky-400'}>
              {isPlayerGoal ? 'GOL DO JOGADOR 1' : 'GOL DA CPU'}
            </span>
          </div>
        </div>

        {/* Close/Skip button */}
        <button
          onClick={onCloseReplay}
          className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Continuar Jogo</span>
        </button>
      </div>

      {/* Bottom Replay Video Scrubbing & Control Bar */}
      <div className="w-full max-w-2xl mx-auto bg-neutral-950/90 backdrop-blur-md border border-neutral-700/90 rounded-2xl p-3.5 pointer-events-auto shadow-2xl">
        {/* Progress Bar / Scrubber */}
        <div className="flex items-center gap-3 mb-2.5">
          <span className="text-[11px] font-mono text-neutral-400 w-10 text-right tabular-nums">
            {Math.round((currentFrame / Math.max(1, totalFrames - 1)) * 100)}%
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0, totalFrames - 1)}
            value={currentFrame}
            onChange={(e) => onSeek(parseInt(e.target.value, 10))}
            className="flex-1 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <span className="text-[11px] font-mono text-neutral-500 w-12 tabular-nums">
            {currentFrame}/{totalFrames - 1}
          </span>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-xs">
          {/* Play/Pause & Loop */}
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={onToggleLoop}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                isLooping
                  ? 'bg-amber-500/20 border-amber-500/80 text-amber-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
              title="Repetir em loop"
            >
              Repetir: {isLooping ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Speed Buttons */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1 rounded-lg">
            <span className="text-[10px] text-neutral-500 uppercase px-1.5 font-medium">Velocidade:</span>
            {[0.25, 0.5, 1.0].map((spd) => {
              const active = playbackSpeed === spd;
              return (
                <button
                  key={spd}
                  onClick={() => onChangeSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                    active
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {spd}x
                </button>
              );
            })}
          </div>

          {/* Shortcut hint */}
          <div className="text-[10px] text-neutral-500 hidden sm:block">
            Espaço: Play/Pausa · Arraste para rebobinar
          </div>
        </div>
      </div>
    </div>
  );
};
