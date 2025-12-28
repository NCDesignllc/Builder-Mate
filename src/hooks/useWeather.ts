import { useEffect, useState } from 'react';

export type WeatherData = {
  temperature: number;
  windspeed: number;
  weathercode: number;
};

type WeatherResult = {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
};

/**
 * Very small weather hook using Open-Meteo.
 * Defaults to San Francisco coords (matches legacy code).
 */
export function useWeather(lat = 37.7749, lon = -122.4194): WeatherResult {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setWeather(data?.current_weather ?? null);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(String(e?.message ?? e));
        setLoading(false);
      });

    return () => {
      cancelled = true
    };
  }, [lat, lon]);

  return { weather, loading, error };
}
