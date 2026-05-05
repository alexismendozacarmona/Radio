import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

// ── Constantes ────────────────────────────────────────────────────────────────
const STREAM_URL    = 'https://radiolatina.live/8132/stream';
const FALLBACK_NAME = 'Clásicos del Reggaetón';
const POLL_MS       = 25_000;
const STATION_LOGO  = 'https://clasicosdelreggaeton.com/sitepad-data/uploads/2026/02/logoclasx.jpg';

// ── Sistema de debug (solo consola, sin panel visible) ───────────────────────
export function addDebugLog(msg: string) {
  console.log('[AudioDebug]', msg);
}

// ── Detección Capacitor (sin importar @capacitor/core) ────────────────────────
function isCapacitor(): boolean {
  try { return !!(window as any).Capacitor?.isNativePlatform?.(); }
  catch { return false; }
}

// Acceso directo sin registerPlugin — más compatible y estable
function getNative(): any {
  try {
    if (!isCapacitor()) return null;
    const plugin = (window as any).Capacitor?.Plugins?.RadioPlugin;
    return plugin ?? null;
  } catch { return null; }
}

// Llamada nativa con timeout de seguridad
async function nativeCall<T>(fn: () => Promise<T>, ms = 3000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    fn().then(v => { clearTimeout(t); resolve(v); })
        .catch(e => { clearTimeout(t); reject(e); });
  });
}

// ── Metadatos ─────────────────────────────────────────────────────────────────
const META_URLS = [
  'https://radiolatina.live/8132/status-json.xsl',
  'https://radiolatina.live/8132/currentsong',
];
const PROXIES = [
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
];

function parseSong(raw: string): string | null {
  try {
    const d = JSON.parse(raw);
    const s = d?.icestats?.source;
    const t = Array.isArray(s) ? s[0]?.title : s?.title;
    if (t?.trim()) return t.trim();
  } catch { /**/ }
  const p = raw.trim();
  if (p && p.length < 200 && !p.startsWith('<')) return p;
  return null;
}

async function fetchNowPlaying(): Promise<string | null> {
  for (const url of META_URLS) {
    try {
      const r = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
      if (r.ok) { const s = parseSong(await r.text()); if (s) return s; }
    } catch { /**/ }
    for (const proxy of PROXIES) {
      try {
        const r = await fetch(proxy(url), { cache: 'no-store', signal: AbortSignal.timeout(6000) });
        if (r.ok) {
          const w = await r.json();
          const raw = typeof w === 'string' ? w : (w?.contents ?? JSON.stringify(w));
          const s = parseSong(raw); if (s) return s;
        }
      } catch { /**/ }
    }
  }
  return null;
}

function setMediaSession(song: string, playing: boolean) {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song, artist: 'Clásicos del Reggaetón', album: '📻 Radio en Vivo',
      artwork: [{ src: STATION_LOGO, sizes: '512x512', type: 'image/jpeg' }],
    });
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
  } catch { /**/ }
}

// ── Contexto ──────────────────────────────────────────────────────────────────
interface AudioContextType {
  isPlaying: boolean;
  toggle: () => void;
  currentSong: string;
  isLoading: boolean;
}
const AudioCtx = createContext<AudioContextType>({
  isPlaying: false, toggle: () => {}, currentSong: FALLBACK_NAME, isLoading: false,
});

// ── Provider ──────────────────────────────────────────────────────────────────
export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef       = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [currentSong, setCurrentSong] = useState(FALLBACK_NAME);

  const isPlayingRef    = useRef(false);
  const currentSongRef  = useRef(FALLBACK_NAME);
  const wantsPlayRef    = useRef(false);
  const nativeActiveRef = useRef(false);
  const pollRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const visGenRef       = useRef(0); // generación de transición — cancela las obsoletas

  // ── Polling ─────────────────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    const run = async () => {
      const song = (await fetchNowPlaying()) ?? FALLBACK_NAME;
      setCurrentSong(song); currentSongRef.current = song;
      setMediaSession(song, isPlayingRef.current);
    };
    run();
    pollRef.current = setInterval(run, POLL_MS);
  }, [stopPolling]);

  // ── HTML5: reproducir ────────────────────────────────────────────────────────
  const html5Play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) { addDebugLog('❌ No hay elemento audio'); return; }

    addDebugLog('▶️ Intentando HTML5 play...');
    audio.src = STREAM_URL;
    setIsLoading(true);

    try {
      await audio.play();
      setIsPlaying(true); isPlayingRef.current = true;
      setIsLoading(false);
      setMediaSession(currentSongRef.current, true);
      startPolling();
      addDebugLog('✅ HTML5 reproduciendo');
    } catch (err: any) {
      setIsLoading(false);
      wantsPlayRef.current = false;
      addDebugLog(`❌ HTML5 error: ${err?.message ?? err}`);
    }
  }, [startPolling]);

  // ── HTML5: detener ───────────────────────────────────────────────────────────
  const html5Stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.src = ''; }
    setIsPlaying(false); isPlayingRef.current = false;
    setIsLoading(false);
    setMediaSession(currentSongRef.current, false);
    stopPolling();
    addDebugLog('⏹️ HTML5 detenido');
  }, [stopPolling]);

  // ── Nativo: iniciar ──────────────────────────────────────────────────────────
  const nativeStart = useCallback(async (): Promise<boolean> => {
    const native = getNative();
    if (!native) { addDebugLog('ℹ️ Plugin nativo no disponible'); return false; }
    try {
      addDebugLog('🔌 Iniciando servicio nativo...');
      nativeActiveRef.current = true; // ✅ marcar ANTES del await para bloquear errores HTML5
      await nativeCall(() => native.startAudio({ url: STREAM_URL }));
      addDebugLog('✅ Servicio nativo activo');
      return true;
    } catch (e: any) {
      nativeActiveRef.current = false;
      addDebugLog(`❌ Nativo falló: ${e?.message ?? e}`);
      return false;
    }
  }, []);

  // ── Nativo: detener ──────────────────────────────────────────────────────────
  const nativeStop = useCallback(async () => {
    const native = getNative();
    nativeActiveRef.current = false;
    if (!native) return;
    try {
      await nativeCall(() => native.stopAudio());
      addDebugLog('✅ Servicio nativo detenido');
    } catch (e: any) {
      addDebugLog(`⚠️ nativeStop: ${e?.message ?? e}`);
    }
  }, []);

  // ── Crear elemento Audio ─────────────────────────────────────────────────────
  useEffect(() => {
    addDebugLog(`🚀 Capacitor: ${isCapacitor()} | Plugin: ${!!getNative()}`);

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.volume = 0.85;
    audio.preload = 'none';
    audioRef.current = audio;

    audio.addEventListener('waiting',  () => { if (!nativeActiveRef.current) setIsLoading(true); });
    audio.addEventListener('playing',  () => { if (!nativeActiveRef.current) { setIsLoading(false); setIsPlaying(true); isPlayingRef.current = true; } });
    audio.addEventListener('pause',    () => { if (!wantsPlayRef.current && !nativeActiveRef.current) { setIsPlaying(false); isPlayingRef.current = false; } });
    audio.addEventListener('error',    (e) => {
      if (nativeActiveRef.current) return; // ✅ FIX: no reiniciar si el nativo está activo
      const err = (e.target as HTMLAudioElement).error;
      if (!err || err.code === 0) return;  // ignorar errores de src vacío
      addDebugLog(`❌ Audio error code: ${err?.code} - ${err?.message}`);
      setIsLoading(false);
      // Solo reintentar si queremos reproducir Y el nativo no está activo
      if (wantsPlayRef.current && !nativeActiveRef.current) {
        setTimeout(() => {
          if (wantsPlayRef.current && !nativeActiveRef.current) html5Play();
        }, 3000);
      }
    });

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play',  () => { wantsPlayRef.current = true;  html5Play(); });
      navigator.mediaSession.setActionHandler('pause', () => { wantsPlayRef.current = false; html5Stop(); });
      navigator.mediaSession.setActionHandler('stop',  () => { wantsPlayRef.current = false; html5Stop(); });
    }

    return () => { audio.pause(); audio.src = ''; stopPolling(); };
  }, [html5Play, html5Stop, stopPolling]);

  // ── Visibilidad: segundo plano ───────────────────────────────────────────────
  useEffect(() => {
    const onVisibility = async () => {
      if (!wantsPlayRef.current) return;

      // Cada transición tiene su propio ID — si llega una nueva antes de que
      // termine la anterior, la anterior se cancela y no hace nada
      const gen = ++visGenRef.current;

      if (document.visibilityState === 'hidden') {
        addDebugLog('📱 App → segundo plano');
        if (!isCapacitor()) return; // en web dejamos HTML5 correr libre

        html5Stop();
        const ok = await nativeStart();
        if (gen !== visGenRef.current) return; // llegó otra transición, cancelamos
        if (ok) {
          setIsPlaying(true);
          isPlayingRef.current = true;
          startPolling();
        } else {
          addDebugLog('⚠️ Nativo no disponible — sin audio en background');
        }

      } else {
        addDebugLog('📱 App → primer plano');
        if (nativeActiveRef.current) await nativeStop();
        if (gen !== visGenRef.current) return; // cancelado
        if (wantsPlayRef.current) await html5Play();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [html5Play, html5Stop, nativeStart, nativeStop, startPolling]);

  // ── Toggle ───────────────────────────────────────────────────────────────────
  const toggle = useCallback(async () => {
    addDebugLog(`🔘 Toggle → playing: ${isPlayingRef.current}`);
    if (isPlayingRef.current || nativeActiveRef.current) {
      wantsPlayRef.current = false;
      if (nativeActiveRef.current) { await nativeStop(); setIsPlaying(false); isPlayingRef.current = false; stopPolling(); }
      else html5Stop();
    } else {
      wantsPlayRef.current = true;
      await html5Play();
    }
  }, [html5Play, html5Stop, nativeStop, stopPolling]);

  return (
    <AudioCtx.Provider value={{ isPlaying, toggle, currentSong, isLoading }}>
      {children}
    </AudioCtx.Provider>
  );
};

export const useAudio = () => useContext(AudioCtx);