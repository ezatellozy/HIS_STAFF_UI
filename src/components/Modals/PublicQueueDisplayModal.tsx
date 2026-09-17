import React, { useEffect } from 'react';
import { X, Tv, Volume2, BellRing, Activity, Clock, Building2, Radio, Siren } from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { announcePatientCallSpeech } from '../../utils/audioAnnouncement';
import { EdinaLogo } from '../common/EdinaLogo';

export const PublicQueueDisplayModal: React.FC = () => {
  const {
    isPublicQueueModalOpen,
    setIsPublicQueueModalOpen,
    clinics,
    appointments,
    patients,
    playChime,
    voiceAnnouncementEnabled,
    setVoiceAnnouncementEnabled,
    isSpeakingAnnouncement,
    triggerEmergencyCode
  } = useHis();

  if (!isPublicQueueModalOpen) return null;

  // Currently being called or with doctor
  const activeCallingAppointments = appointments
    .filter(a => a.status === 'with_doctor' || a.calledAt)
    .slice(-4);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col p-4 sm:p-8 overflow-y-auto font-sans animate-in fade-in">
      {/* Top TV Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <EdinaLogo size="lg" theme="dark" />
          <div className="border-r border-slate-700 pr-4">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <span>شاشة نداء المرضى بصالات الانتظار</span>
              <span className="text-xs font-mono uppercase bg-teal-900/60 border border-teal-600/50 text-teal-300 px-3 py-1 rounded-full">
                LIVE OPD QUEUE
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              مستشفيات إدينا التخصصية — الدور الأرضي والأول والثاني (Edina Specialized Hospitals)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Voice Announcement Toggle */}
          <button
            onClick={() => setVoiceAnnouncementEnabled(!voiceAnnouncementEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              voiceAnnouncementEnabled
                ? 'bg-teal-950/80 text-teal-300 border-teal-700/80'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="تفعيل أو تعطيل نطق كود التذكرة وكود الطوارئ صوتياً"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>نطق الكود صوتياً: {voiceAnnouncementEnabled ? 'مفعل 🔊' : 'معطل'}</span>
          </button>

          {/* Test Ticket Call */}
          <button
            onClick={() => {
              announcePatientCallSpeech({
                ticketNo: 'A-102',
                patientName: 'محمد أحمد السعيد',
                clinicName: 'عيادة الباطنية العامة',
                roomNo: 'غرفة 101'
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs border border-slate-700 transition-colors cursor-pointer"
            title="تجربة نطق كود التذكرة صوتياً"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>تجربة نداء التذكرة</span>
          </button>

          {/* Test Emergency Alert Call */}
          <button
            onClick={() => {
              triggerEmergencyCode('CODE_BLUE');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900/80 text-red-300 text-xs border border-red-800/80 transition-colors cursor-pointer"
            title="تجربة إذاعة ونطق كود الطوارئ الأزرق"
          >
            <Siren className="w-3.5 h-3.5 text-red-400 animate-bounce" />
            <span>تجربة كود الطوارئ (Code Blue)</span>
          </button>

          <button
            onClick={() => setIsPublicQueueModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="إغلاق الشاشة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Calling Spotlight (Hero Banner) */}
      <div className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3 flex items-center gap-2">
          <BellRing className="w-4 h-4 text-teal-400 animate-bounce" />
          النداء الحالي للمرضى المتوجهين لغرف الكشف (Now Calling to Consultation Rooms)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCallingAppointments.length > 0 ? (
            activeCallingAppointments.map(apt => {
              const patient = patients.find(p => p.id === apt.patientId);
              const clinic = clinics.find(c => c.id === apt.clinicId);
              return (
                <div
                  key={apt.id}
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-teal-500/80 shadow-[0_0_25px_rgba(20,184,166,0.15)] relative overflow-hidden"
                >
                  <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl" />

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {clinic?.nameAr || 'العيادة التخصصية'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{apt.calledAt || 'الآن'}</span>
                  </div>

                  {/* Big Ticket Number */}
                  <div className="text-4xl sm:text-5xl font-black font-mono tracking-wider text-teal-400 my-2">
                    {apt.ticketNo}
                  </div>

                  <div className="text-sm font-bold text-white mb-2">
                    المريض: {patient?.fullNameAr || 'مريض مجهول'}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">توجه إلى:</span>
                      <strong className="text-amber-400 font-bold bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/60">
                        {clinic?.roomNo || 'غرفة الكشف'}
                      </strong>
                    </div>

                    <button
                      onClick={() => {
                        announcePatientCallSpeech({
                          ticketNo: apt.ticketNo,
                          patientName: patient?.fullNameAr,
                          clinicName: clinic?.nameAr,
                          roomNo: clinic?.roomNo
                        });
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-800/80 font-medium transition-colors cursor-pointer"
                      title="إعادة نداء هذه التذكرة صوتياً عبر السماعات"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>نداء صوتي</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
              لا توجد نداءات نشطة في هذه اللحظة، يرجى متابعة الشاشة وانتظار رقم تذكرتك
            </div>
          )}
        </div>
      </div>

      {/* Overview Table of all OPD Clinics & Current Status */}
      <div className="flex-1">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          حالة جميع عيادات المستشفى (OPD Clinics Status Board)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clinics.map(clinic => (
            <div
              key={clinic.id}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="font-bold text-white text-sm">{clinic.nameAr}</div>
                <div className="text-xs text-slate-400">{clinic.doctorName}</div>
                <div className="text-[11px] text-teal-400 font-mono mt-0.5">{clinic.roomNo}</div>
              </div>

              <div className="text-left">
                <span className="text-[10px] text-slate-500 block">الرقم الحالي:</span>
                <span className="text-xl font-black font-mono text-teal-400">
                  {clinic.currentToken || '--'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  في الانتظار: {clinic.totalWaiting}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Ticker */}
      <div className="mt-8 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-400" />
          <span>يرجى التوجه لغرفة الكشف المحددة فور ظهور رقم التذكرة وسماع النداء الصوتي.</span>
        </div>
        <div className="text-slate-500 font-mono">
          EDINA HIS V4.8 • SECURE & ACCREDITED
        </div>
      </div>
    </div>
  );
};
