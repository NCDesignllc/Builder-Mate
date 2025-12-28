import { useState } from 'react';

const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';

type GeminiOptions = {
  timeoutMs?: number;
  maxChars?: number;
};

function clampText(input: string, maxChars: number) {
  if (!input) return '';
  return input.length > maxChars ? input.slice(0, maxChars) : input;
}

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

export function useGemini(apiKey: string, opts: GeminiOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeoutMs = opts.timeoutMs ?? 20000;
  const maxChars = opts.maxChars ?? 4000;

  const generateContent = async (prompt: string, systemInstruction = '', isJson = false) => {
    setLoading(true);
    setError(null);

    const safePrompt = clampText(prompt, maxChars);
    const safeSystem = clampText(systemInstruction, 2000);

    if (!apiKey) {
      setLoading(false);
      setError('Missing API key. Set VITE_GEMINI_API_KEY in your .env file.');
      return null;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    const payload: any = {
      contents: [{ parts: [{ text: safePrompt }] }],
      systemInstruction: safeSystem ? { parts: [{ text: safeSystem }] } : undefined,
    };

    if (isJson) payload.generationConfig = { responseMimeType: 'application/json' };

    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }, timeoutMs);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg =
          data?.error?.message ||
          `Request failed (${response.status}).`;
        setError(msg);
        setLoading(false);
        return null;
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        setError('No response text returned from model.');
        setLoading(false);
        return null;
      }

      if (isJson) {
        try {
          const parsed = JSON.parse(text);
          setLoading(false);
          return parsed;
        } catch {
          setError('Model returned invalid JSON. Try rephrasing or simplifying the request.');
          setLoading(false);
          return null;
        }
      }

      setLoading(false);
      return String(text);
    } catch (e: any) {
      const msg =
        e?.name === 'AbortError'
          ? 'Request timed out. Try again.'
          : (e?.message ?? 'Unknown network error.');
      setError(msg);
      setLoading(false);
      return null;
    }
  };

  return { generateContent, loading, error, clearError: () => setError(null) };
}
