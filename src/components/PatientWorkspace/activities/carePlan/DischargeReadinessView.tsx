import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Calendar,
  Building2,
  FileCheck,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Plus
} from 'lucide-react';
import { Patient } from '../../../../types/his';
import {
  DischargeReadinessCheckItem,
  FollowUpPlanItem,
  DischargeReadinessDomain
} from '../../../../types/clinicalCarePlanJourney';

interface DischargeReadinessViewProps {
  patient: Patient;
  checklist: DischargeReadinessCheckItem[];
  onToggleItem: (id: string) => void;
  followUpPlans: FollowUpPlanItem[];
  onAddFollowUp: (item: FollowUpPlanItem) => void;
}

export const DischargeReadinessView: React.FC<DischargeReadinessViewProps> = ({
  patient,
  checklist,
  onToggleItem,
  followUpPlans,
  onAddFollowUp
}) => {
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [specialty, setSpecialty] = useState('عيادة أمراض القلب التخصصية (Cardiology Outpatient)');
  const [timeframe, setTimeframe] = useState('بعد أسبوع واحد من الخروج');
  const [reason, setReason] = useState('متابعة استقرار وظائف القلب وتعديل جرعات حاصرات بيتا ومثبطات ACE');
  const [prereq, setPrereq] = useState('تحليل دم وظائف كلى وشوارد (BUN, Cr, K+) قبل الموعد بـ 48 ساعة');

  const readyCount = checklist.filter(c => c.status === 'ready').length;
  const criticalPending = checklist.filter(c => c.criticalForDischarge && c.status !== 'ready');
  const readinessPercent = Math.round((readyCount / checklist.length) * 100);

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    onAddFollowUp({
      id: `fup-${Date.now()}`,
      specialtyOrClinic: specialty,
      recommendedTimeframe: timeframe,
      reasonAr: reason,
      prerequisites: prereq ? [prereq] : undefined,
      status: 'communicated_to_patient'
    });
    setShowAddFollowUp(false);
  };

  const getDomainBadge = (d: DischargeReadinessDomain) => {
    switch (d) {
      case 'clinical_stability':
        return { label: 'الاستقرار السريري', color: 'bg-blue-100 text-blue-900' };
      case 'medication_reconciliation':
        return { label: 'المطابقة الدوائية', color: 'bg-purple-100 text-purple-900' };
      case 'patient_education':
        return { label: 'تثقيف الخروج', color: 'bg-teal-100 text-teal-900' };
      case 'follow_up_appointments':
        return { label: 'مواعيد المتابعة', color: 'bg-amber-100 text-amber-900' };
      case 'home_equipment_supplies':
        return { label: 'أجهزة ومعدات المنزل', color: 'bg-indigo-100 text-indigo-900' };
      case 'functional_mobility':
        return { label: 'الحركة والقدرة الوظيفية', color: 'bg-emerald-100 text-emerald-900' };
      case 'pending_results_orders':
        return { label: 'النتائج والفحوصات المعلقة', color: 'bg-rose-100 text-rose-900' };
      default:
        return { label: 'الدعم والرعاية', color: 'bg-slate-100 text-slate-800' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Readiness Executive Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <h4 className="font-extrabold text-sm text-slate-900">
                مؤشر جاهزية الخروج السريري المتعدد (Configured Discharge Readiness Profile)
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              مصفوفة تقييم متعددة التخصصات تضمن الانتقال الآمن ومنع إعادة التنويم غير المخططة
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-bold">نسبة اكتمال المعايير:</span>
              <strong className="text-sm font-mono text-teal-800">{readyCount} من {checklist.length} مكتمل ({readinessPercent}%)</strong>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center font-bold text-xs font-mono text-teal-700 relative">
              <span>{readinessPercent}%</span>
            </div>
          </div>
        </div>

        {/* Critical Safety Notice */}
        {criticalPending.length > 0 ? (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-950 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="font-bold">معايير حرجة إلزامية ما زالت معلقة قبل اعتماد الخروج ({criticalPending.length}):</strong>
              <p className="text-[11px] text-amber-900 mt-0.5">
                {criticalPending.map(c => c.labelAr).join(' • ')}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-950 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>كافة المعايير الحرجة للخروج الطبي مستوفاة وجاهزة للاعتماد الطبي النهائي.</span>
          </div>
        )}
      </div>

      {/* Checklist & Follow-up 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Checklist Domains */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h5 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <span>معايير فحص الجاهزية (Domain Readiness Checklist):</span>
            </h5>
            <span className="text-[11px] text-slate-400 font-mono">انقر للتبديل والتأكيد</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {checklist.map(item => {
              const domainInfo = getDomainBadge(item.domain);
              const isReady = item.status === 'ready';

              return (
                <div
                  key={item.id}
                  onClick={() => onToggleItem(item.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isReady
                      ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50/70'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={isReady}
                      onChange={() => {}}
                      className="w-4 h-4 text-teal-600 rounded mt-0.5 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isReady ? 'text-slate-900' : 'text-slate-700'}`}>
                          {item.labelAr}
                        </span>
                        {item.criticalForDischarge && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[9px] font-bold">
                            إلزامي
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.notes}</p>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>المسؤول: {item.responsibleDiscipline}</span>
                        {item.completedBy && <span>• أنجز بواسطة: {item.completedBy}</span>}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${domainInfo.color}`}>
                    {domainInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Post-Discharge Follow-Up Care Planning */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h5 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>خطة المتابعة بعد الخروج (Follow-up Care Plan):</span>
            </h5>
            <button
              onClick={() => setShowAddFollowUp(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold text-[11px] hover:bg-teal-100 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة موعد متابعة</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {followUpPlans.map(plan => (
              <div
                key={plan.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{plan.specialtyOrClinic}</span>
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-bold">
                    {plan.recommendedTimeframe}
                  </span>
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed">
                  <strong>السبب السريري:</strong> {plan.reasonAr}
                </p>

                {plan.prerequisites && plan.prerequisites.length > 0 && (
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-[10px] text-amber-900 space-y-0.5">
                    <strong>متطلبات قبل الموعد:</strong>
                    {plan.prerequisites.map((req, i) => (
                      <div key={i}>• {req}</div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                  <span>حالة التنسيق: تم إبلاغ المريض وتضمينه في تقرير الخروج</span>
                  <span className="text-emerald-700 font-bold">✓ مخطط</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Follow-Up Mini Form Modal/Drawer */}
          {showAddFollowUp && (
            <form onSubmit={handleCreateFollowUp} className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <strong className="font-bold text-teal-950">إضافة خطة متابعة بعد الخروج</strong>
                <button
                  type="button"
                  onClick={() => setShowAddFollowUp(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  إلغاء
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">العيادة أو الخدمة المتابعة:</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الإطار الزمني المقترح:</label>
                  <input
                    type="text"
                    value={timeframe}
                    onChange={e => setTimeframe(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">متطلبات مسبقة (فحوصات):</label>
                  <input
                    type="text"
                    value={prereq}
                    onChange={e => setPrereq(e.target.value)}
                    placeholder="مثال: تحليل دم أو أشعة..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">سبب المتابعة السريري:</label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-teal-700 text-white font-bold rounded-lg hover:bg-teal-800 transition-colors"
              >
                حفظ وإضافة للمخطط
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
