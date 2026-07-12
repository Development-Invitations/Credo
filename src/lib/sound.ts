let ctx: AudioContext | null = null;

export type SoundTone = 'chime' | 'soft' | 'alert';

export function isSoundEnabled(): boolean {
  return localStorage.getItem('soundEnabled') !== 'false';
}

export function getSoundVolume(): number {
  const v = Number(localStorage.getItem('soundVolume'));
  return Number.isFinite(v) && v >= 0 && v <= 100 ? v : 70;
}

export function getSoundTone(): SoundTone {
  const t = localStorage.getItem('soundTone');
  return t === 'soft' || t === 'alert' ? t : 'chime';
}

/** Отдельные переключатели — на какие события реально играть звук. */
export function isSoundEnabledFor(category: 'overdue' | 'reminders' | 'update'): boolean {
  return localStorage.getItem(`soundOn_${category}`) !== 'false';
}

const TONES: Record<SoundTone, [number, number]> = {
  chime: [880, 660],
  soft: [520, 440],
  alert: [740, 740],
};

/** Короткий синтезированный звук уведомления — без внешнего аудиофайла. */
export function playNotificationSound(toneOverride?: SoundTone) {
  if (!isSoundEnabled()) return;
  const volume = getSoundVolume() / 100;
  const [f1, f2] = TONES[toneOverride ?? getSoundTone()];
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(f1, now);
    osc.frequency.setValueAtTime(f2, now + 0.12);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.22 * volume, 0.0001), now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.34);
  } catch {
    // Звук недоступен (например автоплей заблокирован до первого клика) — не критично
  }
}
