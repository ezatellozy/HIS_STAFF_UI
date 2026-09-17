/**
 * Public Address (PA) and Voice Announcement Simulation Utility
 *
 * NOTE:
 * 1. Voice PA is an OPTIONAL presentation profile for outpatient clinic queues and waiting halls.
 *    It is NOT part of core ADT data structures.
 * 2. Speech synthesis playback is a SIMULATED browser-supported demo experience (using window.speechSynthesis).
 * 3. Arabic dialect options (Standard, Gulf, Egypt) represent mock localization/speech profiles.
 */

import { EMERGENCY_CODES, HospitalEmergencyCode } from './emergencyCodes';

let cachedVoices: SpeechSynthesisVoice[] = [];

// Initialize voices safely
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch {
      // ignore
    }
  };
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Play a synthesized hospital chime tone using Web Audio API
 */
export function playHospitalTone(type: 'call' | 'alert' | 'success' = 'call'): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'call') {
      // High-low two-tone hospital queue chime (D5 -> A5)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.35, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.35); // A5
      gain2.gain.setValueAtTime(0, now + 0.35);
      gain2.gain.linearRampToValueAtTime(0.4, now + 0.4);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.35);
      osc2.stop(now + 1.2);
    } else if (type === 'alert') {
      // Dual-oscillator pulsating hospital emergency alarm
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(493.88, now); // B4
      osc1.frequency.setValueAtTime(783.99, now + 0.18); // G5
      osc1.frequency.setValueAtTime(493.88, now + 0.36);
      osc1.frequency.setValueAtTime(783.99, now + 0.54);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.18);
      gain2.gain.setValueAtTime(0.15, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.8);
    } else {
      // Pleasant confirmation chime
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch {
    // Audio context may require user interaction first
  }
}

/**
 * Get best matching voice for a language with intelligent priority for natural/neural Arabic voices
 */
function getMatchingVoice(langPrefix: string, preferredDialect: 'standard' | 'gulf' | 'egypt' = 'standard'): SpeechSynthesisVoice | undefined {
  if (cachedVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch {
      // ignore
    }
  }

  const isArabic = langPrefix.toLowerCase().startsWith('ar');
  if (isArabic) {
    // 1. High-priority neural/natural voice names
    const priorityNames = [
      'natural', 'neural', 'tariq', 'maged', 'laila', 'salma', 'shakir', 'fatima',
      'zeina', 'naayf', 'zayd', 'hoda', 'mariam', 'google', 'online', 'youssef'
    ];

    const dialectCodes = preferredDialect === 'egypt'
      ? ['ar-eg', 'ar-sa', 'ar-ae', 'ar']
      : preferredDialect === 'gulf'
      ? ['ar-sa', 'ar-ae', 'ar-kw', 'ar-qa', 'ar-eg', 'ar']
      : ['ar-sa', 'ar-eg', 'ar-ae', 'ar'];

    // Search by dialect and priority name
    for (const dCode of dialectCodes) {
      const matchWithPriority = cachedVoices.find(v => {
        const vl = v.lang.toLowerCase();
        const vn = v.name.toLowerCase();
        return vl.startsWith(dCode) && priorityNames.some(p => vn.includes(p));
      });
      if (matchWithPriority) return matchWithPriority;
    }

    // Secondary search: any voice matching the dialect code
    for (const dCode of dialectCodes) {
      const matchLang = cachedVoices.find(v => v.lang.toLowerCase().startsWith(dCode));
      if (matchLang) return matchLang;
    }

    // Tertiary search: any voice that has 'ar'
    return cachedVoices.find(v => v.lang.toLowerCase().startsWith('ar') || v.name.toLowerCase().includes('arabic'));
  }

  // English fallback
  return cachedVoices.find(v => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()));
}

/**
 * Phonetically formats Arabic text for clear, natural hospital announcement pronunciation
 */
export function formatArabicPhonetics(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // Format English letters in codes (e.g. A-102 -> حرف ألف مئة واثنان)
  cleaned = cleaned.replace(/\b([A-Za-z])[-_ ]?(\d+)\b/g, (_match, letter, num) => {
    const letterMap: Record<string, string> = {
      a: 'أَلِف', b: 'بَاء', c: 'سِي', d: 'دَال', e: 'إِي',
      f: 'إِف', g: 'جِي', h: 'إِتْش', i: 'آي', j: 'جِيه',
      k: 'كَاف', l: 'لَام', m: 'مِيم', n: 'نُون', o: 'أُو',
      p: 'بِي', q: 'كْيُو', r: 'آر', s: 'إِس', t: 'تِي',
      u: 'يُو', v: 'فِي', w: 'دَبْلِيُو', x: 'إِكْس', y: 'وَاي', z: 'زِد'
    };
    const arLetter = letterMap[letter.toLowerCase()] || letter;
    return `حَرْف ${arLetter}، رَقَم ${num}`;
  });

  // Expand common clinical acronyms into clear Arabic hospital terms
  cleaned = cleaned.replace(/\bER\b/gi, 'قِسْم الطَّوَارِئ')
                   .replace(/\bICU\b/gi, 'العِنَايَة المُرَكَّزَة')
                   .replace(/\bOPD\b/gi, 'العِيَادَات الخَارِجِيَّة')
                   .replace(/\bOR\b/gi, 'غُرَف العَمَلِيَّات')
                   .replace(/\bPACU\b/gi, 'غُرْفَة الإِفَاقَة')
                   .replace(/\bSTAT\b/gi, 'فَوْرِي وَحَرِج')
                   .replace(/\bMRN\b/gi, 'رَقَم المَلَف الطِّبِّي');

  // Add pauses and natural inflection markers
  cleaned = cleaned.replace(/[:]/g, '، ')
                   .replace(/[-]/g, ' ')
                   .replace(/\s{2,}/g, ' ')
                   .trim();

  return cleaned;
}

/**
 * Speak an announcement using browser SpeechSynthesis with tone prefix and enhanced Arabic phonetics
 */
export function speakAnnouncement(
  arabicText: string,
  englishText?: string,
  options?: {
    playTone?: 'call' | 'alert' | 'success';
    toneDelayMs?: number;
    rate?: number;
    pitch?: number;
    dialect?: 'standard' | 'gulf' | 'egypt';
    onStart?: () => void;
    onEnd?: () => void;
  }
): void {
  const {
    playTone = 'alert',
    toneDelayMs = 500,
    rate = 0.88, // slightly slower for clear, distinguished articulation
    pitch = 1.02,
    dialect = 'standard',
    onStart,
    onEnd
  } = options || {};

  // 1. Play tone first
  if (playTone) {
    playHospitalTone(playTone);
  }

  // If SpeechSynthesis is not supported
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onStart) onStart();
    setTimeout(() => {
      if (onEnd) onEnd();
    }, 1200);
    return;
  }

  // Cancel prior announcements to prevent overlap
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }

  setTimeout(() => {
    try {
      onStart?.();

      const arVoice = getMatchingVoice('ar', dialect);
      const enVoice = getMatchingVoice('en');

      // Preprocess Arabic with phonetics
      const vocalizedArabic = formatArabicPhonetics(arabicText);

      const arUtterance = new SpeechSynthesisUtterance(vocalizedArabic);
      arUtterance.lang = dialect === 'egypt' ? 'ar-EG' : 'ar-SA';
      arUtterance.rate = rate;
      arUtterance.pitch = pitch;
      if (arVoice) arUtterance.voice = arVoice;

      if (englishText) {
        arUtterance.onend = () => {
          try {
            const enUtterance = new SpeechSynthesisUtterance(englishText);
            enUtterance.lang = 'en-US';
            enUtterance.rate = rate;
            enUtterance.pitch = pitch;
            if (enVoice) enUtterance.voice = enVoice;
            enUtterance.onend = () => {
              onEnd?.();
            };
            enUtterance.onerror = () => {
              onEnd?.();
            };
            window.speechSynthesis.speak(enUtterance);
          } catch {
            onEnd?.();
          }
        };
      } else {
        arUtterance.onend = () => {
          onEnd?.();
        };
      }

      arUtterance.onerror = () => {
        onEnd?.();
      };

      window.speechSynthesis.speak(arUtterance);
    } catch {
      onEnd?.();
    }
  }, toneDelayMs);
}

/**
 * Announce Hospital Emergency Code with alarm sound and spoken Arabic/English announcement
 */
export function announceEmergencyCodeSpeech(
  code: string,
  customLocation?: string,
  callbacks?: { onStart?: () => void; onEnd?: () => void }
): void {
  const conf = EMERGENCY_CODES[code as HospitalEmergencyCode];

  let arText = '';
  let enText = '';

  if (conf) {
    const loc = customLocation || conf.locationDefault;
    arText = `انتباه من فضلكم. ${conf.shortLabel}! ${conf.shortLabel}! ${conf.categoryAr} في ${loc}.`;
    enText = `Attention please. ${conf.nameEn}! ${conf.nameEn}! In ${loc}.`;
  } else {
    arText = `انتباه من فضلكم. نداء طوارئ كود: ${code}. يرجى التوجه فوراً.`;
    enText = `Attention please. Hospital Emergency Code: ${code}.`;
  }

  speakAnnouncement(arText, enText, {
    playTone: 'alert',
    toneDelayMs: 650,
    rate: 0.92,
    onStart: callbacks?.onStart,
    onEnd: callbacks?.onEnd
  });
}

/**
 * Announce cancellation / clear of emergency codes
 */
export function announceClearEmergencySpeech(callbacks?: { onStart?: () => void; onEnd?: () => void }): void {
  const arText = 'تم إنهاء وإلغاء حالة الطوارئ. الحالة آمنة الآن بجميع الأقسام.';
  const enText = 'All clear. The hospital emergency code is now cancelled.';

  speakAnnouncement(arText, enText, {
    playTone: 'success',
    toneDelayMs: 400,
    rate: 0.95,
    onStart: callbacks?.onStart,
    onEnd: callbacks?.onEnd
  });
}

/**
 * Helper to get the formatted preview text in both Arabic and English without speaking
 */
export function getPatientCallTextPreview(data: {
  ticketNo: string;
  patientName?: string;
  clinicName?: string;
  roomNo?: string;
  dialect?: 'standard' | 'gulf' | 'egypt';
}): { arabicText: string; englishText: string } {
  const { ticketNo, patientName, clinicName, roomNo, dialect = 'standard' } = data;
  let arText = '';
  if (dialect === 'gulf') {
    arText = `نِداء للمراجع الكريم: تذكرة رقم ${ticketNo}.`;
    if (patientName) arText += ` المراجع ${patientName}.`;
    if (clinicName) arText += ` تفضل إلى ${clinicName}.`;
    if (roomNo) arText += ` ${roomNo}.`;
  } else if (dialect === 'egypt') {
    arText = `نداء: تذكرة رقم ${ticketNo}.`;
    if (patientName) arText += ` الأستاذ / الأستاذة ${patientName}.`;
    if (clinicName) arText += ` يرجى التوجه لـ ${clinicName}.`;
    if (roomNo) arText += ` ${roomNo}.`;
  } else {
    arText = `نداء للمراجع: التذكرة رقم ${ticketNo}.`;
    if (patientName) arText += ` المريض: ${patientName}.`;
    if (clinicName) arText += ` يُرجى التوجه إلى ${clinicName}.`;
    if (roomNo) arText += ` ${roomNo}.`;
  }

  const enText = `Ticket ${ticketNo}. ${patientName ? patientName + '.' : ''} Please proceed to ${clinicName || 'Clinic'} ${roomNo || ''}.`;
  return { arabicText: arText, englishText: enText };
}

/**
 * Announce patient queue call with ticket number and clinic using dignified, natural hospital phrasing
 */
export function announcePatientCallSpeech(
  data: {
    ticketNo: string;
    patientName?: string;
    clinicName?: string;
    roomNo?: string;
    dialect?: 'standard' | 'gulf' | 'egypt';
  },
  callbacks?: { onStart?: () => void; onEnd?: () => void }
): void {
  const { ticketNo, patientName, clinicName, roomNo, dialect = 'standard' } = data;

  // Natural Arabic phrasing with vocal cadence and respectful address
  let arText = '';
  if (dialect === 'gulf') {
    arText = `نِدَاءْ لِلْمُرَاجِعْ الْكَرِيمْ: تِذْكِرَةْ رَقَمْ ${ticketNo}.`;
    if (patientName) {
      arText += ` المُرَاجِعْ ${patientName}.`;
    }
    if (clinicName) {
      arText += ` تَفَضَّلْ إِلَى ${clinicName}.`;
    }
    if (roomNo) {
      arText += ` ${roomNo}.`;
    }
  } else if (dialect === 'egypt') {
    arText = `نِدَاءْ: تِذْكِرَةْ رَقَمْ ${ticketNo}.`;
    if (patientName) {
      arText += ` الأُسْتَاذْ أو الأُسْتَاذَة ${patientName}.`;
    }
    if (clinicName) {
      arText += ` يِرْجَى التَّوَجُّه لِـ ${clinicName}.`;
    }
    if (roomNo) {
      arText += ` ${roomNo}.`;
    }
  } else {
    // Standard hospital phrasing (clear Modern Standard Arabic)
    arText = `نِدَاءٌ لِلْمُرَاجِع: التَّذْكِرَة رَقَم ${ticketNo}.`;
    if (patientName) {
      arText += ` المَرِيض: ${patientName}.`;
    }
    if (clinicName) {
      arText += ` يُرْجَى التَّوَجُّه إِلَى ${clinicName}.`;
    }
    if (roomNo) {
      arText += ` ${roomNo}.`;
    }
  }

  const enText = `Ticket ${ticketNo}. ${patientName ? patientName + '.' : ''} Please proceed to ${clinicName || 'Clinic'} ${roomNo || ''}.`;

  speakAnnouncement(arText, enText, {
    playTone: 'call',
    toneDelayMs: 450,
    rate: 0.88, // Natural measured cadence for public address systems
    pitch: 1.02,
    dialect,
    onStart: callbacks?.onStart,
    onEnd: callbacks?.onEnd
  });
}
