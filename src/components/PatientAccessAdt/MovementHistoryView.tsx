import React, { useState } from 'react';
import {
  History,
  ArrowRightLeft,
  UserCheck,
  Bed,
  LogOut,
  PlaneTakeoff,
  UserPlus,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { PatientMovementEvent } from '../../types/patientAccessAdt';

interface MovementHistoryViewProps {
  events: PatientMovementEvent[];
  onOpenPatientWorkspace: (mrn: string, encounterId?: string) => void;
}

export const MovementHistoryView: React.FC<MovementHistoryViewProps> = ({
  events,
  onOpenPatientWorkspace
}) => {
  const [searchMrn, setSearchMrn] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = events.filter(ev => {
    if (filterType !== 'all' && ev.eventType !== filterType) return false;
    if (!searchMrn.trim()) return true;
    const q = searchMrn.toLowerCase().trim();
    return ev.mrn.toLowerCase().includes(q) || ev.patientNameAr.includes(q) || ev.actorName.includes(q);
  });

  const getEventIcon = (type: PatientMovementEvent['eventType']) => {
    switch (type) {
      case 'registration':
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'arrival':
        return <UserCheck className="w-4 h-4 text-amber-600" />;
      case 'check_in':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'admission_request':
        return <Clock className="w-4 h-4 text-purple-600" />;
      case 'admission':
      case 'bed_assignment':
        return <Bed className="w-4 h-4 text-blue-700" />;
      case 'internal_transfer':
        return <ArrowRightLeft className="w-4 h-4 text-indigo-600" />;
      case 'temporary_leave_start':
      case 'temporary_leave_return':
        return <PlaneTakeoff className="w-4 h-4 text-amber-700" />;
      case 'actual_discharge':
      case 'physical_departure':
        return <LogOut className="w-4 h-4 text-emerald-700" />;
      default:
        return <History className="w-4 h-4 text-slate-600" />;
    }
  };

  const getEventLabel = (type: PatientMovementEvent['eventType']) => {
    switch (type) {
      case 'registration':
        return 'تسجيل وفتح ملف (Registration)';
      case 'arrival':
        return 'تسجيل وصول للعيادة (Arrival)';
      case 'check_in':
        return 'تسجيل دخول وفتح زيارة (Check-in)';
      case 'admission_request':
        return 'إرسال طلب تنويم (Admission Request)';
      case 'admission':
        return 'تنويم بالقسم وسرير معتمد (Admission)';
      case 'bed_assignment':
        return 'تخصيص سرير (Bed Assignment)';
      case 'internal_transfer':
        return 'نقل داخلي بين الأقسام (Internal Transfer)';
      case 'temporary_leave_start':
        return 'بدء مغادرة مؤقتة للمنوم (Pass)';
      case 'temporary_leave_return':
        return 'عودة المريض من المغادرة المؤقتة';
      case 'actual_discharge':
        return 'إتمام الخروج السريري بالنظام (Discharge)';
      case 'physical_departure':
        return 'مغادرة فيزيائية وإخلاء السرير (Departure)';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Conceptual Invariant */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 border border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>الفصل العملياتي: سجل مسار الحركة (Movement History) ≠ سجل الرقابة الأمني التقني (Audit Log)</span>
          </div>
          <h2 className="text-xl font-black text-white">سجل مسار الحركة السريرية واللوجستية للمريض (Patient Movement Trail)</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            <strong>سجل الحركة (Movement History):</strong> يوثق المسار اللوجستي والسريري لتنقلات المريض بين المواقع والغرف والأسرة خلال زياراته.<br />
            <strong>سجل الرقابة التقني (Audit Log):</strong> سجل أمني رقابي على مستوى النظام لتتبع الصلاحيات والعناوين التقنية والتعديلات، وهو منفصل عن هذا العرض التشغيلي.
          </p>
        </div>

        <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/10 shrink-0">
          <span className="text-[11px] text-slate-300 block">إجمالي حركات المسار</span>
          <strong className="text-2xl font-black text-white">{events.length}</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchMrn}
            onChange={e => setSearchMrn(e.target.value)}
            placeholder="ابحث بالاسم، رقم الملف MRN أو اسم الموظف..."
            className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">كافة أنواع الأحداث</option>
            <option value="registration">تسجيل المريض</option>
            <option value="arrival">تسجيل الوصول</option>
            <option value="check_in">تسجيل الدخول</option>
            <option value="admission">التنويم</option>
            <option value="internal_transfer">النقل الداخلي</option>
            <option value="temporary_leave_start">الإجازة المؤقتة</option>
            <option value="actual_discharge">الخروج</option>
          </select>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="relative border-r-2 border-slate-200 space-y-6 pr-6 mr-3">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="relative group">
              {/* Dot */}
              <div className="absolute -right-[33px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-sm">
                {getEventIcon(ev.eventType)}
              </div>

              {/* Card */}
              <div className="bg-slate-50 hover:bg-blue-50/30 border border-slate-200 rounded-2xl p-4 transition-all space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-xs text-slate-900">{getEventLabel(ev.eventType)}</span>
                    <span className="text-xs font-black text-slate-800">{ev.patientNameAr}</span>
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                      {ev.mrn}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.timestamp}</span>
                  </div>
                </div>

                {/* Locations if transfer or admission */}
                {(ev.fromLocation || ev.toLocation) && (
                  <div className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-200">
                    {ev.fromLocation && (
                      <span>من: <strong className="text-slate-900">{ev.fromLocation}</strong></span>
                    )}
                    {ev.fromLocation && ev.toLocation && <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180" />}
                    {ev.toLocation && (
                      <span>إلى: <strong className="text-blue-900 font-bold">{ev.toLocation}</strong></span>
                    )}
                  </div>
                )}

                {/* Reason & Notes */}
                {(ev.reason || ev.note) && (
                  <p className="text-xs text-slate-600 font-medium">
                    {ev.reason ? `السبب: ${ev.reason}` : ev.note}
                  </p>
                )}

                {/* Actor */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>
                    المنفذ: <strong className="text-slate-700">{ev.actorName}</strong> ({ev.actorRole})
                  </span>
                  <button
                    onClick={() => onOpenPatientWorkspace(ev.mrn, ev.encounterId)}
                    className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                  >
                    عرض الملف السريري
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
