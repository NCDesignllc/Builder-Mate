export function selectedRing(isDarkMode: boolean) {
  return isDarkMode ? 'ring-2 ring-orange-500/80' : 'ring-2 ring-orange-500/70';
}

export function selectedRowBg(isDarkMode: boolean) {
  return isDarkMode ? 'bg-orange-500/10 border-orange-500/40' : 'bg-orange-50 border-orange-200';
}

export function selectedStroke(isDarkMode: boolean) {
  // Used on canvas overlay drawings
  return isDarkMode ? '#fb923c' : '#f97316';
}
