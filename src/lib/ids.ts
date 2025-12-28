export function makeId(): number {
  // Unique enough for UI row keys within a session.
  return Date.now() + Math.floor(Math.random() * 100000);
}
