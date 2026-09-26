/**
 * Hospital Emergency & Ticker Audio Tone Generator
 * Web Audio API synthesizer for customizable emergency severity alert tones.
 */

export type EmergencySeverity = 'critical' | 'warning' | 'info' | 'success';

export interface ToneOption {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  severity: EmergencySeverity;
  iconName?: string;
}

export const CRITICAL_TONES: ToneOption[] = [
  {
    id: 'siren_pulse',
    nameAr: 'صفارة إنذار طوارئ نبضية',
    nameEn: 'Urgent Pulsing Siren',
    descriptionAr: 'تردد متصاعد نبضي حاد لكود الطوارئ والأزمات الكبرى',
    severity: 'critical'
  },
  {
    id: 'high_low_alarm',
    nameAr: 'إنذار ثنائي التردد (High-Low)',
    nameEn: 'High-Low Dual Alarm',
    descriptionAr: 'نغمة إنذار طبية متناوبة عالية الحدة لفرق الاستجابة السريعة',
    severity: 'critical'
  },
  {
    id: 'rapid_beeps',
    nameAr: 'رنات إنذار ثلاثية سريعة',
    nameEn: 'Triple Rapid Staccato',
    descriptionAr: 'ثلاث نبضات صوتية سريعة حادة لامتلاء الأسرة وأجهزة التنفس',
    severity: 'critical'
  },
  {
    id: 'code_cardiac',
    nameAr: 'نغمة الإنعاش القلبي الحاد',
    nameEn: 'Cardiac / Resus Code Alert',
    descriptionAr: 'إنذار شاشات مراقبة الصدمات والإنعاش الرئوي الفوري',
    severity: 'critical'
  }
];

export const WARNING_TONES: ToneOption[] = [
  {
    id: 'hospital_chime_alert',
    nameAr: 'رنة تنبيه المستشفيات الكلاسيكية',
    nameEn: 'Hospital Warning Chime',
    descriptionAr: 'نغمة محطة التمريض الثنائية لتنبيهات الضغط العالي',
    severity: 'warning'
  },
  {
    id: 'intermittent_beep',
    nameAr: 'تنبيه متقطع ثنائي النبرة',
    nameEn: 'Intermittent Dual Beep',
    descriptionAr: 'نبضتان تحذيريتان للأجهزة الطبية وبنك الدم',
    severity: 'warning'
  },
  {
    id: 'sonar_pulse',
    nameAr: 'نبضة تحذير سونار وقور',
    nameEn: 'Sonar Pulse Caution',
    descriptionAr: 'موجة صوتية متدرجة لضغط أقسام الطوارئ',
    severity: 'warning'
  },
  {
    id: 'marimba_warning',
    nameAr: 'نغمة ماريمبا تنبيهية إيقاعية',
    nameEn: 'Melodic Caution Chime',
    descriptionAr: 'ثلاث نوتات تنبيهية تصاعدية واضحة غير مزعجة',
    severity: 'warning'
  }
];

export const INFO_TONES: ToneOption[] = [
  {
    id: 'gentle_ping',
    nameAr: 'رنين بلوري خافت وناعم',
    nameEn: 'Gentle Crystal Ping',
    descriptionAr: 'رنة نقية هادئة لإشعارات الجاهزية والروتين',
    severity: 'info'
  },
  {
    id: 'smooth_two_tone',
    nameAr: 'رنة خافتة مزدوجة هادئة',
    nameEn: 'Smooth Two-Tone',
    descriptionAr: 'نغمة دافئة متدرجة لاستقرار شبكة الأكسجين والعمليات',
    severity: 'info'
  },
  {
    id: 'soft_bell',
    nameAr: 'جرس هادئ بيئي',
    nameEn: 'Subtle Ambient Bell',
    descriptionAr: 'رنين جرس خفيف لتأكيد حالة الجاهزية الطبيعية',
    severity: 'info'
  },
  {
    id: 'silent',
    nameAr: 'صامت (بدون صوت للمستوى العادي)',
    nameEn: 'Silent (No Sound)',
    descriptionAr: 'كتم النغمات للحالات الروتينية والإبقاء عليها للحالات الحرجة فقط',
    severity: 'info'
  }
];

export interface EmergencyToneSettings {
  soundEnabled: boolean;
  autoPlayOnRotation: boolean;
  volume: number; // 0.1 to 1.0
  tones: {
    critical: string;
    warning: string;
    info: string;
    success: string;
  };
}

export const DEFAULT_EMERGENCY_TONE_SETTINGS: EmergencyToneSettings = {
  soundEnabled: true,
  autoPlayOnRotation: false, // rotate silently unless manual or severity change
  volume: 0.65,
  tones: {
    critical: 'siren_pulse',
    warning: 'hospital_chime_alert',
    info: 'gentle_ping',
    success: 'smooth_two_tone'
  }
};

const STORAGE_KEY = 'his_emergency_tone_settings_v1';

export function loadEmergencyToneSettings(): EmergencyToneSettings {
  if (typeof window === 'undefined') return DEFAULT_EMERGENCY_TONE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EMERGENCY_TONE_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_EMERGENCY_TONE_SETTINGS,
      ...parsed,
      tones: {
        ...DEFAULT_EMERGENCY_TONE_SETTINGS.tones,
        ...(parsed.tones || {})
      }
    };
  } catch {
    return DEFAULT_EMERGENCY_TONE_SETTINGS;
  }
}

export function saveEmergencyToneSettings(settings: EmergencyToneSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedAudioContext) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        sharedAudioContext = new AudioCtx();
      }
    }
    if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume();
    }
    return sharedAudioContext;
  } catch {
    return null;
  }
}

/**
 * Play synthesizer tone for a given emergency severity or specific tone id
 */
export function playEmergencyTone(
  severity: EmergencySeverity,
  customToneId?: string,
  customVolume?: number
): void {
  const settings = loadEmergencyToneSettings();
  if (!settings.soundEnabled && customToneId === undefined) {
    return;
  }

  const toneId = customToneId || settings.tones[severity] || (
    severity === 'critical' ? 'siren_pulse' :
    severity === 'warning' ? 'hospital_chime_alert' :
    'gentle_ping'
  );

  if (toneId === 'silent') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const vol = Math.min(1.0, Math.max(0.1, customVolume ?? settings.volume));

  const now = ctx.currentTime;

  try {
    switch (toneId) {
      // -------------------------------------------------------------
      // CRITICAL TONES
      // -------------------------------------------------------------
      case 'siren_pulse': {
        // High-urgency oscillating emergency siren
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        // Frequency sweep siren effect
        osc.frequency.setValueAtTime(740, now);
        osc.frequency.linearRampToValueAtTime(1100, now + 0.15);
        osc.frequency.linearRampToValueAtTime(740, now + 0.3);
        osc.frequency.linearRampToValueAtTime(1100, now + 0.45);
        osc.frequency.linearRampToValueAtTime(740, now + 0.6);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3 * vol, now + 0.05);
        gain.gain.setValueAtTime(0.3 * vol, now + 0.55);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.75);
        break;
      }

      case 'high_low_alarm': {
        // Alternating European/British hospital high-low warble
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        // Tone 1 High (920Hz), Tone 2 Low (620Hz), repeated
        osc.frequency.setValueAtTime(920, now);
        osc.frequency.setValueAtTime(620, now + 0.18);
        osc.frequency.setValueAtTime(920, now + 0.36);
        osc.frequency.setValueAtTime(620, now + 0.54);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.35 * vol, now + 0.04);
        gain.gain.setValueAtTime(0.35 * vol, now + 0.68);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.9);
        break;
      }

      case 'rapid_beeps': {
        // 3 rapid sharp staccato alarm beeps (D6 1175Hz)
        const beeps = [0, 0.12, 0.24];
        beeps.forEach(startTime => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1174.66, now + startTime);

          gain.gain.setValueAtTime(0, now + startTime);
          gain.gain.linearRampToValueAtTime(0.28 * vol, now + startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + startTime + 0.08);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + startTime);
          osc.stop(now + startTime + 0.09);
        });
        break;
      }

      case 'code_cardiac': {
        // Deep resonant crash / resuscitation alert tone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(440, now);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.25);
        osc1.frequency.exponentialRampToValueAtTime(440, now + 0.5);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1320, now);
        osc2.frequency.setValueAtTime(1760, now + 0.25);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.38 * vol, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.7);
        osc2.stop(now + 0.7);
        break;
      }

      // -------------------------------------------------------------
      // WARNING TONES
      // -------------------------------------------------------------
      case 'hospital_chime_alert': {
        // Classic hospital 2-tone melodic warning chime (F5 -> D5)
        const notes = [
          { freq: 698.46, time: 0, dur: 0.28 },
          { freq: 587.33, time: 0.24, dur: 0.5 }
        ];

        notes.forEach(note => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note.freq, now + note.time);

          gain.gain.setValueAtTime(0, now + note.time);
          gain.gain.linearRampToValueAtTime(0.32 * vol, now + note.time + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + note.time);
          osc.stop(now + note.time + note.dur);
        });
        break;
      }

      case 'intermittent_beep': {
        // Two-tone modern medical warning beep (E5 659.25Hz)
        [0, 0.18].forEach(startTime => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(659.25, now + startTime);

          gain.gain.setValueAtTime(0, now + startTime);
          gain.gain.linearRampToValueAtTime(0.3 * vol, now + startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + startTime + 0.12);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + startTime);
          osc.stop(now + startTime + 0.14);
        });
        break;
      }

      case 'sonar_pulse': {
        // Sonar caution sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.45);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.35 * vol, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.55);
        break;
      }

      case 'marimba_warning': {
        // Ascending 3-note caution chord (C5, E5, G5)
        const chord = [
          { freq: 523.25, time: 0 },
          { freq: 659.25, time: 0.12 },
          { freq: 783.99, time: 0.24 }
        ];
        chord.forEach(n => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.freq, now + n.time);

          gain.gain.setValueAtTime(0, now + n.time);
          gain.gain.linearRampToValueAtTime(0.3 * vol, now + n.time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + n.time);
          osc.stop(now + n.time + 0.4);
        });
        break;
      }

      // -------------------------------------------------------------
      // INFO & SUCCESS TONES
      // -------------------------------------------------------------
      case 'gentle_ping': {
        // High pure crystal ping (C6 1046.5Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.24 * vol, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.38);
        break;
      }

      case 'smooth_two_tone': {
        // Warm gentle two-tone (G4 -> C5)
        const notes = [
          { freq: 392.0, time: 0, dur: 0.2 },
          { freq: 523.25, time: 0.16, dur: 0.4 }
        ];
        notes.forEach(note => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note.freq, now + note.time);

          gain.gain.setValueAtTime(0, now + note.time);
          gain.gain.linearRampToValueAtTime(0.22 * vol, now + note.time + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + note.time);
          osc.stop(now + note.time + note.dur);
        });
        break;
      }

      case 'soft_bell': {
        // Bell chime with octave overtone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(783.99, now); // G5
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1567.98, now); // G6 overtone

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.22 * vol, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
        break;
      }

      default: {
        // Fallback tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        gain.gain.setValueAtTime(0.2 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    }
  } catch {
    // Audio context may need initial user interaction
  }
}
