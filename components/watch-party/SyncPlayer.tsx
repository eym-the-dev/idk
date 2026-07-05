'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type PlaybackState = { position: number; is_playing: boolean };

type BroadcastPayload = {
  type: 'play' | 'pause' | 'seek';
  position: number;
  at: number;
};

declare global {
  interface Window {
    YT?: {
      Player: new (element: HTMLElement, options: Record<string, unknown>) => Record<string, unknown>;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function getYouTubeVideoId(input?: string | null) {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const match = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

export function SyncPlayer({
  roomId,
  isHost,
  initialState,
  contentRef,
}: {
  roomId: string;
  isHost: boolean;
  initialState: PlaybackState;
  contentRef?: string | null;
}) {
  const supabase = createClient();
  const [state, setState] = useState<PlaybackState>(initialState);
  const [videoReady, setVideoReady] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoId = getYouTubeVideoId(contentRef);

  useEffect(() => {
    const channel = supabase
      .channel(`watch_room:${roomId}`)
      .on('broadcast', { event: 'playback' }, ({ payload }) => {
        applyRemoteState(payload as BroadcastPayload);
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [roomId, supabase]);

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (state.is_playing) {
      tickRef.current = setInterval(() => {
        setState((s) => ({ ...s, position: s.position + 1 }));
      }, 1000);
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [state.is_playing]);

  useEffect(() => {
    if (!videoId || !containerRef.current) return;
    if (window.YT?.Player) {
      initPlayer();
      return;
    }

    const existingScript = document.getElementById('yt-iframe-api');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'yt-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = initPlayer;
  }, [videoId]);

  function initPlayer() {
    if (!videoId || !containerRef.current || playerRef.current || !window.YT?.Player) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      width: '100%',
      height: '100%',
      playerVars: { playsinline: 1, rel: 0 },
      events: {
        onReady: () => {
          setVideoReady(true);
          if (initialState.is_playing) {
            playerRef.current?.playVideo();
          } else {
            playerRef.current?.pauseVideo();
          }
          if (initialState.position > 0) {
            playerRef.current?.seekTo(initialState.position, true);
          }
        },
      },
    });
  }

  function applyRemoteState(payload: BroadcastPayload) {
    const elapsed = payload.type === 'play' ? (Date.now() - payload.at) / 1000 : 0;
    const nextPosition = payload.position + elapsed;

    setState({ position: nextPosition, is_playing: payload.type === 'play' });

    if (playerRef.current && videoReady) {
      if (payload.type === 'play') {
        playerRef.current.seekTo(nextPosition, true);
        playerRef.current.playVideo();
      } else if (payload.type === 'pause') {
        playerRef.current.seekTo(nextPosition, true);
        playerRef.current.pauseVideo();
      }
    }
  }

  async function broadcast(type: BroadcastPayload['type'], position: number) {
    const payload: BroadcastPayload = { type, position, at: Date.now() };
    await channelRef.current?.send({ type: 'broadcast', event: 'playback', payload });
    await (supabase.from('watch_rooms') as any)
      .update({ playback_state: { position, is_playing: type !== 'pause' } })
      .eq('id', roomId);
  }

  function togglePlay() {
    const nextPlaying = !state.is_playing;
    setState((s) => ({ ...s, is_playing: nextPlaying }));
    if (playerRef.current && videoReady) {
      if (nextPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
    broadcast(nextPlaying ? 'play' : 'pause', state.position);
  }

  function seek(delta: number) {
    const next = Math.max(0, state.position + delta);
    setState((s) => ({ ...s, position: next }));
    if (playerRef.current && videoReady) {
      playerRef.current.seekTo(next, true);
    }
    broadcast(state.is_playing ? 'play' : 'pause', next);
  }

  return (
    <div className="rounded-lg border border-hairline bg-surface p-6">
      <div className="mb-6 aspect-video overflow-hidden rounded border border-hairline bg-void">
        {videoId ? (
          <div ref={containerRef} className="h-full w-full" />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center">
            <span className="font-mono text-[12px] text-fog">
              YouTube linki veya video ID&apos;si girildiğinde burada içerik açılacak.
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => seek(-10)}
          className="text-[13px] font-mono text-dust transition-colors hover:text-ivory"
        >
          −10s
        </button>
        <button
          onClick={togglePlay}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-gold text-ivory transition-colors hover:bg-gold hover:text-void"
        >
          {state.is_playing ? '❚❚' : '▶'}
        </button>
        <button
          onClick={() => seek(10)}
          className="text-[13px] font-mono text-dust transition-colors hover:text-ivory"
        >
          +10s
        </button>
      </div>

      <p className="mt-4 text-center font-mono text-[12px] text-dust">
        {formatTime(state.position)} {!isHost && '· host senkronize ediyor'}
      </p>
    </div>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
