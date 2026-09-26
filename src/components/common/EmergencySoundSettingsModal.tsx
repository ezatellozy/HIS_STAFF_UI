import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Bell,
  BellOff,
  Check,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Info,
  X,
  Sliders
} from 'lucide-react';
import {
  EmergencySeverity,
  EmergencyToneSettings,
  CRITICAL_TONES,
  WARNING_TONES,
  INFO_TONES,
  playEmergencyTone,
  DEFAULT_EMERGENCY_TONE_SETTINGS
} from '../../utils/emergencyTones';

interface EmergencySoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EmergencyToneSettings;
  onSaveSettings: (newSettings: EmergencyToneSettings) => void;
  currentAlertSeverity?: EmergencySeverity;
}

export const EmergencySoundSettingsModal: React.FC<EmergencySoundSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  currentAlertSeverity = 'critical'
}) => {
  const [localSettings, setLocalSettings] = useState<EmergencyToneSettings>(settings);
  const [playingToneId, setPlayingToneId] = useState<string | null>(null);

  // Sync state if props change
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleToggleSound = (enabled: boolean) => {
    const updated = { ...localSettings, soundEnabled: enabled };
    setLocalSettings(updated);
    onSaveSettings(updated);
    if (enabled) {
      playEmergencyTone('info', updated.tones.info, updated.volume);
    }
  };

  const handleToggleAutoPlay = (autoPlay: boolean) => {
    const updated = { ...localSettings, autoPlayOnRotation: autoPlay };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleVolumeChange = (vol: number) => {
    const updated = { ...localSettings, volume: vol };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleToneChange = (severity: 'critical' | 'warning' | 'info', toneId: string) => {
    const updated = {
      ...localSettings,
      tones: {
        ...localSettings.tones,
        [severity]: toneId
      }
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const previewTone = (severity: EmergencySeverity, toneId: string) => {
    setPlayingToneId(toneId);
    playEmergencyTone(severity, toneId, localSettings.volume);
    setTimeout(() => {
      setPlayingToneId(prev => (prev === toneId ? null : prev));
    }, 900);
  };

  const applyPreset = (preset: 'standard' | 'gentle' | 'urgent') => {
    let newTones = { ...localSettings.tones };
    if (preset === 'standard') {
      newTones = {
        critical: 'siren_pulse',
        warning: 'hospital_chime_alert',
        info: 'gentle_ping',
        success: 'smooth_two_tone'
      };
    } else if (preset === 'gentle') {
      newTones = {
        critical: 'high_low_alarm',
        warning: 'marimba_warning',
        info: 'silent',
        success: 'soft_bell'
      };
    } else if (preset === 'urgent') {
      newTones = {
        critical: 'rapid_beeps',
        warning: 'intermittent_beep',
        info: 'gentle_ping',
        success: 'smooth_two_tone'
      };
    }

    const updated = { ...localSettings, tones: newTones };
    setLocalSettings(updated);
    onSaveSettings(updated);
    playEmergencyTone('critical', newTones.critical, updated.volume);
  };

  const resetToDefault = () => {
    setLocalSettings(DEFAULT_EMERGENCY_TONE_SETTINGS);
    onSaveSettings(DEFAULT_EMERGENCY_TONE_SETTINGS);
    playEmergencyTone('info', DEFAULT_EMERGENCY_TONE_SETTINGS.tones.info, DEFAULT_EMERGENCY_TONE_SETTINGS.volume);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>إعدادات التنبيهات الصوتية ونغمات الطوارئ</span>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                  Audio Tones
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تخصيص نغمات شريط التنبيهات والأكواد حسب درجة خطورة الحدث السريري
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Master Toggles & Volume Panel */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg border transition-colors ${
                    localSettings.soundEnabled
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                      : 'bg-rose-950/80 text-rose-400 border-rose-800'
                  }`}
                >
                  {localSettings.soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">التنبيهات الصوتية لشريط الطوارئ</div>
                  <div className="text-[11px] text-slate-400">
                    {localSettings.soundEnabled
                      ? 'التنبيهات الصوتية مفعّلة وتطلق نغمات حسب درجة الخطورة'
                      : 'تم كتم جميع نغمات شريط الطوارئ والجاهزية'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleSound(!localSettings.soundEnabled)}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border shadow-xs ${
                  localSettings.soundEnabled
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                {localSettings.soundEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>مفعّل (تشغيل الصوت)</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>معطّل (صامت)</span>
                  </>
                )}
              </button>
            </div>

            {/* Volume & Auto-Play Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Volume Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>مستوى صوت التنبيه:</span>
                  </span>
                  <span className="font-mono text-teal-400 font-bold">
                    {Math.round(localSettings.volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={localSettings.volume}
                  onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-teal-500 bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Auto-play on Rotation toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div>
                  <div className="font-semibold text-slate-200 text-xs">صوت التمرير التلقائي</div>
                  <div className="text-[10px] text-slate-400">
                    تشغيل نغمة عند تدوير شريط الطوارئ تلقائياً
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleAutoPlay(!localSettings.autoPlayOnRotation)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    localSettings.autoPlayOnRotation ? 'bg-teal-600' : 'bg-slate-700'
                  }`}
                  aria-label="تبديل صوت التمرير التلقائي"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      localSettings.autoPlayOnRotation ? 'translate-x-1' : 'translate-x-6'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>إعدادات جاهزة (Sound Profiles):</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => applyPreset('standard')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                مستشفى قياسي
              </button>
              <button
                type="button"
                onClick={() => applyPreset('gentle')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                هادئ وناعم
              </button>
              <button
                type="button"
                onClick={() => applyPreset('urgent')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                تأهب حاد (High Alert)
              </button>
            </div>
          </div>

          {/* Severity 1: Critical Emergency (درجة الخطورة القصوى) */}
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-600 text-white font-bold">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold text-rose-200 text-sm flex items-center gap-2">
                    <span>درجة الخطورة القصوى (Critical)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-600/40 text-rose-200 border border-rose-500/50">
                      كود أحمر / امتلاء ICU / أزمة غازات
                    </span>
                  </div>
                  <div className="text-[11px] text-rose-300/70">
                    أعلى مستوى إنذار طبي للأحداث المهددة للحياة فورياً
                  </div>
                </div>
              </div>

              {/* Preview Button for Critical */}
              <button
                type="button"
                onClick={() => previewTone('critical', localSettings.tones.critical)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  playingToneId === localSettings.tones.critical
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                    : 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border-rose-800'
                }`}
                title="استماع وتجربة النغمة المحددة"
              >
                {playingToneId === localSettings.tones.critical ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>جاري التشغيل...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>تجربة النغمة</span>
                  </>
                )}
              </button>
            </div>

            {/* Critical Tone Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {CRITICAL_TONES.map(tone => {
                const isSelected = localSettings.tones.critical === tone.id;
                return (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => {
                      handleToneChange('critical', tone.id);
                      previewTone('critical', tone.id);
                    }}
                    className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-rose-900/60 border-rose-500 text-white ring-1 ring-rose-400/50'
                        : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        {isSelected && <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        <span>{tone.nameAr}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                        {tone.descriptionAr}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {tone.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity 2: Warning (درجة الخطورة المتوسطة) */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-600 text-white font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold text-amber-200 text-sm flex items-center gap-2">
                    <span>درجة الخطورة المتوسطة والتحذيرات (Warning)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-600/40 text-amber-200 border border-amber-500/50">
                      نقص أسرة / ضغط طوارئ / تنبيه كود أصفر
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-300/70">
                    تنبيهات استباقية للأقسام الطبية لمنع حدوث أزمات تشغيلية
                  </div>
                </div>
              </div>

              {/* Preview Button for Warning */}
              <button
                type="button"
                onClick={() => previewTone('warning', localSettings.tones.warning)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  playingToneId === localSettings.tones.warning
                    ? 'bg-amber-600 text-white border-amber-400 animate-pulse'
                    : 'bg-amber-950/80 hover:bg-amber-900 text-amber-200 border-amber-800'
                }`}
                title="استماع وتجربة النغمة المحددة"
              >
                {playingToneId === localSettings.tones.warning ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>جاري التشغيل...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>تجربة النغمة</span>
                  </>
                )}
              </button>
            </div>

            {/* Warning Tone Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {WARNING_TONES.map(tone => {
                const isSelected = localSettings.tones.warning === tone.id;
                return (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => {
                      handleToneChange('warning', tone.id);
                      previewTone('warning', tone.id);
                    }}
                    className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-900/60 border-amber-500 text-white ring-1 ring-amber-400/50'
                        : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        <span>{tone.nameAr}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                        {tone.descriptionAr}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {tone.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity 3: Info & Normal (درجة الخطورة العادية / الروتين) */}
          <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-600 text-white font-bold">
                  <Info className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold text-teal-200 text-sm flex items-center gap-2">
                    <span>درجة الجاهزية والروتين (Info / Normal)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-600/40 text-teal-200 border border-teal-500/50">
                      شبكة الأكسجين مستقرة / بنك الدم / العمليات
                    </span>
                  </div>
                  <div className="text-[11px] text-teal-300/70">
                    إشعارات متابعة الحالة الطبيعية والجاهزية اليومية بالمستشفى
                  </div>
                </div>
              </div>

              {/* Preview Button for Info */}
              <button
                type="button"
                onClick={() => previewTone('info', localSettings.tones.info)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  playingToneId === localSettings.tones.info
                    ? 'bg-teal-600 text-white border-teal-400 animate-pulse'
                    : 'bg-teal-950/80 hover:bg-teal-900 text-teal-200 border-teal-800'
                }`}
                title="استماع وتجربة النغمة المحددة"
              >
                {playingToneId === localSettings.tones.info ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>جاري التشغيل...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>تجربة النغمة</span>
                  </>
                )}
              </button>
            </div>

            {/* Info Tone Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {INFO_TONES.map(tone => {
                const isSelected = localSettings.tones.info === tone.id;
                return (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => {
                      handleToneChange('info', tone.id);
                      previewTone('info', tone.id);
                    }}
                    className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-teal-900/60 border-teal-500 text-white ring-1 ring-teal-400/50'
                        : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        {isSelected && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                        <span>{tone.nameAr}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                        {tone.descriptionAr}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {tone.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetToDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة الإعدادات الافتراضية</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const activeSev: EmergencySeverity = (currentAlertSeverity || 'critical') as EmergencySeverity;
                const toneForCurrent =
                  activeSev === 'critical'
                    ? localSettings.tones.critical
                    : activeSev === 'warning'
                    ? localSettings.tones.warning
                    : localSettings.tones.info;
                previewTone(activeSev, toneForCurrent);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-teal-200 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>اختبار نغمة التنبيه الحالي النشط</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-colors cursor-pointer"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
