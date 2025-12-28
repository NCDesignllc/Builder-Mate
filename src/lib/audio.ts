export type AudioPayload = {
  mimeType: string;
  base64Data: string;
};

/** Convert base64 audio to a Blob URL for playback. */
export function audioPayloadToObjectUrl(payload: AudioPayload): string | null {
  try {
    if (!payload?.base64Data) return null;
    const binaryString = window.atob(payload.base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    const blob = new Blob([bytes], { type: payload.mimeType || 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

/** Best-effort cleanup */
export function revokeObjectUrl(url: string | null | undefined) {
  try {
    if (url) URL.revokeObjectURL(url);
  } catch {
    // ignore
  }
}
