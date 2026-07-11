let ctx: AudioContext | null = null;

export function isSoundEnabled(): boolean {
  return localStorage.getItem('soundEnabled') !== 'false';
}

/** Короткий двухтональный "дзынь" без внешнего аудиофайла — через осциллятор браузера. */
export function playNotificationSound() {
  if (!isSoundEnabled()) return;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(660, now + 0.12);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.34);
  } catch {
    // Звук недоступен (например автоплей заблокирован до первого клика) — не критично
  }
}
