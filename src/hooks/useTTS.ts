import { useEffect, useRef, useState } from 'react';
import { audioPayloadToObjectUrl, revokeObjectUrl, type AudioPayload } from '../lib/audio';

const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

type TtsOptions = {
  timeoutMs?: number;
  voiceName?: string; // e.g. "Kore"
};

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

export function useTTS(apiKey: string, opts: TtsOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const timeoutMs = opts.timeoutMs ?? 25000;
  const voiceName = opts.voiceName ?? 'Kore';

  useEffect(() => {
    return () => {
      try {
        audioRef.current?.pause();
        audioRef.current = null;
      } catch {}
      revokeObjectUrl(urlRef.current);
      urlRef.current = null;
    };
  }, []);

  const stop = () => {
    try {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    } catch {}
  };

  const speak = async (text: string): Promise<boolean> => {
    if (!text?.trim()) return false;

    setLoading(true);
    setError(null);

    if (!apiKey) {
      setLoading(false);
      setError('Missing API key. Set VITE_GEMINI_API_KEY in your .env file.');
      return false;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${apiKey}`;

    const payload: any = {
      contents: [{ parts: [{ text: `Say professionally: ${text}` }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } },
        },
      },
    };

    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        timeoutMs
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = data?.error?.message || `Request failed (${response.status}).`;
        setError(msg);
        setLoading(false);
        return false;
      }

      // Gemini TTS typically returns inlineData {mimeType, data}
      const inline = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      const mimeType = inline?.mimeType || 'audio/wav';
      const base64Data = inline?.data;

      const audioPayload: AudioPayload = { mimeType, base64Data };
      const objectUrl = audioPayloadToObjectUrl(audioPayload);

      if (!objectUrl) {
        setError('No audio returned (or could not decode audio).');
        setLoading(false);
        return false;
      }

      // cleanup previous
      stop();
      revokeObjectUrl(urlRef.current);
      urlRef.current = objectUrl;

      // play
      const audio = new Audio(objectUrl);
      audioRef.current = audio;

      await audio.play().catch(() => {
        // autoplay restrictions
        throw new Error('Audio playback failed (browser blocked autoplay). Click to play again.');
      });

      setLoading(false);
      return true;
    } catch (e: any) {
      const msg =
        e?.name === 'AbortError'
          ? 'TTS request timed out. Try again.'
          : (e?.message ?? 'Unknown TTS error.');
      setError(msg);
      setLoading(false);
      return false;
    }
  };

  return { speak, stop, loading, error, clearError: () => setError(null) };
}
