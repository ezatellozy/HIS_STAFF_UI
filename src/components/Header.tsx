import React, { useState, useEffect } from 'react';
import {
  Activity,
  UserCheck,
  Stethoscope,
  HeartHandshake,
  ShieldCheck,
  Tv,
  Volume2,
  VolumeX,
  AlertTriangle,
  Building2,
  Users,
  ChevronDown,
  FileCode,
  Siren,
  Bed,
  Scissors,
  GitFork,
  Clock,
  Radio,
  Layers,
  LogOut,
  Search,
  Briefcase,
  SlidersHorizontal,
  X,
  FlaskConical,
  Pill,
  Droplet,
  Boxes,
  ShoppingCart,
  DollarSign,
  BookOpen,
  Landmark,
  Receipt,
  Flame,
  HeartPulse,
  FileText
} from 'lucide-react';
import { useHis } from '../context/HisContext';
import { StaffRole, HospitalDepartment } from '../types/his';
import { EMERGENCY_CODES, HospitalEmergencyCode, EMERGENCY_CODE_LIST } from '../utils/emergencyCodes';
import { EdinaLogo } from './common/EdinaLogo';

export const Header: React.FC = () => {
  const {
    currentDepartment,
    setCurrentDepartment,
    currentRole,
    setCurrentRole,
    userAvailableRoles,
    currentStaff,
    allStaff,
    setCurrentStaff,
    clinics,
    activeClinicId,
    setActiveClinicId,
    activeClinic,
    appointments,
    emergencyCode,
    emergencyCodeLocation,
    setEmergencyCode,
    triggerEmergencyCode,
    replayEmergencyCodeVoice,
    soundEnabled,
    setSoundEnabled,
    voiceAnnouncementEnabled,
    setVoiceAnnouncementEnabled,
    isSpeakingAnnouncement,
    setIsPublicQueueModalOpen,
    playChime,
    erPatients,
    wardBeds,
    icuBeds,
    surgeryCases,
    activeSecurityGroup,
    setIsSwitchGroupModalOpen,
    logout,
    activeWorkArea,
    setActiveWorkArea,
    activeWorkspacePatientId,
    openPatientWorkspace,
    closePatientWorkspace,
    clinicalTasks,
    patients
  } = useHis();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);
  const [showClinicMenu, setShowClinicMenu] = useState<boolean>(false);
  const [showEmergencyMenu, setShowEmergencyMenu] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const activeWorkspacePatient = activeWorkspacePatientId
    ? (patients.find(p => p.id === activeWorkspacePatientId) ||
       patients.find(p => p.mrn.toLowerCase() === activeWorkspacePatientId.toLowerCase()))
    : null;

  const pendingTasksTotal = clinicalTasks.filter(t => t.status === 'pending').length;

  const searchResults = searchQuery.trim()
    ? patients.filter(
        p =>
          (p.fullNameAr || p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.fullNameEn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.nationalId.includes(searchQuery)
      ).slice(0, 6)
    : [];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
      setCurrentDate(
        now.toLocaleDateString('ar-EG', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const rolesConfig: { role: StaffRole; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    {
      role: 'reception',
      labelAr: 'الاستقبال والقبول',
      labelEn: 'Reception',
      icon: <UserCheck className="w-3.5 h-3.5" />
    },
    {
      role: 'doctor',
      labelAr: 'طبيب العيادات',
      labelEn: 'Physician',
      icon: <Stethoscope className="w-3.5 h-3.5" />
    },
    {
      role: 'nurse',
      labelAr: 'التمريض والفرز',
      labelEn: 'Nursing',
      icon: <HeartHandshake className="w-3.5 h-3.5" />
    },
    {
      role: 'admin',
      labelAr: 'إدارة النظام والـ HIS',
      labelEn: 'Admin',
      icon: <ShieldCheck className="w-3.5 h-3.5" />
    }
  ];

  const waitingCount = appointments.filter(a => a.status === 'checked_in' || a.status === 'triage_completed').length;
  const inDoctorCount = appointments.filter(a => a.status === 'with_doctor').length;
  const activeErCount = erPatients.filter(p => p.status !== 'discharged').length;
  const occupiedBedsCount = wardBeds.filter(b => b.status === 'occupied').length;
  const activeIcuCount = icuBeds.filter(b => b.patientId).length;
  const activeSurgeryCount = surgeryCases.filter(c => c.status === 'in_theatre').length;

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 shadow-md sticky top-0 z-40">
      {/* Top Banner for Emergency Code */}
      {emergencyCode && (() => {
        const codeConfig = EMERGENCY_CODES[emergencyCode as HospitalEmergencyCode];
        const bannerBg = codeConfig?.bgBannerClass || 'bg-red-600';
        const titleAr = codeConfig?.nameAr || `كود طوارئ: ${emergencyCode}`;
        const descAr = codeConfig?.descriptionAr || 'نداء طوارئ عاجل بالمستشفى';
        const loc = emergencyCodeLocation || codeConfig?.locationDefault || 'مبنى العيادات الخارجية - الدور الثاني';

        return (
          <div className={`${bannerBg} text-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-lg transition-all`}>
            <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm md:text-base">
              <span className="p-1 sm:p-1.5 rounded-full bg-white/20 shrink-0">
                <Siren className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-bounce" />
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="bg-black/30 px-2 py-0.5 rounded text-[11px] sm:text-xs font-mono tracking-wider border border-white/20">
                  {codeConfig?.nameEn || emergencyCode}
                </span>
                <span className="font-extrabold">{titleAr}</span>
                <span className="hidden md:inline text-white/90 text-xs font-medium">| {descAr}</span>
                <span className="text-[11px] sm:text-xs bg-white/20 px-2 py-0.5 rounded font-mono font-normal">
                  📍 {loc}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Voice Speaking Indicator */}
              {isSpeakingAnnouncement && (
                <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg text-xs font-medium text-amber-200 border border-amber-400/40 animate-pulse">
                  <Radio className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="hidden sm:inline">جاري نداء الكود صوتياً...</span>
                  <span className="sm:hidden">إذاعة...</span>
                </div>
              )}

              {/* Re-announce voice button */}
              <button
                onClick={() => replayEmergencyCodeVoice()}
                className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg font-bold border border-white/30 transition-colors cursor-pointer"
                title="إعادة نداء الكود صوتياً عبر مكبر الصوت (Re-announce Code Aloud)"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>إعادة النداء صوتياً</span>
              </button>

              {/* Clear Alert button */}
              <button
                onClick={() => {
                  triggerEmergencyCode(null);
                }}
                className="text-xs bg-black/40 hover:bg-black/60 px-3 py-1 rounded-lg font-bold border border-white/30 text-white transition-colors cursor-pointer"
              >
                إلغاء التنبيه (Clear)
              </button>
            </div>
          </div>
        );
      })()}

      {/* Row 1: Global Navigation & Hospital Modules */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Right (RTL): Edina HIS Brand Logo & Hospital Identity */}
          <div className="flex items-center shrink-0">
            <EdinaLogo size="md" theme="dark" showSubtitle={true} />
          </div>

          {/* Universal Patient Quick Search (Enterprise Bar) */}
          <div className="relative flex-1 max-w-md mx-2 sm:mx-4 hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                placeholder="بحث سريري سريع عن مريض (الاسم، الرقم الطبي MRN، الهوية)..."
                className="w-full pl-8 pr-9 py-1.5 rounded-xl bg-slate-800/90 text-slate-100 placeholder:text-slate-400 border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-xs font-medium transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Search Dropdown Results */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full mt-1.5 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                  <span>نتائج البحث المباشر ({searchResults.length}):</span>
                  <span className="text-teal-400">انقر لفتح الملف السريري للمريض فوراً</span>
                </div>
                {searchResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      openPatientWorkspace(p.id, 'summary', {
                        department: currentDepartment,
                        label: 'بحث سريع'
                      });
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      playChime('call');
                    }}
                    className="w-full text-right px-3 py-2 hover:bg-slate-800/80 transition-colors flex items-center justify-between group cursor-pointer border-b border-slate-800/40 last:border-0"
                  >
                    <div>
                      <div className="font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        MRN: {p.mrn} • {p.age} سنة • {p.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                      فتح الملف ➔
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Left (RTL): Global Action Controls & Staff Identity */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Waiting Room Hall TV Display */}
            <button
              onClick={() => {
                setIsPublicQueueModalOpen(true);
                playChime('call');
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
              title="عرض شاشة صالة الانتظار العامة للمرضى (Queue TV Display)"
            >
              <Tv className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span className="hidden lg:inline text-[11px]">شاشة الصالة</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title={soundEnabled ? 'كتم صوت النداء الصوتي' : 'تفعيل صوت النداء الصوتي'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
              )}
            </button>

            {/* Emergency Code Selector & Voice Announcement Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowEmergencyMenu(prev => !prev)}
                className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border transition-all cursor-pointer ${
                  emergencyCode
                    ? 'bg-red-600 text-white border-red-400 animate-pulse font-bold shadow-md'
                    : 'bg-red-950/60 hover:bg-red-900/70 text-red-400 border-red-800/60'
                }`}
                title="أكواد طوارئ المستشفى والنداء الصوتي (Hospital Emergency Codes)"
              >
                <Siren className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${emergencyCode ? 'animate-bounce' : ''}`} />
                <span className="text-xs font-bold hidden lg:inline">
                  {emergencyCode
                    ? EMERGENCY_CODES[emergencyCode as HospitalEmergencyCode]?.shortLabel || emergencyCode
                    : 'أكواد الطوارئ'}
                </span>
                <ChevronDown className="w-3 h-3 text-red-300 hidden sm:inline" />
              </button>

              {showEmergencyMenu && (
                <div
                  className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-red-800/80 rounded-xl shadow-2xl z-50 p-2.5 text-right"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs">
                      <Siren className="w-4 h-4" />
                      <span>نداء أكواد الطوارئ بالمستشفى</span>
                    </div>
                    <button
                      onClick={() => setShowEmergencyMenu(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-2 leading-tight">
                    اضغط لإطلاق نداء الطوارئ فوراً بالمستشفى؛ يصدر جرس إنذار ويتم نداء الكود صوتياً:
                  </p>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
                    {EMERGENCY_CODE_LIST.map(item => {
                      const isCurrent = emergencyCode === item.code;
                      return (
                        <button
                          key={item.code}
                          onClick={() => {
                            triggerEmergencyCode(item.code);
                            setShowEmergencyMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-right transition-all cursor-pointer border ${
                            isCurrent
                              ? 'bg-slate-800 border-red-500 shadow-sm'
                              : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                              style={{ backgroundColor: item.colorHex }}
                            />
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{item.nameAr}</span>
                                {isCurrent && (
                                  <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-mono">
                                    نشط الآن
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 leading-tight">
                                {item.categoryAr}
                              </div>
                            </div>
                          </div>
                          <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </button>
                      );
                    })}
                  </div>

                  {emergencyCode && (
                    <div className="pt-2 mt-2 border-t border-slate-800 flex gap-2">
                      <button
                        onClick={() => {
                          replayEmergencyCodeVoice();
                          setShowEmergencyMenu(false);
                        }}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                        <span>إعادة نداء الكود</span>
                      </button>
                      <button
                        onClick={() => {
                          triggerEmergencyCode(null);
                          setShowEmergencyMenu(false);
                        }}
                        className="flex-1 bg-red-900/60 hover:bg-red-800/80 text-red-200 py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        إلغاء التنبيه
                      </button>
                    </div>
                  )}

                  {/* Voice setting quick toggle */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 px-1">
                    <span>صوت النداء (نطق الكود):</span>
                    <button
                      onClick={() => setVoiceAnnouncementEnabled(!voiceAnnouncementEnabled)}
                      className={`font-bold px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                        voiceAnnouncementEnabled
                          ? 'bg-teal-950 text-teal-300 border border-teal-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {voiceAnnouncementEnabled ? '🔊 مفعل (ينطق الكود)' : '🔇 نغمة فقط'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Active Role / Persona Switcher: "بصفتي ماذا أعمل الآن؟" */}
            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 px-1 hidden xl:inline" title="بصفتي ماذا أعمل الآن؟ (الدور السريري النشط)">
                بصفتي:
              </span>
              {userAvailableRoles.map(r => {
                const conf = rolesConfig.find(item => item.role === r) || {
                  role: r,
                  labelAr: r === 'doctor' ? 'طبيب' : r === 'nurse' ? 'تمريض' : r === 'admin' ? 'إدارة' : 'استقبال',
                  labelEn: r,
                  icon: <UserCheck className="w-3.5 h-3.5" />
                };
                const isActive = currentRole === r;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      setCurrentRole(r);
                      playChime('call');
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                    title={`العمل بصفتي: ${conf.labelAr} (لا يمنح صلاحيات جديدة خارج الصلاحيات المعينة)`}
                  >
                    {conf.icon}
                    <span>{conf.labelAr}</span>
                  </button>
                );
              })}
            </div>

            {/* Responsibility Group Quick Switcher */}
            <button
              onClick={() => setIsSwitchGroupModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-teal-950/60 hover:bg-teal-900/80 text-teal-300 border border-teal-800/80 text-xs font-bold transition-all cursor-pointer"
              title="مجموعة الصلاحيات والمسؤولية السريرية الحالية (انقر للتبديل السريع)"
            >
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-mono text-[10px] bg-teal-900/90 text-teal-200 px-1.5 py-0.5 rounded border border-teal-700">
                {activeSecurityGroup.shortCode}
              </span>
              <span className="hidden md:inline text-[11px] font-semibold">{activeSecurityGroup.nameAr.split(' ')[0]}</span>
            </button>

            {/* Current Staff User Card / Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-right transition-colors cursor-pointer"
              >
                <img
                  src={currentStaff.avatar}
                  alt={currentStaff.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-teal-400"
                />
                <div className="hidden xl:block text-right leading-tight">
                  <div className="text-xs font-bold text-slate-100 max-w-[120px] truncate">
                    {currentStaff.name}
                  </div>
                  <div className="text-[10px] text-teal-400">
                    {currentStaff.title.split('-')[0]}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute left-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in">
                  <div className="px-3.5 py-2.5 border-b border-slate-700/60 bg-slate-900/40">
                    <div className="text-xs font-bold text-white">{currentStaff.name}</div>
                    <div className="text-[11px] text-teal-300">{currentStaff.title}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                      <span>ترخيص: {currentStaff.licenseNo}</span>
                      <span className="px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                        {activeSecurityGroup.shortCode}
                      </span>
                    </div>
                  </div>

                  {/* Active Persona / Role Switcher for Current User */}
                  <div className="p-3 border-b border-slate-700/60 bg-slate-900/30">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1.5">
                      <span>بصفتي ماذا أعمل الآن؟ (Active Role):</span>
                      <span className="text-[10px] text-teal-400 font-mono">{userAvailableRoles.length} أدوار معينة</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                      اختيار الدور النشط يكيّف شاشات العمل وقوائم المهام، دون منح صلاحيات جديدة خارج الصلاحيات المعينة لحسابك.
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {userAvailableRoles.map(r => {
                        const conf = rolesConfig.find(item => item.role === r) || {
                          role: r,
                          labelAr: r,
                          labelEn: r,
                          icon: <UserCheck className="w-3.5 h-3.5" />
                        };
                        const isActive = currentRole === r;
                        return (
                          <button
                            key={r}
                            onClick={() => {
                              setCurrentRole(r);
                              playChime('success');
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {conf.icon}
                            <span>{conf.labelAr}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Switch Group Action Button */}
                  <div className="p-2 border-b border-slate-700/60">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        setIsSwitchGroupModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-teal-950/60 hover:bg-teal-900 text-teal-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-teal-400" />
                        <span>تبديل مجموعة الصلاحيات (Switch Group)</span>
                      </span>
                      <span className="text-[10px] text-teal-400">8 مجموعات</span>
                    </button>
                  </div>

                  <div className="p-2 max-h-56 overflow-y-auto">
                    <div className="text-[11px] font-bold text-slate-400 px-2 py-1">
                      التبديل إلى مستخدم آخر:
                    </div>
                    {allStaff.map(staff => (
                      <button
                        key={staff.id}
                        onClick={() => {
                          setCurrentStaff(staff);
                          setShowRoleMenu(false);
                          playChime('success');
                        }}
                        className={`w-full text-right px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          staff.id === currentStaff.id
                            ? 'bg-teal-900/60 text-teal-200 font-bold'
                            : 'text-slate-300 hover:bg-slate-700/60'
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <div className="truncate">{staff.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{staff.title}</div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono shrink-0">
                          {staff.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Logout Button */}
                  <div className="p-2 pt-1 border-t border-slate-700/60">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span>تسجيل الخروج والعودة لبوابة الدخول</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Clinical Context / Work Area Switcher ("أين أعمل الآن؟") */}
      <nav className="bg-slate-950/80 border-t border-slate-800/80 px-2 sm:px-6 lg:px-8 py-1.5" aria-label="Clinical Context Switcher">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-0.5 -mx-1 px-1">
          {/* Work Area Label */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold text-slate-400 pl-2 shrink-0 border-l border-slate-800 ml-1" title="محدد بيئة وسياق العمل السريري (أين أعمل الآن؟)">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>سياق العمل السريري (Work Area):</span>
          </div>

          {/* Level 1: My Work / Clinical Home Portal */}
          <button
            onClick={() => {
              setActiveWorkArea('my_work');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea === 'my_work' && !activeWorkspacePatientId
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-300 hover:text-white hover:bg-slate-800 border border-amber-500/30'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>مهامي السريرية (My Work)</span>
            {pendingTasksTotal > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                activeWorkArea === 'my_work' && !activeWorkspacePatientId
                  ? 'bg-amber-800 text-amber-100'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {pendingTasksTotal}
              </span>
            )}
          </button>

          {/* Cross-Role Clinical Utilities Portal (Consults, Handovers, Messages, Notifications) */}
          <button
            onClick={() => {
              setActiveWorkArea('clinical_utilities');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea === 'clinical_utilities' && !activeWorkspacePatientId
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-teal-300 hover:text-white hover:bg-slate-800 border border-teal-500/30'
            }`}
            title="منظومة التنسيق السريري المشترك: استشارات • تسليم • محادثات • تنبيهات"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" />
            <span>التنسيق المشترك (Utilities)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeWorkArea === 'clinical_utilities' && !activeWorkspacePatientId
                ? 'bg-teal-800 text-teal-100'
                : 'bg-teal-950 text-teal-300 border border-teal-800'
            }`}>
              4
            </span>
          </button>

          {/* Patient Access, ADT & Flow Operations Portal */}
          <button
            onClick={() => {
              setActiveWorkArea('patient_access_adt');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea === 'patient_access_adt' && !activeWorkspacePatientId
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-300 hover:text-white hover:bg-slate-800 border border-blue-500/30'
            }`}
            title="إدارة تسجيل وهوية المرضى وتنسيق الأسرّة وتدفق الحالات (ADT & Bed Management)"
          >
            <Bed className="w-3.5 h-3.5 text-blue-400" />
            <span>تسجيل وتدفق المرضى (ADT)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeWorkArea === 'patient_access_adt' && !activeWorkspacePatientId
                ? 'bg-blue-800 text-blue-100'
                : 'bg-blue-950 text-blue-300 border border-blue-800'
            }`}>
              ADT
            </span>
          </button>

          {/* Laboratory, Microbiology & Pathology Operations Portal */}
          <button
            onClick={() => {
              setActiveWorkArea('laboratory_ops');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea === 'laboratory_ops' && !activeWorkspacePatientId
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-teal-300 hover:text-white hover:bg-slate-800 border border-teal-500/30'
            }`}
            title="إدارة المختبرات وبنك الدم والأحياء الدقيقة وعلم الأمراض (LIS / Pathology)"
          >
            <FlaskConical className="w-3.5 h-3.5 text-teal-400" />
            <span>المختبرات والباثولوجي (LIS)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeWorkArea === 'laboratory_ops' && !activeWorkspacePatientId
                ? 'bg-teal-800 text-teal-100'
                : 'bg-teal-950 text-teal-300 border border-teal-800'
            }`}>
              LIS
            </span>
          </button>

          {/* Radiology & Imaging Operations Portal */}
          <button
            onClick={() => {
              setActiveWorkArea('radiology_ops');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea === 'radiology_ops' && !activeWorkspacePatientId
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-teal-300 hover:text-white hover:bg-slate-800 border border-teal-500/30'
            }`}
            title="إدارة عمليات الأشعة والتصوير الطبي وجدولة الموداليتي وقراءة التقارير (RIS / Radiology)"
          >
            <Radio className="w-3.5 h-3.5 text-teal-400" />
            <span>الأشعة والتصوير (Radiology)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeWorkArea === 'radiology_ops' && !activeWorkspacePatientId
                ? 'bg-teal-800 text-teal-100'
                : 'bg-teal-950 text-teal-300 border border-teal-800'
            }`}>
              RIS
            </span>
          </button>

          {/* Pharmacy Operations Portal */}
          <button
            onClick={() => {
              setActiveWorkArea('pharmacy_ops');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea === 'pharmacy_ops' && !activeWorkspacePatientId
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-teal-300 hover:text-white hover:bg-slate-800 border border-teal-500/30'
            }`}
            title="إدارة العمليات الصيدلانية: استقبال الطلبات، التدقيق السريري، التحضير المعقم، والصرف (Pharmacy Ops)"
          >
            <Pill className="w-3.5 h-3.5 text-teal-400" />
            <span>الصيدلية والعمليات (Pharmacy)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeWorkArea === 'pharmacy_ops' && !activeWorkspacePatientId
                ? 'bg-teal-800 text-teal-100'
                : 'bg-teal-950 text-teal-300 border border-teal-800'
            }`}>
              Rx
            </span>
          </button>

          {/* Blood Bank Operations Portal */}
          <button
            onClick={() => {
              setActiveWorkArea('blood_bank_ops');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea === 'blood_bank_ops' && !activeWorkspacePatientId
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-red-300 hover:text-white hover:bg-slate-800 border border-red-500/30'
            }`}
            title="إدارة عمليات بنك الدم وطب نقل الدم: الطلبات، العينات، التوافق، التخصيص، والصرف واليقظة الدموية (Blood Bank Ops)"
          >
            <Droplet className="w-3.5 h-3.5 text-red-400" />
            <span>بنك الدم (Blood Bank)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeWorkArea === 'blood_bank_ops' && !activeWorkspacePatientId
                ? 'bg-red-800 text-red-100'
                : 'bg-red-950 text-red-300 border border-red-800'
            }`}>
              BB
            </span>
          </button>

          {/* Enterprise Supply Chain & Materials Management Portal */}
          <button
            onClick={() => {
              setActiveWorkArea('supply_chain_ops');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea === 'supply_chain_ops' && !activeWorkspacePatientId
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-300 hover:text-white hover:bg-slate-800 border border-amber-500/30'
            }`}
            title="إدارة سلاسل الإمداد والمستودعات الطبية والمخزون العام (Supply Chain & Materials Management)"
          >
            <Boxes className="w-3.5 h-3.5 text-amber-400" />
            <span>الإمداد والمخزون (Supply Chain)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeWorkArea === 'supply_chain_ops' && !activeWorkspacePatientId
                ? 'bg-amber-800 text-amber-100'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              SCM
            </span>
          </button>

          {/* Healthcare Procurement & Purchasing Operations Portal */}
          <button
            onClick={() => {
              setActiveWorkArea('procurement_ops');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea === 'procurement_ops' && !activeWorkspacePatientId
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-300 hover:text-white hover:bg-slate-800 border border-indigo-500/30'
            }`}
            title="إدارة المشتريات والتعاقدات والمنافسات وأوامر الشراء (Procurement & Purchasing)"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-indigo-400" />
            <span>المشتريات والتعاقدات (Procurement)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeWorkArea === 'procurement_ops' && !activeWorkspacePatientId
                ? 'bg-indigo-800 text-indigo-100'
                : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
            }`}>
              PROC
            </span>
          </button>

          {/* Finance & Accounts Payable Operations Portal */}
          <button
            id="nav-finance-ap-ops-button"
            onClick={() => {
              setActiveWorkArea('finance_ap_ops');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea === 'finance_ap_ops' && !activeWorkspacePatientId
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-300 hover:text-white hover:bg-slate-800 border border-emerald-500/30'
            }`}
            title="إدارة الحسابات الدائنة والمالية: فواتير الموردين، المطابقة الثلاثية، مقترحات السداد وأعمار الذمم (Finance & AP)"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>الحسابات الدائنة (Finance AP)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeWorkArea === 'finance_ap_ops' && !activeWorkspacePatientId
                ? 'bg-emerald-800 text-emerald-100'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              AP
            </span>
          </button>

          {/* General Ledger & Chart of Accounts Operations Portal */}
          <button
            id="nav-general-ledger-ops-button"
            onClick={() => {
              setActiveWorkArea('general_ledger_ops');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea === 'general_ledger_ops' && !activeWorkspacePatientId
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-300 hover:text-white hover:bg-slate-800 border border-amber-500/30'
            }`}
            title="دفتر الأستاذ العام، الدليل المحاسبي، ميزان المراجعة وقواعد الأبعاد المالية (General Ledger & COA)"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>الأستاذ العام (General Ledger)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeWorkArea === 'general_ledger_ops' && !activeWorkspacePatientId
                ? 'bg-amber-800 text-amber-100'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              GL
            </span>
          </button>

          {/* Treasury & Cash/Bank Operations Portal */}
          <button
            id="nav-treasury-ops-button"
            onClick={() => {
              setActiveWorkArea('treasury_ops');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea === 'treasury_ops' && !activeWorkspacePatientId
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-300 hover:text-white hover:bg-slate-800 border border-blue-500/30'
            }`}
            title="إدارة الخزينة والعمليات النقدية والبنكية: حسابات البنوك، تراخيص الصرف، أوامر سريع، المطابقة والسيولة (Treasury & Cash Operations)"
          >
            <Landmark className="w-3.5 h-3.5 text-blue-400" />
            <span>الخزينة والعمليات البنكية (Treasury)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeWorkArea === 'treasury_ops' && !activeWorkspacePatientId
                ? 'bg-blue-800 text-blue-100'
                : 'bg-blue-950 text-blue-300 border border-blue-800'
            }`}>
              TR
            </span>
          </button>

          {/* Patient Accounts Receivable & Revenue Cycle Operations Portal */}
          <button
            id="nav-revenue-cycle-ops-button"
            onClick={() => {
              setActiveWorkArea('revenue_cycle_ops');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea === 'revenue_cycle_ops' && !activeWorkspacePatientId
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-teal-300 hover:text-white hover:bg-slate-800 border border-teal-500/30'
            }`}
            title="إدارة دورة الإيرادات والذمم المدينة للمرضى والتأمين ونفيس (Patient AR & Revenue Cycle)"
          >
            <Receipt className="w-3.5 h-3.5 text-teal-400" />
            <span>دورة الإيرادات والذمم (Revenue Cycle)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeWorkArea === 'revenue_cycle_ops' && !activeWorkspacePatientId
                ? 'bg-teal-800 text-teal-100'
                : 'bg-teal-950 text-teal-300 border border-teal-800'
            }`}>
              RC
            </span>
          </button>

          {/* Sterile Processing & CSSD Operations Portal */}
          <button
            id="nav-cssd-ops-button"
            onClick={() => {
              setActiveWorkArea('cssd_ops');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea === 'cssd_ops' && !activeWorkspacePatientId
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-red-300 hover:text-white hover:bg-slate-800 border border-red-500/30'
            }`}
            title="إدارة التعقيم المركزي وتجهيز الأجهزة الطبية الجراحية (CSSD & Sterile Processing)"
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>التعقيم المركزي (CSSD)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeWorkArea === 'cssd_ops' && !activeWorkspacePatientId
                ? 'bg-red-800 text-red-100'
                : 'bg-red-950 text-red-300 border border-red-800'
            }`}>
              CSSD
            </span>
          </button>

          {/* Clinical Engineering & Biomedical Medical Equipment Operations Portal */}
          <button
            id="nav-biomedical-ops-button"
            onClick={() => {
              setActiveWorkArea('biomedical_ops');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea === 'biomedical_ops' && !activeWorkspacePatientId
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-teal-300 hover:text-white hover:bg-slate-800 border border-teal-500/30'
            }`}
            title="إدارة الهندسة الطبية وصيانة الأجهزة والسلامة الكهربائية (Biomedical & Medical Equipment Ops)"
          >
            <HeartPulse className="w-3.5 h-3.5 text-teal-400" />
            <span>الأجهزة الطبية (Biomedical)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeWorkArea === 'biomedical_ops' && !activeWorkspacePatientId
                ? 'bg-teal-800 text-teal-100'
                : 'bg-teal-950 text-teal-300 border border-teal-800'
            }`}>
              BIO
            </span>
          </button>

          {/* Health Information Management (HIM) & Medical Records Operations Portal */}
          <button
            id="nav-him-ops-button"
            onClick={() => {
              setActiveWorkArea('him_ops');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea === 'him_ops' && !activeWorkspacePatientId
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-teal-300 hover:text-white hover:bg-slate-800 border border-teal-500/30'
            }`}
            title="إدارة السجلات الطبية والمعلومات الصحية والترميز (HIM Medical Records & Coding)"
          >
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span>السجلات الطبية (HIM)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeWorkArea === 'him_ops' && !activeWorkspacePatientId
                ? 'bg-teal-800 text-teal-100'
                : 'bg-teal-950 text-teal-300 border border-teal-800'
            }`}>
              HIM
            </span>
          </button>

          {/* Level 3: Active Patient Workspace Pill (If open) */}
          {activeWorkspacePatient && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-900/90 text-teal-100 border border-teal-600 text-xs font-bold shrink-0 animate-in fade-in shadow-xs">
              <UserCheck className="w-3.5 h-3.5 text-teal-300" />
              <span className="truncate max-w-[120px] sm:max-w-[150px]">
                {activeWorkspacePatient.fullNameAr || activeWorkspacePatient.name || 'ملف المريض'}
              </span>
              <span className="font-mono text-[10px] text-teal-300">
                {activeWorkspacePatient.mrn}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closePatientWorkspace();
                }}
                className="p-0.5 mr-1 rounded hover:bg-teal-800 text-teal-300 hover:text-white cursor-pointer"
                title="إغلاق ملف المريض والعودة لشاشة العمل"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

          {/* OPD */}
          <button
            onClick={() => {
              setCurrentDepartment('opd');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea !== 'my_work' && !activeWorkspacePatientId && currentDepartment === 'opd'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>العيادات (OPD)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeWorkArea !== 'my_work' && !activeWorkspacePatientId && currentDepartment === 'opd' ? 'bg-teal-800 text-teal-100' : 'bg-slate-800 text-slate-300'
            }`}>
              {waitingCount + inDoctorCount}
            </span>
          </button>

          {/* ER */}
          <button
            onClick={() => {
              setCurrentDepartment('er');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea !== 'my_work' && !activeWorkspacePatientId && currentDepartment === 'er'
                ? 'bg-red-600 text-white shadow-xs animate-pulse'
                : 'text-slate-300 hover:text-red-300 hover:bg-slate-800'
            }`}
          >
            <Siren className="w-3.5 h-3.5 text-red-400" />
            <span>الطوارئ (ER)</span>
            {activeErCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-red-950 text-red-300 border border-red-800 font-bold">
                {activeErCount}
              </span>
            )}
          </button>

          {/* IPD */}
          <button
            onClick={() => {
              setCurrentDepartment('ipd');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea !== 'my_work' && !activeWorkspacePatientId && currentDepartment === 'ipd'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-800'
            }`}
          >
            <Bed className="w-3.5 h-3.5 text-emerald-400" />
            <span>التنويم (IPD)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
              {occupiedBedsCount}/{wardBeds.length}
            </span>
          </button>

          {/* ICU */}
          <button
            onClick={() => {
              setCurrentDepartment('icu');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea !== 'my_work' && !activeWorkspacePatientId && currentDepartment === 'icu'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>العناية (ICU)</span>
            {activeIcuCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                {activeIcuCount}
              </span>
            )}
          </button>

          {/* OR */}
          <button
            onClick={() => {
              setCurrentDepartment('or');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea !== 'my_work' && !activeWorkspacePatientId && currentDepartment === 'or'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-purple-300 hover:bg-slate-800'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 text-purple-400" />
            <span>العمليات (OR)</span>
            {activeSurgeryCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                {activeSurgeryCount}
              </span>
            )}
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

          {/* Patient Lifecycle */}
          <button
            onClick={() => {
              setCurrentDepartment('lifecycle');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea !== 'my_work' && !activeWorkspacePatientId && currentDepartment === 'lifecycle'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="عرض مسار ودورة المريض السريرية الشاملة بين جميع الأقسام"
          >
            <GitFork className="w-3.5 h-3.5 text-teal-400" />
            <span>مسار المريض</span>
          </button>

          {/* Standards & Interoperability */}
          <button
            onClick={() => {
              setCurrentDepartment('standards');
              closePatientWorkspace();
              playChime('call');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeWorkArea !== 'my_work' && !activeWorkspacePatientId && currentDepartment === 'standards'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="معايير الربط والتوافق الصحي: HL7 FHIR • NPHIES • CBAHI"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>المعايير والربط</span>
          </button>
        </div>
      </nav>

      {/* Row 3: Contextual Toolbar Based on Selected Department / Work Area */}
      <div className="bg-slate-950/60 border-t border-slate-800/80 px-3 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Active Workspace Patient Context Bar */}
          {activeWorkspacePatientId && activeWorkspacePatient && (
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 text-teal-300 font-bold">
                <UserCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>الملف السريري المفتوح: {activeWorkspacePatient.fullNameAr || activeWorkspacePatient.name || 'ملف المريض'}</span>
                <span className="font-mono text-xs text-teal-200 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                  {activeWorkspacePatient.mrn}
                </span>
              </div>
              <button
                onClick={() => closePatientWorkspace()}
                className="self-start sm:self-auto flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
              >
                <span>إغلاق والعودة للوحة السريرية</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* My Work Context Bar */}
          {!activeWorkspacePatientId && activeWorkArea === 'my_work' && (
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
                <span>لوحة مهامي السريرية (My Work) <span className="hidden sm:inline">- قائمة المهام الموجهة والتحويلات السريرية المباشرة</span></span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-slate-400 text-xs">
                <span>المهام المعلقة: <strong className="text-amber-300 font-mono">{pendingTasksTotal}</strong></span>
                <span>•</span>
                <span className="text-teal-300">محدثة تلقائياً مع الملف السريري</span>
              </div>
            </div>
          )}

          {/* OPD Context Bar: Roles + Clinic Selector */}
          {!activeWorkspacePatientId && activeWorkArea !== 'my_work' && currentDepartment === 'opd' && (
            <div className="w-full flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                <span className="text-[11px] font-bold text-slate-400 hidden sm:inline shrink-0">
                  بوابة العيادة:
                </span>
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 shrink-0">
                  {rolesConfig.map(item => {
                    const isActive = currentRole === item.role;
                    return (
                      <button
                        key={item.role}
                        onClick={() => {
                          const matched = allStaff.find(s => s.role === item.role);
                          if (matched) {
                            setCurrentStaff(matched);
                          } else {
                            setCurrentRole(item.role);
                          }
                          playChime('call');
                        }}
                        className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {item.icon}
                        <span>{item.labelAr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Clinic Selector & Stats */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <button
                    onClick={() => setShowClinicMenu(!showClinicMenu)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors cursor-pointer"
                    title="تغيير العيادة النشطة"
                  >
                    <Building2 className="w-3.5 h-3.5 text-teal-400" />
                    <span className="font-semibold">{activeClinic.nameAr}</span>
                    <span className="px-1.5 py-0.2 text-[10px] bg-teal-900/80 text-teal-300 rounded font-mono font-bold">
                      {activeClinic.code} • {activeClinic.roomNo}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showClinicMenu && (
                    <div className="absolute left-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in">
                      <div className="px-3 py-1 text-[11px] font-bold text-slate-400 border-b border-slate-700/60">
                        اختر عيادة التخصص:
                      </div>
                      {clinics.map(clinic => (
                        <button
                          key={clinic.id}
                          onClick={() => {
                            setActiveClinicId(clinic.id);
                            setShowClinicMenu(false);
                            playChime('success');
                          }}
                          className={`w-full text-right px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                            clinic.id === activeClinicId
                              ? 'bg-teal-950/70 text-teal-300 font-bold'
                              : 'text-slate-200 hover:bg-slate-700/70'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{clinic.nameAr}</div>
                            <div className="text-[10px] text-slate-400">{clinic.doctorName} • {clinic.roomNo}</div>
                          </div>
                          <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-teal-400 font-mono">
                            {clinic.currentToken || 'شاغر'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden lg:flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>بالصالة: <strong className="text-teal-300 font-mono">{waitingCount}</strong></span>
                  <span>•</span>
                  <span>بالكشف: <strong className="text-emerald-300 font-mono">{inDoctorCount}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* ER Context Bar */}
          {!activeWorkspacePatientId && activeWorkArea !== 'my_work' && currentDepartment === 'er' && (
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 text-red-300 font-bold">
                <Siren className="w-4 h-4 text-red-400 animate-pulse shrink-0" />
                <span>قسم الطوارئ والحوادث (ER) <span className="hidden sm:inline">- جاهزية على مدار 24 ساعة لاستقبال الحالات الحرجة</span></span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-slate-400 text-xs">
                <span>إجمالي الحالات: <strong className="text-white font-mono">{activeErCount}</strong></span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                  بروتوكول CTAS نشط
                </span>
              </div>
            </div>
          )}

          {/* IPD Context Bar */}
          {!activeWorkspacePatientId && activeWorkArea !== 'my_work' && currentDepartment === 'ipd' && (
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <Bed className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>أجنحة التنويم الداخلي (IPD) <span className="hidden sm:inline">- متابعة الخطط العلاجية والتغذية السريرية</span></span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-slate-400 text-xs">
                <span>إشغال الأسرة: <strong className="text-white font-mono">{occupiedBedsCount} من {wardBeds.length}</strong></span>
                <span>•</span>
                <span className="text-teal-400">سجل eMAR متزامن</span>
              </div>
            </div>
          )}

          {/* ICU Context Bar */}
          {!activeWorkspacePatientId && activeWorkArea !== 'my_work' && currentDepartment === 'icu' && (
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>العناية المركزة (ICU) <span className="hidden sm:inline">- رعاية الحالات الحرجة ومراقبة العلامات الحيوية</span></span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-slate-400 text-xs">
                <span>حالات حرجة: <strong className="text-white font-mono">{activeIcuCount}</strong></span>
                <span>•</span>
                <span className="text-cyan-300">مؤشرات SOFA & APACHE II</span>
              </div>
            </div>
          )}

          {/* OR Context Bar */}
          {!activeWorkspacePatientId && activeWorkArea !== 'my_work' && currentDepartment === 'or' && (
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 text-purple-300 font-bold">
                <Scissors className="w-4 h-4 text-purple-400 shrink-0" />
                <span>غرف العمليات الجراحية (OR) <span className="hidden sm:inline">- قائمة التحقق لمنظمة الصحة WHO</span></span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-slate-400 text-xs">
                <span>عمليات جارية: <strong className="text-white font-mono">{activeSurgeryCount}</strong></span>
                <span>•</span>
                <span className="text-purple-300">Aldrete Score نشط</span>
              </div>
            </div>
          )}

          {/* Lifecycle Context Bar */}
          {!activeWorkspacePatientId && activeWorkArea !== 'my_work' && currentDepartment === 'lifecycle' && (
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 text-teal-300 font-bold">
                <GitFork className="w-4 h-4 text-teal-400 shrink-0" />
                <span>مسار ودورة المريض السريرية المتكاملة (Patient Lifecycle)</span>
              </div>
              <div className="text-xs text-slate-400">
                سايكل شاملة تربط الاستقبال، الطوارئ، التنويم، العمليات، والعناية
              </div>
            </div>
          )}

          {/* Standards Context Bar */}
          {!activeWorkspacePatientId && activeWorkArea !== 'my_work' && currentDepartment === 'standards' && (
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>معايير التوافق والربط الرقمي الصحي (FHIR R4 • NPHIES • CBAHI)</span>
              </div>
              <div className="text-xs text-slate-400">
                حزم سريرية رقمية وموافقات تأمينية معتمدة
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
